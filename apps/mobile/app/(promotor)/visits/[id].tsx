import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Location from 'expo-location'
import * as ImagePicker from 'expo-image-picker'

import {
  useCheckIn,
  useCheckOut,
  useEvidence,
  useUpdateVisitNotes,
  useUploadEvidence,
  useVisit,
} from '@/features/visits/api'

const STATUS_LABEL: Record<string, string> = {
  planned: 'Planificada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No se presentó',
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function clientNameOf(client: { business_name: string | null; owner_name: string | null; owner_last_name: string | null } | null) {
  if (!client) return 'Cliente'
  return (
    client.business_name ??
    [client.owner_name, client.owner_last_name].filter(Boolean).join(' ') ??
    'Cliente'
  )
}

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const visitQuery = useVisit(id)
  const evidenceQuery = useEvidence(id)
  const checkIn = useCheckIn(id!)
  const checkOut = useCheckOut(id!)
  const updateNotes = useUpdateVisitNotes(id!)
  const uploadEvidence = useUploadEvidence(id!)

  const [notes, setNotes] = useState('')
  const visit = visitQuery.data?.visit
  const evidence = evidenceQuery.data?.evidence ?? []

  useEffect(() => {
    if (visit?.promotor_notes != null) setNotes(visit.promotor_notes)
  }, [visit?.promotor_notes])

  const status = visit?.visit_status

  async function getCoords(): Promise<{ latitude: number; longitude: number } | null> {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return null
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
  }

  async function onCheckIn() {
    try {
      const coords = await getCoords()
      await checkIn.mutateAsync(coords)
    } catch (e) {
      Alert.alert('Error en check-in', e instanceof Error ? e.message : 'Inténtalo de nuevo')
    }
  }

  async function onSaveNotes() {
    try {
      await updateNotes.mutateAsync(notes)
    } catch (e) {
      Alert.alert('Error al guardar notas', e instanceof Error ? e.message : '')
    }
  }

  async function onPickEvidence(source: 'camera' | 'library') {
    try {
      const perm = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara o galería.')
        return
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.7, mediaTypes: ['images'] })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] })
      if (result.canceled || !result.assets?.[0]) return
      const asset = result.assets[0]
      const coords = await getCoords()
      await uploadEvidence.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `evidence-${Date.now()}.jpg`,
        evidenceStage: 'inventory',
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      })
    } catch (e) {
      Alert.alert('Error al subir evidencia', e instanceof Error ? e.message : '')
    }
  }

  async function onCheckOut() {
    try {
      // Persist any unsaved notes first
      if (visit && notes !== (visit.promotor_notes ?? '')) {
        await updateNotes.mutateAsync(notes)
      }
      const coords = await getCoords()
      const result = await checkOut.mutateAsync({
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      })
      Alert.alert('Visita completada', `Duración: ${result.duration_minutes} min`)
      router.replace('/(promotor)/visits')
    } catch (e) {
      Alert.alert('Error en check-out', e instanceof Error ? e.message : '')
    }
  }

  const canCheckIn = status === 'planned'
  const canEdit = status === 'in_progress'
  const isCompleted = status === 'completed'

  const stageBadge = useMemo(() => {
    const map: Record<string, { bg: string; text: string }> = {
      planned: { bg: 'bg-blue-100', text: 'text-blue-700' },
      in_progress: { bg: 'bg-amber-100', text: 'text-amber-700' },
      completed: { bg: 'bg-success-bg', text: 'text-success' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
      no_show: { bg: 'bg-gray-100', text: 'text-gray-700' },
    }
    return map[status ?? ''] ?? map.planned
  }, [status])

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
          <View className={`px-3 py-1 rounded-full ${stageBadge.bg}`}>
            <Text className={`text-xs font-medium ${stageBadge.text}`}>
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

      {/* Stage 1: Check-in */}
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">1. Check-in</Text>
        {visit.check_in_time ? (
          <Text className="text-sm text-gray-700">
            Check-in registrado a las {formatTime(visit.check_in_time)}
          </Text>
        ) : canCheckIn ? (
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
        ) : (
          <Text className="text-sm text-gray-500">Visita no iniciada</Text>
        )}
      </View>

      {/* Stage 2: Notas y evidencia */}
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">2. Notas y evidencia</Text>

        <Text className="text-xs text-gray-500 mb-1">Notas de la visita</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-sm text-gray-800 min-h-[80px]"
          placeholder="Anota observaciones, precios, asesoramiento brindado..."
          placeholderTextColor="#9ca3af"
          multiline
          value={notes}
          onChangeText={setNotes}
          editable={canEdit}
        />
        {canEdit && (
          <Pressable
            className="mt-2 self-end px-3 py-1.5 rounded-full border border-secondary disabled:opacity-50"
            onPress={onSaveNotes}
            disabled={updateNotes.isPending || notes === (visit.promotor_notes ?? '')}
          >
            <Text className="text-xs text-gray-700 font-medium">
              {updateNotes.isPending ? 'Guardando…' : 'Guardar notas'}
            </Text>
          </Pressable>
        )}

        <Text className="text-xs text-gray-500 mt-4 mb-2">Evidencia fotográfica</Text>
        {evidence.length === 0 ? (
          <Text className="text-sm text-gray-500 mb-2">Aún no hay fotos.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {evidence.map(e => (
              <Image
                key={e.id}
                source={{ uri: e.file_url }}
                className="w-24 h-24 rounded-lg mr-2 bg-gray-200"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}
        {canEdit && (
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 h-11 rounded-full border border-secondary items-center justify-center disabled:opacity-50"
              onPress={() => onPickEvidence('camera')}
              disabled={uploadEvidence.isPending}
            >
              <Text className="text-sm text-gray-700 font-medium">Tomar foto</Text>
            </Pressable>
            <Pressable
              className="flex-1 h-11 rounded-full border border-secondary items-center justify-center disabled:opacity-50"
              onPress={() => onPickEvidence('library')}
              disabled={uploadEvidence.isPending}
            >
              <Text className="text-sm text-gray-700 font-medium">Galería</Text>
            </Pressable>
          </View>
        )}
        {uploadEvidence.isPending && (
          <View className="flex-row items-center mt-2">
            <ActivityIndicator size="small" />
            <Text className="text-xs text-gray-500 ml-2">Subiendo foto…</Text>
          </View>
        )}
      </View>

      {/* Stage 3: Check-out */}
      <View className="bg-white mt-3 px-4 py-4 border-y border-gray-200">
        <Text className="text-sm font-semibold text-navy mb-2">3. Check-out</Text>
        {isCompleted ? (
          <Text className="text-sm text-gray-700">
            Completada a las {formatTime(visit.check_out_time)}
          </Text>
        ) : canEdit ? (
          <Pressable
            className="h-12 rounded-full bg-success items-center justify-center disabled:opacity-50"
            onPress={onCheckOut}
            disabled={checkOut.isPending}
          >
            {checkOut.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold">Completar visita</Text>
            )}
          </Pressable>
        ) : (
          <Text className="text-sm text-gray-500">Necesitas hacer check-in primero.</Text>
        )}
      </View>
    </ScrollView>
  )
}
