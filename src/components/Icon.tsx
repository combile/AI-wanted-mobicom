import { ICONS, type IconName } from '../lib/icons'

export default function Icon({
  name,
  size = 16,
  strokeWidth = 1.75,
  className,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const Component = ICONS[name]
  return <Component size={size} strokeWidth={strokeWidth} className={className} />
}
