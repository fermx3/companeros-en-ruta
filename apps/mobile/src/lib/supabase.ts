import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '@companeros/shared/types/supabase'
import { env } from '../env'

// Each method wrapped in .catch so a SecureStore TurboModule throw can't
// propagate up to RCTExceptionsManager and abort the app at boot. Mirrors
// the fix in apps/client-mobile/src/lib/supabase.ts; see comment there.
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

// Lifecycle wiring moved out of module-load — see comment in
// apps/client-mobile/src/lib/supabase.ts. Call attachSupabaseLifecycle()
// from a useEffect in your root layout.
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
