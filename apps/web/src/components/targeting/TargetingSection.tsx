'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface TargetingSectionProps {
  title: string
  activeCount?: number
  defaultOpen?: boolean
  children: React.ReactNode
}

export function TargetingSection({ title, activeCount = 0, defaultOpen = false, children }: TargetingSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}
