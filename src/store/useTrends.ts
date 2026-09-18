import { create } from 'zustand'
import { TRENDS } from '../data/trends'
import { fetchTrends } from '../lib/api'
import type { TrendCard } from '../lib/types'

interface TrendsState {
  trends: TrendCard[]
  source: 'sample' | 'live'
  load: () => Promise<void>
}

// ponytail: 샘플 데이터로 시작하고 서버 응답이 오면 교체한다(로딩 상태 없음).
// 실서비스 전환 시 샘플을 걷어내고 로딩/에러 상태를 추가할 것.
export const useTrends = create<TrendsState>((set) => ({
  trends: TRENDS,
  source: 'sample',
  load: async () => {
    try {
      const live = await fetchTrends()
      if (live.length > 0) set({ trends: live, source: 'live' })
    } catch {
      // 서버가 꺼져 있거나 승인된 트렌드가 없으면 샘플 데이터를 유지한다.
    }
  },
}))

export function useTrend(id: string | undefined): TrendCard | undefined {
  return useTrends((s) => s.trends.find((t) => t.id === id))
}
