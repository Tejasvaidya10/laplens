"""
JWT authentication middleware for Supabase tokens
"""

from typing import Optional
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.config import settings


security = HTTPBearer(auto_error=False)


class AuthUser:
    """Authenticated user information"""
    
    def __init__(self, user_id: str, email: Optional[str] = None):
        self.user_id = user_id
        self.email = email


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[AuthUser]:
    """
    Get the current authenticated user from JWT token.
    Returns None if no token or invalid token.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    
    try:
        # Supabase JWT secret
        secret = settings.supabase_jwt_secret
        if not secret:
            # Try to use the service key as fallback for decoding
            # In production, you should always have the JWT secret set
            print("Warning: SUPABASE_JWT_SECRET not set")
            return None
        
        # Decode the JWT
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            return None
        
        return AuthUser(user_id=user_id, email=email)
    except JWTError as e:
        print(f"JWT validation error: {e}")
        return None


async def require_auth(
    user: Optional[AuthUser] = Depends(get_current_user)
) -> AuthUser:
    """
    Require authentication. Raises 401 if not authenticated.
    """
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_user_id_from_request(request: Request) -> Optional[str]:
    """
    Extract user ID from request headers (for rate limiting).
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header[7:]
    
    try:
        secret = settings.supabase_jwt_secret
        if not secret:
            return None
        
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        
        return payload.get("sub")
    except JWTError:
        return None
