import { create } from 'zustand'
import type { Trip, Attraction } from '../types'

interface AppState {
  trips: Trip[]
  selectedTrip: Trip | null
  attractions: Attraction[]
  sidebarOpen: boolean

  setTrips: (trips: Trip[]) => void
  addTrip: (trip: Trip) => void
  updateTrip: (trip: Trip) => void
  deleteTrip: (id: string) => void
  setSelectedTrip: (trip: Trip | null) => void

  setAttractions: (attractions: Attraction[]) => void
  addAttraction: (attraction: Attraction) => void

  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  trips: [],
  selectedTrip: null,
  attractions: [],
  sidebarOpen: true,

  setTrips: (trips) => set({ trips }),
  addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),
  updateTrip: (trip) =>
    set((s) => ({ trips: s.trips.map((t) => (t.id === trip.id ? trip : t)) })),
  deleteTrip: (id) => set((s) => ({ trips: s.trips.filter((t) => t.id !== id) })),
  setSelectedTrip: (trip) => set({ selectedTrip: trip }),

  setAttractions: (attractions) => set({ attractions }),
  addAttraction: (attraction) =>
    set((s) => ({ attractions: [attraction, ...s.attractions] })),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
