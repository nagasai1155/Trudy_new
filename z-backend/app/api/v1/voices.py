"""
Voice Endpoints
"""
from fastapi import APIRouter, Header, Depends
from starlette.requests import Request
from typing import Optional
from datetime import datetime
import uuid
import json
import logging

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.s3 import generate_presigned_url, check_object_exists
from app.core.exceptions import NotFoundError, ValidationError, PaymentRequiredError, ForbiddenError
from app.core.idempotency import check_idempotency_key, store_idempotency_response
from app.core.events import emit_voice_training_started, emit_voice_created
from app.services.ultravox import ultravox_client
from app.models.schemas import (
    VoiceCreate,
    VoiceResponse,
    VoicePresignRequest,
    PresignResponse,
    ResponseMeta,
)
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/files/presign")
async def presign_voice_files(
    request_data: VoicePresignRequest,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get presigned URLs for voice sample uploads"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    # Generate presigned URLs
    uploads = []
    for i, file in enumerate(request_data.files):
        doc_id = str(uuid.uuid4())
        s3_key = f"uploads/client_{current_user['client_id']}/voices/{doc_id}/sample_{i}.{file.filename.split('.')[-1]}"
        
        url = generate_presigned_url(
            bucket=settings.S3_BUCKET_UPLOADS,
            key=s3_key,
            operation="put_object",
            expires_in=3600,
            content_type=file.content_type,
        )
        
        uploads.append({
            "doc_id": doc_id,
            "s3_key": s3_key,
            "url": url,
            "headers": {"Content-Type": file.content_type},
        })
    
    return {
        "data": {"uploads": uploads},
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("")
async def create_voice(
    voice_data: VoiceCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
):
    """Create voice (native clone or external reference)"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    # Check idempotency key
    body_dict = voice_data.dict() if hasattr(voice_data, 'dict') else json.loads(json.dumps(voice_data, default=str))
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
    
    # Credit check for native training
    client = None
    if voice_data.strategy == "native":
        client = db.get_client(current_user["client_id"])
        if not client or client.get("credits_balance", 0) < 50:
            raise PaymentRequiredError(
                "Insufficient credits for voice training. Required: 50",
                {"required": 50, "available": client.get("credits_balance", 0) if client else 0},
            )
    
    # Create voice record
    voice_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    # Prepare voice record for database (use ISO strings for storage)
    voice_db_record = {
        "id": voice_id,
        "client_id": current_user["client_id"],
        "name": voice_data.name,
        "provider": voice_data.provider_overrides.get("provider", "elevenlabs") if voice_data.provider_overrides else "elevenlabs",
        "type": "custom" if voice_data.strategy == "native" else "reference",
        "language": "en-US",
        "status": "training" if voice_data.strategy == "native" else "active",
        "training_info": {
            "progress": 0,
            "started_at": now.isoformat(),
        } if voice_data.strategy == "native" else {},
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    # Store provider_voice_id for external voices (ElevenLabs voice ID)
    if voice_data.strategy != "native" and voice_data.source.provider_voice_id:
        voice_db_record["provider_voice_id"] = voice_data.source.provider_voice_id
    
    db.insert("voices", voice_db_record)
    
    # Prepare voice record for response (use datetime objects for Pydantic)
    voice_record = voice_db_record.copy()
    voice_record["created_at"] = now
    voice_record["updated_at"] = now
    
    # Generate presigned URLs for Ultravox
    training_samples = []
    if voice_data.strategy == "native" and voice_data.source.samples:
        for sample in voice_data.source.samples:
            # Check S3 file exists
            if not check_object_exists(settings.S3_BUCKET_UPLOADS, sample.s3_key):
                raise NotFoundError("voice sample", sample.s3_key)
            
            # Generate read-only presigned URL
            audio_url = generate_presigned_url(
                bucket=settings.S3_BUCKET_UPLOADS,
                key=sample.s3_key,
                operation="get_object",
                expires_in=86400,
            )
            
            training_samples.append({
                "text": sample.text,
                "audio_url": audio_url,
                "duration_seconds": sample.duration_seconds,
            })
    
    # Call Ultravox API (optional for external voices, required for native)
    ultravox_voice_id = None
    if voice_data.strategy == "native":
        # Native voices MUST be created in Ultravox
        try:
            ultravox_data = {
                "name": voice_data.name,
                "provider": voice_record["provider"],
                "type": "custom",
                "language": "en-US",
                "training_samples": training_samples,
            }
            ultravox_response = await ultravox_client.create_voice(ultravox_data)
            if ultravox_response and ultravox_response.get("id"):
                ultravox_voice_id = ultravox_response.get("id")
            else:
                raise ValueError("Ultravox response missing voice ID")
        except Exception as e:
            logger.error(f"Failed to create native voice in Ultravox: {e}", exc_info=True)
            db.update(
                "voices",
                {"id": voice_id},
                {"status": "failed", "training_info": {"error_message": str(e)}},
            )
            from app.core.exceptions import ProviderError, ValidationError
            if isinstance(e, ProviderError):
                raise
            error_msg = str(e)
            if not settings.ULTRAVOX_API_KEY:
                raise ValidationError("Ultravox API key is not configured. Native voice cloning requires Ultravox.")
            raise ProviderError(
                provider="ultravox",
                message=f"Failed to create voice in Ultravox: {error_msg}",
                http_status=500,
            )
    else:
        # External voices can be created without Ultravox (optional)
        if settings.ULTRAVOX_API_KEY:
            try:
                ultravox_data = {
                    "name": voice_data.name,
                    "provider": voice_record["provider"],
                    "type": "reference",
                }
                if voice_data.source.provider_voice_id:
                    ultravox_data["provider_voice_id"] = voice_data.source.provider_voice_id
                ultravox_response = await ultravox_client.create_voice(ultravox_data)
                if ultravox_response and ultravox_response.get("id"):
                    ultravox_voice_id = ultravox_response.get("id")
            except Exception as e:
                # For external voices, Ultravox failure is not critical
                logger.warning(f"Failed to create external voice in Ultravox (non-critical): {e}")
                # Continue without Ultravox ID - voice will still be created in database
    
    # Update with Ultravox ID if available
    if ultravox_voice_id:
        db.update(
            "voices",
            {"id": voice_id},
            {"ultravox_voice_id": ultravox_voice_id},
        )
        voice_record["ultravox_voice_id"] = ultravox_voice_id
    
    # Debit credits if native
    if voice_data.strategy == "native" and client:
        db.insert(
            "credit_transactions",
            {
                "client_id": current_user["client_id"],
                "type": "spent",
                "amount": 50,
                "reference_type": "voice_training",
                "reference_id": voice_id,
                "description": f"Voice training: {voice_data.name}",
            },
        )
        db.update(
            "clients",
            {"id": current_user["client_id"]},
            {"credits_balance": client["credits_balance"] - 50},
        )
    
    # TODO: Trigger Step Function for native training
    
    response_data = {
        "data": VoiceResponse(**voice_record),
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
async def list_voices(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """List voices - syncs status from Ultravox for training voices"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Get voices from database
    voices = db.select("voices", {"client_id": current_user["client_id"]}, "created_at")
    
    # Poll Ultravox for training voices to update their status
    for voice in voices:
        if voice.get("status") == "training" and voice.get("ultravox_voice_id"):
            try:
                ultravox_voice = await ultravox_client.get_voice(voice["ultravox_voice_id"])
                
                # Map Ultravox status to our status
                ultravox_status = ultravox_voice.get("status", "").lower()
                new_status = voice.get("status")  # Default to current status
                
                if ultravox_status in ["active", "ready", "completed"]:
                    new_status = "active"
                    # Update training_info
                    training_info = {
                        "progress": 100,
                        "completed_at": datetime.utcnow().isoformat(),
                    }
                elif ultravox_status in ["failed", "error"]:
                    new_status = "failed"
                    training_info = voice.get("training_info", {})
                    training_info["error_message"] = ultravox_voice.get("error", "Training failed")
                elif ultravox_status == "training":
                    # Update progress if available
                    training_info = voice.get("training_info", {})
                    training_info["progress"] = ultravox_voice.get("progress", training_info.get("progress", 0))
                    new_status = "training"
                else:
                    training_info = voice.get("training_info", {})
                
                # Update database if status changed
                if new_status != voice.get("status") or (ultravox_status == "training" and training_info.get("progress") != voice.get("training_info", {}).get("progress")):
                    update_data = {"status": new_status}
                    if "training_info" in locals():
                        update_data["training_info"] = training_info
                    if new_status == "active":
                        update_data["updated_at"] = datetime.utcnow().isoformat()
                    
                    db.update("voices", {"id": voice["id"]}, update_data)
                    # Update local voice object for response
                    voice["status"] = new_status
                    if "training_info" in locals():
                        voice["training_info"] = training_info
                    
            except Exception as e:
                # Log error but don't fail the request
                logger.warning(f"Failed to sync voice {voice['id']} from Ultravox: {e}")
    
    return {
        "data": [VoiceResponse(**voice) for voice in voices],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("/{voice_id}")
async def get_voice(
    voice_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get single voice"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    voice = db.get_voice(voice_id, current_user["client_id"])
    if not voice:
        raise NotFoundError("voice", voice_id)
    
    # TODO: Poll Ultravox if status is training
    
    return {
        "data": VoiceResponse(**voice),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/{voice_id}/sync")
async def sync_voice_with_ultravox(
    voice_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Sync voice with Ultravox - creates voice in Ultravox if not already created"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    voice = db.get_voice(voice_id, current_user["client_id"])
    if not voice:
        raise NotFoundError("voice", voice_id)
    
    if voice.get("status") != "active":
        raise ValidationError("Voice must be active", {"voice_id": voice_id, "voice_status": voice.get("status")})
    
    # If voice already has ultravox_voice_id, return success
    if voice.get("ultravox_voice_id"):
        return {
            "data": VoiceResponse(**voice),
            "meta": ResponseMeta(
                request_id=str(uuid.uuid4()),
                ts=datetime.utcnow(),
            ),
            "message": "Voice already synced with Ultravox",
        }
    
    # Check if Ultravox is configured
    if not settings.ULTRAVOX_API_KEY:
        raise ValidationError("Ultravox API key not configured. Please set ULTRAVOX_API_KEY environment variable.")
    
    # Create voice in Ultravox
    try:
        if voice.get("strategy") == "native":
            # Native voices need training samples - can't sync without them
            raise ValidationError(
                "Native voices cannot be synced without training samples. Please recreate the voice with training samples.",
                {"voice_strategy": "native"}
            )
        else:
            # External/reference voices
            ultravox_voice_data = {
                "name": voice.get("name"),
                "provider": voice.get("provider", "elevenlabs"),
                "type": "reference",
            }
            if voice.get("provider_voice_id"):
                ultravox_voice_data["provider_voice_id"] = voice.get("provider_voice_id")
            
            logger.info(f"Attempting to create voice in Ultravox: {ultravox_voice_data}")
            ultravox_response = await ultravox_client.create_voice(ultravox_voice_data)
            
            if ultravox_response and ultravox_response.get("id"):
                ultravox_voice_id = ultravox_response.get("id")
                # Update voice with Ultravox ID
                db.update(
                    "voices",
                    {"id": voice_id},
                    {"ultravox_voice_id": ultravox_voice_id},
                )
                voice["ultravox_voice_id"] = ultravox_voice_id
                
                return {
                    "data": VoiceResponse(**voice),
                    "meta": ResponseMeta(
                        request_id=str(uuid.uuid4()),
                        ts=datetime.utcnow(),
                    ),
                    "message": "Voice successfully synced with Ultravox",
                }
            else:
                raise ValidationError("Failed to create voice in Ultravox - response missing ID")
    except Exception as e:
        logger.error(f"Failed to sync voice {voice_id} with Ultravox: {e}", exc_info=True)
        error_msg = str(e)
        if "404" in error_msg:
            error_msg = "Ultravox API endpoint not found. Please check ULTRAVOX_BASE_URL and ULTRAVOX_API_KEY configuration."
        elif "401" in error_msg or "403" in error_msg:
            error_msg = "Ultravox API authentication failed. Please check your ULTRAVOX_API_KEY."
        raise ValidationError(f"Failed to sync voice with Ultravox: {error_msg}", {"error": str(e)})

