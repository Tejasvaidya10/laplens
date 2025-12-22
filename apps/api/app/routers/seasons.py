"""
Seasons endpoint
"""

from typing import List
from fastapi import APIRouter

from app.models import Season
from app.services import fastf1_service


router = APIRouter()


@router.get("", response_model=List[Season])
async def get_seasons():
    """Get available F1 seasons"""
    return fastf1_service.get_seasons()
