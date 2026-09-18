import type { ReactNode } from 'react'
import TopBar from './TopBar'
import BottomNav from './BottomNav'

export default function Layout({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="app-shell">
      <TopBar title={title} />
      <main className="flex-1 pb-4">{children}</main>
      <BottomNav />
    </div>
  )
}
