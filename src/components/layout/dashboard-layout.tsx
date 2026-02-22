import React from 'react'
import { DashboardHeader } from './dashboard-header'
import { BottomNavigation } from './bottom-navigation'
import { cn } from '@/lib/utils'
import type { NavEntry } from '@/lib/navigation-config'

export interface DashboardLayoutProps {
    entries?: NavEntry[]
    brandName?: string
    subtitle?: string
    children: React.ReactNode
    className?: string
}

export function DashboardLayout({
    entries,
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

            {entries && <BottomNavigation entries={entries} />}
        </div>
    )
}
