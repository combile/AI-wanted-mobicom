import { icon3dSrc, type Icon3DName } from '../lib/icons3d'

export default function Icon3D({
  name,
  size = 24,
  alt = '',
  className,
  eager = false,
}: {
  name: Icon3DName
  size?: number
  alt?: string
  className?: string
  /** 첫 화면에 바로 보이는 이미지만 true. 나머지는 화면에 가까워질 때 받는다 */
  eager?: boolean
}) {
  return (
    <img
      src={icon3dSrc(name)}
      width={size}
      height={size}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={className}
      style={{ flexShrink: 0 }}
    />
  )
}
