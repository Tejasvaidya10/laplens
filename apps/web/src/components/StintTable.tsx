import { TireChip } from '@/components/ui/TireChip'

interface Stint {
  driver: string
  stintNumber: number
  compound: string
  startLap: number
  endLap: number
  avgLapTime: number
  degRate: number
}

interface StintTableProps {
  stints: Stint[]
}

function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

export function StintTable({ stints }: StintTableProps) {
  if (!stints || stints.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-500 text-center">No stint data available</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="font-semibold text-white mb-4">Stint Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-zinc-500 uppercase">
              <th className="pb-3">Driver</th>
              <th className="pb-3">Stint</th>
              <th className="pb-3">Tire</th>
              <th className="pb-3">Laps</th>
              <th className="pb-3">Avg Pace</th>
              <th className="pb-3">Degradation</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {stints.map((stint, i) => (
              <tr key={i} className="border-t border-zinc-800 text-zinc-300">
                <td className="py-3 font-medium">{stint.driver}</td>
                <td className="py-3">{stint.stintNumber}</td>
                <td className="py-3">
                  <TireChip compound={stint.compound} />
                </td>
                <td className="py-3">
                  {stint.startLap}-{stint.endLap}
                </td>
                <td className="py-3 font-mono">
                  {formatLapTime(stint.avgLapTime)}
                </td>
                <td className={`py-3 ${stint.degRate > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {stint.degRate > 0 ? '+' : ''}{stint.degRate.toFixed(3)}s/lap
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
