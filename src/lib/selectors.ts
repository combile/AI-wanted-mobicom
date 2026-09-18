import { TRENDS } from '../data/trends'
import { CATEGORY_MAP } from './meta'
import type { CategoryKey, TrendCard, TrendStatus } from './types'

export function byScoreDesc(list: TrendCard[] = TRENDS): TrendCard[] {
  return [...list].sort((a, b) => b.score - a.score)
}

export function byCategory(category: CategoryKey): TrendCard[] {
  return byScoreDesc(TRENDS.filter((t) => t.category === category))
}

export function byStatuses(statuses: TrendStatus[]): TrendCard[] {
  return byScoreDesc(TRENDS.filter((t) => statuses.includes(t.status)))
}

export function relatedOf(trend: TrendCard): TrendCard[] {
  return trend.relatedIds.map((id) => TRENDS.find((t) => t.id === id)).filter((t): t is TrendCard => Boolean(t))
}

const STOPWORDS = new Set(['요즘', '최근', '사이에서', '것', '같은', '많이', '다음', '이번', '갑자기', '뜨는', '뜰'])

function tokenize(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/[\s,.?!]+/)
    .filter((tok) => tok.length >= 2 && !STOPWORDS.has(tok))
}

export function searchTrends(query: string): TrendCard[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const haystackOf = (t: TrendCard) =>
    [t.title, t.summary, CATEGORY_MAP[t.category]?.label ?? t.category, ...t.keywords, ...t.spreadPath]
      .join(' ')
      .toLowerCase()

  const scored = TRENDS.map((t) => {
    const haystack = haystackOf(t)
    const matches = tokens.filter((tok) => haystack.includes(tok)).length
    return { trend: t, matches }
  }).filter((r) => r.matches > 0)

  scored.sort((a, b) => b.matches - a.matches || b.trend.score - a.trend.score)
  return scored.map((r) => r.trend)
}
