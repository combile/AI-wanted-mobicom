import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { pop as popMotion } from '../lib/motion'
import type { TrendCard } from '../lib/types'
import { useSavedTrends } from '../store/useSavedTrends'
import { theme as t } from '../styles/theme'
import ChangeTag from './ChangeTag'
import Icon from './Icon'
import StatusLabel from './StatusLabel'
import TrendThumb from './TrendThumb'

// 썸네일 타일 + 제목 + 변화율. 너비는 부모(그리드 칸, 가로 스크롤 줄)가 정한다.
const Wrap = styled.article`
  position: relative;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
`

// 타일 전체가 링크처럼 눌리되, 저장 버튼은 따로 눌리도록 ::after로 영역을 늘린다.
const TitleLink = styled(Link)`
  display: block;
  width: 100%;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
  }
`

const Rank = styled.span`
  position: absolute;
  top: 8px;
  left: 11px;
  z-index: 1;
  font-size: 15px;
  font-weight: 800;
  color: ${t.color.accentInk};
`

const SaveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  color: ${t.color.accentInk};
  opacity: 0.45;

  &[aria-pressed='true'] {
    opacity: 1;
  }
`

export default function TrendTile({
  trend,
  rank,
  accent = false,
  save = false,
  status = false,
  pop = false,
  ...rest
}: {
  trend: TrendCard
  /** 타일 위에 순위 숫자를 올린다 */
  rank?: number
  accent?: boolean
  /** 타일 모서리에 저장 버튼을 올린다 */
  save?: boolean
  /** 제목 아래에 상태를 보여준다 */
  status?: boolean
  pop?: boolean
  'data-stagger'?: boolean
  'data-float'?: boolean
}) {
  const saved = useSavedTrends((s) => s.entries.some((e) => e.id === trend.id))
  const toggle = useSavedTrends((s) => s.toggle)

  return (
    <Wrap {...rest}>
      {rank !== undefined && <Rank>{rank}</Rank>}
      <TrendThumb trend={trend} size="fluid" accent={accent} pop={pop} />
      {save && (
        <SaveButton
          aria-pressed={saved}
          aria-label={saved ? `${trend.title} 저장 취소` : `${trend.title} 저장`}
          onClick={(e) => {
            toggle(trend.id, trend.score)
            popMotion(e.currentTarget.firstElementChild)
          }}
        >
          <Icon name={saved ? 'bookmark' : 'bookmarkOutline'} size={24} />
        </SaveButton>
      )}
      <TitleLink to={`/trend/${trend.id}`}>{trend.title}</TitleLink>
      {status && <StatusLabel status={trend.status} />}
      <ChangeTag pct={trend.changePct} />
    </Wrap>
  )
}
