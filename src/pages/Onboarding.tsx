import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { CATEGORIES } from '../lib/meta'
import { pop } from '../lib/motion'
import type { CategoryKey } from '../lib/types'
import { useInterests } from '../store/useInterests'
import { theme as t } from '../styles/theme'
import { Lead, Page, PrimaryButton } from '../styles/ui'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 28px;
`

// 고르는 컨트롤이라 눌리는 면은 남기되, 선택 표시는 아이콘 색과 가는 테두리로만 한다.
const Choice = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 0 16px;
  border-radius: ${t.radius.md};
  background: ${t.color.surface};
  box-shadow: inset 0 0 0 1px transparent;
  font-size: 14px;
  font-weight: 600;
  color: ${t.color.dim};
  transition:
    box-shadow 0.15s,
    color 0.15s;

  &[aria-pressed='true'] {
    box-shadow: inset 0 0 0 1px ${t.color.accent};
    color: ${t.color.text};
  }

  &[aria-pressed='true'] svg {
    color: ${t.color.accent};
  }
`

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
    <Layout title="관심 분야 선택" back actions={null}>
      <Page>
        <Lead data-stagger>
          관심 있는 분야를 고르면 홈의 FOR YOU에 반영돼요. 메인 랭킹은 모두에게 똑같이 보여요.
        </Lead>
        <Grid>
          {CATEGORIES.map((c) => (
            <Choice
              key={c.key}
              aria-pressed={selected.has(c.key)}
              data-stagger
              onClick={(e) => {
                toggle(c.key)
                pop(e.currentTarget.firstElementChild)
              }}
            >
              <Icon name={c.icon} size={28} />
              {c.label}
            </Choice>
          ))}
        </Grid>
        <PrimaryButton onClick={save} disabled={selected.size === 0} style={{ width: '100%' }}>
          {selected.size === 0 ? '분야를 하나 이상 골라주세요' : `${selected.size}개 분야로 시작하기`}
        </PrimaryButton>
      </Page>
    </Layout>
  )
}
