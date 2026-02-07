'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAssignedClients } from '@/hooks/useVisits'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Search, MapPin, Phone, Mail, Calendar, Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AsesorClientsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1) // Reset to first page on search
    // Simple debounce using setTimeout
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  const { clients, loading, error, pagination, total, refetch } = useAssignedClients({
    search: debouncedSearch,
    page,
    limit: 20
  })

  // Filter clients locally for instant feedback while debouncing
  const filteredClients = useMemo(() => {
    if (!searchTerm || searchTerm === debouncedSearch) return clients
    const searchLower = searchTerm.toLowerCase()
    return clients.filter(
      client =>
        client.business_name?.toLowerCase().includes(searchLower) ||
        client.address?.toLowerCase().includes(searchLower) ||
        client.public_id?.toLowerCase().includes(searchLower)
    )
  }, [clients, searchTerm, debouncedSearch])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin visitas'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPhoneForWhatsApp = (phone: string | null) => {
    if (!phone) return null
    // Remove all non-numeric characters
    return phone.replace(/\D/g, '')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <nav className="flex mb-2" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm">
                    <li>
                      <Link href="/asesor" className="text-gray-400 hover:text-gray-500">
                        Asesor
                      </Link>
                    </li>
                    <li>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </li>
                    <li className="text-gray-900 font-medium">Mis Clientes</li>
                  </ol>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Mis Clientes
                </h1>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Cargando...' : `${total} cliente${total !== 1 ? 's' : ''} asignado${total !== 1 ? 's' : ''}`}
                </p>
              </div>
              <Button
                onClick={() => router.push('/asesor/visitas/nueva')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Visita
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Filter */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar por nombre, dirección o ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-48 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-40"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error: {error}
            </div>
            <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron clientes' : 'No tienes clientes asignados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Cuando te asignen clientes, aparecerán aquí'}
            </p>
            {searchTerm && (
              <Button onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }} variant="outline">
                Limpiar búsqueda
              </Button>
            )}
          </div>
        )}

        {/* Client List */}
        {!loading && !error && filteredClients.length > 0 && (
          <>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  formatDate={formatDate}
                  formatPhoneForWhatsApp={formatPhoneForWhatsApp}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Client Card Component
interface ClientCardProps {
  client: {
    id: string
    public_id: string
    business_name: string
    owner_name: string
    address: string
    phone: string
    email: string
    status: string
    last_visit_date: string | null
    brands: Array<{ id: string; name: string; logo_url: string | null }>
    assignment: { type: string; priority: number }
  }
  formatDate: (date: string | null) => string
  formatPhoneForWhatsApp: (phone: string | null) => string | null
}

function ClientCard({ client, formatDate, formatPhoneForWhatsApp }: ClientCardProps) {
  const router = useRouter()
  const whatsappNumber = formatPhoneForWhatsApp(client.phone)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Client Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {client.business_name || 'Sin nombre'}
                </h3>
                {client.owner_name && (
                  <p className="text-sm text-gray-600">{client.owner_name}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">ID: {client.public_id}</p>
              </div>

              {/* Priority Badge */}
              {client.assignment.priority > 1 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Prioridad {client.assignment.priority}
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              {client.address && (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span>{client.phone}</span>
                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              )}

              {client.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <a
                    href={`mailto:${client.email}`}
                    className="hover:text-blue-600 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {client.email}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>Última visita: {formatDate(client.last_visit_date)}</span>
              </div>
            </div>

            {/* Brands */}
            {client.brands && client.brands.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {client.brands.map((brand) => (
                  <span
                    key={brand.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {brand.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
            <Button
              onClick={() => router.push(`/asesor/visitas/nueva?clientId=${client.id}`)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nueva Visita
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
