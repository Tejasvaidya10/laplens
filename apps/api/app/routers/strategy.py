"""
Strategy endpoint
"""

from fastapi import APIRouter, Query, HTTPException

from app.models import StrategyData
from app.services import fastf1_service, cache_service


router = APIRouter()


@router.get("", response_model=StrategyData)
async def get_strategy(
    season: int = Query(..., ge=2018, le=2030),
    event: str = Query(..., min_length=1),
    session: str = Query(..., min_length=1)
):
    """
    Get tire strategy data for a session.
    
    Returns stint information and pit stops for all drivers.
    """
    # Check cache
    cache_key = cache_service.strategy_key(season, event, session)
    cached = await cache_service.get_json(cache_key)
    if cached:
        return StrategyData(**cached)
    
    # Fetch from FastF1
    try:
        strategy = fastf1_service.get_strategy(season, event, session)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch strategy: {str(e)}"
        )
    
    # Cache the result
    strategy_dict = strategy.model_dump(by_alias=True)
    await cache_service.set_json(cache_key, strategy_dict)
    
    return strategy
