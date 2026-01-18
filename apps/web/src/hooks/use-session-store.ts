import { create } from 'zustand'

interface SessionState {
  season: number | null
  event: string | null
  session: string | null
  driverA: string | null
  driverB: string | null
  setSeason: (season: number | null) => void
  setEvent: (event: string | null) => void
  setSession: (session: string | null) => void
  setDriverA: (driver: string | null) => void
  setDriverB: (driver: string | null) => void
  swapDrivers: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  season: null,
  event: null,
  session: null,
  driverA: null,
  driverB: null,
  
  setSeason: (season) => set({ 
    season, 
    event: null, 
    session: null, 
    driverA: null, 
    driverB: null 
  }),
  
  setEvent: (event) => set({ 
    event, 
    session: null, 
    driverA: null, 
    driverB: null 
  }),
  
  setSession: (session) => set({ 
    session, 
    driverA: null, 
    driverB: null 
  }),
  
  setDriverA: (driverA) => set({ driverA }),
  
  setDriverB: (driverB) => set({ driverB }),
  
  swapDrivers: () => set((state) => ({ 
    driverA: state.driverB, 
    driverB: state.driverA 
  })),
  
  reset: () => set({ 
    season: null, 
    event: null, 
    session: null, 
    driverA: null, 
    driverB: null 
  }),
}))
