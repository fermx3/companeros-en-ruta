'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Coins, TrendingUp, TrendingDown, ArrowLeft, ChevronLeft, ChevronRight, Gift, ShoppingBag, Star, Calendar } from 'lucide-react'

interface PointsTransaction {
  id: string
  public_id: string
  transaction_type: string
  points: number
  balance_after: number
  source_type: string | null
  source_description: string | null
  transaction_date: string
}

interface BrandPointsSummary {
  brand_id: string
  brand_name: string
  brand_logo_url: string | null
  current_balance: number
  lifetime_points: number
  recent_transactions: PointsTransaction[]
}

interface PointsData {
  total_balance: number
  total_lifetime_points: number
  brands: BrandPointsSummary[]
}

interface BrandDetailData {
  brand: {
    id: string
    name: string
    logo_url: string | null
  }
  summary: {
    current_balance: number
    lifetime_points: number
  }
  transactions: PointsTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function TransactionIcon({ type }: { type: string }) {
  switch (type) {
    case 'earned':
    case 'bonus':
      return <TrendingUp className="h-4 w-4 text-green-600" />
    case 'penalty':
    case 'redeemed':
    case 'expired':
      return <TrendingDown className="h-4 w-4 text-red-600" />
    default:
      return <Coins className="h-4 w-4 text-gray-600" />
  }
}

function TransactionBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    earned: { label: 'Otorgado', className: 'bg-green-100 text-green-800' },
    bonus: { label: 'Bonificación', className: 'bg-blue-100 text-blue-800' },
    penalty: { label: 'Deducido', className: 'bg-red-100 text-red-800' },
    redeemed: { label: 'Canjeo', className: 'bg-purple-100 text-purple-800' },
    expired: { label: 'Expirado', className: 'bg-gray-100 text-gray-800' },
    adjusted: { label: 'Ajuste', className: 'bg-yellow-100 text-yellow-800' },
    transferred: { label: 'Transferido', className: 'bg-indigo-100 text-indigo-800' }
  }

  const { label, className } = config[type] || { label: type, className: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>
      {label}
    </span>
  )
}

function ReferenceIcon({ type }: { type: string | null }) {
  switch (type) {
    case 'order':
      return <ShoppingBag className="h-3 w-3" />
    case 'promotion':
      return <Gift className="h-3 w-3" />
    case 'tier_upgrade':
      return <Star className="h-3 w-3" />
    case 'birthday':
      return <Calendar className="h-3 w-3" />
    default:
      return <Coins className="h-3 w-3" />
  }
}

export default function ClientPointsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [brandDetail, setBrandDetail] = useState<BrandDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadPointsSummary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/client/points')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar puntos')
      }

      const data = await response.json()
      setPointsData(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadBrandDetail = useCallback(async (brandId: string, page = 1) => {
    try {
      setDetailLoading(true)

      const response = await fetch(`/api/client/points?brand_id=${brandId}&page=${page}&limit=10`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar historial')
      }

      const data = await response.json()
      setBrandDetail(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPointsSummary()
  }, [loadPointsSummary])

  useEffect(() => {
    if (selectedBrand) {
      loadBrandDetail(selectedBrand)
    }
  }, [selectedBrand, loadBrandDetail])

  const handleBackToSummary = () => {
    setSelectedBrand(null)
    setBrandDetail(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Detail View
  if (selectedBrand && brandDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <button
                onClick={handleBackToSummary}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al resumen
              </button>
              <div className="flex items-center space-x-4">
                {brandDetail.brand.logo_url ? (
                  <img
                    src={brandDetail.brand.logo_url}
                    alt={brandDetail.brand.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {brandDetail.brand.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{brandDetail.brand.name}</h1>
                  <p className="text-gray-600">Historial de puntos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Balance Card */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Balance disponible</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {brandDetail.summary.current_balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Puntos acumulados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {brandDetail.summary.lifetime_points.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de transacciones</CardTitle>
              <CardDescription>
                {brandDetail.pagination.total} transacciones en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : brandDetail.transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay transacciones registradas
                </div>
              ) : (
                <div className="space-y-4">
                  {brandDetail.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          tx.points > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <TransactionIcon type={tx.transaction_type} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              {tx.source_description || tx.transaction_type}
                            </p>
                            <TransactionBadge type={tx.transaction_type} />
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <ReferenceIcon type={tx.source_type} />
                            <span>
                              {new Date(tx.transaction_date).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          tx.points > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Balance: {tx.balance_after.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {brandDetail.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Página {brandDetail.pagination.page} de {brandDetail.pagination.totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadBrandDetail(selectedBrand, brandDetail.pagination.page - 1)}
                      disabled={brandDetail.pagination.page <= 1 || detailLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadBrandDetail(selectedBrand, brandDetail.pagination.page + 1)}
                      disabled={brandDetail.pagination.page >= brandDetail.pagination.totalPages || detailLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Summary View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/client" className="text-gray-400 hover:text-gray-500">
                    Mi Portal
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">Mis Puntos</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900">Mis Puntos</h1>
            <p className="text-gray-600 mt-1">
              Consulta tu balance y movimientos de puntos
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Total Summary */}
        {pointsData && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-100 text-sm">Balance total</p>
                    <p className="text-3xl font-bold">
                      {pointsData.total_balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Puntos acumulados</p>
                    <p className="text-3xl font-bold">
                      {pointsData.total_lifetime_points.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Brands List */}
        {pointsData && pointsData.brands.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Coins className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Sin puntos</h3>
              <p className="mt-2 text-gray-500">
                Aún no tienes puntos acumulados. Únete a una marca para empezar a ganar.
              </p>
              <Link href="/client/brands">
                <Button className="mt-4">
                  Ver Marcas Disponibles
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Puntos por marca</h2>
            {pointsData?.brands.map((brand) => (
              <Card
                key={brand.brand_id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedBrand(brand.brand_id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {brand.brand_logo_url ? (
                        <img
                          src={brand.brand_logo_url}
                          alt={brand.brand_name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {brand.brand_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{brand.brand_name}</h3>
                        <p className="text-sm text-gray-500">
                          {brand.lifetime_points.toLocaleString()} puntos acumulados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {brand.current_balance.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">puntos disponibles</p>
                    </div>
                  </div>

                  {/* Recent Transactions Preview */}
                  {brand.recent_transactions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Últimos movimientos:</p>
                      <div className="space-y-2">
                        {brand.recent_transactions.slice(0, 3).map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <TransactionIcon type={tx.transaction_type} />
                              <span className="text-gray-600 truncate max-w-[200px]">
                                {tx.source_description || tx.transaction_type}
                              </span>
                            </div>
                            <span className={tx.points > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
