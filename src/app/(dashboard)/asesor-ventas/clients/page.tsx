'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, StatusBadge, Alert, EmptyState } from '@/components/ui/feedback'
import {
  Users,
  Building2,
  Phone,
  MapPin,
  ChevronRight,
  Search,
  Plus
} from 'lucide-react'

interface Client {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_city: string | null
  address_state: string | null
  status: string
  source_type: 'assignment' | 'membership'
  source_status: string
}

export default function AsesorVentasClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [totalClients, setTotalClients] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/asesor-ventas/clients')

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar clientes')
        }

        const data = await response.json()
        setClients(data.clients || [])
        setTotalClients(data.total || 0)
      } catch (err) {
        console.error('Error loading clients:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      client.business_name.toLowerCase().includes(term) ||
      client.owner_name?.toLowerCase().includes(term) ||
      client.address_city?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/asesor-ventas" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Mis Clientes</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-emerald-600" />
                  Mis Clientes
                </h1>
                <p className="text-gray-600 mt-1">
                  {totalClients} clientes asignados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, propietario, ciudad o telefono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Client List */}
        {filteredClients.length === 0 ? (
          <EmptyState
            icon={<Users className="w-16 h-16 text-gray-400" />}
            title={searchTerm ? "Sin resultados" : "No hay clientes asignados"}
            description={
              searchTerm
                ? "No se encontraron clientes con los criterios de busqueda."
                : "Aun no tienes clientes asignados. Contacta a tu supervisor para que te asigne clientes."
            }
            action={
              searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpiar busqueda
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <Link
                key={client.id}
                href={`/asesor-ventas/clients/${client.public_id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {client.business_name}
                            </h3>
                            {client.owner_name && (
                              <p className="text-sm text-gray-600">
                                {client.owner_name}
                              </p>
                            )}
                          </div>
                          <StatusBadge
                            status={client.status as 'active' | 'inactive'}
                            size="sm"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                          {client.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {(client.address_city || client.address_state) && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-gray-400" />
                              <span>
                                {[client.address_city, client.address_state]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            router.push(`/asesor-ventas/orders/create?client_id=${client.id}`)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Orden
                        </Button>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
