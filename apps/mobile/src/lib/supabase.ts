import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { Database } from '@companeros/shared/types/supabase'
import { env } from '../env'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
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

// Keep the Realtime socket authenticated with the user's JWT. RLS-gated
// postgres_changes (e.g. the notifications table) deliver nothing to an
// anonymous socket, so without this realtime updates silently never fire even
// though REST queries work. Fires on INITIAL_SESSION (cold start with a
// restored session), SIGNED_IN, and TOKEN_REFRESHED.
supabase.auth.onAuthStateChange((_event, session) => {
  supabase.realtime.setAuth(session?.access_token ?? null)
})

// React Native pauses timers while the app is in the background, so the
// supabase-js auto-refresh loop stalls and the cached access_token can be
// expired by the time the user returns. Pause/resume the loop on AppState
// transitions per the Supabase RN guide.
AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
