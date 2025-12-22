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
import { TelemetryPoint } from '@/types';
import { getTeamColor } from '@/lib/utils';

interface GearChartProps {
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
}

export function GearChart({ driverA, driverB }: GearChartProps) {
  // Merge data by distance
  const mergedData = driverA.data.map((point, index) => ({
    distance: point.distance,
    [`${driverA.code}_gear`]: point.gear,
    [`${driverB.code}_gear`]: driverB.data[index]?.gear ?? null,
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
                {driverCode}: Gear {entry.value}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[250px]">
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
            domain={[0, 8]}
            ticks={[1, 2, 3, 4, 5, 6, 7, 8]}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value: string) => {
              const code = value.split('_')[0];
              return <span className="text-sm">{code}</span>;
            }}
          />
          <Line
            type="stepAfter"
            dataKey={`${driverA.code}_gear`}
            stroke={colorA}
            dot={false}
            strokeWidth={2}
            name={`${driverA.code}_gear`}
            connectNulls
          />
          <Line
            type="stepAfter"
            dataKey={`${driverB.code}_gear`}
            stroke={colorB}
            dot={false}
            strokeWidth={2}
            name={`${driverB.code}_gear`}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
