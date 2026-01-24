import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'

interface ThrottleBrakeChartProps {
  data: any
  height?: number
}

export function ThrottleBrakeChart({ data, height = 300 }: ThrottleBrakeChartProps) {
  if (!data?.driverA?.data || !data?.driverB?.data) {
    return <div>No telemetry data available</div>
  }

  const driverACode = data.driverA.driver || 'Driver A'
  const driverBCode = data.driverB.driver || 'Driver B'

  // Prepare chart data with separate series for braking/not braking
  const { chartData, brakeStats } = useMemo(() => {
    const isBraking = (brake: number, isBinary: boolean) => {
      return isBinary ? brake > 0 : brake > 10
    }

    // Detect if brake data is binary
    const allBrakeValuesA = data.driverA.data.map((p: any) => p.brake).filter((v: number) => v !== null)
    const allBrakeValuesB = data.driverB.data.map((p: any) => p.brake).filter((v: number) => v !== null)
    const maxBrakeA = Math.max(...allBrakeValuesA)
    const maxBrakeB = Math.max(...allBrakeValuesB)
    const isBinaryA = maxBrakeA <= 1
    const isBinaryB = maxBrakeB <= 1

    let brakeZonesA = 0
    let brakeZonesB = 0
    let totalBrakeDistA = 0
    let totalBrakeDistB = 0
    let wasInBrakeA = false
    let wasInBrakeB = false
    let brakeStartA = 0
    let brakeStartB = 0

    const processed = data.driverA.data.map((point: any, index: number) => {
      const pointB = data.driverB.data[index]
      const brakingA = isBraking(point.brake, isBinaryA)
      const brakingB = pointB ? isBraking(pointB.brake, isBinaryB) : false

      // Track brake zones for A
      if (brakingA && !wasInBrakeA) {
        brakeZonesA++
        brakeStartA = point.distance
      }
      if (!brakingA && wasInBrakeA) {
        totalBrakeDistA += point.distance - brakeStartA
      }
      wasInBrakeA = brakingA

      // Track brake zones for B
      if (brakingB && !wasInBrakeB) {
        brakeZonesB++
        brakeStartB = point.distance
      }
      if (!brakingB && wasInBrakeB) {
        totalBrakeDistB += point.distance - brakeStartB
      }
      wasInBrakeB = brakingB

      return {
        distance: point.distance,
        // Driver A: throttle when NOT braking
        [`${driverACode}`]: !brakingA ? point.throttle : null,
        // Driver A: throttle when braking (shown in different color)
        [`${driverACode} Braking`]: brakingA ? point.throttle : null,
        // Driver B: throttle when NOT braking
        [`${driverBCode}`]: !brakingB ? (pointB?.throttle ?? null) : null,
        // Driver B: throttle when braking
        [`${driverBCode} Braking`]: brakingB ? (pointB?.throttle ?? null) : null,
      }
    })

    return {
      chartData: processed,
      brakeStats: {
        zonesA: brakeZonesA,
        zonesB: brakeZonesB,
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
          <span className="text-xs font-normal text-muted-foreground">
            Line color changes to red/orange when braking
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="distance"
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}km`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              label={{
                value: '%',
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
              formatter={(value: number, name: string) => {
                const braking = name.includes('Braking')
                const displayName = name.replace(' Braking', '')
                return [`${value?.toFixed(0)}% ${braking ? '(braking)' : ''}`, displayName]
              }}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <Legend 
              payload={[
                { value: `${driverACode} Throttle`, type: 'line', color: '#3b82f6' },
                { value: `${driverACode} Braking`, type: 'line', color: '#ef4444' },
                { value: `${driverBCode} Throttle`, type: 'line', color: '#22c55e' },
                { value: `${driverBCode} Braking`, type: 'line', color: '#f97316' },
              ]}
            />
            {/* Driver A - normal throttle (blue) */}
            <Line 
              type="monotone" 
              dataKey={driverACode}
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={2}
              connectNulls={false}
            />
            {/* Driver A - throttle while braking (red) */}
            <Line 
              type="monotone" 
              dataKey={`${driverACode} Braking`}
              stroke="#ef4444" 
              dot={false} 
              strokeWidth={2}
              connectNulls={false}
            />
            {/* Driver B - normal throttle (green) */}
            <Line 
              type="monotone" 
              dataKey={driverBCode}
              stroke="#22c55e" 
              dot={false} 
              strokeWidth={2}
              connectNulls={false}
            />
            {/* Driver B - throttle while braking (orange) */}
            <Line 
              type="monotone" 
              dataKey={`${driverBCode} Braking`}
              stroke="#f97316" 
              dot={false} 
              strokeWidth={2}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Brake zone statistics */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-blue-500">{driverACode}</div>
            <div className="text-muted-foreground">
              {brakeStats.zonesA} brake zones • {(brakeStats.totalDistanceA / 1000).toFixed(2)}km total
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-green-500">{driverBCode}</div>
            <div className="text-muted-foreground">
              {brakeStats.zonesB} brake zones • {(brakeStats.totalDistanceB / 1000).toFixed(2)}km total
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
