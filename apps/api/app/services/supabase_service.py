"""
Supabase service for database operations (saved analyses)
"""

from typing import List, Optional
from datetime import datetime
import uuid
from supabase import create_client, Client

from app.config import settings
from app.models import SavedAnalysis, SavedAnalysisCreate


class SupabaseService:
    """Supabase database service"""
    
    def __init__(self):
        self._client: Optional[Client] = None
    
    def _get_client(self) -> Optional[Client]:
        """Get or create Supabase client"""
        if self._client is None and self._can_initialize():
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_service_key,
            )
        return self._client
    
    def _can_initialize(self) -> bool:
        """Check if Supabase can be initialized"""
        return all([
            settings.supabase_url,
            settings.supabase_service_key,
        ])
    
    @property
    def is_enabled(self) -> bool:
        """Check if Supabase is enabled"""
        return self._get_client() is not None
    
    async def create_saved_analysis(
        self,
        user_id: str,
        data: SavedAnalysisCreate
    ) -> Optional[SavedAnalysis]:
        """Create a new saved analysis"""
        client = self._get_client()
        if not client:
            return None
        
        try:
            now = datetime.utcnow().isoformat()
            record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": data.name,
                "season": data.season,
                "event": data.event,
                "session": data.session,
                "driver_a": data.driver_a,
                "driver_b": data.driver_b,
                "lap_a": data.lap_a,
                "lap_b": data.lap_b,
                "created_at": now,
                "updated_at": now,
            }
            
            result = client.table("saved_analyses").insert(record).execute()
            
            if result.data:
                return self._row_to_model(result.data[0])
            return None
        except Exception as e:
            print(f"Supabase create error: {e}")
            return None
    
    async def get_saved_analyses(self, user_id: str) -> List[SavedAnalysis]:
        """Get all saved analyses for a user"""
        client = self._get_client()
        if not client:
            return []
        
        try:
            result = (
                client.table("saved_analyses")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .execute()
            )
            
            return [self._row_to_model(row) for row in result.data]
        except Exception as e:
            print(f"Supabase list error: {e}")
            return []
    
    async def get_saved_analysis(
        self,
        analysis_id: str,
        user_id: str
    ) -> Optional[SavedAnalysis]:
        """Get a specific saved analysis"""
        client = self._get_client()
        if not client:
            return None
        
        try:
            result = (
                client.table("saved_analyses")
                .select("*")
                .eq("id", analysis_id)
                .eq("user_id", user_id)
                .single()
                .execute()
            )
            
            if result.data:
                return self._row_to_model(result.data)
            return None
        except Exception as e:
            print(f"Supabase get error: {e}")
            return None
    
    async def delete_saved_analysis(
        self,
        analysis_id: str,
        user_id: str
    ) -> bool:
        """Delete a saved analysis"""
        client = self._get_client()
        if not client:
            return False
        
        try:
            result = (
                client.table("saved_analyses")
                .delete()
                .eq("id", analysis_id)
                .eq("user_id", user_id)
                .execute()
            )
            
            return len(result.data) > 0
        except Exception as e:
            print(f"Supabase delete error: {e}")
            return False
    
    def _row_to_model(self, row: dict) -> SavedAnalysis:
        """Convert database row to SavedAnalysis model"""
        return SavedAnalysis(
            id=row["id"],
            userId=row["user_id"],
            name=row["name"],
            season=row["season"],
            event=row["event"],
            session=row["session"],
            driverA=row["driver_a"],
            driverB=row["driver_b"],
            lapA=row.get("lap_a"),
            lapB=row.get("lap_b"),
            createdAt=datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")),
            updatedAt=datetime.fromisoformat(row["updated_at"].replace("Z", "+00:00")),
        )


# Global Supabase service instance
supabase_service = SupabaseService()
