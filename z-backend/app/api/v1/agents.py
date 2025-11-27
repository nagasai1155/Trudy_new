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
                # Include provider_voice_id if available (ElevenLabs voice ID)
                if voice.get("provider_voice_id"):
                    ultravox_voice_data["provider_voice_id"] = voice.get("provider_voice_id")
                
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
                    # Update database to active status
                    db.update(
                        "agents",
                        {"id": agent_id},
                        {"status": "active"},
                    )
                    agent_record["status"] = "active"  # Still mark as active even without Ultravox
            else:
                logger.warning("Ultravox API key not configured. Creating agent without Ultravox integration.")
                # Update database to active status
                db.update(
                    "agents",
                    {"id": agent_id},
                    {"status": "active"},
                )
                agent_record["status"] = "active"
        except Exception as e:
            # Log error but don't fail agent creation - allow agent to exist without Ultravox
            logger.error(f"Failed to create agent in Ultravox (non-critical): {e}", exc_info=True)
            # Update database to active status
            db.update(
                "agents",
                {"id": agent_id},
                {"status": "active"},
            )
            agent_record["status"] = "active"  # Still mark as active
    else:
        # Voice doesn't have ultravox_voice_id - agent can still be created without Ultravox
        logger.warning(f"Voice {agent_data.voice_id} doesn't have ultravox_voice_id. Creating agent without Ultravox integration.")
        # Update database to active status
        db.update(
            "agents",
            {"id": agent_id},
            {"status": "active"},
        )
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
    voice = None
    if agent_data.voice_id:
        voice = db.get_voice(agent_data.voice_id, current_user["client_id"])
        if not voice or voice.get("status") != "active":
            raise ValidationError("Voice must be active")
        
        # If voice doesn't have ultravox_voice_id, try to create it in Ultravox (for external voices)
        if not voice.get("ultravox_voice_id"):
            from app.core.config import settings
            if settings.ULTRAVOX_API_KEY:
                try:
                    ultravox_voice_data = {
                        "name": voice.get("name"),
                        "provider": voice.get("provider", "elevenlabs"),
                        "type": "reference",
                    }
                    if voice.get("provider_voice_id"):
                        ultravox_voice_data["provider_voice_id"] = voice.get("provider_voice_id")
                    
                    ultravox_response = await ultravox_client.create_voice(ultravox_voice_data)
                    if ultravox_response and ultravox_response.get("id"):
                        db.update(
                            "voices",
                            {"id": agent_data.voice_id},
                            {"ultravox_voice_id": ultravox_response.get("id")},
                        )
                        voice["ultravox_voice_id"] = ultravox_response.get("id")
                except Exception as e:
                    logger.warning(f"Failed to sync voice {agent_data.voice_id} with Ultravox during agent update (non-critical): {e}")
    
    # Update local database
    update_data = agent_data.dict(exclude_unset=True)
    db.update("agents", {"id": agent_id}, update_data)
    
    # Update Ultravox - if voice changed, need to update voice reference
    if agent.get("ultravox_agent_id"):
        try:
            # If voice changed, include voice data in update
            if voice and voice.get("ultravox_voice_id"):
                update_data_for_ultravox = update_data.copy()
                update_data_for_ultravox["voice"] = {
                    "provider": voice.get("provider", "elevenlabs"),
                    "voice_id": voice.get("ultravox_voice_id"),
                }
                await ultravox_client.update_agent(agent["ultravox_agent_id"], update_data_for_ultravox)
            else:
                await ultravox_client.update_agent(agent["ultravox_agent_id"], update_data)
        except Exception as e:
            # Log error but don't fail the request
            logger.warning(f"Failed to update agent in Ultravox (non-critical): {e}")
    
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
    """List agents - syncs status from Ultravox for creating agents"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Get agents from database
    agents = db.select("agents", {"client_id": current_user["client_id"]}, "created_at")
    
    # Automatically sync agents with Ultravox if they don't have ultravox_agent_id
    for agent in agents:
        # Check and update agents with "creating" status
        if agent.get("status") == "creating":
            # If agent has ultravox_agent_id, check Ultravox status
            if agent.get("ultravox_agent_id"):
                try:
                    from app.core.config import settings
                    if settings.ULTRAVOX_API_KEY:
                        ultravox_agent = await ultravox_client.get_agent(agent["ultravox_agent_id"])
                        ultravox_status = ultravox_agent.get("status", "").lower()
                        
                        # If Ultravox says it's active/ready, update our status
                        if ultravox_status in ["active", "ready", "completed"]:
                            db.update(
                                "agents",
                                {"id": agent["id"]},
                                {
                                    "status": "active",
                                    "updated_at": datetime.utcnow().isoformat(),
                                },
                            )
                            agent["status"] = "active"
                except Exception as e:
                    # Log error but don't fail the request
                    logger.warning(f"Failed to sync agent {agent['id']} from Ultravox: {e}")
            else:
                # Agent doesn't have ultravox_agent_id - it was created without Ultravox
                # Mark it as active since creation should have completed
                db.update(
                    "agents",
                    {"id": agent["id"]},
                    {
                        "status": "active",
                        "updated_at": datetime.utcnow().isoformat(),
                    },
                )
                agent["status"] = "active"
        
        # Automatically sync agents without ultravox_agent_id (if Ultravox is configured)
        elif agent.get("status") == "active" and not agent.get("ultravox_agent_id"):
            try:
                from app.core.config import settings
                if settings.ULTRAVOX_API_KEY:
                    # Get voice
                    voice = db.get_voice(agent["voice_id"], current_user["client_id"])
                    if voice and voice.get("status") == "active":
                        # Try to sync voice first if it doesn't have ultravox_voice_id
                        if not voice.get("ultravox_voice_id") and voice.get("provider_voice_id"):
                            try:
                                ultravox_voice_data = {
                                    "name": voice.get("name"),
                                    "provider": voice.get("provider", "elevenlabs"),
                                    "type": "reference",
                                }
                                if voice.get("provider_voice_id"):
                                    ultravox_voice_data["provider_voice_id"] = voice.get("provider_voice_id")
                                
                                ultravox_voice_response = await ultravox_client.create_voice(ultravox_voice_data)
                                if ultravox_voice_response and ultravox_voice_response.get("id"):
                                    db.update(
                                        "voices",
                                        {"id": agent["voice_id"]},
                                        {"ultravox_voice_id": ultravox_voice_response.get("id")},
                                    )
                                    voice["ultravox_voice_id"] = ultravox_voice_response.get("id")
                            except Exception as e:
                                logger.warning(f"Failed to auto-sync voice {agent['voice_id']} for agent {agent['id']}: {e}")
                        
                        # If voice has ultravox_voice_id, try to sync agent
                        if voice.get("ultravox_voice_id"):
                            try:
                                # Get knowledge base corpus IDs
                                corpus_ids = []
                                if agent.get("knowledge_bases"):
                                    for kb_id in agent["knowledge_bases"]:
                                        kb = db.get_knowledge_base(kb_id, current_user["client_id"])
                                        if kb and kb.get("ultravox_corpus_id"):
                                            corpus_ids.append(kb["ultravox_corpus_id"])
                                
                                ultravox_data = {
                                    "name": agent["name"],
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
                                    "tools": agent.get("tools", []),
                                }
                                
                                ultravox_response = await ultravox_client.create_agent(ultravox_data)
                                if ultravox_response and ultravox_response.get("id"):
                                    db.update(
                                        "agents",
                                        {"id": agent["id"]},
                                        {
                                            "ultravox_agent_id": ultravox_response.get("id"),
                                            "updated_at": datetime.utcnow().isoformat(),
                                        },
                                    )
                                    agent["ultravox_agent_id"] = ultravox_response.get("id")
                                    logger.info(f"Auto-synced agent {agent['id']} with Ultravox")
                            except Exception as e:
                                # Log but don't fail - agent can exist without Ultravox
                                logger.warning(f"Failed to auto-sync agent {agent['id']} with Ultravox: {e}")
            except Exception as e:
                # Log but don't fail the request
                logger.warning(f"Error during auto-sync for agent {agent['id']}: {e}")
    
    return {
        "data": [AgentResponse(**agent) for agent in agents],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.post("/{agent_id}/sync")
async def sync_agent_with_ultravox(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Sync agent with Ultravox - creates agent in Ultravox if not already created"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    agent = db.get_agent(agent_id, current_user["client_id"])
    if not agent:
        raise NotFoundError("agent", agent_id)
    
    # If agent already has ultravox_agent_id, return success
    if agent.get("ultravox_agent_id"):
        return {
            "data": AgentResponse(**agent),
            "meta": ResponseMeta(
                request_id=str(uuid.uuid4()),
                ts=datetime.utcnow(),
            ),
            "message": "Agent already synced with Ultravox",
        }
    
    # Get voice
    voice = db.get_voice(agent["voice_id"], current_user["client_id"])
    if not voice:
        raise NotFoundError("voice", agent["voice_id"])
    
    if voice.get("status") != "active":
        raise ValidationError("Voice must be active", {"voice_id": agent["voice_id"], "voice_status": voice.get("status")})
    
    # If voice doesn't have ultravox_voice_id, try to create it first
    if not voice.get("ultravox_voice_id"):
        from app.core.config import settings
        if settings.ULTRAVOX_API_KEY:
            try:
                ultravox_voice_data = {
                    "name": voice.get("name"),
                    "provider": voice.get("provider", "elevenlabs"),
                    "type": "reference",
                }
                if voice.get("provider_voice_id"):
                    ultravox_voice_data["provider_voice_id"] = voice.get("provider_voice_id")
                
                ultravox_response = await ultravox_client.create_voice(ultravox_voice_data)
                if ultravox_response and ultravox_response.get("id"):
                    db.update(
                        "voices",
                        {"id": agent["voice_id"]},
                        {"ultravox_voice_id": ultravox_response.get("id")},
                    )
                    voice["ultravox_voice_id"] = ultravox_response.get("id")
            except Exception as e:
                logger.error(f"Failed to create voice in Ultravox during sync: {e}", exc_info=True)
                error_msg = str(e)
                if "404" in error_msg:
                    error_msg = "Ultravox API endpoint not found. Please check ULTRAVOX_BASE_URL and ULTRAVOX_API_KEY configuration."
                elif "401" in error_msg or "403" in error_msg:
                    error_msg = "Ultravox API authentication failed. Please check your ULTRAVOX_API_KEY."
                elif "Ultravox API key is not configured" in error_msg:
                    error_msg = "Ultravox API key is not configured. Please set ULTRAVOX_API_KEY environment variable."
                raise ValidationError(f"Failed to sync voice with Ultravox: {error_msg}", {"error": str(e)})
        else:
            raise ValidationError("Ultravox API key not configured")
    
    # Now create agent in Ultravox
    from app.core.config import settings
    if not settings.ULTRAVOX_API_KEY:
        raise ValidationError("Ultravox API key not configured")
    
    try:
        # Get knowledge base corpus IDs
        corpus_ids = []
        if agent.get("knowledge_bases"):
            for kb_id in agent["knowledge_bases"]:
                kb = db.get_knowledge_base(kb_id, current_user["client_id"])
                if kb and kb.get("ultravox_corpus_id"):
                    corpus_ids.append(kb["ultravox_corpus_id"])
        
        ultravox_data = {
            "name": agent["name"],
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
            "tools": agent.get("tools", []),
        }
        
        ultravox_response = await ultravox_client.create_agent(ultravox_data)
        
        if ultravox_response and ultravox_response.get("id"):
            ultravox_agent_id = ultravox_response.get("id")
            # Update agent with Ultravox ID
            db.update(
                "agents",
                {"id": agent_id},
                {
                    "ultravox_agent_id": ultravox_agent_id,
                    "status": "active",
                    "updated_at": datetime.utcnow().isoformat(),
                },
            )
            agent["ultravox_agent_id"] = ultravox_agent_id
            agent["status"] = "active"
            
            return {
                "data": AgentResponse(**agent),
                "meta": ResponseMeta(
                    request_id=str(uuid.uuid4()),
                    ts=datetime.utcnow(),
                ),
                "message": "Agent successfully synced with Ultravox",
            }
        else:
            raise ValidationError("Failed to create agent in Ultravox - response missing ID")
    except Exception as e:
        logger.error(f"Failed to sync agent {agent_id} with Ultravox: {e}", exc_info=True)
        raise ValidationError("Failed to sync agent with Ultravox", {"error": str(e)})


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


@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Delete agent"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    agent = db.get_agent(agent_id, current_user["client_id"])
    if not agent:
        raise NotFoundError("agent", agent_id)
    
    # Delete from Ultravox if it exists there
    if agent.get("ultravox_agent_id"):
        try:
            from app.core.config import settings
            if settings.ULTRAVOX_API_KEY:
                # Note: Ultravox may not have a delete endpoint, but we'll try if it exists
                # For now, we'll just delete from our database
                logger.info(f"Agent {agent_id} has Ultravox ID {agent.get('ultravox_agent_id')}, but Ultravox deletion not implemented")
        except Exception as e:
            logger.warning(f"Failed to handle Ultravox deletion for agent {agent_id}: {e}")
    
    # Delete from database
    db.delete("agents", {"id": agent_id, "client_id": current_user["client_id"]})
    
    return {
        "data": {"id": agent_id, "deleted": True},
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

