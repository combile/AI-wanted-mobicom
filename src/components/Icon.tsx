import { ICONS, type IconName } from '../lib/icons'

export default function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
  const Component = ICONS[name]
  return <Component className={className} style={{ fontSize: size }} aria-hidden />
}
