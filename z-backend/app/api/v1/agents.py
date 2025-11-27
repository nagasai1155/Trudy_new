"""
Agent Endpoints
"""
from fastapi import APIRouter, Header, Depends
from starlette.requests import Request
from typing import Optional
from datetime import datetime
import uuid
import json

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError
from app.core.idempotency import check_idempotency_key, store_idempotency_response
from app.core.events import emit_agent_created, emit_agent_updated
from app.services.ultravox import ultravox_client
import logging

logger = logging.getLogger(__name__)
from app.models.schemas import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    ResponseMeta,
)

router = APIRouter()


@router.post("")
async def create_agent(
    agent_data: AgentCreate,
    request: Request,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
):
    """Create agent"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    # Check idempotency key
    body_dict = agent_data.dict() if hasattr(agent_data, 'dict') else json.loads(json.dumps(agent_data, default=str))
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
    
    # Validate voice
    voice = db.get_voice(agent_data.voice_id, current_user["client_id"])
    if not voice:
        raise NotFoundError("voice", agent_data.voice_id)
    if voice.get("status") != "active":
        raise ValidationError("Voice must be active", {"voice_id": agent_data.voice_id, "voice_status": voice.get("status")})
    
    # If voice doesn't have ultravox_voice_id, try to create it in Ultravox (for external voices)
    # This is optional - agent can be created without Ultravox integration
    if not voice.get("ultravox_voice_id"):
        from app.core.config import settings
        if settings.ULTRAVOX_API_KEY:
            # Try to create the voice in Ultravox
            try:
                ultravox_voice_data = {
                    "name": voice.get("name"),
                    "provider": voice.get("provider", "elevenlabs"),
                    "type": "reference",  # External voices are reference type
                }
                # If voice has provider_voice_id, include it
                # Note: We don't store provider_voice_id in our database for external voices currently
                # This is a limitation - external voices created without provider_voice_id won't work with Ultravox
                
                ultravox_response = await ultravox_client.create_voice(ultravox_voice_data)
                if ultravox_response and ultravox_response.get("id"):
                    # Update voice with Ultravox ID
                    db.update(
                        "voices",
                        {"id": agent_data.voice_id},
                        {"ultravox_voice_id": ultravox_response.get("id")},
                    )
                    voice["ultravox_voice_id"] = ultravox_response.get("id")
                else:
                    logger.warning(f"Failed to sync voice {agent_data.voice_id} with Ultravox - response missing ID")
            except Exception as e:
                # Log error but don't fail - agent can be created without Ultravox
                logger.warning(f"Failed to create voice in Ultravox for agent (non-critical): {e}")
        else:
            logger.info("Ultravox API key not configured. Agent will be created without Ultravox integration.")
    
    # Validate knowledge bases
    if agent_data.knowledge_bases:
        for kb_id in agent_data.knowledge_bases:
            kb = db.get_knowledge_base(kb_id, current_user["client_id"])
            if not kb:
                raise NotFoundError("knowledge_base", kb_id)
            if kb.get("status") != "ready":
                raise ValidationError("Knowledge base must be ready", {"kb_id": kb_id, "kb_status": kb.get("status")})
    
    # Create agent record
    agent_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    # Prepare agent record for database (use ISO strings for storage)
    agent_db_record = {
        "id": agent_id,
        "client_id": current_user["client_id"],
        "name": agent_data.name,
        "description": agent_data.description,
        "voice_id": agent_data.voice_id,
        "system_prompt": agent_data.system_prompt,
        "model": agent_data.model,
        "tools": [tool.dict() for tool in agent_data.tools] if agent_data.tools else [],
        "knowledge_bases": agent_data.knowledge_bases or [],
        "status": "creating",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    db.insert("agents", agent_db_record)
    
    # Prepare agent record for response (use datetime objects for Pydantic)
    agent_record = agent_db_record.copy()
    agent_record["created_at"] = now
    agent_record["updated_at"] = now
    agent_record["ultravox_agent_id"] = None  # Initialize as None, will be set if Ultravox integration succeeds
    
    # Call Ultravox API (optional - agent can exist without Ultravox for development)
    ultravox_agent_id = None
    if voice.get("ultravox_voice_id"):
        try:
            from app.core.config import settings
            if settings.ULTRAVOX_API_KEY:
                # Get knowledge base corpus IDs
                corpus_ids = []
                if agent_data.knowledge_bases:
                    for kb_id in agent_data.knowledge_bases:
                        kb = db.get_knowledge_base(kb_id, current_user["client_id"])
                        if kb and kb.get("ultravox_corpus_id"):
                            corpus_ids.append(kb["ultravox_corpus_id"])
                
                ultravox_data = {
                    "name": agent_data.name,
                    "voice": {
                        "provider": voice.get("provider", "elevenlabs"),
                        "voice_id": voice.get("ultravox_voice_id"),
                    },
                    "capabilities": {
                        "speech_to_text": True,
                        "text_to_speech": True,
                        "natural_language_processing": True,
                        "conversation_memory": True,
                        "tool_integration": True,
                    },
                    "settings": {
                        "language": voice.get("language", "en-US"),
                        "response_timeout": 30,
                        "max_conversation_turns": 50,
                        "personality": "professional",
                    },
                    "knowledge_base": {
                        "corpus_ids": corpus_ids,
                        "search_enabled": True,
                        "context_window": 5,
                    } if corpus_ids else None,
                    "tools": [tool.dict() for tool in agent_data.tools] if agent_data.tools else [],
                }
                
                ultravox_response = await ultravox_client.create_agent(ultravox_data)
                
                if ultravox_response and ultravox_response.get("id"):
                    ultravox_agent_id = ultravox_response.get("id")
                    # Update with Ultravox ID
                    db.update(
                        "agents",
                        {"id": agent_id},
                        {
                            "ultravox_agent_id": ultravox_agent_id,
                            "status": "active",
                        },
                    )
                    agent_record["ultravox_agent_id"] = ultravox_agent_id
                    agent_record["status"] = "active"
                else:
                    logger.warning(f"Ultravox response missing agent ID for agent {agent_id}")
                    agent_record["status"] = "active"  # Still mark as active even without Ultravox
            else:
                logger.warning("Ultravox API key not configured. Creating agent without Ultravox integration.")
                agent_record["status"] = "active"
        except Exception as e:
            # Log error but don't fail agent creation - allow agent to exist without Ultravox
            logger.error(f"Failed to create agent in Ultravox (non-critical): {e}", exc_info=True)
            agent_record["status"] = "active"  # Still mark as active
    else:
        # Voice doesn't have ultravox_voice_id - agent can still be created without Ultravox
        logger.warning(f"Voice {agent_data.voice_id} doesn't have ultravox_voice_id. Creating agent without Ultravox integration.")
        agent_record["status"] = "active"
    
    response_data = {
        "data": AgentResponse(**agent_record),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }
    
    # Emit EventBridge event
    await emit_agent_created(
        agent_id=agent_id,
        client_id=current_user["client_id"],
        ultravox_agent_id=agent_record.get("ultravox_agent_id"),
    )
    
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


@router.patch("/{agent_id}")
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Update agent"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    agent = db.get_agent(agent_id, current_user["client_id"])
    if not agent:
        raise NotFoundError("agent", agent_id)
    
    # Validate voice if changed
    if agent_data.voice_id:
        voice = db.get_voice(agent_data.voice_id, current_user["client_id"])
        if not voice or voice.get("status") != "active":
            raise ValidationError("Voice must be active")
    
    # Update local database
    update_data = agent_data.dict(exclude_unset=True)
    db.update("agents", {"id": agent_id}, update_data)
    
    # Update Ultravox
    if agent.get("ultravox_agent_id"):
        try:
            await ultravox_client.update_agent(agent["ultravox_agent_id"], update_data)
        except Exception as e:
            # Log error but don't fail the request
            pass
    
    # Get updated agent
    updated_agent = db.get_agent(agent_id, current_user["client_id"])
    
    # Emit EventBridge event
    await emit_agent_updated(
        agent_id=agent_id,
        client_id=current_user["client_id"],
        changes=update_data,
    )
    
    return {
        "data": AgentResponse(**updated_agent),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("")
async def list_agents(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """List agents"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    agents = db.select("agents", {"client_id": current_user["client_id"]}, "created_at")
    
    return {
        "data": [AgentResponse(**agent) for agent in agents],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("/{agent_id}")
async def get_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Get single agent"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    agent = db.get_agent(agent_id, current_user["client_id"])
    if not agent:
        raise NotFoundError("agent", agent_id)
    
    return {
        "data": AgentResponse(**agent),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

