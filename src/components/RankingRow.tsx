import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import type { TrendCard } from '../lib/types'
import { theme as t } from '../styles/theme'
import Icon from './Icon'

// 썸네일 없는 한 줄짜리 순위 항목. 2열 차트로 배치해 쓴다.
const Row = styled(Link)`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid ${t.color.border};
  background: ${t.color.bg};
  font-size: 16px;
  font-weight: 600;

  svg {
    flex-shrink: 0;
    color: ${t.color.accent};
  }

  &[data-down='true'] svg {
    color: ${t.color.down};
  }
`

const Rank = styled.span`
  width: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${t.color.dim};
`

const Title = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default function RankingRow({ trend, rank }: { trend: TrendCard; rank: number }) {
  const down = trend.changePct < 0
  return (
    <Row
      to={`/trend/${trend.id}`}
      data-flip-id={trend.id}
      data-stagger
      data-down={down}
      aria-label={`${rank}위 ${trend.title}, ${trend.changePct}%`}
    >
      <Rank>{rank}</Rank>
      <Title>{trend.title}</Title>
      <Icon name={down ? 'arrowDown' : 'arrowUp'} size={16} />
    </Row>
  )
}
