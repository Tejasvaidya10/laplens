import React from 'react';

interface SectorTimes {
  sector1: number | null;
  sector2: number | null;
  sector3: number | null;
}

interface SectorComparisonProps {
  sectorsA: SectorTimes | null;
  sectorsB: SectorTimes | null;
  driverA: string;
  driverB: string;
  teamColorA?: string;
  teamColorB?: string;
}

const formatTime = (seconds: number | null): string => {
  if (seconds === null) return '-';
  return seconds.toFixed(3);
};

const SectorComparison: React.FC<SectorComparisonProps> = ({
  sectorsA,
  sectorsB,
  driverA,
  driverB,
  teamColorA = '#3b82f6',
  teamColorB = '#ef4444',
}) => {
  if (!sectorsA || !sectorsB) return null;

  const sectors = [
    { name: 'S1', a: sectorsA.sector1, b: sectorsB.sector1 },
    { name: 'S2', a: sectorsA.sector2, b: sectorsB.sector2 },
    { name: 'S3', a: sectorsA.sector3, b: sectorsB.sector3 },
  ];

  const getDelta = (a: number | null, b: number | null): string => {
    if (a === null || b === null) return '-';
    const delta = a - b;
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(3)}`;
  };

  const getWinner = (a: number | null, b: number | null): 'a' | 'b' | 'tie' => {
    if (a === null || b === null) return 'tie';
    if (a < b) return 'a';
    if (b < a) return 'b';
    return 'tie';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Sector Times</h3>
      
      <div className="grid grid-cols-4 gap-2 text-sm">
        {/* Header */}
        <div className="text-zinc-500"></div>
        <div className="text-center font-medium" style={{ color: teamColorA }}>{driverA}</div>
        <div className="text-center font-medium" style={{ color: teamColorB }}>{driverB}</div>
        <div className="text-center text-zinc-500">Delta</div>
        
        {/* Sector rows */}
        {sectors.map((sector) => {
          const winner = getWinner(sector.a, sector.b);
          return (
            <React.Fragment key={sector.name}>
              <div className="text-zinc-400 font-medium py-2">{sector.name}</div>
              <div 
                className={`text-center py-2 rounded ${winner === 'a' ? 'bg-green-500/20 text-green-400' : 'text-zinc-300'}`}
              >
                {formatTime(sector.a)}
              </div>
              <div 
                className={`text-center py-2 rounded ${winner === 'b' ? 'bg-green-500/20 text-green-400' : 'text-zinc-300'}`}
              >
                {formatTime(sector.b)}
              </div>
              <div className={`text-center py-2 ${
                winner === 'a' ? 'text-green-400' : winner === 'b' ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {getDelta(sector.a, sector.b)}
              </div>
            </React.Fragment>
          );
        })}
        
        {/* Total row */}
        <div className="text-zinc-400 font-medium py-2 border-t border-zinc-700 mt-2 pt-4">Total</div>
        <div className="text-center py-2 border-t border-zinc-700 mt-2 pt-4 text-zinc-300">
          {sectorsA.sector1 && sectorsA.sector2 && sectorsA.sector3 
            ? formatTime(sectorsA.sector1 + sectorsA.sector2 + sectorsA.sector3)
            : '-'}
        </div>
        <div className="text-center py-2 border-t border-zinc-700 mt-2 pt-4 text-zinc-300">
          {sectorsB.sector1 && sectorsB.sector2 && sectorsB.sector3 
            ? formatTime(sectorsB.sector1 + sectorsB.sector2 + sectorsB.sector3)
            : '-'}
        </div>
        <div className="text-center py-2 border-t border-zinc-700 mt-2 pt-4">
          {sectorsA.sector1 && sectorsA.sector2 && sectorsA.sector3 && sectorsB.sector1 && sectorsB.sector2 && sectorsB.sector3
            ? getDelta(
                sectorsA.sector1 + sectorsA.sector2 + sectorsA.sector3,
                sectorsB.sector1 + sectorsB.sector2 + sectorsB.sector3
              )
            : '-'}
        </div>
      </div>
    </div>
  );
};

export default SectorComparison;
