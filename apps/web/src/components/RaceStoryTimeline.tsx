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

// Format seconds to readable time (e.g., 4575.7 -> "1:16:15.7" or 65.3 -> "1:05.3")
function formatGap(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  } else {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`
  }
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

  // Derive pit stops from stints data
  if (strategyData?.stints) {
    const driverStints = strategyData.stints.filter(
      (s: any) => s.driver === driverA || s.driver === driverB
    )
    
    // Group by driver
    const stintsByDriver: Record<string, any[]> = {}
    driverStints.forEach((stint: any) => {
      if (!stintsByDriver[stint.driver]) {
        stintsByDriver[stint.driver] = []
      }
      stintsByDriver[stint.driver].push(stint)
    })

    // Find pit stops (transition between stints)
    const pitStops: { driver: string; lap: number; newCompound: string }[] = []
    
    Object.entries(stintsByDriver).forEach(([driver, stints]) => {
      const sorted = stints.sort((a: any, b: any) => a.stintNumber - b.stintNumber)
      for (let i = 1; i < sorted.length; i++) {
        pitStops.push({
          driver,
          lap: sorted[i].startLap,
          newCompound: sorted[i].compound,
        })
      }
    })

    // Sort pit stops by lap
    pitStops.sort((a, b) => a.lap - b.lap)

    pitStops.forEach((pit) => {
      events.push({
        lap: `Lap ${pit.lap}`,
        title: `${pit.driver} Pit Stop`,
        content: `${pit.driver} pits for ${pit.newCompound || 'new tires'}.`,
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
    const gapSeconds = sorted[1].totalRaceTime - sorted[0].totalRaceTime
    const gapFormatted = formatGap(gapSeconds)

    events.push({
      lap: 'Finish',
      title: 'Checkered Flag',
      content: `${winner.driver} takes the win, finishing ${gapFormatted} ahead of ${sorted[1].driver}.`,
      highlight: true,
    })
  }

  return events
}
