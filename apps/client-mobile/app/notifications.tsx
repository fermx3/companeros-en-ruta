import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { NotificationsList } from '@/features/notifications/NotificationsList'

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <View className="flex-1">
        <NotificationsList header={<ScreenHeader title="Notificaciones" showBack />} />
      </View>
    </SafeAreaView>
  )
}
