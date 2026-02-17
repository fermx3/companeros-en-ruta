'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/navigation-config'

export interface BottomNavigationProps {
  items: NavItem[]
}

const MAX_VISIBLE = 5

export function BottomNavigation({ items }: BottomNavigationProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const hasOverflow = items.length > MAX_VISIBLE
  const visibleItems = hasOverflow ? items.slice(0, MAX_VISIBLE - 1) : items.slice(0, MAX_VISIBLE)
  const overflowItems = hasOverflow ? items.slice(MAX_VISIBLE - 1) : []

  const isCurrentPath = (href: string) => {
    if (href === items[0]?.href) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isOverflowActive = overflowItems.some(item => isCurrentPath(item.href))

  // Close menu on outside click
  useEffect(() => {
    if (!moreOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [moreOpen])

  // Close menu on navigation
  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  const colCount = hasOverflow ? MAX_VISIBLE : visibleItems.length

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border lg:hidden z-40">
      {/* Overflow menu */}
      {moreOpen && overflowItems.length > 0 && (
        <div ref={menuRef} className="absolute bottom-full left-0 right-0 bg-white border-t border-border shadow-lg">
          <div className="py-2">
            {overflowItems.map(item => {
              const Icon = item.icon
              const current = isCurrentPath(item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                    current
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }} className="grid">
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

        {hasOverflow && (
          <button
            onClick={() => setMoreOpen(prev => !prev)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-1 text-xs font-medium transition-colors",
              moreOpen || isOverflowActive
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="mt-1">Más</span>
          </button>
        )}
      </div>
    </nav>
  )
}
