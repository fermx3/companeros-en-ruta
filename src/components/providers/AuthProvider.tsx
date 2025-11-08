'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserRole } from '@/lib/types'

interface AuthContextType {
  user: User | null
  userProfile: unknown | null
  userRoles: UserRole[]
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<unknown>(null)
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserData(session.user.id)
      }

      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserData(session.user.id)
        } else {
          setUserProfile(null)
          setUserRoles([])
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Cargar perfil del usuario
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setUserProfile(profile)

        // Cargar roles del usuario
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('is_active', true)

        if (roles) {
          setUserRoles(roles.map(r => r.role))
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      userRoles,
      loading,
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
