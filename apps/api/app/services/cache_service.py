"""
Cache service using Redis (Upstash or local)
Falls back to in-memory cache for local development
"""

import json
import hashlib
from typing import Optional, Any, Dict
from datetime import datetime
import redis.asyncio as redis

from app.config import settings


class InMemoryCache:
    """Simple in-memory cache fallback for local dev"""
    
    def __init__(self):
        self._cache: Dict[str, tuple[Any, float]] = {}
    
    async def get(self, key: str) -> Optional[str]:
        if key in self._cache:
            value, expires = self._cache[key]
            if expires > datetime.now().timestamp():
                return value
            del self._cache[key]
        return None
    
    async def set(self, key: str, value: str, ex: int = 3600) -> None:
        expires = datetime.now().timestamp() + ex
        self._cache[key] = (value, expires)
    
    async def delete(self, key: str) -> None:
        self._cache.pop(key, None)
    
    async def exists(self, key: str) -> bool:
        return await self.get(key) is not None
    
    async def incr(self, key: str) -> int:
        current = await self.get(key)
        new_val = int(current or 0) + 1
        # Keep existing TTL or set default
        if key in self._cache:
            _, expires = self._cache[key]
            ttl = int(expires - datetime.now().timestamp())
            await self.set(key, str(new_val), ex=max(ttl, 1))
        else:
            await self.set(key, str(new_val), ex=60)
        return new_val
    
    async def expire(self, key: str, seconds: int) -> None:
        if key in self._cache:
            value, _ = self._cache[key]
            expires = datetime.now().timestamp() + seconds
            self._cache[key] = (value, expires)
    
    async def ttl(self, key: str) -> int:
        if key in self._cache:
            _, expires = self._cache[key]
            return max(0, int(expires - datetime.now().timestamp()))
        return -1


class CacheService:
    """Redis cache service with in-memory fallback"""
    
    def __init__(self):
        self._redis: Optional[redis.Redis] = None
        self._fallback = InMemoryCache()
        self._use_fallback = False
    
    async def connect(self) -> None:
        """Connect to Redis"""
        if settings.redis_url:
            try:
                self._redis = redis.from_url(
                    settings.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                )
                # Test connection
                await self._redis.ping()
                print("✅ Connected to Redis")
            except Exception as e:
                print(f"⚠️ Redis connection failed: {e}")
                print("📦 Using in-memory cache fallback")
                self._use_fallback = True
        else:
            print("📦 No Redis URL configured, using in-memory cache")
            self._use_fallback = True
    
    async def disconnect(self) -> None:
        """Disconnect from Redis"""
        if self._redis:
            await self._redis.close()
    
    @property
    def _client(self):
        """Get the active cache client"""
        if self._use_fallback or not self._redis:
            return self._fallback
        return self._redis
    
    def _generate_key(self, *parts: str) -> str:
        """Generate a cache key from parts"""
        key = ":".join(str(p) for p in parts)
        return f"pitlane:{key}"
    
    def _hash_key(self, key: str) -> str:
        """Hash a key if too long"""
        if len(key) > 200:
            return f"pitlane:hash:{hashlib.sha256(key.encode()).hexdigest()}"
        return key
    
    async def get(self, key: str) -> Optional[str]:
        """Get a value from cache"""
        try:
            return await self._client.get(self._hash_key(key))
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    async def get_json(self, key: str) -> Optional[Any]:
        """Get and deserialize JSON from cache"""
        value = await self.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return None
        return None
    
    async def set(
        self,
        key: str,
        value: str,
        ttl: Optional[int] = None
    ) -> None:
        """Set a value in cache"""
        try:
            await self._client.set(
                self._hash_key(key),
                value,
                ex=ttl or settings.cache_ttl_seconds
            )
        except Exception as e:
            print(f"Cache set error: {e}")
    
    async def set_json(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> None:
        """Serialize and set JSON in cache"""
        await self.set(key, json.dumps(value), ttl)
    
    async def delete(self, key: str) -> None:
        """Delete a key from cache"""
        try:
            await self._client.delete(self._hash_key(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists"""
        try:
            return await self._client.exists(self._hash_key(key))
        except Exception as e:
            print(f"Cache exists error: {e}")
            return False
    
    # Rate limiting helpers
    async def incr(self, key: str) -> int:
        """Increment a counter"""
        try:
            return await self._client.incr(self._hash_key(key))
        except Exception as e:
            print(f"Cache incr error: {e}")
            return 1
    
    async def expire(self, key: str, seconds: int) -> None:
        """Set expiration on a key"""
        try:
            await self._client.expire(self._hash_key(key), seconds)
        except Exception as e:
            print(f"Cache expire error: {e}")
    
    async def ttl(self, key: str) -> int:
        """Get TTL of a key"""
        try:
            return await self._client.ttl(self._hash_key(key))
        except Exception as e:
            print(f"Cache ttl error: {e}")
            return -1
    
    # Telemetry-specific cache keys
    def telemetry_key(
        self,
        season: int,
        event: str,
        session: str,
        driver_a: str,
        driver_b: str,
        lap_a: Optional[int] = None,
        lap_b: Optional[int] = None
    ) -> str:
        """Generate cache key for telemetry comparison"""
        lap_a_str = str(lap_a) if lap_a else "fastest"
        lap_b_str = str(lap_b) if lap_b else "fastest"
        return self._generate_key(
            "telemetry",
            str(season),
            event,
            session,
            driver_a,
            driver_b,
            lap_a_str,
            lap_b_str
        )
    
    def strategy_key(self, season: int, event: str, session: str) -> str:
        """Generate cache key for strategy data"""
        return self._generate_key("strategy", str(season), event, session)
    
    def positions_key(self, season: int, event: str, session: str) -> str:
        """Generate cache key for position data"""
        return self._generate_key("positions", str(season), event, session)
    
    def track_evolution_key(self, season: int, event: str, session: str) -> str:
        """Generate cache key for track evolution data"""
        return self._generate_key("track_evolution", str(season), event, session)


# Global cache service instance
cache_service = CacheService()
