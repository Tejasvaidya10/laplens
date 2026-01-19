"""
FastF1 service for fetching F1 telemetry data
"""

import os
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime
import pandas as pd
import numpy as np
import fastf1

from app.config import settings
from app.models import (
    Season,
    Event,
    Session,
    Driver,
    TelemetryPoint,
    LapTelemetry,
    DeltaPoint,
    SectorTimes,
    TelemetryComparison,
    TireStint,
    PitStop,
    StrategyData,
    PositionPoint,
    PositionData,
    TrackEvolutionPoint,
    TrackEvolution,
)
from app.utils.downsampling import downsample_lttb


class FastF1Service:
    """Service for fetching F1 data via FastF1"""
    
    def __init__(self):
        self._cache_initialized = False
    
    def initialize_cache(self) -> None:
        """Initialize FastF1 cache directory"""
        cache_dir = settings.fastf1_cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        fastf1.Cache.enable_cache(cache_dir)
        self._cache_initialized = True
        print(f"✅ FastF1 cache enabled at {cache_dir}")
    
    def get_seasons(self) -> List[Season]:
        """Get available F1 seasons"""
        current_year = datetime.now().year
        # FastF1 has data from 2018 onwards with good telemetry
        seasons = []
        for year in range(current_year, 2017, -1):
            seasons.append(Season(
                year=year,
                name=f"{year} Season"
            ))
        return seasons
    
    def get_events(self, season: int) -> List[Event]:
        """Get events for a season"""
        try:
            schedule = fastf1.get_event_schedule(season)
            events = []
            
            for _, row in schedule.iterrows():
                # Skip testing events
                if "Test" in str(row.get("EventName", "")):
                    continue
                    
                # Only include events that have occurred or are the current one
                event_date = row.get("EventDate")
                if pd.isna(event_date):
                    continue
                
                events.append(Event(
                    roundNumber=int(row.get("RoundNumber", 0)),
                    country=str(row.get("Country", "")),
                    location=str(row.get("Location", "")),
                    eventName=str(row.get("EventName", "")),
                    eventDate=str(event_date.date()) if hasattr(event_date, 'date') else str(event_date),
                ))
            
            return events
        except Exception as e:
            print(f"Error fetching events for {season}: {e}")
            return []
    
    def get_sessions(self, season: int, event: str) -> List[Session]:
        """Get sessions for an event"""
        try:
            event_obj = fastf1.get_event(season, event)
            sessions = []
            
            # Define session types
            session_types = [
                ("FP1", "Practice 1", "practice"),
                ("FP2", "Practice 2", "practice"),
                ("FP3", "Practice 3", "practice"),
                ("Q", "Qualifying", "qualifying"),
                ("SQ", "Sprint Qualifying", "sprint_qualifying"),
                ("S", "Sprint", "sprint"),
                ("R", "Race", "race"),
            ]
            
            for session_id, session_name, session_type in session_types:
                try:
                    session_date = event_obj.get_session_date(session_id)
                    if not pd.isna(session_date):
                        sessions.append(Session(
                            name=session_id,
                            date=str(session_date.date()) if hasattr(session_date, 'date') else str(session_date),
                            sessionType=session_type,
                        ))
                except Exception:
                    continue
            
            return sessions
        except Exception as e:
            print(f"Error fetching sessions for {season} {event}: {e}")
            return []
    
    def get_drivers(self, season: int, event: str, session: str) -> List[Driver]:
        """Get drivers for a session"""
        try:
            session_obj = fastf1.get_session(season, event, session)
            session_obj.load(telemetry=False, weather=False, messages=False)
            
            drivers = []
            results = session_obj.results
            
            for _, row in results.iterrows():
                driver_code = str(row.get("Abbreviation", ""))
                if not driver_code:
                    continue
                
                team_color = str(row.get("TeamColor", "999999"))
                if not team_color.startswith("#"):
                    team_color = f"#{team_color}"
                
                drivers.append(Driver(
                    code=driver_code,
                    name=f"{row.get('FirstName', '')} {row.get('LastName', '')}".strip(),
                    team=str(row.get("TeamName", "")),
                    teamColor=team_color,
                    number=int(row.get("DriverNumber", 0)),
                ))
            
            return drivers
        except Exception as e:
            print(f"Error fetching drivers for {season} {event} {session}: {e}")
            return []
    
    def get_telemetry_comparison(
        self,
        season: int,
        event: str,
        session: str,
        driver_a: str,
        driver_b: str,
        lap_a: Optional[int] = None,
        lap_b: Optional[int] = None,
        max_points: int = 1000
    ) -> TelemetryComparison:
        """Get telemetry comparison between two drivers"""
        try:
            session_obj = fastf1.get_session(season, event, session)
            session_obj.load()
            
            # Get laps for each driver
            driver_a_laps = session_obj.laps.pick_driver(driver_a)
            driver_b_laps = session_obj.laps.pick_driver(driver_b)
            
            # Get specific lap or fastest lap
            if lap_a:
                lap_a_data = driver_a_laps[driver_a_laps["LapNumber"] == lap_a].iloc[0]
            else:
                lap_a_data = driver_a_laps.pick_fastest()
            
            if lap_b:
                lap_b_data = driver_b_laps[driver_b_laps["LapNumber"] == lap_b].iloc[0]
            else:
                lap_b_data = driver_b_laps.pick_fastest()
            
            # Get telemetry
            tel_a = lap_a_data.get_telemetry()
            tel_b = lap_b_data.get_telemetry()
            
            # Process telemetry for driver A
            telemetry_a = self._process_telemetry(
                tel_a,
                driver_a,
                int(lap_a_data["LapNumber"]),
                lap_a_data["LapTime"].total_seconds() if pd.notna(lap_a_data["LapTime"]) else None,
                max_points
            )
            
            # Process telemetry for driver B
            telemetry_b = self._process_telemetry(
                tel_b,
                driver_b,
                int(lap_b_data["LapNumber"]),
                lap_b_data["LapTime"].total_seconds() if pd.notna(lap_b_data["LapTime"]) else None,
                max_points
            )
            
            # Calculate delta
            delta = self._calculate_delta(tel_a, tel_b, max_points)
            
            # Extract sector times
                     
            sectors_a = SectorTimes(
                sector1=lap_a_data["Sector1Time"].total_seconds() if pd.notna(lap_a_data["Sector1Time"]) else None,
                sector2=lap_a_data["Sector2Time"].total_seconds() if pd.notna(lap_a_data["Sector2Time"]) else None,
                sector3=lap_a_data["Sector3Time"].total_seconds() if pd.notna(lap_a_data["Sector3Time"]) else None,
            )

            sectors_b = SectorTimes(
                sector1=lap_b_data["Sector1Time"].total_seconds() if pd.notna(lap_b_data["Sector1Time"]) else None,
                sector2=lap_b_data["Sector2Time"].total_seconds() if pd.notna(lap_b_data["Sector2Time"]) else None,
                sector3=lap_b_data["Sector3Time"].total_seconds() if pd.notna(lap_b_data["Sector3Time"]) else None,
            )
            
            return TelemetryComparison(
                driverA=telemetry_a,
                driverB=telemetry_b,
                delta=delta,
                sectorsA=sectors_a,
                sectorsB=sectors_b,
            )
        except Exception as e:
            print(f"Error fetching telemetry: {e}")
            raise
    
    def _process_telemetry(
        self,
        telemetry_df: pd.DataFrame,
        driver: str,
        lap_number: int,
        lap_time: Optional[float],
        max_points: int
    ) -> LapTelemetry:
        """Process raw telemetry DataFrame to LapTelemetry model"""
        # Convert to list of dictionaries
        data = []
        for _, row in telemetry_df.iterrows():
            data.append({
                "distance": float(row.get("Distance", 0)),
                "speed": float(row.get("Speed", 0)),
                "throttle": float(row.get("Throttle", 0)),
                "brake": float(row.get("Brake", 0)),
                "gear": int(row.get("nGear", 0)),
                "rpm": float(row.get("RPM", 0)) if pd.notna(row.get("RPM")) else None,
                "drs": int(row.get("DRS", 0)) if pd.notna(row.get("DRS")) else None,
            })
        
        # Downsample if needed
        if len(data) > max_points:
            # Use LTTB algorithm for speed (representative)
            distances = [d["distance"] for d in data]
            speeds = [d["speed"] for d in data]
            indices = downsample_lttb(distances, speeds, max_points)
            data = [data[i] for i in indices]
        
        points = [TelemetryPoint(**d) for d in data]
        
        return LapTelemetry(
            driver=driver,
            lapNumber=lap_number,
            lapTime=lap_time,
            data=points,
        )
    
    def _calculate_delta(
        self,
        tel_a: pd.DataFrame,
        tel_b: pd.DataFrame,
        max_points: int
    ) -> List[DeltaPoint]:
        """Calculate lap time delta between two drivers"""
        try:
            # Add time column if not present
            if "Time" not in tel_a.columns or "Time" not in tel_b.columns:
                return []
            
            # Convert time to seconds
            tel_a = tel_a.copy()
            tel_b = tel_b.copy()
            
            tel_a["Seconds"] = tel_a["Time"].dt.total_seconds()
            tel_b["Seconds"] = tel_b["Time"].dt.total_seconds()
            
            # Interpolate times at common distances
            common_distances = np.linspace(
                max(tel_a["Distance"].min(), tel_b["Distance"].min()),
                min(tel_a["Distance"].max(), tel_b["Distance"].max()),
                max_points
            )
            
            time_a = np.interp(common_distances, tel_a["Distance"], tel_a["Seconds"])
            time_b = np.interp(common_distances, tel_b["Distance"], tel_b["Seconds"])
            
            delta_points = []
            for dist, t_a, t_b in zip(common_distances, time_a, time_b):
                delta_points.append(DeltaPoint(
                    distance=float(dist),
                    delta=float(t_b - t_a)  # positive = A is ahead
                ))
            
            return delta_points
        except Exception as e:
            print(f"Error calculating delta: {e}")
            return []
    
    def get_strategy(self, season: int, event: str, session: str) -> StrategyData:
        """Get tire strategy data for a session"""
        try:
            session_obj = fastf1.get_session(season, event, session)
            session_obj.load(telemetry=False, weather=False, messages=False)
            
            laps = session_obj.laps
            
            stints: List[TireStint] = []
            pit_stops: List[PitStop] = []
            
            # Get unique drivers
            drivers = laps["Driver"].unique()
            
            for driver in drivers:
                driver_laps = laps[laps["Driver"] == driver].sort_values("LapNumber")
                
                if driver_laps.empty:
                    continue
                
                # Group by stint
                current_stint = 1
                stint_start = int(driver_laps.iloc[0]["LapNumber"])
                current_compound = str(driver_laps.iloc[0]["Compound"])
                
                for i, (_, lap) in enumerate(driver_laps.iterrows()):
                    compound = str(lap["Compound"])
                    lap_num = int(lap["LapNumber"])
                    
                    # Check for pit stop (compound change or stint number change)
                    if compound != current_compound and i > 0:
                        # End current stint
                        stints.append(TireStint(
                            driver=str(driver),
                            stintNumber=current_stint,
                            compound=current_compound.upper() if current_compound else "UNKNOWN",
                            startLap=stint_start,
                            endLap=int(driver_laps.iloc[i-1]["LapNumber"]),
                            laps=int(driver_laps.iloc[i-1]["LapNumber"]) - stint_start + 1,
                        ))
                        
                        # Record pit stop
                        pit_stops.append(PitStop(
                            driver=str(driver),
                            lap=lap_num,
                            duration=None,  # Would need additional data
                        ))
                        
                        # Start new stint
                        current_stint += 1
                        stint_start = lap_num
                        current_compound = compound
                
                # Add final stint
                if not driver_laps.empty:
                    stints.append(TireStint(
                        driver=str(driver),
                        stintNumber=current_stint,
                        compound=current_compound.upper() if current_compound else "UNKNOWN",
                        startLap=stint_start,
                        endLap=int(driver_laps.iloc[-1]["LapNumber"]),
                        laps=int(driver_laps.iloc[-1]["LapNumber"]) - stint_start + 1,
                    ))
            
            total_laps = int(laps["LapNumber"].max()) if not laps.empty else 0
            
            return StrategyData(
                stints=stints,
                pitStops=pit_stops,
                totalLaps=total_laps,
            )
        except Exception as e:
            print(f"Error fetching strategy: {e}")
            raise
    
    def get_positions(self, season: int, event: str, session: str) -> List[PositionData]:
        """Get position history for all drivers"""
        try:
            session_obj = fastf1.get_session(season, event, session)
            session_obj.load(telemetry=False, weather=False, messages=False)
            
            laps = session_obj.laps
            drivers = laps["Driver"].unique()
            
            position_data: List[PositionData] = []
            
            for driver in drivers:
                driver_laps = laps[laps["Driver"] == driver].sort_values("LapNumber")
                
                positions: List[PositionPoint] = []
                for _, lap in driver_laps.iterrows():
                    position = lap.get("Position")
                    if pd.notna(position):
                        positions.append(PositionPoint(
                            lap=int(lap["LapNumber"]),
                            position=int(position),
                        ))
                
                if positions:
                    position_data.append(PositionData(
                        driver=str(driver),
                        positions=positions,
                    ))
            
            return position_data
        except Exception as e:
            print(f"Error fetching positions: {e}")
            raise
    
    def get_track_evolution(self, season: int, event: str, session: str) -> TrackEvolution:
        """Get track evolution data showing best lap times progression"""
        try:
            session_obj = fastf1.get_session(season, event, session)
            session_obj.load(telemetry=False, weather=False, messages=False)
            
            laps = session_obj.laps
            
            # Filter valid laps
            valid_laps = laps[
                (laps["LapTime"].notna()) &
                (laps["IsAccurate"] == True)
            ].copy()
            
            if valid_laps.empty:
                return TrackEvolution(points=[], improvementRate=0.0)
            
            # Calculate best time up to each lap
            valid_laps["LapTimeSeconds"] = valid_laps["LapTime"].dt.total_seconds()
            
            points: List[TrackEvolutionPoint] = []
            best_time = float("inf")
            best_times_list = []
            
            for lap_num in sorted(valid_laps["LapNumber"].unique()):
                lap_data = valid_laps[valid_laps["LapNumber"] == lap_num]
                
                # Find the best lap at this lap number
                fastest_this_lap = lap_data.loc[lap_data["LapTimeSeconds"].idxmin()]
                lap_time = fastest_this_lap["LapTimeSeconds"]
                
                if lap_time < best_time:
                    best_time = lap_time
                    points.append(TrackEvolutionPoint(
                        lap=int(lap_num),
                        bestTime=float(best_time),
                        driver=str(fastest_this_lap["Driver"]),
                        compound=str(fastest_this_lap["Compound"]).upper() if pd.notna(fastest_this_lap["Compound"]) else None,
                    ))
                    best_times_list.append(best_time)
            
            # Calculate improvement rate (seconds per lap)
            if len(best_times_list) >= 2:
                improvement_rate = (best_times_list[0] - best_times_list[-1]) / len(best_times_list)
            else:
                improvement_rate = 0.0
            
            return TrackEvolution(
                points=points,
                improvementRate=float(improvement_rate),
            )
        except Exception as e:
            print(f"Error fetching track evolution: {e}")
            raise

    def get_race_pace(
            self,
            season: int,
            event: str,
            session: str,
            drivers: List[str],
        ) -> Dict[str, Any]:
            """Get race pace data for multiple drivers"""
            try:
                session_obj = fastf1.get_session(season, event, session)
                session_obj.load(telemetry=False, weather=False, messages=False)
                
                laps = session_obj.laps
                results = session_obj.results
                
                drivers_data = []
                
                for driver_code in drivers:
                    driver_laps = laps[laps["Driver"] == driver_code].sort_values("LapNumber")
                    
                    if driver_laps.empty:
                        continue
                    
                    # Get driver info
                    driver_info = results[results["Abbreviation"] == driver_code]
                    team = str(driver_info["TeamName"].values[0]) if not driver_info.empty else ""
                    team_color = str(driver_info["TeamColor"].values[0]) if not driver_info.empty else "999999"
                    if not team_color.startswith("#"):
                        team_color = f"#{team_color}"
                    
                    lap_times = []
                    stints_data = {}
                    current_stint = 1
                    
                    for _, lap in driver_laps.iterrows():
                        lap_time = lap.get("LapTime")
                        if pd.isna(lap_time):
                            continue
                        
                        lap_time_sec = lap_time.total_seconds()
                        lap_num = int(lap["LapNumber"])
                        compound = str(lap.get("Compound", "UNKNOWN")).upper()
                        stint_num = int(lap.get("Stint", 1))
                        
                        # Detect pit laps (abnormally slow)
                        is_pit_lap = lap.get("PitOutTime") is not None or lap.get("PitInTime") is not None
                        if pd.isna(is_pit_lap):
                            is_pit_lap = False
                        
                        # Track stint data for degradation calculation
                        if stint_num not in stints_data:
                            stints_data[stint_num] = {
                                "compound": compound,
                                "laps": [],
                                "times": [],
                                "start_lap": lap_num,
                            }
                        
                        stints_data[stint_num]["laps"].append(lap_num)
                        stints_data[stint_num]["times"].append(lap_time_sec)
                        stints_data[stint_num]["end_lap"] = lap_num
                        
                        lap_times.append({
                            "lap": lap_num,
                            "lapTime": lap_time_sec,
                            "compound": compound,
                            "stint": stint_num,
                            "isPitLap": bool(is_pit_lap),
                            "isOutlier": False,  # Will be calculated below
                        })
                    
                    # Mark outliers (laps > 107% of median)
                    if lap_times:
                        valid_times = [lt["lapTime"] for lt in lap_times if not lt["isPitLap"]]
                        if valid_times:
                            median_time = np.median(valid_times)
                            outlier_threshold = median_time * 1.07  # 107% rule
                            
                            for lt in lap_times:
                                if lt["lapTime"] > outlier_threshold:
                                    lt["isOutlier"] = True
                    
                    # Calculate stint summaries
                    stint_summaries = []
                    for stint_num, stint_info in stints_data.items():
                        times = stint_info["times"]
                        laps_in_stint = stint_info["laps"]
                        
                        # Filter out pit laps and outliers for stats
                        clean_times = []
                        for i, t in enumerate(times):
                            lap_data = next((lt for lt in lap_times if lt["lap"] == laps_in_stint[i]), None)
                            if lap_data and not lap_data["isPitLap"] and not lap_data["isOutlier"]:
                                clean_times.append(t)
                        
                        if not clean_times:
                            clean_times = times  # Fallback
                        
                        # Calculate degradation rate (linear regression)
                        deg_rate = 0.0
                        if len(clean_times) >= 3:
                            x = np.arange(len(clean_times))
                            coeffs = np.polyfit(x, clean_times, 1)
                            deg_rate = float(coeffs[0])  # Slope = seconds per lap
                        
                        stint_summaries.append({
                            "stintNumber": stint_num,
                            "compound": stint_info["compound"],
                            "startLap": stint_info["start_lap"],
                            "endLap": stint_info["end_lap"],
                            "totalLaps": len(times),
                            "avgLapTime": float(np.mean(clean_times)),
                            "bestLapTime": float(min(clean_times)),
                            "degRate": deg_rate,
                        })
                    
                    # Calculate total race time
                    total_race_time = sum(lt["lapTime"] for lt in lap_times)
                    
                    drivers_data.append({
                        "driver": driver_code,
                        "team": team,
                        "teamColor": team_color,
                        "laps": lap_times,
                        "stints": stint_summaries,
                        "totalRaceTime": total_race_time,
                    })
                
                # Get total laps and safety car info
                total_laps = int(laps["LapNumber"].max()) if not laps.empty else 0
                
                # Try to detect safety car laps (all drivers slow)
                safety_car_laps = []
                vsc_laps = []
                # TODO: Could be enhanced with race control messages
                
                return {
                    "drivers": drivers_data,
                    "totalLaps": total_laps,
                    "safetyCarLaps": safety_car_laps,
                    "vscLaps": vsc_laps,
                }
                
            except Exception as e:
                print(f"Error fetching race pace: {e}")
                raise

# Global FastF1 service instance
fastf1_service = FastF1Service()
