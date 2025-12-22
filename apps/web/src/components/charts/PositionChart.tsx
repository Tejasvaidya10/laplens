import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PositionData } from '@/types';
import { getTeamColor } from '@/lib/utils';

interface PositionChartProps {
  data: PositionData[];
  highlightDrivers?: string[];
}

export function PositionChart({ data, highlightDrivers }: PositionChartProps) {
  // Transform data: create one entry per lap with all driver positions
  const maxLap = Math.max(...data.flatMap((d) => d.positions.map((p) => p.lap)));
  
  const chartData = [];
  for (let lap = 1; lap <= maxLap; lap++) {
    const lapData: Record<string, number | null> = { lap };
    data.forEach((driver) => {
      const positionEntry = driver.positions.find((p) => p.lap === lap);
      lapData[driver.code] = positionEntry?.position ?? null;
    });
    chartData.push(lapData);
  }

  // Create color map for drivers
  const driverColors = new Map<string, string>();
  data.forEach((driver) => {
    driverColors.set(driver.code, getTeamColor(driver.team));
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Sort by position
      const sortedPayload = [...payload]
        .filter((p: any) => p.value !== null)
        .sort((a: any, b: any) => a.value - b.value);

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-h-[300px] overflow-y-auto">
          <p className="text-muted-foreground text-sm mb-2 font-medium">
            Lap {label}
          </p>
          <div className="space-y-1">
            {sortedPayload.map((entry: any) => (
              <div
                key={entry.dataKey}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span style={{ color: entry.color }}>{entry.dataKey}</span>
                <span className="font-mono">P{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="lap"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            label={{
              value: 'Lap',
              position: 'insideBottom',
              offset: -5,
              fill: 'hsl(var(--muted-foreground))',
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            reversed
            domain={[1, 20]}
            ticks={[1, 5, 10, 15, 20]}
            label={{
              value: 'Position',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(var(--muted-foreground))',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value: string) => (
              <span className="text-xs">{value}</span>
            )}
          />
          {data.map((driver) => {
            const isHighlighted = !highlightDrivers || highlightDrivers.includes(driver.code);
            return (
              <Line
                key={driver.code}
                type="linear"
                dataKey={driver.code}
                stroke={driverColors.get(driver.code)}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={isHighlighted ? 1 : 0.3}
                dot={false}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
