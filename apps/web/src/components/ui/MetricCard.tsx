import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: number
  className?: string
}

export function MetricCard({ label, value, unit, trend, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-zinc-900 border border-zinc-800 rounded-lg p-4',
        className
      )}
    >
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div
          className={cn(
            'text-xs mt-1',
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-zinc-500'
          )}
        >
          {trend > 0 ? '+' : ''}{trend}
        </div>
      )}
    </div>
  )
}
