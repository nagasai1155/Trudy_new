"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1 import auth, voices, agents, knowledge_bases, calls, campaigns, webhooks, tools, telephony

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(voices.router, prefix="/voices", tags=["voices"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(knowledge_bases.router, prefix="/kb", tags=["knowledge-bases"])
api_router.include_router(calls.router, prefix="/calls", tags=["calls"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(tools.router, prefix="/tools", tags=["tools"])
api_router.include_router(telephony.router, prefix="/telephony", tags=["telephony"])

