import React from 'react'
import { Crown } from 'lucide-react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

export interface ProgressCardProps {
    currentTier: string
    nextTier: string
    currentPoints: number
    targetPoints: number
    totalPoints: number
    userId?: string
    className?: string
}

export function ProgressCard({
    currentTier,
    nextTier,
    currentPoints,
    targetPoints,
    totalPoints,
    userId,
    className
}: ProgressCardProps) {
    const progress = Math.min((currentPoints / targetPoints) * 100, 100)

    return (
        <Card className={cn(
            "p-6 rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg",
            className
        )}>
            <div className="space-y-4">
                {/* Header con tier actual */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">NIVEL ACTUAL</p>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">{currentTier}</h2>
                            <Crown className="h-6 w-6" />
                        </div>
                    </div>
                    {userId && (
                        <div className="text-right">
                            <p className="text-sm opacity-90">ID:</p>
                            <p className="font-mono text-sm">{userId}</p>
                        </div>
                    )}
                </div>

                {/* Progreso a siguiente tier */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progreso a {nextTier}</span>
                        <span>{currentPoints.toLocaleString()} / {targetPoints.toLocaleString()} pts</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                            className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Total points */}
                <div>
                    <p className="text-3xl font-bold">{totalPoints.toLocaleString()}</p>
                    <p className="text-sm opacity-90">puntos totales</p>
                </div>
            </div>
        </Card>
    )
}
