export type CategoryKey =
  | 'issue'
  | 'meme'
  | 'content'
  | 'entertainment'
  | 'fashion'
  | 'beauty'
  | 'food'
  | 'place'
  | 'item'
  | 'lifestyle'
  | 'design'
  | 'tech'

export type TrendStatus =
  | 'emerging'
  | 'rising'
  | 'viral'
  | 'peak'
  | 'mainstream'
  | 'cooling'
  | 'over'

export interface WhyStep {
  order: number
  text: string
}

export interface TimelineEvent {
  date: string
  label: string
}

export interface ScorePoint {
  date: string
  score: number
}

export interface SourceRef {
  title: string
  url?: string
  source: string
  publishedAt: string
}

/** Matches the frontend's TrendCard shape (src/lib/types.ts) so the UI needs no changes. */
export interface TrendCard {
  id: string
  title: string
  category: CategoryKey
  status: TrendStatus
  score: number
  changePct: number
  summary: string
  firstDetected: string
  spreadPath: string[]
  keywords: string[]
  relatedIds: string[]
  why: WhyStep[]
  timeline: TimelineEvent[]
  history: ScorePoint[]
  growth24h?: number
}

/** A raw, unverified keyword pulled from YouTube/news/blog/RSS before validation. */
export interface Candidate {
  keyword: string
  aliases: string[]
  sources: SourceRef[]
  firstSeenAt: string
}

/** Growth signals gathered per candidate before scoring. */
export interface ValidationSignals {
  searchGrowthPct: number | null // Naver DataLab 검색어 트렌드
  shoppingGrowthPct: number | null // Naver Shopping Insight
  contentGrowthPct: number | null // YouTube mention/velocity
  newsGrowthPct: number | null // Naver News/Blog mention count
  evidenceCount: number
}

/** Row shape stored in the review queue before an operator approves it. */
export interface ReviewItem {
  id: string
  candidate: Candidate
  signals: ValidationSignals
  draft: TrendCard
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
