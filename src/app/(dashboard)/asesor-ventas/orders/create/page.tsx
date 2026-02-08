'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, Alert } from '@/components/ui/feedback'
import {
  ShoppingBag,
  Building2,
  Package,
  Plus,
  Minus,
  Trash2,
  Search,
  ChevronLeft,
  Check
} from 'lucide-react'

interface Client {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  email: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
}

interface Product {
  id: string
  public_id: string
  name: string
  sku: string
  description: string | null
  base_price: number
  unit_type: string
  product_image_url: string | null
  category: {
    id: string
    name: string
  } | null
  brand: {
    id: string
    name: string
  } | null
}

interface OrderItem {
  product_id: string
  product: Product
  quantity: number
  unit_price: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export default function CreateOrderPage() {
  const router = useRouter()

  // State management
  const [step, setStep] = useState<'client' | 'products' | 'review'>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Data
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')

  // Additional order details
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [clientNotes, setClientNotes] = useState('')

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch('/api/asesor-ventas/clients')
        if (!response.ok) {
          throw new Error('Error al cargar clientes')
        }
        const data = await response.json()
        setClients(data.clients || [])
      } catch (err) {
        console.error('Error loading clients:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoadingClients(false)
      }
    }
    loadClients()
  }, [])

  // Load products when moving to products step
  useEffect(() => {
    if (step === 'products' && selectedClient) {
      loadProducts()
    }
  }, [step, selectedClient])

  const loadProducts = async () => {
    if (!selectedClient) return

    setLoadingProducts(true)
    try {
      const params = new URLSearchParams()
      params.set('client_id', selectedClient.id)
      if (productSearch) {
        params.set('search', productSearch)
      }
      const response = await fetch(`/api/asesor-ventas/products?${params}`)
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client)
    // Reset products when client changes (different client may have different brand subscriptions)
    setProducts([])
    setOrderItems([])
    // Pre-fill delivery address from client
    if (client.address_street) {
      setDeliveryAddress(`${client.address_street}${client.address_city ? `, ${client.address_city}` : ''}`)
    }
    setStep('products')
  }

  const handleAddProduct = (product: Product) => {
    const existingItem = orderItems.find(item => item.product_id === product.id)
    if (existingItem) {
      setOrderItems(items =>
        items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setOrderItems(items => [
        ...items,
        {
          product_id: product.id,
          product,
          quantity: 1,
          unit_price: product.base_price
        }
      ])
    }
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setOrderItems(items =>
      items.map(item => {
        if (item.product_id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta)
          return { ...item, quantity: newQuantity }
        }
        return item
      }).filter(item => item.quantity > 0)
    )
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems(items => items.filter(item => item.product_id !== productId))
  }

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setOrderItems(items =>
      items.map(item =>
        item.product_id === productId
          ? { ...item, unit_price: newPrice }
          : item
      )
    )
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const handleSubmitOrder = async () => {
    if (!selectedClient || orderItems.length === 0) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/asesor-ventas/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: selectedClient.id,
          items: orderItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            unit_type: item.product.unit_type
          })),
          delivery_address: deliveryAddress || null,
          delivery_instructions: deliveryInstructions || null,
          client_notes: clientNotes || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la orden')
      }

      const data = await response.json()
      router.push(`/asesor-ventas/orders/${data.order.public_id}`)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.business_name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (client.owner_name && client.owner_name.toLowerCase().includes(clientSearch.toLowerCase()))
  )

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  )

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
                <li>
                  <Link href="/asesor-ventas/orders" className="text-gray-500 hover:text-gray-700">
                    Ordenes
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Nueva Orden</li>
              </ol>
            </nav>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                  Nueva Orden
                </h1>
                <p className="text-gray-600 mt-1">
                  {step === 'client' && 'Paso 1: Selecciona un cliente'}
                  {step === 'products' && 'Paso 2: Agrega productos'}
                  {step === 'review' && 'Paso 3: Revisa y confirma'}
                </p>
              </div>
              <Link href="/asesor-ventas/orders">
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </Link>
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

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'client' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'client' ? 'bg-emerald-600 text-white' :
                (step === 'products' || step === 'review') ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200'
              }`}>
                {(step === 'products' || step === 'review') ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="ml-2 font-medium">Cliente</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200" />
            <div className={`flex items-center ${step === 'products' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'products' ? 'bg-emerald-600 text-white' :
                step === 'review' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200'
              }`}>
                {step === 'review' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="ml-2 font-medium">Productos</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200" />
            <div className={`flex items-center ${step === 'review' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'review' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmar</span>
            </div>
          </div>
        </div>

        {/* Step 1: Client Selection */}
        {step === 'client' && (
          <div>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {loadingClients ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Cargando clientes...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
                  <p className="text-gray-500">
                    {clientSearch ? 'No se encontraron clientes con ese nombre.' : 'No tienes clientes asignados.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClients.map(client => (
                  <Card
                    key={client.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectClient(client)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {client.business_name}
                          </h3>
                          {client.owner_name && (
                            <p className="text-sm text-gray-600 truncate">{client.owner_name}</p>
                          )}
                          {client.address_city && (
                            <p className="text-xs text-gray-400 mt-1">{client.address_city}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Product Selection */}
        {step === 'products' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Products List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos Disponibles
                  </CardTitle>
                  <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="text-center py-8">
                      <LoadingSpinner size="md" className="mx-auto mb-2" />
                      <p className="text-gray-600">Cargando productos...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay productos disponibles</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredProducts.map(product => {
                        const inCart = orderItems.find(item => item.product_id === product.id)
                        return (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{product.sku}</span>
                                {product.brand && (
                                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                                    {product.brand.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-emerald-600">
                                {formatCurrency(product.base_price)} / {product.unit_type}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={inCart ? 'outline' : 'default'}
                              className={inCart ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
                              onClick={() => handleAddProduct(product)}
                            >
                              <Plus className="h-4 w-4" />
                              {inCart && <span className="ml-1">({inCart.quantity})</span>}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Resumen de Orden
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Selected Client */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Cliente</p>
                    <p className="font-medium text-gray-900">{selectedClient?.business_name}</p>
                    <button
                      className="text-xs text-emerald-600 hover:underline mt-1"
                      onClick={() => setStep('client')}
                    >
                      Cambiar cliente
                    </button>
                  </div>

                  {/* Order Items */}
                  {orderItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Agrega productos a tu orden</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {orderItems.map(item => (
                        <div key={item.product_id} className="flex items-start gap-2 pb-3 border-b">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                className="p-1 hover:bg-gray-100 rounded"
                                onClick={() => handleUpdateQuantity(item.product_id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm w-8 text-center">{item.quantity}</span>
                              <button
                                className="p-1 hover:bg-gray-100 rounded"
                                onClick={() => handleUpdateQuantity(item.product_id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <span className="text-xs text-gray-500">x</span>
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => handleUpdatePrice(item.product_id, parseFloat(e.target.value) || 0)}
                                className="w-20 text-sm px-2 py-1 border rounded"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(item.quantity * item.unit_price)}
                            </p>
                            <button
                              className="text-red-500 hover:text-red-700 mt-1"
                              onClick={() => handleRemoveItem(item.product_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between py-3 border-t font-bold">
                    <span>Total</span>
                    <span className="text-lg text-emerald-600">{formatCurrency(calculateTotal())}</span>
                  </div>

                  {/* Continue Button */}
                  <Button
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                    disabled={orderItems.length === 0}
                    onClick={() => setStep('review')}
                  >
                    Continuar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Review and Confirm */}
        {step === 'review' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Confirmar Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Cliente
                  </h3>
                  <p className="text-gray-700">{selectedClient?.business_name}</p>
                  {selectedClient?.owner_name && (
                    <p className="text-sm text-gray-500">{selectedClient.owner_name}</p>
                  )}
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Productos ({orderItems.length})
                  </h3>
                  <div className="border rounded-lg divide-y">
                    {orderItems.map(item => (
                      <div key={item.product_id} className="p-3 flex justify-between">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.quantity * item.unit_price)}</p>
                      </div>
                    ))}
                    <div className="p-3 flex justify-between font-bold bg-gray-50">
                      <span>Total</span>
                      <span className="text-emerald-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direccion de Entrega
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Direccion de entrega..."
                  />
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones de Entrega (opcional)
                  </label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Instrucciones especiales..."
                  />
                </div>

                {/* Client Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas del Cliente (opcional)
                  </label>
                  <textarea
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Notas adicionales..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep('products')}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Crear Orden
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
