import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '@companeros/shared/types/supabase'
import { env } from '../env'

// Each method is wrapped in .catch so a SecureStore TurboModule throw can't
// propagate up to RCTExceptionsManager and abort the app. supabase-js calls
// getItem() synchronously during createClient() to restore a persisted
// session — on iOS 26.5 the underlying ObjC TurboModule can throw an
// NSException at that point, RN then tries to convert it to a JS Error and
// Hermes crashes building the Error object (the boot crash we've been
// chasing across builds 9-13). Returning null / void on failure means the
// user just starts unauthenticated, which is acceptable.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) =>
    SecureStore.getItemAsync(key).catch(err => {
      console.error('[supabase.storage.getItem] failed', err)
      return null
    }),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value).catch(err => {
      console.error('[supabase.storage.setItem] failed', err)
    }),
  removeItem: (key: string) =>
    SecureStore.deleteItemAsync(key).catch(err => {
      console.error('[supabase.storage.removeItem] failed', err)
    }),
}

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

// Lifecycle wiring (realtime auth + AppState-based auto-refresh) used to live
// here at module load. On iOS 26.5 + new arch, `AppState.addEventListener`
// triggers a void TurboModule invocation; if that ObjC call throws an
// NSException, RN tries to convert it to a JS Error and Hermes crashes
// constructing the Error object. Moving to an explicit attach() that's
// called from a React effect guarantees the JS runtime is fully initialized
// and ErrorUtils.setGlobalHandler is installed before any native call runs.
//
// Returns an unsubscribe function for symmetry, though _layout mounts the
// SupabaseLifecycle component for the entire app lifetime.
export function attachSupabaseLifecycle(): () => void {
  const authSub = supabase.auth.onAuthStateChange((_event, session) => {
    supabase.realtime.setAuth(session?.access_token ?? null)
  })

  const appStateSub = AppState.addEventListener('change', state => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })

  return () => {
    try { authSub.data.subscription.unsubscribe() } catch {}
    try { appStateSub.remove() } catch {}
  }
}
