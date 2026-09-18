import { useMemo, useState } from 'react'
import clsx from 'clsx'
import Layout from '../components/Layout'
import TrendGridCard from '../components/TrendGridCard'
import IconText from '../components/IconText'
import { CATEGORIES, STATUSES } from '../lib/meta'
import { TRENDS } from '../data/trends'
import type { CategoryKey, TrendStatus } from '../lib/types'

type SortKey = 'score' | 'change'

export default function Explore() {
  const [category, setCategory] = useState<CategoryKey | 'all'>('all')
  const [status, setStatus] = useState<TrendStatus | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('score')

  const results = useMemo(() => {
    let list = TRENDS.slice()
    if (category !== 'all') list = list.filter((t) => t.category === category)
    if (status !== 'all') list = list.filter((t) => t.status === status)
    list.sort((a, b) => (sort === 'score' ? b.score - a.score : b.changePct - a.changePct))
    return list
  }, [category, status, sort])

  return (
    <Layout title="탐색">
      <div className="px-4 pt-4">
        <p className="text-xs text-[var(--color-text-dim)] mb-2">새로운 트렌드를 탐색하는 곳</p>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2 -mx-4 px-4">
          <button
            onClick={() => setCategory('all')}
            className={clsx(
              'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border',
              category === 'all'
                ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)] font-semibold'
                : 'border-[var(--color-border)] text-[var(--color-text-dim)]',
            )}
          >
            전체
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={clsx(
                'flex-shrink-0 text-xs px-3 py-1.5 rounded-full border',
                category === c.key
                  ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)] font-semibold'
                  : 'border-[var(--color-border)] text-[var(--color-text-dim)]',
              )}
            >
              <IconText icon={c.icon} size={12}>{c.label}</IconText>
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
          <button
            onClick={() => setStatus('all')}
            className={clsx(
              'flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border',
              status === 'all' ? 'border-white text-white' : 'border-[var(--color-border)] text-[var(--color-text-dim)]',
            )}
          >
            모든 상태
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={clsx(
                'flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border',
                status === s.key ? 'border-white text-white' : 'border-[var(--color-border)] text-[var(--color-text-dim)]',
              )}
            >
              <IconText icon={s.icon} size={11}>{s.label}</IconText>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-[var(--color-text-dim)]">{results.length}개의 트렌드</p>
          <div className="flex gap-1">
            <button
              onClick={() => setSort('score')}
              className={clsx('text-xs px-2 py-1 rounded-full', sort === 'score' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]')}
            >
              점수순
            </button>
            <button
              onClick={() => setSort('change')}
              className={clsx('text-xs px-2 py-1 rounded-full', sort === 'change' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]')}
            >
              급상승순
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-4">
          {results.map((t) => (
            <TrendGridCard key={t.id} trend={t} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
