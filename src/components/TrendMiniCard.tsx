import { Link } from 'react-router-dom'
import type { TrendCard } from '../lib/types'
import { STATUS_MAP } from '../lib/meta'
import ChangeTag from './ChangeTag'
import Icon from './Icon'

export default function TrendMiniCard({ trend }: { trend: TrendCard }) {
  const status = STATUS_MAP[trend.status]
  return (
    <Link
      to={`/trend/${trend.id}`}
      className="flex-shrink-0 w-36 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-1.5 py-0.5"
          style={{ background: `${status.color}1f`, color: status.color }}
        >
          <Icon name={status.icon} size={11} strokeWidth={2} />
          {status.label}
        </span>
        <span className="text-[10px] font-bold text-[var(--color-text-dim)]">{trend.score}</span>
      </div>
      <p className="text-sm font-semibold leading-snug line-clamp-2">{trend.title}</p>
      <ChangeTag pct={trend.changePct} />
    </Link>
  )
}
