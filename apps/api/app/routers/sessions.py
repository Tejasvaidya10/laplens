"""
Sessions endpoint
"""

from typing import List
from fastapi import APIRouter, Query

from app.models import Session
from app.services import fastf1_service, cache_service


router = APIRouter()


@router.get("", response_model=List[Session])
async def get_sessions(
    season: int = Query(..., ge=2018, le=2030),
    event: str = Query(..., min_length=1)
):
    """Get sessions for an event"""
    # Check cache
    cache_key = f"pitlane:sessions:{season}:{event}"
    cached = await cache_service.get_json(cache_key)
    if cached:
        return [Session(**s) for s in cached]
    
    # Fetch from FastF1
    sessions = fastf1_service.get_sessions(season, event)
    
    # Cache the result
    if sessions:
        await cache_service.set_json(
            cache_key,
            [s.model_dump(by_alias=True) for s in sessions],
            ttl=86400  # 24 hours
        )
    
    return sessions
