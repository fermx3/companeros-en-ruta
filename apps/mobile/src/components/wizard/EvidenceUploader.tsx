import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'

import { useEvidence, useUploadEvidence, type EvidenceItem } from '@/features/visits/api'

type Stage = 'pricing' | 'inventory' | 'communication'

interface EvidenceUploaderProps {
  visitId: string
  stage: Stage
  min?: number
  max?: number
  disabled?: boolean
}

export function EvidenceUploader({
  visitId,
  stage,
  min = 0,
  max = 5,
  disabled = false,
}: EvidenceUploaderProps) {
  const evidenceQuery = useEvidence(visitId)
  const upload = useUploadEvidence(visitId)

  const all = evidenceQuery.data?.evidence ?? []
  const photos = all.filter((e: EvidenceItem) => e.evidence_stage === stage)
  const remaining = Math.max(0, max - photos.length)
  const meetsMin = photos.length >= min

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

  async function pick(source: 'camera' | 'library') {
    if (disabled || remaining === 0) return
    try {
      const perm =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara o galería.')
        return
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ quality: 0.7, mediaTypes: ['images'] })
          : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ['images'] })
      if (result.canceled || !result.assets?.[0]) return
      const asset = result.assets[0]
      const coords = await getCoords()
      await upload.mutateAsync({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileName: asset.fileName ?? `evidence-${Date.now()}.jpg`,
        evidenceStage: stage,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      })
    } catch (e) {
      Alert.alert('Error al subir foto', e instanceof Error ? e.message : '')
    }
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs text-gray-500">
          Evidencia ({photos.length}
          {min > 0 ? ` / mínimo ${min}` : ''}
          {max ? ` / máximo ${max}` : ''})
        </Text>
        {min > 0 && !meetsMin && (
          <Text className="text-xs text-destructive">Mínimo {min}</Text>
        )}
      </View>

      {photos.length === 0 ? (
        <Text className="text-sm text-gray-500 mb-2">Aún no hay fotos.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {photos.map(p => (
            <Image
              key={p.id}
              source={{ uri: p.file_url }}
              className="w-24 h-24 rounded-lg mr-2 bg-gray-200"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {!disabled && (
        <View className="flex-row gap-2">
          <Pressable
            className="flex-1 h-11 rounded-full border border-secondary items-center justify-center disabled:opacity-50"
            onPress={() => pick('camera')}
            disabled={upload.isPending || remaining === 0}
          >
            <Text className="text-sm text-gray-700 font-medium">Tomar foto</Text>
          </Pressable>
          <Pressable
            className="flex-1 h-11 rounded-full border border-secondary items-center justify-center disabled:opacity-50"
            onPress={() => pick('library')}
            disabled={upload.isPending || remaining === 0}
          >
            <Text className="text-sm text-gray-700 font-medium">Galería</Text>
          </Pressable>
        </View>
      )}

      {upload.isPending && (
        <View className="flex-row items-center mt-2">
          <ActivityIndicator size="small" />
          <Text className="text-xs text-gray-500 ml-2">Subiendo foto…</Text>
        </View>
      )}

      {remaining === 0 && !disabled && (
        <Text className="text-xs text-gray-500 mt-2">
          Alcanzaste el máximo de fotos para esta etapa.
        </Text>
      )}
    </View>
  )
}
