"""
JWT Authentication and Authorization - Google OAuth
"""
import jwt  # PyJWT library
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException
import httpx
import logging
from app.core.config import settings
from app.core.exceptions import UnauthorizedError, ForbiddenError
from uuid import UUID

logger = logging.getLogger(__name__)

# Cache for Google JWKs
_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_cache_expiry: Optional[float] = None


async def get_jwks() -> Dict[str, Any]:
    """Fetch JWKs from Google"""
    global _jwks_cache, _jwks_cache_expiry
    import time
    
    # Check cache
    if _jwks_cache and _jwks_cache_expiry and time.time() < _jwks_cache_expiry:
        return _jwks_cache
    
    # Fetch from Google
    jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(jwks_url, timeout=5.0)
            response.raise_for_status()
            _jwks_cache = response.json()
            _jwks_cache_expiry = time.time() + 3600  # Cache for 1 hour
            return _jwks_cache
    except Exception as e:
        logger.error(f"Failed to fetch Google JWKs: {e}")
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
    """Verify Google OAuth JWT token and return claims"""
    try:
        # Get Google JWKs
        jwks = await get_jwks()
        
        # Decode header to find key ID
        unverified_header = jwt.get_unverified_header(token)
        
        # Find matching key
        matching_key = None
        for key in jwks.get("keys", []):
            if key["kid"] == unverified_header["kid"]:
                matching_key = key
                break
        
        if not matching_key:
            raise UnauthorizedError("Unable to find appropriate key")
        
        # Convert JWK to RSA public key for PyJWT
        from cryptography.hazmat.primitives.asymmetric import rsa
        import base64
        
        def base64url_decode(value: str) -> bytes:
            """Decode base64url encoded string"""
            padding = 4 - len(value) % 4
            if padding != 4:
                value += "=" * padding
            return base64.urlsafe_b64decode(value)
        
        # Decode JWK values
        n_bytes = base64url_decode(matching_key["n"])
        e_bytes = base64url_decode(matching_key["e"])
        n_int = int.from_bytes(n_bytes, "big")
        e_int = int.from_bytes(e_bytes, "big")
        
        # Create RSA public key
        public_numbers = rsa.RSAPublicNumbers(e_int, n_int)
        public_key = public_numbers.public_key()
        
        # Decode and verify token with PyJWT
        # PyJWT doesn't verify at_hash unless access_token is provided
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.GOOGLE_CLIENT_ID,
            issuer=settings.GOOGLE_ISSUER,
        )
        
        return claims
        
    except jwt.InvalidTokenError as e:
        logger.warning(f"JWT verification failed: {e}")
        raise UnauthorizedError("Invalid or expired token")
    except Exception as e:
        logger.error(f"JWT verification error: {e}")
        raise UnauthorizedError("Token verification failed")


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_client_id: Optional[str] = Header(None),
) -> Dict[str, Any]:
    """Get current user from Google OAuth token"""
    # Extract and verify token
    token = get_jwt_header(authorization)
    claims = await verify_jwt(token)
    
    # Extract user info from Google OAuth token
    user_id = claims.get("sub")  # Google user ID
    email = claims.get("email")
    name = claims.get("name", "")
    picture = claims.get("picture", "")
    
    def _normalize_uuid(value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        try:
            return str(UUID(str(value)))
        except (ValueError, TypeError):
            return None
    
    normalized_header_client_id = _normalize_uuid(x_client_id)
    
    if not user_id:
        raise UnauthorizedError("Invalid token: missing user ID")
    
    # Try to get user from database to get client_id and role
    # Use admin client to bypass RLS for this lookup
    from app.core.database import get_supabase_admin_client
    admin_db = get_supabase_admin_client()
    
    user_record = admin_db.table("users").select("*").eq("auth0_sub", user_id).execute()
    user_data = user_record.data[0] if user_record.data else None
    
    client_id = None
    role = "client_user"
    
    if user_data:
        # User exists, get client_id and role from database
        client_id = user_data.get("client_id")
        role = user_data.get("role", "client_user")
    elif normalized_header_client_id:
        # User doesn't exist yet, but client_id provided in header
        # This will be handled in /auth/me endpoint
        client_id = normalized_header_client_id
    
    # If header client_id provided, validate it matches database (unless agency_admin)
    if normalized_header_client_id and client_id:
        if role != "agency_admin" and normalized_header_client_id != client_id:
            raise ForbiddenError("client_id mismatch")
        client_id = normalized_header_client_id
    
    return {
        "user_id": user_id,
        "client_id": client_id,  # From database or header
        "role": role,  # From database
        "email": email,
        "name": name,
        "picture": picture,
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

