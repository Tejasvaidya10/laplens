import { Badge } from '@/components/ui/Badge'

interface StoryEvent {
  lap: string
  title: string
  content: string
  highlight?: boolean
}

interface RaceStoryTimelineProps {
  events: StoryEvent[]
  isLoading?: boolean
}

export function RaceStoryTimeline({ events, isLoading }: RaceStoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
            <div className="h-4 w-20 bg-zinc-800 rounded mb-2" />
            <div className="h-4 w-48 bg-zinc-800 rounded mb-3" />
            <div className="h-16 w-full bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-500">Story data not available for this session</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div
          key={i}
          className={`bg-zinc-900 border rounded-xl p-5 ${
            event.highlight ? 'border-blue-500/50' : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={event.highlight ? 'blue' : 'default'}>
              {event.lap}
            </Badge>
            <h4 className="font-semibold text-white">{event.title}</h4>
          </div>
          <p className="text-sm text-zinc-400">{event.content}</p>
        </div>
      ))}
    </div>
  )
}

// Helper function to generate story events from race data
export function generateRaceStoryEvents(
  racePaceData: any,
  strategyData: any,
  positionsData: any,
  driverA: string,
  driverB: string
): StoryEvent[] {
  const events: StoryEvent[] = []

  // Start event
  if (positionsData?.length > 0) {
    const driverAStart = positionsData.find((p: any) => p.driver === driverA)?.positions?.[0]?.position
    const driverBStart = positionsData.find((p: any) => p.driver === driverB)?.positions?.[0]?.position
    
    events.push({
      lap: 'Start',
      title: 'Lights Out',
      content: `${driverA} starts P${driverAStart || '?'}, ${driverB} starts P${driverBStart || '?'}. The race begins.`,
      highlight: true,
    })
  }

  // Pit stops from strategy data
  if (strategyData?.pitStops) {
    const allPitStops = strategyData.pitStops
      .filter((p: any) => p.driver === driverA || p.driver === driverB)
      .sort((a: any, b: any) => a.lap - b.lap)

    allPitStops.forEach((pit: any) => {
      events.push({
        lap: `Lap ${pit.lap}`,
        title: `${pit.driver} Pit Stop`,
        content: `${pit.driver} pits for ${pit.newCompound || 'new tires'}. Stationary time: ${pit.duration?.toFixed(1) || '?'}s.`,
        highlight: pit.driver === driverA,
      })
    })
  }

  // Race result
  if (racePaceData?.drivers?.length >= 2) {
    const sorted = [...racePaceData.drivers].sort(
      (a: any, b: any) => a.totalRaceTime - b.totalRaceTime
    )
    const winner = sorted[0]
    const gap = (sorted[1].totalRaceTime - sorted[0].totalRaceTime).toFixed(1)

    events.push({
      lap: 'Finish',
      title: 'Checkered Flag',
      content: `${winner.driver} takes the win, finishing ${gap}s ahead of ${sorted[1].driver}.`,
      highlight: true,
    })
  }

  return events
}
