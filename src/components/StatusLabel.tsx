import styled from '@emotion/styled'
import { STATUS_MAP } from '../lib/meta'
import type { TrendStatus } from '../lib/types'
import { theme as t } from '../styles/theme'
import Icon from './Icon'

const Label = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 400;
  color: ${t.color.dim};
  white-space: nowrap;
`

/** 상태 표시. 배경 없는 텍스트이고, 상태색은 작은 아이콘에만 쓴다. */
export default function StatusLabel({ status }: { status: TrendStatus }) {
  const meta = STATUS_MAP[status]
  return (
    <Label>
      <span style={{ color: meta.color, display: 'inline-flex' }}>
        <Icon name={meta.icon} size={14} />
      </span>
      {meta.label}
    </Label>
  )
}
