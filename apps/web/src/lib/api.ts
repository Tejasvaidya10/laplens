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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
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

  async health(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }

  async getSeasons(): Promise<Season[]> {
    return this.request('/seasons')
  }

  async getEvents(season: number): Promise<Event[]> {
    return this.request(`/events?season=${season}`)
  }

  async getSessions(season: number, event: string): Promise<Session[]> {
    return this.request(`/sessions?season=${season}&event=${encodeURIComponent(event)}`)
  }

  async getDrivers(season: number, event: string, session: string): Promise<Driver[]> {
    return this.request(
      `/drivers?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  async compareTelemetry(data: CompareFormData): Promise<TelemetryComparison> {
    return this.request('/telemetry/compare', {
      method: 'POST',
      body: JSON.stringify({
        season: data.season,
        event: data.event,
        session: data.session,
        driverA: data.driverA,
        driverB: data.driverB,
        lapA: data.lapA,
        lapB: data.lapB,
      }),
    })
  }

  async getRacePace(
    season: number,
    event: string,
    session: string,
    drivers: string[]
  ): Promise<any> {
    return this.request('/telemetry/race-pace', {
      method: 'POST',
      body: JSON.stringify({
        season,
        event,
        session,
        drivers,
      }),
    })
  }

  async getStrategy(season: number, event: string, session: string): Promise<StrategyData> {
    return this.request(
      `/strategy?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  async getPositions(season: number, event: string, session: string): Promise<PositionData[]> {
    return this.request(
      `/positions?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  async getTrackEvolution(season: number, event: string, session: string): Promise<TrackEvolution> {
    return this.request(
      `/track-evolution?season=${season}&event=${encodeURIComponent(event)}&session=${session}`
    )
  }

  async getSavedAnalyses(): Promise<SavedAnalysis[]> {
    return this.request('/saved-analyses')
  }

  async getSavedAnalysis(id: string): Promise<SavedAnalysis> {
    return this.request(`/saved-analyses/${id}`)
  }

  async createSavedAnalysis(data: any): Promise<SavedAnalysis> {
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
export const apiClient = api
