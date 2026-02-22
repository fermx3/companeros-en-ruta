'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { Award, X } from 'lucide-react'
import type { BrandTier } from './types'

interface TierAssignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tierId: string) => void
  tiers: BrandTier[]
  membershipName: string
  saving: boolean
}

export function TierAssignModal({
  isOpen,
  onClose,
  onSubmit,
  tiers,
  membershipName,
  saving
}: TierAssignModalProps) {
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
