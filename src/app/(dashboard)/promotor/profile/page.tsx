'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { User } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { displayPhone } from '@/lib/utils/phone'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function PromotorProfilePage() {
  usePageTitle('Mi Perfil')
  const { user, userProfile, userRoles } = useAuth()

  const profile = userProfile as {
    first_name?: string
    last_name?: string
    phone?: string
    position?: string
    created_at?: string
  } | null

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || '—'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/promotor" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Mi Perfil</li>
              </ol>
            </nav>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Mi Perfil
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacion Personal</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                <dd className="mt-1 text-sm text-gray-900">{fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email ?? '—'}</dd>
              </div>
              {profile?.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telefono</dt>
                  <dd className="mt-1 text-sm text-gray-900">{displayPhone(profile.phone)}</dd>
                </div>
              )}
              {profile?.position && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Posicion</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.position}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rol y Acceso</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Promotor
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Roles asignados</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">—</span>
                  )}
                </dd>
              </div>
              {profile?.created_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Miembro desde</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(profile.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
