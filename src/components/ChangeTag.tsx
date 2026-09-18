import { formatChange } from '../lib/format'
import Icon from './Icon'

export default function ChangeTag({ pct }: { pct: number }) {
  const positive = pct >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        positive ? 'text-[var(--color-accent)]' : 'text-rose-400'
      }`}
    >
      <Icon name={positive ? 'arrowUp' : 'arrowDown'} size={12} strokeWidth={2.25} />
      {formatChange(pct)}
    </span>
  )
}
