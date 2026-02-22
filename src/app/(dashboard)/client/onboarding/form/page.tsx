'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/components/ui/toaster'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'

// ---------- Schema ----------

const formSchema = z.object({
  // Step 1: Personal & Business
  owner_name: z.string().min(1, 'Nombre es requerido'),
  owner_last_name: z.string().optional(),
  gender: z.enum(['masculino', 'femenino', 'otro', 'prefiero_no_decir']).optional(),
  date_of_birth: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  email_opt_in: z.boolean().optional(),
  whatsapp: z.string().optional(),
  whatsapp_opt_in: z.boolean().optional(),
  client_type_id: z.string().optional(),
  address_state: z.string().optional(),
  address_postal_code: z.string().optional(),
  has_meat_fridge: z.boolean().optional(),
  has_soda_fridge: z.boolean().optional(),
  accepts_card: z.boolean().optional(),

  // Step 2: Survey
  employees: z.string().optional(),
  offers_topups: z.boolean().optional(),
  supply_sources: z.array(z.string()).optional(),
  digital_restock: z.boolean().optional(),
  digital_restock_detail: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface ClientType {
  id: string
  name: string
  code: string
}

// ---------- Components ----------

function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
      <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
    </div>
  )
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  )
}

function ToggleButton({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean | undefined
  onChange: (val: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
        checked
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
        }`}
      >
        {checked && <Check className="h-3 w-3 text-white" />}
      </div>
      {label}
    </button>
  )
}

// ---------- Main ----------

export default function ClientOnboardingFormPage() {
  usePageTitle('Onboarding')
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clientTypes, setClientTypes] = useState<ClientType[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email_opt_in: false,
      whatsapp_opt_in: false,
      supply_sources: [],
    },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  // Pre-load client data
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/client/onboarding')
      if (!res.ok) throw new Error('Error al cargar datos')
      const { client, client_types } = await res.json()

      setClientTypes(client_types || [])

      // Pre-fill form with existing data
      if (client.owner_name) setValue('owner_name', client.owner_name)
      if (client.owner_last_name) setValue('owner_last_name', client.owner_last_name)
      if (client.gender) setValue('gender', client.gender)
      if (client.date_of_birth) setValue('date_of_birth', client.date_of_birth)
      if (client.email) setValue('email', client.email)
      if (client.email_opt_in) setValue('email_opt_in', client.email_opt_in)
      if (client.whatsapp) setValue('whatsapp', client.whatsapp)
      if (client.whatsapp_opt_in) setValue('whatsapp_opt_in', client.whatsapp_opt_in)
      if (client.client_type_id) setValue('client_type_id', client.client_type_id)
      if (client.address_state) setValue('address_state', client.address_state)
      if (client.address_postal_code) setValue('address_postal_code', client.address_postal_code)
      if (client.has_meat_fridge != null) setValue('has_meat_fridge', client.has_meat_fridge)
      if (client.has_soda_fridge != null) setValue('has_soda_fridge', client.has_soda_fridge)
      if (client.accepts_card != null) setValue('accepts_card', client.accepts_card)

      // Metadata fields
      const meta = client.metadata || {}
      if (meta.employees) setValue('employees', meta.employees as string)
      if (meta.offers_topups != null) setValue('offers_topups', meta.offers_topups as boolean)
      if (meta.supply_sources) setValue('supply_sources', meta.supply_sources as string[])
      if (meta.digital_restock != null) setValue('digital_restock', meta.digital_restock as boolean)
      if (meta.digital_restock_detail) setValue('digital_restock_detail', meta.digital_restock_detail as string)
    } catch {
      toast({ variant: 'error', title: 'Error al cargar datos del perfil' })
    } finally {
      setLoading(false)
    }
  }, [setValue, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/client/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al guardar')
      }
      toast({ variant: 'success', title: 'Perfil completado correctamente' })
      router.push('/client')
    } catch (err) {
      toast({
        variant: 'error',
        title: err instanceof Error ? err.message : 'Error al guardar',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleNext = async () => {
    // Validate step 1 fields before advancing
    const valid = await form.trigger(['owner_name'])
    if (valid) setStep(2)
  }

  // Watched values for toggle buttons
  const emailOptIn = watch('email_opt_in')
  const whatsappOptIn = watch('whatsapp_opt_in')
  const hasMeatFridge = watch('has_meat_fridge')
  const hasSodaFridge = watch('has_soda_fridge')
  const acceptsCard = watch('accepts_card')
  const offersTopups = watch('offers_topups')
  const digitalRestock = watch('digital_restock')
  const supplySources = watch('supply_sources') || []

  const supplySourceOptions = [
    { value: 'distribuidor', label: 'Distribuidor' },
    { value: 'mayorista', label: 'Mayorista' },
    { value: 'central_abastos', label: 'Central de abastos' },
    { value: 'tienda_autoservicio', label: 'Tienda de autoservicio' },
    { value: 'otro', label: 'Otro' },
  ]

  const toggleSupplySource = (value: string) => {
    const current = supplySources || []
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    setValue('supply_sources', next)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <ProgressBar step={step} />

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ========== STEP 1 ========== */}
          {step === 1 && (
            <div className="space-y-4">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Datos personales
                  </CardTitle>
                  <p className="text-xs text-gray-500">Paso 1 de 2</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Owner name */}
                  <div>
                    <FieldLabel htmlFor="owner_name">Nombre *</FieldLabel>
                    <input
                      id="owner_name"
                      {...register('owner_name')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                    {errors.owner_name && (
                      <p className="text-xs text-red-600 mt-1">{errors.owner_name.message}</p>
                    )}
                  </div>

                  {/* Owner last name */}
                  <div>
                    <FieldLabel htmlFor="owner_last_name">Apellido(s)</FieldLabel>
                    <input
                      id="owner_last_name"
                      {...register('owner_last_name')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu apellido"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <FieldLabel htmlFor="gender">Género</FieldLabel>
                    <select
                      id="gender"
                      {...register('gender')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                  </div>

                  {/* Date of birth */}
                  <div>
                    <FieldLabel htmlFor="date_of_birth">Fecha de nacimiento</FieldLabel>
                    <input
                      id="date_of_birth"
                      type="date"
                      {...register('date_of_birth')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Contacto y negocio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email */}
                  <div>
                    <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
                    <div className="mt-2">
                      <ToggleButton
                        label="Acepto recibir comunicaciones por email"
                        checked={emailOptIn}
                        onChange={(val) => setValue('email_opt_in', val)}
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
                    <input
                      id="whatsapp"
                      {...register('whatsapp')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10 dígitos"
                    />
                    <div className="mt-2">
                      <ToggleButton
                        label="Acepto recibir comunicaciones por WhatsApp"
                        checked={whatsappOptIn}
                        onChange={(val) => setValue('whatsapp_opt_in', val)}
                      />
                    </div>
                  </div>

                  {/* Client type */}
                  {clientTypes.length > 0 && (
                    <div>
                      <FieldLabel htmlFor="client_type_id">Tipo de negocio</FieldLabel>
                      <select
                        id="client_type_id"
                        {...register('client_type_id')}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        {clientTypes.map((ct) => (
                          <option key={ct.id} value={ct.id}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Address state + postal code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel htmlFor="address_state">Estado</FieldLabel>
                      <input
                        id="address_state"
                        {...register('address_state')}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <FieldLabel htmlFor="address_postal_code">Código postal</FieldLabel>
                      <input
                        id="address_postal_code"
                        {...register('address_postal_code')}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Store equipment */}
                  <div>
                    <FieldLabel>Equipamiento de la tienda</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      <ToggleButton
                        label="Refrigerador de carnes"
                        checked={hasMeatFridge}
                        onChange={(val) => setValue('has_meat_fridge', val)}
                      />
                      <ToggleButton
                        label="Refrigerador de refrescos"
                        checked={hasSodaFridge}
                        onChange={(val) => setValue('has_soda_fridge', val)}
                      />
                      <ToggleButton
                        label="Acepta tarjeta"
                        checked={acceptsCard}
                        onChange={(val) => setValue('accepts_card', val)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="button"
                onClick={handleNext}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ========== STEP 2 ========== */}
          {step === 2 && (
            <div className="space-y-4">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Encuesta de negocio
                  </CardTitle>
                  <p className="text-xs text-gray-500">Paso 2 de 2</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Employees */}
                  <div>
                    <FieldLabel htmlFor="employees">Empleados en la tienda</FieldLabel>
                    <select
                      id="employees"
                      {...register('employees')}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="solo_yo">Solo yo</option>
                      <option value="1_a_2">1 a 2</option>
                      <option value="3_a_5">3 a 5</option>
                      <option value="6_a_10">6 a 10</option>
                      <option value="mas_de_10">Más de 10</option>
                    </select>
                  </div>

                  {/* Offers topups */}
                  <div>
                    <FieldLabel>Ofreces recargas telefónicas</FieldLabel>
                    <div className="flex gap-3">
                      <ToggleButton
                        label="Sí"
                        checked={offersTopups === true}
                        onChange={() => setValue('offers_topups', true)}
                      />
                      <ToggleButton
                        label="No"
                        checked={offersTopups === false}
                        onChange={() => setValue('offers_topups', false)}
                      />
                    </div>
                  </div>

                  {/* Supply sources */}
                  <div>
                    <FieldLabel>Principales fuentes de abastecimiento</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {supplySourceOptions.map((opt) => (
                        <ToggleButton
                          key={opt.value}
                          label={opt.label}
                          checked={supplySources.includes(opt.value)}
                          onChange={() => toggleSupplySource(opt.value)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Digital restock */}
                  <div>
                    <FieldLabel>Usas alguna app para resurtir mercancía</FieldLabel>
                    <div className="flex gap-3">
                      <ToggleButton
                        label="Sí"
                        checked={digitalRestock === true}
                        onChange={() => setValue('digital_restock', true)}
                      />
                      <ToggleButton
                        label="No"
                        checked={digitalRestock === false}
                        onChange={() => setValue('digital_restock', false)}
                      />
                    </div>
                  </div>

                  {/* Digital restock detail */}
                  {digitalRestock && (
                    <div>
                      <FieldLabel htmlFor="digital_restock_detail">Cuál app usas</FieldLabel>
                      <input
                        id="digital_restock_detail"
                        {...register('digital_restock_detail')}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombre de la app"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Finalizar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
