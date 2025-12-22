"""
Application configuration using Pydantic Settings
"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Application
    app_name: str = "LapLens API"
    debug: bool = False
    
    # Redis (Upstash or local)
    redis_url: Optional[str] = None
    cache_ttl_seconds: int = 86400  # 24 hours
    
    # Supabase
    supabase_url: Optional[str] = None
    supabase_service_key: Optional[str] = None
    supabase_jwt_secret: Optional[str] = None
    
    # Rate limiting
    rate_limit_requests: int = 100  # requests per window
    rate_limit_window: int = 60  # seconds
    rate_limit_authenticated_requests: int = 200
    
    # FastF1 cache directory
    fastf1_cache_dir: str = "/tmp/fastf1_cache"
    
    # CORS
    cors_origins: str = "*"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
