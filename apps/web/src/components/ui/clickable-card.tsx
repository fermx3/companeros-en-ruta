import Link from 'next/link'
import { cn } from '@companeros/shared/utils/cn'
import { Card } from '@/components/ui/Card'

interface ClickableCardProps {
  href: string
  className?: string
  children: React.ReactNode
}

export function ClickableCard({ href, className, children }: ClickableCardProps) {
  return (
    <Link href={href} className="block">
      <Card className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}>
        {children}
      </Card>
    </Link>
  )
}
