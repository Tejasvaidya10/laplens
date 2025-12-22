import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrackEvolution } from '@/types';
import { formatLapTime } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface TrackEvolutionChartProps {
  data: TrackEvolution[];
}

export function TrackEvolutionChart({ data }: TrackEvolutionChartProps) {
  // Calculate trend
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const avgFirstHalf = firstHalf.reduce((sum, d) => sum + d.best_lap_time, 0) / firstHalf.length;
  const avgSecondHalf = secondHalf.reduce((sum, d) => sum + d.best_lap_time, 0) / secondHalf.length;
  
  const improvement = avgFirstHalf - avgSecondHalf;
  const improvementPercent = (improvement / avgFirstHalf) * 100;

  const getTrendIndicator = () => {
    if (improvementPercent > 0.5) {
      return {
        icon: TrendingDown,
        text: 'Track Improving',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      };
    } else if (improvementPercent < -0.5) {
      return {
        icon: TrendingUp,
        text: 'Track Degrading',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
      };
    }
    return {
      icon: Minus,
      text: 'Track Stable',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    };
  };

  const trend = getTrendIndicator();
  const TrendIcon = trend.icon;

  // Find fastest lap
  const fastestLap = data.reduce((min, d) => 
    d.best_lap_time < min.best_lap_time ? d : min
  , data[0]);

  // Transform data for chart
  const chartData = data.map((d) => ({
    lap: d.lap,
    time: d.best_lap_time,
    driver: d.driver_code,
    compound: d.compound,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-muted-foreground text-sm mb-1">Lap {label}</p>
          <p className="font-mono font-medium text-lg">
            {formatLapTime(entry.time)}
          </p>
          <p className="text-sm text-muted-foreground">
            {entry.driver} on {entry.compound}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate Y axis domain with some padding
  const times = data.map((d) => d.best_lap_time);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const padding = (maxTime - minTime) * 0.1;

  return (
    <div className="w-full space-y-4">
      {/* Trend indicator */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${trend.bgColor}`}>
          <TrendIcon className={`w-5 h-5 ${trend.color}`} />
          <span className={`font-medium ${trend.color}`}>{trend.text}</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Fastest Lap</p>
          <p className="font-mono font-medium">
            {formatLapTime(fastestLap.best_lap_time)}
          </p>
          <p className="text-xs text-muted-foreground">
            {fastestLap.driver_code} - Lap {fastestLap.lap}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
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
              domain={[minTime - padding, maxTime + padding]}
              tickFormatter={(value) => formatLapTime(value)}
              reversed
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={fastestLap.best_lap_time}
              stroke="hsl(var(--primary))"
              strokeDasharray="5 5"
              label={{
                value: 'Fastest',
                position: 'right',
                fill: 'hsl(var(--primary))',
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{
                fill: 'hsl(var(--primary))',
                strokeWidth: 0,
                r: 3,
              }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--primary))',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Session Start</p>
          <p className="font-mono font-medium">
            {formatLapTime(data[0]?.best_lap_time ?? 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Session End</p>
          <p className="font-mono font-medium">
            {formatLapTime(data[data.length - 1]?.best_lap_time ?? 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Improvement</p>
          <p className={`font-mono font-medium ${improvement > 0 ? 'text-green-500' : improvement < 0 ? 'text-red-500' : ''}`}>
            {improvement > 0 ? '-' : '+'}{formatLapTime(Math.abs(improvement))}
          </p>
        </div>
      </div>
    </div>
  );
}
