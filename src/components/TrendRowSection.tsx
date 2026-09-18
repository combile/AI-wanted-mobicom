import type { ReactNode } from 'react'
import type { TrendCard } from '../lib/types'
import TrendMiniCard from './TrendMiniCard'

export default function TrendRowSection({
  title,
  trends,
  action,
}: {
  title: ReactNode
  trends: TrendCard[]
  action?: ReactNode
}) {
  if (trends.length === 0) return null
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-2">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {trends.map((t) => (
          <TrendMiniCard key={t.id} trend={t} />
        ))}
      </div>
    </section>
  )
}
