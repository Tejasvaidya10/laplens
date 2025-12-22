import { useMemo } from 'react';
import { StrategyData, TireStint } from '@/types';
import { getCompoundColor, getTeamColor } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StrategyChartProps {
  data: StrategyData;
}

export function StrategyChart({ data }: StrategyChartProps) {
  const totalLaps = data.total_laps;

  // Sort drivers by finishing position or alphabetically
  const sortedDrivers = useMemo(() => {
    return [...data.drivers].sort((a, b) => {
      const posA = a.stints[a.stints.length - 1]?.end_lap ?? 0;
      const posB = b.stints[b.stints.length - 1]?.end_lap ?? 0;
      return posB - posA;
    });
  }, [data.drivers]);

  return (
    <div className="w-full space-y-1">
      {/* Header with lap markers */}
      <div className="flex items-center mb-4">
        <div className="w-24 shrink-0" />
        <div className="flex-1 flex justify-between text-xs text-muted-foreground">
          <span>Lap 1</span>
          <span>Lap {Math.floor(totalLaps / 4)}</span>
          <span>Lap {Math.floor(totalLaps / 2)}</span>
          <span>Lap {Math.floor((totalLaps * 3) / 4)}</span>
          <span>Lap {totalLaps}</span>
        </div>
      </div>

      {/* Driver rows */}
      {sortedDrivers.map((driver) => (
        <DriverStrategyRow
          key={driver.code}
          driverCode={driver.code}
          team={driver.team}
          stints={driver.stints}
          totalLaps={totalLaps}
        />
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
        <CompoundLegendItem compound="SOFT" />
        <CompoundLegendItem compound="MEDIUM" />
        <CompoundLegendItem compound="HARD" />
        <CompoundLegendItem compound="INTERMEDIATE" />
        <CompoundLegendItem compound="WET" />
      </div>
    </div>
  );
}

interface DriverStrategyRowProps {
  driverCode: string;
  team: string;
  stints: TireStint[];
  totalLaps: number;
}

function DriverStrategyRow({ driverCode, team, stints, totalLaps }: DriverStrategyRowProps) {
  const teamColor = getTeamColor(team);

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Driver code */}
      <div className="w-24 shrink-0 flex items-center gap-2">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: teamColor }}
        />
        <span className="text-sm font-medium">{driverCode}</span>
      </div>

      {/* Stint bars */}
      <div className="flex-1 flex h-8 bg-muted/30 rounded overflow-hidden">
        <TooltipProvider delayDuration={0}>
          {stints.map((stint, index) => {
            const startPercent = ((stint.start_lap - 1) / totalLaps) * 100;
            const widthPercent = ((stint.end_lap - stint.start_lap + 1) / totalLaps) * 100;
            const compoundColor = getCompoundColor(stint.compound);

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className="h-full cursor-pointer transition-opacity hover:opacity-80 relative"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: compoundColor,
                      marginLeft: index === 0 ? `${startPercent}%` : 0,
                    }}
                  >
                    {/* Stint number */}
                    {widthPercent > 8 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                        {stint.end_lap - stint.start_lap + 1}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{stint.compound}</p>
                    <p className="text-muted-foreground">
                      Laps {stint.start_lap} - {stint.end_lap}
                    </p>
                    <p className="text-muted-foreground">
                      {stint.end_lap - stint.start_lap + 1} laps
                    </p>
                    {stint.pit_stop_lap && (
                      <p className="text-muted-foreground">
                        Pit: Lap {stint.pit_stop_lap}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}

interface CompoundLegendItemProps {
  compound: string;
}

function CompoundLegendItem({ compound }: CompoundLegendItemProps) {
  const color = getCompoundColor(compound);

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-muted-foreground capitalize">
        {compound.toLowerCase()}
      </span>
    </div>
  );
}
