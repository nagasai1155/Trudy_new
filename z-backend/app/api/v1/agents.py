"""
Agent Endpoints
"""
from fastapi import APIRouter, Header, Depends
from typing import Optional
from datetime import datetime
import uuid

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError
from app.services.ultravox import ultravox_client
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
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Create agent"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Validate voice
    voice = db.get_voice(agent_data.voice_id, current_user["client_id"])
    if not voice:
        raise NotFoundError("voice", agent_data.voice_id)
    if voice.get("status") != "active":
        raise ValidationError("Voice must be active", {"voice_id": agent_data.voice_id, "voice_status": voice.get("status")})
    
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
    agent_record = {
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
    }
    
    db.insert("agents", agent_record)
    
    # Call Ultravox API
    try:
        # Get knowledge base corpus IDs
        corpus_ids = []
        if agent_data.knowledge_bases:
            for kb_id in agent_data.knowledge_bases:
                kb = db.get_knowledge_base(kb_id, current_user["client_id"])
                if kb.get("ultravox_corpus_id"):
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
        
        # Update with Ultravox ID
        db.update(
            "agents",
            {"id": agent_id},
            {
                "ultravox_agent_id": ultravox_response.get("id"),
                "status": "active",
            },
        )
        agent_record["ultravox_agent_id"] = ultravox_response.get("id")
        agent_record["status"] = "active"
        
    except Exception as e:
        db.update(
            "agents",
            {"id": agent_id},
            {"status": "failed"},
        )
        raise
    
    return {
        "data": AgentResponse(**agent_record),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


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

