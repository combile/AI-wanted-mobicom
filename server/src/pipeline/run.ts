import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { discoverCandidates } from './discover.js'
import { validateCandidate } from './validate.js'
import { computeScore, computeStatus } from './score.js'
import { curateTrendCard } from '../services/gemini.js'
import { getTrend, upsertTrend, enqueueReview } from '../db/index.js'
import type { Candidate, TrendCard, ValidationSignals } from '../types.js'

// 콘텐츠 성장률은 같은 키워드를 두 번째로 볼 때부터 값이 생기고(첫 목격 시 스냅샷이 없어 null),
// 쇼핑 신호는 아직 미연동이라 첫 실행에서는 사실상 검색량+교차플랫폼 신호만으로 판단하게 된다.
// 실측 데이터(2026-09-20)로 보정한 값 — 운영 데이터가 더 쌓이면 재조정 대상.
const MIN_SCORE_FOR_REVIEW = 20

function slugify(keyword: string): string {
  return keyword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
}

function buildSpreadPath(candidate: Candidate): string[] {
  const path: string[] = []
  const hasVideo = candidate.sources.some((s) => s.url?.includes('youtube.com'))
  const hasNews = candidate.sources.some((s) => !s.url?.includes('youtube.com'))
  if (hasVideo) path.push('YouTube')
  if (hasNews) path.push('뉴스/블로그')
  path.push('지금 지구는 포착')
  return path
}

function refreshExistingTrend(existing: TrendCard, score: number): TrendCard {
  const changePct = existing.score === 0 ? score : Math.round(((score - existing.score) / Math.max(1, existing.score)) * 100)
  return {
    ...existing,
    score,
    changePct,
    history: [...existing.history, { date: new Date().toISOString().slice(0, 10), score }].slice(-30),
  }
}

async function processCandidate(candidate: Candidate) {
  const id = slugify(candidate.keyword)
  const signals: ValidationSignals = await validateCandidate(candidate)
  const score = computeScore(signals)
  const status = computeStatus(score, signals)

  const existing = getTrend(id)
  if (existing) {
    upsertTrend(refreshExistingTrend(existing, score))
    return { id, action: 'refreshed' as const, score }
  }

  if (score < MIN_SCORE_FOR_REVIEW || signals.evidenceCount < 2) {
    return { id, action: 'skipped-low-signal' as const, score }
  }

  const curated = await curateTrendCard({
    keyword: candidate.keyword,
    newsAndBlogTitles: candidate.sources
      .filter((s) => !s.url?.includes('youtube.com'))
      .map((s) => ({ title: s.title, source: s.source, publishedAt: s.publishedAt })),
    videoTitles: candidate.sources
      .filter((s) => s.url?.includes('youtube.com'))
      .map((s) => ({ title: s.title, channel: s.source, publishedAt: s.publishedAt })),
    signals: {
      searchGrowthPct: signals.searchGrowthPct,
      shoppingGrowthPct: signals.shoppingGrowthPct,
      contentGrowthPct: signals.contentGrowthPct,
      newsGrowthPct: signals.newsGrowthPct,
    },
  })

  const draft: TrendCard = {
    id,
    title: candidate.keyword,
    category: curated.category,
    status,
    score,
    changePct: score,
    summary: curated.summary,
    firstDetected: candidate.firstSeenAt.slice(0, 10),
    spreadPath: buildSpreadPath(candidate),
    keywords: curated.keywords,
    relatedIds: [],
    why: curated.why,
    timeline: curated.timeline,
    history: [{ date: new Date().toISOString().slice(0, 10), score }],
  }

  enqueueReview({
    id: randomUUID(),
    candidate,
    signals,
    draft,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })

  return { id, action: 'queued-for-review' as const, score }
}

export async function runPipeline() {
  const startedAt = Date.now()
  const { candidates } = await discoverCandidates()

  const results = []
  for (const candidate of candidates) {
    try {
      results.push(await processCandidate(candidate))
    } catch (err) {
      results.push({ id: slugify(candidate.keyword), action: 'error' as const, error: String(err) })
    }
  }

  const summary = {
    durationMs: Date.now() - startedAt,
    candidateCount: candidates.length,
    refreshed: results.filter((r) => r.action === 'refreshed').length,
    queuedForReview: results.filter((r) => r.action === 'queued-for-review').length,
    skippedLowSignal: results.filter((r) => r.action === 'skipped-low-signal').length,
    errors: results.filter((r) => r.action === 'error'),
  }
  console.log('[pipeline] run complete', summary)
  return summary
}

// Allow `npm run pipeline:run` for a one-off manual run.
if (process.argv[1]?.endsWith('run.ts') || process.argv[1]?.endsWith('run.js')) {
  runPipeline()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
