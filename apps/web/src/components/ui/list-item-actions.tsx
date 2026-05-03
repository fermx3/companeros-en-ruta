import { cn } from '@/lib/utils'

interface ListItemActionsProps {
  className?: string
  children: React.ReactNode
}

export function ListItemActions({ className, children }: ListItemActionsProps) {
  return (
    <div
      className={cn(className)}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation()
        }
      }}
    >
      {children}
    </div>
  )
}
