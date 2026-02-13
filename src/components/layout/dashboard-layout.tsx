import React from 'react'
import { DashboardHeader } from './dashboard-header'
import { BottomNavigation } from './bottom-navigation'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/ui'

export interface DashboardLayoutProps {
    role: UserRole
    brandName?: string
    subtitle?: string
    children: React.ReactNode
    className?: string
}

export function DashboardLayout({
    role,
    brandName,
    subtitle,
    children,
    className
}: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            {/* Header con branding y notificaciones */}
            <DashboardHeader brandName={brandName} subtitle={subtitle} />

            {/* Main content */}
            <main className={cn("p-4 space-y-6", className)}>
                {children}
            </main>

            {/* Bottom Navigation - Solo en móvil */}
            <BottomNavigation role={role} />
        </div>
    )
}
