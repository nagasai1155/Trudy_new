"""
Campaign Endpoints
"""
from fastapi import APIRouter, Header, Depends
from typing import Optional
from datetime import datetime
import uuid
import csv
import io

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.s3 import generate_presigned_url, get_s3_client
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError
from app.services.ultravox import ultravox_client
from app.models.schemas import (
    CampaignCreate,
    CampaignContactsUpload,
    CampaignResponse,
    ResponseMeta,
)
from app.core.config import settings

router = APIRouter()


@router.post("")
async def create_campaign(
    campaign_data: CampaignCreate,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Create campaign"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Validate agent
    agent = db.get_agent(campaign_data.agent_id, current_user["client_id"])
    if not agent:
        raise NotFoundError("agent", campaign_data.agent_id)
    if agent.get("status") != "active":
        raise ValidationError("Agent must be active")
    
    # Create campaign record
    campaign_id = str(uuid.uuid4())
    campaign_record = {
        "id": campaign_id,
        "client_id": current_user["client_id"],
        "agent_id": campaign_data.agent_id,
        "name": campaign_data.name,
        "schedule_type": campaign_data.schedule_type.value,
        "scheduled_at": campaign_data.scheduled_at.isoformat() if campaign_data.scheduled_at else None,
        "timezone": campaign_data.timezone,
        "max_concurrent_calls": campaign_data.max_concurrent_calls,
        "status": "draft",
        "stats": {"pending": 0, "calling": 0, "completed": 0, "failed": 0},
    }
    
    db.insert("campaigns", campaign_record)
    
    return {
        "data": CampaignResponse(**campaign_record),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/{campaign_id}/contacts/presign")
async def presign_contacts_csv(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get presigned URL for contacts CSV upload"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    campaign = db.get_campaign(campaign_id, current_user["client_id"])
    if not campaign:
        raise NotFoundError("campaign", campaign_id)
    
    if campaign.get("status") != "draft":
        raise ValidationError("Campaign must be in draft status")
    
    s3_key = f"uploads/client_{current_user['client_id']}/campaigns/{campaign_id}/contacts.csv"
    url = generate_presigned_url(
        bucket=settings.S3_BUCKET_UPLOADS,
        key=s3_key,
        operation="put_object",
        expires_in=3600,
        content_type="text/csv",
    )
    
    return {
        "data": {
            "upload_url": url,
            "s3_key": s3_key,
            "headers": {"Content-Type": "text/csv"},
        },
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/{campaign_id}/contacts")
async def upload_campaign_contacts(
    campaign_id: str,
    contacts_data: CampaignContactsUpload,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Upload campaign contacts (CSV or direct array)"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    campaign = db.get_campaign(campaign_id, current_user["client_id"])
    if not campaign:
        raise NotFoundError("campaign", campaign_id)
    
    if campaign.get("status") != "draft":
        raise ValidationError("Campaign must be in draft status")
    
    contacts = []
    
    if contacts_data.s3_key:
        # Parse CSV from S3
        s3_client = get_s3_client()
        try:
            obj = s3_client.get_object(Bucket=settings.S3_BUCKET_UPLOADS, Key=contacts_data.s3_key)
            csv_content = obj["Body"].read().decode("utf-8")
            reader = csv.DictReader(io.StringIO(csv_content))
            
            for row in reader:
                phone_number = row.get("phone_number", "").strip()
                if not phone_number:
                    continue
                
                contacts.append({
                    "phone_number": phone_number,
                    "first_name": row.get("first_name", "").strip() or None,
                    "last_name": row.get("last_name", "").strip() or None,
                    "email": row.get("email", "").strip() or None,
                    "custom_fields": {k: v for k, v in row.items() if k not in ["phone_number", "first_name", "last_name", "email"]},
                })
        except Exception as e:
            raise ValidationError(f"Failed to parse CSV: {str(e)}")
    elif contacts_data.contacts:
        contacts = [c.dict() for c in contacts_data.contacts]
    
    # Insert contacts
    contacts_added = 0
    for contact in contacts:
        try:
            db.insert(
                "campaign_contacts",
                {
                    "campaign_id": campaign_id,
                    "phone_number": contact["phone_number"],
                    "first_name": contact.get("first_name"),
                    "last_name": contact.get("last_name"),
                    "email": contact.get("email"),
                    "custom_fields": contact.get("custom_fields", {}),
                    "status": "pending",
                },
            )
            contacts_added += 1
        except Exception:
            # Skip duplicates
            continue
    
    # Update campaign stats
    db.update_campaign_stats(campaign_id)
    
    return {
        "data": {
            "campaign_id": campaign_id,
            "contacts_added": contacts_added,
            "contacts_failed": len(contacts) - contacts_added,
            "stats": db.get_campaign(campaign_id, current_user["client_id"]).get("stats", {}),
        },
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/{campaign_id}/schedule")
async def schedule_campaign(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Schedule campaign"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    campaign = db.get_campaign(campaign_id, current_user["client_id"])
    if not campaign:
        raise NotFoundError("campaign", campaign_id)
    
    if campaign.get("status") != "draft":
        raise ValidationError("Campaign must be in draft status")
    
    # Get contacts
    contacts = db.get_campaign_contacts(campaign_id)
    pending_contacts = [c for c in contacts if c.get("status") == "pending"]
    
    if not pending_contacts:
        raise ValidationError("No pending contacts found")
    
    # Get agent
    agent = db.get_agent(campaign["agent_id"], current_user["client_id"])
    
    # Prepare batch data
    batch_contacts = []
    for contact in pending_contacts:
        batch_contacts.append({
            "phone_number": contact["phone_number"],
            "context": {
                "first_name": contact.get("first_name"),
                "last_name": contact.get("last_name"),
                "campaign_id": campaign_id,
                "custom_fields": contact.get("custom_fields", {}),
            },
        })
    
    # Call Ultravox API
    try:
        batch_data = {
            "batches": [{
                "contacts": batch_contacts,
                "medium": {"telnyx": {}},
                "schedule": {
                    "at": campaign.get("scheduled_at"),
                    "timezone": campaign.get("timezone", "UTC"),
                },
                "settings": {
                    "max_concurrent": campaign.get("max_concurrent_calls", 10),
                    "recording_enabled": True,
                },
            }],
        }
        
        ultravox_response = await ultravox_client.create_scheduled_batch(
            agent.get("ultravox_agent_id"),
            batch_data,
        )
        
        batch_ids = [b.get("batch_id") for b in ultravox_response.get("batches", [])]
        
        # Update campaign
        db.update(
            "campaigns",
            {"id": campaign_id},
            {
                "status": "scheduled",
                "ultravox_batch_ids": batch_ids,
            },
        )
        
        # TODO: Trigger Step Function
        
    except Exception as e:
        db.update(
            "campaigns",
            {"id": campaign_id},
            {"status": "failed"},
        )
        raise
    
    updated_campaign = db.get_campaign(campaign_id, current_user["client_id"])
    
    return {
        "data": CampaignResponse(**updated_campaign),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get campaign"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    campaign = db.get_campaign(campaign_id, current_user["client_id"])
    if not campaign:
        raise NotFoundError("campaign", campaign_id)
    
    # Update stats
    db.update_campaign_stats(campaign_id)
    campaign = db.get_campaign(campaign_id, current_user["client_id"])
    
    return {
        "data": CampaignResponse(**campaign),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

