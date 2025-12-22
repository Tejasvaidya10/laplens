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

interface ThrottleBrakeChartProps {
  data: any
  height?: number
}

export function ThrottleBrakeChart({ data, height = 300 }: ThrottleBrakeChartProps) {
  if (!data?.driverA?.telemetry || !data?.driverB?.telemetry) {
    return <div>No telemetry data available</div>
  }

  const driverACode = data.driverA.driver || 'Driver A'
  const driverBCode = data.driverB.driver || 'Driver B'

  const chartData = data.driverA.telemetry.map((point: any, index: number) => ({
    distance: point.distance,
    [`${driverACode} Throttle`]: point.throttle,
    [`${driverACode} Brake`]: point.brake,
    [`${driverBCode} Throttle`]: data.driverB.telemetry[index]?.throttle ?? null,
    [`${driverBCode} Brake`]: data.driverB.telemetry[index]?.brake ?? null,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Throttle & Brake</CardTitle>
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
              formatter={(value: number) => [`${value?.toFixed(0)}%`]}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <Legend />
            <Line type="monotone" dataKey={`${driverACode} Throttle`} stroke="#3b82f6" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey={`${driverACode} Brake`} stroke="#ef4444" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey={`${driverBCode} Throttle`} stroke="#22c55e" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey={`${driverBCode} Brake`} stroke="#f97316" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
