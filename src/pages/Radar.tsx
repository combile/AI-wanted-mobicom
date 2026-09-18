import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import Layout from '../components/Layout'
import Icon from '../components/Icon'
import Icon3D from '../components/Icon3D'
import StatusLabel from '../components/StatusLabel'
import TrendThumb from '../components/TrendThumb'
import ChangeTag from '../components/ChangeTag'
import { trendIcon3d, trendTint } from '../lib/icons3d'
import { gsap, motionOk, useGSAP } from '../lib/motion'
import { hottest, layoutRadar } from '../lib/radar'
import { useTrends } from '../store/useTrends'
import { theme as t } from '../styles/theme'
import { Lead, Page } from '../styles/ui'

// 가장 뜨거운 자리는 오른쪽 위 모서리. 거기서 빛과 동심원이 퍼져 나온다.
const Chart = styled.div`
  position: relative;
  aspect-ratio: 1;
  margin: 0 -8px;
  border-radius: ${t.radius.lg};
  overflow: hidden;
  background:
    radial-gradient(90% 90% at 100% 0%, ${t.color.accent}24, transparent 70%),
    ${t.color.surface};
`

const Rings = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  circle,
  line {
    fill: none;
    stroke: ${t.color.text};
    stroke-opacity: 0.07;
    vector-effect: non-scaling-stroke;
  }

  line {
    stroke-dasharray: 3 5;
    stroke-opacity: 0.12;
  }
`

const Pulse = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  width: 200%;
  aspect-ratio: 1;
  translate: 50% -50%;
  border: 1px solid ${t.color.accent};
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
`

// 사분면 이름은 구석의 작은 글씨 대신 옅은 큰 글자로 깔아 둔다.
const Zone = styled.span`
  position: absolute;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${t.color.text};
  opacity: 0.16;
  pointer-events: none;

  &[data-hot='true'] {
    color: ${t.color.accent};
    opacity: 0.55;
  }
`

const Bubble = styled.button`
  position: absolute;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  transition: scale 0.2s;

  img {
    width: 66%;
    height: auto;
  }

  &[aria-pressed='true'] {
    z-index: 2;
    scale: 1.18;
    outline: 2px solid ${t.color.accent};
    outline-offset: 3px;
  }
`

const Axis = styled.p`
  display: flex;
  justify-content: space-between;
  margin: 10px 0 16px;
  font-size: 12px;
  color: ${t.color.dim};

  span {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
`

// 카드 허용 지점(고른 트렌드 패널). 링크여야 해서 Card와 같은 면을 직접 준다.
const Picked = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px 14px 14px;
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
  gap: 2px;
  font-size: 12px;
  color: ${t.color.dim};

  strong {
    font-size: 17px;
    letter-spacing: -0.02em;
    color: ${t.color.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export default function Radar() {
  const trends = useTrends((s) => s.trends)
  const chart = useRef<HTMLDivElement>(null)
  const nodes = useMemo(() => layoutRadar(trends), [trends])
  const [pickedId, setPickedId] = useState<string | null>(null)
  // 고르기 전에는 가장 뜨거운 트렌드를 보여준다 — 아래 패널이 비어 있지 않게.
  const picked = (nodes.find((n) => n.trend.id === pickedId) ?? hottest(nodes))?.trend

  useGSAP(
    () => {
      if (!motionOk()) return
      gsap.from('button', {
        scale: 0,
        duration: 0.55,
        ease: 'back.out(2)',
        stagger: { each: 0.02, from: 'random' },
        delay: 0.15,
        clearProps: 'transform',
      })
      // 뜨거운 모서리에서 번져 나오는 펄스 하나
      gsap.fromTo(
        '[data-pulse]',
        { scale: 0.05, opacity: 0.5 },
        { scale: 1, opacity: 0, duration: 3.2, ease: 'power1.out', repeat: -1, repeatDelay: 0.6 },
      )
    },
    { scope: chart, dependencies: [nodes], revertOnUpdate: true },
  )

  return (
    <Layout title="레이더">
      <Page>
        <Lead data-stagger>오른쪽 위에 있을수록 지금 뜨겁고 빠르게 크는 트렌드예요. 눌러서 확인하세요.</Lead>

        <Chart ref={chart} data-stagger>
          <Rings viewBox="0 0 100 100" aria-hidden>
            {[30, 60, 90, 120].map((r) => (
              <circle key={r} cx={100} cy={0} r={r} />
            ))}
            <line x1={50} y1={4} x2={50} y2={96} />
            <line x1={4} y1={50} x2={96} y2={50} />
          </Rings>
          <Pulse data-pulse />

          <Zone style={{ top: 14, right: 16 }} data-hot>
            지금 폭발 중
          </Zone>
          <Zone style={{ top: 14, left: 16 }}>대중화, 성장 정체</Zone>
          <Zone style={{ bottom: 14, right: 16 }}>빠른 초기 상승</Zone>
          <Zone style={{ bottom: 14, left: 16 }}>아직 작은 트렌드</Zone>

          {nodes.map(({ trend, x, y, r }) => (
            <Bubble
              key={trend.id}
              aria-pressed={picked?.id === trend.id}
              aria-label={`${trend.title}, 점수 ${trend.score}, 변화율 ${trend.changePct}%`}
              onClick={() => setPickedId(trend.id)}
              style={{
                left: `${x - r}%`,
                top: `${y - r}%`,
                width: `${r * 2}%`,
                background: trendTint(trend.id),
              }}
            >
              <Icon3D name={trendIcon3d(trend)} size={64} />
            </Bubble>
          ))}
        </Chart>

        <Axis>
          <span>
            <Icon name="arrowUpward" size={14} />
            위로 갈수록 관심도
          </span>
          <span>
            오른쪽으로 갈수록 성장 속도
            <Icon name="arrowRight" size={14} />
          </span>
        </Axis>

        {picked && (
          <Picked to={`/trend/${picked.id}`}>
            <TrendThumb trend={picked} size={60} />
            <PickedBody>
              <strong>{picked.title}</strong>
              <StatusLabel status={picked.status} />
              트렌드 스코어 {picked.score}
            </PickedBody>
            <ChangeTag pct={picked.changePct} />
            <Icon name="chevronRight" size={20} />
          </Picked>
        )}
      </Page>
    </Layout>
  )
}
