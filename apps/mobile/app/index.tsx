import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

import { useSession, useUserRole } from '@/lib/auth'

export default function Index() {
  const { session, loading: sessionLoading } = useSession()
  const { role, loading: roleLoading } = useUserRole()

  if (sessionLoading || (session && roleLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-app-bg">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />
  }

  // Branch by role. brand_manager / admin go to the unsupported screen — the
  // mobile app only ships flows for the field roles (promotor, asesor de
  // ventas, supervisor). null role = user has no active role assignment.
  switch (role) {
    case 'promotor':
      return <Redirect href="/(promotor)/visits" />
    case 'asesor_de_ventas':
      return <Redirect href={'/(asesor)/clients' as never} />
    case 'supervisor':
      return <Redirect href={'/(supervisor)' as never} />
    case 'brand_manager':
    case 'admin':
    case null:
    default:
      return <Redirect href={'/unsupported-role' as never} />
  }
}
