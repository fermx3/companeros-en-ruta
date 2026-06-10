import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = (userId: string) => `onboarding_dismissed_${userId}`

/**
 * Allows the cliente to skip the onboarding form. Persisted per-user (so
 * different demo accounts on the same device don't share state) and per-device
 * (intentionally: a re-login on a new phone re-prompts, matching the web's
 * sessionStorage semantics roughly).
 *
 * The skip is "soft": Home still shows a persistent "Completa tu perfil"
 * banner until `clients.onboarding_completed` flips to true server-side.
 */
export async function isOnboardingDismissed(userId: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEY(userId))
    return value === '1'
  } catch {
    return false
  }
}

export async function dismissOnboarding(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY(userId), '1')
  } catch (err) {
    console.error('[onboarding-dismiss] persist failed:', err)
  }
}

/**
 * Clear the dismiss flag — call after onboarding is actually completed so a
 * future logout/login cycle on the same device starts fresh.
 */
export async function clearOnboardingDismiss(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY(userId))
  } catch {
    // no-op
  }
}
