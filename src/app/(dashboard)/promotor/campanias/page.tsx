'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { EmptyState } from '@/components/ui/EmptyState'
import { Megaphone, Calendar, Building2, Tag } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

interface Brand {
  id: string
  name: string
  logo_url: string | null
}

interface Promotion {
  id: string
  public_id: string
  name: string
  description: string | null
  promotion_type: string
  status: string
  start_date: string
  end_date: string
  discount_percentage: number | null
  discount_amount: number | null
  buy_quantity: number | null
  get_quantity: number | null
  points_multiplier: number | null
  brands: Brand
}

const PROMOTION_TYPE_LABELS: Record<string, string> = {
  percentage_discount: 'Descuento %',
  fixed_discount: 'Descuento fijo',
  buy_x_get_y: 'Compra X lleva Y',
  points_multiplier: 'Multiplicador puntos',
  bonus_points: 'Puntos bonus',
  free_product: 'Producto gratis',
}

export default function PromotorCampaniasPage() {
  usePageTitle('Campañas')
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState('')

  const loadPromotions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedType) params.set('type', selectedType)

      const response = await fetch(`/api/promotor/promotions?${params}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar campañas')
      }

      const data = await response.json()
      setPromotions(data.promotions || [])
      setTypes(data.types || [])
    } catch (err) {
      console.error('Error loading promotions:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [selectedType])

  useEffect(() => {
    loadPromotions()
  }, [loadPromotions])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPromotionValue = (promo: Promotion): string => {
    if (promo.discount_percentage) return `${promo.discount_percentage}% descuento`
    if (promo.discount_amount) return `$${promo.discount_amount} descuento`
    if (promo.buy_quantity && promo.get_quantity) return `Compra ${promo.buy_quantity}, lleva ${promo.get_quantity}`
    if (promo.points_multiplier) return `x${promo.points_multiplier} puntos`
    return '-'
  }

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate)
    const now = new Date()
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  if (loading && promotions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando campañas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Campañas Activas
            </h1>
            <p className="text-gray-600 mt-1">
              Promociones vigentes para tus marcas asignadas
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Type filter */}
        {types.length > 1 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedType === '' ? 'default' : 'outline'}
                onClick={() => setSelectedType('')}
              >
                Todas
              </Button>
              {types.map(type => (
                <Button
                  key={type}
                  size="sm"
                  variant={selectedType === type ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type)}
                >
                  {PROMOTION_TYPE_LABELS[type] || type}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Promotions List */}
        {promotions.length === 0 && !loading ? (
          <EmptyState
            icon={<Megaphone className="w-16 h-16" />}
            title="No hay campañas activas"
            description="No hay promociones vigentes para tus marcas en este momento."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((promo) => {
              const daysRemaining = getDaysRemaining(promo.end_date)
              return (
                <Card key={promo.id} className="hover:shadow-md transition-shadow">
                  <div className="p-5">
                    {/* Brand header */}
                    <div className="flex items-center space-x-3 mb-3">
                      {promo.brands?.logo_url ? (
                        <Image
                          src={promo.brands.logo_url}
                          alt={promo.brands.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <span className="text-sm text-gray-500">{promo.brands?.name}</span>
                    </div>

                    {/* Promotion info */}
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{promo.name}</h3>
                    {promo.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{promo.description}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {PROMOTION_TYPE_LABELS[promo.promotion_type] || promo.promotion_type}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getPromotionValue(promo)}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                      </span>
                      <span className={`font-medium ${daysRemaining <= 7 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {daysRemaining === 0 ? 'Último día' : `${daysRemaining} días restantes`}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
