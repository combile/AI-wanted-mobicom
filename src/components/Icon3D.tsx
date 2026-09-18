import { icon3dSrc, type Icon3DName } from '../lib/icons3d'

export default function Icon3D({
  name,
  size = 24,
  alt = '',
  className,
}: {
  name: Icon3DName
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <img
      src={icon3dSrc(name)}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      className={className}
      style={{ flexShrink: 0 }}
    />
  )
}
