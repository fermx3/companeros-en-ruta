import { useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'

import { useCheckIn, useVisit, type VisitListItem } from '@/features/visits/api'

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

      {status === 'completed' && (
        <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
          <Text className="text-sm font-semibold text-navy mb-2">Visita completada</Text>
          <Text className="text-sm text-gray-700">
            Check-in: {formatTime(visit.check_in_time)}
          </Text>
          <Text className="text-sm text-gray-700">
            Check-out: {formatTime(visit.check_out_time)}
          </Text>
          <Text className="text-xs text-gray-500 mt-3">
            El resumen detallado por etapas estará disponible en la próxima iteración.
          </Text>
        </View>
      )}

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
