"""
Drivers endpoint
"""

from typing import List
from fastapi import APIRouter, Query, HTTPException

from app.models import Driver
from app.services import fastf1_service, cache_service


router = APIRouter()


@router.get("", response_model=List[Driver])
async def get_drivers(
    season: int = Query(..., ge=2018, le=2030),
    event: str = Query(..., min_length=1),
    session: str = Query(..., min_length=1)
):
    """Get drivers for a session"""
    # Check cache
    cache_key = f"pitlane:drivers:{season}:{event}:{session}"
    cached = await cache_service.get_json(cache_key)
    if cached:
        return [Driver(**d) for d in cached]
    
    # Fetch from FastF1
    try:
        drivers = fastf1_service.get_drivers(season, event, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch drivers: {str(e)}"
        )
    
    # Cache the result
    if drivers:
        await cache_service.set_json(
            cache_key,
            [d.model_dump(by_alias=True) for d in drivers],
            ttl=86400  # 24 hours
        )
    
    return drivers
