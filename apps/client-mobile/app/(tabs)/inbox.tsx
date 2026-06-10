import { View } from 'react-native'

import { NotificationsList } from '@/features/notifications/NotificationsList'

export default function InboxTab() {
  return (
    <View className="flex-1 bg-app-bg">
      <NotificationsList />
    </View>
  )
}
