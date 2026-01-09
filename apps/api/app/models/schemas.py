"""
Pydantic models for API request/response validation
"""

from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field


# ============ Base Models ============

class Season(BaseModel):
    """F1 season"""
    year: int
    name: str


class Event(BaseModel):
    """F1 event/race weekend"""
    round_number: int = Field(alias="roundNumber")
    country: str
    location: str
    event_name: str = Field(alias="eventName")
    event_date: str = Field(alias="eventDate")
    
    class Config:
        populate_by_name = True


class Session(BaseModel):
    """F1 session (FP1, FP2, FP3, Q, R, Sprint)"""
    name: str
    date: str
    session_type: str = Field(alias="sessionType")
    
    class Config:
        populate_by_name = True


class Driver(BaseModel):
    """F1 driver info"""
    code: str
    name: str
    team: str
    team_color: str = Field(alias="teamColor")
    number: int
    
    class Config:
        populate_by_name = True


# ============ Telemetry Models ============

class TelemetryPoint(BaseModel):
    """Single telemetry data point"""
    distance: float
    speed: float
    throttle: float
    brake: float
    gear: int
    rpm: Optional[float] = None
    drs: Optional[int] = None


class LapTelemetry(BaseModel):
    """Telemetry data for a lap"""
    driver: str
    lap_number: int = Field(alias="lapNumber")
    lap_time: Optional[float] = Field(alias="lapTime", default=None)
    data: List[TelemetryPoint]
    
    class Config:
        populate_by_name = True


class DeltaPoint(BaseModel):
    """Delta time at a distance point"""
    distance: float
    delta: float  # positive = driver A ahead


class TelemetryComparison(BaseModel):
    """Comparison response with telemetry data for two drivers"""
    driver_a: LapTelemetry = Field(alias="driverA")
    driver_b: LapTelemetry = Field(alias="driverB")
    delta: List[DeltaPoint]
    
    class Config:
        populate_by_name = True


class TelemetryCompareRequest(BaseModel):
    """Request body for telemetry comparison"""
    season: int
    event: str
    session: str
    driver_a: str = Field(alias="driverA")
    driver_b: str = Field(alias="driverB")
    lap_a: Optional[int] = Field(alias="lapA", default=None)
    lap_b: Optional[int] = Field(alias="lapB", default=None)
    
    class Config:
        populate_by_name = True


# ============ Strategy Models ============

class TireStint(BaseModel):
    """A tire stint for a driver"""
    driver: str
    stint_number: int = Field(alias="stintNumber")
    compound: str  # SOFT, MEDIUM, HARD, INTERMEDIATE, WET
    start_lap: int = Field(alias="startLap")
    end_lap: int = Field(alias="endLap")
    laps: int
    
    class Config:
        populate_by_name = True


class PitStop(BaseModel):
    """Pit stop information"""
    driver: str
    lap: int
    duration: Optional[float] = None
    
    class Config:
        populate_by_name = True


class StrategyData(BaseModel):
    """Strategy data for a session"""
    stints: List[TireStint]
    pit_stops: List[PitStop] = Field(alias="pitStops")
    total_laps: int = Field(alias="totalLaps")
    
    class Config:
        populate_by_name = True


# ============ Position Models ============

class PositionPoint(BaseModel):
    """Position at a specific lap"""
    lap: int
    position: int


class PositionData(BaseModel):
    """Position history for a driver"""
    driver: str
    positions: List[PositionPoint]


# ============ Track Evolution Models ============

class TrackEvolutionPoint(BaseModel):
    """Best lap time at a specific lap number"""
    lap: int
    best_time: float = Field(alias="bestTime")
    driver: str
    compound: Optional[str] = None
    
    class Config:
        populate_by_name = True


class TrackEvolution(BaseModel):
    """Track evolution data"""
    points: List[TrackEvolutionPoint]
    improvement_rate: float = Field(alias="improvementRate")  # seconds per lap average
    
    class Config:
        populate_by_name = True


# ============ Saved Analysis Models ============

class SavedAnalysisCreate(BaseModel):
    """Request to create a saved analysis"""
    name: str
    season: int
    event: str
    session: str
    driver_a: str = Field(alias="driverA")
    driver_b: str = Field(alias="driverB")
    lap_a: Optional[int] = Field(alias="lapA", default=None)
    lap_b: Optional[int] = Field(alias="lapB", default=None)
    
    class Config:
        populate_by_name = True


class SavedAnalysis(BaseModel):
    """Saved analysis record"""
    id: str
    user_id: str = Field(alias="userId")
    name: str
    season: int
    event: str
    session: str
    driver_a: str = Field(alias="driverA")
    driver_b: str = Field(alias="driverB")
    lap_a: Optional[int] = Field(alias="lapA", default=None)
    lap_b: Optional[int] = Field(alias="lapB", default=None)
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    
    class Config:
        populate_by_name = True


# ============ API Response Models ============

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime
    version: str = "1.0.0"


class ApiResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None


class RateLimitInfo(BaseModel):
    """Rate limit headers info"""
    limit: int
    remaining: int
    reset: int


# ============ Race Pace Models ============

class LapTimePoint(BaseModel):
    """Single lap time data point"""
    lap: int
    lap_time: float = Field(alias="lapTime")
    compound: Optional[str] = None
    stint: int = 1
    is_pit_lap: bool = Field(alias="isPitLap", default=False)
    is_outlier: bool = Field(alias="isOutlier", default=False)
    
    class Config:
        populate_by_name = True


class StintSummary(BaseModel):
    """Summary statistics for a stint"""
    stint_number: int = Field(alias="stintNumber")
    compound: str
    start_lap: int = Field(alias="startLap")
    end_lap: int = Field(alias="endLap")
    total_laps: int = Field(alias="totalLaps")
    avg_lap_time: float = Field(alias="avgLapTime")
    best_lap_time: float = Field(alias="bestLapTime")
    deg_rate: float = Field(alias="degRate")
    
    class Config:
        populate_by_name = True


class DriverRacePace(BaseModel):
    """Race pace data for a single driver"""
    driver: str
    team: str
    team_color: str = Field(alias="teamColor")
    laps: List[LapTimePoint]
    stints: List[StintSummary]
    total_race_time: Optional[float] = Field(alias="totalRaceTime", default=None)
    
    class Config:
        populate_by_name = True


class RacePaceComparison(BaseModel):
    """Race pace comparison between drivers"""
    drivers: List[DriverRacePace]
    total_laps: int = Field(alias="totalLaps")
    safety_car_laps: List[int] = Field(alias="safetyCarLaps", default=[])
    vsc_laps: List[int] = Field(alias="vscLaps", default=[])
    
    class Config:
        populate_by_name = True


class RacePaceRequest(BaseModel):
    """Request body for race pace data"""
    season: int
    event: str
    session: str = "R"
    drivers: List[str]
    
    class Config:
        populate_by_name = True
