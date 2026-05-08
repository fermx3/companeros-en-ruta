import { useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'

import {
  useCheckIn,
  useEvidence,
  useVisit,
  useVisitAssessment,
  useVisitOrders,
  type EvidenceItem,
  type VisitListItem,
} from '@/features/visits/api'

const STATUS_LABEL: Record<string, string> = {
  planned: 'Planificada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No se presentó',
}

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  planned: { bg: 'bg-blue-100', text: 'text-blue-700' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-success-bg', text: 'text-success' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  no_show: { bg: 'bg-gray-100', text: 'text-gray-700' },
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function clientNameOf(client: VisitListItem['client']) {
  if (!client) return 'Cliente'
  return (
    client.business_name ??
    [client.owner_name, client.owner_last_name].filter(Boolean).join(' ') ??
    'Cliente'
  )
}

export default function VisitIndexScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const visitQuery = useVisit(id)
  const checkIn = useCheckIn(id!)

  const visit = visitQuery.data?.visit
  const status = visit?.visit_status

  // Redirect into the wizard the moment the visit is in progress.
  useEffect(() => {
    if (status === 'in_progress') {
      router.replace(`/(promotor)/visits/${id}/stage1`)
    }
  }, [status, id, router])

  if (status === 'in_progress') {
    return <Redirect href={`/(promotor)/visits/${id}/stage1`} />
  }

  async function getCoords() {
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync()
      if (perm !== 'granted') return null
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
    } catch {
      return null
    }
  }

  async function onCheckIn() {
    try {
      const coords = await getCoords()
      await checkIn.mutateAsync(coords)
      router.replace(`/(promotor)/visits/${id}/stage1`)
    } catch (e) {
      Alert.alert('Error en check-in', e instanceof Error ? e.message : 'Inténtalo de nuevo')
    }
  }

  if (visitQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" />
      </View>
    )
  }
  if (visitQuery.error || !visit) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-destructive text-center mb-4">
          {visitQuery.error instanceof Error ? visitQuery.error.message : 'Visita no encontrada'}
        </Text>
        <Pressable className="px-4 py-2 rounded-full bg-primary-light" onPress={() => visitQuery.refetch()}>
          <Text className="text-white font-semibold">Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  const badge = STATUS_BADGE[status ?? ''] ?? STATUS_BADGE.planned

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="pb-12">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-navy" numberOfLines={2}>
              {clientNameOf(visit.client)}
            </Text>
            <Text className="text-xs text-gray-500 mt-0.5">{visit.public_id}</Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${badge.bg}`}>
            <Text className={`text-xs font-medium ${badge.text}`}>
              {STATUS_LABEL[status ?? ''] ?? status}
            </Text>
          </View>
        </View>
        {visit.client?.address_street && (
          <Text className="text-sm text-gray-600 mt-2">
            {visit.client.address_street}
            {visit.client.address_neighborhood ? `, ${visit.client.address_neighborhood}` : ''}
          </Text>
        )}
        {visit.client?.phone && (
          <Text className="text-sm text-gray-500 mt-0.5">Tel: {visit.client.phone}</Text>
        )}
      </View>

      {/* Status-specific body */}
      {status === 'planned' && (
        <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
          <Text className="text-sm font-semibold text-navy mb-2">Iniciar visita</Text>
          <Text className="text-sm text-gray-600 mb-3">
            Vamos a registrar tu ubicación y comenzar la captura.
          </Text>
          <Pressable
            className="h-12 rounded-full bg-primary-light items-center justify-center disabled:opacity-50"
            onPress={onCheckIn}
            disabled={checkIn.isPending}
          >
            {checkIn.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Hacer check-in (con GPS)</Text>
            )}
          </Pressable>
        </View>
      )}

      {status === 'completed' && id && <CompletedSummary visitId={id} visit={visit} />}

      {(status === 'cancelled' || status === 'no_show') && (
        <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
          <Text className="text-sm text-gray-600">
            Esta visita está marcada como {STATUS_LABEL[status]?.toLowerCase()}. No se puede iniciar.
          </Text>
        </View>
      )}
    </ScrollView>
  )
}

const COMPLIANCE_LABEL: Record<string, string> = {
  full: 'Total',
  partial: 'Parcial',
  non_compliant: 'Sin cumplir',
}

interface CompletedSummaryProps {
  visitId: string
  visit: VisitListItem
}

function CompletedSummary({ visitId, visit }: CompletedSummaryProps) {
  const assessmentQuery = useVisitAssessment(visitId)
  const ordersQuery = useVisitOrders(visitId)
  const evidenceQuery = useEvidence(visitId)

  if (assessmentQuery.isLoading || ordersQuery.isLoading || evidenceQuery.isLoading) {
    return (
      <View className="bg-white mt-3 px-4 py-6 items-center">
        <ActivityIndicator size="small" />
      </View>
    )
  }

  const a = assessmentQuery.data
  const orders = ordersQuery.data?.orders ?? []
  const evidence = evidenceQuery.data?.evidence ?? []

  const productsPresent = (a?.brandProductAssessments ?? []).filter(p => p.is_product_present)
  const competitors = a?.competitorAssessments ?? []
  const popPresent = (a?.popMaterialChecks ?? []).filter(c => c.is_present)
  const exhibitionsExecuted = (a?.exhibitionChecks ?? []).filter(c => c.is_executed)
  const inventoryItems = a?.inventoryItems ?? []
  const sa = a?.stageAssessment

  const checkInTime = visit.check_in_time ? new Date(visit.check_in_time).getTime() : 0
  const checkOutTime = visit.check_out_time ? new Date(visit.check_out_time).getTime() : 0
  const durationMin = checkInTime && checkOutTime
    ? Math.round((checkOutTime - checkInTime) / 60000)
    : null

  const orderTotal = orders.reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0)

  const pricingPhotos = evidence.filter(e => e.evidence_stage === 'pricing')
  const inventoryPhotos = evidence.filter(e => e.evidence_stage === 'inventory')
  const communicationPhotos = evidence.filter(e => e.evidence_stage === 'communication')

  return (
    <View>
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">Visita completada</Text>
        <Text className="text-sm text-gray-700">
          Check-in: {formatTime(visit.check_in_time)} · Check-out: {formatTime(visit.check_out_time)}
        </Text>
        {durationMin != null && (
          <Text className="text-xs text-gray-500 mt-0.5">Duración: {durationMin} min</Text>
        )}
      </View>

      {/* Stage 1 summary */}
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">Etapa 1 · Precios</Text>
        <Text className="text-sm text-gray-700">
          Productos presentes: {productsPresent.length} de {(a?.brandProductAssessments ?? []).length}
        </Text>
        <Text className="text-sm text-gray-700">
          Observaciones de competencia: {competitors.length}
        </Text>
        {sa?.pricing_audit_notes && (
          <Text className="text-xs text-gray-500 mt-2" numberOfLines={4}>
            {sa.pricing_audit_notes}
          </Text>
        )}
        <PhotoStrip photos={pricingPhotos} emptyLabel="Sin fotos en esta etapa" />
      </View>

      {/* Stage 2 summary */}
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">Etapa 2 · Compras</Text>
        <Text className="text-sm text-gray-700">
          Pedido de compra: {sa?.has_purchase_order ? 'sí' : 'no'}
          {sa?.purchase_order_number ? ` (${sa.purchase_order_number})` : ''}
        </Text>
        {!sa?.has_purchase_order && orders.length === 0 && sa?.why_not_buying && (
          <Text className="text-sm text-gray-700">Motivo: {sa.why_not_buying}</Text>
        )}
        <Text className="text-sm text-gray-700">
          Pedidos creados: {orders.length}
          {orders.length > 0 ? ` · total $${orderTotal.toFixed(2)}` : ''}
        </Text>
        {orders.length > 0 && (
          <View className="mt-2">
            {orders.map(o => (
              <Text key={o.id} className="text-xs text-gray-500" numberOfLines={1}>
                · {o.order_number ?? 'Pedido'} — {o.distributor_name ?? '—'} ({o.items.length} items)
              </Text>
            ))}
          </View>
        )}
        {sa?.has_inventory && inventoryItems.length > 0 && (
          <Text className="text-sm text-gray-700 mt-1">
            Inventario: {inventoryItems.length} items
          </Text>
        )}
        {sa?.purchase_inventory_notes && (
          <Text className="text-xs text-gray-500 mt-2" numberOfLines={4}>
            {sa.purchase_inventory_notes}
          </Text>
        )}
        <PhotoStrip photos={inventoryPhotos} emptyLabel="Sin fotos en esta etapa" />
      </View>

      {/* Stage 3 summary */}
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">Etapa 3 · POP</Text>
        {sa?.communication_compliance && (
          <Text className="text-sm text-gray-700">
            Cumplimiento: {COMPLIANCE_LABEL[sa.communication_compliance] ?? sa.communication_compliance}
          </Text>
        )}
        <Text className="text-sm text-gray-700">
          POP presentes: {popPresent.length} de {(a?.popMaterialChecks ?? []).length}
        </Text>
        <Text className="text-sm text-gray-700">
          Exhibiciones ejecutadas: {exhibitionsExecuted.length} de {(a?.exhibitionChecks ?? []).length}
        </Text>
        {sa?.pop_execution_notes && (
          <Text className="text-xs text-gray-500 mt-2" numberOfLines={4}>
            {sa.pop_execution_notes}
          </Text>
        )}
        <PhotoStrip photos={communicationPhotos} emptyLabel="Sin fotos en esta etapa" />
      </View>
    </View>
  )
}

function PhotoStrip({ photos, emptyLabel }: { photos: EvidenceItem[]; emptyLabel: string }) {
  if (photos.length === 0) {
    return <Text className="text-xs text-gray-400 mt-3">{emptyLabel}</Text>
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
      {photos.map(p => (
        <Image
          key={p.id}
          source={{ uri: p.file_url }}
          className="w-20 h-20 rounded-lg mr-2 bg-gray-200"
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  )
}
