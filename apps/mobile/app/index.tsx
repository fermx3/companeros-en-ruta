import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

import { useSession } from '@/lib/auth'

export default function Index() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/(promotor)/visits" />
}
