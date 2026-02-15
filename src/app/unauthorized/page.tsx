'use client'

import Link from 'next/link'
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function UnauthorizedPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
    }
    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No autorizado
          </h1>

          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta sección.
            {userEmail && (
              <span className="block mt-2 text-sm text-gray-500">
                Sesión iniciada como: {userEmail}
              </span>
            )}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="default" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>

            {userEmail && (
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Si crees que deberías tener acceso, contacta al administrador.
        </p>
      </div>
    </div>
  )
}
