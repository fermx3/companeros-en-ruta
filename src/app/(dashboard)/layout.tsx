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
        <div className="min-h-screen bg-login-gradient">
          <main>
            {children}
          </main>
        </div>
      </ToasterProvider>
    </AuthProvider>
  )
}
