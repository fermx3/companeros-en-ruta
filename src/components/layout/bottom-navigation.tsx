'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, MapPin, Users, Star, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/ui'

interface NavItem {
    id: string
    label: string
    icon: React.ReactNode
    href: string
    roles: UserRole[]
}

const navItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Inicio',
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: '/dashboard',
        roles: ['admin', 'brand', 'supervisor', 'promotor', 'asesor_de_ventas', 'client']
    },
    {
        id: 'visits',
        label: 'Visitas',
        icon: <MapPin className="h-5 w-5" />,
        href: '/visits',
        roles: ['promotor', 'asesor_de_ventas', 'supervisor']
    },
    {
        id: 'clients',
        label: 'Clientes',
        icon: <Users className="h-5 w-5" />,
        href: '/clients',
        roles: ['brand', 'supervisor', 'promotor']
    },
    {
        id: 'loyalty',
        label: 'Lealtad',
        icon: <Star className="h-5 w-5" />,
        href: '/loyalty',
        roles: ['client']
    },
    {
        id: 'reports',
        label: 'Reportes',
        icon: <BarChart3 className="h-5 w-5" />,
        href: '/reports',
        roles: ['admin', 'brand', 'supervisor']
    },
    {
        id: 'settings',
        label: 'Ajustes',
        icon: <Settings className="h-5 w-5" />,
        href: '/settings',
        roles: ['admin', 'brand', 'supervisor', 'promotor', 'asesor_de_ventas', 'client']
    }
]

export interface BottomNavigationProps {
    role: UserRole
}

export function BottomNavigation({ role }: BottomNavigationProps) {
    const pathname = usePathname()
    const allowedItems = navItems.filter(item => item.roles.includes(role))

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-40">
            <div className="grid grid-cols-4 md:grid-cols-5">
                {allowedItems.slice(0, 4).map(item => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center py-3 px-2 text-xs font-medium transition-colors",
                            pathname.startsWith(item.href)
                                ? "text-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {item.icon}
                        <span className="mt-1">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    )
}
