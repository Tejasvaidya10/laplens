"""
Rate limiting middleware using Redis
"""

import time
from typing import Optional, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.services.cache_service import cache_service
from app.middleware.auth import get_user_id_from_request


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Redis-based rate limiting middleware.
    
    Uses sliding window counter pattern:
    - Anonymous users: 100 requests per minute
    - Authenticated users: 200 requests per minute
    """
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier
        client_id = self._get_client_id(request)
        is_authenticated = get_user_id_from_request(request) is not None
        
        # Check rate limit
        allowed, limit_info = await self._check_rate_limit(
            client_id,
            is_authenticated
        )
        
        if not allowed:
            return Response(
                content='{"error": "Rate limit exceeded"}',
                status_code=429,
                media_type="application/json",
                headers={
                    "X-RateLimit-Limit": str(limit_info[0]),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(limit_info[2]),
                    "Retry-After": str(limit_info[2] - int(time.time())),
                },
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(limit_info[0])
        response.headers["X-RateLimit-Remaining"] = str(limit_info[1])
        response.headers["X-RateLimit-Reset"] = str(limit_info[2])
        
        return response
    
    def _get_client_id(self, request: Request) -> str:
        """Get unique client identifier for rate limiting"""
        # Try to get user ID from JWT
        user_id = get_user_id_from_request(request)
        if user_id:
            return f"user:{user_id}"
        
        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"
        
        return f"ip:{ip}"
    
    async def _check_rate_limit(
        self,
        client_id: str,
        is_authenticated: bool
    ) -> Tuple[bool, Tuple[int, int, int]]:
        """
        Check if request is within rate limit.
        
        Returns:
            Tuple of (allowed, (limit, remaining, reset_time))
        """
        # Get limits based on auth status
        limit = (
            settings.rate_limit_authenticated_requests
            if is_authenticated
            else settings.rate_limit_requests
        )
        window = settings.rate_limit_window
        
        # Generate cache key
        current_window = int(time.time() / window)
        cache_key = f"ratelimit:{client_id}:{current_window}"
        
        try:
            # Increment counter
            count = await cache_service.incr(cache_key)
            
            # Set expiry on first request
            if count == 1:
                await cache_service.expire(cache_key, window)
            
            # Calculate remaining and reset time
            remaining = max(0, limit - count)
            reset_time = (current_window + 1) * window
            
            return (count <= limit, (limit, remaining, reset_time))
        except Exception as e:
            print(f"Rate limit check error: {e}")
            # On error, allow the request but log it
            return (True, (limit, limit, int(time.time()) + window))
