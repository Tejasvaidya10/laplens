import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { TelemetryComparison } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDelta } from '@/lib/utils'

interface DeltaChartProps {
  data: TelemetryComparison
  height?: number
}

export function DeltaChart({ data, height = 200 }: DeltaChartProps) {
  const chartData = data.delta.map((point) => ({
    distance: point.distance,
    delta: point.timeDelta,
  }))

  const finalDelta = chartData[chartData.length - 1]?.delta ?? 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Lap Time Delta</CardTitle>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.driverA.color }}
            />
            <span className="text-sm">{data.driverA.code}</span>
            <span className="text-muted-foreground mx-2">vs</span>
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.driverB.color }}
            />
            <span className="text-sm">{data.driverB.code}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Final gap: <span className={finalDelta >= 0 ? 'text-green-500' : 'text-red-500'}>
            {formatDelta(finalDelta)}
          </span>
          {' '}({finalDelta >= 0 ? data.driverA.code : data.driverB.code} ahead)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="deltaPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="deltaNegative" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
            <XAxis
              dataKey="distance"
              tickFormatter={(value) => `${(value / 1000).toFixed(1)}km`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${value.toFixed(1)}s`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatDelta(value), 'Delta']}
              labelFormatter={(value) => `Distance: ${(value / 1000).toFixed(2)} km`}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="delta"
              stroke={finalDelta >= 0 ? '#22c55e' : '#ef4444'}
              fill={finalDelta >= 0 ? 'url(#deltaPositive)' : 'url(#deltaNegative)'}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
