import '../global.css'

import { useEffect } from 'react'
import { Text, TextInput } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_700Bold,
  NunitoSans_900Black,
} from '@expo-google-fonts/nunito-sans'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { queryClient } from '@/lib/query'

SplashScreen.preventAutoHideAsync().catch(() => {})

// How push notifications are presented while the app is foregrounded. The
// banner + list + sound flags ensure the OS draws a regular notification
// instead of silently dropping it. The Realtime subscription updates the
// in-app UI in parallel; this handler covers iOS's "user has the app open
// when a push arrives" case.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// React Native doesn't inherit fontFamily through nested <Text>. Default both
// Text and TextInput to Nunito Sans so screens get the brand font without
// every component opting in explicitly.
type DefaultPropsHost = { defaultProps?: { style?: unknown } }
const TextWithDefaults = Text as unknown as DefaultPropsHost
TextWithDefaults.defaultProps = TextWithDefaults.defaultProps ?? {}
TextWithDefaults.defaultProps.style = [
  { fontFamily: 'NunitoSans_400Regular' },
  TextWithDefaults.defaultProps.style,
]
const InputWithDefaults = TextInput as unknown as DefaultPropsHost
InputWithDefaults.defaultProps = InputWithDefaults.defaultProps ?? {}
InputWithDefaults.defaultProps.style = [
  { fontFamily: 'NunitoSans_400Regular' },
  InputWithDefaults.defaultProps.style,
]

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    NunitoSans_900Black,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
