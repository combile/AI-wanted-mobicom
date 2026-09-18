import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { CATEGORIES } from '../lib/meta'
import { byCategory } from '../lib/selectors'

export default function CategoryGrid() {
  return (
    <Layout title="카테고리">
      <div className="px-4 pt-4">
        <p className="text-xs text-[var(--color-text-dim)] mb-4">다양한 시선으로 보는 트렌드</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((c) => {
            const count = byCategory(c.key).length
            return (
              <Link
                key={c.key}
                to={`/category/${c.key}`}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-1"
              >
                <Icon name={c.icon} size={26} strokeWidth={1.5} />
                <span className="text-sm font-semibold">{c.label}</span>
                <span className="text-[11px] text-[var(--color-text-dim)]">{c.examples}</span>
                <span className="text-[11px] text-[var(--color-accent)] mt-1">{count}개 트렌드</span>
              </Link>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
