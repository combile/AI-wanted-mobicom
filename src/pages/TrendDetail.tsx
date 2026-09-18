import { useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import StatusLabel from '../components/StatusLabel'
import ChangeTag from '../components/ChangeTag'
import Sparkline from '../components/Sparkline'
import Icon from '../components/Icon'
import TrendThumb from '../components/TrendThumb'
import TrendTile from '../components/TrendTile'
import ShareModal from '../components/ShareModal'
import { CATEGORY_MAP, STATUS_MAP } from '../lib/meta'
import { pop, useCountUp } from '../lib/motion'
import { relatedOf } from '../lib/selectors'
import { formatDate, formatRelativeDate } from '../lib/format'
import { useSavedTrends } from '../store/useSavedTrends'
import { useTrend, useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Card, IconButton, Page, Section, SectionTitle, TileScroll } from '../styles/ui'

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
`

const Meta = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-top: 6px;
  font-size: 14px;
  color: ${t.color.dim};
`

const Summary = styled.p`
  font-size: 16px;
  line-height: 1.65;
  color: ${t.color.dim};
`

const ScoreLabel = styled.h2`
  font-size: 14px;
  font-weight: 600;
  color: ${t.color.dim};
`

const ScoreLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 4px 0 12px;
`

const Score = styled.p`
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
`

const Axis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: ${t.color.dim};
`

const Note = styled.p`
  margin-top: 12px;
  font-size: 14px;
  color: ${t.color.dim};
`

const WhyList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;

  li {
    display: flex;
    gap: 14px;
    font-size: 16px;
    line-height: 1.55;
  }

  li > span {
    flex-shrink: 0;
    width: 14px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: ${t.color.accent};
  }
`

const Path = styled.p`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 2px;
  font-size: 16px;

  svg {
    color: ${t.color.dim};
  }
`

const Timeline = styled.ol`
  list-style: none;
  margin: 0 0 0 4px;
  padding: 0 0 0 20px;
  border-left: 1px solid ${t.color.border};
  display: flex;
  flex-direction: column;
  gap: 18px;

  li {
    position: relative;
    font-size: 16px;
  }

  li::before {
    content: '';
    position: absolute;
    left: -24.5px;
    top: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${t.color.dim};
  }

  /* 가장 최근 사건만 메인 컬러 */
  li:last-of-type::before {
    background: ${t.color.accent};
  }

  time {
    display: block;
    font-size: 12px;
    color: ${t.color.dim};
  }
`

const Keywords = styled.p`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  font-size: 16px;
  color: ${t.color.dim};
`

// 이 트렌드의 영상·밈·기사를 각 서비스에서 바로 검색한다. API 키도 쿼터도 들지 않는다.
const SEARCH_SITES = [
  { label: '유튜브', url: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
  { label: '네이버', url: (q: string) => `https://search.naver.com/search.naver?query=${encodeURIComponent(q)}` },
  { label: '구글', url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
]

const OutLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 13px 16px;
    border-radius: ${t.radius.pill};
    background: ${t.color.surface};
    font-size: 14px;
    font-weight: 600;
  }

  svg {
    color: ${t.color.dim};
  }
`

export default function TrendDetail() {
  const { id } = useParams<{ id: string }>()
  const trend = useTrend(id)
  const trends = useTrends((s) => s.trends)
  const saved = useSavedTrends((s) => s.entries.some((e) => e.id === id))
  const toggle = useSavedTrends((s) => s.toggle)
  const [shareOpen, setShareOpen] = useState(false)
  const scoreRef = useRef<HTMLParagraphElement>(null)
  useCountUp(scoreRef, trend?.score ?? 0)

  if (!trend) return <Navigate to="/explore" replace />

  const status = STATUS_MAP[trend.status]
  const related = relatedOf(trends, trend)
  const h = trend.history

  return (
    <Layout
      back
      documentTitle={trend.title}
      actions={
        <>
          <IconButton
            aria-pressed={saved}
            aria-label={saved ? '저장 취소' : '저장'}
            onClick={(e) => {
              toggle(trend.id, trend.score)
              pop(e.currentTarget.firstElementChild)
            }}
          >
            <Icon name={saved ? 'bookmark' : 'bookmarkOutline'} size={24} />
          </IconButton>
          <IconButton aria-label="공유" onClick={() => setShareOpen(true)}>
            <Icon name="share" size={22} />
          </IconButton>
        </>
      }
    >
      <Page>
        <Header data-stagger>
          <TrendThumb trend={trend} size={96} pop />
          <div>
            <Title>{trend.title}</Title>
            <Meta>
              {CATEGORY_MAP[trend.category].label}
              <StatusLabel status={trend.status} />
              <span>처음 포착 {formatRelativeDate(trend.firstDetected)}</span>
            </Meta>
          </div>
        </Header>

        <Summary data-stagger>{trend.summary}</Summary>

        <Card as="section" data-stagger style={{ marginTop: 28 }}>
          <ScoreLabel>트렌드 스코어</ScoreLabel>
          <ScoreLine>
            <Score ref={scoreRef}>{trend.score}</Score>
            <ChangeTag pct={trend.changePct} />
          </ScoreLine>
          <Sparkline points={h} color={trend.changePct < 0 ? t.color.down : t.color.accent} />
          {h.length >= 2 && (
            <Axis>
              <span>{formatDate(h[0].date)}</span>
              {h.length >= 3 && <span>{formatDate(h[Math.floor(h.length / 2)].date)}</span>}
              <span>{formatDate(h[h.length - 1].date)}</span>
            </Axis>
          )}
          <Note>
            {status.label}: {status.description}
            {trend.growth24h !== undefined && `. 지난 24시간 +${trend.growth24h}%`}
          </Note>
        </Card>

        <Section data-stagger>
          <SectionTitle style={{ marginBottom: 14 }}>왜 뜨는지?</SectionTitle>
          <WhyList>
            {trend.why.map((w) => (
              <li key={w.order}>
                <span>{w.order}</span>
                {w.text}
              </li>
            ))}
          </WhyList>
        </Section>

        <Section data-stagger>
          <SectionTitle style={{ marginBottom: 12 }}>확산 경로</SectionTitle>
          <Path>
            {trend.spreadPath.map((step, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {i > 0 && <Icon name="chevronRight" size={16} />}
                {step}
              </span>
            ))}
          </Path>
        </Section>

        <Section data-stagger>
          <SectionTitle style={{ marginBottom: 14 }}>타임라인</SectionTitle>
          <Timeline>
            {trend.timeline.map((ev, i) => (
              <li key={i}>
                <time dateTime={ev.date}>{formatDate(ev.date)}</time>
                {ev.label}
              </li>
            ))}
          </Timeline>
        </Section>

        <Section data-stagger>
          <SectionTitle style={{ marginBottom: 12 }}>관련 키워드</SectionTitle>
          <Keywords>
            {trend.keywords.map((k) => (
              <span key={k}>{k}</span>
            ))}
          </Keywords>
        </Section>

        <Section data-stagger>
          <SectionTitle style={{ marginBottom: 12 }}>더 찾아보기</SectionTitle>
          <OutLinks>
            {SEARCH_SITES.map((site) => (
              <a key={site.label} href={site.url(trend.title)} target="_blank" rel="noopener noreferrer">
                {site.label}에서 보기
                <Icon name="external" size={16} />
              </a>
            ))}
          </OutLinks>
        </Section>

        {related.length > 0 && (
          <Section data-stagger>
            <SectionTitle style={{ marginBottom: 12 }}>관련 트렌드</SectionTitle>
            <TileScroll>
              {related.map((r) => (
                <TrendTile key={r.id} trend={r} />
              ))}
            </TileScroll>
          </Section>
        )}
      </Page>

      {shareOpen && <ShareModal trend={trend} onClose={() => setShareOpen(false)} />}
    </Layout>
  )
}
