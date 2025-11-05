"""
Webhook Endpoints (Ingress & Egress)
"""
from fastapi import APIRouter, Header, Request, Depends
from typing import Optional
from datetime import datetime
import uuid
import secrets
import json

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.webhooks import verify_ultravox_signature, verify_timestamp
from app.core.exceptions import UnauthorizedError, ForbiddenError, NotFoundError
from app.models.schemas import (
    WebhookEndpointCreate,
    WebhookEndpointResponse,
    ResponseMeta,
)
from app.core.config import settings

router = APIRouter()


# ============================================
# Webhook Ingress (from external services)
# ============================================

@router.post("/ultravox")
async def ultravox_webhook(
    request: Request,
    x_ultravox_signature: Optional[str] = Header(None),
    x_ultravox_timestamp: Optional[str] = Header(None),
):
    """Receive webhook from Ultravox"""
    # Get raw body
    body = await request.body()
    body_str = body.decode("utf-8")
    
    # Verify signature
    if not x_ultravox_signature or not x_ultravox_timestamp:
        raise UnauthorizedError("Missing signature or timestamp")
    
    if not verify_ultravox_signature(
        x_ultravox_signature,
        x_ultravox_timestamp,
        body_str,
        settings.ULTRAVOX_WEBHOOK_SECRET,
    ):
        raise UnauthorizedError("Invalid signature")
    
    if not verify_timestamp(x_ultravox_timestamp):
        raise UnauthorizedError("Timestamp verification failed")
    
    # Parse event
    event_data = json.loads(body_str)
    event_type = event_data.get("event")
    
    db = DatabaseService()
    
    # Route by event type
    if event_type == "call.completed":
        # Update call status
        ultravox_call_id = event_data.get("call_id")
        call = db.select_one("calls", {"ultravox_call_id": ultravox_call_id})
        
        if call:
            duration = event_data.get("data", {}).get("duration_seconds", 0)
            cost = event_data.get("data", {}).get("cost_usd", 0)
            
            # Debit credits
            credits = max(1, (duration + 59) // 60)  # Round up to minutes
            db.insert(
                "credit_transactions",
                {
                    "client_id": call["client_id"],
                    "type": "spent",
                    "amount": credits,
                    "reference_type": "call",
                    "reference_id": call["id"],
                    "description": f"Call duration: {credits} minutes",
                },
            )
            
            client = db.get_client(call["client_id"])
            if client:
                db.update(
                    "clients",
                    {"id": call["client_id"]},
                    {"credits_balance": client["credits_balance"] - credits},
                )
            
            # Update call
            db.update(
                "calls",
                {"id": call["id"]},
                {
                    "status": "completed",
                    "duration_seconds": duration,
                    "cost_usd": cost,
                    "ended_at": event_data.get("timestamp"),
                    "recording_url": event_data.get("data", {}).get("recording_url"),
                },
            )
            
            # Update campaign contact if applicable
            if call.get("context", {}).get("campaign_id"):
                campaign_id = call["context"]["campaign_id"]
                phone_number = call["phone_number"]
                db.update(
                    "campaign_contacts",
                    {"campaign_id": campaign_id, "phone_number": phone_number},
                    {"status": "completed", "call_id": call["id"]},
                )
                db.update_campaign_stats(campaign_id)
    
    elif event_type == "voice.training.completed":
        # Update voice status
        ultravox_voice_id = event_data.get("voice_id")
        voice = db.select_one("voices", {"ultravox_voice_id": ultravox_voice_id})
        
        if voice:
            db.update(
                "voices",
                {"id": voice["id"]},
                {
                    "status": "active",
                    "training_info": {
                        "progress": 100,
                        "completed_at": event_data.get("timestamp"),
                    },
                },
            )
    
    # TODO: Trigger egress webhooks
    
    return {"status": "ok"}


@router.post("/stripe")
async def stripe_webhook(request: Request):
    """Receive webhook from Stripe"""
    # TODO: Implement Stripe webhook verification
    body = await request.json()
    event_type = body.get("type")
    
    db = DatabaseService()
    
    if event_type == "payment_intent.succeeded":
        # Add credits
        amount_cents = body.get("data", {}).get("object", {}).get("amount", 0)
        credits = amount_cents // 100  # 1 credit = $1
        
        # TODO: Extract client_id from metadata
        # client_id = body.get("data", {}).get("object", {}).get("metadata", {}).get("client_id")
        # if client_id:
        #     db.insert("credit_transactions", {...})
    
    return {"status": "ok"}


@router.post("/telnyx")
async def telnyx_webhook(request: Request):
    """Receive webhook from Telnyx"""
    # TODO: Implement Telnyx webhook verification (HMAC similar to Ultravox)
    body = await request.json()
    event_type = body.get("event_type")
    
    db = DatabaseService()
    
    # Handle Telnyx events (number events, call events, etc.)
    # Implementation details to be defined based on Telnyx webhook requirements
    
    return {"status": "ok"}


# ============================================
# Webhook Egress (client webhooks)
# ============================================

@router.post("")
async def create_webhook_endpoint(
    webhook_data: WebhookEndpointCreate,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Create webhook endpoint"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Generate secret if not provided
    secret = webhook_data.secret or secrets.token_hex(16)
    
    webhook_record = db.insert(
        "webhook_endpoints",
        {
            "client_id": current_user["client_id"],
            "url": webhook_data.url,
            "event_types": webhook_data.event_types,
            "secret": secret,
            "enabled": webhook_data.enabled,
            "retry_config": webhook_data.retry_config or {"max_attempts": 10, "backoff_strategy": "exponential"},
        },
    )
    
    return {
        "data": WebhookEndpointResponse(
            id=webhook_record["id"],
            client_id=webhook_record["client_id"],
            url=webhook_record["url"],
            event_types=webhook_record["event_types"],
            secret=webhook_record["secret"],
            enabled=webhook_record["enabled"],
            created_at=webhook_record["created_at"],
        ),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("")
async def list_webhook_endpoints(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """List webhook endpoints"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    webhooks = db.select("webhook_endpoints", {"client_id": current_user["client_id"]})
    
    # Don't return secrets
    for wh in webhooks:
        wh.pop("secret", None)
    
    return {
        "data": [WebhookEndpointResponse(**wh) for wh in webhooks],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.delete("/{webhook_id}")
async def delete_webhook_endpoint(
    webhook_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Delete webhook endpoint"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    webhook = db.select_one("webhook_endpoints", {"id": webhook_id})
    if not webhook:
        raise NotFoundError("webhook_endpoint", webhook_id)
    
    db.delete("webhook_endpoints", {"id": webhook_id})
    
    return {"status": "deleted"}

