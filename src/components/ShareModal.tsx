import { useState } from 'react'
import type { TrendCard } from '../lib/types'
import { STATUS_MAP } from '../lib/meta'
import Icon from './Icon'

export default function ShareModal({ trend, onClose }: { trend: TrendCard; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const status = STATUS_MAP[trend.status]

  async function copyLink() {
    const text = `내가 남들보다 먼저 발견한 트렌드\n${trend.title}\nTREND SCORE ${trend.score} (${status.label})\n지금 지구는 — Know what's NOW`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[340px] rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl p-5 mb-4" style={{ background: 'linear-gradient(160deg,#101012,#000)' }}>
          <p className="text-[10px] text-[var(--color-text-dim)] mb-3">내가 남들보다 먼저 발견한 트렌드</p>
          <p className="text-lg font-extrabold mb-4">{trend.title}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[var(--color-text-dim)]">TREND SCORE</p>
              <p className="inline-flex items-center gap-1.5 text-2xl font-extrabold" style={{ color: status.color }}>
                {trend.score}
                <Icon name={status.icon} size={20} strokeWidth={2} />
              </p>
            </div>
            <p className="text-[10px] text-[var(--color-text-dim)] text-right">
              지금 지구는<br />Know what's NOW
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--color-accent)] text-black text-sm font-semibold py-2.5"
          >
            {copied && <Icon name="check" size={16} strokeWidth={2.25} />}
            {copied ? '복사됨' : '텍스트 복사'}
          </button>
          <button onClick={onClose} className="flex-1 rounded-full border border-[var(--color-border)] text-sm py-2.5">
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
