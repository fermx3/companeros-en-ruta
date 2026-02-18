'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/ui/phone-input'
import { isValidMxPhone, displayPhone } from '@/lib/utils/phone'
import {
  Store,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Building2,
  Star,
  ShoppingCart,
  Calendar,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ClientProfile {
  id: string
  public_id: string
  business_name: string
  legal_name: string | null
  owner_name: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  address_street: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  address_postal_code: string | null
  status: string
  zone_name: string | null
  market_name: string | null
  client_type_name: string | null
  total_points: number
  total_orders: number
  last_order_date: string | null
  last_visit_date: string | null
  created_at: string
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-900">{value || '—'}</span>
    </div>
  )
}

export default function ClientProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/client/profile')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al cargar perfil')
      }

      const data: ClientProfile = await res.json()
      setProfile(data)
      setPhone(data.phone || '')
      setWhatsapp(data.whatsapp || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/client/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, whatsapp }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }
      setProfile((prev) => prev ? { ...prev, phone, whatsapp } : prev)
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setPhone(profile?.phone || '')
    setWhatsapp(profile?.whatsapp || '')
    setSaveError(null)
    setEditing(false)
  }

  const canSave = isValidMxPhone(phone) && isValidMxPhone(whatsapp)

  const formatAddress = (p: ClientProfile) => {
    const parts = [
      p.address_street,
      p.address_neighborhood,
      p.address_city,
      p.address_state,
      p.address_postal_code,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  // --- Loading ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
          <div className="h-24 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error al cargar el perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={loadData} variant="outline">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2196F3] to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Store className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{profile.business_name}</h1>
              <p className="text-blue-100 text-sm">{profile.public_id} · {profile.client_type_name || 'Cliente'}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900">{profile.total_points.toLocaleString()}</span>
              <span className="text-xs text-gray-500 text-center">Puntos</span>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <span className="text-lg font-bold text-gray-900">{profile.total_orders}</span>
              <span className="text-xs text-gray-500 text-center">Pedidos</span>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center gap-1">
              <Calendar className="h-5 w-5 text-green-500" />
              <span className="text-sm font-bold text-gray-900">
                {format(new Date(profile.created_at), 'MMM yy', { locale: es })}
              </span>
              <span className="text-xs text-gray-500 text-center">Miembro desde</span>
            </CardContent>
          </Card>
        </div>

        {/* Información del negocio */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Información del negocio
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow label="Nombre del negocio" value={profile.business_name} />
            <InfoRow label="Razón social" value={profile.legal_name} />
            <InfoRow label="Propietario" value={profile.owner_name} />
            <InfoRow label="Tipo de cliente" value={profile.client_type_name} />
            <InfoRow label="Mercado" value={profile.market_name} />
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Contacto
                </CardTitle>
              </div>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Email — siempre read-only */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Correo</span>
                <span className="text-sm text-gray-900 truncate">{profile.email || '—'}</span>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                {editing ? (
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    label="Teléfono"
                    id="phone"
                  />
                ) : (
                  <>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Teléfono</span>
                    <span className="text-sm text-gray-900">{profile.phone ? displayPhone(profile.phone) : '—'}</span>
                  </>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                {editing ? (
                  <PhoneInput
                    value={whatsapp}
                    onChange={setWhatsapp}
                    label="WhatsApp"
                    id="whatsapp"
                  />
                ) : (
                  <>
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">WhatsApp</span>
                    <span className="text-sm text-gray-900">{profile.whatsapp ? displayPhone(profile.whatsapp) : '—'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Botones guardar/cancelar */}
            {editing && (
              <div className="flex flex-col gap-2 pt-1">
                {saveError && (
                  <p className="text-xs text-red-600">{saveError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !canSave}
                    size="sm"
                    className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Ubicación
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow label="Zona" value={profile.zone_name} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dirección</span>
              {formatAddress(profile) ? (
                <div className="text-sm text-gray-900 space-y-0.5">
                  {profile.address_street && <p>{profile.address_street}</p>}
                  {(profile.address_neighborhood || profile.address_city) && (
                    <p>{[profile.address_neighborhood, profile.address_city].filter(Boolean).join(', ')}</p>
                  )}
                  {(profile.address_state || profile.address_postal_code) && (
                    <p>{[profile.address_state, profile.address_postal_code ? `C.P. ${profile.address_postal_code}` : null].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-900">—</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        {(profile.last_visit_date || profile.last_order_date) && (
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Actividad reciente
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {profile.last_visit_date && (
                <InfoRow
                  label="Última visita"
                  value={format(new Date(profile.last_visit_date), "d 'de' MMMM yyyy", { locale: es })}
                />
              )}
              {profile.last_order_date && (
                <InfoRow
                  label="Último pedido"
                  value={format(new Date(profile.last_order_date), "d 'de' MMMM yyyy", { locale: es })}
                />
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
