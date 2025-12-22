"""Routers package"""

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

__all__ = [
    "health",
    "seasons",
    "events",
    "sessions",
    "drivers",
    "telemetry",
    "strategy",
    "positions",
    "track_evolution",
    "saved_analyses",
]
