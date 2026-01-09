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

interface GearChartProps {
  data: any
  height?: number
}

export function GearChart({ data, height = 300 }: GearChartProps) {
  if (!data?.driverA?.data || !data?.driverB?.data) {
    return <div>No telemetry data available</div>
  }

  const driverACode = data.driverA.driver || 'Driver A'
  const driverBCode = data.driverB.driver || 'Driver B'

  const chartData = data.driverA.data.map((point: any, index: number) => ({
    distance: point.distance,
    [driverACode]: point.gear,
    [driverBCode]: data.driverB.data[index]?.gear ?? null,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Gear</CardTitle>
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
              domain={[0, 8]}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8]}
              tick={{ fontSize: 12 }}
              label={{
                value: 'Gear',
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
              formatter={(value: number) => [`Gear ${value}`]}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <Legend />
            <Line type="stepAfter" dataKey={driverACode} stroke="#3b82f6" dot={false} strokeWidth={2} />
            <Line type="stepAfter" dataKey={driverBCode} stroke="#22c55e" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
