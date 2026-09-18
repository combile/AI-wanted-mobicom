import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import { theme as t } from '../styles/theme'
import { IconButton, IconLink } from '../styles/ui'
import Icon from './Icon'

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 60px;
  padding: 8px 12px 8px 20px;
  background: ${t.color.bg}f2;
  backdrop-filter: blur(12px);

  &[data-back='true'] {
    padding-left: 8px;
  }
`

const Wordmark = styled(Link)`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${t.color.accent};
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;

  [data-back='true'] > & {
    font-size: 17px;
    font-weight: 700;
  }
`

const Actions = styled.div`
  display: flex;
  margin-left: auto;
`

export default function TopBar({
  title,
  back = false,
  actions,
}: {
  title?: string
  /** 탭 화면이 아닌 하위 화면: 뒤로가기를 보여준다 */
  back?: boolean
  /** 오른쪽 아이콘들. 생략하면 검색, null이면 비움 */
  actions?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <Bar data-back={back}>
      {back && (
        <IconButton onClick={() => navigate(-1)} aria-label="뒤로">
          <Icon name="back" size={20} />
        </IconButton>
      )}
      {title ? <Title>{title}</Title> : !back && <Wordmark to="/">지금 지구는...</Wordmark>}
      <Actions>
        {actions !== undefined ? (
          actions
        ) : (
          <IconLink to="/search" aria-label="검색">
            <Icon name="search" size={24} />
          </IconLink>
        )}
      </Actions>
    </Bar>
  )
}
