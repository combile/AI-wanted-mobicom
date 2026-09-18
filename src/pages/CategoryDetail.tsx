import { useParams, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import TrendFeature from '../components/TrendFeature'
import TrendTile from '../components/TrendTile'
import Icon from '../components/Icon'
import { CATEGORY_MAP } from '../lib/meta'
import { byCategory } from '../lib/selectors'
import { useTrends } from '../store/useTrends'
import { Empty, Lead, Page, PrimaryLink, TileGrid } from '../styles/ui'

export default function CategoryDetail() {
  const { key } = useParams<{ key: string }>()
  const trends = useTrends((s) => s.trends)
  const meta = key ? CATEGORY_MAP[key] : undefined
  if (!meta) return <Navigate to="/category" replace />

  const list = byCategory(trends, meta.key)

  return (
    <Layout title={meta.label} back>
      <Page>
        <Lead data-stagger>
          {meta.examples}
        </Lead>
        {list.length === 0 ? (
          <Empty data-stagger>
            <Icon name={meta.icon} size={56} />
            <p>이 카테고리는 아직 포착된 트렌드가 없어요.</p>
            <PrimaryLink to="/explore">전체 트렌드 보기</PrimaryLink>
          </Empty>
        ) : (
          <>
            <TrendFeature trend={list[0]} label={`${meta.label} 1위`} data-stagger />
            <TileGrid style={{ marginTop: 24 }}>
              {list.slice(1).map((trend) => (
                <TrendTile key={trend.id} trend={trend} save status data-stagger />
              ))}
            </TileGrid>
          </>
        )}
      </Page>
    </Layout>
  )
}
