import { describe, expect, it } from 'vitest'
import { TRENDS } from '../data/trends'
import { hottest, layoutRadar } from './radar'
import type { TrendCard } from './types'

const trend = (id: string, score: number, changePct: number) => ({ ...TRENDS[0], id, score, changePct }) as TrendCard

describe('layoutRadar', () => {
  const nodes = layoutRadar(TRENDS)

  it('모든 버블이 차트 안에 있고, 위·아래 사분면 이름 띠(9%)와 좌우 끝(2%)을 침범하지 않는다', () => {
    expect(nodes).toHaveLength(TRENDS.length)
    for (const n of nodes) {
      expect(n.x - n.r).toBeGreaterThanOrEqual(2 - 1e-9)
      expect(n.x + n.r).toBeLessThanOrEqual(98 + 1e-9)
      expect(n.y - n.r).toBeGreaterThanOrEqual(9 - 1e-9)
      expect(n.y + n.r).toBeLessThanOrEqual(91 + 1e-9)
    }
  })

  it('버블끼리 눈에 띄게 겹치지 않는다', () => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const overlap = a.r + b.r - Math.hypot(a.x - b.x, a.y - b.y)
        expect(overlap, `${a.trend.id} × ${b.trend.id}`).toBeLessThan(0.8)
      }
    }
  })

  it('같은 입력이면 같은 배치가 나온다', () => {
    expect(layoutRadar(TRENDS)).toEqual(nodes)
  })

  it('빠르게 클수록 오른쪽, 관심도가 높을수록 위', () => {
    const [hot, cold] = layoutRadar([trend('hot', 95, 300), trend('cold', 20, -30)])
    expect(hot.x).toBeGreaterThan(cold.x)
    expect(hot.y).toBeLessThan(cold.y)
    expect(hot.r).toBeGreaterThan(cold.r)
  })

  it('완전히 같은 값끼리도 포개지지 않고, 빈 목록·한 개도 처리한다', () => {
    const twins = layoutRadar([trend('a', 50, 10), trend('b', 50, 10), trend('c', 50, 10)])
    expect(new Set(twins.map((n) => `${n.x.toFixed(2)},${n.y.toFixed(2)}`)).size).toBe(3)
    expect(layoutRadar([])).toEqual([])
    expect(layoutRadar([trend('solo', 50, 10)])).toHaveLength(1)
  })
})

describe('hottest', () => {
  it('오른쪽 위에 가장 가까운 버블을 고른다', () => {
    const nodes = layoutRadar([trend('hot', 95, 300), trend('mid', 60, 20), trend('cold', 20, -30)])
    expect(hottest(nodes)?.trend.id).toBe('hot')
    expect(hottest([])).toBeUndefined()
  })
})
