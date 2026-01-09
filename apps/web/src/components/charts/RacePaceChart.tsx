import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LapTimePoint {
  lap: number
  lapTime: number
  compound: string
  stint: number
  isPitLap: boolean
  isOutlier: boolean
}

interface StintSummary {
  stintNumber: number
  compound: string
  startLap: number
  endLap: number
  totalLaps: number
  avgLapTime: number
  bestLapTime: number
  degRate: number
}

interface DriverRacePace {
  driver: string
  team: string
  teamColor: string
  laps: LapTimePoint[]
  stints: StintSummary[]
  totalRaceTime: number
}

interface RacePaceChartProps {
  data: {
    drivers: DriverRacePace[]
    totalLaps: number
    safetyCarLaps: number[]
    vscLaps: number[]
  }
  height?: number
}

// Tire compound colors
const COMPOUND_COLORS: Record<string, string> = {
  SOFT: '#ef4444',
  MEDIUM: '#eab308',
  HARD: '#f5f5f5',
  INTERMEDIATE: '#22c55e',
  WET: '#3b82f6',
  UNKNOWN: '#6b7280',
}

// Format lap time as M:SS.mmm
const formatLapTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

export function RacePaceChart({ data, height = 400 }: RacePaceChartProps) {
  if (!data?.drivers?.length) {
    return <div>No race pace data available</div>
  }

  // Prepare chart data - merge all drivers' laps
  const { chartData, yDomain } = useMemo(() => {
    const lapMap = new Map<number, any>()
    
    // Initialize all laps
    for (let lap = 1; lap <= data.totalLaps; lap++) {
      lapMap.set(lap, { lap })
    }
    
    // Add each driver's data
    let minTime = Infinity
    let maxTime = 0
    
    data.drivers.forEach((driver) => {
      driver.laps.forEach((lapData) => {
        const entry = lapMap.get(lapData.lap)
        if (entry) {
          // Only include non-pit, non-outlier laps for cleaner visualization
          if (!lapData.isOutlier) {
            entry[driver.driver] = lapData.lapTime
            entry[`${driver.driver}_compound`] = lapData.compound
            entry[`${driver.driver}_stint`] = lapData.stint
            
            minTime = Math.min(minTime, lapData.lapTime)
            maxTime = Math.max(maxTime, lapData.lapTime)
          }
        }
      })
    })
    
    // Add padding to y-axis
    const padding = (maxTime - minTime) * 0.1
    
    return {
      chartData: Array.from(lapMap.values()).sort((a, b) => a.lap - b.lap),
      yDomain: [Math.floor(minTime - padding), Math.ceil(maxTime + padding)] as [number, number],
    }
  }, [data])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">Lap {label}</p>
        {payload.map((entry: any, index: number) => {
          const driver = entry.dataKey
          const compound = entry.payload[`${driver}_compound`]
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              <span>{driver}:</span>
              <span className="font-mono">{formatLapTime(entry.value)}</span>
              {compound && (
                <span
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: COMPOUND_COLORS[compound] || COMPOUND_COLORS.UNKNOWN,
                    color: compound === 'HARD' ? '#000' : '#fff',
                  }}
                >
                  {compound[0]}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Race Pace Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            
            {/* Safety car periods would be shown as shaded areas */}
            {data.safetyCarLaps.map((lap, i) => (
              <ReferenceArea
                key={`sc-${i}`}
                x1={lap}
                x2={lap + 1}
                fill="#fbbf24"
                fillOpacity={0.2}
              />
            ))}
            
            <XAxis
              dataKey="lap"
              tick={{ fontSize: 12 }}
              label={{
                value: 'Lap',
                position: 'insideBottom',
                offset: -5,
                style: { fontSize: 12 },
              }}
            />
            <YAxis
              domain={yDomain}
              tickFormatter={(value) => formatLapTime(value)}
              tick={{ fontSize: 11 }}
              width={70}
              label={{
                value: 'Lap Time',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {data.drivers.map((driver) => (
              <Line
                key={driver.driver}
                type="monotone"
                dataKey={driver.driver}
                stroke={driver.teamColor}
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Stint Summary Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Stint Analysis</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-2">Driver</th>
                  <th className="text-left py-2 px-2">Stint</th>
                  <th className="text-left py-2 px-2">Tire</th>
                  <th className="text-left py-2 px-2">Laps</th>
                  <th className="text-right py-2 px-2">Avg Pace</th>
                  <th className="text-right py-2 px-2">Best</th>
                  <th className="text-right py-2 px-2">Deg/Lap</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers.flatMap((driver) =>
                  driver.stints.map((stint) => (
                    <tr
                      key={`${driver.driver}-${stint.stintNumber}`}
                      className="border-b border-gray-800"
                    >
                      <td className="py-2 px-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: driver.teamColor }}
                        />
                        {driver.driver}
                      </td>
                      <td className="py-2 px-2">{stint.stintNumber}</td>
                      <td className="py-2 px-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: COMPOUND_COLORS[stint.compound] || COMPOUND_COLORS.UNKNOWN,
                            color: stint.compound === 'HARD' ? '#000' : '#fff',
                          }}
                        >
                          {stint.compound}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        {stint.startLap}-{stint.endLap} ({stint.totalLaps})
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {formatLapTime(stint.avgLapTime)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        {formatLapTime(stint.bestLapTime)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono">
                        <span className={stint.degRate > 0.1 ? 'text-red-400' : stint.degRate < 0.05 ? 'text-green-400' : ''}>
                          {stint.degRate > 0 ? '+' : ''}{stint.degRate.toFixed(3)}s
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Tire Compound Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {Object.entries(COMPOUND_COLORS).filter(([k]) => k !== 'UNKNOWN').map(([compound, color]) => (
            <div key={compound} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{compound}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
