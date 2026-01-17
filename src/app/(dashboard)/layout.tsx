'use client'

import { AuthProvider } from '@/components/providers/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation could go here in the future */}
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
