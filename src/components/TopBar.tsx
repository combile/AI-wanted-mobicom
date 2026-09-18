import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import logo from '../assets/logo.png'

export default function TopBar({ title }: { title?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
      {title ? (
        <button onClick={() => navigate(-1)} className="text-[var(--color-text-dim)] p-1" aria-label="back">
          <Icon name="arrowLeft" size={20} />
        </button>
      ) : (
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="지금 지구는" className="w-7 h-7 rounded-[8px]" />
          <span className="text-lg font-extrabold tracking-tight">지금 지구는</span>
        </Link>
      )}
      {title && <h1 className="text-sm font-bold">{title}</h1>}
      <Link
        to="/search"
        className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center"
        aria-label="검색"
      >
        <Icon name="search" size={16} />
      </Link>
    </header>
  )
}
