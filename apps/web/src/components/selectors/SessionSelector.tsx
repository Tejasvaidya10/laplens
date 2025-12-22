import { useQuery } from '@tanstack/react-query'
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

export function SessionSelector() {
  const {
    season,
    event,
    session,
    setSeason,
    setEvent,
    setSession,
  } = useSessionStore()

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
                <SelectItem key={e.name} value={e.name}>
                  <div className="flex flex-col">
                    <span>{e.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.country}
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
        <Label htmlFor="session" className="text-xs text-muted-foreground">
          Session
        </Label>
        {sessionsLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={session || ''}
            onValueChange={setSession}
            disabled={!event}
          >
            <SelectTrigger id="session">
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions?.map((s) => (
                <SelectItem key={s.name} value={s.type}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}
