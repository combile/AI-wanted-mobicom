import { Link } from 'react-router-dom'
import type { TrendCard } from '../lib/types'
import { STATUS_MAP, CATEGORY_MAP } from '../lib/meta'
import ChangeTag from './ChangeTag'
import Icon from './Icon'

export default function RankingRow({ trend, rank }: { trend: TrendCard; rank: number }) {
  const status = STATUS_MAP[trend.status]
  const category = CATEGORY_MAP[trend.category]
  return (
    <Link
      to={`/trend/${trend.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] active:bg-[var(--color-surface)]"
    >
      <span className="w-5 text-sm font-bold text-[var(--color-text-dim)]">{rank}</span>
      <span className="flex-shrink-0" style={{ color: status.color }}>
        <Icon name={status.icon} size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{trend.title}</p>
        <p className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
          <Icon name={category.icon} size={12} />
          {category.label}
        </p>
      </div>
      <ChangeTag pct={trend.changePct} />
    </Link>
  )
}
