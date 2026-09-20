import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import RankingRow from '../components/RankingRow'
import TrendRowSection from '../components/TrendRowSection'
import TrendFeature from '../components/TrendFeature'
import TrendTile from '../components/TrendTile'
import VideoTile from '../components/VideoTile'
import Icon from '../components/Icon'
import { formatChange } from '../lib/format'
import { TIME_RANGES, type TimeRangeKey } from '../lib/meta'
import { Flip, gsap, motionOk, useGSAP } from '../lib/motion'
import { byCategory, byScoreDesc, byStatuses, rankFor } from '../lib/selectors'
import type { CategoryKey } from '../lib/types'
import { useInterests } from '../store/useInterests'
import { useTrends } from '../store/useTrends'
import { useVideos } from '../store/useVideos'
import { theme as t } from '../styles/theme'
import {
  Banner,
  BannerArrow,
  Chip,
  MoreLink,
  Page,
  ScrollRow,
  Section,
  SectionHead,
  SectionTitle,
  TileGrid,
} from '../styles/ui'

const LIFE: { key: CategoryKey; label: string }[] = [
  { key: 'fashion', label: '입는 것' },
  { key: 'food', label: '먹는 것' },
  { key: 'content', label: '보는 것' },
  { key: 'item', label: '사는 것' },
]

const Headline = styled.h1`
  margin-top: 12px;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
`

const Tagline = styled.p`
  margin: 4px 0 20px;
  font-size: 16px;
  color: ${t.color.dim};
`

const SearchLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: ${t.radius.pill};
  background: ${t.color.surface};
  font-size: 14px;
  color: ${t.color.dim};
`

const Chips = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

// 4위부터는 썸네일 없이 2열 텍스트 차트로
const Chart = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 24px;
  margin-top: 16px;
`

// 밈은 그림이 없는 말의 유행이라 글자 자체를 크게 보여준다
const Cloud = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 18px;

  a {
    /* 글자 한 줄(29px)만으로는 누르기 작아서 위아래로 영역을 넓힌다 */
    padding: 8px 0;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.2;
  }

  a:nth-of-type(even) {
    color: ${t.color.dim};
  }

  small {
    margin-left: 6px;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    color: ${t.color.dim};
  }
`

const VideoScroll = styled(ScrollRow)`
  gap: 12px;

  > * {
    flex: 0 0 208px;
  }
`

const VideoNote = styled.span`
  font-size: 14px;
  color: ${t.color.dim};
`

const Source = styled.p`
  margin-top: 36px;
  font-size: 12px;
  color: ${t.color.dim};

  button {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 4px;
    color: ${t.color.text};
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`

export default function Home() {
  const [range, setRange] = useState<TimeRangeKey>('today')
  const [life, setLife] = useState<CategoryKey>('fashion')
  const trends = useTrends((s) => s.trends)
  const status = useTrends((s) => s.status)
  const videos = useVideos((s) => s.videos)

  useEffect(() => {
    void useVideos.getState().load()
  }, [])
  const { interests, onboarded } = useInterests()

  const page = useRef<HTMLDivElement>(null)
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null)

  const ranking = useMemo(() => rankFor(trends, range).slice(0, 10), [trends, range])
  const podiumIds = ranking.slice(0, 3).map((tr) => tr.id)
  // 포디움에 없는 것 중 가장 빠르게 크는 트렌드
  const fastest = [...trends].filter((tr) => !podiumIds.includes(tr.id)).sort((a, b) => b.changePct - a.changePct)[0]
  const lifeList = byCategory(trends, life)
  const memes = byCategory(trends, 'meme')
  const lifeLabel = LIFE.find((l) => l.key === life)?.label
  const forYou = onboarded
    ? byScoreDesc(trends)
        .filter((tr) => interests.includes(tr.category))
        .slice(0, 8)
    : []

  // 기간을 바꾸면 순위 항목이 새 자리로 미끄러져 간다 (FLIP).
  function changeRange(next: TimeRangeKey) {
    if (next === range) return
    if (page.current && motionOk()) flipState.current = Flip.getState(page.current.querySelectorAll('[data-flip-id]'))
    setRange(next)
  }

  useGSAP(
    () => {
      const state = flipState.current
      flipState.current = null
      if (!state || !page.current) return
      Flip.from(state, {
        targets: page.current.querySelectorAll('[data-flip-id]'),
        duration: 0.55,
        ease: 'power3.inOut',
        stagger: 0.015,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 }),
      })
    },
    { dependencies: [range] },
  )

  // 1위의 3D 아이콘만 계속 살짝 떠 있는다 — "지금 움직이고 있다"는 신호는 한 군데면 충분하다.
  useGSAP(
    () => {
      if (!motionOk()) return
      gsap.to('[data-float] img', { y: -5, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 })
    },
    { scope: page },
  )

  return (
    <Layout>
      <Page ref={page}>
        <Headline data-stagger>지금 뜨는 것</Headline>
        <Tagline data-stagger>세상의 모든 트렌드가, 여기에</Tagline>

        <SearchLink to="/search" data-stagger>
          <Icon name="search" size={20} />
          궁금한 트렌드를 검색해보세요
        </SearchLink>

        <Section>
          <SectionHead data-stagger>
            <SectionTitle>지금 가장 뜨는 트렌드</SectionTitle>
            <MoreLink to="/explore">
              더보기
              <Icon name="chevronRight" size={16} />
            </MoreLink>
          </SectionHead>

          <Chips data-stagger>
            {TIME_RANGES.map((r) => (
              <Chip key={r.key} aria-pressed={range === r.key} onClick={() => changeRange(r.key)}>
                {r.label}
              </Chip>
            ))}
          </Chips>

          <TileGrid data-cols="3">
            {ranking.slice(0, 3).map((trend, i) => (
              <TrendTile
                key={trend.id}
                trend={trend}
                rank={i + 1}
                accent={i === 0}
                pop
                data-stagger
                data-float={i === 0 || undefined}
              />
            ))}
          </TileGrid>

          <Chart>
            {ranking.slice(3).map((trend, i) => (
              <RankingRow key={trend.id} trend={trend} rank={i + 4} />
            ))}
          </Chart>
        </Section>

        {fastest && (
          <Section>
            <TrendFeature trend={fastest} label="지금 가장 빠르게 크는 중" data-stagger />
          </Section>
        )}

        {forYou.length > 0 && (
          <TrendRowSection
            title="FOR YOU"
            trends={forYou}
            action={<MoreLink to="/onboarding">관심 분야 수정</MoreLink>}
          />
        )}

        <TrendRowSection title="지금 폭발 중" trends={byStatuses(trends, ['viral', 'rising']).slice(0, 8)} />

        {videos && videos.length > 0 && (
          <Section data-stagger>
            <SectionHead>
              <SectionTitle>유튜브 인기 영상</SectionTitle>
              <VideoNote>한국 기준</VideoNote>
            </SectionHead>
            <VideoScroll>
              {videos.slice(0, 12).map((video) => (
                <VideoTile key={video.id} video={video} />
              ))}
            </VideoScroll>
          </Section>
        )}

        {memes.length > 0 && (
          <Section data-stagger>
            <SectionHead>
              <SectionTitle>오늘의 밈</SectionTitle>
            </SectionHead>
            <Cloud>
              {memes.map((meme) => (
                <Link key={meme.id} to={`/trend/${meme.id}`}>
                  {meme.title}
                  <small>{formatChange(meme.changePct)}</small>
                </Link>
              ))}
            </Cloud>
          </Section>
        )}

        <Section data-stagger>
          <SectionHead>
            <SectionTitle>요즘 많이</SectionTitle>
          </SectionHead>
          <Chips>
            {LIFE.map((l) => (
              <Chip key={l.key} aria-pressed={life === l.key} onClick={() => setLife(l.key)}>
                {l.label}
              </Chip>
            ))}
          </Chips>
          {lifeList[0] ? (
            <>
              <TrendFeature trend={lifeList[0]} label={`요즘 가장 많이 ${lifeLabel}`} />
              {lifeList.length > 1 && (
                <TileGrid data-cols="3" style={{ marginTop: 16 }}>
                  {lifeList.slice(1, 4).map((trend) => (
                    <TrendTile key={trend.id} trend={trend} />
                  ))}
                </TileGrid>
              )}
            </>
          ) : (
            <VideoNote style={{ display: 'block', marginTop: 16 }}>
              아직 {lifeLabel} 카테고리에 뜨는 트렌드가 없어요
            </VideoNote>
          )}
        </Section>

        {!onboarded && (
          <Banner to="/onboarding" data-stagger>
            <span>
              <strong>나만의 트렌드 피드 만들기</strong>
              관심 분야를 고르면 FOR YOU가 열려요.
            </span>
            <BannerArrow>
              <Icon name="chevronRight" size={22} />
            </BannerArrow>
          </Banner>
        )}

        <TrendRowSection title="아직 많이 모르는 Rising Trend" trends={byStatuses(trends, ['emerging']).slice(0, 8)} />

        {status !== 'live' && (
          <Source role="status">
            {status === 'offline'
              ? '서버에 연결하지 못해 샘플 데이터를 보여주고 있어요.'
              : '아직 승인된 트렌드가 없어 샘플 데이터를 보여주고 있어요.'}{' '}
            <button onClick={() => void useTrends.getState().load()}>다시 시도</button>
          </Source>
        )}
      </Page>
    </Layout>
  )
}
