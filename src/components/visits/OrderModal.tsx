'use client'

import { useEffect } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onOrderCreated?: (orderId: string) => void
  clientId: string
  visitId: string
}

export function OrderModal({
  isOpen,
  onClose,
  onOrderCreated,
  clientId,
  visitId
}: OrderModalProps) {
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
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 sm:inset-8 md:inset-12 lg:inset-20 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Crear Nueva Orden
              </h2>
              <p className="text-sm text-gray-500">
                Levantamiento de pedido durante la visita
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - iframe to order creation page or embedded form */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Placeholder for order form */}
            {/* In a real implementation, you would either:
                1. Embed the OrderForm component directly here
                2. Use an iframe to the order creation page
                3. Create a simplified inline order form */}

            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Formulario de Orden
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Aquí se integrará el formulario completo de creación de órdenes
                con los productos disponibles para el cliente.
              </p>

              <div className="space-y-4 max-w-md mx-auto text-left">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Cliente ID:</p>
                  <p className="text-sm font-mono text-gray-700">{clientId}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Visita ID:</p>
                  <p className="text-sm font-mono text-gray-700">{visitId}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Simulate order creation
                    const mockOrderId = `order-${Date.now()}`
                    onOrderCreated?.(mockOrderId)
                    onClose()
                  }}
                >
                  Crear Orden (Demo)
                </Button>
              </div>
            </div>

            {/* Note about integration */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700">
                <strong>Nota de integración:</strong> Este modal se conectará con el sistema
                de órdenes existente. Las órdenes creadas aquí se vincularán automáticamente
                con la visita actual y se registrarán en la tabla <code>orders</code> con
                referencia al <code>visit_id</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
