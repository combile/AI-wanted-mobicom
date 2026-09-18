import { Router } from 'express'
import { memo } from '../cache.js'
import { isYoutubeConfigured } from '../config/index.js'
import { fetchTrendingVideosKR } from '../services/youtube.js'

export const videosRouter = Router()

// 유튜브 한국 인기 영상(videos.list mostPopular = 1 unit/call).
// 30분 캐시면 하루 48 unit 정도라 기본 쿼터(10,000)에 영향이 없다.
// 썸네일·영상 URL은 id로 프론트가 만든다 — 서버가 준 URL을 그대로 믿고 열지 않게 하려는 것.
const popularKR = memo(30 * 60_000, async () =>
  (await fetchTrendingVideosKR(24)).map(({ id, title, channelTitle, publishedAt, viewCount }) => ({
    id,
    title,
    channelTitle,
    publishedAt,
    viewCount,
  })),
)

videosRouter.get('/', async (_req, res) => {
  if (!isYoutubeConfigured) return res.status(503).json({ error: 'youtube_not_configured' })
  try {
    res.json({ region: 'KR', videos: await popularKR() })
  } catch (err) {
    console.error('[videos] youtube fetch failed', err)
    res.status(502).json({ error: 'youtube_failed' })
  }
})
