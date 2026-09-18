import { useParams, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import TrendGridCard from '../components/TrendGridCard'
import Icon from '../components/Icon'
import { CATEGORY_MAP } from '../lib/meta'
import { byCategory } from '../lib/selectors'
import type { CategoryKey } from '../lib/types'

export default function CategoryDetail() {
  const { key } = useParams<{ key: string }>()
  const meta = key ? CATEGORY_MAP[key] : undefined
  if (!meta) return <Navigate to="/category" replace />

  const trends = byCategory(key as CategoryKey)

  const title = (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={meta.icon} size={16} />
      {meta.label}
    </span>
  )

  return (
    <Layout title={title}>
      <div className="px-4 pt-4">
        <p className="text-xs text-[var(--color-text-dim)] mb-4">{meta.examples}</p>
        {trends.length === 0 ? (
          <p className="text-sm text-[var(--color-text-dim)] py-10 text-center">아직 수집된 트렌드가 없어요.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {trends.map((t) => (
              <TrendGridCard key={t.id} trend={t} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
