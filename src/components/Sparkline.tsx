import { useId, useRef } from 'react'
import { gsap, motionOk, useGSAP } from '../lib/motion'
import type { ScorePoint } from '../lib/types'
import { theme as t } from '../styles/theme'

const W = 320
const PAD = 8

/** 점수 추이 영역 차트. 선이 그려지고 나서 면과 끝점이 나타난다. */
export default function Sparkline({
  points,
  height = 110,
  color = t.color.accent,
}: {
  points: ScorePoint[]
  height?: number
  color?: string
}) {
  const svg = useRef<SVGSVGElement>(null)
  const gradientId = `spark-${useId().replace(/:/g, '')}`

  useGSAP(
    () => {
      if (!motionOk()) return
      gsap.from('[data-line]', { strokeDashoffset: 1, duration: 1.1, ease: 'power2.out' })
      gsap.from('[data-after-line]', { autoAlpha: 0, duration: 0.5, delay: 0.7 })
    },
    { scope: svg, dependencies: [points], revertOnUpdate: true },
  )

  if (points.length < 2) return null

  const scores = points.map((p) => p.score)
  const min = Math.min(...scores)
  const range = Math.max(...scores) - min || 1
  const stepX = W / (points.length - 1)
  const coords = scores.map((s, i) => [i * stepX, height - PAD - ((s - min) / range) * (height - PAD * 2)] as const)
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = coords[coords.length - 1]

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      style={{ overflow: 'visible' }}
      role="img"
      aria-label={`점수 추이: ${scores[0]}점에서 ${scores[scores.length - 1]}점`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.32" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path data-after-line d={`${line} L${W},${height} L0,${height} Z`} fill={`url(#${gradientId})`} />
      <path
        data-line
        d={line}
        pathLength={1}
        strokeDasharray={1}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle data-after-line cx={lastX} cy={lastY} r={5} fill={color} stroke={t.color.surface} strokeWidth={2} />
    </svg>
  )
}
