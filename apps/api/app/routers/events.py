"""
Events endpoint
"""

from typing import List
from fastapi import APIRouter, Query

from app.models import Event
from app.services import fastf1_service, cache_service


router = APIRouter()


@router.get("", response_model=List[Event])
async def get_events(season: int = Query(..., ge=2018, le=2030)):
    """Get events for a season"""
    # Check cache
    cache_key = f"pitlane:events:{season}"
    cached = await cache_service.get_json(cache_key)
    if cached:
        return [Event(**e) for e in cached]
    
    # Fetch from FastF1
    events = fastf1_service.get_events(season)
    
    # Cache the result
    if events:
        await cache_service.set_json(
            cache_key,
            [e.model_dump(by_alias=True) for e in events],
            ttl=86400  # 24 hours
        )
    
    return events
