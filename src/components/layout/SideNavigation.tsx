'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/lib/navigation-config'

interface SideNavigationProps {
  items: NavItem[]
  title: string
}

export function SideNavigation({ items, title }: SideNavigationProps) {
  const pathname = usePathname()

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
    </aside>
  )
}
