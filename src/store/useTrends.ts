import { create } from 'zustand'
import { TRENDS } from '../data/trends'
import { fetchTrends } from '../lib/api'
import type { TrendCard } from '../lib/types'

/**
 * loading: 첫 응답을 기다리는 중 (trends는 비어 있다)
 * live: 서버의 승인된 트렌드
 * offline: 서버에 닿지 못해 샘플 데이터로 대신함
 * empty: 서버는 응답했지만 승인된 트렌드가 없어 샘플 데이터로 대신함
 */
export type TrendsStatus = 'loading' | 'live' | 'offline' | 'empty'

interface TrendsState {
  trends: TrendCard[]
  status: TrendsStatus
  load: () => Promise<void>
}

// ponytail: 프로토타입이라 실패 시 샘플 데이터로 대신한다.
// 실서비스 전환 시 샘플 폴백을 걷어내고 offline/empty를 전용 화면으로 바꿀 것.
export const useTrends = create<TrendsState>((set) => ({
  trends: [],
  status: 'loading',
  load: async () => {
    set({ status: 'loading' })
    try {
      const live = await fetchTrends()
      set(live.length > 0 ? { trends: live, status: 'live' } : { trends: TRENDS, status: 'empty' })
    } catch {
      set({ trends: TRENDS, status: 'offline' })
    }
  },
}))

export function useTrend(id: string | undefined): TrendCard | undefined {
  return useTrends((s) => s.trends.find((t) => t.id === id))
}
