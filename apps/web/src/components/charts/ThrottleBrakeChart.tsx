import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'

interface ThrottleBrakeChartProps {
  data: any
  height?: number
}

interface BrakeZone {
  startDistance: number
  endDistance: number
  driver: string
}

export function ThrottleBrakeChart({ data, height = 300 }: ThrottleBrakeChartProps) {
  if (!data?.driverA?.data || !data?.driverB?.data) {
    return <div>No telemetry data available</div>
  }

  const driverACode = data.driverA.driver || 'Driver A'
  const driverBCode = data.driverB.driver || 'Driver B'

  // Detect if brake data is binary (0/1) or percentage (0-100)
  const { isBinaryBrake, brakeZonesA, brakeZonesB, brakeStats } = useMemo(() => {
    const allBrakeValuesA = data.driverA.data.map((p: any) => p.brake).filter((v: number) => v !== null)
    const allBrakeValuesB = data.driverB.data.map((p: any) => p.brake).filter((v: number) => v !== null)
    
    const maxBrakeA = Math.max(...allBrakeValuesA)
    const maxBrakeB = Math.max(...allBrakeValuesB)
    const isBinary = maxBrakeA <= 1 && maxBrakeB <= 1

    // Extract brake zones (continuous braking sections)
    const extractBrakeZones = (points: any[], driver: string): BrakeZone[] => {
      const zones: BrakeZone[] = []
      let inBrakeZone = false
      let zoneStart = 0

      points.forEach((point, i) => {
        const braking = isBinary ? point.brake > 0 : point.brake > 10
        
        if (braking && !inBrakeZone) {
          inBrakeZone = true
          zoneStart = point.distance
        } else if (!braking && inBrakeZone) {
          inBrakeZone = false
          zones.push({
            startDistance: zoneStart,
            endDistance: point.distance,
            driver,
          })
        }
      })

      // Close final zone if still braking
      if (inBrakeZone && points.length > 0) {
        zones.push({
          startDistance: zoneStart,
          endDistance: points[points.length - 1].distance,
          driver,
        })
      }

      return zones
    }

    const zonesA = extractBrakeZones(data.driverA.data, driverACode)
    const zonesB = extractBrakeZones(data.driverB.data, driverBCode)

    // Calculate brake stats
    const totalBrakeDistanceA = zonesA.reduce((sum, z) => sum + (z.endDistance - z.startDistance), 0)
    const totalBrakeDistanceB = zonesB.reduce((sum, z) => sum + (z.endDistance - z.startDistance), 0)

    return {
      isBinaryBrake: isBinary,
      brakeZonesA: zonesA,
      brakeZonesB: zonesB,
      brakeStats: {
        zonesA: zonesA.length,
        zonesB: zonesB.length,
        totalDistanceA: totalBrakeDistanceA,
        totalDistanceB: totalBrakeDistanceB,
      }
    }
  }, [data, driverACode, driverBCode])

  // Prepare chart data - scale binary brake to 100 for visibility
  const chartData = data.driverA.data.map((point: any, index: number) => {
    const brakeA = point.brake
    const brakeB = data.driverB.data[index]?.brake ?? null
    
    return {
      distance: point.distance,
      [`${driverACode} Throttle`]: point.throttle,
      [`${driverACode} Brake`]: isBinaryBrake ? (brakeA > 0 ? 100 : 0) : brakeA,
      [`${driverBCode} Throttle`]: data.driverB.data[index]?.throttle ?? null,
      [`${driverBCode} Brake`]: isBinaryBrake ? (brakeB > 0 ? 100 : 0) : brakeB,
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Throttle & Brake</span>
          {isBinaryBrake && (
            <span className="text-xs font-normal text-muted-foreground">
              Binary brake data (on/off)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            
            {/* Brake zones as shaded areas for Driver A */}
            {brakeZonesA.map((zone, i) => (
              <ReferenceArea
                key={`brake-a-${i}`}
                x1={zone.startDistance}
                x2={zone.endDistance}
                y1={0}
                y2={100}
                fill="#3b82f6"
                fillOpacity={0.1}
              />
            ))}
            
            {/* Brake zones as shaded areas for Driver B */}
            {brakeZonesB.map((zone, i) => (
              <ReferenceArea
                key={`brake-b-${i}`}
                x1={zone.startDistance}
                x2={zone.endDistance}
                y1={0}
                y2={100}
                fill="#22c55e"
                fillOpacity={0.1}
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
                if (name.includes('Brake') && isBinaryBrake) {
                  return [value > 0 ? 'ON' : 'OFF', name]
                }
                return [`${value?.toFixed(0)}%`, name]
              }}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={`${driverACode} Throttle`} 
              stroke="#3b82f6" 
              dot={false} 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey={`${driverACode} Brake`} 
              stroke="#ef4444" 
              dot={false} 
              strokeWidth={2}
              strokeDasharray={isBinaryBrake ? "5 5" : undefined}
            />
            <Line 
              type="monotone" 
              dataKey={`${driverBCode} Throttle`} 
              stroke="#22c55e" 
              dot={false} 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey={`${driverBCode} Brake`} 
              stroke="#f97316" 
              dot={false} 
              strokeWidth={2}
              strokeDasharray={isBinaryBrake ? "5 5" : undefined}
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
