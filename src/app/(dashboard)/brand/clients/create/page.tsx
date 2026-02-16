'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBrandFetch } from '@/hooks/useBrandFetch'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { ArrowLeft } from 'lucide-react'

interface ClientCreateForm {
  business_name: string
  legal_name: string
  owner_name: string
  email: string
  phone: string
  whatsapp: string
  address_street: string
  address_neighborhood: string
  address_city: string
  address_state: string
  address_postal_code: string
  address_country: string
}

const MEXICAN_STATES = [
  { value: 'AG', label: 'Aguascalientes' },
  { value: 'BC', label: 'Baja California' },
  { value: 'BS', label: 'Baja California Sur' },
  { value: 'CM', label: 'Campeche' },
  { value: 'CO', label: 'Coahuila' },
  { value: 'CL', label: 'Colima' },
  { value: 'CS', label: 'Chiapas' },
  { value: 'CH', label: 'Chihuahua' },
  { value: 'DF', label: 'Ciudad de México' },
  { value: 'DG', label: 'Durango' },
  { value: 'GT', label: 'Guanajuato' },
  { value: 'GR', label: 'Guerrero' },
  { value: 'HG', label: 'Hidalgo' },
  { value: 'JA', label: 'Jalisco' },
  { value: 'MX', label: 'Estado de México' },
  { value: 'MI', label: 'Michoacán' },
  { value: 'MO', label: 'Morelos' },
  { value: 'NA', label: 'Nayarit' },
  { value: 'NL', label: 'Nuevo León' },
  { value: 'OA', label: 'Oaxaca' },
  { value: 'PU', label: 'Puebla' },
  { value: 'QT', label: 'Querétaro' },
  { value: 'QR', label: 'Quintana Roo' },
  { value: 'SL', label: 'San Luis Potosí' },
  { value: 'SI', label: 'Sinaloa' },
  { value: 'SO', label: 'Sonora' },
  { value: 'TB', label: 'Tabasco' },
  { value: 'TM', label: 'Tamaulipas' },
  { value: 'TL', label: 'Tlaxcala' },
  { value: 'VE', label: 'Veracruz' },
  { value: 'YU', label: 'Yucatán' },
  { value: 'ZA', label: 'Zacatecas' }
]

export default function BrandCreateClientPage() {
  const router = useRouter()
  const { brandFetch } = useBrandFetch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<ClientCreateForm>({
    business_name: '',
    legal_name: '',
    owner_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address_street: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country: 'MX'
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ClientCreateForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.business_name.trim()) {
      errors.business_name = 'El nombre del negocio es requerido'
    }
    if (!formData.owner_name.trim()) {
      errors.owner_name = 'El nombre del propietario es requerido'
    }
    if (!formData.address_street.trim()) {
      errors.address_street = 'La dirección es requerida'
    }
    if (!formData.address_city.trim()) {
      errors.address_city = 'La ciudad es requerida'
    }
    if (!formData.address_state.trim()) {
      errors.address_state = 'El estado es requerido'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await brandFetch('/api/brand/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          const errors: Record<string, string> = {}
          result.details.forEach((detail: { field: string; message: string }) => {
            errors[detail.field] = detail.message
          })
          setValidationErrors(errors)
          setError('Por favor corrige los errores en el formulario')
        } else {
          setError(result.error || 'Error al crear el cliente')
        }
        return
      }

      router.push('/brand/clients')
    } catch (err) {
      console.error('Error creating client:', err)
      setError('Error al crear el cliente. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registrar Cliente</h1>
              <p className="text-sm text-gray-600 mt-1">
                Agrega un nuevo cliente a tu marca
              </p>
            </div>
            <Link href="/brand/clients">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Negocio</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.business_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Abarrotes La Esquina"
                  />
                  {validationErrors.business_name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.business_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    value={formData.legal_name}
                    onChange={(e) => handleInputChange('legal_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre legal de la empresa (opcional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Propietario *
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.owner_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre completo del dueño"
                  />
                  {validationErrors.owner_name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.owner_name}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="correo@ejemplo.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+52 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Ubicación */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address_street}
                    onChange={(e) => handleInputChange('address_street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.address_street ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Calle, número y referencias"
                  />
                  {validationErrors.address_street && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address_street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia/Barrio
                  </label>
                  <input
                    type="text"
                    value={formData.address_neighborhood}
                    onChange={(e) => handleInputChange('address_neighborhood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre de la colonia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.address_city}
                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.address_city ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ciudad"
                  />
                  {validationErrors.address_city && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address_city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.address_state}
                    onChange={(e) => handleInputChange('address_state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.address_state ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar estado</option>
                    {MEXICAN_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.address_state && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address_state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.address_postal_code}
                    onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                    maxLength={5}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/brand/clients">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
