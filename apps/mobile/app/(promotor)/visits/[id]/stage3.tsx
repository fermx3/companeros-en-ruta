import { useEffect, useMemo } from 'react'
import { Alert, ScrollView, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'

import { CatalogPicker } from '@/components/wizard/CatalogPicker'
import { EvidenceUploader } from '@/components/wizard/EvidenceUploader'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Toggle } from '@/components/wizard/Toggle'
import { WizardActionBar } from '@/components/wizard/WizardActionBar'
import { WizardStepper } from '@/components/wizard/WizardStepper'

import {
  useCheckOut,
  useCommunicationPlans,
  useExhibitions,
  useFinalizeAssessment,
  usePopMaterials,
  useSaveStage,
  useVisit,
  useVisitAssessment,
  type FinalizeError,
} from '@/features/visits/api'
import {
  serializeStage3,
  useVisitWizardSlice,
  useWizardStore,
} from '@/features/visits/wizardStore'
import type {
  CommunicationCompliance,
  ExecutionQuality,
  ExhibitionCheck,
  PopCondition,
  PopMaterialCheck,
} from '@/features/visits/types'
import { stage3Schema } from '@/features/visits/wizardSchemas'

const COMPLIANCE_OPTIONS: readonly { value: CommunicationCompliance; label: string }[] = [
  { value: 'full', label: 'Total' },
  { value: 'partial', label: 'Parcial' },
  { value: 'non_compliant', label: 'Sin cumplir' },
]

const CONDITION_OPTIONS: readonly { value: PopCondition; label: string }[] = [
  { value: 'good', label: 'Buena' },
  { value: 'damaged', label: 'Dañada' },
  { value: 'missing', label: 'Falta' },
]

const QUALITY_OPTIONS: readonly { value: ExecutionQuality; label: string }[] = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Buena' },
  { value: 'fair', label: 'Regular' },
  { value: 'poor', label: 'Mala' },
]

export default function Stage3Screen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const visitId = id!
  const router = useRouter()

  const visitQuery = useVisit(visitId)
  const brandId = visitQuery.data?.visit.brand?.id
  const plansQuery = useCommunicationPlans(brandId)
  const popQuery = usePopMaterials(brandId)
  const exhibitionsQuery = useExhibitions(brandId)
  const assessmentQuery = useVisitAssessment(visitId)
  const saveStage = useSaveStage(visitId)
  const finalize = useFinalizeAssessment(visitId)
  const checkOut = useCheckOut(visitId)

  const slice = useVisitWizardSlice(visitId)
  const hydrate = useWizardStore(s => s.hydrate)
  const patchStage3 = useWizardStore(s => s.patchStage3)
  const markCompleted = useWizardStore(s => s.markCompleted)
  const reset = useWizardStore(s => s.reset)

  useEffect(() => {
    if (!slice.hydrated && assessmentQuery.data) {
      hydrate(visitId, assessmentQuery.data)
    }
  }, [slice.hydrated, assessmentQuery.data, hydrate, visitId])

  // Auto-init pop_material_checks from selected plan, falling back to brand-level pop materials.
  const allMaterials = useMemo(() => popQuery.data?.materials ?? [], [popQuery.data])
  const plans = useMemo(() => plansQuery.data?.plans ?? [], [plansQuery.data])
  const selectedPlan = plans.find(p => p.id === slice.stage3.communicationPlanId)
  const planMaterialIds = useMemo(
    () =>
      (selectedPlan?.brand_communication_plan_materials ?? []).map(m => m.pop_material_id),
    [selectedPlan]
  )
  const materialsForPlan = useMemo(
    () =>
      planMaterialIds.length > 0
        ? allMaterials.filter(m => planMaterialIds.includes(m.id))
        : allMaterials,
    [allMaterials, planMaterialIds]
  )

  // Ensure popMaterialChecks slot for each visible material exists in store.
  useEffect(() => {
    if (!slice.hydrated || materialsForPlan.length === 0) return
    const existingIds = new Set(slice.stage3.popMaterialChecks.map(c => c.pop_material_id))
    const missing = materialsForPlan.filter(m => !existingIds.has(m.id))
    if (missing.length === 0) return
    patchStage3(visitId, {
      popMaterialChecks: [
        ...slice.stage3.popMaterialChecks,
        ...missing.map<PopMaterialCheck>(m => ({
          pop_material_id: m.id,
          is_present: false,
          condition: null,
          notes: null,
        })),
      ],
    })
  }, [slice.hydrated, materialsForPlan, slice.stage3.popMaterialChecks, patchStage3, visitId])

  const allExhibitions = useMemo(
    () => exhibitionsQuery.data?.exhibitions ?? [],
    [exhibitionsQuery.data]
  )
  useEffect(() => {
    if (!slice.hydrated || allExhibitions.length === 0) return
    const existingIds = new Set(slice.stage3.exhibitionChecks.map(c => c.exhibition_id))
    const missing = allExhibitions.filter(e => !existingIds.has(e.id))
    if (missing.length === 0) return
    patchStage3(visitId, {
      exhibitionChecks: [
        ...slice.stage3.exhibitionChecks,
        ...missing.map<ExhibitionCheck>(e => ({
          exhibition_id: e.id,
          is_executed: false,
          execution_quality: null,
          notes: null,
        })),
      ],
    })
  }, [slice.hydrated, allExhibitions, slice.stage3.exhibitionChecks, patchStage3, visitId])

  function updatePopCheck(materialId: string, patch: Partial<PopMaterialCheck>) {
    patchStage3(visitId, {
      popMaterialChecks: slice.stage3.popMaterialChecks.map(c =>
        c.pop_material_id === materialId ? { ...c, ...patch } : c
      ),
    })
  }

  function updateExhibitionCheck(exhibitionId: string, patch: Partial<ExhibitionCheck>) {
    patchStage3(visitId, {
      exhibitionChecks: slice.stage3.exhibitionChecks.map(c =>
        c.exhibition_id === exhibitionId ? { ...c, ...patch } : c
      ),
    })
  }

  async function getCoords() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return null
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
    } catch {
      return null
    }
  }

  async function onFinalize() {
    const parsed = stage3Schema.safeParse({
      communicationPlanId: slice.stage3.communicationPlanId ?? null,
      communicationCompliance: slice.stage3.communicationCompliance ?? null,
      popMaterialChecks: slice.stage3.popMaterialChecks,
      exhibitionChecks: slice.stage3.exhibitionChecks,
      popExecutionNotes: slice.stage3.popExecutionNotes ?? null,
    })
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      const where = issue?.path?.length ? ` (${issue.path.join('.')})` : ''
      Alert.alert('Datos inválidos', `${issue?.message ?? ''}${where}`)
      return
    }
    try {
      // 1) Persist stage 3
      await saveStage.mutateAsync(serializeStage3(slice))
      markCompleted(visitId, 3)

      // 2) Verify all stages completed server-side
      try {
        await finalize.mutateAsync()
      } catch (err) {
        const fe = err as FinalizeError
        if (fe.missingStages?.length) {
          const first = fe.missingStages[0]
          Alert.alert(
            'Faltan etapas',
            `Etapas pendientes: ${fe.missingStages.join(', ')}. Volvé a completar la etapa ${first}.`,
            [
              {
                text: 'Ir',
                onPress: () =>
                  router.push(`/(promotor)/visits/${visitId}/stage${first}` as never),
              },
              { text: 'Cancelar', style: 'cancel' },
            ]
          )
          return
        }
        throw err
      }

      // 3) Check-out (with coords)
      const coords = await getCoords()
      const result = await checkOut.mutateAsync(coords ?? {})
      reset(visitId)
      Alert.alert(
        'Visita completada',
        `Duración: ${result.duration_minutes} min`,
        [{ text: 'Listo', onPress: () => router.replace('/(promotor)/visits') }]
      )
    } catch (e) {
      Alert.alert('Error al finalizar', e instanceof Error ? e.message : '')
    }
  }

  const planOptions = plans.map(p => ({
    id: p.id,
    label: p.plan_name,
    sublabel: p.plan_period,
  }))

  return (
    <View className="flex-1 bg-app-bg">
      <WizardStepper
        current={3}
        completed={slice.completedStages}
        onJumpTo={stage =>
          router.push(`/(promotor)/visits/${visitId}/stage${stage}` as never)
        }
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {/* Plan */}
        <Text className="text-sm font-bold text-navy mb-2">Plan de comunicación</Text>
        <View className="bg-card rounded-lg p-3 mb-4">
          <CatalogPicker
            title="Plan de comunicación"
            items={planOptions}
            selectedId={slice.stage3.communicationPlanId ?? null}
            onSelect={item => patchStage3(visitId, { communicationPlanId: item.id })}
            triggerLabel="Seleccionar plan (opcional)"
            emptyLabel="No hay planes activos para esta marca."
          />
          <SegmentedControl
            label="Cumplimiento del plan"
            value={slice.stage3.communicationCompliance ?? null}
            options={COMPLIANCE_OPTIONS}
            onChange={v => patchStage3(visitId, { communicationCompliance: v })}
          />
        </View>

        {/* POP materials */}
        <Text className="text-sm font-bold text-navy mb-2">Materiales POP</Text>
        {popQuery.isLoading ? (
          <Text className="text-sm text-muted-foreground mb-4">Cargando materiales…</Text>
        ) : materialsForPlan.length === 0 ? (
          <Text className="text-sm text-muted-foreground mb-4">Sin materiales configurados.</Text>
        ) : (
          <View className="bg-card rounded-lg p-3 mb-4">
            {materialsForPlan.map(m => {
              const check = slice.stage3.popMaterialChecks.find(c => c.pop_material_id === m.id)
              if (!check) return null
              return (
                <View key={m.id} className="border-b border-border pb-3 mb-3">
                  <Text className="text-sm font-bold text-navy">{m.material_name}</Text>
                  {m.material_category && (
                    <Text className="text-xs text-muted-foreground mt-0.5">{m.material_category}</Text>
                  )}
                  <Toggle
                    label="Presente"
                    value={check.is_present}
                    onValueChange={v => updatePopCheck(m.id, { is_present: v })}
                  />
                  {check.is_present && (
                    <>
                      <SegmentedControl
                        label="Condición"
                        value={check.condition ?? null}
                        options={CONDITION_OPTIONS}
                        onChange={v => updatePopCheck(m.id, { condition: v })}
                      />
                      <TextInput
                        className="border border-border rounded-lg px-3 py-2 text-sm mt-1"
                        placeholder="Notas (opcional)"
                        placeholderTextColor="#4b5563"
                        value={check.notes ?? ''}
                        onChangeText={v => updatePopCheck(m.id, { notes: v || null })}
                      />
                    </>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* Exhibitions */}
        <Text className="text-sm font-bold text-navy mb-2">Exhibiciones</Text>
        {exhibitionsQuery.isLoading ? (
          <Text className="text-sm text-muted-foreground mb-4">Cargando exhibiciones…</Text>
        ) : allExhibitions.length === 0 ? (
          <Text className="text-sm text-muted-foreground mb-4">Sin exhibiciones activas.</Text>
        ) : (
          <View className="bg-card rounded-lg p-3 mb-4">
            {allExhibitions.map(e => {
              const check = slice.stage3.exhibitionChecks.find(c => c.exhibition_id === e.id)
              if (!check) return null
              return (
                <View key={e.id} className="border-b border-border pb-3 mb-3">
                  <Text className="text-sm font-bold text-navy">{e.exhibition_name}</Text>
                  {e.location_description && (
                    <Text className="text-xs text-muted-foreground mt-0.5">{e.location_description}</Text>
                  )}
                  <Toggle
                    label="Ejecutada"
                    value={check.is_executed}
                    onValueChange={v => updateExhibitionCheck(e.id, { is_executed: v })}
                  />
                  {check.is_executed && (
                    <>
                      <SegmentedControl
                        label="Calidad"
                        value={check.execution_quality ?? null}
                        options={QUALITY_OPTIONS}
                        onChange={v => updateExhibitionCheck(e.id, { execution_quality: v })}
                      />
                      <TextInput
                        className="border border-border rounded-lg px-3 py-2 text-sm mt-1"
                        placeholder="Notas (opcional)"
                        placeholderTextColor="#4b5563"
                        value={check.notes ?? ''}
                        onChangeText={v => updateExhibitionCheck(e.id, { notes: v || null })}
                      />
                    </>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* Notes */}
        <Text className="text-sm font-bold text-navy mb-2">Notas de ejecución</Text>
        <TextInput
          className="bg-card border border-border rounded-lg p-3 text-sm text-navy min-h-[80px] mb-4"
          placeholder="Comentarios sobre la ejecución del plan…"
          placeholderTextColor="#4b5563"
          multiline
          value={slice.stage3.popExecutionNotes ?? ''}
          onChangeText={v => patchStage3(visitId, { popExecutionNotes: v || null })}
        />

        {/* Evidence */}
        <View className="bg-card rounded-lg p-3 mb-4">
          <EvidenceUploader visitId={visitId} stage="communication" max={5} />
        </View>
      </ScrollView>

      <WizardActionBar
        onPrevious={() => router.back()}
        onNext={onFinalize}
        nextLabel="Finalizar"
        loading={saveStage.isPending}
      />
    </View>
  )
}
