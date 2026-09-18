import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import Layout from '../components/Layout'
import RankingRow from '../components/RankingRow'
import TrendRowSection from '../components/TrendRowSection'
import IconText from '../components/IconText'
import Icon from '../components/Icon'
import { TIME_RANGES } from '../lib/meta'
import { byCategory, byScoreDesc, byStatuses } from '../lib/selectors'
import { useInterests } from '../store/useInterests'
import { CATEGORY_MAP } from '../lib/meta'

export default function Home() {
  const [range, setRange] = useState<string>('today')
  const { interests, onboarded } = useInterests()

  const ranking = byScoreDesc().slice(0, 10)
  const top3 = ranking.slice(0, 3)
  const explosive = byStatuses(['viral', 'rising']).slice(0, 8)
  const risingHidden = byStatuses(['emerging']).slice(0, 8)
  const memes = byCategory('meme').slice(0, 8)
  const fashion = byCategory('fashion').slice(0, 8)
  const food = byCategory('food').slice(0, 8)
  const content = byCategory('content').slice(0, 8)
  const items = byCategory('item').slice(0, 8)

  const forYou = onboarded ? byScoreDesc().filter((t) => interests.includes(t.category)).slice(0, 8) : []

  return (
    <Layout>
      <div className="px-4 pt-4">
        <p className="text-xs text-[var(--color-text-dim)] mb-1">TREND NOW — 대한민국</p>
        <h1 className="text-xl font-extrabold mb-3">지금 뜨는 것</h1>
        <div className="flex gap-2 mb-4">
          {TIME_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full border',
                range === r.key
                  ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)] font-semibold'
                  : 'border-[var(--color-border)] text-[var(--color-text-dim)]',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-2">
          {top3.map((t, i) => (
            <Link
              key={t.id}
              to={`/trend/${t.id}`}
              className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              <p className="text-[10px] text-[var(--color-text-dim)] mb-1">#{i + 1}</p>
              <p className="text-xs font-semibold truncate mb-1">{t.title}</p>
              <p className="text-[var(--color-accent)] text-xs font-bold">+{Math.abs(t.changePct)}%</p>
            </Link>
          ))}
        </div>
      </div>

      <section className="mt-3">
        <div className="flex items-center justify-between px-4 mb-1">
          <h2 className="text-sm font-bold">메인 랭킹</h2>
          <Link to="/explore" className="inline-flex items-center gap-0.5 text-xs text-[var(--color-text-dim)]">
            전체보기
            <Icon name="chevronRight" size={12} />
          </Link>
        </div>
        <div className="border-t border-[var(--color-border)]">
          {ranking.map((t, i) => (
            <RankingRow key={t.id} trend={t} rank={i + 1} />
          ))}
        </div>
      </section>

      {onboarded && forYou.length > 0 && (
        <TrendRowSection
          title={<IconText icon="sparkles">FOR YOU</IconText>}
          trends={forYou}
          action={
            <Link to="/onboarding" className="text-xs text-[var(--color-text-dim)]">
              관심분야 수정
            </Link>
          }
        />
      )}
      {!onboarded && (
        <div className="mx-4 mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold mb-1">나만의 트렌드 피드 만들기</p>
            <p className="text-xs text-[var(--color-text-dim)]">관심 분야를 선택하면 FOR YOU를 볼 수 있어요.</p>
          </div>
          <Link to="/onboarding" className="text-xs font-semibold text-black bg-[var(--color-accent)] rounded-full px-3 py-2 whitespace-nowrap">
            선택하기
          </Link>
        </div>
      )}

      <TrendRowSection title={<IconText icon="flame">지금 폭발 중</IconText>} trends={explosive} />
      <TrendRowSection title={<IconText icon="sprout">아직 많이 모르는 Rising Trend</IconText>} trends={risingHidden} />
      <TrendRowSection title={<IconText icon="laugh">오늘의 밈</IconText>} trends={memes} />
      <TrendRowSection
        title={<IconText icon={CATEGORY_MAP.fashion.icon}>요즘 많이 입는 것</IconText>}
        trends={fashion}
      />
      <TrendRowSection title={<IconText icon={CATEGORY_MAP.food.icon}>요즘 많이 먹는 것</IconText>} trends={food} />
      <TrendRowSection title={<IconText icon="smartphone">요즘 많이 보는 것</IconText>} trends={content} />
      <TrendRowSection title={<IconText icon="shoppingBag">요즘 많이 사는 것</IconText>} trends={items} />
    </Layout>
  )
}
