"""
Call Endpoints
"""
from fastapi import APIRouter, Header, Depends
from starlette.requests import Request
from typing import Optional
from datetime import datetime
import uuid
import json

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.exceptions import NotFoundError, ForbiddenError, PaymentRequiredError, ValidationError
from app.core.idempotency import check_idempotency_key, store_idempotency_response
from app.core.events import emit_call_created
from app.services.ultravox import ultravox_client
from app.models.schemas import (
    CallCreate,
    CallResponse,
    TranscriptResponse,
    RecordingResponse,
    ResponseMeta,
)

router = APIRouter()


@router.post("")
async def create_call(
    call_data: CallCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
):
    """Create call"""
    # Check idempotency key
    body_dict = call_data.dict() if hasattr(call_data, 'dict') else json.loads(json.dumps(call_data, default=str))
    if idempotency_key:
        cached = await check_idempotency_key(
            current_user["client_id"],
            idempotency_key,
            request,
            body_dict,
        )
        if cached:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                content=cached["response_body"],
                status_code=cached["status_code"],
            )
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Validate agent
    agent = db.get_agent(call_data.agent_id, current_user["client_id"])
    if not agent:
        raise NotFoundError("agent", call_data.agent_id)
    if agent.get("status") != "active":
        raise ValidationError("Agent must be active", {"agent_status": agent.get("status")})
    
    # Credit check for outbound calls
    if call_data.direction == "outbound":
        client = db.get_client(current_user["client_id"])
        if not client or client.get("credits_balance", 0) < 1:
            raise PaymentRequiredError(
                "Insufficient credits for outbound call",
                {"required": 1, "available": client.get("credits_balance", 0) if client else 0},
            )
    
    # Create call record
    call_id = str(uuid.uuid4())
    call_record = {
        "id": call_id,
        "client_id": current_user["client_id"],
        "agent_id": call_data.agent_id,
        "phone_number": call_data.phone_number,
        "direction": call_data.direction.value,
        "status": "queued",
        "context": call_data.context or {},
        "call_settings": call_data.call_settings.dict() if call_data.call_settings else {},
    }
    
    db.insert("calls", call_record)
    
    # Call Ultravox API
    try:
        ultravox_data = {
            "agent_id": agent.get("ultravox_agent_id"),
            "phone_number": call_data.phone_number,
            "direction": call_data.direction.value,
            "call_settings": call_data.call_settings.dict() if call_data.call_settings else {},
            "context": call_data.context or {},
        }
        ultravox_response = await ultravox_client.create_call(ultravox_data)
        
        # Update with Ultravox ID
        db.update(
            "calls",
            {"id": call_id},
            {"ultravox_call_id": ultravox_response.get("id")},
        )
        call_record["ultravox_call_id"] = ultravox_response.get("id")
        
    except Exception as e:
        db.update(
            "calls",
            {"id": call_id},
            {"status": "failed"},
        )
        raise
    
    # Emit EventBridge event
    await emit_call_created(
        call_id=call_id,
        client_id=current_user["client_id"],
        agent_id=call_data.agent_id,
        ultravox_call_id=call_record["ultravox_call_id"],
        phone_number=call_data.phone_number,
        direction=call_data.direction.value,
    )
    
    response_data = {
        "data": CallResponse(**call_record),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }
    
    # Store idempotency response
    if idempotency_key:
        await store_idempotency_response(
            current_user["client_id"],
            idempotency_key,
            request,
            body_dict,
            response_data,
            201,
        )
    
    return response_data


@router.get("")
async def list_calls(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    direction: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    """List calls with filtering and pagination"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Build filters
    filters = {"client_id": current_user["client_id"]}
    if agent_id:
        filters["agent_id"] = agent_id
    if status:
        filters["status"] = status
    if direction:
        filters["direction"] = direction
    
    # Get calls with pagination
    # Note: Supabase PostgREST supports limit/offset via query params
    all_calls = db.select("calls", filters, order_by="created_at")
    
    # Apply pagination manually (since db.select doesn't support limit/offset directly)
    total = len(all_calls)
    paginated_calls = all_calls[offset:offset + limit]
    
    return {
        "data": [CallResponse(**call) for call in paginated_calls],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
        "pagination": {
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < total,
        },
    }


@router.get("/{call_id}")
async def get_call(
    call_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
    refresh: bool = False,
):
    """Get call with optional status refresh from Ultravox"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    call = db.get_call(call_id, current_user["client_id"])
    if not call:
        raise NotFoundError("call", call_id)
    
    # Optionally refresh from Ultravox if status is active and refresh flag is set
    if refresh and call.get("ultravox_call_id") and call.get("status") in ["queued", "ringing", "in_progress"]:
        try:
            ultravox_call = await ultravox_client.get_call(call["ultravox_call_id"])
            
            # Update local database with latest status
            update_data = {}
            if ultravox_call.get("status"):
                update_data["status"] = ultravox_call["status"]
            if ultravox_call.get("started_at"):
                update_data["started_at"] = ultravox_call["started_at"]
            if ultravox_call.get("ended_at"):
                update_data["ended_at"] = ultravox_call["ended_at"]
            if ultravox_call.get("duration_seconds") is not None:
                update_data["duration_seconds"] = ultravox_call["duration_seconds"]
            if ultravox_call.get("cost_usd") is not None:
                update_data["cost_usd"] = ultravox_call["cost_usd"]
            
            if update_data:
                db.update("calls", {"id": call_id}, update_data)
                # Refresh call data
                call = db.get_call(call_id, current_user["client_id"])
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to refresh call status from Ultravox: {e}")
    
    return {
        "data": CallResponse(**call),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("/{call_id}/transcript")
async def get_call_transcript(
    call_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get call transcript"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    call = db.get_call(call_id, current_user["client_id"])
    if not call:
        raise NotFoundError("call", call_id)
    
    # Check cache
    if call.get("transcript"):
        transcript_data = call["transcript"]
    else:
        # Fetch from Ultravox
        if not call.get("ultravox_call_id"):
            raise NotFoundError("transcript")
        
        try:
            transcript_data = await ultravox_client.get_call_transcript(call["ultravox_call_id"])
            # Update cache
            db.update("calls", {"id": call_id}, {"transcript": transcript_data})
        except Exception as e:
            raise NotFoundError("transcript")
    
    return {
        "data": TranscriptResponse(
            call_id=call_id,
            transcript=transcript_data.get("transcript", []),
            summary=transcript_data.get("summary"),
        ),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("/{call_id}/recording")
async def get_call_recording(
    call_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get call recording URL"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    call = db.get_call(call_id, current_user["client_id"])
    if not call:
        raise NotFoundError("call", call_id)
    
    # Check if recording URL exists
    if call.get("recording_url"):
        recording_url = call["recording_url"]
    else:
        # Fetch from Ultravox
        if not call.get("ultravox_call_id"):
            raise NotFoundError("recording")
        
        try:
            recording_url = await ultravox_client.get_call_recording(call["ultravox_call_id"])
            # TODO: Download to S3 and update database
            db.update("calls", {"id": call_id}, {"recording_url": recording_url})
        except Exception as e:
            raise NotFoundError("recording")
    
    return {
        "data": RecordingResponse(
            call_id=call_id,
            recording_url=recording_url,
            format="mp3",
            duration_seconds=call.get("duration_seconds"),
        ),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

