'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavEntry } from '@/lib/navigation-config'
import { flattenEntries, isNavGroup } from '@/lib/navigation-config'

export interface BottomNavigationProps {
  entries: NavEntry[]
}

const MAX_VISIBLE = 5

export function BottomNavigation({ entries }: BottomNavigationProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => flattenEntries(entries), [entries])

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

  // Build overflow items with group headers as separators
  const overflowWithHeaders = useMemo(() => {
    if (!hasOverflow) return []

    const overflowSet = new Set(overflowItems.map(i => i.id))
    const result: Array<{ type: 'header'; label: string } | { type: 'item'; item: typeof items[0] }> = []

    for (const entry of entries) {
      if (isNavGroup(entry)) {
        const groupOverflowItems = entry.items.filter(i => overflowSet.has(i.id))
        if (groupOverflowItems.length > 0) {
          result.push({ type: 'header', label: entry.label })
          for (const item of groupOverflowItems) {
            result.push({ type: 'item', item })
          }
        }
      } else if (overflowSet.has(entry.id)) {
        result.push({ type: 'item', item: entry })
      }
    }

    return result
  }, [entries, hasOverflow, overflowItems, items])

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
      {moreOpen && overflowWithHeaders.length > 0 && (
        <div ref={menuRef} className="absolute bottom-full left-0 right-0 bg-white border-t border-border shadow-lg max-h-80 overflow-y-auto">
          <div className="py-2">
            {overflowWithHeaders.map((entry, idx) => {
              if (entry.type === 'header') {
                return (
                  <div
                    key={`header-${idx}`}
                    className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 first:pt-1"
                  >
                    {entry.label}
                  </div>
                )
              }
              const item = entry.item
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
