import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import { CATEGORIES } from '../lib/meta'
import { useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Page } from '../styles/ui'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding-top: 8px;
`

// 카드 허용 지점: 화면 전체가 "어디로 들어갈지 고르는" 진입 타일이라 눌리는 면이 있는 편이 낫다.
const Cell = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 18px;
  border-radius: ${t.radius.md};
  background: ${t.color.surface};
  font-size: 14px;
  line-height: 1.45;
  color: ${t.color.dim};

  strong {
    margin-top: 12px;
    font-size: 18px;
    letter-spacing: -0.02em;
    color: ${t.color.text};
  }
`

const IconFace = styled.span`
  display: grid;
  color: ${t.color.text};
`

const Count = styled.span`
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
  color: ${t.color.text};
`

export default function CategoryGrid() {
  const trends = useTrends((s) => s.trends)
  return (
    <Layout title="카테고리">
      <Page>
        <Grid>
          {CATEGORIES.map((c) => (
            <Cell key={c.key} to={`/category/${c.key}`} data-stagger>
              <IconFace>
                <Icon name={c.icon} size={30} />
              </IconFace>
              <strong>{c.label}</strong>
              {c.examples}
              <Count>트렌드 {trends.filter((tr) => tr.category === c.key).length}개</Count>
            </Cell>
          ))}
        </Grid>
      </Page>
    </Layout>
  )
}
