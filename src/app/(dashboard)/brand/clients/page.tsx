'use client'

import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Users, Search, Check, Award, ChevronLeft, ChevronRight, UserPlus, Coins, MapPin } from 'lucide-react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { ExportButton } from '@/components/ui/export-button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/components/ui/toaster'
import {
  TierAssignModal,
  PointsModal,
  AddMembersModal,
  MembershipStatusBadge,
} from '@/components/brand/membership-actions'
import type { Membership, BrandTier, Pagination, PointsOperationData } from '@/components/brand/membership-actions'
import { ClickableRow } from '@/components/ui/clickable-row'
import { ListItemActions } from '@/components/ui/list-item-actions'

export default function BrandClientsPage() {
  usePageTitle('Clientes')
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [tiers, setTiers] = useState<BrandTier[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [selectedTierId, setSelectedTierId] = useState('')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)

  const [assignModal, setAssignModal] = useState<{ open: boolean; membership: Membership | null }>({
    open: false,
    membership: null
  })
  const [pointsModal, setPointsModal] = useState<{ open: boolean; membership: Membership | null }>({
    open: false,
    membership: null
  })
  const [addMembersModal, setAddMembersModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { brandFetch, currentBrandId } = useBrandFetch()

  // Load tiers
  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const loadTiers = async () => {
      try {
        const response = await brandFetch('/api/brand/tiers', { signal: controller.signal })
        if (response.ok) {
          const data = await response.json()
          if (!controller.signal.aborted) setTiers(data.tiers || [])
        }
      } catch {
        // Non-critical
      }
    }

    loadTiers()
    return () => controller.abort()
  }, [brandFetch, currentBrandId])

  // Load memberships
  useEffect(() => {
    if (!currentBrandId) return

    const controller = new AbortController()

    const loadMemberships = async () => {
      try {
        setLoading(true)
        setError(null)

        const statusParam = activeTab === 'all' ? '' : activeTab
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(statusParam && { status: statusParam }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(selectedTierId && { tier_id: selectedTierId })
        })

        const response = await brandFetch(`/api/brand/memberships?${params}`, { signal: controller.signal })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar clientes')
        }

        const data = await response.json()
        setMemberships(data.memberships || [])
        setPagination(data.pagination)
      } catch (err) {
        if (controller.signal.aborted) return
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadMemberships()
    return () => controller.abort()
  }, [activeTab, debouncedSearch, selectedTierId, page, brandFetch, currentBrandId, refreshKey])

  const handleApprove = async (membership: Membership) => {
    if (!confirm(`¿Aprobar la membresía de "${membership.client_name}"?`)) {
      return
    }

    try {
      setActionLoading(membership.id)

      const response = await brandFetch(`/api/brand/memberships/${membership.id}/approve`, {
        method: 'PUT'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al aprobar membresía')
      }

      toast({ variant: 'success', title: 'Membresía aprobada correctamente' })
      setRefreshKey(k => k + 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAssignTier = async (tierId: string) => {
    if (!assignModal.membership) return

    try {
      setActionLoading(assignModal.membership.id)

      const response = await brandFetch(`/api/brand/memberships/${assignModal.membership.id}/assign-tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_id: tierId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al asignar nivel')
      }

      const data = await response.json()
      toast({ variant: 'success', title: data.message || 'Nivel asignado correctamente' })
      setAssignModal({ open: false, membership: null })
      setRefreshKey(k => k + 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setRefreshKey(k => k + 1)
  }

  const handleAddMembers = async (clientIds: string[]) => {
    if (clientIds.length === 0) return

    try {
      setActionLoading('adding')

      const response = await brandFetch('/api/brand/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_ids: clientIds })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar miembros')
      }

      const data = await response.json()
      toast({ variant: 'success', title: data.message || 'Miembros agregados correctamente' })
      setAddMembersModal(false)
      setPage(1); setRefreshKey(k => k + 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePointsOperation = async (data: PointsOperationData) => {
    if (!pointsModal.membership) return

    try {
      setActionLoading(pointsModal.membership.id)

      const dbTransactionType = data.transaction_type === 'award' ? 'earned' : 'penalty'

      const response = await brandFetch('/api/brand/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membership_id: pointsModal.membership.id,
          points_amount: data.points_amount,
          transaction_type: dbTransactionType,
          description: data.description
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar puntos')
      }

      const result = await response.json()
      toast({ variant: 'success', title: result.message || 'Puntos procesados correctamente' })
      setPointsModal({ open: false, membership: null })
      setRefreshKey(k => k + 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const tabs = [
    { id: 'all' as const, label: 'Todos' },
    { id: 'pending' as const, label: 'Pendientes' },
    { id: 'active' as const, label: 'Activos' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">
                      Marca
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Clientes</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los clientes y membresías de tu marca
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton
                endpoint="/api/brand/memberships/export"
                filename="clientes"
                filters={{ status: activeTab, search: searchTerm, tier_id: selectedTierId || undefined }}
              />
              <Button onClick={() => setAddMembersModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Miembros
              </Button>
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

        <Card>
          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setPage(1) }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedTierId}
                onChange={(e) => setSelectedTierId(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los niveles</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name}
                  </option>
                ))}
              </select>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
          </div>

          {/* Table */}
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : memberships.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sin clientes</h3>
                <p className="mt-2 text-gray-500">
                  No se encontraron clientes con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nivel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberships.map((membership) => (
                      <ClickableRow key={membership.id} href={membership.client_public_id ? `/brand/clients/${membership.client_public_id}` : '#'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{membership.client_name}</p>
                            {membership.client_email && (
                              <p className="text-xs text-gray-500">{membership.client_email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <MembershipStatusBadge status={membership.membership_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {membership.current_tier ? (
                            <div className="flex items-center space-x-2">
                              <div
                                className="h-6 w-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: membership.current_tier.tier_color || '#6366F1' }}
                              >
                                <Award className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-900">{membership.current_tier.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Sin nivel</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{membership.points_balance.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{membership.lifetime_points.toLocaleString()} total</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {membership.joined_date
                            ? new Date(membership.joined_date).toLocaleDateString('es-MX')
                            : new Date(membership.created_at).toLocaleDateString('es-MX')
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-1">
                          <ListItemActions className="inline-flex items-center gap-1">
                            {membership.membership_status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(membership)}
                                disabled={actionLoading === membership.id}
                              >
                                {actionLoading === membership.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Aprobar
                                  </>
                                )}
                              </Button>
                            )}
                            {membership.membership_status === 'active' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPointsModal({ open: true, membership })}
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  Puntos
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAssignModal({ open: true, membership })}
                                >
                                  <Award className="h-3 w-3 mr-1" />
                                  Nivel
                                </Button>
                              </>
                            )}
                            {membership.client_public_id && (
                              <Link href={`/brand/clients/${membership.client_public_id}/visits`}>
                                <Button size="sm" variant="ghost" title="Ver visitas">
                                  <MapPin className="h-3 w-3" />
                                </Button>
                              </Link>
                            )}
                          </ListItemActions>
                        </td>
                      </ClickableRow>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <TierAssignModal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, membership: null })}
        onSubmit={handleAssignTier}
        tiers={tiers.filter(t => t.id !== assignModal.membership?.current_tier?.id)}
        membershipName={assignModal.membership?.client_name || ''}
        saving={actionLoading === assignModal.membership?.id}
      />

      <AddMembersModal
        isOpen={addMembersModal}
        onClose={() => setAddMembersModal(false)}
        onSubmit={handleAddMembers}
        saving={actionLoading === 'adding'}
      />

      <PointsModal
        isOpen={pointsModal.open}
        onClose={() => setPointsModal({ open: false, membership: null })}
        onSubmit={handlePointsOperation}
        membership={pointsModal.membership}
        saving={actionLoading === pointsModal.membership?.id}
      />
    </div>
  )
}
