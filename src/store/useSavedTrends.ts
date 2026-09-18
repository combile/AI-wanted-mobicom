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
  /** 지운 항목을 저장 시점의 점수·시각 그대로 되돌린다 */
  restore: (entry: SavedEntry) => void
}

// "몇 점일 때 발견했는지"는 다시 만들 수 없는 기록이다. 실수로 저장을 풀었다가 바로 다시
// 누르면 새 기록 대신 직전에 지운 기록을 되살린다. 세션 동안만, 마지막 하나만 기억한다.
let lastRemoved: SavedEntry | undefined

export const useSavedTrends = create<SavedTrendsState>((set, get) => {
  const commit = (next: SavedEntry[]) => {
    persist(next)
    set({ entries: next })
  }
  const drop = (id: string) => {
    lastRemoved = get().entries.find((e) => e.id === id) ?? lastRemoved
    commit(get().entries.filter((e) => e.id !== id))
  }

  return {
    entries: load(),
    isSaved: (id) => get().entries.some((e) => e.id === id),
    toggle: (id, currentScore) => {
      if (get().entries.some((e) => e.id === id)) return drop(id)
      const entry =
        lastRemoved?.id === id ? lastRemoved : { id, savedAt: new Date().toISOString(), scoreAtSave: currentScore }
      lastRemoved = undefined
      commit([...get().entries, entry])
    },
    remove: drop,
    restore: (entry) => {
      if (lastRemoved?.id === entry.id) lastRemoved = undefined
      if (get().entries.some((e) => e.id === entry.id)) return
      commit([...get().entries, entry])
    },
  }
})
