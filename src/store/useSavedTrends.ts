import { create } from 'zustand'

export interface SavedEntry {
  id: string
  savedAt: string
  scoreAtSave: number
}

const STORAGE_KEY = 'now-earth-saved-trends'

function load(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedEntry[]) : []
  } catch {
    return []
  }
}

function persist(entries: SavedEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // ignore write failures (e.g. private mode)
  }
}

interface SavedTrendsState {
  entries: SavedEntry[]
  isSaved: (id: string) => boolean
  toggle: (id: string, currentScore: number) => void
  remove: (id: string) => void
}

export const useSavedTrends = create<SavedTrendsState>((set, get) => ({
  entries: load(),
  isSaved: (id) => get().entries.some((e) => e.id === id),
  toggle: (id, currentScore) => {
    const exists = get().entries.some((e) => e.id === id)
    const next = exists
      ? get().entries.filter((e) => e.id !== id)
      : [...get().entries, { id, savedAt: new Date().toISOString(), scoreAtSave: currentScore }]
    persist(next)
    set({ entries: next })
  },
  remove: (id) => {
    const next = get().entries.filter((e) => e.id !== id)
    persist(next)
    set({ entries: next })
  },
}))
