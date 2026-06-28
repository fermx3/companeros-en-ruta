import '../global.css'

import { useEffect } from 'react'
import { LogBox, Text, TextInput } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as Notifications from 'expo-notifications'
import * as SplashScreen from 'expo-splash-screen'

// Catch any uncaught JS error during app boot and surface it as a console
// error instead of letting RN's RCTExceptionsManager promote it to a fatal
// abort (which is what kills the app on iOS 26.5 TestFlight). Without this,
// any throw from a module's top-level code or first render takes down the
// app before we ever see what failed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorUtils = (global as any).ErrorUtils
if (errorUtils?.setGlobalHandler) {
  const prev = errorUtils.getGlobalHandler?.()
  errorUtils.setGlobalHandler((err: unknown, isFatal: boolean) => {
    const msg = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack ?? ''}` : String(err)
    console.error(`[boot-error fatal=${isFatal}]`, msg)
    if (prev) prev(err, false)
  })
}
LogBox.ignoreAllLogs(false)
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

// `setNotificationHandler` used to live here at module-load. On iOS 26.5
// with TurboModules enabled, the underlying ObjC call threw an NSException
// during the first invocation; React Native tried to convert it to a JS
// Error via TurboModuleConvertUtils::createJSRuntimeError and Hermes
// crashed building the Error object (DictPropertyMap / SymbolID). Moving
// the call into useEffect (RootLayout) ensures React is mounted, the JS
// runtime is fully warmed, and the global ErrorUtils handler is already
// in place if the throw recurs — so we get a logged message instead of
// the app aborting before render.

// Default fontFamily on Text/TextInput because RN doesn't inherit through
// nested <Text>. defaultProps mutation is deprecated in React 19 and may
// throw on some component shapes (forwardRef / memo), so wrap in try/catch.
type DefaultPropsHost = { defaultProps?: { style?: unknown } }
try {
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
} catch (err) {
  console.error('[boot] default font setup failed', err)
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_700Bold,
    NunitoSans_900Black,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {})
  }, [fontsLoaded])

  // Register the foreground notification presentation handler here (NOT at
  // module load — see the long comment above the SplashScreen block).
  useEffect(() => {
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      })
    } catch (err) {
      console.error('[boot] setNotificationHandler failed', err)
    }
  }, [])

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
