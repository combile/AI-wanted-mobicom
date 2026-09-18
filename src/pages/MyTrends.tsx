import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import StatusLabel from '../components/StatusLabel'
import TrendThumb from '../components/TrendThumb'
import { formatRelativeDate } from '../lib/format'
import { useSavedTrends, type SavedEntry } from '../store/useSavedTrends'
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
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;

  span,
  svg {
    color: ${t.color.dim};
    font-weight: 500;
  }

  /* 저장한 뒤 얼마나 컸는지가 이 화면의 핵심이라 흐리게 두지 않는다 */
  em {
    font-style: normal;
    color: ${t.color.text};
  }

  em[data-down='true'] {
    color: ${t.color.down};
  }
`

const RemoveButton = styled.button`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-right: -10px;
  color: ${t.color.accent};
`

// 저장 취소는 "몇 점일 때 발견했는지"를 지우는 일이라, 잠깐 되돌릴 기회를 준다.
const UndoToast = styled.div`
  position: fixed;
  left: 50%;
  bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 15;
  translate: -50% 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: min(440px, calc(100% - 40px));
  padding: 8px 8px 8px 16px;
  border-radius: ${t.radius.md};
  background: ${t.color.surface2};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  font-size: 14px;

  span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  button {
    flex-shrink: 0;
    min-height: 44px;
    padding: 0 12px;
    font-weight: 700;
    color: ${t.color.accent};
  }
`

const UNDO_MS = 6000

export default function MyTrends() {
  const entries = useSavedTrends((s) => s.entries)
  const remove = useSavedTrends((s) => s.remove)
  const restore = useSavedTrends((s) => s.restore)
  const trends = useTrends((s) => s.trends)
  const [undo, setUndo] = useState<{ entry: SavedEntry; title: string } | null>(null)

  useEffect(() => {
    if (!undo) return
    const timer = setTimeout(() => setUndo(null), UNDO_MS)
    return () => clearTimeout(timer)
  }, [undo])

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
                    <RemoveButton
                      aria-label={`${trend.title} 저장 취소`}
                      onClick={() => {
                        remove(trend.id)
                        setUndo({ entry, title: trend.title })
                      }}
                    >
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

      {undo && (
        <UndoToast role="status">
          <span>‘{undo.title}’ 저장을 취소했어요</span>
          <button
            onClick={() => {
              restore(undo.entry)
              setUndo(null)
            }}
          >
            되돌리기
          </button>
        </UndoToast>
      )}
    </Layout>
  )
}
