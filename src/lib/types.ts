import type { IconName } from './icons'

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

export interface CategoryMeta {
  key: CategoryKey
  label: string
  icon: IconName
  examples: string
}

export interface StatusMeta {
  key: TrendStatus
  label: string
  icon: IconName
  description: string
  color: string
}

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
