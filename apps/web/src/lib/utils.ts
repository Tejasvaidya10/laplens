import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toFixed(3).padStart(6, '0')}`
}

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(3)}s`
}

export function getCompoundColor(compound: string): string {
  const colors: Record<string, string> = {
    SOFT: '#FF3333',
    MEDIUM: '#FFD700',
    HARD: '#FFFFFF',
    INTERMEDIATE: '#43B02A',
    WET: '#0067AD',
  }
  return colors[compound] || '#888888'
}

export function getTeamColor(team: string): string {
  const teamColors: Record<string, string> = {
    'Red Bull Racing': '#3671C6',
    'Ferrari': '#E80020',
    'Mercedes': '#27F4D2',
    'McLaren': '#FF8000',
    'Aston Martin': '#229971',
    'Alpine': '#FF87BC',
    'Williams': '#64C4FF',
    'RB': '#6692FF',
    'Kick Sauber': '#52E252',
    'Haas F1 Team': '#B6BABD',
  }
  return teamColors[team] || '#888888'
}

export function downsampleData<T>(data: T[], targetPoints: number): T[] {
  if (data.length <= targetPoints) return data

  // Largest-Triangle-Three-Buckets algorithm
  const bucketSize = (data.length - 2) / (targetPoints - 2)
  const sampled: T[] = [data[0]]

  for (let i = 1; i < targetPoints - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1
    const bucketEnd = Math.floor(i * bucketSize) + 1
    const nextBucketStart = Math.floor(i * bucketSize) + 1
    const nextBucketEnd = Math.floor((i + 1) * bucketSize) + 1

    // Average of next bucket for comparison
    let avgX = 0
    let avgY = 0
    const nextBucketLength = Math.min(nextBucketEnd, data.length) - nextBucketStart

    for (let j = nextBucketStart; j < Math.min(nextBucketEnd, data.length); j++) {
      avgX += j
      avgY += (data[j] as Record<string, number>)['speed'] || 0
    }
    avgX /= nextBucketLength
    avgY /= nextBucketLength

    // Find point with max triangle area
    let maxArea = -1
    let maxIndex = bucketStart

    const prevPoint = sampled[sampled.length - 1] as Record<string, number>
    const prevX = sampled.length - 1
    const prevY = prevPoint['speed'] || 0

    for (let j = bucketStart; j < Math.min(bucketEnd, data.length); j++) {
      const currY = (data[j] as Record<string, number>)['speed'] || 0
      const area = Math.abs(
        (prevX - avgX) * (currY - prevY) - (prevX - j) * (avgY - prevY)
      ) * 0.5

      if (area > maxArea) {
        maxArea = area
        maxIndex = j
      }
    }

    sampled.push(data[maxIndex])
  }

  sampled.push(data[data.length - 1])
  return sampled
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateCacheKey(
  season: number,
  event: string,
  session: string,
  driverA: string,
  driverB: string,
  lapA?: number,
  lapB?: number
): string {
  const parts = [season, event, session, driverA, driverB]
  if (lapA) parts.push(String(lapA))
  if (lapB) parts.push(String(lapB))
  return parts.join(':')
}
