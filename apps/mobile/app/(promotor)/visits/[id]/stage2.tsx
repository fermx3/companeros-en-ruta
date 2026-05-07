import { Alert, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { WizardActionBar } from '@/components/wizard/WizardActionBar'
import { WizardStepper } from '@/components/wizard/WizardStepper'

import { useSaveStage } from '@/features/visits/api'
import {
  serializeStage2,
  useVisitWizardSlice,
  useWizardStore,
} from '@/features/visits/wizardStore'

export default function Stage2Stub() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const visitId = id!
  const router = useRouter()

  const slice = useVisitWizardSlice(visitId)
  const markCompleted = useWizardStore(s => s.markCompleted)
  const saveStage = useSaveStage(visitId)

  async function onNext() {
    try {
      await saveStage.mutateAsync(serializeStage2(slice))
      markCompleted(visitId, 2)
      router.push(`/(promotor)/visits/${visitId}/stage3`)
    } catch (e) {
      Alert.alert('Error al guardar', e instanceof Error ? e.message : '')
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <WizardStepper
        current={2}
        completed={slice.completedStages}
        onJumpTo={stage =>
          router.push(`/(promotor)/visits/${visitId}/stage${stage}` as never)
        }
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        <View className="bg-white rounded-lg p-4">
          <Text className="text-sm font-semibold text-navy mb-2">Próximamente</Text>
          <Text className="text-sm text-gray-600">
            La captura de pedidos, inventario y promociones del cliente se entrega en la
            siguiente iteración. Por ahora puedes avanzar a la etapa 3.
          </Text>
        </View>
      </ScrollView>
      <WizardActionBar
        onPrevious={() => router.back()}
        onNext={onNext}
        nextLabel="Siguiente"
        loading={saveStage.isPending}
      />
    </View>
  )
}
