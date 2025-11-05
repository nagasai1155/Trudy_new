"""
Voice Endpoints
"""
from fastapi import APIRouter, Header, Depends, Request
from typing import Optional
from datetime import datetime
import uuid

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.s3 import generate_presigned_url, check_object_exists
from app.core.exceptions import NotFoundError, ValidationError, PaymentRequiredError, ForbiddenError
from app.services.ultravox import ultravox_client
from app.models.schemas import (
    VoiceCreate,
    VoiceResponse,
    VoicePresignRequest,
    PresignResponse,
    ResponseMeta,
)
from app.core.config import settings

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
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
):
    """Create voice (native clone or external reference)"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # TODO: Check idempotency key
    
    # Credit check for native training
    if voice_data.strategy == "native":
        client = db.get_client(current_user["client_id"])
        if not client or client.get("credits_balance", 0) < 50:
            raise PaymentRequiredError(
                "Insufficient credits for voice training. Required: 50",
                {"required": 50, "available": client.get("credits_balance", 0) if client else 0},
            )
    
    # Create voice record
    voice_id = str(uuid.uuid4())
    voice_record = {
        "id": voice_id,
        "client_id": current_user["client_id"],
        "name": voice_data.name,
        "provider": voice_data.provider_overrides.get("provider", "elevenlabs") if voice_data.provider_overrides else "elevenlabs",
        "type": "custom" if voice_data.strategy == "native" else "reference",
        "language": "en-US",
        "status": "training" if voice_data.strategy == "native" else "active",
        "training_info": {
            "progress": 0,
            "started_at": datetime.utcnow().isoformat(),
        } if voice_data.strategy == "native" else {},
    }
    
    db.insert("voices", voice_record)
    
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
    
    # Call Ultravox API
    try:
        if voice_data.strategy == "native":
            ultravox_data = {
                "name": voice_data.name,
                "provider": voice_record["provider"],
                "type": "custom",
                "language": "en-US",
                "training_samples": training_samples,
            }
            ultravox_response = await ultravox_client.create_voice(ultravox_data)
        else:
            ultravox_data = {
                "name": voice_data.name,
                "provider": voice_record["provider"],
                "type": "reference",
                "provider_voice_id": voice_data.source.provider_voice_id,
            }
            ultravox_response = await ultravox_client.create_voice(ultravox_data)
        
        # Update with Ultravox ID
        db.update(
            "voices",
            {"id": voice_id},
            {"ultravox_voice_id": ultravox_response.get("id")},
        )
        voice_record["ultravox_voice_id"] = ultravox_response.get("id")
        
    except Exception as e:
        # Mark as failed
        db.update(
            "voices",
            {"id": voice_id},
            {"status": "failed", "training_info": {"error_message": str(e)}},
        )
        raise
    
    # Debit credits if native
    if voice_data.strategy == "native":
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
    
    return {
        "data": VoiceResponse(**voice_record),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("")
async def list_voices(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """List voices"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    voices = db.select("voices", {"client_id": current_user["client_id"]}, "created_at")
    
    # TODO: Optionally poll Ultravox for training status
    
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

