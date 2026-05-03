/**
 * Avatar Component
 *
 * A reusable avatar component for displaying user or brand images.
 * Supports circular images with fallback to icon or initials.
 *
 * @example
 * ```tsx
 * <Avatar src={user.avatarUrl} alt={user.name} size="md" />
 * <Avatar alt="Brand" fallback={<Building2 />} size="lg" />
 * ```
 */

import * as React from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  /** Image source URL */
  src?: string | null
  /** Alt text for image */
  alt: string
  /** Fallback content when no image (icon, initials, etc.) */
  fallback?: React.ReactNode
  /** Avatar size */
  size?: AvatarSize
  /** Additional CSS classes */
  className?: string
}

const sizeVariants: Record<AvatarSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

const iconSizeVariants: Record<AvatarSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false)

  const shouldShowImage = src && !imageError

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0',
        sizeVariants[size],
        className
      )}
    >
      {shouldShowImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex items-center justify-center text-muted-foreground">
          {fallback || <Building2 className={iconSizeVariants[size]} />}
        </div>
      )}
    </div>
  )
}
