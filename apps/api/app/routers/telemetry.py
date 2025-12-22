"""
Telemetry comparison endpoint
"""

from fastapi import APIRouter, HTTPException

from app.models import TelemetryComparison, TelemetryCompareRequest
from app.services import fastf1_service, cache_service
from app.services.storage_service import storage_service


router = APIRouter()


@router.post("/compare", response_model=TelemetryComparison)
async def compare_telemetry(request: TelemetryCompareRequest):
    """
    Compare telemetry between two drivers.
    
    Returns downsampled telemetry data for speed, throttle, brake, and gear traces,
    plus the lap time delta.
    """
    # Generate cache key
    cache_key = cache_service.telemetry_key(
        request.season,
        request.event,
        request.session,
        request.driver_a,
        request.driver_b,
        request.lap_a,
        request.lap_b,
    )
    
    # Check Redis cache first
    cached = await cache_service.get_json(cache_key)
    if cached:
        return TelemetryComparison(**cached)
    
    # Check storage for heavy artifacts
    if storage_service.is_enabled:
        storage_key = storage_service.telemetry_key(
            request.season,
            request.event,
            request.session,
            request.driver_a,
            request.driver_b,
            request.lap_a,
            request.lap_b,
        )
        
        stored_data = await storage_service.download_json(storage_key)
        if stored_data:
            # Cache in Redis for faster subsequent access
            await cache_service.set_json(cache_key, stored_data)
            return TelemetryComparison(**stored_data)
    
    # Fetch from FastF1
    try:
        comparison = fastf1_service.get_telemetry_comparison(
            request.season,
            request.event,
            request.session,
            request.driver_a,
            request.driver_b,
            request.lap_a,
            request.lap_b,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch telemetry: {str(e)}"
        )
    
    # Serialize for caching
    comparison_dict = comparison.model_dump(by_alias=True)
    
    # Store in Supabase Storage if enabled
    if storage_service.is_enabled:
        storage_key = storage_service.telemetry_key(
            request.season,
            request.event,
            request.session,
            request.driver_a,
            request.driver_b,
            request.lap_a,
            request.lap_b,
        )
        await storage_service.upload_json(storage_key, comparison_dict)
    
    # Cache in Redis
    await cache_service.set_json(cache_key, comparison_dict)
    
    return comparison
