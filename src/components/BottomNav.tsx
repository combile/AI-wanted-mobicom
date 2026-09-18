import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import styled from '@emotion/styled'
import { pop, useGSAP } from '../lib/motion'
import { theme as t } from '../styles/theme'
import Icon from './Icon'
import type { IconName } from '../lib/icons'

const TABS: { to: string; label: string; icon: IconName; activeIcon: IconName }[] = [
  { to: '/', label: '홈', icon: 'homeOutline', activeIcon: 'home' },
  { to: '/explore', label: '탐색', icon: 'compassOutline', activeIcon: 'compass' },
  { to: '/radar', label: '레이더', icon: 'radar', activeIcon: 'radar' },
  { to: '/my', label: '마이 트렌드', icon: 'bookmarkOutline', activeIcon: 'bookmark' },
  { to: '/category', label: '카테고리', icon: 'gridOutline', activeIcon: 'grid' },
]

const Nav = styled.nav`
  position: sticky;
  bottom: 0;
  z-index: 10;
  display: flex;
  background: ${t.color.bg}f2;
  backdrop-filter: blur(12px);
  border-top: 1px solid ${t.color.border};
  padding-bottom: env(safe-area-inset-bottom);
`

const Tab = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 0 8px;
  font-size: 11px;
  color: ${t.color.dim};

  &.active {
    color: ${t.color.accent};
    font-weight: 600;
  }
`

export default function BottomNav() {
  const nav = useRef<HTMLElement>(null)

  // 탭을 누르면 화면이 바뀌며 이 컴포넌트가 다시 마운트된다 → 선택된 아이콘이 탭에 답한다.
  useGSAP(() => pop(nav.current?.querySelector('.active svg') ?? null))

  return (
    <Nav ref={nav}>
      {TABS.map((tab) => (
        <Tab key={tab.to} to={tab.to} end={tab.to === '/'}>
          {({ isActive }) => (
            <>
              <Icon name={isActive ? tab.activeIcon : tab.icon} size={24} />
              {tab.label}
            </>
          )}
        </Tab>
      ))}
    </Nav>
  )
}
