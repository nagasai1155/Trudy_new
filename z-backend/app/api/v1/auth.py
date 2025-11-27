"""
Auth & Client Management Endpoints
"""
from fastapi import APIRouter, Header, Depends
from typing import Optional
from datetime import datetime
import uuid
import logging

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.encryption import encrypt_api_key, decrypt_api_key
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError, ValidationError
from app.models.schemas import (
    UserResponse,
    ClientResponse,
    ApiKeyCreate,
    ApiKeyResponse,
    TTSProviderUpdate,
    ResponseMeta,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get current user information, auto-create user/client if doesn't exist"""
    # Use service key for admin operations (creating users/clients)
    from app.core.database import get_supabase_admin_client
    admin_db = get_supabase_admin_client()
    
    # Try to find existing user
    user = admin_db.table("users").select("*").eq("auth0_sub", current_user["user_id"]).execute()
    user_data = user.data[0] if user.data else None
    
    if not user_data:
        # First-time login: Create client and user
        # Create client first
        client_id = str(uuid.uuid4())
        client_data = {
            "id": client_id,
            "name": current_user.get("name", current_user.get("email", "New Client")),
            "email": current_user["email"],
            "subscription_status": "active",
            "credits_balance": 0,
            "credits_ceiling": 10000,
        }
        admin_db.table("clients").insert(client_data).execute()
        
        # Create user linked to client
        user_id = str(uuid.uuid4())
        user_data = {
            "id": user_id,
            "auth0_sub": current_user["user_id"],
            "client_id": client_id,
            "email": current_user["email"],
            "role": "client_admin",  # First user is admin
        }
        admin_db.table("users").insert(user_data).execute()
        
        logger.info(f"Created new user and client: {user_id}, {client_id}")
    
    # Now use regular database service with user's context
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Refresh user data
    user = db.get_user_by_auth0_sub(current_user["user_id"])
    if not user:
        raise NotFoundError("user")
    
    return {
        "data": UserResponse(**user),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("/clients")
async def get_clients(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get clients (filtered by role)"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    if current_user["role"] == "agency_admin":
        clients = db.select("clients")
    else:
        clients = db.select("clients", {"id": current_user["client_id"]})
    
    return {
        "data": [ClientResponse(**client) for client in clients],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/api-keys")
async def create_api_key(
    api_key_data: ApiKeyCreate,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Create API key (encrypted storage)"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Check for duplicate
    existing = db.select_one(
        "api_keys",
        {
            "client_id": current_user["client_id"],
            "service": api_key_data.service,
            "key_name": api_key_data.key_name,
        },
    )
    if existing:
        raise ConflictError("API key with this name already exists")
    
    # Encrypt API key
    encrypted_key = encrypt_api_key(api_key_data.api_key)
    if not encrypted_key:
        raise ValidationError("Failed to encrypt API key")
    
    # Insert API key
    api_key_record = db.insert(
        "api_keys",
        {
            "client_id": current_user["client_id"],
            "service": api_key_data.service,
            "key_name": api_key_data.key_name,
            "encrypted_key": encrypted_key,
            "settings": api_key_data.settings,
            "is_active": True,
        },
    )
    
    return {
        "data": ApiKeyResponse(
            id=api_key_record["id"],
            client_id=api_key_record["client_id"],
            service=api_key_record["service"],
            key_name=api_key_record["key_name"],
            is_active=api_key_record["is_active"],
            created_at=api_key_record["created_at"],
        ),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.patch("/providers/tts")
async def update_tts_provider(
    provider_data: TTSProviderUpdate,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Configure external TTS provider"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Update or create API key
    existing = db.select_one(
        "api_keys",
        {
            "client_id": current_user["client_id"],
            "service": provider_data.provider,
        },
    )
    
    # Encrypt API key
    encrypted_key = encrypt_api_key(provider_data.api_key)
    if not encrypted_key:
        raise ValidationError("Failed to encrypt API key")
    
    if existing:
        api_key_record = db.update(
            "api_keys",
            {"id": existing["id"]},
            {
                "encrypted_key": encrypted_key,
                "settings": provider_data.settings,
                "is_active": True,
            },
        )
    else:
        api_key_record = db.insert(
            "api_keys",
            {
                "client_id": current_user["client_id"],
                "service": provider_data.provider,
                "key_name": f"{provider_data.provider.title()} TTS Key",
                "encrypted_key": encrypted_key,
                "settings": provider_data.settings,
                "is_active": True,
            },
        )
    
    # TODO: Call Ultravox API to update TTS config
    # await ultravox_client.update_tts_api_key(...)
    
    return {
        "data": ApiKeyResponse(
            id=api_key_record["id"],
            client_id=api_key_record["client_id"],
            service=api_key_record["service"],
            key_name=api_key_record["key_name"],
            is_active=api_key_record["is_active"],
            created_at=api_key_record["created_at"],
        ),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

