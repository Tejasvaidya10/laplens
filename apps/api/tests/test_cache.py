"""
Tests for caching functionality
"""

import pytest
from unittest.mock import AsyncMock, patch

from app.services.cache_service import CacheService, InMemoryCache


@pytest.fixture
def memory_cache():
    """Create in-memory cache for testing"""
    return InMemoryCache()


@pytest.mark.asyncio
async def test_memory_cache_set_get(memory_cache):
    """Test in-memory cache set and get"""
    await memory_cache.set("test_key", "test_value", ex=60)
    result = await memory_cache.get("test_key")
    assert result == "test_value"


@pytest.mark.asyncio
async def test_memory_cache_expiry(memory_cache):
    """Test in-memory cache expiry"""
    await memory_cache.set("test_key", "test_value", ex=0)
    result = await memory_cache.get("test_key")
    assert result is None


@pytest.mark.asyncio
async def test_memory_cache_delete(memory_cache):
    """Test in-memory cache delete"""
    await memory_cache.set("test_key", "test_value", ex=60)
    await memory_cache.delete("test_key")
    result = await memory_cache.get("test_key")
    assert result is None


@pytest.mark.asyncio
async def test_memory_cache_exists(memory_cache):
    """Test in-memory cache exists"""
    await memory_cache.set("test_key", "test_value", ex=60)
    assert await memory_cache.exists("test_key") is True
    assert await memory_cache.exists("nonexistent") is False


@pytest.mark.asyncio
async def test_memory_cache_incr(memory_cache):
    """Test in-memory cache increment"""
    result1 = await memory_cache.incr("counter")
    assert result1 == 1
    
    result2 = await memory_cache.incr("counter")
    assert result2 == 2


@pytest.mark.asyncio
async def test_cache_service_key_generation():
    """Test cache key generation"""
    service = CacheService()
    
    key = service.telemetry_key(
        season=2024,
        event="Bahrain",
        session="R",
        driver_a="VER",
        driver_b="HAM",
        lap_a=10,
        lap_b=15
    )
    
    assert "pitlane" in key
    assert "telemetry" in key
    assert "2024" in key
    assert "Bahrain" in key
    assert "VER" in key
    assert "HAM" in key


@pytest.mark.asyncio
async def test_cache_service_strategy_key():
    """Test strategy cache key generation"""
    service = CacheService()
    
    key = service.strategy_key(
        season=2024,
        event="Monaco",
        session="R"
    )
    
    assert "pitlane" in key
    assert "strategy" in key
    assert "2024" in key
    assert "Monaco" in key


@pytest.mark.asyncio
async def test_cache_service_positions_key():
    """Test positions cache key generation"""
    service = CacheService()
    
    key = service.positions_key(
        season=2024,
        event="Silverstone",
        session="R"
    )
    
    assert "pitlane" in key
    assert "positions" in key
    assert "2024" in key
    assert "Silverstone" in key


@pytest.mark.asyncio
async def test_cache_service_fallback():
    """Test cache service uses fallback without Redis"""
    service = CacheService()
    service._use_fallback = True
    
    # Should not raise errors without Redis
    await service.set("test", "value")
    result = await service.get("test")
    assert result == "value"


@pytest.mark.asyncio
async def test_cache_service_json():
    """Test JSON serialization in cache"""
    service = CacheService()
    service._use_fallback = True
    
    data = {"key": "value", "number": 123, "nested": {"a": 1}}
    
    await service.set_json("json_test", data)
    result = await service.get_json("json_test")
    
    assert result == data
