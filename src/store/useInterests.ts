import { create } from 'zustand'
import type { CategoryKey } from '../lib/types'

const STORAGE_KEY = 'now-earth-interests'

function load(): CategoryKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CategoryKey[]) : []
  } catch {
    return []
  }
}

function persist(value: CategoryKey[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

interface InterestsState {
  interests: CategoryKey[]
  onboarded: boolean
  setInterests: (keys: CategoryKey[]) => void
}

export const useInterests = create<InterestsState>((set) => ({
  interests: load(),
  onboarded: load().length > 0,
  setInterests: (keys) => {
    persist(keys)
    set({ interests: keys, onboarded: true })
  },
}))
