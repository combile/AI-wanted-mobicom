import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import StatusLabel from '../components/StatusLabel'
import TrendThumb from '../components/TrendThumb'
import ChangeTag from '../components/ChangeTag'
import { STATUS_MAP } from '../lib/meta'
import { gsap, motionOk, useGSAP } from '../lib/motion'
import type { TrendCard } from '../lib/types'
import { useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Lead, Page } from '../styles/ui'

const SIZE = 320
const PAD = 28

const Chart = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${t.radius.md};
  background: ${t.color.surface};

  svg {
    width: 100%;
    height: 100%;
  }

  circle {
    cursor: pointer;
    outline: none;
  }
`

const Corner = styled.span`
  position: absolute;
  font-size: 11px;
  color: ${t.color.dim};
  pointer-events: none;
`

const Picked = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding: 14px 14px 14px 16px;
  border-radius: ${t.radius.md};
  background: ${t.color.surface};

  > svg {
    color: ${t.color.dim};
  }
`

const PickedBody = styled.span`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 16px;
  font-weight: 700;
`

export default function Radar() {
  const navigate = useNavigate()
  const trends = useTrends((s) => s.trends)
  const [picked, setPicked] = useState<TrendCard | null>(null)
  const chart = useRef<HTMLDivElement>(null)

  const points = useMemo(() => {
    // 제곱근 축: +380% 같은 이상치 하나가 나머지 점을 가운데로 뭉개지 않게 한다.
    const scale = (pct: number) => Math.sign(pct) * Math.sqrt(Math.abs(pct))
    const maxChange = Math.max(...trends.map((tr) => Math.abs(scale(tr.changePct))), 1)
    return trends.map((trend) => ({
      trend,
      x: PAD + ((scale(trend.changePct) + maxChange) / (2 * maxChange)) * (SIZE - PAD * 2),
      y: PAD + (1 - trend.score / 100) * (SIZE - PAD * 2),
    }))
  }, [trends])

  useGSAP(
    () => {
      if (!motionOk()) return
      gsap.from('circle', {
        scale: 0,
        transformOrigin: '50% 50%',
        duration: 0.5,
        ease: 'back.out(2.5)',
        stagger: 0.025,
        delay: 0.2,
      })
    },
    { scope: chart, dependencies: [points], revertOnUpdate: true },
  )

  return (
    <Layout title="레이더">
      <Page>
        <Lead data-stagger>위로 갈수록 관심도가 높고, 오른쪽으로 갈수록 빠르게 크는 트렌드예요. 점을 눌러 확인하세요.</Lead>

        <Chart ref={chart} data-stagger>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label="관심도와 성장 속도로 본 트렌드 분포">
            <line x1={SIZE / 2} y1={PAD} x2={SIZE / 2} y2={SIZE - PAD} stroke={t.color.border} strokeDasharray="4 4" />
            <line x1={PAD} y1={SIZE / 2} x2={SIZE - PAD} y2={SIZE / 2} stroke={t.color.border} strokeDasharray="4 4" />
            {/* 고른 점은 마지막에 그려 다른 점 위로 올린다 */}
            {[...points]
              .sort((a, b) => Number(a.trend.id === picked?.id) - Number(b.trend.id === picked?.id))
              .map(({ trend, x, y }) => {
                const active = picked?.id === trend.id
                return (
                  <circle
                    key={trend.id}
                    cx={x}
                    cy={y}
                    r={active ? 9 : 6}
                    fill={STATUS_MAP[trend.status].color}
                    fillOpacity={active ? 1 : 0.8}
                    stroke={active ? t.color.text : t.color.surface}
                    strokeWidth={active ? 2 : 1}
                    tabIndex={0}
                    role="button"
                    aria-label={`${trend.title}, 점수 ${trend.score}, 변화율 ${trend.changePct}%`}
                    onClick={() => setPicked(trend)}
                    onFocus={() => setPicked(trend)}
                    onMouseEnter={() => setPicked(trend)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/trend/${trend.id}`)}
                  />
                )
              })}
          </svg>

          <Corner style={{ top: 10, left: 12 }}>대중화, 성장 정체</Corner>
          <Corner style={{ top: 10, right: 12 }}>지금 폭발 중</Corner>
          <Corner style={{ bottom: 10, left: 12 }}>아직 작은 트렌드</Corner>
          <Corner style={{ bottom: 10, right: 12 }}>빠른 초기 상승</Corner>
        </Chart>

        {picked && (
          <Picked to={`/trend/${picked.id}`}>
            <TrendThumb trend={picked} size={56} />
            <PickedBody>
              {picked.title}
              <StatusLabel status={picked.status} />
            </PickedBody>
            <ChangeTag pct={picked.changePct} />
            <Icon name="chevronRight" size={20} />
          </Picked>
        )}
      </Page>
    </Layout>
  )
}
