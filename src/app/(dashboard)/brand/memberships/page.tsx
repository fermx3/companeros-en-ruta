'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Users, Search, Check, Award, ChevronLeft, ChevronRight, X, Plus, UserPlus, Coins, TrendingUp, TrendingDown } from 'lucide-react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { ExportButton } from '@/components/ui/export-button'
import { usePageTitle } from '@/hooks/usePageTitle'

interface MembershipTier {
  id: string
  name: string
  tier_level: number
  tier_color: string | null
}

interface Membership {
  id: string
  public_id: string
  client_id: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  membership_status: string
  joined_date: string | null
  approved_date: string | null
  points_balance: number
  lifetime_points: number
  current_tier: MembershipTier | null
  created_at: string
}

interface BrandTier {
  id: string
  name: string
  tier_level: number
  tier_color: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
    suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' }
  }

  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}

function TierAssignModal({
  isOpen,
  onClose,
  onSubmit,
  tiers,
  membershipName,
  saving
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tierId: string) => void
  tiers: BrandTier[]
  membershipName: string
  saving: boolean
}) {
  const [selectedTier, setSelectedTier] = useState<string>('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Asignar Nivel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Asignar nivel a <strong>{membershipName}</strong>
          </p>

          <div className="space-y-2">
            {tiers.map((tier) => (
              <label
                key={tier.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTier === tier.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier.id}
                  checked={selectedTier === tier.id}
                  onChange={() => setSelectedTier(tier.id)}
                  className="sr-only"
                />
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: tier.tier_color || '#6366F1' }}
                >
                  <Award className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tier.name}</p>
                  <p className="text-xs text-gray-500">Nivel {tier.tier_level}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedTier && onSubmit(selectedTier)}
              disabled={!selectedTier || saving}
            >
              {saving && <LoadingSpinner size="sm" className="mr-2" />}
              Asignar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AvailableClient {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  email: string | null
}

function AddMembersModal({
  isOpen,
  onClose,
  onSubmit,
  saving
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (clientIds: string[]) => void
  saving: boolean
}) {
  const { brandFetch, currentBrandId } = useBrandFetch()
  const [clients, setClients] = useState<AvailableClient[]>([])
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isOpen || !currentBrandId) return

    const controller = new AbortController()

    const loadAvailableClients = async () => {
      try {
        setLoading(true)
        const response = await brandFetch('/api/brand/clients?limit=100', { signal: controller.signal })
        if (response.ok) {
          const data = await response.json()
          if (!controller.signal.aborted) setClients(data.clients || [])
        }
      } catch {
        // Non-critical
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadAvailableClients()
    return () => controller.abort()
  }, [isOpen, brandFetch, currentBrandId])

  const toggleClient = (clientId: string) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
  }

  const selectAll = () => {
    const filteredIds = filteredClients.map(c => c.id)
    setSelectedClients(new Set(filteredIds))
  }

  const clearSelection = () => {
    setSelectedClients(new Set())
  }

  const filteredClients = clients.filter(c => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      c.business_name?.toLowerCase().includes(search) ||
      c.owner_name?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.public_id.toLowerCase().includes(search)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Agregar Miembros</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Seleccionar todos
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Limpiar
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {selectedClients.size} cliente{selectedClients.size !== 1 ? 's' : ''} seleccionado{selectedClients.size !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron clientes disponibles
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <label
                  key={client.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedClients.has(client.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedClients.has(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{client.business_name || client.owner_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {client.public_id} {client.email && `• ${client.email}`}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSubmit(Array.from(selectedClients))}
            disabled={selectedClients.size === 0 || saving}
          >
            {saving && <LoadingSpinner size="sm" className="mr-2" />}
            Agregar {selectedClients.size} miembro{selectedClients.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PointsModal({
  isOpen,
  onClose,
  onSubmit,
  membership,
  saving
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { points_amount: number; transaction_type: 'award' | 'deduct'; description: string }) => void
  membership: Membership | null
  saving: boolean
}) {
  const [transactionType, setTransactionType] = useState<'award' | 'deduct'>('award')
  const [pointsAmount, setPointsAmount] = useState('')
  const [description, setDescription] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTransactionType('award')
      setPointsAmount('')
      setDescription('')
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(pointsAmount)
    if (isNaN(amount) || amount <= 0) return

    onSubmit({
      points_amount: amount,
      transaction_type: transactionType,
      description: description || (transactionType === 'award' ? 'Puntos otorgados' : 'Puntos deducidos')
    })
  }

  if (!isOpen || !membership) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Gestionar Puntos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Cliente: <strong>{membership.client_name}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Balance actual: <strong>{membership.points_balance.toLocaleString()} puntos</strong>
            </p>
          </div>

          {/* Transaction Type Toggle */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de operación</label>
            <div className="flex rounded-lg overflow-hidden border">
              <button
                type="button"
                onClick={() => setTransactionType('award')}
                className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                  transactionType === 'award'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Otorgar
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('deduct')}
                className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                  transactionType === 'deduct'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Deducir
              </button>
            </div>
          </div>

          {/* Points Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de puntos</label>
            <input
              type="number"
              min="1"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="Ingresa la cantidad"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {transactionType === 'deduct' && parseInt(pointsAmount) > membership.points_balance && (
              <p className="text-sm text-red-600 mt-1">
                El cliente solo tiene {membership.points_balance.toLocaleString()} puntos disponibles
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={transactionType === 'award' ? 'Ej: Bonificación por compra' : 'Ej: Ajuste de balance'}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!pointsAmount || parseInt(pointsAmount) <= 0 || saving || (transactionType === 'deduct' && parseInt(pointsAmount) > membership.points_balance)}
              className={transactionType === 'award' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {saving && <LoadingSpinner size="sm" className="mr-2" />}
              {transactionType === 'award' ? 'Otorgar' : 'Deducir'} {pointsAmount ? parseInt(pointsAmount).toLocaleString() : 0} puntos
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BrandMembershipsPage() {
  usePageTitle('Membresías')
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [tiers, setTiers] = useState<BrandTier[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active'>('all')
  const [searchTerm, setSearchTerm] = useState('')
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
        // Non-critical for tiers list
      }
    }

    loadTiers()
    return () => controller.abort()
  }, [brandFetch, currentBrandId])

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
          ...(searchTerm && { search: searchTerm }),
          ...(selectedTierId && { tier_id: selectedTierId })
        })

        const response = await brandFetch(`/api/brand/memberships?${params}`, { signal: controller.signal })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar membresías')
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
  }, [activeTab, searchTerm, selectedTierId, page, brandFetch, currentBrandId, refreshKey])

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

      setSuccessMessage('Membresía aprobada correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
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
      setSuccessMessage(data.message || 'Nivel asignado correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
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
      setSuccessMessage(data.message || 'Miembros agregados correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
      setAddMembersModal(false)
      setPage(1); setRefreshKey(k => k + 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePointsOperation = async (data: { points_amount: number; transaction_type: 'award' | 'deduct'; description: string }) => {
    if (!pointsModal.membership) return

    try {
      setActionLoading(pointsModal.membership.id)

      // Map UI values to database enum values
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
      setSuccessMessage(result.message || 'Puntos procesados correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
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
                      <span className="ml-4 text-gray-900 font-medium">Miembros</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Miembros
              </h1>
              <p className="text-gray-600 mt-1">
                Administra las membresías de tus clientes
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton
                endpoint="/api/brand/memberships/export"
                filename="membresias"
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

        {successMessage && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Card>
          {/* Tabs */}
          <div className="border-b">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sin miembros</h3>
                <p className="mt-2 text-gray-500">
                  No se encontraron miembros con los filtros seleccionados.
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
                      <tr key={membership.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{membership.client_name}</p>
                            {membership.client_email && (
                              <p className="text-xs text-gray-500">{membership.client_email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={membership.membership_status} />
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
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
                                className="mr-1"
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
                        </td>
                      </tr>
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
