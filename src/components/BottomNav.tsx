import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import Icon from './Icon'
import type { IconName } from '../lib/icons'

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: '홈', icon: 'home' },
  { to: '/explore', label: '탐색', icon: 'compass' },
  { to: '/radar', label: '레이더', icon: 'radar' },
  { to: '/my', label: '마이 트렌드', icon: 'star' },
  { to: '/category', label: '카테고리', icon: 'grid' },
]

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur border-t border-[var(--color-border)] flex">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px]',
              isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]',
            )
          }
        >
          <Icon name={tab.icon} size={20} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
