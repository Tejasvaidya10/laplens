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
} from 'recharts';
import { TelemetryPoint } from '@/types';
import { getTeamColor } from '@/lib/utils';

interface ThrottleBrakeChartProps {
  driverA: {
    code: string;
    team: string;
    data: TelemetryPoint[];
  };
  driverB: {
    code: string;
    team: string;
    data: TelemetryPoint[];
  };
  mode: 'throttle' | 'brake';
}

export function ThrottleBrakeChart({ driverA, driverB, mode }: ThrottleBrakeChartProps) {
  // Merge data by distance
  const mergedData = driverA.data.map((point, index) => ({
    distance: point.distance,
    [`${driverA.code}_value`]: mode === 'throttle' ? point.throttle : point.brake,
    [`${driverB.code}_value`]: driverB.data[index]
      ? mode === 'throttle'
        ? driverB.data[index].throttle
        : driverB.data[index].brake
      : null,
  }));

  const colorA = getTeamColor(driverA.team);
  const colorB = getTeamColor(driverB.team);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-muted-foreground text-sm mb-2">
            Distance: {Math.round(label)}m
          </p>
          {payload.map((entry: any, index: number) => {
            const driverCode = entry.dataKey.split('_')[0];
            return (
              <p
                key={index}
                className="text-sm font-medium"
                style={{ color: entry.color }}
              >
                {driverCode}: {entry.value?.toFixed(0)}%
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mergedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="distance"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}km`}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value: string) => {
              const code = value.split('_')[0];
              return <span className="text-sm">{code}</span>;
            }}
          />
          <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" opacity={0.5} />
          <Line
            type="stepAfter"
            dataKey={`${driverA.code}_value`}
            stroke={colorA}
            dot={false}
            strokeWidth={2}
            name={`${driverA.code}_${mode}`}
            connectNulls
          />
          <Line
            type="stepAfter"
            dataKey={`${driverB.code}_value`}
            stroke={colorB}
            dot={false}
            strokeWidth={2}
            name={`${driverB.code}_${mode}`}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
