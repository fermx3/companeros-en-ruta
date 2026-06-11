import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'

import { ClipboardList } from 'lucide-react-native'
import { usePendingStaffSurveys } from '@/features/staff-surveys/api'

const PRIMARY_HEX = '#dd5025'

interface PendingBannerProps {
  /** Tab group path prefix used to deep-link the role's surveys list. */
  rolePathPrefix: string
}

/**
 * Reminder card shown above the Home content of each staff role when there
 * are unanswered surveys assigned to that role. Hidden when nothing pending,
 * so it doesn't add noise on a clean inbox.
 */
export function StaffSurveysPendingBanner({ rolePathPrefix }: PendingBannerProps) {
  const pending = usePendingStaffSurveys()
  if (pending.pendingCount <= 0) return null

  return (
    <Pressable
      onPress={() => router.push(`${rolePathPrefix}/surveys` as never)}
      className="mb-3"
    >
      <View
        className="rounded-2xl p-4 flex-row items-center"
        style={{ backgroundColor: PRIMARY_HEX }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <ClipboardList size={22} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>
            {pending.pendingCount === 1
              ? 'Tienes 1 encuesta pendiente'
              : `Tienes ${pending.pendingCount} encuestas pendientes`}
          </Text>
          <Text className="text-white text-xs mt-0.5 opacity-90" numberOfLines={1}>
            {pending.firstPending?.brands?.name
              ? `Empieza con ${pending.firstPending.brands.name}`
              : 'Responde para ayudarnos a mejorar'}
          </Text>
        </View>
        <Text className="text-white font-bold text-xs ml-2">Responder →</Text>
      </View>
    </Pressable>
  )
}
