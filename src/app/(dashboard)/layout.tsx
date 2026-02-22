'use client'

import { AuthProvider } from '@/components/providers/AuthProvider'
import { ToasterProvider } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <ToasterProvider>
        <div className="min-h-screen bg-gray-50">
          <main>
            {children}
          </main>
        </div>
      </ToasterProvider>
    </AuthProvider>
  )
}
