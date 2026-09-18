import { useEffect, useRef, type ComponentProps, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import styled from '@emotion/styled'
import { useStagger } from '../lib/motion'
import { theme as t } from '../styles/theme'
import TopBar from './TopBar'
import BottomNav from './BottomNav'

const Shell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: ${t.shell};
  min-height: 100dvh;
  margin: 0 auto;
  background: ${t.color.bg};
`

const Main = styled.main`
  flex: 1;
`

export default function Layout({
  children,
  documentTitle,
  ...bar
}: ComponentProps<typeof TopBar> & {
  children: ReactNode
  /** 브라우저 탭·공유·스크린리더용 제목. 생략하면 상단 바의 title을 쓴다 */
  documentTitle?: string
}) {
  const main = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const navType = useNavigationType()

  // 새 화면으로 들어갈 때만 맨 위로. 뒤로가기는 브라우저의 스크롤 복원에 맡긴다.
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0)
  }, [pathname, navType])

  useStagger(main, [pathname])
  const pageTitle = documentTitle ?? bar.title

  return (
    <Shell>
      {/* React 19는 <title>을 <head>로 올려 준다 */}
      <title>{pageTitle ? `${pageTitle} · 지금 지구는` : "지금 지구는 — Know what's NOW"}</title>
      <TopBar {...bar} />
      <Main ref={main}>{children}</Main>
      <BottomNav />
    </Shell>
  )
}
