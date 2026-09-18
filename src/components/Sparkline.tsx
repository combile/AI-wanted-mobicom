import type { ScorePoint } from '../lib/types'

export default function Sparkline({
  points,
  width = 100,
  height = 32,
  color = 'var(--color-accent)',
  strokeWidth = 2,
}: {
  points: ScorePoint[]
  width?: number
  height?: number
  color?: string
  strokeWidth?: number
}) {
  if (points.length < 2) return null
  const scores = points.map((p) => p.score)
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min || 1
  const stepX = width / (points.length - 1)
  const coords = scores.map((s, i) => {
    const x = i * stepX
    const y = height - ((s - min) / range) * (height - strokeWidth) - strokeWidth / 2
    return [x, y] as const
  })
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = coords[coords.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={strokeWidth + 1} fill={color} />
    </svg>
  )
}
