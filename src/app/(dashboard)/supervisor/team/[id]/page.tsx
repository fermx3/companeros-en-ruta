'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, CheckCircle, Clock, Star, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

interface MemberProfile {
  id: string
  full_name: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
}

interface MemberStats {
  total_clients: number
  completed_visits: number
  pending_visits: number
  avg_rating: number
}

interface AssignedClient {
  id: string
  name: string
  public_id: string
  client_type: string
  status: string
  contact_email: string | null
  contact_phone: string | null
  assignment_type: string
}

interface RecentVisit {
  id: string
  visit_date: string
  visit_status: string
  client_satisfaction_rating: number | null
  client_name: string
}

interface MemberDetail {
  profile: MemberProfile
  stats: MemberStats
  assigned_clients: AssignedClient[]
  recent_visits: RecentVisit[]
}

const visitStatusLabels: Record<string, string> = {
  planned: 'Planificada',
  scheduled: 'Agendada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const visitStatusColors: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function SupervisorTeamMemberPage() {
  const params = useParams()
  const memberId = params.id as string
  const [data, setData] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMember = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/supervisor/team/${memberId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar datos del promotor')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    loadMember()
  }, [loadMember])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded-md w-48"></div>
          <div className="bg-white p-6 rounded-lg shadow-sm h-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm h-20"></div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm h-64"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <h3 className="text-red-800 font-semibold">Error al cargar los datos</h3>
              <p className="text-red-600 text-sm mt-1">{error || 'Datos no disponibles'}</p>
              <div className="flex gap-2 mt-4">
                <Link href="/supervisor/team">
                  <Button variant="outline">Volver al equipo</Button>
                </Link>
                <Button onClick={loadMember} variant="outline">
                  Intentar de nuevo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { profile, stats, assigned_clients, recent_visits } = data

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/supervisor/team">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-gray-600 text-sm">Detalle del promotor</p>
            </div>
          </div>

          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-700">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">{profile.full_name}</h2>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" /> {profile.email}
                    </span>
                    {profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" /> {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
                <p className="text-xs text-gray-500">Clientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.completed_visits}</p>
                <p className="text-xs text-gray-500">Completadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.pending_visits}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.avg_rating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Clients */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Clientes Asignados ({assigned_clients.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {assigned_clients.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assigned_clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{client.name}</div>
                            <div className="text-xs text-gray-500">{client.public_id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                              {client.client_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              client.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {client.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.contact_email || client.contact_phone || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Sin clientes asignados</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Visits */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Visitas Recientes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recent_visits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recent_visits.map((visit) => (
                        <tr key={visit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visit.visit_date
                              ? new Date(visit.visit_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {visit.client_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              visitStatusColors[visit.visit_status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {visitStatusLabels[visit.visit_status] || visit.visit_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {visit.client_satisfaction_rating ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm">{visit.client_satisfaction_rating}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Sin visitas registradas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
