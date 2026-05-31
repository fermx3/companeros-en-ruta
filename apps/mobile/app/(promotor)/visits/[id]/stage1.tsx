import { useEffect, useMemo } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { CatalogPicker } from '@/components/wizard/CatalogPicker'
import { EvidenceUploader } from '@/components/wizard/EvidenceUploader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Toggle } from '@/components/wizard/Toggle'
import { WizardActionBar } from '@/components/wizard/WizardActionBar'
import { WizardStepper } from '@/components/wizard/WizardStepper'

import {
  useBrandCompetitors,
  useBrandProducts,
  useEvidence,
  useSaveStage,
  useVisit,
  useVisitAssessment,
} from '@/features/visits/api'
import {
  serializeStage1,
  useVisitWizardSlice,
  useWizardStore,
} from '@/features/visits/wizardStore'
import type {
  BrandProduct,
  BrandProductAssessment,
  CompetitorAssessment,
  StockLevel,
} from '@/features/visits/types'
import { stage1Schema } from '@/features/visits/wizardSchemas'

const STOCK_OPTIONS: readonly { value: StockLevel; label: string }[] = [
  { value: 'out_of_stock', label: 'Sin' },
  { value: 'low', label: 'Bajo' },
  { value: 'medium', label: 'Medio' },
  { value: 'high', label: 'Alto' },
]

export default function Stage1Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const visitId = id!
  const router = useRouter()

  const visitQuery = useVisit(visitId)
  const brandId = visitQuery.data?.visit.brand?.id
  const productsQuery = useBrandProducts(brandId)
  const competitorsQuery = useBrandCompetitors(brandId)
  const assessmentQuery = useVisitAssessment(visitId)
  const evidenceQuery = useEvidence(visitId)
  const saveStage = useSaveStage(visitId)

  const slice = useVisitWizardSlice(visitId)
  const hydrate = useWizardStore(s => s.hydrate)
  const patchStage1 = useWizardStore(s => s.patchStage1)
  const markCompleted = useWizardStore(s => s.markCompleted)

  // Hydrate from server once.
  useEffect(() => {
    if (!slice.hydrated && assessmentQuery.data) {
      hydrate(visitId, assessmentQuery.data)
    }
  }, [slice.hydrated, assessmentQuery.data, hydrate, visitId])

  // Initialize brandProductAssessments rows when catalog loads.
  const products = useMemo(() => productsQuery.data?.products ?? [], [productsQuery.data])
  useEffect(() => {
    if (!slice.hydrated) return
    if (products.length === 0) return
    if (slice.stage1.brandProductAssessments.length > 0) return
    patchStage1(visitId, {
      brandProductAssessments: products.map<BrandProductAssessment>(p => ({
        product_id: p.id,
        product_variant_id: null,
        current_price: null,
        suggested_price: null,
        is_product_present: false,
        stock_level: null,
        has_active_promotion: false,
        promotion_description: null,
        has_pop_material: false,
      })),
    })
  }, [slice.hydrated, slice.stage1.brandProductAssessments.length, products, patchStage1, visitId])

  function updateProduct(productId: string, patch: Partial<BrandProductAssessment>) {
    patchStage1(visitId, {
      brandProductAssessments: slice.stage1.brandProductAssessments.map(p =>
        p.product_id === productId ? { ...p, ...patch } : p
      ),
    })
  }

  function addCompetitorObservation(competitorId: string) {
    patchStage1(visitId, {
      competitorAssessments: [
        ...slice.stage1.competitorAssessments,
        {
          competitor_id: competitorId,
          competitor_product_id: null,
          product_name_observed: null,
          size_grams: null,
          observed_price: null,
          has_active_promotion: false,
          promotion_description: null,
          has_pop_material: false,
        },
      ],
    })
  }

  function removeCompetitorObservation(index: number) {
    patchStage1(visitId, {
      competitorAssessments: slice.stage1.competitorAssessments.filter((_, i) => i !== index),
    })
  }

  function updateCompetitorObservation(index: number, patch: Partial<CompetitorAssessment>) {
    patchStage1(visitId, {
      competitorAssessments: slice.stage1.competitorAssessments.map((c, i) =>
        i === index ? { ...c, ...patch } : c
      ),
    })
  }

  const evidence = evidenceQuery.data?.evidence ?? []
  const pricingPhotos = evidence.filter(e => e.evidence_stage === 'pricing')

  async function onNext() {
    const parsed = stage1Schema.safeParse({
      brandProductAssessments: slice.stage1.brandProductAssessments,
      competitorAssessments: slice.stage1.competitorAssessments,
      pricingAuditNotes: slice.stage1.pricingAuditNotes || null,
    })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const where = issue?.path?.length ? ` (${issue.path.join('.')})` : ''
      Alert.alert(
        'Faltan datos',
        `${issue?.message ?? 'Revisa el formulario.'}${where}`
      )
      return
    }
    if (pricingPhotos.length < 1) {
      Alert.alert('Falta evidencia', 'Sube al menos una foto antes de continuar.')
      return
    }
    try {
      await saveStage.mutateAsync(serializeStage1(slice))
      markCompleted(visitId, 1)
      router.push(`/(promotor)/visits/${visitId}/stage2`)
    } catch (e) {
      Alert.alert('Error al guardar', e instanceof Error ? e.message : '')
    }
  }

  const productsLoading = productsQuery.isLoading || assessmentQuery.isLoading
  const competitors = competitorsQuery.data?.competitors ?? []

  return (
    <View className="flex-1 bg-gray-50">
      <WizardStepper
        current={1}
        completed={slice.completedStages}
        onJumpTo={stage =>
          router.push(`/(promotor)/visits/${visitId}/stage${stage}` as never)
        }
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {/* Brand products */}
        <Text className="text-sm font-semibold text-navy mb-2">Productos de la marca</Text>
        {productsLoading ? (
          <Text className="text-sm text-gray-500 mb-4">Cargando catálogo…</Text>
        ) : products.length === 0 ? (
          <Text className="text-sm text-gray-500 mb-4">No hay productos cargados.</Text>
        ) : (
          <View className="bg-white rounded-lg p-3 mb-4">
            {slice.stage1.brandProductAssessments.map(row => (
              <ProductRow
                key={`${row.product_id}:${row.product_variant_id ?? ''}`}
                product={products.find(p => p.id === row.product_id)}
                row={row}
                onChange={patch => updateProduct(row.product_id, patch)}
              />
            ))}
          </View>
        )}

        {/* Competitors */}
        <Text className="text-sm font-semibold text-navy mb-2">Competencia observada</Text>
        {competitorsQuery.isLoading ? (
          <Text className="text-sm text-gray-500 mb-4">Cargando competidores…</Text>
        ) : competitors.length === 0 ? (
          <Text className="text-sm text-gray-500 mb-4">No hay competidores configurados.</Text>
        ) : (
          <View className="bg-white rounded-lg p-3 mb-4">
            {competitors.map(c => (
              <Pressable
                key={c.id}
                className="border border-secondary rounded-lg px-3 py-3 mb-2 flex-row items-center justify-between"
                onPress={() => addCompetitorObservation(c.id)}
              >
                <Text className="text-sm font-medium text-navy">{c.competitor_name}</Text>
                <Text className="text-sm text-primary-light font-semibold">+ Observar</Text>
              </Pressable>
            ))}
            {slice.stage1.competitorAssessments.length > 0 && (
              <View className="mt-3">
                <Text className="text-xs text-gray-500 mb-1">
                  Observaciones registradas ({slice.stage1.competitorAssessments.length})
                </Text>
                {slice.stage1.competitorAssessments.map((obs, i) => {
                  const competitor = competitors.find(c => c.id === obs.competitor_id)
                  return (
                    <CompetitorObservationCard
                      key={`${obs.competitor_id}-${i}`}
                      competitorName={competitor?.competitor_name}
                      catalogProducts={competitor?.brand_competitor_products ?? []}
                      obs={obs}
                      onChange={patch => updateCompetitorObservation(i, patch)}
                      onRemove={() => removeCompetitorObservation(i)}
                    />
                  )
                })}
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        <Text className="text-sm font-semibold text-navy mb-2">Notas de auditoría</Text>
        <TextInput
          className="bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[80px] mb-4"
          placeholder="Observaciones de precios y promociones…"
          placeholderTextColor="#9ca3af"
          multiline
          value={slice.stage1.pricingAuditNotes}
          onChangeText={v => patchStage1(visitId, { pricingAuditNotes: v })}
        />

        {/* Evidence */}
        <View className="bg-white rounded-lg p-3 mb-4">
          <EvidenceUploader visitId={visitId} stage="pricing" min={1} max={5} />
        </View>
      </ScrollView>

      <WizardActionBar
        onNext={onNext}
        nextLabel="Siguiente"
        loading={saveStage.isPending}
      />
    </View>
  )
}

interface ProductRowProps {
  product: BrandProduct | undefined
  row: BrandProductAssessment
  onChange: (patch: Partial<BrandProductAssessment>) => void
}

function ProductRow({ product, row, onChange }: ProductRowProps) {
  const variants = useMemo(() => product?.product_variants ?? [], [product])
  const variantOptions = useMemo(
    () =>
      variants.map(v => ({
        id: v.id,
        label: v.variant_name,
        sublabel: v.size_value
          ? `${v.size_value}${v.size_unit ?? ''}${v.suggested_price ? ` · sug. $${v.suggested_price}` : ''}`
          : null,
      })),
    [variants]
  )

  return (
    <View className="border-b border-gray-100 pb-3 mb-3">
      <Text className="text-sm font-medium text-navy">
        {product?.name ?? 'Producto'}
      </Text>
      {variantOptions.length > 0 && (
        <View className="mt-2">
          <CatalogPicker
            title="Variante"
            items={variantOptions}
            selectedId={row.product_variant_id ?? null}
            onSelect={item => {
              const variant = variants.find(v => v.id === item.id)
              onChange({
                product_variant_id: item.id,
                suggested_price: variant?.suggested_price ?? null,
              })
            }}
            triggerLabel="Seleccionar variante (opcional)"
          />
        </View>
      )}
      <Toggle
        label="Presente en tienda"
        value={row.is_product_present}
        onValueChange={v => onChange({ is_product_present: v })}
      />
      {row.is_product_present && (
        <View className="mt-1">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Precio actual</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                keyboardType="decimal-pad"
                placeholder="$0.00"
                placeholderTextColor="#9ca3af"
                value={row.current_price?.toString() ?? ''}
                onChangeText={v => onChange({ current_price: v ? Number(v) : null })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500 mb-1">Sugerido</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                keyboardType="decimal-pad"
                placeholder="$0.00"
                placeholderTextColor="#9ca3af"
                value={row.suggested_price?.toString() ?? ''}
                onChangeText={v => onChange({ suggested_price: v ? Number(v) : null })}
              />
            </View>
          </View>
          <SegmentedControl
            label="Inventario"
            value={row.stock_level ?? null}
            options={STOCK_OPTIONS}
            onChange={v => onChange({ stock_level: v })}
          />
          <Toggle
            label="Tiene promoción activa"
            value={row.has_active_promotion}
            onValueChange={v => onChange({ has_active_promotion: v })}
          />
          {row.has_active_promotion && (
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1"
              placeholder="Describe la promoción"
              placeholderTextColor="#9ca3af"
              value={row.promotion_description ?? ''}
              onChangeText={v => onChange({ promotion_description: v || null })}
            />
          )}
          <Toggle
            label="Tiene material POP"
            value={row.has_pop_material}
            onValueChange={v => onChange({ has_pop_material: v })}
          />
        </View>
      )}
    </View>
  )
}

interface CompetitorObservationCardProps {
  competitorName?: string
  catalogProducts: readonly { id: string; product_name: string }[]
  obs: CompetitorAssessment
  onChange: (patch: Partial<CompetitorAssessment>) => void
  onRemove: () => void
}

function CompetitorObservationCard({
  competitorName,
  catalogProducts,
  obs,
  onChange,
  onRemove,
}: CompetitorObservationCardProps) {
  const productItems = catalogProducts.map(p => ({ id: p.id, label: p.product_name }))
  return (
    <View className="border border-gray-200 rounded-lg p-3 mb-2">
      <View className="flex-row items-start justify-between mb-2">
        <Text className="text-sm font-medium text-navy flex-1">
          {competitorName ?? 'Competidor'}
        </Text>
        <Pressable onPress={onRemove}>
          <Text className="text-xs text-destructive font-semibold ml-2">Quitar</Text>
        </Pressable>
      </View>
      {productItems.length > 0 && (
        <View className="mb-2">
          <CatalogPicker
            title="Producto del catálogo"
            items={productItems}
            selectedId={obs.competitor_product_id ?? null}
            onSelect={item =>
              onChange({
                competitor_product_id: item.id,
                product_name_observed: obs.product_name_observed ?? item.label,
              })
            }
            triggerLabel="Vincular a producto del catálogo (opcional)"
          />
        </View>
      )}
      <Text className="text-xs text-gray-500 mb-1">Producto observado</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
        placeholder="Nombre del producto"
        placeholderTextColor="#9ca3af"
        value={obs.product_name_observed ?? ''}
        onChangeText={v => onChange({ product_name_observed: v || null })}
      />
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-1">Precio observado</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            keyboardType="decimal-pad"
            placeholder="$0.00"
            placeholderTextColor="#9ca3af"
            value={obs.observed_price?.toString() ?? ''}
            onChangeText={v => onChange({ observed_price: v ? Number(v) : null })}
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-1">Tamaño (g)</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#9ca3af"
            value={obs.size_grams?.toString() ?? ''}
            onChangeText={v => onChange({ size_grams: v ? Number(v) : null })}
          />
        </View>
      </View>
      <Toggle
        label="Tiene promoción activa"
        value={obs.has_active_promotion}
        onValueChange={v => onChange({ has_active_promotion: v })}
      />
      <Toggle
        label="Tiene POP"
        value={obs.has_pop_material}
        onValueChange={v => onChange({ has_pop_material: v })}
      />
    </View>
  )
}
