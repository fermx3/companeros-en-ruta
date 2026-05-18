import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'

import { useOnboardingData, useSubmitOnboarding } from '@/features/onboarding/api'

// Schema mirrored verbatim from
// apps/web/src/app/(dashboard)/client/onboarding/form/page.tsx (lines 16-39).
const formSchema = z.object({
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
  employees: z.string().optional(),
  offers_topups: z.boolean().optional(),
  supply_sources: z.array(z.string()).optional(),
  digital_restock: z.boolean().optional(),
  digital_restock_detail: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const SUPPLY_SOURCES = [
  { value: 'distribuidor', label: 'Distribuidor' },
  { value: 'mayorista', label: 'Mayorista' },
  { value: 'central_abastos', label: 'Central de abastos' },
  { value: 'tienda_autoservicio', label: 'Tienda de autoservicio' },
  { value: 'otro', label: 'Otro' },
]

const GENDER_OPTIONS: { value: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir'; label: string }[] = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
]

export default function OnboardingForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const dataQuery = useOnboardingData()
  const submit = useSubmitOnboarding()

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owner_name: '',
      owner_last_name: '',
      email_opt_in: false,
      whatsapp_opt_in: false,
      supply_sources: [],
    },
  })

  // Pre-fill once data arrives.
  useEffect(() => {
    if (!dataQuery.data) return
    const c = dataQuery.data.client
    const meta = (c.metadata ?? {}) as Record<string, unknown>
    if (c.owner_name) setValue('owner_name', c.owner_name)
    if (c.owner_last_name) setValue('owner_last_name', c.owner_last_name)
    if (c.gender) setValue('gender', c.gender as FormData['gender'])
    if (c.date_of_birth) setValue('date_of_birth', c.date_of_birth)
    if (c.email) setValue('email', c.email)
    if (c.email_opt_in != null) setValue('email_opt_in', c.email_opt_in)
    if (c.whatsapp) setValue('whatsapp', c.whatsapp)
    if (c.whatsapp_opt_in != null) setValue('whatsapp_opt_in', c.whatsapp_opt_in)
    if (c.client_type_id) setValue('client_type_id', c.client_type_id)
    if (c.address_state) setValue('address_state', c.address_state)
    if (c.address_postal_code) setValue('address_postal_code', c.address_postal_code)
    if (c.has_meat_fridge != null) setValue('has_meat_fridge', c.has_meat_fridge)
    if (c.has_soda_fridge != null) setValue('has_soda_fridge', c.has_soda_fridge)
    if (c.accepts_card != null) setValue('accepts_card', c.accepts_card)
    if (meta.employees) setValue('employees', meta.employees as string)
    if (meta.offers_topups != null) setValue('offers_topups', meta.offers_topups as boolean)
    if (meta.supply_sources) setValue('supply_sources', meta.supply_sources as string[])
    if (meta.digital_restock != null) setValue('digital_restock', meta.digital_restock as boolean)
    if (meta.digital_restock_detail) {
      setValue('digital_restock_detail', meta.digital_restock_detail as string)
    }
  }, [dataQuery.data, setValue])

  async function handleNext() {
    const ok = await trigger(['owner_name'])
    if (ok) setStep(2)
  }

  const onSubmit = async (data: FormData) => {
    try {
      await submit.mutateAsync(data)
      router.replace('/')
    } catch (e) {
      Alert.alert('Error al guardar', e instanceof Error ? e.message : 'Inténtalo de nuevo')
    }
  }

  if (dataQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  const clientTypes = dataQuery.data?.client_types ?? []

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        <View className="flex-row gap-2 mb-4">
          <View className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-primary-light' : 'bg-gray-200'}`} />
          <View className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-primary-light' : 'bg-gray-200'}`} />
        </View>
        <Text className="text-xs text-gray-500 mb-2">Paso {step} de 2</Text>
      </View>
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-32">
        {step === 1 && (
          <View>
            <Text className="text-base font-bold text-navy mb-3">Datos personales</Text>
            <FieldText
              control={control}
              name="owner_name"
              label="Nombre *"
              placeholder="Tu nombre"
              error={errors.owner_name?.message}
            />
            <FieldText
              control={control}
              name="owner_last_name"
              label="Apellido(s)"
              placeholder="Tu apellido"
            />
            <FieldChips
              label="Género"
              value={watch('gender')}
              options={GENDER_OPTIONS}
              onChange={v => setValue('gender', v)}
            />
            <FieldDate
              label="Fecha de nacimiento"
              value={watch('date_of_birth')}
              onChange={v => setValue('date_of_birth', v)}
            />
            <FieldText
              control={control}
              name="email"
              label="Email"
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />
            <FieldToggle
              label="Quiero recibir promociones por email"
              value={watch('email_opt_in')}
              onChange={v => setValue('email_opt_in', v)}
            />
            <FieldText
              control={control}
              name="whatsapp"
              label="WhatsApp (10 dígitos)"
              placeholder="5512345678"
              keyboardType="number-pad"
            />
            <FieldToggle
              label="Quiero recibir promociones por WhatsApp"
              value={watch('whatsapp_opt_in')}
              onChange={v => setValue('whatsapp_opt_in', v)}
            />

            <Text className="text-base font-bold text-navy mt-6 mb-3">Tu negocio</Text>
            <FieldChips
              label="Tipo de cliente"
              value={watch('client_type_id')}
              options={clientTypes.map(c => ({ value: c.id, label: c.name }))}
              onChange={v => setValue('client_type_id', v)}
            />
            <FieldText
              control={control}
              name="address_state"
              label="Estado"
              placeholder="CDMX, Jalisco, ..."
            />
            <FieldText
              control={control}
              name="address_postal_code"
              label="Código postal"
              placeholder="01000"
              keyboardType="number-pad"
            />
            <FieldToggle
              label="Tengo refrigerador de carnes / lácteos"
              value={watch('has_meat_fridge')}
              onChange={v => setValue('has_meat_fridge', v)}
            />
            <FieldToggle
              label="Tengo refrigerador de bebidas"
              value={watch('has_soda_fridge')}
              onChange={v => setValue('has_soda_fridge', v)}
            />
            <FieldToggle
              label="Acepto pagos con tarjeta"
              value={watch('accepts_card')}
              onChange={v => setValue('accepts_card', v)}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-base font-bold text-navy mb-3">Sobre tu operación</Text>
            <FieldText
              control={control}
              name="employees"
              label="¿Cuántas personas trabajan en la tienda?"
              placeholder="ej. 2"
              keyboardType="number-pad"
            />
            <FieldToggle
              label="¿Ofreces recargas (tiempo aire, servicios)?"
              value={watch('offers_topups')}
              onChange={v => setValue('offers_topups', v)}
            />

            <Text className="text-sm font-semibold text-navy mt-4 mb-2">
              ¿Dónde compras tu mercancía?
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {SUPPLY_SOURCES.map(opt => {
                const sources = watch('supply_sources') ?? []
                const selected = sources.includes(opt.value)
                return (
                  <Pressable
                    key={opt.value}
                    className={`px-3 py-2 rounded-full border ${
                      selected
                        ? 'bg-primary-light border-primary-light'
                        : 'bg-white border-secondary'
                    }`}
                    onPress={() => {
                      const next = selected
                        ? sources.filter(s => s !== opt.value)
                        : [...sources, opt.value]
                      setValue('supply_sources', next)
                    }}
                  >
                    <Text
                      className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <FieldToggle
              label="Uso herramientas digitales para mi inventario / pedidos"
              value={watch('digital_restock')}
              onChange={v => setValue('digital_restock', v)}
            />
            {watch('digital_restock') && (
              <FieldText
                control={control}
                name="digital_restock_detail"
                label="¿Cuáles?"
                placeholder="Ejemplo: WhatsApp, Excel, sistema X"
              />
            )}
          </View>
        )}
      </ScrollView>

      <View className="flex-row gap-3 px-4 py-3 bg-white border-t border-gray-200">
        {step === 1 ? (
          <Pressable
            className="flex-1 h-12 rounded-full bg-primary-light items-center justify-center"
            onPress={handleNext}
          >
            <Text className="text-white font-bold">Siguiente</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              className="flex-1 h-12 rounded-full border border-secondary items-center justify-center"
              onPress={() => setStep(1)}
              disabled={submit.isPending}
            >
              <Text className="text-gray-700 font-semibold">Atrás</Text>
            </Pressable>
            <Pressable
              className="flex-1 h-12 rounded-full bg-primary-light items-center justify-center disabled:opacity-50"
              onPress={handleSubmit(onSubmit)}
              disabled={submit.isPending}
            >
              {submit.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Guardar</Text>
              )}
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

// ----- Field helpers -----

interface FieldTextProps {
  control: ReturnType<typeof useForm<FormData>>['control']
  name: keyof FormData
  label: string
  placeholder?: string
  error?: string
  keyboardType?: 'default' | 'email-address' | 'number-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}

function FieldText({ control, name, label, placeholder, error, keyboardType = 'default', autoCapitalize = 'sentences' }: FieldTextProps) {
  return (
    <View className="mb-3">
      <Text className="text-xs text-gray-600 mb-1">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            className="border border-gray-300 bg-white rounded-lg px-3 py-2.5 text-sm"
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            value={typeof value === 'string' ? value : value == null ? '' : String(value)}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
          />
        )}
      />
      {error && <Text className="text-xs text-destructive mt-1">{error}</Text>}
    </View>
  )
}

interface FieldChipsProps<T extends string> {
  label: string
  value: T | undefined
  options: { value: T; label: string }[]
  onChange: (next: T) => void
}

function FieldChips<T extends string>({ label, value, options, onChange }: FieldChipsProps<T>) {
  return (
    <View className="mb-3">
      <Text className="text-xs text-gray-600 mb-1">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map(opt => {
          const selected = value === opt.value
          return (
            <Pressable
              key={opt.value}
              className={`px-3 py-2 rounded-full border ${
                selected
                  ? 'bg-primary-light border-primary-light'
                  : 'bg-white border-secondary'
              }`}
              onPress={() => onChange(opt.value)}
            >
              <Text className={`text-xs font-medium ${selected ? 'text-white' : 'text-gray-700'}`}>
                {opt.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

interface FieldDateProps {
  label: string
  value: string | undefined
  onChange: (next: string) => void
}

function FieldDate({ label, value, onChange }: FieldDateProps) {
  const [open, setOpen] = useState(false)
  const parsed = value ? new Date(value) : new Date(1990, 0, 1)
  const displayLabel = value
    ? new Date(value).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Seleccionar fecha'

  function handlePickerChange(event: DateTimePickerEvent, picked?: Date) {
    if (Platform.OS === 'android') {
      setOpen(false)
      if (event.type === 'dismissed' || !picked) return
    }
    if (picked) {
      // Persist as YYYY-MM-DD (server expects ISO date string).
      const yyyy = picked.getFullYear()
      const mm = String(picked.getMonth() + 1).padStart(2, '0')
      const dd = String(picked.getDate()).padStart(2, '0')
      onChange(`${yyyy}-${mm}-${dd}`)
    }
  }

  return (
    <View className="mb-3">
      <Text className="text-xs text-gray-600 mb-1">{label}</Text>
      <Pressable
        className="border border-gray-300 bg-white rounded-lg px-3 py-2.5"
        onPress={() => setOpen(true)}
      >
        <Text className={`text-sm ${value ? 'text-navy' : 'text-gray-400'}`}>
          {displayLabel}
        </Text>
      </Pressable>
      {open && (
        <View className="bg-white rounded-lg mt-2 border border-gray-200">
          <DateTimePicker
            value={parsed}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
            onChange={handlePickerChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              className="py-2 items-center border-t border-gray-200"
              onPress={() => setOpen(false)}
            >
              <Text className="text-primary-light font-semibold">Listo</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}

function FieldToggle({ label, value, onChange }: { label: string; value: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      className="flex-row items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-3 mb-2"
      onPress={() => onChange(!value)}
    >
      <Text className="text-sm text-navy flex-1 pr-3">{label}</Text>
      <View
        className={`w-5 h-5 rounded border-2 items-center justify-center ${
          value ? 'bg-primary-light border-primary-light' : 'border-gray-300'
        }`}
      >
        {value && <Text className="text-white text-xs">✓</Text>}
      </View>
    </Pressable>
  )
}
