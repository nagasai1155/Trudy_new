"""
EventBridge Event Publishing Service
"""
import json
import logging
import boto3
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

_eventbridge_client = None


def get_eventbridge_client():
    """Get or create EventBridge client"""
    global _eventbridge_client
    
    if _eventbridge_client is None:
        try:
            _eventbridge_client = boto3.client(
                "events",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
        except Exception as e:
            logger.warning(f"Failed to create EventBridge client: {e}. Events will be logged only.")
            _eventbridge_client = None
    
    return _eventbridge_client


async def publish_event(
    event_type: str,
    event_data: Dict[str, Any],
    source: str = "trudy-backend",
) -> bool:
    """
    Publish event to EventBridge
    
    Args:
        event_type: Event type (e.g., "voice.training.completed")
        event_data: Event payload
        source: Event source (default: "trudy-backend")
    
    Returns:
        True if published successfully, False otherwise
    """
    client = get_eventbridge_client()
    
    if not client:
        # Log event if EventBridge is not configured
        logger.info(
            f"Event (EventBridge not configured): {event_type}",
            extra={"event_type": event_type, "event_data": event_data},
        )
        return False
    
    try:
        # Create EventBridge event
        event = {
            "Source": source,
            "DetailType": event_type,
            "Detail": json.dumps(event_data),
            "Time": datetime.utcnow(),
        }
        
        # Publish to default event bus
        response = client.put_events(Entries=[event])
        
        if response.get("FailedEntryCount", 0) > 0:
            logger.error(f"Failed to publish event {event_type}: {response.get('Entries', [])}")
            return False
        
        logger.info(
            f"Published event: {event_type}",
            extra={"event_type": event_type, "event_id": response.get("Entries", [{}])[0].get("EventId")},
        )
        return True
        
    except Exception as e:
        logger.error(f"Error publishing event {event_type}: {e}")
        return False


# Convenience functions for common event types
async def emit_voice_training_started(voice_id: str, client_id: str, ultravox_voice_id: str) -> bool:
    """Emit voice.training.started event"""
    return await publish_event(
        "voice.training.started",
        {
            "voice_id": voice_id,
            "client_id": client_id,
            "ultravox_voice_id": ultravox_voice_id,
            "status": "training",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_voice_training_completed(voice_id: str, client_id: str, ultravox_voice_id: str) -> bool:
    """Emit voice.training.completed event"""
    return await publish_event(
        "voice.training.completed",
        {
            "voice_id": voice_id,
            "client_id": client_id,
            "ultravox_voice_id": ultravox_voice_id,
            "status": "active",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_voice_training_failed(voice_id: str, client_id: str, ultravox_voice_id: str, error_message: str) -> bool:
    """Emit voice.training.failed event"""
    return await publish_event(
        "voice.training.failed",
        {
            "voice_id": voice_id,
            "client_id": client_id,
            "ultravox_voice_id": ultravox_voice_id,
            "status": "failed",
            "error_message": error_message,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_voice_created(voice_id: str, client_id: str, ultravox_voice_id: str) -> bool:
    """Emit voice.created event"""
    return await publish_event(
        "voice.created",
        {
            "voice_id": voice_id,
            "client_id": client_id,
            "ultravox_voice_id": ultravox_voice_id,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_agent_created(agent_id: str, client_id: str, ultravox_agent_id: str) -> bool:
    """Emit agent.created event"""
    return await publish_event(
        "agent.created",
        {
            "agent_id": agent_id,
            "client_id": client_id,
            "ultravox_agent_id": ultravox_agent_id,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_agent_updated(agent_id: str, client_id: str, changes: Dict[str, Any]) -> bool:
    """Emit agent.updated event"""
    return await publish_event(
        "agent.updated",
        {
            "agent_id": agent_id,
            "client_id": client_id,
            "changes": changes,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_call_created(call_id: str, client_id: str, agent_id: str, ultravox_call_id: str, phone_number: str, direction: str) -> bool:
    """Emit call.created event"""
    return await publish_event(
        "call.created",
        {
            "call_id": call_id,
            "client_id": client_id,
            "agent_id": agent_id,
            "ultravox_call_id": ultravox_call_id,
            "phone_number": phone_number,
            "direction": direction,
            "status": "queued",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_call_started(call_id: str, client_id: str) -> bool:
    """Emit call.started event"""
    return await publish_event(
        "call.started",
        {
            "call_id": call_id,
            "client_id": client_id,
            "status": "in_progress",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_call_completed(call_id: str, client_id: str, duration_seconds: Optional[int] = None, cost_usd: Optional[float] = None) -> bool:
    """Emit call.completed event"""
    return await publish_event(
        "call.completed",
        {
            "call_id": call_id,
            "client_id": client_id,
            "status": "completed",
            "duration_seconds": duration_seconds,
            "cost_usd": cost_usd,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_call_failed(call_id: str, client_id: str, error_message: Optional[str] = None) -> bool:
    """Emit call.failed event"""
    return await publish_event(
        "call.failed",
        {
            "call_id": call_id,
            "client_id": client_id,
            "status": "failed",
            "error_message": error_message,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_campaign_created(campaign_id: str, client_id: str, agent_id: str, name: str) -> bool:
    """Emit campaign.created event"""
    return await publish_event(
        "campaign.created",
        {
            "campaign_id": campaign_id,
            "client_id": client_id,
            "agent_id": agent_id,
            "name": name,
            "status": "draft",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_campaign_scheduled(campaign_id: str, client_id: str, scheduled_at: str, contact_count: int, batch_ids: list) -> bool:
    """Emit campaign.scheduled event"""
    return await publish_event(
        "campaign.scheduled",
        {
            "campaign_id": campaign_id,
            "client_id": client_id,
            "scheduled_at": scheduled_at,
            "contact_count": contact_count,
            "batch_ids": batch_ids,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_campaign_completed(campaign_id: str, client_id: str, stats: Dict[str, int]) -> bool:
    """Emit campaign.completed event"""
    return await publish_event(
        "campaign.completed",
        {
            "campaign_id": campaign_id,
            "client_id": client_id,
            "stats": stats,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_knowledge_base_created(kb_id: str, client_id: str, ultravox_corpus_id: str) -> bool:
    """Emit knowledge_base.created event"""
    return await publish_event(
        "knowledge_base.created",
        {
            "knowledge_base_id": kb_id,
            "client_id": client_id,
            "ultravox_corpus_id": ultravox_corpus_id,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_knowledge_base_ingestion_started(kb_id: str, client_id: str, document_ids: list) -> bool:
    """Emit knowledge_base.ingestion.started event"""
    return await publish_event(
        "knowledge_base.ingestion.started",
        {
            "knowledge_base_id": kb_id,
            "client_id": client_id,
            "document_ids": document_ids,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


async def emit_credits_purchased(client_id: str, amount: float, credits: int, transaction_id: str) -> bool:
    """Emit credits.purchased event"""
    return await publish_event(
        "credits.purchased",
        {
            "client_id": client_id,
            "amount": amount,
            "credits": credits,
            "transaction_id": transaction_id,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )

