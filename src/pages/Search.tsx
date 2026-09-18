import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import TrendGridCard from '../components/TrendGridCard'
import { searchTrends } from '../lib/selectors'

const PRESET_QUESTIONS = [
  '요즘 대학생 사이에서 뜨는 것',
  '요즘 여자 패션',
  '다음 달에 뜰 것 같은 음식',
  '최근 한 달 사이 갑자기 뜬 밈',
  '요즘 숏폼에서 많이 쓰는 음악',
  '20대가 많이 사는 아이템',
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const results = useMemo(() => searchTrends(submitted), [submitted])

  const summary = useMemo(() => {
    if (!submitted) return null
    if (results.length === 0) return `“${submitted}”와 관련된 트렌드를 아직 찾지 못했어요.`
    const top = results[0]
    return `“${submitted}” 관련 트렌드 ${results.length}개를 찾았어요. 지금 가장 강한 트렌드는 ‘${top.title}’(TREND SCORE ${top.score})이에요.`
  }, [submitted, results])

  function runSearch(q: string) {
    setQuery(q)
    setSubmitted(q)
  }

  return (
    <Layout title="검색">
      <div className="px-4 pt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(query)
          }}
          className="mb-4"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="궁금한 트렌드를 질문해보세요"
            className="w-full rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </form>

        {!submitted && (
          <div>
            <p className="text-xs text-[var(--color-text-dim)] mb-2">이렇게 질문해보세요</p>
            <div className="flex flex-col gap-2">
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => runSearch(q)}
                  className="text-left text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {submitted && (
          <div className="pb-4">
            {summary && (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-4">
                <p className="text-[10px] text-[var(--color-accent)] font-semibold mb-1">AI 요약</p>
                <p className="text-sm leading-relaxed">{summary}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {results.map((t) => (
                <TrendGridCard key={t.id} trend={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
