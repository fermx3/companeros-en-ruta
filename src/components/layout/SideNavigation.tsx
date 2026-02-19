'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import type { NavItem } from '@/lib/navigation-config'

interface SideNavigationProps {
  items: NavItem[]
  title: string
  displayName?: string
  profileHref?: string
}

export function SideNavigation({ items, title, displayName, profileHref }: SideNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, userProfile, userRoles } = useAuth()

  const profile = userProfile as { first_name?: string; last_name?: string } | null
  const defaultName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  const fullName = displayName || defaultName || 'Usuario'
  const initials = fullName.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2) || '?'
  const roleLabel = userRoles[0] ?? ''

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const isCurrentPath = (href: string) => {
    // Exact match for the root dashboard route (e.g. /brand, /promotor)
    const isRootRoute = items.findIndex(item => item.href === href) === 0
    if (isRootRoute) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 bg-white shadow-lg">
      {/* Logo/Header */}
      <div className="flex items-center h-16 px-6 bg-blue-600 text-white">
        <Link href={items[0]?.href ?? '/'} className="flex items-center space-x-2">
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
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const current = isCurrentPath(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${current
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`mr-3 h-5 w-5 ${current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {item.label}
            </Link>
          )
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
