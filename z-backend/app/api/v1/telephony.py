"""
Telephony & SIP Endpoints
"""
from fastapi import APIRouter, Header, Depends
from typing import Optional
from datetime import datetime
import uuid

from app.core.auth import get_current_user
from app.services.ultravox import ultravox_client
from app.models.schemas import ResponseMeta

router = APIRouter()


@router.get("/config")
async def get_telephony_config(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get SIP/Telephony configuration"""
    try:
        sip_config = await ultravox_client.get_sip_config()
        
        return {
            "data": {
                "sip_endpoint": sip_config.get("sip_endpoint", "sip.ultravox.ai"),
                "username": sip_config.get("username", ""),
                "password": sip_config.get("password", ""),
                "domain": sip_config.get("domain", "ultravox.ai"),
            },
            "meta": ResponseMeta(
                request_id=str(uuid.uuid4()),
                ts=datetime.utcnow(),
            ),
        }
    except Exception as e:
        # If Ultravox doesn't support this endpoint yet, return default
        return {
            "data": {
                "sip_endpoint": "sip.ultravox.ai",
                "username": current_user.get("client_id", ""),
                "password": "",  # Should be retrieved from secure storage
                "domain": "ultravox.ai",
            },
            "meta": ResponseMeta(
                request_id=str(uuid.uuid4()),
                ts=datetime.utcnow(),
            ),
        }

