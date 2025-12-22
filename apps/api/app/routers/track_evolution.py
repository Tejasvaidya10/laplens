"""
Track evolution endpoint
"""

from fastapi import APIRouter, Query, HTTPException

from app.models import TrackEvolution
from app.services import fastf1_service, cache_service


router = APIRouter()


@router.get("", response_model=TrackEvolution)
async def get_track_evolution(
    season: int = Query(..., ge=2018, le=2030),
    event: str = Query(..., min_length=1),
    session: str = Query(..., min_length=1)
):
    """
    Get track evolution data showing how lap times improved during a session.
    
    Returns best lap time progression and an improvement rate indicator.
    """
    # Check cache
    cache_key = cache_service.track_evolution_key(season, event, session)
    cached = await cache_service.get_json(cache_key)
    if cached:
        return TrackEvolution(**cached)
    
    # Fetch from FastF1
    try:
        evolution = fastf1_service.get_track_evolution(season, event, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch track evolution: {str(e)}"
        )
    
    # Cache the result
    evolution_dict = evolution.model_dump(by_alias=True)
    await cache_service.set_json(cache_key, evolution_dict)
    
    return evolution
