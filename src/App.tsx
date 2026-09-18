import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import { gsap, motionOk, useGSAP } from './lib/motion'
import { useTrends } from './store/useTrends'
import { theme as t } from './styles/theme'

/** 첫 진입 때 스플래시를 최소 이만큼은 보여준다(슬라이드가 보이도록). 0이면 로딩이 끝나는 즉시 넘어간다. */
const MIN_SPLASH_MS: number = 1200

// "지금 지구는 ○○○"의 ○○○ 자리에 차례로 올라오는 말들
const SPLASH_WORDS = ['두바이 초콜릿', '막차감성', '말차', 'Y2K 리바이벌', '블록코어', '팝업스토어']

const SplashScreen = styled.div`
  display: grid;
  place-items: center;
  min-height: 100dvh;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.4;
`

const SplashLine = styled.p`
  display: flex;
  gap: 0.35em;
`

// 한 줄 높이만 보이는 창. 너비를 고정해 단어 길이가 달라도 문장이 좌우로 흔들리지 않는다.
const Slot = styled.span`
  width: 7.5em;
  height: 1.4em;
  overflow: hidden;
  color: ${t.color.accent};
`

const Reel = styled.span`
  display: flex;
  flex-direction: column;

  span {
    height: 1.4em;
    white-space: nowrap;
  }
`

function Splash() {
  const reel = useRef<HTMLSpanElement>(null)
  // 마지막에 첫 단어를 한 번 더 두어, 되감길 때 끊김 없이 이어지게 한다.
  const words = [...SPLASH_WORDS, SPLASH_WORDS[0]]

  useGSAP(() => {
    if (!motionOk()) return
    const timeline = gsap.timeline({ repeat: -1 })
    SPLASH_WORDS.forEach((_, i) => {
      timeline.to(
        reel.current,
        { yPercent: (-100 * (i + 1)) / words.length, duration: 0.45, ease: 'power3.inOut' },
        '+=0.4',
      )
    })
  })

  return (
    <SplashScreen role="status" aria-label="트렌드를 불러오는 중">
      <SplashLine aria-hidden>
        지금 지구는
        <Slot>
          <Reel ref={reel}>
            {words.map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </Reel>
        </Slot>
      </SplashLine>
    </SplashScreen>
  )
}

export default function App() {
  const status = useTrends((s) => s.status)
  const [minShown, setMinShown] = useState(() => MIN_SPLASH_MS === 0 || !motionOk())

  useEffect(() => {
    void useTrends.getState().load()
    const timer = setTimeout(() => setMinShown(true), MIN_SPLASH_MS)
    return () => clearTimeout(timer)
  }, [])

  // 트렌드가 오기 전에 화면을 그리면 /trend/:id 같은 딥링크가 "없는 트렌드"로 판단돼 튕겨 나간다.
  if (status === 'loading' || !minShown) return <Splash />

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
