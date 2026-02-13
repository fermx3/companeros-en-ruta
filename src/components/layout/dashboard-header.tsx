'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DashboardHeaderProps {
    brandName?: string
    subtitle?: string
    className?: string
}

export function DashboardHeader({
    brandName = 'Brand Analytics',
    subtitle = 'SMART DATA CENTER',
    className
}: DashboardHeaderProps) {
    return (
        <header className={cn(
            "sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-border",
            className
        )}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-sm font-bold text-white">CR</span>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                        <h1 className="text-lg font-bold">{brandName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="rounded-full">
                        <Bell className="h-5 w-5" />
                    </Button>
                    {/* User avatar placeholder - will be replaced with actual avatar component */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">U</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
