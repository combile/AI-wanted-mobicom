import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import IconText from '../components/IconText'
import { TRENDS } from '../data/trends'
import { STATUS_MAP } from '../lib/meta'
import type { TrendCard } from '../lib/types'

const SIZE = 320
const PAD = 24

export default function Radar() {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<TrendCard | null>(null)

  const points = useMemo(() => {
    const maxChange = Math.max(...TRENDS.map((t) => Math.abs(t.changePct)), 1)
    return TRENDS.map((t) => {
      const x = PAD + ((t.changePct + maxChange) / (2 * maxChange)) * (SIZE - PAD * 2)
      const y = PAD + (1 - t.score / 100) * (SIZE - PAD * 2)
      return { trend: t, x, y }
    })
  }, [])

  return (
    <Layout title="Trend Radar">
      <div className="px-4 pt-4">
        <p className="text-xs text-[var(--color-text-dim)] mb-4">
          Y축: 관심도(TREND SCORE) · X축: 성장 속도(변화율) — 점을 눌러 트렌드를 확인하세요.
        </p>

        <div className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] mx-auto" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="absolute inset-0">
            <line x1={SIZE / 2} y1={PAD} x2={SIZE / 2} y2={SIZE - PAD} stroke="var(--color-border)" strokeDasharray="4 4" />
            <line x1={PAD} y1={SIZE / 2} x2={SIZE - PAD} y2={SIZE / 2} stroke="var(--color-border)" strokeDasharray="4 4" />
            {points.map(({ trend, x, y }) => {
              const status = STATUS_MAP[trend.status]
              const isHovered = hovered?.id === trend.id
              return (
                <circle
                  key={trend.id}
                  cx={x}
                  cy={y}
                  r={isHovered ? 7 : 5}
                  fill={status.color}
                  fillOpacity={isHovered ? 1 : 0.75}
                  stroke="black"
                  strokeWidth={1}
                  className="cursor-pointer"
                  onClick={() => navigate(`/trend/${trend.id}`)}
                  onMouseEnter={() => setHovered(trend)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            })}
          </svg>

          <span className="absolute top-1 left-2 text-[10px] text-[var(--color-text-dim)]">대중화 정체</span>
          <span className="absolute top-1 right-2 text-[10px] text-[var(--color-text-dim)]">
            <IconText icon="rocket" size={11}>폭발 중</IconText>
          </span>
          <span className="absolute bottom-1 left-2 text-[10px] text-[var(--color-text-dim)]">작은 트렌드</span>
          <span className="absolute bottom-1 right-2 text-[10px] text-[var(--color-text-dim)]">
            <IconText icon="flame" size={11}>빠른 초기 상승</IconText>
          </span>
        </div>

        {hovered && (
          <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <p className="text-sm font-semibold">{hovered.title}</p>
            <p className="text-[11px] text-[var(--color-text-dim)]">
              SCORE {hovered.score} · 변화율 {hovered.changePct > 0 ? '+' : ''}
              {hovered.changePct}%
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
