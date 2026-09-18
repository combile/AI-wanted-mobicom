import { Link } from 'react-router-dom'
import type { TrendCard } from '../lib/types'
import { CATEGORY_MAP } from '../lib/meta'
import StatusBadge from './StatusBadge'
import ChangeTag from './ChangeTag'
import Icon from './Icon'

export default function TrendGridCard({ trend }: { trend: TrendCard }) {
  const category = CATEGORY_MAP[trend.category]
  return (
    <Link
      to={`/trend/${trend.id}`}
      className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
          <Icon name={category.icon} size={12} />
          {category.label}
        </span>
        <StatusBadge status={trend.status} />
      </div>
      <p className="text-base font-semibold mb-1">{trend.title}</p>
      <p className="text-xs text-[var(--color-text-dim)] line-clamp-2 mb-3">{trend.summary}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--color-accent)]">TREND {trend.score}</span>
        <ChangeTag pct={trend.changePct} />
      </div>
    </Link>
  )
}
