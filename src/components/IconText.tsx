import type { ReactNode } from 'react'
import Icon from './Icon'
import type { IconName } from '../lib/icons'

export default function IconText({
  icon,
  size = 14,
  className,
  children,
}: {
  icon: IconName
  size?: number
  className?: string
  children: ReactNode
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <Icon name={icon} size={size} />
      {children}
    </span>
  )
}
