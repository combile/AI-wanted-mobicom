import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import Home from './pages/Home'
import Explore from './pages/Explore'
import CategoryGrid from './pages/CategoryGrid'
import CategoryDetail from './pages/CategoryDetail'
import TrendDetail from './pages/TrendDetail'
import MyTrends from './pages/MyTrends'
import Search from './pages/Search'
import Radar from './pages/Radar'
import Onboarding from './pages/Onboarding'
import { useTrends } from './store/useTrends'
import { theme as t } from './styles/theme'

const pulse = keyframes`
  50% { opacity: 0.35; }
`

const Splash = styled.div`
  display: grid;
  place-items: center;
  min-height: 100dvh;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${t.color.accent};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 1.2s ease-in-out infinite;
  }
`

export default function App() {
  const status = useTrends((s) => s.status)

  useEffect(() => {
    void useTrends.getState().load()
  }, [])

  // 트렌드가 오기 전에 화면을 그리면 /trend/:id 같은 딥링크가 "없는 트렌드"로 판단돼 튕겨 나간다.
  if (status === 'loading') {
    return (
      <Splash role="status" aria-live="polite">
        지금 지구는...
      </Splash>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/category" element={<CategoryGrid />} />
        <Route path="/category/:key" element={<CategoryDetail />} />
        <Route path="/trend/:id" element={<TrendDetail />} />
        <Route path="/my" element={<MyTrends />} />
        <Route path="/search" element={<Search />} />
        <Route path="/radar" element={<Radar />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  )
}
