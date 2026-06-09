import { Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'

import { apiFetch } from '@/lib/api'

const APP_VARIANT = 'staff_mobile' as const

// Expo Push tokens are scoped per EAS project. The project id is written to
// app.json's `extra.eas.projectId` by `eas init`. If it still holds the
// REPLACE_ME placeholder we skip silently — the rest of the app works, the
// user just doesn't get push notifications until `eas init` is run.
function readProjectId(): string | null {
  const raw =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    null
  if (!raw || typeof raw !== 'string') return null
  // Reject placeholder + anything that isn't a UUID.
  if (raw.startsWith('REPLACE_ME')) return null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRe.test(raw)) return null
  return raw
}

/**
 * Asks the user for permission to receive push notifications, fetches the
 * Expo Push Token for this device, and registers it with the backend.
 *
 * Returns the token string on success, or null when:
 *   - user denied permissions
 *   - running on a simulator (Expo Push doesn't work on iOS simulator)
 *   - registration with the backend failed
 *
 * Safe to call on every app launch — the backend upsert handles repeat calls.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[push] Skipped: not a physical device')
    return null
  }

  // iOS requires explicit permission. Android <13 auto-grants; Android 13+
  // also requires permission via the same API.
  const existing = await Notifications.getPermissionsAsync()
  let finalStatus = existing.status
  if (finalStatus !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync()
    finalStatus = requested.status
  }
  if (finalStatus !== 'granted') {
    console.log('[push] Permission denied')
    return null
  }

  // Android needs a channel before notifications can be displayed at all.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notificaciones',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#dd5025',
    })
  }

  const projectId = readProjectId()
  if (!projectId) {
    console.log('[push] Skipped: EAS projectId missing. Run `eas init` to enable push.')
    return null
  }

  let expoPushToken: string
  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId })
    expoPushToken = tokenResult.data
  } catch (err) {
    console.error('[push] getExpoPushTokenAsync failed:', err)
    return null
  }

  try {
    await apiFetch('/api/device/register-token', {
      method: 'POST',
      body: JSON.stringify({
        expo_push_token: expoPushToken,
        app_variant: APP_VARIANT,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        device_id: Device.osBuildId ?? Device.modelId ?? undefined,
      }),
    })
  } catch (err) {
    console.error('[push] Failed to register token with backend:', err)
    return null
  }

  return expoPushToken
}

/**
 * Marks the device's current Expo Push Token as inactive on the backend.
 * Called from signOut() so a future user on the same device doesn't keep
 * receiving pushes for the previous account.
 */
export async function unregisterPushTokenAsync(): Promise<void> {
  if (!Device.isDevice) return
  const projectId = readProjectId()
  if (!projectId) return

  let expoPushToken: string
  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId })
    expoPushToken = tokenResult.data
  } catch {
    // No token to deactivate (e.g., permissions never granted).
    return
  }

  try {
    await apiFetch('/api/device/register-token', {
      method: 'DELETE',
      body: JSON.stringify({
        expo_push_token: expoPushToken,
        app_variant: APP_VARIANT,
      }),
    })
  } catch (err) {
    console.error('[push] Failed to deactivate token:', err)
  }
}
