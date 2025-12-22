// API Types
export interface Season {
  year: number
}

export interface Event {
  round: number
  name: string
  country: string
  location: string
  date: string
}

export interface Session {
  name: string
  type: 'FP1' | 'FP2' | 'FP3' | 'Q' | 'SQ' | 'R' | 'SS'
  date: string
}

export interface Driver {
  code: string
  number: number
  name: string
  team: string
  teamColor: string
}

export interface TelemetryPoint {
  distance: number
  time: number
  speed: number
  throttle: number
  brake: number
  gear: number
  drs: number
}

export interface TelemetryComparison {
  driverA: {
    code: string
    name: string
    team: string
    color: string
    lap: number
    lapTime: string
    telemetry: TelemetryPoint[]
  }
  driverB: {
    code: string
    name: string
    team: string
    color: string
    lap: number
    lapTime: string
    telemetry: TelemetryPoint[]
  }
  delta: {
    distance: number
    timeDelta: number
  }[]
  metadata: {
    season: number
    event: string
    session: string
    trackLength: number
    cached: boolean
  }
}

export interface TireStint {
  driver: string
  driverCode: string
  stintNumber: number
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET'
  startLap: number
  endLap: number
  totalLaps: number
}

export interface StrategyData {
  stints: TireStint[]
  pitStops: {
    driver: string
    driverCode: string
    lap: number
    duration: number
  }[]
  totalLaps: number
}

export interface PositionData {
  lap: number
  positions: {
    driver: string
    driverCode: string
    position: number
    color: string
  }[]
}

export interface TrackEvolution {
  lap: number
  bestLapTime: number
  averageLapTime: number
  trackStatus: string
}

export interface SavedAnalysis {
  id: string
  user_id: string
  name: string
  season: number
  event: string
  session: string
  driver_a: string
  driver_b: string
  lap_a?: number
  lap_b?: number
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  cached: boolean
  timestamp: string
}

export interface ApiError {
  detail: string
  status_code: number
}

// Form Types
export interface CompareFormData {
  season: number
  event: string
  session: string
  driverA: string
  driverB: string
  lapA?: number
  lapB?: number
}

// Component Props Types
export interface ChartProps {
  data: TelemetryComparison
  height?: number
}

export interface SelectOption {
  value: string
  label: string
}
