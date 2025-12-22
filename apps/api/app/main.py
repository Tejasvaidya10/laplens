"""
LapLens API
FastAPI backend for F1 telemetry analytics
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    health,
    seasons,
    events,
    sessions,
    drivers,
    telemetry,
    strategy,
    positions,
    track_evolution,
    saved_analyses,
)
from app.services.cache_service import cache_service
from app.services.fastf1_service import fastf1_service
from app.middleware.rate_limit import RateLimitMiddleware
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown"""
    # Startup
    print("🏎️ LapLens API starting...")
    
    # Initialize FastF1 cache
    fastf1_service.initialize_cache()
    
    # Initialize Redis connection
    await cache_service.connect()
    
    yield
    
    # Shutdown
    print("🏁 LapLens API shutting down...")
    await cache_service.disconnect()


app = FastAPI(
    title="LapLens API",
    description="F1 telemetry analytics API powered by FastF1",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Allow custom origins from environment
if settings.cors_origins and settings.cors_origins != "*":
    origins.extend([o.strip() for o in settings.cors_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if settings.cors_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(seasons.router, prefix="/seasons", tags=["Seasons"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
app.include_router(drivers.router, prefix="/drivers", tags=["Drivers"])
app.include_router(telemetry.router, prefix="/telemetry", tags=["Telemetry"])
app.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
app.include_router(positions.router, prefix="/positions", tags=["Positions"])
app.include_router(track_evolution.router, prefix="/track-evolution", tags=["Track Evolution"])
app.include_router(saved_analyses.router, prefix="/saved-analyses", tags=["Saved Analyses"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
