'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Select, Textarea } from '@/components/ui/form'
import { ArrowLeft, MapPin, Play } from 'lucide-react'

interface Client {
  id: string
  public_id: string
  business_name: string
  owner_name?: string
  address: string
  phone: string
  brands: Array<{ id: string; name: string; logo_url: string | null }>
}

interface LocationData {
  latitude: number
  longitude: number
}

export default function NuevaVisitaPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  // Get selected client info
  const selectedClient = clients.find(c => c.id === selectedClientId)

  // Fetch assigned clients
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/asesor/clients')
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Error al cargar clientes')
        }
        const data = await response.json()
        setClients(data.clients || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar clientes')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])


  // Get current location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalización no soportada en este navegador')
      return
    }

    setGettingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setGettingLocation(false)
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Permiso de ubicación denegado'
            : 'Error al obtener ubicación'
        )
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      setError('Por favor selecciona un cliente')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/asesor/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClientId,
          advisor_notes: notes || undefined,
          latitude: location?.latitude,
          longitude: location?.longitude
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la visita')
      }

      // Navigate to the new visit
      router.push(`/asesor/visitas/${data.visit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la visita')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Nueva Visita</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Iniciar una nueva visita</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {clients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  No tienes clientes asignados. Contacta a tu supervisor para que te asigne clientes.
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                  Volver
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Client Selection */}
                <Select
                  label="Cliente"
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  options={clients.map(c => ({
                    value: c.id,
                    label: `${c.business_name} - ${c.address}`
                  }))}
                  placeholder="Selecciona un cliente"
                />

                {/* Selected client info */}
                {selectedClient && (
                  <div className="p-3 bg-gray-50 rounded-md text-sm">
                    <p className="font-medium">{selectedClient.business_name}</p>
                    {selectedClient.owner_name && (
                      <p className="text-gray-600">Propietario: {selectedClient.owner_name}</p>
                    )}
                    <p className="text-gray-500">{selectedClient.address}</p>
                    {selectedClient.phone && (
                      <p className="text-gray-500">Tel: {selectedClient.phone}</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <Textarea
                  label="Notas (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agrega notas sobre la visita..."
                  rows={3}
                />

                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  {location ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center text-green-700">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          Ubicación capturada ({location.latitude.toFixed(6)}, {location.longitude.toFixed(6)})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={getLocation}
                        disabled={gettingLocation}
                      >
                        Actualizar
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getLocation}
                        disabled={gettingLocation}
                        className="w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {gettingLocation ? 'Obteniendo ubicación...' : 'Capturar ubicación actual'}
                      </Button>
                      {locationError && (
                        <p className="mt-1 text-sm text-red-600">{locationError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        La ubicación es opcional pero ayuda a verificar la visita
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={submitting || !selectedClientId}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {submitting ? 'Iniciando visita...' : 'Iniciar Visita'}
                  </Button>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Al iniciar la visita se registrará la hora de inicio automáticamente
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
