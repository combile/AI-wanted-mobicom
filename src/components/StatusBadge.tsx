import { STATUS_MAP } from '../lib/meta'
import type { TrendStatus } from '../lib/types'
import Icon from './Icon'

export default function StatusBadge({ status, size = 'sm' }: { status: TrendStatus; size?: 'sm' | 'md' }) {
  const meta = STATUS_MAP[status]
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  const iconSize = size === 'sm' ? 12 : 14
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${padding}`}
      style={{ background: `${meta.color}1f`, color: meta.color }}
    >
      <Icon name={meta.icon} size={iconSize} strokeWidth={2} />
      <span>{meta.label}</span>
    </span>
  )
}
