"""
Saved analyses endpoints (requires authentication)
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.models import SavedAnalysis, SavedAnalysisCreate
from app.services import supabase_service
from app.middleware.auth import AuthUser, require_auth


router = APIRouter()


@router.post("", response_model=SavedAnalysis)
async def create_saved_analysis(
    data: SavedAnalysisCreate,
    user: AuthUser = Depends(require_auth)
):
    """Create a new saved analysis"""
    if not supabase_service.is_enabled:
        raise HTTPException(
            status_code=503,
            detail="Database not configured"
        )
    
    analysis = await supabase_service.create_saved_analysis(
        user_id=user.user_id,
        data=data,
    )
    
    if not analysis:
        raise HTTPException(
            status_code=500,
            detail="Failed to create saved analysis"
        )
    
    return analysis


@router.get("", response_model=List[SavedAnalysis])
async def get_saved_analyses(user: AuthUser = Depends(require_auth)):
    """Get all saved analyses for the current user"""
    if not supabase_service.is_enabled:
        raise HTTPException(
            status_code=503,
            detail="Database not configured"
        )
    
    return await supabase_service.get_saved_analyses(user.user_id)


@router.get("/{analysis_id}", response_model=SavedAnalysis)
async def get_saved_analysis(
    analysis_id: str,
    user: AuthUser = Depends(require_auth)
):
    """Get a specific saved analysis"""
    if not supabase_service.is_enabled:
        raise HTTPException(
            status_code=503,
            detail="Database not configured"
        )
    
    analysis = await supabase_service.get_saved_analysis(
        analysis_id=analysis_id,
        user_id=user.user_id,
    )
    
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Saved analysis not found"
        )
    
    return analysis


@router.delete("/{analysis_id}")
async def delete_saved_analysis(
    analysis_id: str,
    user: AuthUser = Depends(require_auth)
):
    """Delete a saved analysis"""
    if not supabase_service.is_enabled:
        raise HTTPException(
            status_code=503,
            detail="Database not configured"
        )
    
    success = await supabase_service.delete_saved_analysis(
        analysis_id=analysis_id,
        user_id=user.user_id,
    )
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Saved analysis not found"
        )
    
    return {"message": "Deleted successfully"}
