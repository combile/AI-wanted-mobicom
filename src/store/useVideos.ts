import { create } from 'zustand'
import { fetchVideos } from '../lib/api'
import type { VideoItem } from '../lib/types'

interface VideosState {
  /** null: 아직 안 불렀거나 못 가져옴(서버·YouTube 키 없음) → 영상 섹션을 숨긴다 */
  videos: VideoItem[] | null
  load: () => Promise<void>
}

let requested = false

export const useVideos = create<VideosState>((set) => ({
  videos: null,
  // 홈에 들어올 때마다 부르지만 실제 요청은 세션당 한 번. 서버도 30분 캐시한다.
  load: async () => {
    if (requested) return
    requested = true
    try {
      set({ videos: await fetchVideos() })
    } catch {
      // 영상은 부가 정보라 실패해도 조용히 섹션만 숨긴다.
    }
  },
}))
