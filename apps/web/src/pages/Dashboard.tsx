import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useSessionStore } from '@/hooks/use-session-store'
import { Sidebar } from '@/components/Sidebar'
import { LandingPage } from '@/components/LandingPage'
import { EmptyState } from '@/components/EmptyState'
import { LoadingState } from '@/components/LoadingState'
import { InsightsPanel } from '@/components/InsightsPanel'
import { StintTable } from '@/components/StintTable'
import { RaceStoryTimeline, generateRaceStoryEvents } from '@/components/RaceStoryTimeline'
import { Badge } from '@/components/ui/Badge'
import { SpeedChart, ThrottleBrakeChart, GearChart, DeltaChart, RacePaceChart } from '@/components/charts'
import {
  getSpeedInsights,
  getThrottleBrakeInsights,
  getGearInsights,
  getDeltaInsights,
  getRacePaceInsights,
} from '@/lib/insights'

type ViewState = 'landing' | 'app' | 'loading'
type TabId = 'speed' | 'throttle' | 'gear' | 'delta' | 'pace' | 'story'

export function Dashboard() {
  const [viewState, setViewState] = useState<ViewState>('landing')
  const [activeTab, setActiveTab] = useState<TabId>('speed')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const { season, event, session, driverA, driverB, setSeason, setEvent, setSession } = useSessionStore()

  const hasAllSelections = season && event && session && driverA && driverB

  // Telemetry query
  const {
    data: telemetry,
    refetch: refetchTelemetry,
  } = useQuery({
    queryKey: ['telemetry', season, event, session, driverA, driverB],
    queryFn: () =>
      api.compareTelemetry({
        season: season!,
        event: event!,
        session: session!,
        driverA: driverA!,
        driverB: driverB!,
      }),
    enabled: false,
    staleTime: 1000 * 60 * 30,
    cacheTime: 1000 * 60 * 60,
  })

  // Race pace query
  const { data: racePace, refetch: refetchRacePace } = useQuery({
    queryKey: ['racePace', season, event, session, driverA, driverB],
    queryFn: () => api.getRacePace(season!, event!, session!, [driverA!, driverB!]),
    enabled: false,
    staleTime: 1000 * 60 * 30,
  })

  // Strategy query (for story)
  const { data: strategy, refetch: refetchStrategy } = useQuery({
    queryKey: ['strategy', season, event, session],
    queryFn: () => api.getStrategy(season!, event!, session!),
    enabled: false,
    staleTime: 1000 * 60 * 30,
  })

  // Positions query (for story)
  const { data: positions, refetch: refetchPositions } = useQuery({
    queryKey: ['positions', season, event, session],
    queryFn: () => api.getPositions(season!, event!, session!),
    enabled: false,
    staleTime: 1000 * 60 * 30,
  })

  const handleRunAnalysis = async () => {
    if (!hasAllSelections) return

    setIsAnalyzing(true)
    setViewState('loading')
    setLoadingStep(0)

    try {
      // Step 1: Fetch telemetry
      setLoadingStep(1)
      await refetchTelemetry()

      // Step 2: Fetch race pace if race session
      setLoadingStep(2)
      if (session === 'R') {
        await refetchRacePace()
        await refetchStrategy()
        await refetchPositions()
      }

      // Step 3: Done
      setLoadingStep(3)
      await new Promise((r) => setTimeout(r, 500))

      setViewState('app')
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuickStart = (preset: { season: number; event: string; session: string }) => {
    setSeason(preset.season)
    setEvent(preset.event)
    setSession(preset.session)
    setViewState('app')
  }

  // Generate insights
  const speedInsights = useMemo(() => (telemetry ? getSpeedInsights(telemetry) : []), [telemetry])
  const throttleInsights = useMemo(() => (telemetry ? getThrottleBrakeInsights(telemetry) : []), [telemetry])
  const gearInsights = useMemo(() => (telemetry ? getGearInsights(telemetry) : []), [telemetry])
  const deltaInsights = useMemo(() => (telemetry ? getDeltaInsights(telemetry) : []), [telemetry])
  const paceInsights = useMemo(() => (racePace ? getRacePaceInsights(racePace) : []), [racePace])

  // Generate story events
  const storyEvents = useMemo(() => {
    if (session === 'R' && racePace && driverA && driverB) {
      return generateRaceStoryEvents(racePace, strategy, positions, driverA, driverB)
    }
    return []
  }, [racePace, strategy, positions, driverA, driverB, session])

  // Generate stint data for table
  const stintData = useMemo(() => {
    if (!racePace?.drivers) return []
    return racePace.drivers.flatMap((d: any) =>
      d.stints.map((s: any) => ({
        driver: d.driver,
        stintNumber: s.stintNumber,
        compound: s.compound,
        startLap: s.startLap,
        endLap: s.endLap,
        avgLapTime: s.avgLapTime,
        degRate: s.degRate,
      }))
    )
  }, [racePace])

  // Metrics for current tab
  const currentMetrics = useMemo(() => {
    if (!telemetry) return []
    const dA = telemetry.driverA
    const dB = telemetry.driverB

    if (activeTab === 'speed') {
      const maxA = dA?.data?.length ? Math.max(...dA.data.map((p: any) => p.speed)) : 0
      const maxB = dB?.data?.length ? Math.max(...dB.data.map((p: any) => p.speed)) : 0
      return [
        { label: 'Top Speed A', value: Math.round(maxA), unit: 'km/h' },
        { label: 'Top Speed B', value: Math.round(maxB), unit: 'km/h' },
      ]
    }

    if (activeTab === 'delta' && dA?.lapTime && dB?.lapTime) {
      const diff = dA.lapTime - dB.lapTime
      return [
        { label: 'Lap Delta', value: `${diff > 0 ? '+' : ''}${diff.toFixed(3)}`, unit: 's' },
      ]
    }

    return []
  }, [telemetry, activeTab])

  // Landing page
  if (viewState === 'landing') {
    return <LandingPage onOpenApp={() => setViewState('app')} />
  }

  // Loading state
  if (viewState === 'loading') {
    return (
      <div className="flex h-screen">
        <Sidebar onRunAnalysis={handleRunAnalysis} isLoading={true} />
        <LoadingState currentStep={loadingStep} />
      </div>
    )
  }

  // App view
  const tabs = [
    { id: 'speed' as TabId, label: 'Speed' },
    { id: 'throttle' as TabId, label: 'Throttle/Brake' },
    { id: 'gear' as TabId, label: 'Gear' },
    { id: 'delta' as TabId, label: 'Delta' },
    ...(session === 'R' ? [{ id: 'pace' as TabId, label: 'Race Pace' }] : []),
    ...(session === 'R' || session === 'Q' ? [{ id: 'story' as TabId, label: 'Story' }] : []),
  ]

  const currentInsights = {
    speed: speedInsights,
    throttle: throttleInsights,
    gear: gearInsights,
    delta: deltaInsights,
    pace: paceInsights,
    story: [],
  }[activeTab]

  return (
    <div className="flex h-screen">
      <Sidebar onRunAnalysis={handleRunAnalysis} onLogoClick={() => setViewState('landing')} isLoading={isAnalyzing} />

      <div className="flex-1 bg-zinc-950 p-8 overflow-auto">
        {telemetry ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {season} {event}, {session === 'Q' ? 'Qualifying' : session === 'R' ? 'Race' : session}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge>{session === 'Q' ? 'Qualifying' : session === 'R' ? 'Race' : session}</Badge>
                  <Badge variant="green">Cached</Badge>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      activeTab === tab.id
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Chart */}
              <div className="xl:col-span-2">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  {activeTab === 'speed' && <SpeedChart data={telemetry} />}
                  {activeTab === 'throttle' && <ThrottleBrakeChart data={telemetry} />}
                  {activeTab === 'gear' && <GearChart data={telemetry} />}
                  {activeTab === 'delta' && <DeltaChart data={telemetry} />}
                  {activeTab === 'pace' && racePace && <RacePaceChart data={racePace} />}
                  {activeTab === 'story' && (
                    <RaceStoryTimeline events={storyEvents} />
                  )}
                </div>
              </div>

              {/* Insights Panel */}
              {activeTab !== 'story' && (
                <InsightsPanel insights={currentInsights} metrics={currentMetrics} />
              )}
            </div>

            {/* Stint Table (Race Pace tab only) */}
            {activeTab === 'pace' && stintData.length > 0 && (
              <div className="mt-6">
                <StintTable stints={stintData} />
              </div>
            )}
          </>
        ) : (
          <EmptyState onQuickStart={handleQuickStart} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
