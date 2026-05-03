'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ClickableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  href: string
  children: React.ReactNode
}

export function ClickableRow({ href, className, children, onClick, ...props }: ClickableRowProps) {
  const router = useRouter()

  return (
    <tr
      className={cn('hover:bg-gray-50 cursor-pointer', className)}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) {
          router.push(href)
        }
      }}
      {...props}
    >
      {children}
    </tr>
  )
}
