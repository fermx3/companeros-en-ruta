'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/navigation-config'

export interface BottomNavigationProps {
  items: NavItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname()

  // Show up to 5 items on mobile
  const visibleItems = items.slice(0, 5)

  const isCurrentPath = (href: string) => {
    // Exact match for the first item (dashboard root)
    if (href === visibleItems[0]?.href) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border lg:hidden z-40">
      <div className={`grid grid-cols-${visibleItems.length}`} style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}>
        {visibleItems.map(item => {
          const Icon = item.icon
          const current = isCurrentPath(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-1 text-xs font-medium transition-colors",
                current
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1 truncate max-w-full">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
