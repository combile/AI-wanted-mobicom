import { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { gsap, motionOk, useGSAP } from '../lib/motion'
import { STATUS_MAP } from '../lib/meta'
import type { TrendCard } from '../lib/types'
import { theme as t } from '../styles/theme'
import { GhostButton, PrimaryButton } from '../styles/ui'
import Icon from './Icon'
import StatusLabel from './StatusLabel'
import TrendThumb from './TrendThumb'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: end center;
  background: rgba(0, 0, 0, 0.72);
`

const Sheet = styled.div`
  width: 100%;
  max-width: ${t.shell};
  padding: 24px 20px calc(20px + env(safe-area-inset-bottom));
  border-radius: ${t.radius.lg} ${t.radius.lg} 0 0;
  background: ${t.color.surface};
`

// 공유용 이미지가 될 영역이라 이것만은 하나의 판으로 둔다.
const ShareCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  margin-bottom: 20px;
  border-radius: ${t.radius.md};
  background: ${t.color.bg};
`

const Caption = styled.p`
  font-size: 14px;
  color: ${t.color.dim};
`

const Title = styled.p`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
`

const Foot = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  font-size: 12px;
  color: ${t.color.dim};
`

const Score = styled.p`
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: ${t.color.accent};
`

const Actions = styled.div`
  display: flex;
  gap: 8px;

  > * {
    flex: 1;
  }
`

export default function ShareModal({ trend, onClose }: { trend: TrendCard; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // 열리면 포커스를 시트 안으로 옮기고, Tab은 시트 안에서만 돌게 하고, 닫히면 열었던 버튼으로 돌려준다.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const buttons = () => root.current?.querySelectorAll<HTMLElement>('button') ?? []
    buttons()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab') return
      const items = buttons()
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [onClose])

  useGSAP(
    () => {
      if (!motionOk()) return
      // autoAlpha는 visibility:hidden에서 시작해 그 순간 포커스를 못 받는다 → opacity만 쓴다.
      gsap.from(root.current, { opacity: 0, duration: 0.2 })
      gsap.from('[data-sheet]', { yPercent: 100, duration: 0.45, ease: 'power3.out' })
    },
    { scope: root },
  )

  async function copyText() {
    const text = `내가 남들보다 먼저 발견한 트렌드\n${trend.title}\nTREND SCORE ${trend.score} (${STATUS_MAP[trend.status].label})\n지금 지구는 — Know what's NOW`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Backdrop ref={root} onClick={onClose}>
      <Sheet
        data-sheet
        role="dialog"
        aria-modal="true"
        aria-label={`${trend.title} 공유`}
        onClick={(e) => e.stopPropagation()}
      >
        <ShareCard>
          <Caption>내가 남들보다 먼저 발견한 트렌드</Caption>
          <TrendThumb trend={trend} size={72} />
          <div>
            <Title>{trend.title}</Title>
            <StatusLabel status={trend.status} />
          </div>
          <Foot>
            <div>
              <p>TREND SCORE</p>
              <Score>{trend.score}</Score>
            </div>
            <p style={{ textAlign: 'right' }}>
              지금 지구는
              <br />
              Know what's NOW
            </p>
          </Foot>
        </ShareCard>
        <Actions>
          <PrimaryButton onClick={copyText}>
            {copied && <Icon name="check" size={18} />}
            {copied ? '복사됨' : '텍스트 복사'}
          </PrimaryButton>
          <GhostButton onClick={onClose}>닫기</GhostButton>
        </Actions>
      </Sheet>
    </Backdrop>
  )
}
