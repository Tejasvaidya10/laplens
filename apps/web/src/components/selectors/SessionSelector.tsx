import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useSessionStore } from '@/hooks/use-session-store'
import { Loader2 } from 'lucide-react'

const sessionDisplayName: Record<string, string> = {
  FP1: "FP 1",
  FP2: "FP 2",
  FP3: "FP 3",
  Q: "Qualifying",
  SQ: "Sprint Qualifying",
  S: "Sprint Race",
  SS: "Sprint Race",
  R: "Race",
}
export function SessionSelector() {
  const {
    season,
    event,
    session,
    setSeason,
    setEvent,
    setSession,
  } = useSessionStore()

  const queryClient = useQueryClient()

  // Fetch seasons
  const { data: seasons, isLoading: seasonsLoading } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => api.getSeasons(),
  })

  // Fetch events for selected season
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', season],
    queryFn: () => api.getEvents(season!),
    enabled: !!season,
  })

  // Fetch sessions for selected event
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', season, event],
    queryFn: () => api.getSessions(season!, event!),
    enabled: !!season && !!event,
  })

  // Fetch drivers (this warms the FastF1 cache)
  const { data: drivers, isLoading: driversLoading, isFetching: driversFetching } = useQuery({
    queryKey: ['drivers', season, event, session],
    queryFn: () => api.getDrivers(season!, event!, session!),
    enabled: !!season && !!event && !!session,
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Pre-fetch function to warm cache in background
  const prefetchSession = async (sessionName: string) => {
    if (season && event) {
      // This triggers FastF1 to load session data in the background
      queryClient.prefetchQuery({
        queryKey: ['drivers', season, event, sessionName],
        queryFn: () => api.getDrivers(season, event, sessionName),
        staleTime: 1000 * 60 * 60,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Season Selector */}
      <div className="space-y-2">
        <Label htmlFor="season" className="text-xs text-muted-foreground">
          Season
        </Label>
        {seasonsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={season?.toString()}
            onValueChange={(value) => {
              setSeason(parseInt(value))
              setEvent(null)
              setSession(null)
            }}
          >
            <SelectTrigger id="season">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons?.map((s) => (
                <SelectItem key={s.year} value={s.year.toString()}>
                  {s.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Event Selector */}
      <div className="space-y-2">
        <Label htmlFor="event" className="text-xs text-muted-foreground">
          Event
        </Label>
        {eventsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={event || ''}
            onValueChange={(value) => {
              setEvent(value)
              setSession(null)
            }}
            disabled={!season}
          >
            <SelectTrigger id="event">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((e) => (
                <SelectItem key={e.roundNumber} value={e.eventName}>
                  <div className="flex flex-col">
                    <span>{e.eventName}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.eventName}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Session Selector */}
      <div className="space-y-2">
        <Label htmlFor="session" className="text-xs text-muted-foreground flex items-center gap-2">
          Session
          {driversFetching && (
            <span className="flex items-center text-xs text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Loading data...
            </span>
          )}
        </Label>
        {sessionsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={session || ''}
            onValueChange={(value) => {
              setSession(value)
              prefetchSession(value)
            }}
            disabled={!event}
          >
            <SelectTrigger id="session">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions?.map((s) => (
                <SelectItem key={s.name} value={s.name}>
                  {sessionDisplayName[s.name] || s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
