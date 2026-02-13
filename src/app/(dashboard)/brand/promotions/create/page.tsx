'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form-legacy'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import { Gift, ArrowLeft, ArrowRight, Check, Calendar, Target, FileText } from 'lucide-react'

type PromotionType =
  | 'discount_percentage'
  | 'discount_amount'
  | 'buy_x_get_y'
  | 'free_product'
  | 'volume_discount'
  | 'tier_bonus'
  | 'cashback'
  | 'points_multiplier'

interface FormData {
  // Step 1 - Basic Info
  name: string
  description: string
  promotion_type: PromotionType | ''
  discount_percentage: number | null
  discount_amount: number | null
  buy_quantity: number | null
  get_quantity: number | null
  points_multiplier: number | null
  min_purchase_amount: number | null
  max_discount_amount: number | null

  // Step 2 - Schedule
  start_date: string
  end_date: string
  start_time: string
  end_time: string
  days_of_week: number[]
  usage_limit_per_client: number | null
  usage_limit_total: number | null
  budget_allocated: number | null

  // Step 3 - Options
  priority: number
  stackable: boolean
  auto_apply: boolean
  requires_code: boolean
  promo_code: string

  // Step 4 - Review
  terms_and_conditions: string
  internal_notes: string
}

const PROMOTION_TYPES = [
  { value: 'discount_percentage', label: 'Descuento porcentual', description: 'Aplica un porcentaje de descuento' },
  { value: 'discount_amount', label: 'Descuento fijo', description: 'Aplica un monto fijo de descuento' },
  { value: 'buy_x_get_y', label: 'Compra X, Lleva Y', description: 'Compra cierta cantidad y lleva más gratis' },
  { value: 'free_product', label: 'Producto gratis', description: 'Incluye un producto sin costo' },
  { value: 'volume_discount', label: 'Descuento por volumen', description: 'Descuento según cantidad comprada' },
  { value: 'tier_bonus', label: 'Bonus de nivel', description: 'Puntos extra por nivel del cliente' },
  { value: 'cashback', label: 'Cashback', description: 'Devolución de un porcentaje' },
  { value: 'points_multiplier', label: 'Multiplicador de puntos', description: 'Multiplica los puntos ganados' }
]

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' }
]

const STEPS = [
  { id: 1, name: 'Información Básica', icon: Gift },
  { id: 2, name: 'Vigencia', icon: Calendar },
  { id: 3, name: 'Opciones', icon: Target },
  { id: 4, name: 'Revisión', icon: FileText }
]

export default function CreatePromotionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    promotion_type: '',
    discount_percentage: null,
    discount_amount: null,
    buy_quantity: null,
    get_quantity: null,
    points_multiplier: null,
    min_purchase_amount: null,
    max_discount_amount: null,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    usage_limit_per_client: null,
    usage_limit_total: null,
    budget_allocated: null,
    priority: 0,
    stackable: false,
    auto_apply: false,
    requires_code: false,
    promo_code: '',
    terms_and_conditions: '',
    internal_notes: ''
  })

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleDayOfWeek = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }))
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name.trim()) {
        errors.name = 'El nombre es requerido'
      }
      if (!formData.promotion_type) {
        errors.promotion_type = 'Selecciona un tipo de promoción'
      }

      // Type-specific validations
      if (formData.promotion_type === 'discount_percentage' ||
          formData.promotion_type === 'cashback' ||
          formData.promotion_type === 'volume_discount') {
        if (!formData.discount_percentage || formData.discount_percentage <= 0 || formData.discount_percentage > 100) {
          errors.discount_percentage = 'Ingresa un porcentaje válido (1-100)'
        }
      }

      if (formData.promotion_type === 'discount_amount') {
        if (!formData.discount_amount || formData.discount_amount <= 0) {
          errors.discount_amount = 'Ingresa un monto válido mayor a 0'
        }
      }

      if (formData.promotion_type === 'buy_x_get_y') {
        if (!formData.buy_quantity || formData.buy_quantity <= 0) {
          errors.buy_quantity = 'Ingresa la cantidad a comprar'
        }
        if (!formData.get_quantity || formData.get_quantity <= 0) {
          errors.get_quantity = 'Ingresa la cantidad gratis'
        }
      }

      if (formData.promotion_type === 'points_multiplier' || formData.promotion_type === 'tier_bonus') {
        if (!formData.points_multiplier || formData.points_multiplier <= 1) {
          errors.points_multiplier = 'El multiplicador debe ser mayor a 1'
        }
      }
    }

    if (step === 2) {
      if (!formData.start_date) {
        errors.start_date = 'La fecha de inicio es requerida'
      }
      if (!formData.end_date) {
        errors.end_date = 'La fecha de fin es requerida'
      }
      if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
        errors.end_date = 'La fecha de fin debe ser posterior a la de inicio'
      }
      if (formData.days_of_week.length === 0) {
        errors.days_of_week = 'Selecciona al menos un día'
      }
    }

    if (step === 3) {
      if (formData.requires_code && !formData.promo_code.trim()) {
        errors.promo_code = 'El código promocional es requerido'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (submitForApproval: boolean) => {
    if (!validateStep(currentStep)) return

    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        days_of_week: formData.days_of_week.length === 7 ? null : formData.days_of_week,
        submit_for_approval: submitForApproval
      }

      const response = await fetch('/api/brand/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear promoción')
      }

      router.push('/brand/promotions')
    } catch (err) {
      console.error('Error creating promotion:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const renderTypeSpecificFields = () => {
    switch (formData.promotion_type) {
      case 'discount_percentage':
      case 'cashback':
      case 'volume_discount':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Porcentaje de descuento"
              type="number"
              min={1}
              max={100}
              placeholder="Ej: 15"
              value={formData.discount_percentage || ''}
              onChange={(e) => handleInputChange('discount_percentage', e.target.value ? Number(e.target.value) : null)}
              error={validationErrors.discount_percentage}
              required
            />
            <Input
              label="Descuento máximo (opcional)"
              type="number"
              min={0}
              placeholder="Ej: 500"
              value={formData.max_discount_amount || ''}
              onChange={(e) => handleInputChange('max_discount_amount', e.target.value ? Number(e.target.value) : null)}
              helperText="Monto máximo que se puede descontar"
            />
          </div>
        )

      case 'discount_amount':
        return (
          <Input
            label="Monto de descuento"
            type="number"
            min={1}
            placeholder="Ej: 100"
            value={formData.discount_amount || ''}
            onChange={(e) => handleInputChange('discount_amount', e.target.value ? Number(e.target.value) : null)}
            error={validationErrors.discount_amount}
            required
          />
        )

      case 'buy_x_get_y':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cantidad a comprar"
              type="number"
              min={1}
              placeholder="Ej: 2"
              value={formData.buy_quantity || ''}
              onChange={(e) => handleInputChange('buy_quantity', e.target.value ? Number(e.target.value) : null)}
              error={validationErrors.buy_quantity}
              required
            />
            <Input
              label="Cantidad gratis"
              type="number"
              min={1}
              placeholder="Ej: 1"
              value={formData.get_quantity || ''}
              onChange={(e) => handleInputChange('get_quantity', e.target.value ? Number(e.target.value) : null)}
              error={validationErrors.get_quantity}
              required
            />
          </div>
        )

      case 'points_multiplier':
      case 'tier_bonus':
        return (
          <Input
            label="Multiplicador de puntos"
            type="number"
            min={1.1}
            step={0.1}
            placeholder="Ej: 2"
            value={formData.points_multiplier || ''}
            onChange={(e) => handleInputChange('points_multiplier', e.target.value ? Number(e.target.value) : null)}
            error={validationErrors.points_multiplier}
            helperText="Ej: 2 = doble de puntos"
            required
          />
        )

      case 'free_product':
        return (
          <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            Esta promoción otorga un producto gratis. Podrás configurar el producto específico en las reglas de targeting.
          </p>
        )

      default:
        return null
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
        <div className="space-y-4">
          <Input
            label="Nombre de la promoción"
            placeholder="Ej: 20% de descuento en tu primera compra"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={validationErrors.name}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe los detalles de la promoción..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Promoción</h3>
        {validationErrors.promotion_type && (
          <p className="text-sm text-red-600 mb-2">{validationErrors.promotion_type}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROMOTION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleInputChange('promotion_type', type.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.promotion_type === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-gray-900">{type.label}</p>
              <p className="text-sm text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {formData.promotion_type && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Descuento</h3>
          {renderTypeSpecificFields()}

          <div className="mt-4">
            <Input
              label="Compra mínima (opcional)"
              type="number"
              min={0}
              placeholder="Ej: 500"
              value={formData.min_purchase_amount || ''}
              onChange={(e) => handleInputChange('min_purchase_amount', e.target.value ? Number(e.target.value) : null)}
              helperText="Monto mínimo de compra para aplicar la promoción"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas de Vigencia</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Fecha de inicio"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            error={validationErrors.start_date}
            required
          />
          <Input
            label="Fecha de fin"
            type="date"
            value={formData.end_date}
            onChange={(e) => handleInputChange('end_date', e.target.value)}
            error={validationErrors.end_date}
            required
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Horario (opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Hora de inicio"
            type="time"
            value={formData.start_time}
            onChange={(e) => handleInputChange('start_time', e.target.value)}
            helperText="Dejar vacío para todo el día"
          />
          <Input
            label="Hora de fin"
            type="time"
            value={formData.end_time}
            onChange={(e) => handleInputChange('end_time', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Días de la semana</h3>
        {validationErrors.days_of_week && (
          <p className="text-sm text-red-600 mb-2">{validationErrors.days_of_week}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDayOfWeek(day.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                formData.days_of_week.includes(day.value)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Límites de Uso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Por cliente (opcional)"
            type="number"
            min={1}
            placeholder="Sin límite"
            value={formData.usage_limit_per_client || ''}
            onChange={(e) => handleInputChange('usage_limit_per_client', e.target.value ? Number(e.target.value) : null)}
            helperText="Máximo usos por cliente"
          />
          <Input
            label="Total (opcional)"
            type="number"
            min={1}
            placeholder="Sin límite"
            value={formData.usage_limit_total || ''}
            onChange={(e) => handleInputChange('usage_limit_total', e.target.value ? Number(e.target.value) : null)}
            helperText="Máximo usos totales"
          />
          <Input
            label="Presupuesto (opcional)"
            type="number"
            min={0}
            placeholder="Sin límite"
            value={formData.budget_allocated || ''}
            onChange={(e) => handleInputChange('budget_allocated', e.target.value ? Number(e.target.value) : null)}
            helperText="Presupuesto máximo"
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones de Aplicación</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.auto_apply}
              onChange={(e) => handleInputChange('auto_apply', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Aplicar automáticamente</span>
              <p className="text-sm text-gray-500">La promoción se aplica sin que el cliente la solicite</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.stackable}
              onChange={(e) => handleInputChange('stackable', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Acumulable</span>
              <p className="text-sm text-gray-500">Se puede combinar con otras promociones</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.requires_code}
              onChange={(e) => handleInputChange('requires_code', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Requiere código</span>
              <p className="text-sm text-gray-500">El cliente debe ingresar un código para activar</p>
            </div>
          </label>
        </div>
      </div>

      {formData.requires_code && (
        <div>
          <Input
            label="Código promocional"
            placeholder="Ej: VERANO2024"
            value={formData.promo_code}
            onChange={(e) => handleInputChange('promo_code', e.target.value.toUpperCase())}
            error={validationErrors.promo_code}
            required
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prioridad</h3>
        <Input
          label="Nivel de prioridad"
          type="number"
          min={0}
          max={100}
          value={formData.priority}
          onChange={(e) => handleInputChange('priority', Number(e.target.value))}
          helperText="Mayor número = mayor prioridad cuando hay varias promociones"
        />
      </div>
    </div>
  )

  const renderStep4 = () => {
    const typeInfo = PROMOTION_TYPES.find(t => t.value === formData.promotion_type)

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de la Promoción</h3>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{formData.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{typeInfo?.label || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vigencia</p>
                <p className="font-medium">
                  {formData.start_date && formData.end_date
                    ? `${new Date(formData.start_date).toLocaleDateString('es-MX')} - ${new Date(formData.end_date).toLocaleDateString('es-MX')}`
                    : '-'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor</p>
                <p className="font-medium text-blue-600">
                  {formData.discount_percentage ? `${formData.discount_percentage}%` : ''}
                  {formData.discount_amount ? `$${formData.discount_amount}` : ''}
                  {formData.buy_quantity && formData.get_quantity ? `${formData.buy_quantity}x${formData.get_quantity}` : ''}
                  {formData.points_multiplier ? `x${formData.points_multiplier}` : ''}
                  {!formData.discount_percentage && !formData.discount_amount && !formData.buy_quantity && !formData.points_multiplier ? '-' : ''}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {formData.auto_apply && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Auto-aplicar</span>
                )}
                {formData.stackable && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Acumulable</span>
                )}
                {formData.requires_code && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Código: {formData.promo_code}
                  </span>
                )}
                {formData.usage_limit_total && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Límite: {formData.usage_limit_total} usos
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Términos y Condiciones</h3>
          <textarea
            rows={4}
            placeholder="Ingresa los términos y condiciones de la promoción..."
            value={formData.terms_and_conditions}
            onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Internas (opcional)</h3>
          <textarea
            rows={3}
            placeholder="Notas visibles solo para el equipo..."
            value={formData.internal_notes}
            onChange={(e) => handleInputChange('internal_notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
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
                    <Link href="/brand/promotions" className="ml-4 text-gray-400 hover:text-gray-500">
                      Promociones
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">Nueva</span>
                  </div>
                </li>
              </ol>
            </nav>
            <div className="mt-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Nueva Promoción
              </h1>
              <p className="text-gray-600 mt-1">
                Completa los pasos para configurar tu promoción
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {STEPS.map((step, stepIdx) => (
                <li key={step.id} className={`relative ${stepIdx !== STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                      disabled={currentStep < step.id}
                      className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full ${
                        currentStep > step.id
                          ? 'bg-blue-600 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </button>
                    {stepIdx !== STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <Card className="mt-12">
          <div className="p-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex space-x-3">
              <Link href="/brand/promotions">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                  >
                    {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Guardar Borrador
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={submitting}
                  >
                    {submitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    Enviar a Aprobación
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
