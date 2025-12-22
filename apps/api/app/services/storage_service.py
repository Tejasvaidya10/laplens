"""
Storage service for storing telemetry artifacts
Uses Supabase Storage
"""

import json
import gzip
from typing import Optional, Any
from supabase import create_client, Client

from app.config import settings


class StorageService:
    """Supabase Storage service for telemetry artifacts"""
    
    def __init__(self):
        self._client: Optional[Client] = None
        self._enabled = False
        self.bucket_name = "telemetry"
    
    def _get_client(self) -> Optional[Client]:
        """Get or create Supabase client"""
        if self._client is None and self._can_initialize():
            self._client = create_client(
                settings.supabase_url,
                settings.supabase_service_key
            )
            self._enabled = True
        return self._client
    
    def _can_initialize(self) -> bool:
        """Check if Supabase can be initialized"""
        return all([
            settings.supabase_url,
            settings.supabase_service_key,
        ])
    
    @property
    def is_enabled(self) -> bool:
        """Check if storage is enabled and configured"""
        if not self._enabled:
            self._get_client()
        return self._enabled
    
    def _get_key(self, *parts: str) -> str:
        """Generate an object key from parts"""
        return "/".join(str(p) for p in parts)
    
    async def upload_json(
        self,
        key: str,
        data: Any,
        compress: bool = True
    ) -> bool:
        """Upload JSON data to Supabase Storage"""
        client = self._get_client()
        if not client:
            return False
        
        try:
            json_data = json.dumps(data)
            
            if compress:
                body = gzip.compress(json_data.encode("utf-8"))
            else:
                body = json_data.encode("utf-8")
            
            # Remove existing file if exists (upsert)
            try:
                client.storage.from_(self.bucket_name).remove([key])
            except:
                pass
            
            client.storage.from_(self.bucket_name).upload(
                key,
                body,
                {"content-type": "application/gzip" if compress else "application/json"}
            )
            return True
        except Exception as e:
            print(f"Storage upload error: {e}")
            return False
    
    async def download_json(self, key: str) -> Optional[Any]:
        """Download JSON data from Supabase Storage"""
        client = self._get_client()
        if not client:
            return None
        
        try:
            response = client.storage.from_(self.bucket_name).download(key)
            
            # Try to decompress (assume gzipped)
            try:
                body = gzip.decompress(response)
            except:
                body = response
            
            return json.loads(body.decode("utf-8"))
        except Exception as e:
            if "not found" in str(e).lower() or "404" in str(e):
                return None
            print(f"Storage download error: {e}")
            return None
    
    async def exists(self, key: str) -> bool:
        """Check if an object exists in storage"""
        client = self._get_client()
        if not client:
            return False
        
        try:
            # Try to get file info by listing with prefix
            folder = "/".join(key.split("/")[:-1])
            filename = key.split("/")[-1]
            result = client.storage.from_(self.bucket_name).list(folder)
            return any(f["name"] == filename for f in result)
        except Exception as e:
            print(f"Storage exists check error: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete an object from storage"""
        client = self._get_client()
        if not client:
            return False
        
        try:
            client.storage.from_(self.bucket_name).remove([key])
            return True
        except Exception as e:
            print(f"Storage delete error: {e}")
            return False
    
    # Telemetry-specific helpers
    def telemetry_key(
        self,
        season: int,
        event: str,
        session: str,
        driver_a: str,
        driver_b: str,
        lap_a: Optional[int] = None,
        lap_b: Optional[int] = None
    ) -> str:
        """Generate storage key for telemetry comparison"""
        lap_a_str = str(lap_a) if lap_a else "fastest"
        lap_b_str = str(lap_b) if lap_b else "fastest"
        return self._get_key(
            str(season),
            event.replace(" ", "_").replace("/", "-"),
            session,
            f"{driver_a}_{driver_b}_{lap_a_str}_{lap_b_str}.json.gz"
        )


# Global storage service instance
storage_service = StorageService()
