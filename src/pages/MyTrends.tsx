import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import StatusLabel from '../components/StatusLabel'
import TrendThumb from '../components/TrendThumb'
import { formatRelativeDate } from '../lib/format'
import { useSavedTrends } from '../store/useSavedTrends'
import { useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Banner, BannerArrow, Empty, Page, PrimaryLink, Rows } from '../styles/ui'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Title = styled(Link)`
  display: block;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 0 6px;
  font-size: 12px;
  color: ${t.color.dim};
`

const ScoreChange = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  span,
  svg {
    color: ${t.color.dim};
    font-weight: 500;
  }

  em {
    font-style: normal;
    font-weight: 500;
    color: ${t.color.dim};
  }

  em[data-down='true'] {
    color: ${t.color.down};
  }
`

const RemoveButton = styled.button`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  margin-right: -8px;
  color: ${t.color.accent};
`

export default function MyTrends() {
  const entries = useSavedTrends((s) => s.entries)
  const remove = useSavedTrends((s) => s.remove)
  const trends = useTrends((s) => s.trends)

  const rows = entries
    .flatMap((entry) => {
      const trend = trends.find((tr) => tr.id === entry.id)
      return trend ? [{ entry, trend }] : []
    })
    .sort((a, b) => new Date(b.entry.savedAt).getTime() - new Date(a.entry.savedAt).getTime())

  return (
    <Layout title="마이 트렌드">
      <Page>
        {rows.length === 0 ? (
          <Empty data-stagger>
            <Icon name="bookmarkOutline" size={56} />
            <p>
              아직 저장한 트렌드가 없어요.
              <br />
              뜨기 전에 저장해 두면 얼마나 컸는지 보여드려요.
            </p>
            <PrimaryLink to="/explore">트렌드 탐색하기</PrimaryLink>
          </Empty>
        ) : (
          <>
            <Rows>
              {rows.map(({ entry, trend }) => {
                const delta = trend.score - entry.scoreAtSave
                return (
                  <Row key={trend.id} data-stagger>
                    <TrendThumb trend={trend} size={76} />
                    <Body>
                      <Title to={`/trend/${trend.id}`}>{trend.title}</Title>
                      <Meta>
                        {formatRelativeDate(entry.savedAt)} 저장
                        <StatusLabel status={trend.status} />
                      </Meta>
                      <ScoreChange>
                        <span>{entry.scoreAtSave}</span>
                        <Icon name="arrowRight" size={14} />
                        {trend.score}
                        <em data-down={delta < 0}>
                          ({delta > 0 ? '+' : ''}
                          {delta})
                        </em>
                      </ScoreChange>
                    </Body>
                    <RemoveButton onClick={() => remove(trend.id)} aria-label={`${trend.title} 저장 취소`}>
                      <Icon name="bookmark" size={24} />
                    </RemoveButton>
                  </Row>
                )
              })}
            </Rows>
            <Banner to="/explore" data-tone="blue" data-stagger>
              <span>
                <strong>다음에 뜰 트렌드 찾기</strong>
                Emerging 단계에서 먼저 저장해 보세요.
              </span>
              <BannerArrow>
                <Icon name="chevronRight" size={22} />
              </BannerArrow>
            </Banner>
          </>
        )}
      </Page>
    </Layout>
  )
}
