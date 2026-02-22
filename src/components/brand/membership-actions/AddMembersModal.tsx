'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { Search, X } from 'lucide-react'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { fullOwnerName } from '@/lib/utils/client'

interface AvailableClient {
  id: string
  public_id: string
  business_name: string
  owner_name: string | null
  owner_last_name: string | null
  email: string | null
}

interface AddMembersModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (clientIds: string[]) => void
  saving: boolean
}

export function AddMembersModal({
  isOpen,
  onClose,
  onSubmit,
  saving
}: AddMembersModalProps) {
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
                    <p className="font-medium text-gray-900 truncate">{client.business_name || fullOwnerName(client.owner_name, client.owner_last_name)}</p>
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
