/**
 * LapLens Design Tokens
 * Based on the new design mockup
 */

export const theme = {
  colors: {
    bg: {
      primary: '#0a0a0b',
      secondary: '#121214',
      tertiary: '#1a1a1d',
      elevated: '#1e1e21',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
      muted: '#52525b',
    },
    accent: {
      blue: '#3b82f6',
      blueHover: '#2563eb',
      blueMuted: '#3b82f620',
    },
    border: {
      default: '#27272a',
      subtle: '#1f1f23',
    },
    tire: {
      soft: '#ef4444',
      medium: '#eab308',
      hard: '#ffffff',
      inter: '#22c55e',
      wet: '#3b82f6',
    },
    team: {
      redbull: '#3671C6',
      ferrari: '#E8002D',
      mercedes: '#27F4D2',
      mclaren: '#FF8000',
      astonmartin: '#229971',
      alpine: '#FF87BC',
      williams: '#64C4FF',
      haas: '#B6BABD',
      sauber: '#52E252',
      rb: '#6692FF',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
} as const

// F1 Glossary terms
export const glossaryTerms = [
  { term: 'Delta', definition: 'Time difference between two drivers at any point on track' },
  { term: 'Stint', definition: 'Period between pit stops on the same set of tires' },
  { term: 'Degradation', definition: 'Rate at which tire performance decreases over time' },
  { term: 'Compound', definition: 'Tire type: Soft (fast, wears quickly), Medium, Hard (slow, lasts)' },
  { term: 'Undercut', definition: 'Pitting before a rival to gain position with fresh tires' },
  { term: 'Telemetry', definition: 'Real-time data from the car: speed, throttle, brake, gear' },
]

// Quick start presets
export const quickStarts = [
  { race: "2021 Bahrain GP", session: "Race", preset: { season: 2021, event: "Bahrain Grand Prix", session: "R", driverA: "HAM", driverB: "VER" } },
  { race: "2021 French GP", session: "Race", preset: { season: 2021, event: "French Grand Prix", session: "R", driverA: "VER", driverB: "HAM" } },
  { race: "2021 Abu Dhabi GP", session: "Race", preset: { season: 2021, event: "Abu Dhabi Grand Prix", session: "R", driverA: "VER", driverB: "HAM" } },
  { race: "2023 Singapore GP", session: "Race", preset: { season: 2023, event: "Singapore Grand Prix", session: "R", driverA: "SAI", driverB: "NOR" } },
  { race: "2024 Austria GP", session: "Race", preset: { season: 2024, event: "Austrian Grand Prix", session: "R", driverA: "VER", driverB: "NOR" } },
]
// Chart question framing
export const chartQuestions = {
  speed: {
    question: 'Where does each driver gain or lose speed?',
    subtitle: 'Speed trace shows km/h at every point around the lap',
    dataNote: 'Fastest lap comparison',
  },
  throttleBrake: {
    question: 'Who brakes later and gets on throttle earlier?',
    subtitle: 'Throttle and brake application through corners',
    dataNote: 'Fastest lap comparison',
  },
  gear: {
    question: 'Are drivers using different gears through corners?',
    subtitle: 'Gear selection can indicate different driving styles',
    dataNote: 'Fastest lap comparison',
  },
  delta: {
    question: 'Where is time gained and lost around the lap?',
    subtitle: 'Positive delta means Driver A is ahead at that point',
    dataNote: 'Cumulative time difference',
  },
  racePace: {
    question: 'How did pace evolve through the race?',
    subtitle: 'Lap times show tire degradation and strategic moments',
    dataNote: 'All race laps, excluding pit laps',
  },
}
