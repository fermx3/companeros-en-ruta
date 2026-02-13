'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface QRScannerFullscreenProps {
    onScanSuccess: (data: string) => void
    onClose: () => void
    title?: string
}

export function QRScannerFullscreen({
    onScanSuccess,
    onClose,
    title = "Escanear QR de Entrada"
}: QRScannerFullscreenProps) {
    return (
        <div className="fixed inset-0 bg-black z-50">
            {/* Header */}
            <div className="relative z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center justify-between text-white">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <div className="w-10" />
                </div>
            </div>

            {/* Scanner area */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                    <div className="w-64 h-64 border-2 border-white rounded-2xl relative overflow-hidden">
                        {/* Esquinas del scanner */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg" />
                        <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg" />

                        {/* Línea de escaneo animada */}
                        <div className="absolute inset-x-4 top-1/2 h-0.5 bg-primary shadow-lg shadow-primary/50 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                <div className="text-center text-white space-y-2">
                    <p className="text-lg font-semibold">Posiciona el código QR dentro del marco</p>
                    <p className="text-sm opacity-80">El escaneo será automático</p>
                </div>
            </div>
        </div>
    )
}
