import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { CATEGORIES } from '../lib/meta'
import { useInterests } from '../store/useInterests'
import type { CategoryKey } from '../lib/types'

export default function Onboarding() {
  const { interests, setInterests } = useInterests()
  const [selected, setSelected] = useState<Set<CategoryKey>>(new Set(interests))
  const navigate = useNavigate()

  function toggle(key: CategoryKey) {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelected(next)
  }

  function save() {
    setInterests(Array.from(selected))
    navigate('/')
  }

  return (
    <Layout title="관심 분야 선택">
      <div className="px-4 pt-4">
        <p className="text-sm text-[var(--color-text-dim)] mb-4">
          관심 있는 분야를 골라주세요. FOR YOU 피드에 반영돼요. (메인 TREND NOW는 개인화되지 않아요)
        </p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {CATEGORIES.map((c) => {
            const active = selected.has(c.key)
            return (
              <button
                key={c.key}
                onClick={() => toggle(c.key)}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-2xl border py-4 text-xs font-medium',
                  active
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)]',
                )}
              >
                <Icon name={c.icon} size={22} />
                {c.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={save}
          disabled={selected.size === 0}
          className="w-full rounded-full bg-[var(--color-accent)] text-black font-semibold py-3 text-sm disabled:opacity-40"
        >
          {selected.size}개 선택 완료
        </button>
      </div>
    </Layout>
  )
}
