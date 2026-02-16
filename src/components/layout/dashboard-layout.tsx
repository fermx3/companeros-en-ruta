import React from 'react'
import { DashboardHeader } from './dashboard-header'
import { BottomNavigation } from './bottom-navigation'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/navigation-config'

export interface DashboardLayoutProps {
    items?: NavItem[]
    brandName?: string
    subtitle?: string
    children: React.ReactNode
    className?: string
}

export function DashboardLayout({
    items,
    brandName,
    subtitle,
    children,
    className
}: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <DashboardHeader brandName={brandName} subtitle={subtitle} />

            <main className={cn("p-4 space-y-6", className)}>
                {children}
            </main>

            {items && <BottomNavigation items={items} />}
        </div>
    )
}
