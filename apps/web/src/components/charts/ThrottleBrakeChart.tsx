import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'

interface ThrottleBrakeChartProps {
  data: any
  height?: number
}

interface BrakeZone {
  start: number
  end: number
}

export function ThrottleBrakeChart({ data, height = 300 }: ThrottleBrakeChartProps) {
  if (!data?.driverA?.data || !data?.driverB?.data) {
    return <div>No telemetry data available</div>
  }

  const driverACode = data.driverA.driver || 'Driver A'
  const driverBCode = data.driverB.driver || 'Driver B'

  const { chartData, brakeZonesA, brakeZonesB, brakeStats } = useMemo(() => {
    // Detect if brake data is binary
    const allBrakeValuesA = data.driverA.data.map((p: any) => p.brake).filter((v: number) => v !== null)
    const allBrakeValuesB = data.driverB.data.map((p: any) => p.brake).filter((v: number) => v !== null)
    const maxBrakeA = Math.max(...allBrakeValuesA)
    const maxBrakeB = Math.max(...allBrakeValuesB)
    const isBinaryA = maxBrakeA <= 1
    const isBinaryB = maxBrakeB <= 1

    const isBraking = (brake: number, isBinary: boolean) => {
      return isBinary ? brake > 0 : brake > 10
    }

    // Extract brake zones
    const extractBrakeZones = (points: any[], isBinary: boolean): BrakeZone[] => {
      const zones: BrakeZone[] = []
      let inZone = false
      let zoneStart = 0

      points.forEach((point) => {
        const braking = isBraking(point.brake, isBinary)
        if (braking && !inZone) {
          inZone = true
          zoneStart = point.distance
        } else if (!braking && inZone) {
          inZone = false
          zones.push({ start: zoneStart, end: point.distance })
        }
      })

      if (inZone && points.length > 0) {
        zones.push({ start: zoneStart, end: points[points.length - 1].distance })
      }

      return zones
    }

    const zonesA = extractBrakeZones(data.driverA.data, isBinaryA)
    const zonesB = extractBrakeZones(data.driverB.data, isBinaryB)

    // Calculate stats
    const totalBrakeDistA = zonesA.reduce((sum, z) => sum + (z.end - z.start), 0)
    const totalBrakeDistB = zonesB.reduce((sum, z) => sum + (z.end - z.start), 0)

    // Prepare chart data - just throttle values
    const processed = data.driverA.data.map((point: any, index: number) => {
      const pointB = data.driverB.data[index]
      return {
        distance: point.distance,
        [driverACode]: point.throttle,
        [driverBCode]: pointB?.throttle ?? null,
      }
    })

    return {
      chartData: processed,
      brakeZonesA: zonesA,
      brakeZonesB: zonesB,
      brakeStats: {
        zonesA: zonesA.length,
        zonesB: zonesB.length,
        totalDistanceA: totalBrakeDistA,
        totalDistanceB: totalBrakeDistB,
      }
    }
  }, [data, driverACode, driverBCode])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Throttle & Brake (Fastest Lap)</span>
        </CardTitle>
        <p className="text-xs text-zinc-500">Shaded areas show braking zones</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            
            {/* Driver A brake zones - blue shaded */}
            {brakeZonesA.map((zone, i) => (
              <ReferenceArea
                key={`brake-a-${i}`}
                x1={zone.start}
                x2={zone.end}
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            ))}
            
            {/* Driver B brake zones - green shaded */}
            {brakeZonesB.map((zone, i) => (
              <ReferenceArea
                key={`brake-b-${i}`}
                x1={zone.start}
                x2={zone.end}
                fill="#22c55e"
                fillOpacity={0.2}
              />
            ))}

            <XAxis
              dataKey="distance"
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}km`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Throttle %',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [`${value?.toFixed(0)}%`, name]}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            
            {/* Driver A throttle line */}
            <Line 
              type="monotone" 
              dataKey={driverACode}
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={2}
              name={driverACode}
            />
            
            {/* Driver B throttle line */}
            <Line 
              type="monotone" 
              dataKey={driverBCode}
              stroke="#22c55e" 
              dot={false} 
              strokeWidth={2}
              name={driverBCode}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Legend and brake stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <div className="w-4 h-3 bg-blue-500/20"></div>
            </div>
            <div>
              <span className="font-medium text-blue-500">{driverACode}</span>
              <span className="text-zinc-500 ml-2">{brakeStats.zonesA} brakes • {(brakeStats.totalDistanceA / 1000).toFixed(2)}km</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <div className="w-4 h-3 bg-green-500/20"></div>
            </div>
            <div>
              <span className="font-medium text-green-500">{driverBCode}</span>
              <span className="text-zinc-500 ml-2">{brakeStats.zonesB} brakes • {(brakeStats.totalDistanceB / 1000).toFixed(2)}km</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
