import type { TrendCard } from './types'

/** 레이더 위의 버블 하나. 좌표·반지름은 모두 차트 한 변에 대한 %다(정사각형이라 x·y 단위가 같다). */
export interface RadarNode {
  trend: TrendCard
  x: number
  y: number
  r: number
}

const PAD = 9 // 목표 위치를 잡을 때의 가장자리 여백(%)
const EDGE_X = 3.5 // 좌우 끝에 비워 두는 폭(%). 선택된 버블은 1.18배 + 테두리라 그만큼의 여유가 필요하다
const EDGE_Y = 9 // 위·아래의 사분면 이름 띠. 버블이 글자를 가리지 않게 비워 둔다(%)
const GAP = 0.8 // 버블 사이 최소 간격(%)
const ITERATIONS = 80

/**
 * 값들을 0..1에 펼친다. 값 기준 위치와 순위 기준 위치를 반씩 섞는다.
 * 값만 쓰면 +380% 같은 이상치 하나가 나머지를 한 덩어리로 뭉개고,
 * 순위만 쓰면 얼마나 앞서는지가 사라진다. 순서는 어느 쪽이든 보존된다.
 */
function spread(values: number[]): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const rank = new Array<number>(values.length)
  values
    .map((v, i) => [v, i] as const)
    .sort((a, b) => a[0] - b[0])
    .forEach(([, i], k) => {
      rank[i] = values.length > 1 ? k / (values.length - 1) : 0.5
    })
  return values.map((v, i) => 0.5 * (max > min ? (v - min) / (max - min) : 0.5) + 0.5 * rank[i])
}

/**
 * 오른쪽일수록 빠르게 크고(변화율), 위일수록 관심도가 높다(점수). 버블 크기는 점수에 비례.
 * 위치는 트렌드끼리 비교한 상대값이다. 겹치는 버블은 서로 밀어내되 제자리로 당기는 힘을 둬 멀리 떠나지 않게 한다.
 * 난수를 쓰지 않아 같은 입력이면 항상 같은 배치가 나온다.
 */
export function layoutRadar(trends: TrendCard[]): RadarNode[] {
  if (trends.length === 0) return []

  const growth = spread(trends.map((t) => Math.sign(t.changePct) * Math.sqrt(Math.abs(t.changePct))))
  const interest = spread(trends.map((t) => t.score))
  const span = 100 - PAD * 2

  const nodes = trends.map((trend, i) => ({
    trend,
    r: 4.6 + (trend.score / 100) * 2,
    x: PAD + growth[i] * span,
    y: EDGE_Y + PAD / 2 + (1 - interest[i]) * (100 - EDGE_Y * 2 - PAD),
  }))
  const anchors = nodes.map(({ x, y }) => ({ x, y }))

  for (let step = 0; step < ITERATIONS; step++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let dist = Math.hypot(dx, dy)
        const need = a.r + b.r + GAP
        if (dist >= need) continue
        if (dist < 1e-6) {
          // 완전히 겹치면 밀어낼 방향이 없다 → 인덱스로 정한 고정 방향(황금각)을 쓴다.
          dx = Math.cos(i * 2.399963)
          dy = Math.sin(i * 2.399963)
          dist = 1
        }
        const push = (need - dist) / 2
        a.x -= (dx / dist) * push
        a.y -= (dy / dist) * push
        b.x += (dx / dist) * push
        b.y += (dy / dist) * push
      }
    }
    nodes.forEach((node, i) => {
      // 마지막 몇 번은 당기지 않는다 — 겹침 해소가 최종 결과가 되도록.
      if (step < ITERATIONS - 10) {
        node.x += (anchors[i].x - node.x) * 0.06
        node.y += (anchors[i].y - node.y) * 0.06
      }
      node.x = Math.min(100 - EDGE_X - node.r, Math.max(EDGE_X + node.r, node.x))
      node.y = Math.min(100 - EDGE_Y - node.r, Math.max(EDGE_Y + node.r, node.y))
    })
  }
  return nodes
}

/** 가장 오른쪽 위(빠르게 크고 관심도 높은)에 있는 버블 */
export function hottest(nodes: RadarNode[]): RadarNode | undefined {
  return nodes.reduce<RadarNode | undefined>((best, n) => (!best || n.x - n.y > best.x - best.y ? n : best), undefined)
}
