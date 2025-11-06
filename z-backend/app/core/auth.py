"""
JWT Authentication and Authorization
"""
import jwt
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException
from jose import jwt as jose_jwt, JWTError
from jose.utils import base64url_decode
import httpx
import logging
from app.core.config import settings
from app.core.exceptions import UnauthorizedError, ForbiddenError

logger = logging.getLogger(__name__)

# Cache for JWKs
_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_cache_expiry: Optional[float] = None


async def get_jwks() -> Dict[str, Any]:
    """Fetch JWKs from Auth0"""
    global _jwks_cache, _jwks_cache_expiry
    import time
    
    # Check cache
    if _jwks_cache and _jwks_cache_expiry and time.time() < _jwks_cache_expiry:
        return _jwks_cache
    
    # Fetch from Auth0
    jwks_url = f"{settings.JWT_ISSUER}/.well-known/jwks.json"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url, timeout=5.0)
            response.raise_for_status()
            _jwks_cache = response.json()
            _jwks_cache_expiry = time.time() + 3600  # Cache for 1 hour
            return _jwks_cache
    except Exception as e:
        logger.error(f"Failed to fetch JWKs: {e}")
        if _jwks_cache:
            return _jwks_cache  # Use stale cache as fallback
        raise UnauthorizedError("Failed to fetch authentication keys")


def get_jwt_header(authorization: Optional[str] = Header(None)) -> str:
    """Extract JWT token from Authorization header"""
    if not authorization:
        raise UnauthorizedError("Missing Authorization header")
    
    if not authorization.startswith("Bearer "):
        raise UnauthorizedError("Invalid Authorization header format")
    
    return authorization[7:]  # Remove "Bearer " prefix


async def verify_jwt(token: str) -> Dict[str, Any]:
    """Verify JWT token and return claims"""
    try:
        # Get JWKs
        jwks = await get_jwks()
        
        # Decode header
        unverified_header = jwt.get_unverified_header(token)
        
        # Find matching key
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
                break
        
        if not rsa_key:
            raise UnauthorizedError("Unable to find appropriate key")
        
        # Verify token
        claims = jose_jwt.decode(
            token,
            rsa_key,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER,
        )
        
        return claims
        
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise UnauthorizedError("Invalid or expired token")
    except Exception as e:
        logger.error(f"JWT verification error: {e}")
        raise UnauthorizedError("Token verification failed")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_client_id: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """Get current user from JWT token"""
    # Extract and verify token
    token = get_jwt_header(authorization)
    claims = await verify_jwt(token)
    
    # Extract user info
    user_id = claims.get("sub")
    client_id = claims.get("client_id")
    role = claims.get("role", "client_user")
    email = claims.get("email")
    
    if not user_id:
        raise UnauthorizedError("Invalid token: missing user ID")
    
    # Validate client_id header matches JWT (unless agency_admin)
    if role != "agency_admin":
        if not x_client_id:
            raise UnauthorizedError("Missing x-client-id header")
        if x_client_id != client_id:
            raise ForbiddenError("client_id mismatch")
    
    # Note: request.state is set by middleware after authentication
    # The logging middleware will extract client_id/user_id from the request
    
    return {
        "user_id": user_id,
        "client_id": client_id or x_client_id,
        "role": role,
        "email": email,
        "token": token,
        "claims": claims,
    }


def require_role(required_roles: list[str]):
    """Decorator to require specific roles"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            user = kwargs.get("current_user")
            if not user:
                raise UnauthorizedError("Authentication required")
            
            user_role = user.get("role")
            if user_role not in required_roles and user_role != "agency_admin":
                raise ForbiddenError(f"Requires one of: {', '.join(required_roles)}")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

