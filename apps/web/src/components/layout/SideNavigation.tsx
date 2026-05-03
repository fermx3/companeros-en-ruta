'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { cn } from '@/lib/utils'
import type { NavItem, NavEntry, NavGroup } from '@/lib/navigation-config'
import { isNavGroup, flattenEntries } from '@/lib/navigation-config'

interface SideNavigationProps {
  entries: NavEntry[]
  title: string
  displayName?: string
  profileHref?: string
}

const STORAGE_KEY_PREFIX = 'sidebar-groups-'

export function SideNavigation({ entries, title, displayName, profileHref }: SideNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, userProfile, userRoles } = useAuth()

  const profile = userProfile as { first_name?: string; last_name?: string } | null
  const defaultName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  const fullName = displayName || defaultName || 'Usuario'
  const initials = fullName.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2) || '?'
  const roleLabel = userRoles[0] ?? ''

  const allItems = flattenEntries(entries)
  const storageKey = STORAGE_KEY_PREFIX + (userRoles[0] ?? 'unknown')

  // Find which group contains the active path
  const findActiveGroupId = useCallback((): string | null => {
    for (const entry of entries) {
      if (isNavGroup(entry) && entry.items.length > 1) {
        for (const item of entry.items) {
          if (isCurrentPathForItem(item.href, allItems)) return entry.id
        }
      }
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, entries])

  // Initialize open groups: all collapsable groups open by default, merged with localStorage
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {}
    for (const entry of entries) {
      if (isNavGroup(entry) && entry.items.length > 1) {
        defaults[entry.id] = true
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, boolean>
          return { ...defaults, ...parsed }
        }
      } catch { /* ignore */ }
    }

    return defaults
  })

  // Auto-expand group containing active route (only on pathname change)
  useEffect(() => {
    const activeGroupId = findActiveGroupId()
    if (activeGroupId) {
      setOpenGroups(prev => {
        if (prev[activeGroupId]) return prev
        return { ...prev, [activeGroupId]: true }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(openGroups))
    } catch { /* ignore */ }
  }, [openGroups, storageKey])

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  function isCurrentPathForItem(href: string, items: NavItem[]) {
    const isRootRoute = items.findIndex(item => item.href === href) === 0
    if (isRootRoute) return pathname === href
    return pathname.startsWith(href)
  }

  const isCurrentPath = (href: string) => isCurrentPathForItem(href, allItems)

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const renderNavItem = (item: NavItem, indented = false) => {
    const current = isCurrentPath(item.href)
    const Icon = item.icon
    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          indented && 'pl-9',
          current
            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        )}
      >
        <Icon className={cn('mr-3 h-5 w-5', current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500')} />
        {item.label}
      </Link>
    )
  }

  const renderGroup = (group: NavGroup) => {
    // Single-item group: render as root item with separator
    if (group.items.length === 1) {
      return (
        <div key={group.id} className="pt-3 mt-3 border-t border-gray-200">
          {renderNavItem(group.items[0])}
        </div>
      )
    }

    // Multi-item group: collapsible
    const isOpen = openGroups[group.id] ?? true
    const hasActiveChild = group.items.some(item => isCurrentPath(item.href))

    return (
      <div key={group.id} className="pt-3 mt-1">
        <button
          onClick={() => toggleGroup(group.id)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors',
            hasActiveChild ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <span>{group.label}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              !isOpen && '-rotate-90',
            )}
          />
        </button>
        <div
          className={cn(
            'mt-1 space-y-0.5 overflow-hidden transition-all duration-200',
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          {group.items.map(item => renderNavItem(item, true))}
        </div>
      </div>
    )
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 bg-white shadow-lg">
      {/* Logo/Header */}
      <div className="flex items-center h-16 px-6 bg-blue-600 text-white">
        <Link href={allItems[0]?.href ?? '/'} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
            <Image
              src="/perfect-logo-icon.png"
              alt="Compañeros en Ruta"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-xs text-blue-100">Compañeros en Ruta</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-0.5 overflow-y-auto">
        {entries.map(entry => {
          if (isNavGroup(entry)) {
            return renderGroup(entry)
          }
          return renderNavItem(entry)
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
            {roleLabel && (
              <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
            )}
          </div>
        </div>
        {profileHref && (
          <Link
            href={profileHref}
            className="mt-3 flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            <User className="w-3 h-3 mr-1" />
            Ver perfil
          </Link>
        )}
        <button
          onClick={handleLogout}
          className={`${profileHref ? 'mt-1' : 'mt-3'} flex items-center text-xs text-gray-500 hover:text-red-600 transition-colors`}
        >
          <LogOut className="w-3 h-3 mr-1" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
