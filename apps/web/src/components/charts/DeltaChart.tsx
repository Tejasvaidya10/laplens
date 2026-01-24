import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeltaChartProps {
  data: any
  height?: number
}

export function DeltaChart({ data, height = 300 }: DeltaChartProps) {
  if (!data?.delta || data.delta.length === 0) {
    return <div>No delta data available</div>
  }

  const driverACode = data.driverA?.driver || 'Driver A'
  const driverBCode = data.driverB?.driver || 'Driver B'

  const chartData = data.delta.map((point: any) => ({
    distance: point.distance,
    delta: point.delta,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lap Time Delta ({driverACode} vs {driverBCode})</CardTitle>
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
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}s`}
              label={{
                value: 'Delta (s)',
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
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(3)}s`]}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="delta" stroke="#f59e0b" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      <p className="text-xs text-zinc-500 mt-2">Note: Chart based on telemetry data, may differ slightly from official times</p>
      </CardContent>
    </Card>
  )
}
