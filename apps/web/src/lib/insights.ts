/**
 * Deterministic insight generation for "What to look for" callouts
 * Uses only data already fetched - no guessing
 * Each bullet includes at least one number
 */

interface TelemetryData {
  driverA: {
    driver: string
    lapTime?: number
    data: Array<{
      distance: number
      speed: number
      throttle: number
      brake: number
      gear: number
    }>
  }
  driverB: {
    driver: string
    lapTime?: number
    data: Array<{
      distance: number
      speed: number
      throttle: number
      brake: number
      gear: number
    }>
  }
  delta?: Array<{ distance: number; delta: number }>
}

interface RacePaceData {
  drivers: Array<{
    driver: string
    laps: Array<{ lap: number; lapTime: number; compound: string; stint: number }>
    stints: Array<{
      stintNumber: number
      compound: string
      avgLapTime: number
      bestLapTime: number
      degRate: number
      totalLaps: number
    }>
    totalRaceTime: number
  }>
  totalLaps: number
}

// Format lap time as M:SS.mmm
function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3)
  return `${mins}:${secs.padStart(6, '0')}`
}

// Format delta with sign
function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : ''
  return `${sign}${delta.toFixed(3)}s`
}

/**
 * Generate speed chart insights
 */
export function getSpeedInsights(data: TelemetryData): string[] {
  if (!data?.driverA?.data?.length || !data?.driverB?.data?.length) {
    return ['Data not available for analysis']
  }

  const insights: string[] = []
  const dA = data.driverA
  const dB = data.driverB

  // Find max speeds
  const maxSpeedA = Math.max(...dA.data.map(p => p.speed))
  const maxSpeedB = Math.max(...dB.data.map(p => p.speed))
  const speedDiff = Math.abs(maxSpeedA - maxSpeedB)

  if (speedDiff > 2) {
    const faster = maxSpeedA > maxSpeedB ? dA.driver : dB.driver
    const fasterSpeed = Math.max(maxSpeedA, maxSpeedB)
    insights.push(`${faster} reaches ${Math.round(fasterSpeed)} km/h top speed, ${Math.round(speedDiff)} km/h faster`)
  }

  // Find minimum corner speeds (slowest points)
  const minSpeedA = Math.min(...dA.data.map(p => p.speed))
  const minSpeedB = Math.min(...dB.data.map(p => p.speed))
  const cornerDiff = Math.abs(minSpeedA - minSpeedB)

  if (cornerDiff > 3) {
    const faster = minSpeedA > minSpeedB ? dA.driver : dB.driver
    insights.push(`${faster} carries ${Math.round(cornerDiff)} km/h more through slowest corner`)
  }

  // Lap time comparison
  if (dA.lapTime && dB.lapTime) {
    const diff = Math.abs(dA.lapTime - dB.lapTime)
    const faster = dA.lapTime < dB.lapTime ? dA.driver : dB.driver
    insights.push(`${faster} is ${diff.toFixed(3)}s faster over the lap`)
  }

  return insights.slice(0, 4)
}

/**
 * Generate throttle/brake chart insights
 */
export function getThrottleBrakeInsights(data: TelemetryData): string[] {
  if (!data?.driverA?.data?.length || !data?.driverB?.data?.length) {
    return ['Data not available for analysis']
  }

  const insights: string[] = []
  const dA = data.driverA
  const dB = data.driverB

  // Count brake zones
  const countBrakeZones = (points: typeof dA.data) => {
    let zones = 0
    let inZone = false
    points.forEach(p => {
      if (p.brake > 0 && !inZone) {
        zones++
        inZone = true
      } else if (p.brake === 0) {
        inZone = false
      }
    })
    return zones
  }

  const zonesA = countBrakeZones(dA.data)
  const zonesB = countBrakeZones(dB.data)

  insights.push(`${dA.driver} uses ${zonesA} brake zones, ${dB.driver} uses ${zonesB}`)

  // Calculate total braking distance
  const totalBrakeDistance = (points: typeof dA.data) => {
    let total = 0
    for (let i = 1; i < points.length; i++) {
      if (points[i].brake > 0) {
        total += points[i].distance - points[i-1].distance
      }
    }
    return total
  }

  const brakeDistA = totalBrakeDistance(dA.data)
  const brakeDistB = totalBrakeDistance(dB.data)
  const brakeDiff = Math.abs(brakeDistA - brakeDistB)

  if (brakeDiff > 50) {
    const shorter = brakeDistA < brakeDistB ? dA.driver : dB.driver
    insights.push(`${shorter} spends ${Math.round(brakeDiff)}m less on brakes per lap`)
  }

  // Full throttle percentage
  const fullThrottlePct = (points: typeof dA.data) => {
    const full = points.filter(p => p.throttle >= 95).length
    return (full / points.length) * 100
  }

  const throttleA = fullThrottlePct(dA.data)
  const throttleB = fullThrottlePct(dB.data)

  insights.push(`Full throttle: ${dA.driver} ${throttleA.toFixed(0)}%, ${dB.driver} ${throttleB.toFixed(0)}%`)

  return insights.slice(0, 4)
}

/**
 * Generate gear chart insights
 */
export function getGearInsights(data: TelemetryData): string[] {
  if (!data?.driverA?.data?.length || !data?.driverB?.data?.length) {
    return ['Data not available for analysis']
  }

  const insights: string[] = []
  const dA = data.driverA
  const dB = data.driverB

  // Max gear used
  const maxGearA = Math.max(...dA.data.map(p => p.gear))
  const maxGearB = Math.max(...dB.data.map(p => p.gear))

  insights.push(`Both drivers use up to ${Math.max(maxGearA, maxGearB)}th gear`)

  // Count gear changes
  const countShifts = (points: typeof dA.data) => {
    let shifts = 0
    for (let i = 1; i < points.length; i++) {
      if (points[i].gear !== points[i-1].gear) shifts++
    }
    return shifts
  }

  const shiftsA = countShifts(dA.data)
  const shiftsB = countShifts(dB.data)

  insights.push(`Gear changes: ${dA.driver} makes ${shiftsA}, ${dB.driver} makes ${shiftsB}`)

  // Time in each gear
  const gearPct = (points: typeof dA.data, gear: number) => {
    const inGear = points.filter(p => p.gear === gear).length
    return (inGear / points.length) * 100
  }

  const topGearPctA = gearPct(dA.data, maxGearA)
  const topGearPctB = gearPct(dB.data, maxGearB)

  insights.push(`Time in top gear: ${dA.driver} ${topGearPctA.toFixed(0)}%, ${dB.driver} ${topGearPctB.toFixed(0)}%`)

  return insights.slice(0, 4)
}

/**
 * Generate delta chart insights
 */
export function getDeltaInsights(data: TelemetryData): string[] {
  if (!data?.delta?.length) {
    return ['Delta data not available']
  }

  const insights: string[] = []
  const delta = data.delta
  const dA = data.driverA.driver
  const dB = data.driverB.driver

  // Final delta
  const finalDelta = delta[delta.length - 1].delta
  const leader = finalDelta > 0 ? dA : dB
  insights.push(`${leader} finishes ${Math.abs(finalDelta).toFixed(3)}s ahead`)

  // Find max advantage for each driver
  const maxDeltaA = Math.max(...delta.map(d => d.delta))
  const maxDeltaB = Math.min(...delta.map(d => d.delta))

  if (maxDeltaA > 0.05) {
    const distanceA = delta.find(d => d.delta === maxDeltaA)?.distance || 0
    insights.push(`${dA} max advantage: ${formatDelta(maxDeltaA)} at ${(distanceA/1000).toFixed(1)}km`)
  }

  if (maxDeltaB < -0.05) {
    const distanceB = delta.find(d => d.delta === maxDeltaB)?.distance || 0
    insights.push(`${dB} max advantage: ${formatDelta(Math.abs(maxDeltaB))} at ${(distanceB/1000).toFixed(1)}km`)
  }

  // Count lead changes
  let leadChanges = 0
  for (let i = 1; i < delta.length; i++) {
    if ((delta[i].delta > 0) !== (delta[i-1].delta > 0)) {
      leadChanges++
    }
  }

  if (leadChanges > 0) {
    insights.push(`Time advantage switched ${leadChanges} time${leadChanges > 1 ? 's' : ''} during lap`)
  }

  return insights.slice(0, 4)
}

/**
 * Generate race pace insights
 */
export function getRacePaceInsights(data: RacePaceData): string[] {
  if (!data?.drivers?.length) {
    return ['Race pace data not available']
  }

  const insights: string[] = []
  const drivers = data.drivers

  // Race time comparison
  if (drivers.length >= 2) {
    const sorted = [...drivers].sort((a, b) => a.totalRaceTime - b.totalRaceTime)
    const gap = sorted[1].totalRaceTime - sorted[0].totalRaceTime
    insights.push(`${sorted[0].driver} finished ${gap.toFixed(1)}s ahead of ${sorted[1].driver}`)
  }

  // Best degradation rate
  const allStints = drivers.flatMap(d => 
    d.stints.map(s => ({ driver: d.driver, ...s }))
  )
  
  const validStints = allStints.filter(s => s.totalLaps >= 5 && s.degRate !== 0)
  if (validStints.length > 0) {
    const bestDeg = validStints.reduce((best, s) => 
      Math.abs(s.degRate) < Math.abs(best.degRate) ? s : best
    )
    insights.push(`Best tire management: ${bestDeg.driver} on ${bestDeg.compound} (${bestDeg.degRate > 0 ? '+' : ''}${bestDeg.degRate.toFixed(3)}s/lap)`)
  }

  // Fastest lap
  const allLaps = drivers.flatMap(d =>
    d.laps.filter(l => !l.isOutlier).map(l => ({ driver: d.driver, ...l }))
  )
  
  if (allLaps.length > 0) {
    const fastest = allLaps.reduce((f, l) => l.lapTime < f.lapTime ? l : f)
    insights.push(`Fastest lap: ${fastest.driver} on lap ${fastest.lap} (${formatLapTime(fastest.lapTime)})`)
  }

  // Stint count comparison
  if (drivers.length >= 2) {
    const stintCounts = drivers.map(d => ({ driver: d.driver, stints: d.stints.length }))
    insights.push(`Pit stops: ${stintCounts.map(s => `${s.driver} ${s.stints - 1}`).join(', ')}`)
  }

  return insights.slice(0, 4)
}
