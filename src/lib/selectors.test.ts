import { describe, expect, it } from 'vitest'
import { TRENDS } from '../data/trends'
import { PRESET_QUESTIONS } from './meta'
import { rankFor, searchTrends } from './selectors'
import type { TrendCard } from './types'

function trend(id: string, over: Partial<TrendCard>): TrendCard {
  return {
    id,
    title: id,
    category: 'food',
    status: 'rising',
    score: 50,
    changePct: 0,
    summary: '',
    firstDetected: '2026-09-01',
    spreadPath: [],
    keywords: [],
    relatedIds: [],
    why: [],
    timeline: [],
    history: [],
    ...over,
  }
}

const history = (...scores: number[]) => scores.map((score, i) => ({ date: `2026-09-${10 + i}`, score }))

describe('searchTrends', () => {
  it.each(PRESET_QUESTIONS)('앱이 추천하는 질문 "%s"은 결과가 나온다', (question) => {
    expect(searchTrends(TRENDS, question).length).toBeGreaterThan(0)
  })

  it('한 글자여도 카테고리 이름이면 검색어로 쓴다', () => {
    const found = searchTrends(TRENDS, '밈').map((t) => t.id)
    const memes = TRENDS.filter((t) => t.category === 'meme').map((t) => t.id)
    expect(memes.length).toBeGreaterThan(0)
    expect(found).toEqual(expect.arrayContaining(memes))
  })

  it('카테고리 설명에 있는 말로도 찾는다 (음식 → 푸드)', () => {
    expect(searchTrends(TRENDS, '음식').some((t) => t.category === 'food')).toBe(true)
  })

  it('빈 질문이나 불용어뿐인 질문은 결과가 없다', () => {
    expect(searchTrends(TRENDS, '   ')).toEqual([])
    expect(searchTrends(TRENDS, '요즘 최근 많이')).toEqual([])
  })

  it('더 많은 단어가 맞는 트렌드가 먼저 온다', () => {
    const list = [trend('a', { title: '말차 라떼', score: 10 }), trend('b', { title: '말차', score: 90 })]
    expect(searchTrends(list, '말차 라떼').map((t) => t.id)).toEqual(['a', 'b'])
  })
})

describe('rankFor', () => {
  const list = [
    trend('steady', { score: 90, changePct: 5, history: history(88, 89, 90) }),
    trend('surging', { score: 60, changePct: 40, growth24h: 300, history: history(20, 40, 60) }),
    trend('falling', { score: 70, changePct: -10, history: history(85, 78, 70) }),
  ]

  it('오늘: 점수순', () => {
    expect(rankFor(list, 'today').map((t) => t.id)).toEqual(['steady', 'falling', 'surging'])
  })

  it('실시간: 24시간 성장률, 없으면 변화율', () => {
    expect(rankFor(list, 'live').map((t) => t.id)).toEqual(['surging', 'steady', 'falling'])
  })

  it('이번 주: 기간 내 점수 상승폭', () => {
    expect(rankFor(list, 'week').map((t) => t.id)).toEqual(['surging', 'steady', 'falling'])
  })

  it('히스토리가 없어도 터지지 않고, 입력 배열을 바꾸지 않는다', () => {
    const input = [trend('x', { score: 1 }), trend('y', { score: 2 })]
    expect(rankFor(input, 'month').map((t) => t.id)).toEqual(['y', 'x'])
    expect(input.map((t) => t.id)).toEqual(['x', 'y'])
  })
})
