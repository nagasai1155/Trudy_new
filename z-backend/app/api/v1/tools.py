"""
Tool Endpoints
"""
from fastapi import APIRouter, Header, Depends
from typing import Optional
from datetime import datetime
import uuid

from app.core.auth import get_current_user
from app.core.database import DatabaseService
from app.core.exceptions import NotFoundError, ForbiddenError
from app.services.ultravox import ultravox_client
from app.models.schemas import (
    ToolCreate,
    ToolResponse,
    ResponseMeta,
)

router = APIRouter()


@router.post("")
async def create_tool(
    tool_data: ToolCreate,
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """Create tool"""
    if current_user["role"] not in ["client_admin", "agency_admin"]:
        raise ForbiddenError("Insufficient permissions")
    
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    # Create tool record
    tool_id = str(uuid.uuid4())
    tool_record = {
        "id": tool_id,
        "client_id": current_user["client_id"],
        "name": tool_data.name,
        "description": tool_data.description,
        "category": tool_data.category,
        "endpoint": tool_data.endpoint,
        "method": tool_data.method,
        "authentication": tool_data.authentication or {},
        "parameters": tool_data.parameters or {},
        "response_schema": tool_data.response_schema or {},
        "status": "creating",
    }
    
    db.insert("tools", tool_record)
    
    # Call Ultravox API
    try:
        ultravox_data = {
            "name": tool_data.name,
            "description": tool_data.description,
            "endpoint": tool_data.endpoint,
            "method": tool_data.method,
            "authentication": tool_data.authentication,
            "parameters": tool_data.parameters,
            "response_schema": tool_data.response_schema,
        }
        ultravox_response = await ultravox_client.create_tool(ultravox_data)
        
        # Update with Ultravox ID
        db.update(
            "tools",
            {"id": tool_id},
            {
                "ultravox_tool_id": ultravox_response.get("id"),
                "status": "active",
            },
        )
        tool_record["ultravox_tool_id"] = ultravox_response.get("id")
        tool_record["status"] = "active"
        
    except Exception as e:
        db.update(
            "tools",
            {"id": tool_id},
            {"status": "failed"},
        )
        raise
    
    return {
        "data": ToolResponse(**tool_record),
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }


@router.get("")
async def list_tools(
    current_user: dict = Depends(get_current_user),
    x_client_id: Optional[str] = Header(None),
):
    """List tools"""
    db = DatabaseService(current_user["token"])
    db.set_auth(current_user["token"])
    
    tools = db.select("tools", {"client_id": current_user["client_id"]})
    
    return {
        "data": [ToolResponse(**tool) for tool in tools],
        "meta": ResponseMeta(
            request_id=str(uuid.uuid4()),
            ts=datetime.utcnow(),
        ),
    }

