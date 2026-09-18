import { useMemo, useState } from 'react'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import TrendTile from '../components/TrendTile'
import Icon from '../components/Icon'
import { PRESET_QUESTIONS } from '../lib/meta'
import { searchTrends } from '../lib/selectors'
import { useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Card, Empty, Page, Rows, Section, SectionTitle, TileGrid } from '../styles/ui'

const Field = styled.form`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 18px;
  border-radius: ${t.radius.pill};
  background: ${t.color.surface};
  color: ${t.color.dim};

  &:focus-within {
    box-shadow: inset 0 0 0 1px ${t.color.dim};
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 14px 0;
    border: 0;
    outline: 0;
    background: none;
    font-size: 15px;
    color: ${t.color.text};
  }
`

const Preset = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 0;
  font-size: 15px;
  text-align: left;

  svg {
    color: ${t.color.dim};
  }
`

const Summary = styled(Card)`
  margin: 20px 0 8px;
  font-size: 15px;
  line-height: 1.65;

  span {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    color: ${t.color.dim};
  }
`

export default function Search() {
  const trends = useTrends((s) => s.trends)
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const results = useMemo(() => searchTrends(trends, submitted), [trends, submitted])

  function runSearch(q: string) {
    setQuery(q)
    setSubmitted(q.trim())
  }

  return (
    <Layout title="검색" back actions={null}>
      <Page>
        <Field
          role="search"
          data-stagger
          onSubmit={(e) => {
            e.preventDefault()
            runSearch(query)
          }}
        >
          <Icon name="search" size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="궁금한 트렌드를 검색해보세요"
            aria-label="트렌드 검색"
            autoFocus
          />
        </Field>

        {!submitted && (
          <Section>
            <SectionTitle data-stagger>이렇게 물어보세요</SectionTitle>
            <Rows>
              {PRESET_QUESTIONS.map((q) => (
                <Preset key={q} onClick={() => runSearch(q)} data-stagger>
                  {q}
                  <Icon name="chevronRight" size={20} />
                </Preset>
              ))}
            </Rows>
          </Section>
        )}

        {submitted && results.length === 0 && (
          <Empty>
            <Icon name="search" size={56} />
            <p>
              “{submitted}”에 맞는 트렌드를 찾지 못했어요.
              <br />더 짧은 단어나 카테고리 이름으로 검색해 보세요.
            </p>
          </Empty>
        )}

        {submitted && results.length > 0 && (
          <>
            <Summary as="p">
              <span>AI 요약</span>
              “{submitted}” 관련 트렌드 {results.length}개를 찾았어요. 지금 가장 강한 트렌드는 ‘{results[0].title}
              ’(TREND SCORE {results[0].score})이에요.
            </Summary>
            <TileGrid style={{ marginTop: 16 }}>
              {results.map((trend) => (
                <TrendTile key={trend.id} trend={trend} save status />
              ))}
            </TileGrid>
          </>
        )}
      </Page>
    </Layout>
  )
}
