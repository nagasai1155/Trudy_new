"""
Internal API Routes for Step Functions
"""
from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Optional
from datetime import datetime
import uuid
import logging

from app.core.database import DatabaseAdminService
from app.core.exceptions import NotFoundError
from app.models.schemas import ResponseMeta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/internal", tags=["internal"])


def verify_internal_request(
    x_internal_key: Optional[str] = Header(None, alias="X-Internal-Key"),
) -> bool:
    """Verify internal request key"""
    from app.core.config import settings
    
    internal_key = getattr(settings, "INTERNAL_API_KEY", None)
    if not internal_key:
        logger.warning("INTERNAL_API_KEY not configured, allowing all internal requests")
        return True
    
    if x_internal_key != internal_key:
        raise HTTPException(status_code=401, detail="Invalid internal API key")
    
    return True


@router.post("/voices/{voice_id}/update-status")
async def update_voice_status(
    voice_id: str,
    status_data: dict,
    _: bool = Depends(verify_internal_request),
):
    """Update voice status (called by Step Functions)"""
    db = DatabaseAdminService()
    
    # Check if voice exists
    voice = db.select_one("voices", {"id": voice_id})
    if not voice:
        raise NotFoundError("voice", voice_id)
    
    # Prepare update data
    update_data = {
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    if "status" in status_data:
        update_data["status"] = status_data["status"]
    
    if "training_info" in status_data:
        update_data["training_info"] = status_data["training_info"]
    
    if "ultravox_voice_id" in status_data:
        update_data["ultravox_voice_id"] = status_data["ultravox_voice_id"]
    
    # Update voice
    db.update("voices", {"id": voice_id}, update_data)
    
    logger.info(f"Updated voice status: {voice_id} -> {status_data.get('status')}")
    
    return {
        "data": {"voice_id": voice_id, "status": status_data.get("status")},
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/campaigns/{campaign_id}/update-stats")
async def update_campaign_stats(
    campaign_id: str,
    _: bool = Depends(verify_internal_request),
):
    """Update campaign statistics (called by Step Functions)"""
    db = DatabaseAdminService()
    
    # Check if campaign exists
    campaign = db.select_one("campaigns", {"id": campaign_id})
    if not campaign:
        raise NotFoundError("campaign", campaign_id)
    
    # Calculate stats from contacts
    contacts = db.select("campaign_contacts", {"campaign_id": campaign_id})
    
    stats = {
        "pending": sum(1 for c in contacts if c.get("status") == "pending"),
        "calling": sum(1 for c in contacts if c.get("status") == "calling"),
        "completed": sum(1 for c in contacts if c.get("status") == "completed"),
        "failed": sum(1 for c in contacts if c.get("status") == "failed"),
    }
    
    # Update campaign
    db.update("campaigns", {"id": campaign_id}, {"stats": stats})
    
    logger.info(f"Updated campaign stats: {campaign_id} -> {stats}")
    
    return {
        "data": {"campaign_id": campaign_id, "stats": stats},
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/idempotency/cleanup")
async def cleanup_idempotency_keys(
    _: bool = Depends(verify_internal_request),
):
    """Cleanup expired idempotency keys (called by scheduled job)"""
    db = DatabaseAdminService()
    
    from datetime import datetime
    
    # Get expired keys
    expired_keys = db.select("idempotency_keys", {})
    
    # Filter expired keys
    now = datetime.utcnow()
    deleted_count = 0
    
    for key in expired_keys:
        ttl_at = datetime.fromisoformat(key["ttl_at"].replace("Z", "+00:00"))
        if now > ttl_at:
            db.delete("idempotency_keys", {"id": key["id"]})
            deleted_count += 1
    
    logger.info(f"Cleaned up {deleted_count} expired idempotency keys")
    
    return {
        "data": {"deleted_count": deleted_count},
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

