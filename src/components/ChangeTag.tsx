import styled from '@emotion/styled'
import { formatChange } from '../lib/format'
import { theme as t } from '../styles/theme'
import Icon from './Icon'

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  /* 숫자는 본문색, 방향 화살표에만 색을 쓴다 */
  svg {
    color: ${t.color.accent};
  }

  &[data-down='true'] svg {
    color: ${t.color.down};
  }
`

export default function ChangeTag({ pct }: { pct: number }) {
  const down = pct < 0
  return (
    <Tag data-down={down}>
      <Icon name={down ? 'arrowDown' : 'arrowUp'} size={15} />
      {formatChange(pct)}
    </Tag>
  )
}
