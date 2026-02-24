'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { X, ShoppingCart, Plus, Minus, Trash2, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface EditOrderData {
  distributor_id: string
  payment_method: string
  order_notes: string
  items: CartItem[]
}

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onOrderCreated?: (orderId: string) => void
  clientId: string
  visitId: string
  brandId?: string
  editOrderId?: string | null
  editOrderData?: EditOrderData | null
}

interface ProductVariant {
  id: string
  variant_name: string
  size_value: string | null
  size_unit: string | null
  price: number
  suggested_price: number
}

interface Product {
  id: string
  name: string
  sku: string
  code: string
  brand_id: string
  base_price: number
  product_variants: ProductVariant[]
}

interface Distributor {
  id: string
  name: string
  contact_name: string | null
  contact_phone: string | null
}

export interface CartItem {
  product_id: string
  product_variant_id: string | null
  name: string
  variant_name: string | null
  quantity: number
  unit_price: number
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'credit', label: 'Crédito' },
  { value: 'check', label: 'Cheque' },
  { value: 'card', label: 'Tarjeta' },
] as const

export function OrderModal({
  isOpen,
  onClose,
  onOrderCreated,
  clientId,
  visitId,
  brandId,
  editOrderId,
  editOrderData
}: OrderModalProps) {
  const isEditMode = Boolean(editOrderId)
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [selectedDistributorId, setSelectedDistributorId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [orderNotes, setOrderNotes] = useState('')
  const [loadingDistributors, setLoadingDistributors] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart'>('catalog')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, submitting])

  // Load distributors when modal opens
  useEffect(() => {
    if (!isOpen || !brandId) return
    setLoadingDistributors(true)
    fetch(`/api/promotor/distributors?brand_id=${brandId}`)
      .then(res => res.json())
      .then(data => setDistributors(data.distributors || []))
      .catch(() => setDistributors([]))
      .finally(() => setLoadingDistributors(false))
  }, [isOpen, brandId])

  // Load products when modal opens
  useEffect(() => {
    if (!isOpen || !brandId) return
    setLoadingProducts(true)
    fetch(`/api/brand/products?brand_id=${brandId}`)
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [isOpen, brandId])

  // Reset state when modal closes, or pre-populate in edit mode when it opens
  useEffect(() => {
    if (!isOpen) {
      setCart([])
      setSelectedDistributorId('')
      setSearchQuery('')
      setPaymentMethod('cash')
      setOrderNotes('')
      setError(null)
      setActiveTab('catalog')
    } else if (editOrderData) {
      setSelectedDistributorId(editOrderData.distributor_id)
      setPaymentMethod(editOrderData.payment_method || 'cash')
      setOrderNotes(editOrderData.order_notes || '')
      setCart(editOrderData.items)
      setActiveTab('cart')
    }
  }, [isOpen, editOrderData])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const q = searchQuery.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    )
  }, [products, searchQuery])

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [cart]
  )

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    const productId = product.id
    const variantId = variant?.id || null
    const price = variant?.price ?? product.base_price
    const variantName = variant ? variant.variant_name : null

    setCart(prev => {
      // Check if already in cart (same product + variant)
      const existingIndex = prev.findIndex(
        item => item.product_id === productId && item.product_variant_id === variantId
      )
      if (existingIndex >= 0) {
        return prev.map((item, i) =>
          i === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, {
        product_id: productId,
        product_variant_id: variantId,
        name: product.name,
        variant_name: variantName,
        quantity: 1,
        unit_price: price,
      }]
    })
  }, [])

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart(prev => {
      const item = prev[index]
      const newQty = item.quantity + delta
      if (newQty <= 0) return prev.filter((_, i) => i !== index)
      return prev.map((item, i) =>
        i === index ? { ...item, quantity: newQty } : item
      )
    })
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = async () => {
    if (!selectedDistributorId || cart.length === 0) return
    setSubmitting(true)
    setError(null)

    try {
      // In edit mode, delete the old order first
      if (editOrderId) {
        const deleteRes = await fetch(
          `/api/promotor/visits/${visitId}/orders?order_id=${editOrderId}`,
          { method: 'DELETE' }
        )
        if (!deleteRes.ok) {
          const deleteResult = await deleteRes.json()
          throw new Error(deleteResult.error || 'Error al actualizar la orden')
        }
      }

      const response = await fetch(`/api/promotor/visits/${visitId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributor_id: selectedDistributorId,
          payment_method: paymentMethod,
          order_notes: orderNotes || undefined,
          items: cart.map(item => ({
            product_id: item.product_id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la orden')
      }

      onOrderCreated?.(result.order_id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (!brandId) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="absolute inset-4 sm:inset-8 md:inset-12 lg:inset-20 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Crear Nueva Orden</h2>
            <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se puede crear orden sin marca asociada a la visita.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={submitting ? undefined : onClose} />

      <div className="absolute inset-0 sm:inset-2 md:inset-8 lg:inset-12 bg-white sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                {isEditMode ? 'Editar Orden' : 'Crear Nueva Orden'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Levantamiento de pedido durante la visita
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Distributor selector */}
        <div className="px-4 sm:px-6 py-3 border-b bg-gray-50 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distribuidor <span className="text-red-500">*</span>
          </label>
          {loadingDistributors ? (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando distribuidores...
            </div>
          ) : distributors.length === 0 ? (
            <p className="text-sm text-amber-600">
              No hay distribuidores configurados para esta marca
            </p>
          ) : (
            <select
              value={selectedDistributorId}
              onChange={e => setSelectedDistributorId(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[300px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar distribuidor...</option>
              {distributors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 sm:px-6 py-2 bg-red-50 border-b border-red-200 flex-shrink-0">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Mobile tab bar */}
        <div className="flex md:hidden border-b bg-gray-50 px-4 py-2 flex-shrink-0">
          <div className="flex w-full rounded-lg bg-gray-200 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={cn(
                'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'catalog'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              )}
            >
              Productos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={cn(
                'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'cart'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              )}
            >
              Carrito
              {cart.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center bg-blue-600 text-white text-xs font-medium w-5 h-5 rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content: catalog + cart */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Catalog panel */}
          <div className={cn(
            'flex-1 flex-col overflow-hidden md:border-r',
            activeTab === 'catalog' ? 'flex' : 'hidden md:flex'
          )}>
            {/* Search */}
            <div className="px-4 sm:px-6 py-3 border-b flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar producto por nombre o código..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-auto p-4 sm:px-6">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Cargando productos...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart panel */}
          <div className={cn(
            'w-full md:w-[360px] lg:w-[400px] flex-col overflow-hidden bg-gray-50',
            activeTab === 'cart' ? 'flex' : 'hidden md:flex'
          )}>
            <div className="px-4 sm:px-6 py-3 border-b bg-white flex-shrink-0">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrito
                {cart.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </h3>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Agrega productos al carrito
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product_id}-${item.product_variant_id || 'base'}`}
                      className="bg-white rounded-lg p-3 shadow-sm border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          {item.variant_name && (
                            <p className="text-xs text-gray-500">{item.variant_name}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="ml-2 p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, -1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, 1)}
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            ${item.unit_price.toFixed(2)} c/u
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer: payment method, notes, total, submit */}
            <div className="px-4 py-3 border-t bg-white flex-shrink-0 space-y-3">
              {cart.length > 0 && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Método de pago
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PAYMENT_METHODS.map(pm => (
                        <option key={pm.value} value={pm.value}>{pm.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={e => setOrderNotes(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Instrucciones especiales..."
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm font-medium text-gray-700">Subtotal</span>
                <span className="text-lg font-bold text-gray-900">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0 || !selectedDistributorId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {isEditMode ? 'Guardando...' : 'Creando...'}
                    </>
                  ) : (
                    isEditMode ? 'Guardar Cambios' : 'Crear Orden'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating cart summary bar on mobile (catalog tab with items) */}
        {activeTab === 'catalog' && cart.length > 0 && (
          <div className="md:hidden flex-shrink-0 border-t bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className="w-full flex items-center justify-between bg-blue-600 text-white rounded-lg px-4 py-2.5 active:bg-blue-700 transition-colors"
            >
              <span className="flex items-center text-sm font-medium">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ver carrito ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </span>
              <span className="text-sm font-bold">${cartTotal.toFixed(2)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Product card sub-component
function ProductCard({
  product,
  onAdd
}: {
  product: Product
  onAdd: (product: Product, variant?: ProductVariant) => void
}) {
  const hasVariants = product.product_variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState(
    hasVariants ? product.product_variants[0]?.id : undefined
  )

  const selectedVariant = hasVariants
    ? product.product_variants.find(v => v.id === selectedVariantId)
    : undefined

  const displayPrice = selectedVariant?.price ?? product.base_price

  return (
    <div className="flex items-center p-3 bg-white rounded-lg border hover:border-blue-200 transition-colors">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.code || product.sku}</p>
        {hasVariants && (
          <select
            value={selectedVariantId}
            onChange={e => setSelectedVariantId(e.target.value)}
            className="mt-1 w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {product.product_variants.map(v => (
              <option key={v.id} value={v.id}>
                {v.variant_name}
                {v.size_value ? ` - ${v.size_value}${v.size_unit || ''}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          ${displayPrice.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={() => onAdd(product, selectedVariant)}
          className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
