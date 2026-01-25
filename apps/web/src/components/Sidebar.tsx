import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftRight, Loader2, Play } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/hooks/use-session-store'

interface SidebarProps {
  onRunAnalysis: () => void
  onLogoClick?: () => void
  isLoading?: boolean
}

export function Sidebar({ onRunAnalysis, onLogoClick, isLoading }: SidebarProps) {
  const {
    season,
    event,
    session,
    driverA,
    driverB,
    setSeason,
    setEvent,
    setSession,
    setDriverA,
    setDriverB,
    swapDrivers,
  } = useSessionStore()

  const queryClient = useQueryClient()

  // Fetch seasons
  const { data: seasons } = useQuery({
    queryKey: ['seasons'],
    queryFn: () => api.getSeasons(),
  })

  // Fetch events
  const { data: events } = useQuery({
    queryKey: ['events', season],
    queryFn: () => api.getEvents(season!),
    enabled: !!season,
  })

  // Fetch sessions
  const { data: sessions } = useQuery({
    queryKey: ['sessions', season, event],
    queryFn: () => api.getSessions(season!, event!),
    enabled: !!season && !!event,
  })

  // Fetch drivers (warms cache)
  const { data: drivers, isFetching: driversFetching } = useQuery({
    queryKey: ['drivers', season, event, session],
    queryFn: () => api.getDrivers(season!, event!, session!),
    enabled: !!season && !!event && !!session,
    staleTime: 1000 * 60 * 60,
  })

  const canAnalyze = season && event && session && driverA && driverB && !isLoading

  return (
    <div className="w-72 bg-zinc-950 border-r border-zinc-900 p-5 flex flex-col h-full">
      {/* Logo - Clickable */}
      <button 
        onClick={onLogoClick}
        className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
      >
        <img src="/logo.png" alt="LapLens" className="w-8 h-8 rounded-lg" />
        <span className="text-lg font-bold text-white">LapLens</span>
      </button>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
          Setup
        </div>

        {/* Season */}
        <Dropdown
          label="Season"
          value={season?.toString() || ''}
          options={seasons?.map((s) => ({ value: s.year.toString(), label: s.year.toString() })) || []}
          onChange={(v) => {
            setSeason(parseInt(v))
            setEvent(null)
            setSession(null)
          }}
        />

        {/* Event */}
        <Dropdown
          label="Event"
          value={event || ''}
          options={events?.map((e) => ({ value: e.eventName, label: e.eventName })) || []}
          onChange={(v) => {
            setEvent(v)
            setSession(null)
          }}
          disabled={!season}
        />

        {/* Session */}
        <div className="relative">
          <Dropdown
            label="Session"
            value={session || ''}
            options={sessions?.map((s) => ({ value: s.name, label: s.name })) || []}
            onChange={(v) => {
              setSession(v)
              // Pre-fetch drivers
              if (season && event) {
                queryClient.prefetchQuery({
                  queryKey: ['drivers', season, event, v],
                  queryFn: () => api.getDrivers(season, event, v),
                })
              }
            }}
            disabled={!event}
          />
          {driversFetching && (
            <div className="absolute right-10 top-8">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            </div>
          )}
        </div>

        {/* Drivers Section */}
        <div className="pt-4 border-t border-zinc-900">
          <div className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-4">
            Drivers
          </div>

          <Dropdown
            label="Driver A"
            value={driverA || ''}
            options={drivers?.map((d) => ({ value: d.code, label: `${d.name}` })) || []}
            onChange={setDriverA}
            disabled={!session}
          />

          {/* Swap Button */}
          <div className="flex justify-center my-2">
            <button
              onClick={swapDrivers}
              disabled={!driverA || !driverB}
              className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition disabled:opacity-50"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <Dropdown
            label="Driver B"
            value={driverB || ''}
            options={drivers?.map((d) => ({ value: d.code, label: `${d.name}` })) || []}
            onChange={setDriverB}
            disabled={!session}
          />
        </div>

        {/* Run Analysis Button */}
        <Button
          className="w-full mt-6"
          onClick={onRunAnalysis}
          disabled={!canAnalyze}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>

        {/* Quick Links */}
        <div className="flex gap-4 justify-center">
          <button className="text-sm text-blue-400 hover:text-blue-300">
            Quick Start
          </button>
          <button className="text-sm text-zinc-500 hover:text-zinc-300">
            Glossary
          </button>
        </div>

        <p className="text-xs text-zinc-600 text-center mt-2">
          First load may take 30-90 seconds, then cached
        </p>
      </div>
    </div>
  )
}

// Dropdown subcomponent
function Dropdown({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      <div className={`relative ${disabled ? 'opacity-50' : ''}`}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
