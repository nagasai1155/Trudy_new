"""
Webhook Signature Verification and Delivery
"""
import hmac
import hashlib
import time
import json
from typing import Dict, Any, Optional
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


def verify_ultravox_signature(
    signature: str,
    timestamp: str,
    body: str,
    secret: str,
) -> bool:
    """Verify Ultravox webhook signature"""
    try:
        # Reconstruct message
        message = f"{timestamp}.{body}"
        
        # Calculate expected signature
        expected_signature = hmac.new(
            secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        
        # Constant-time comparison
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False


def verify_timestamp(timestamp: str, max_age_seconds: int = 300) -> bool:
    """Verify webhook timestamp (prevent replay attacks)"""
    try:
        ts = int(timestamp)
        current_time = int(time.time())
        
        # Check if timestamp is too old
        if current_time - ts > max_age_seconds:
            return False
        
        # Check if timestamp is too far in future (clock skew)
        if ts > current_time + 60:
            return False
        
        return True
    except (ValueError, TypeError):
        return False


def generate_webhook_signature(
    payload: Dict[str, Any],
    secret: str,
    timestamp: Optional[str] = None,
) -> tuple[str, str]:
    """Generate webhook signature for egress"""
    if timestamp is None:
        timestamp = str(int(time.time()))
    
    body = json.dumps(payload, sort_keys=True)
    message = f"{timestamp}.{body}"
    
    signature = hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    
    return signature, timestamp


async def deliver_webhook(
    url: str,
    payload: Dict[str, Any],
    secret: str,
    timeout: int = 10,
) -> tuple[bool, Optional[int], Optional[str]]:
    """
    Deliver webhook to client endpoint
    
    Returns:
        (success, status_code, error_message)
    """
    try:
        signature, timestamp = generate_webhook_signature(payload, secret)
        
        headers = {
            "Content-Type": "application/json",
            "X-Trudy-Timestamp": timestamp,
            "X-Trudy-Signature": signature,
        }
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if 200 <= response.status_code < 300:
                return True, response.status_code, None
            else:
                return False, response.status_code, response.text[:500]
                
    except httpx.TimeoutException:
        return False, None, "Request timeout"
    except Exception as e:
        logger.error(f"Webhook delivery error: {e}")
        return False, None, str(e)

