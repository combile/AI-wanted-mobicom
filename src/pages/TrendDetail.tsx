import { useState } from 'react'
import { Navigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import ChangeTag from '../components/ChangeTag'
import Sparkline from '../components/Sparkline'
import Icon from '../components/Icon'
import IconText from '../components/IconText'
import { getTrend } from '../data/trends'
import { relatedOf } from '../lib/selectors'
import { CATEGORY_MAP, STATUS_MAP } from '../lib/meta'
import { formatDate, formatRelativeDate } from '../lib/format'
import { useSavedTrends } from '../store/useSavedTrends'
import ShareModal from '../components/ShareModal'

export default function TrendDetail() {
  const { id } = useParams<{ id: string }>()
  const trend = id ? getTrend(id) : undefined
  const [shareOpen, setShareOpen] = useState(false)
  const { isSaved, toggle } = useSavedTrends()

  if (!trend) return <Navigate to="/explore" replace />

  const category = CATEGORY_MAP[trend.category]
  const status = STATUS_MAP[trend.status]
  const related = relatedOf(trend)
  const saved = isSaved(trend.id)

  return (
    <Layout title="트렌드 상세">
      <div className="px-4 pt-4 pb-8">
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)] mb-2">
          <IconText icon={category.icon} size={12}>{category.label}</IconText>
          <span>·</span>
          <span>처음 포착 {formatRelativeDate(trend.firstDetected)}</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-2">{trend.title}</h1>
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={trend.status} size="md" />
          <ChangeTag pct={trend.changePct} />
        </div>

        <p className="text-sm text-[var(--color-text-dim)] leading-relaxed mb-4">{trend.summary}</p>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] text-[var(--color-text-dim)]">TREND SCORE</p>
              <p className="text-3xl font-extrabold" style={{ color: status.color }}>
                {trend.score}
              </p>
            </div>
            <Sparkline points={trend.history} color={status.color} width={140} height={44} />
          </div>
          <p className="inline-flex items-center gap-1 text-[11px] text-[var(--color-text-dim)]">
            현재 상태:
            <Icon name={status.icon} size={12} />
            {status.label} — {status.description}
          </p>
          {trend.growth24h !== undefined && (
            <p className="text-[11px] text-[var(--color-accent)] mt-1">지난 24시간 +{trend.growth24h}%</p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => toggle(trend.id, trend.score)}
            className={
              saved
                ? 'flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-accent)] text-black text-sm font-semibold py-2.5'
                : 'flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] text-sm font-semibold py-2.5'
            }
          >
            <Icon name={saved ? 'check' : 'plus'} size={16} strokeWidth={2.25} />
            {saved ? '저장됨' : '저장하기'}
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] text-sm font-semibold py-2.5"
          >
            <Icon name="share" size={16} strokeWidth={2} />
            공유하기
          </button>
        </div>

        <section className="mb-6">
          <h2 className="text-sm font-bold mb-3">
            <IconText icon="idea">왜 갑자기 뜨고 있을까?</IconText>
          </h2>
          <div className="space-y-3">
            {trend.why.map((w) => (
              <div key={w.order} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[11px] font-bold text-[var(--color-accent)]">
                  {w.order}
                </span>
                <p className="text-sm leading-relaxed pt-0.5">{w.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold mb-3">
            <IconText icon="trendingUp">확산 경로</IconText>
          </h2>
          <div className="flex items-center gap-1 flex-wrap text-xs">
            {trend.spreadPath.map((step, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1">{step}</span>
                {i < trend.spreadPath.length - 1 && (
                  <Icon name="chevronRight" size={12} className="text-[var(--color-text-dim)]" />
                )}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold mb-3">
            <IconText icon="clock">Trend Timeline</IconText>
          </h2>
          <div className="relative pl-4 border-l border-[var(--color-border)] space-y-4">
            {trend.timeline.map((ev, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
                <p className="text-[11px] text-[var(--color-text-dim)]">{formatDate(ev.date)}</p>
                <p className="text-sm">{ev.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold mb-3">
            <IconText icon="hash">관련 키워드</IconText>
          </h2>
          <div className="flex gap-2 flex-wrap">
            {trend.keywords.map((k) => (
              <span key={k} className="text-xs rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-text-dim)]">
                {k}
              </span>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-sm font-bold mb-3">
              <IconText icon="network">관련 트렌드</IconText>
            </h2>
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/trend/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Icon name="related" size={14} className="text-[var(--color-text-dim)]" />
                    {r.title}
                  </span>
                  <ChangeTag pct={r.changePct} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {shareOpen && <ShareModal trend={trend} onClose={() => setShareOpen(false)} />}
    </Layout>
  )
}
