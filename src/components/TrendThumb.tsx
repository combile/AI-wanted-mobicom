import styled from '@emotion/styled'
import Icon3D from './Icon3D'
import { trendIcon3d, trendTint } from '../lib/icons3d'
import type { TrendCard } from '../lib/types'
import { theme as t } from '../styles/theme'

const Box = styled.span`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 22%;

  img {
    width: 66%;
    height: auto;
  }
`

export default function TrendThumb({
  trend,
  size = 48,
  accent = false,
  pop = false,
}: {
  trend: Pick<TrendCard, 'id' | 'category'>
  /** fluid: 부모 너비에 맞춘 정사각형 */
  size?: number | 'fluid'
  /** 메인 컬러 바탕. 1위에만 쓴다. */
  accent?: boolean
  /** 화면 로드 시퀀스에서 3D 아이콘을 튀어오르게 한다 */
  pop?: boolean
}) {
  return (
    <Box
      style={{
        width: size === 'fluid' ? '100%' : size,
        background: accent ? t.color.accent : trendTint(trend.id),
      }}
    >
      <span data-pop={pop || undefined} style={{ display: 'grid', placeItems: 'center' }}>
        <Icon3D name={trendIcon3d(trend)} size={128} eager={pop} />
      </span>
    </Box>
  )
}
