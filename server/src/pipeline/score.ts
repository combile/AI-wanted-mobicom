import type { TrendStatus, ValidationSignals } from '../types.js'

// 기획서 7장 공식을 실제 확보 가능한 신호로 재분배한 버전.
// (검색량 35% / 콘텐츠 30% / 쇼핑 20% / 교차 플랫폼 15%)
const WEIGHTS = {
  search: 0.35,
  content: 0.3,
  shopping: 0.2,
  crossPlatform: 0.15,
}

function normalizeGrowth(pct: number | null): number {
  if (pct === null) return 0
  // +300% 성장까지를 0~100 스케일로 눌러서 비교 가능하게 만든다.
  return Math.max(0, Math.min(100, (pct / 300) * 100))
}

// 쇼핑인사이트(카테고리 매핑 전이라 shoppingGrowthPct가 항상 null — README 참고)처럼
// 신호가 구조적으로 비활성인 동안 그 가중치를 죽이지 않고 나머지 항목에 재분배한다.
// 매핑이 붙어 shoppingGrowthPct가 값을 받기 시작하면 자동으로 원래 배분으로 돌아간다.
function effectiveWeights(shoppingActive: boolean): typeof WEIGHTS {
  if (shoppingActive) return WEIGHTS
  const remaining = 1 - WEIGHTS.shopping
  return {
    search: WEIGHTS.search / remaining,
    content: WEIGHTS.content / remaining,
    shopping: 0,
    crossPlatform: WEIGHTS.crossPlatform / remaining,
  }
}

export function computeScore(signals: ValidationSignals): number {
  const searchScore = normalizeGrowth(signals.searchGrowthPct)
  const contentScore = normalizeGrowth(signals.contentGrowthPct)
  const shoppingScore = normalizeGrowth(signals.shoppingGrowthPct)

  const activeSources = [signals.searchGrowthPct, signals.contentGrowthPct, signals.shoppingGrowthPct, signals.newsGrowthPct].filter(
    (v) => v !== null,
  ).length
  const crossPlatformScore = (activeSources / 4) * 100
  const weights = effectiveWeights(signals.shoppingGrowthPct !== null)

  const raw =
    searchScore * weights.search +
    contentScore * weights.content +
    shoppingScore * weights.shopping +
    crossPlatformScore * weights.crossPlatform

  return Math.round(Math.max(0, Math.min(100, raw)))
}

/**
 * 점수 자체보다 '방향성(성장 중/정체/하강)'이 상태 판단에 더 중요하므로
 * 점수 + 성장률 부호를 함께 본다. 임계값은 초기 추정치이며 운영 데이터가 쌓이면 조정 대상.
 */
export function computeStatus(score: number, signals: ValidationSignals): TrendStatus {
  const avgGrowth =
    [signals.searchGrowthPct, signals.contentGrowthPct, signals.newsGrowthPct]
      .filter((v): v is number => v !== null)
      .reduce((sum, v) => sum + v, 0) /
    Math.max(1, [signals.searchGrowthPct, signals.contentGrowthPct, signals.newsGrowthPct].filter((v) => v !== null).length)

  if (score >= 85 && avgGrowth > 20) return 'viral'
  if (score >= 85) return 'peak'
  if (score >= 60 && avgGrowth > 0) return 'rising'
  if (score >= 60) return 'mainstream'
  if (score >= 30 && avgGrowth > 0) return 'emerging'
  if (avgGrowth < -10) return 'cooling'
  if (score < 15 && avgGrowth < 0) return 'over'
  return 'emerging'
}
