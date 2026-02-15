'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserRole } from '@/lib/types'

// Debug logging helper - ALWAYS logs for now to diagnose issues
const debugLog = (message: string, data?: unknown) => {
  console.log(`[AuthProvider] ${message}`, data !== undefined ? data : '')
}

interface AuthContextType {
  user: User | null
  userProfile: unknown | null
  userRoles: UserRole[]
  loading: boolean
  /** True after the initial profile/roles fetch has completed (even if it failed) */
  initialized: boolean
  /** True if there was an error loading the user profile */
  profileError: boolean
  /** Error message if there was an issue loading auth data */
  errorMessage: string | null
  /** Retry loading user data after an error */
  retry: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<unknown>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [profileError, setProfileError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isLoadingUserDataRef = useRef(false)
  // Track whether we already have valid user data to avoid clobbering it on transient errors
  const hasValidDataRef = useRef(false)
  const currentUserIdRef = useRef<string | null>(null)

  const supabase = createClient()

  // Define loadUserData first so it can be used in useEffect
  const loadUserData = useCallback(async (userId: string, isMounted: boolean = true) => {
    debugLog('loadUserData called for:', userId)

    // Prevent multiple simultaneous calls using ref (not state) for immediate check
    if (isLoadingUserDataRef.current) {
      debugLog('loadUserData already in progress, skipping...')
      return
    }

    try {
      isLoadingUserDataRef.current = true

      // Reset error state before loading
      if (isMounted) {
        setProfileError(false)
        setErrorMessage(null)
      }

      debugLog('Fetching user_profiles...')

      // Cargar perfil del usuario (user_profiles uses user_id to link to auth.users)
      // Retry up to 3 times with increasing timeout
      let profile = null
      let profileLoadError = null
      const maxRetries = 3
      const baseTimeout = 15000 // 15 seconds

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        debugLog(`Profile fetch attempt ${attempt}/${maxRetries}...`)

        const profilePromise = supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        const timeout = baseTimeout * attempt // 15s, 30s, 45s
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Profile fetch timeout after ${timeout/1000}s`)), timeout)
        )

        try {
          const result = await Promise.race([profilePromise, timeoutPromise]) as { data: unknown; error: unknown }
          profile = result.data
          profileLoadError = result.error

          if (profile && !profileLoadError) {
            debugLog(`Profile fetch succeeded on attempt ${attempt}`)
            break // Success, exit retry loop
          }
        } catch (timeoutErr) {
          debugLog(`Profile fetch attempt ${attempt} failed:`, timeoutErr)
          profileLoadError = timeoutErr

          if (attempt < maxRetries) {
            debugLog(`Retrying in 1 second...`)
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      debugLog('Profile result:', { profile: profile ? { id: (profile as { id: string }).id, tenant_id: (profile as { tenant_id: string }).tenant_id } : null, error: profileLoadError })

      if (!isMounted) return

      if (profileLoadError) {
        if (hasValidDataRef.current) {
          // Already have valid profile/roles from a previous successful load.
          // Don't overwrite good state with a transient error (e.g. token refresh timeout).
          debugLog('Profile re-fetch failed but existing data is valid, keeping current state')
          return
        }
        console.error('Error loading user profile:', profileLoadError)
        setProfileError(true)
        const errorMsg = profileLoadError instanceof Error
          ? profileLoadError.message
          : (profileLoadError as { message?: string })?.message || 'Error desconocido'
        setErrorMessage(`Error al cargar perfil: ${errorMsg}`)
        return
      }

      if (profile) {
        setUserProfile(profile)
        currentUserIdRef.current = userId
        const profileId = (profile as { id: string }).id

        // Cargar roles del usuario (user_roles uses user_profile_id, not user_id)
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_profile_id', profileId)
          .eq('status', 'active')
          .is('deleted_at', null)

        debugLog('Roles result:', { roles, error: rolesError })

        if (!isMounted) return

        if (rolesError) {
          console.error('Error loading roles:', rolesError)
          setErrorMessage(`Error al cargar roles: ${rolesError.message}`)
        }

        if (roles && roles.length > 0) {
          const rolesList = roles.map(r => r.role)
          setUserRoles(rolesList)
          hasValidDataRef.current = true
          debugLog('Roles set:', rolesList)
        } else {
          // No user_roles found — check if user is a client.
          // Client users are linked via clients.user_id (auth.users.id),
          // not through user_roles.
          debugLog('No user_roles found, checking clients table...')
          const { data: clientRecord, error: clientError } = await supabase
            .from('clients')
            .select('id, status')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single()

          if (!isMounted) return

          if (clientError && clientError.code !== 'PGRST116') {
            // PGRST116 = no rows found, which is expected for non-client users
            debugLog('Client check error:', clientError)
          }

          if (clientRecord && clientRecord.status === 'active') {
            setUserRoles(['client'] as UserRole[])
            hasValidDataRef.current = true
            debugLog('User identified as client')
          } else {
            setUserRoles([])
            debugLog('No roles and no active client record found')
          }
        }
      }
    } catch (error) {
      if (hasValidDataRef.current) {
        debugLog('loadUserData threw but existing data is valid, keeping current state')
      } else {
        console.error('Error loading user data:', error)
        setProfileError(true)
        setErrorMessage(error instanceof Error ? error.message : 'Error desconocido')
      }
    } finally {
      isLoadingUserDataRef.current = false
    }
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    // Track whether getSession has completed initial load to avoid
    // the race condition where onAuthStateChange(INITIAL_SESSION)
    // fires before getSession finishes and prematurely sets initialized=true
    let initialLoadDone = false

    const getSession = async () => {
      debugLog('getSession starting...')
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        debugLog('Session retrieved:', { userId: session?.user?.id, email: session?.user?.email })
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserData(session.user.id, isMounted)
        }

        // Set initialized AFTER loadUserData completes (not in finally)
        // This ensures userRoles is populated before initialized=true
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
          debugLog('Auth initialized successfully')
        }
      } catch (error) {
        console.error('Error getting session:', error)
        // Even on error, mark as initialized so the app doesn't hang
        if (isMounted) {
          setLoading(false)
          setInitialized(true)
          setErrorMessage(error instanceof Error ? error.message : 'Error al obtener sesión')
          debugLog('Auth initialized with error:', error)
        }
      } finally {
        initialLoadDone = true
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        debugLog('Auth state change:', { event, userId: session?.user?.id })

        // Skip INITIAL_SESSION — getSession() already handles the initial load.
        // Processing it here causes a race: loadUserData is already running from
        // getSession, so the isLoadingUserDataRef guard skips data loading, but
        // this callback still sets initialized=true with empty userRoles.
        if (event === 'INITIAL_SESSION') {
          debugLog('Skipping INITIAL_SESSION (handled by getSession)')
          return
        }

        // For subsequent events before initial load completes, wait
        if (!initialLoadDone) {
          debugLog('Skipping event before initial load completes:', event)
          return
        }

        // Token refresh doesn't change user data — just update the user object
        // (which contains the refreshed token) and skip the full data reload.
        // Also skip SIGNED_IN from _recoverAndRefresh for the same user.
        if (
          (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
          session?.user?.id === currentUserIdRef.current &&
          hasValidDataRef.current
        ) {
          debugLog(`Skipping ${event} for same user (data already loaded)`)
          setUser(session?.user ?? null)
          return
        }

        try {
          setUser(session?.user ?? null)

          if (session?.user) {
            await loadUserData(session.user.id, isMounted)
          } else {
            setUserProfile(null)
            setUserRoles([])
          }

          if (isMounted) {
            setLoading(false)
            setInitialized(true)
          }
        } catch (error) {
          console.error('Error on auth state change:', error)
          if (isMounted) {
            setLoading(false)
            setInitialized(true)
            setErrorMessage(error instanceof Error ? error.message : 'Error en cambio de estado')
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadUserData, supabase.auth])

  const signOut = async () => {
    debugLog('Signing out...')
    await supabase.auth.signOut()
    setUserProfile(null)
    setUserRoles([])
    setErrorMessage(null)
    setProfileError(false)
    hasValidDataRef.current = false
    currentUserIdRef.current = null
  }

  /**
   * Retry loading user data after an error.
   * Call this when the user clicks a "Retry" button.
   */
  const retry = useCallback(async () => {
    if (!user) {
      debugLog('retry called but no user present')
      return
    }

    debugLog('Retrying user data load...')
    setLoading(true)
    setProfileError(false)
    setErrorMessage(null)

    await loadUserData(user.id, true)

    setLoading(false)
    debugLog('Retry completed')
  }, [user, loadUserData])

  // Debug log final state whenever it changes
  useEffect(() => {
    if (initialized) {
      debugLog('Final auth state:', {
        user: user ? { id: user.id, email: user.email } : null,
        userRoles,
        initialized,
        profileError,
        errorMessage
      })
    }
  }, [user, userRoles, initialized, profileError, errorMessage])

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      userRoles,
      loading,
      initialized,
      profileError,
      errorMessage,
      retry,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
