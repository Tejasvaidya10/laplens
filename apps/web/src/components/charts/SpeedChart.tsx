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
import type { TelemetryComparison } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SpeedChartProps {
  data: TelemetryComparison
  height?: number
}

export function SpeedChart({ data, height = 300 }: SpeedChartProps) {
  // Merge telemetry data for chart
  const chartData = data.driverA.telemetry.map((point, index) => ({
    distance: point.distance,
    [`${data.driverA.code}`]: point.speed,
    [`${data.driverB.code}`]: data.driverB.telemetry[index]?.speed ?? null,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Speed Trace</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
            <XAxis
              dataKey="distance"
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}km`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${value}`}
              tick={{ fontSize: 12 }}
              label={{
                value: 'km/h',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value.toFixed(0)} km/h`]}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={data.driverA.code}
              stroke={data.driverA.color}
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey={data.driverB.code}
              stroke={data.driverB.color}
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
