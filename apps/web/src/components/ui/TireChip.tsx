import { cn } from '@/lib/utils'

interface TireChipProps {
  compound: string
  className?: string
}

export function TireChip({ compound, className }: TireChipProps) {
  const compoundLower = compound.toLowerCase()
  
  const colors: Record<string, string> = {
    soft: 'bg-red-500 text-white',
    medium: 'bg-yellow-500 text-black',
    hard: 'bg-white text-black',
    inter: 'bg-green-500 text-white',
    intermediate: 'bg-green-500 text-white',
    wet: 'bg-blue-500 text-white',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase',
        colors[compoundLower] || 'bg-zinc-600 text-white',
        className
      )}
    >
      {compound.charAt(0).toUpperCase()}
    </span>
  )
}
