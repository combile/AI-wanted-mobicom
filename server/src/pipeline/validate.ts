import { fetchSearchTrend, searchNews } from '../services/naver.js'
import { getPreviousSnapshot, recordSnapshot } from '../db/index.js'
import type { Candidate, ValidationSignals } from '../types.js'

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function growthPct(current: number, previous: number | null): number | null {
  if (previous === null) return null
  if (previous === 0) return current > 0 ? 300 : 0 // cap: no baseline but now active
  return Math.round(((current - previous) / previous) * 1000) / 10
}

/** 최근 3일 평균 대비 이전 3일 평균 성장률. DataLab이 시계열을 주므로 스냅샷 저장 불필요. */
async function searchGrowth(keyword: string): Promise<number | null> {
  try {
    const [result] = await fetchSearchTrend([{ groupName: keyword, keywords: [keyword] }], {
      startDate: isoDaysAgo(13),
      endDate: isoDaysAgo(0),
      timeUnit: 'date',
    })
    const series = result?.data ?? []
    if (series.length < 6) return null
    const recent = series.slice(-3)
    const prior = series.slice(-6, -3)
    const avg = (points: typeof series) => points.reduce((sum, p) => sum + p.ratio, 0) / points.length
    return growthPct(avg(recent), avg(prior))
  } catch {
    return null
  }
}

/** 최근 24h vs 이전 24h 뉴스/블로그 언급 수 성장률. */
async function newsGrowth(keyword: string): Promise<number | null> {
  try {
    const items = await searchNews(keyword, 100)
    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    let recent = 0
    let prior = 0
    for (const item of items) {
      if (!item.pubDate) continue
      const age = now - new Date(item.pubDate).getTime()
      if (age >= 0 && age < day) recent += 1
      else if (age >= day && age < 2 * day) prior += 1
    }
    return growthPct(recent, prior)
  } catch {
    return null
  }
}

/** 오늘 발견 단계에서 이 후보와 매칭된 YouTube 영상 수 vs 전일 스냅샷 성장률. */
function contentGrowth(keyword: string, matchedVideoCount: number): number | null {
  const previous = getPreviousSnapshot(keyword, 'youtube_mentions')
  recordSnapshot(keyword, 'youtube_mentions', matchedVideoCount)
  return growthPct(matchedVideoCount, previous)
}

export async function validateCandidate(candidate: Candidate): Promise<ValidationSignals> {
  const matchedVideoCount = candidate.sources.filter((s) => s.url?.includes('youtube.com')).length

  const [search, news] = await Promise.all([searchGrowth(candidate.keyword), newsGrowth(candidate.keyword)])
  const content = contentGrowth(candidate.keyword, matchedVideoCount)

  return {
    searchGrowthPct: search,
    shoppingGrowthPct: null, // Naver Shopping Insight 카테고리 매핑 설정 전까지는 비활성 — README 참고
    contentGrowthPct: content,
    newsGrowthPct: news,
    evidenceCount: candidate.sources.length,
  }
}
