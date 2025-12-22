import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SessionState {
  season: number | null
  event: string | null
  session: string | null
  driverA: string | null
  driverB: string | null
  lapA: number | null
  lapB: number | null
  setSeason: (season: number | null) => void
  setEvent: (event: string | null) => void
  setSession: (session: string | null) => void
  setDriverA: (driver: string | null) => void
  setDriverB: (driver: string | null) => void
  setLapA: (lap: number | null) => void
  setLapB: (lap: number | null) => void
  reset: () => void
}

// Note: Using a simple state implementation since zustand requires additional setup
// For production, consider using zustand for state persistence

import { useState, useCallback } from 'react'

// Simple global state for session management
let globalState: SessionState = {
  season: 2024,
  event: null,
  session: null,
  driverA: null,
  driverB: null,
  lapA: null,
  lapB: null,
  setSeason: () => {},
  setEvent: () => {},
  setSession: () => {},
  setDriverA: () => {},
  setDriverB: () => {},
  setLapA: () => {},
  setLapB: () => {},
  reset: () => {},
}

const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function useSessionStore(): SessionState {
  const [, forceUpdate] = useState({})

  // Subscribe to state changes
  useState(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => listeners.delete(listener)
  })

  const setSeason = useCallback((season: number | null) => {
    globalState = { ...globalState, season }
    notifyListeners()
  }, [])

  const setEvent = useCallback((event: string | null) => {
    globalState = { ...globalState, event }
    notifyListeners()
  }, [])

  const setSession = useCallback((session: string | null) => {
    globalState = { ...globalState, session }
    notifyListeners()
  }, [])

  const setDriverA = useCallback((driverA: string | null) => {
    globalState = { ...globalState, driverA }
    notifyListeners()
  }, [])

  const setDriverB = useCallback((driverB: string | null) => {
    globalState = { ...globalState, driverB }
    notifyListeners()
  }, [])

  const setLapA = useCallback((lapA: number | null) => {
    globalState = { ...globalState, lapA }
    notifyListeners()
  }, [])

  const setLapB = useCallback((lapB: number | null) => {
    globalState = { ...globalState, lapB }
    notifyListeners()
  }, [])

  const reset = useCallback(() => {
    globalState = {
      ...globalState,
      season: 2024,
      event: null,
      session: null,
      driverA: null,
      driverB: null,
      lapA: null,
      lapB: null,
    }
    notifyListeners()
  }, [])

  return {
    ...globalState,
    setSeason,
    setEvent,
    setSession,
    setDriverA,
    setDriverB,
    setLapA,
    setLapB,
    reset,
  }
}
