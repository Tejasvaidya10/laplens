/**
 * Shared types for Pitlane Telemetry
 * These types are used by both frontend and backend
 */

// =============================================================================
// Base Types
// =============================================================================

export interface Season {
  year: number;
  name: string;
}

export interface Event {
  roundNumber: number;
  country: string;
  location: string;
  eventName: string;
  eventDate: string;
}

export interface Session {
  name: string;
  date: string;
  sessionType: "practice" | "qualifying" | "sprint_qualifying" | "sprint" | "race";
}

export interface Driver {
  code: string;
  name: string;
  team: string;
  teamColor: string;
  number: number;
}

// =============================================================================
// Telemetry Types
// =============================================================================

export interface TelemetryPoint {
  distance: number;
  speed: number;
  throttle: number;
  brake: number;
  gear: number;
  rpm?: number;
  drs?: number;
}

export interface LapTelemetry {
  driver: string;
  lapNumber: number;
  lapTime: number | null;
  data: TelemetryPoint[];
}

export interface DeltaPoint {
  distance: number;
  delta: number;
}

export interface TelemetryComparison {
  driverA: LapTelemetry;
  driverB: LapTelemetry;
  delta: DeltaPoint[];
}

export interface TelemetryCompareRequest {
  season: number;
  event: string;
  session: string;
  driverA: string;
  driverB: string;
  lapA?: number;
  lapB?: number;
}

// =============================================================================
// Strategy Types
// =============================================================================

export type TireCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET" | "UNKNOWN";

export interface TireStint {
  driver: string;
  stintNumber: number;
  compound: TireCompound;
  startLap: number;
  endLap: number;
  laps: number;
}

export interface PitStop {
  driver: string;
  lap: number;
  duration?: number;
}

export interface StrategyData {
  stints: TireStint[];
  pitStops: PitStop[];
  totalLaps: number;
}

// =============================================================================
// Position Types
// =============================================================================

export interface PositionPoint {
  lap: number;
  position: number;
}

export interface PositionData {
  driver: string;
  positions: PositionPoint[];
}

// =============================================================================
// Track Evolution Types
// =============================================================================

export interface TrackEvolutionPoint {
  lap: number;
  bestTime: number;
  driver: string;
  compound?: TireCompound;
}

export interface TrackEvolution {
  points: TrackEvolutionPoint[];
  improvementRate: number;
}

// =============================================================================
// Saved Analysis Types
// =============================================================================

export interface SavedAnalysisCreate {
  name: string;
  season: number;
  event: string;
  session: string;
  driverA: string;
  driverB: string;
  lapA?: number;
  lapB?: number;
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  name: string;
  season: number;
  event: string;
  session: string;
  driverA: string;
  driverB: string;
  lapA?: number;
  lapB?: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// API Types
// =============================================================================

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// =============================================================================
// UI Form Types
// =============================================================================

export interface CompareFormData {
  season: number | null;
  event: string | null;
  session: string | null;
  driverA: string | null;
  driverB: string | null;
  lapA: number | null;
  lapB: number | null;
}

// =============================================================================
// Utility Types
// =============================================================================

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface ChartDataPoint {
  x: number;
  y: number;
  [key: string]: number | string;
}

// =============================================================================
// F1 Team Colors
// =============================================================================

export const TEAM_COLORS: Record<string, string> = {
  "Red Bull Racing": "#3671C6",
  "Ferrari": "#E8002D",
  "Mercedes": "#27F4D2",
  "McLaren": "#FF8000",
  "Aston Martin": "#229971",
  "Alpine": "#FF87BC",
  "Williams": "#64C4FF",
  "RB": "#6692FF",
  "Kick Sauber": "#52E252",
  "Haas F1 Team": "#B6BABD",
};

// =============================================================================
// Tire Compound Colors
// =============================================================================

export const COMPOUND_COLORS: Record<TireCompound, string> = {
  SOFT: "#FF0000",
  MEDIUM: "#FFC700",
  HARD: "#FFFFFF",
  INTERMEDIATE: "#00C800",
  WET: "#0078FF",
  UNKNOWN: "#808080",
};
