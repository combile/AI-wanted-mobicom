import { CATEGORIES, CATEGORY_MAP, type TimeRangeKey } from './meta'
import type { CategoryKey, TrendCard, TrendStatus } from './types'

export function byScoreDesc(list: TrendCard[]): TrendCard[] {
  return [...list].sort((a, b) => b.score - a.score)
}

export function byCategory(list: TrendCard[], category: CategoryKey): TrendCard[] {
  return byScoreDesc(list.filter((t) => t.category === category))
}

export function byStatuses(list: TrendCard[], statuses: TrendStatus[]): TrendCard[] {
  return byScoreDesc(list.filter((t) => statuses.includes(t.status)))
}

export function relatedOf(list: TrendCard[], trend: TrendCard): TrendCard[] {
  return trend.relatedIds.map((id) => list.find((t) => t.id === id)).filter((t): t is TrendCard => Boolean(t))
}

/** 최근 days일 동안 오른 점수. 히스토리가 그보다 짧으면 있는 만큼만 본다. */
function scoreGain(trend: TrendCard, days: number): number {
  const h = trend.history
  if (h.length < 2) return 0
  return h[h.length - 1].score - h[Math.max(0, h.length - 1 - days)].score
}

/** 기간별 랭킹: 실시간=24시간 성장률, 오늘=점수, 이번 주·달=기간 내 점수 상승폭 */
export function rankFor(list: TrendCard[], range: TimeRangeKey): TrendCard[] {
  if (range === 'today') return byScoreDesc(list)
  const weight = (t: TrendCard) =>
    range === 'live' ? (t.growth24h ?? t.changePct) : scoreGain(t, range === 'week' ? 7 : 30)
  return [...list].sort((a, b) => weight(b) - weight(a) || b.score - a.score)
}

const STOPWORDS = new Set(['요즘', '최근', '사이에서', '것', '같은', '많이', '다음', '이번', '갑자기', '뜨는', '뜰'])

const CATEGORY_LABELS = new Set(CATEGORIES.map((c) => c.label))

function tokenize(query: string): string[] {
  return (
    query
      .trim()
      .toLowerCase()
      .split(/[\s,.?!]+/)
      // 한 글자 토큰은 잡음이 많아 버리되, '밈'처럼 카테고리 이름 그 자체면 살린다.
      .filter((tok) => (tok.length >= 2 || CATEGORY_LABELS.has(tok)) && !STOPWORDS.has(tok))
  )
}

export function searchTrends(list: TrendCard[], query: string): TrendCard[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  // 카테고리 설명('음식, 음료, 디저트…')도 포함해야 "뜰 것 같은 음식" 같은 일상어 질문이 푸드로 이어진다.
  const haystackOf = (t: TrendCard) => {
    const category = CATEGORY_MAP[t.category]
    return [t.title, t.summary, category?.label ?? t.category, category?.examples ?? '', ...t.keywords, ...t.spreadPath]
      .join(' ')
      .toLowerCase()
  }

  const scored = list
    .map((t) => {
      const haystack = haystackOf(t)
      const matches = tokens.filter((tok) => haystack.includes(tok)).length
      return { trend: t, matches }
    })
    .filter((r) => r.matches > 0)

  scored.sort((a, b) => b.matches - a.matches || b.trend.score - a.trend.score)
  return scored.map((r) => r.trend)
}
