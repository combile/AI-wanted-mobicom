import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import IconText from '../components/IconText'
import { useSavedTrends } from '../store/useSavedTrends'
import { getTrend } from '../data/trends'
import { STATUS_MAP } from '../lib/meta'
import { formatRelativeDate } from '../lib/format'

export default function MyTrends() {
  const { entries, remove } = useSavedTrends()

  const rows = entries
    .map((e) => ({ entry: e, trend: getTrend(e.id) }))
    .filter((r) => Boolean(r.trend))
    .sort((a, b) => new Date(b.entry.savedAt).getTime() - new Date(a.entry.savedAt).getTime())

  return (
    <Layout title="마이 트렌드">
      <div className="px-4 pt-4">
        <p className="text-xs text-[var(--color-text-dim)] mb-4">저장한 트렌드의 성장을 추적해보세요.</p>

        {rows.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="star" size={32} className="mx-auto mb-2 text-[var(--color-text-dim)]" />
            <p className="text-sm text-[var(--color-text-dim)] mb-4">아직 저장한 트렌드가 없어요.</p>
            <Link to="/explore" className="text-sm font-semibold text-black bg-[var(--color-accent)] rounded-full px-4 py-2">
              트렌드 탐색하러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {rows.map(({ entry, trend }) => {
              if (!trend) return null
              const status = STATUS_MAP[trend.status]
              const delta = trend.score - entry.scoreAtSave
              return (
                <div key={trend.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/trend/${trend.id}`} className="text-sm font-semibold">
                      {trend.title}
                    </Link>
                    <button onClick={() => remove(trend.id)} className="text-xs text-[var(--color-text-dim)]">
                      삭제
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-dim)] mb-3">
                    {formatRelativeDate(entry.savedAt)} 저장
                  </p>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-[var(--color-text-dim)]">TREND SCORE</p>
                      <p className="inline-flex items-center gap-1 text-sm font-bold">
                        {entry.scoreAtSave}
                        <Icon name="chevronRight" size={12} className="text-[var(--color-text-dim)]" />
                        {trend.score}
                        <Icon
                          name={delta >= 0 ? 'arrowUp' : 'arrowDown'}
                          size={14}
                          strokeWidth={2.25}
                          className={delta >= 0 ? 'text-[var(--color-accent)]' : 'text-rose-400'}
                        />
                      </p>
                    </div>
                    <div className="flex-1" />
                    <span
                      className="text-[11px] font-semibold rounded-full px-2 py-1"
                      style={{ background: `${status.color}1f`, color: status.color }}
                    >
                      <IconText icon={status.icon} size={11}>{status.label}</IconText>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
