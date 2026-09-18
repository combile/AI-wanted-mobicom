import axios from 'axios'
import { CATEGORY_MAP, STATUS_MAP } from './meta'
import type { TrendCard, VideoItem } from './types'

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

// 유튜브 영상 id는 11자의 [A-Za-z0-9_-]. 이 id로 썸네일·링크 주소를 만들기 때문에 형식을 확인한다.
const YOUTUBE_ID = /^[\w-]{11}$/

export async function fetchVideos(): Promise<VideoItem[]> {
  const { data } = await api.get<{ videos?: VideoItem[] }>('/videos')
  if (!Array.isArray(data?.videos)) throw new Error('unexpected /videos response')
  return data.videos.filter((v) => YOUTUBE_ID.test(v.id) && typeof v.title === 'string')
}
