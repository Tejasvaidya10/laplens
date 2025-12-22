import type {
  Season,
  Event,
  Session,
  Driver,
  TelemetryComparison,
  StrategyData,
  PositionData,
  TrackEvolution,
  SavedAnalysis,
  CompareFormData,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string
  private accessToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `Request failed: ${response.status}`)
    }

    return response.json()
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }

  // Seasons
  async getSeasons(): Promise<Season[]> {
    return this.request('/seasons')
  }

  // Events
  async getEvents(season: number): Promise<Event[]> {
    return this.request(`/events?season=${season}`)
  }

  // Sessions
  async getSessions(season: number, event: string): Promise<Session[]> {
    return this.request(`/sessions?season=${season}&event=${encodeURIComponent(event)}`)
  }

  // Drivers
  async getDrivers(season: number, event: string, session: string): Promise<Driver[]> {
    return this.request(
      `/drivers?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  // Telemetry comparison
  async compareTelemetry(data: CompareFormData): Promise<TelemetryComparison> {
    return this.request('/telemetry/compare', {
      method: 'POST',
      body: JSON.stringify({
        season: data.season,
        event: data.event,
        session: data.session,
        driver_a: data.driverA,
        driver_b: data.driverB,
        lap_a: data.lapA,
        lap_b: data.lapB,
      }),
    })
  }

  // Strategy data
  async getStrategy(
    season: number,
    event: string,
    session: string
  ): Promise<StrategyData> {
    return this.request(
      `/strategy?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  // Position changes
  async getPositions(
    season: number,
    event: string,
    session: string
  ): Promise<PositionData[]> {
    return this.request(
      `/positions?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  // Track evolution
  async getTrackEvolution(
    season: number,
    event: string,
    session: string
  ): Promise<TrackEvolution[]> {
    return this.request(
      `/track-evolution?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  // Saved analyses (authenticated)
  async getSavedAnalyses(): Promise<SavedAnalysis[]> {
    return this.request('/saved-analyses')
  }

  async getSavedAnalysis(id: string): Promise<SavedAnalysis> {
    return this.request(`/saved-analyses/${id}`)
  }

  async createSavedAnalysis(data: Omit<SavedAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SavedAnalysis> {
    return this.request('/saved-analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteSavedAnalysis(id: string): Promise<void> {
    return this.request(`/saved-analyses/${id}`, {
      method: 'DELETE',
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
