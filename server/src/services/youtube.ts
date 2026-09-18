import { config, isYoutubeConfigured } from '../config/index.js'

const BASE = 'https://www.googleapis.com/youtube/v3'

export interface YoutubeVideo {
  id: string
  title: string
  description: string
  tags: string[]
  channelTitle: string
  publishedAt: string
  viewCount: number
  likeCount: number
}

function requireKey() {
  if (!isYoutubeConfigured) throw new Error('YOUTUBE_API_KEY not configured')
  return config.youtube.apiKey!
}

/** Cheap (1 unit/call): today's KR trending videos. Primary candidate-discovery source. */
export async function fetchTrendingVideosKR(maxResults = 50): Promise<YoutubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet,statistics',
    chart: 'mostPopular',
    regionCode: 'KR',
    maxResults: String(maxResults),
    key: requireKey(),
  })
  const res = await fetch(`${BASE}/videos?${params}`)
  if (!res.ok) throw new Error(`YouTube videos.list failed: ${res.status} ${await res.text()}`)
  const json = (await res.json()) as { items: any[] }
  return json.items.map(toVideo)
}

/**
 * Expensive (100 units/call — budget default quota gives ~100/day). Only call this for
 * candidates that already passed the score threshold, to cross-check content velocity.
 */
export async function searchRecentVideos(query: string, publishedAfter: string, maxResults = 10): Promise<YoutubeVideo[]> {
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    order: 'date',
    regionCode: 'KR',
    publishedAfter,
    maxResults: String(maxResults),
    key: requireKey(),
  })
  const searchRes = await fetch(`${BASE}/search?${searchParams}`)
  if (!searchRes.ok) throw new Error(`YouTube search.list failed: ${searchRes.status} ${await searchRes.text()}`)
  const searchJson = (await searchRes.json()) as { items: { id: { videoId: string } }[] }
  const ids = searchJson.items.map((i) => i.id.videoId).filter(Boolean)
  if (ids.length === 0) return []

  const videoParams = new URLSearchParams({ part: 'snippet,statistics', id: ids.join(','), key: requireKey() })
  const videoRes = await fetch(`${BASE}/videos?${videoParams}`)
  if (!videoRes.ok) throw new Error(`YouTube videos.list failed: ${videoRes.status} ${await videoRes.text()}`)
  const videoJson = (await videoRes.json()) as { items: any[] }
  return videoJson.items.map(toVideo)
}

function toVideo(item: any): YoutubeVideo {
  return {
    id: item.id,
    title: item.snippet?.title ?? '',
    description: item.snippet?.description ?? '',
    tags: item.snippet?.tags ?? [],
    channelTitle: item.snippet?.channelTitle ?? '',
    publishedAt: item.snippet?.publishedAt ?? '',
    viewCount: Number(item.statistics?.viewCount ?? 0),
    likeCount: Number(item.statistics?.likeCount ?? 0),
  }
}
