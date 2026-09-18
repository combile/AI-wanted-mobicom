import { useMemo, useState } from 'react'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import TrendFeature from '../components/TrendFeature'
import TrendTile from '../components/TrendTile'
import { CATEGORIES, CATEGORY_MAP, STATUSES } from '../lib/meta'
import type { CategoryKey, TrendStatus } from '../lib/types'
import { useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Chip, Lead, Page, ScrollRow, TileGrid } from '../styles/ui'

type SortKey = 'score' | 'change'

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 10px;
  font-size: 14px;
  color: ${t.color.dim};
`

const SortButton = styled.button`
  min-height: 44px;
  padding: 0 0 0 12px;
  font-size: 14px;
  color: ${t.color.dim};

  &[aria-pressed='true'] {
    color: ${t.color.text};
    font-weight: 700;
  }
`

export default function Explore() {
  const trends = useTrends((s) => s.trends)
  const [category, setCategory] = useState<CategoryKey | 'all'>('all')
  const [status, setStatus] = useState<TrendStatus | 'all'>('all')
  const [sort, setSort] = useState<SortKey>('score')

  const results = useMemo(() => {
    let list = trends.slice()
    if (category !== 'all') list = list.filter((tr) => tr.category === category)
    if (status !== 'all') list = list.filter((tr) => tr.status === status)
    list.sort((a, b) => (sort === 'score' ? b.score - a.score : b.changePct - a.changePct))
    return list
  }, [trends, category, status, sort])

  const scope = category === 'all' ? '전체' : CATEGORY_MAP[category].label

  return (
    <Layout title="탐색">
      <Page>
        <ScrollRow data-stagger>
          <Chip aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
            전체
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.key} aria-pressed={category === c.key} onClick={() => setCategory(c.key)}>
              {c.label}
            </Chip>
          ))}
        </ScrollRow>

        <ScrollRow data-stagger style={{ marginTop: 8 }}>
          <Chip data-quiet aria-pressed={status === 'all'} onClick={() => setStatus('all')}>
            모든 상태
          </Chip>
          {STATUSES.map((s) => (
            <Chip data-quiet key={s.key} aria-pressed={status === s.key} onClick={() => setStatus(s.key)}>
              {s.label}
            </Chip>
          ))}
        </ScrollRow>

        <Toolbar data-stagger>
          <span>{results.length}개의 트렌드</span>
          <span>
            <SortButton aria-pressed={sort === 'score'} onClick={() => setSort('score')}>
              점수순
            </SortButton>
            <SortButton aria-pressed={sort === 'change'} onClick={() => setSort('change')}>
              급상승순
            </SortButton>
          </span>
        </Toolbar>

        {results[0] && (
          <TrendFeature
            trend={results[0]}
            label={`${scope} ${sort === 'score' ? '점수' : '급상승'} 1위`}
            data-stagger
          />
        )}
        <TileGrid style={{ marginTop: 24 }}>
          {results.slice(1).map((trend) => (
            <TrendTile key={trend.id} trend={trend} save status data-stagger />
          ))}
        </TileGrid>
        {results.length === 0 && (
          <Lead style={{ textAlign: 'center', padding: '56px 0' }}>조건에 맞는 트렌드가 없어요. 필터를 줄여보세요.</Lead>
        )}
      </Page>
    </Layout>
  )
}
