import type { ComponentType } from 'react'
import Link from 'next/link'

export interface QuickAction {
  href: string
  icon: ComponentType<{ className?: string }>
  label: string
}

export interface QuickActionsProps {
  title?: string
  actions: QuickAction[]
  columns?: 2 | 3
}

export function QuickActions({ title = 'Acciones Rápidas', actions, columns = 2 }: QuickActionsProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
        {title}
      </h2>
      <div className={`grid gap-3 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {actions.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 h-24 bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon className="h-8 w-8 text-primary" />
            <span className="text-xs font-medium text-navy">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
