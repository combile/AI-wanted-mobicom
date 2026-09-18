import type { ReactNode } from 'react'
import type { TrendCard } from '../lib/types'
import { Section, SectionHead, SectionTitle, TileScroll } from '../styles/ui'
import TrendTile from './TrendTile'

export default function TrendRowSection({
  title,
  trends,
  action,
}: {
  title: string
  trends: TrendCard[]
  action?: ReactNode
}) {
  if (trends.length === 0) return null
  return (
    <Section data-stagger>
      <SectionHead>
        <SectionTitle>{title}</SectionTitle>
        {action}
      </SectionHead>
      <TileScroll>
        {trends.map((trend) => (
          <TrendTile key={trend.id} trend={trend} />
        ))}
      </TileScroll>
    </Section>
  )
}
