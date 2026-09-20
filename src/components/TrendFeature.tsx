import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { icon3dSrc, trendIcon3d, trendTint } from '../lib/icons3d'
import type { TrendCard } from '../lib/types'
import { theme as t } from '../styles/theme'
import ChangeTag from './ChangeTag'
import Icon3D from './Icon3D'

// 구간의 대표 트렌드 하나를 크게 보여주는 색면. 목록·타일 사이에서 시선이 쉬는 자리.
const Wrap = styled(Link)`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 168px;
  /* 화면 좌우 패딩(20px)을 상쇄해 폭은 꽉 채우되, 모서리는 다른 카드와 같은 톤으로 둥글게 */
  margin: 0 -20px;
  padding: 26px 8px 26px 20px;
  border-radius: ${t.radius.md};
  /* 단색 대신: 글자 쪽은 밝게, 아이콘 쪽으로 갈수록 톤이 깊어진다 */
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--tint) 55%, white) 0%,
    var(--tint) 55%,
    color-mix(in srgb, var(--tint) 82%, black) 100%
  );
  color: ${t.color.accentInk};

  /* 밝은 색면 위에서는 화살표도 잉크색 */
  && svg {
    color: inherit;
  }

  img {
    width: 38%;
    max-width: 136px;
    height: auto;
  }
`

// 그 카드의 3D 아이콘을 크게 흐려 깔아서, 아이콘 색이 배경에 번지게 한다.
// 카드마다 색이 저절로 달라지므로 색을 따로 지정할 필요가 없다.
const Glow = styled.div`
  position: absolute;
  z-index: -1;
  top: 50%;
  right: -6%;
  width: 64%;
  aspect-ratio: 1;
  transform: translateY(-50%) scale(1.35);
  background: center / contain no-repeat;
  filter: blur(32px) saturate(2.2);
  opacity: 0.7;
  pointer-events: none;
`

const Text = styled.div`
  flex: 1;
  min-width: 0;
`

const Label = styled.p`
  font-size: 14px;
  font-weight: 600;
  opacity: 0.6;
`

const Title = styled.p`
  margin: 2px 0 6px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
`

const Summary = styled.p`
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.45;
  opacity: 0.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export default function TrendFeature({
  trend,
  label,
  ...rest
}: {
  trend: TrendCard
  label: string
  'data-stagger'?: boolean
}) {
  const icon = trendIcon3d(trend)
  return (
    <Wrap to={`/trend/${trend.id}`} style={{ '--tint': trendTint(trend.id) } as CSSProperties} {...rest}>
      <Glow style={{ backgroundImage: `url(${icon3dSrc(icon)})` }} />
      <Text>
        <Label>{label}</Label>
        <Title>{trend.title}</Title>
        <Summary>{trend.summary}</Summary>
        <ChangeTag pct={trend.changePct} />
      </Text>
      <span data-pop style={{ display: 'contents' }}>
        <Icon3D name={icon} size={136} />
      </span>
    </Wrap>
  )
}
