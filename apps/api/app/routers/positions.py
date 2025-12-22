"""
Positions endpoint
"""

from typing import List
from fastapi import APIRouter, Query, HTTPException

from app.models import PositionData
from app.services import fastf1_service, cache_service


router = APIRouter()


@router.get("", response_model=List[PositionData])
async def get_positions(
    season: int = Query(..., ge=2018, le=2030),
    event: str = Query(..., min_length=1),
    session: str = Query(..., min_length=1)
):
    """
    Get position history for all drivers in a session.
    
    Returns position changes lap by lap.
    """
    # Check cache
    cache_key = cache_service.positions_key(season, event, session)
    cached = await cache_service.get_json(cache_key)
    if cached:
        return [PositionData(**p) for p in cached]
    
    # Fetch from FastF1
    try:
        positions = fastf1_service.get_positions(season, event, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch positions: {str(e)}"
        )
    
    # Cache the result
    if positions:
        await cache_service.set_json(
            cache_key,
            [p.model_dump(by_alias=True) for p in positions]
        )
    
    return positions
