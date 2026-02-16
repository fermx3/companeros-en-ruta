'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ArrowLeft, MapPin, Play } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'

interface Client {
  id: string
  public_id: string
  business_name: string
  owner_name?: string
  address: string
  phone: string
  brands: Array<{ id: string; name: string; logo_url: string | null }>
}

/**
 * Zod schema for visit form validation
 */
const visitFormSchema = z.object({
  client_id: z.string().min(1, 'Debes seleccionar un cliente'),
  promotor_notes: z.string().optional(),
})

type VisitFormValues = z.infer<typeof visitFormSchema>

export default function NuevaVisitaPage() {
  // Role protection is handled by the layout (promotor/layout.tsx)
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Location (separate from form)
  const { location, loading: gettingLocation, error: locationError, getLocation } = useGeolocation()

  // Initialize React Hook Form with Zod validation
  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitFormSchema),
    defaultValues: {
      client_id: '',
      promotor_notes: '',
    },
  })

  // Watch client_id to show selected client info
  const selectedClientId = form.watch('client_id')
  const selectedClient = clients.find(c => c.id === selectedClientId)

  // Fetch assigned clients
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/promotor/clients')
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


  /**
   * Handle form submission
   * Creates a new visit with the provided data
   */
  const onSubmit = async (values: VisitFormValues) => {
    setError(null)

    try {
      const response = await fetch('/api/promotor/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: values.client_id,
          promotor_notes: values.promotor_notes || undefined,
          latitude: location?.latitude,
          longitude: location?.longitude
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la visita')
      }

      // Navigate to the new visit
      router.push(`/promotor/visitas/${data.visit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la visita')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="h-8 bg-muted rounded-lg w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-10 bg-muted rounded-xl animate-pulse"></div>
                <div className="h-10 bg-muted rounded-xl animate-pulse"></div>
                <div className="h-20 bg-muted rounded-xl animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header con diseño moderno */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nueva Visita</h1>
              <p className="text-sm text-muted-foreground">Iniciar visita a cliente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Iniciar Visita</CardTitle>
                <p className="text-sm text-muted-foreground">Completa la información para comenzar</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">!</span>
                </div>
                <p>{error}</p>
              </div>
            )}

            {clients.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-6">
                  No tienes clientes asignados. Contacta a tu supervisor para que te asigne clientes.
                </p>
                <Button variant="outline" onClick={() => router.back()} className="rounded-xl">
                  Volver
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Client Selection */}
                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Select {...field}>
                            <option value="">Selecciona un cliente</option>
                            {clients.map((client) => (
                              <option key={client.id} value={client.id}>
                                {client.business_name} - {client.address}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Selected client info */}
                  {selectedClient && (
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl space-y-2 border border-primary/20">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <p className="font-semibold text-gray-900">{selectedClient.business_name}</p>
                          </div>
                          {selectedClient.owner_name && (
                            <p className="text-sm text-gray-700 pl-10">
                              <span className="font-medium">Propietario:</span> {selectedClient.owner_name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 pl-10">{selectedClient.address}</p>
                          {selectedClient.phone && (
                            <p className="text-sm text-gray-600 pl-10">
                              <span className="font-medium">Tel:</span> {selectedClient.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="promotor_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Agrega notas sobre la visita..."
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Notas que quieras agregar antes de iniciar la visita
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <div className="space-y-3">
                    <FormLabel>Ubicación</FormLabel>
                    {location ? (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center text-green-700 gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Ubicación capturada</p>
                            <p className="text-xs opacity-75">
                              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={getLocation}
                          disabled={gettingLocation}
                          className="rounded-xl"
                        >
                          Actualizar
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getLocation}
                          disabled={gettingLocation}
                          className="w-full h-12 rounded-xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <MapPin className="h-5 w-5 mr-2" />
                          {gettingLocation ? 'Obteniendo ubicación...' : 'Capturar ubicación actual'}
                        </Button>
                        {locationError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{locationError}</p>
                          </div>
                        )}
                        <FormDescription>
                          La ubicación es opcional pero ayuda a verificar la visita
                        </FormDescription>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-6 border-t space-y-4">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-base"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {form.formState.isSubmitting ? 'Iniciando visita...' : 'Iniciar Visita'}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Al iniciar la visita se registrará la hora de inicio automáticamente
                    </p>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
