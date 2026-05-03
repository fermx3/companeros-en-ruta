'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import type { PointsOperationData, PointsModalMembership } from './types'

interface PointsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PointsOperationData) => void
  membership: PointsModalMembership | null
  saving: boolean
}

export function PointsModal({
  isOpen,
  onClose,
  onSubmit,
  membership,
  saving
}: PointsModalProps) {
  const [transactionType, setTransactionType] = useState<'award' | 'deduct'>('award')
  const [pointsAmount, setPointsAmount] = useState('')
  const [description, setDescription] = useState('')

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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de puntos</label>
            <input
              type="number"
              onFocus={(e) => e.target.select()}
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
