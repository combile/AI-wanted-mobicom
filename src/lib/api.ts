import axios from 'axios'
import { CATEGORY_MAP, STATUS_MAP } from './meta'
import type { TrendCard } from './types'

// 개발 중에는 vite proxy가 /api → server(8787)로 넘긴다. 배포 시 VITE_API_URL로 교체.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 5000,
})

export async function fetchTrends(): Promise<TrendCard[]> {
  const { data } = await api.get<{ trends?: TrendCard[] }>('/trends')
  if (!Array.isArray(data?.trends)) throw new Error('unexpected /trends response')
  // 프론트가 모르는 카테고리·상태가 오면 화면이 깨지므로 경계에서 걸러낸다.
  return data.trends.filter((t) => t.category in CATEGORY_MAP && t.status in STATUS_MAP)
}
