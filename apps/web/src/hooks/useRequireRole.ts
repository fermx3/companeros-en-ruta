'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import type { UserRole } from '@/lib/types'

interface UseRequireRoleOptions {
  /**
   * Additional roles that should be allowed access.
   * Useful for allowing admins to access other role-specific routes.
   * @example { allowMultipleRoles: ['admin'] }
   */
  allowMultipleRoles?: UserRole[]
  /**
   * Path to redirect to when access is denied (default: /unauthorized)
   */
  redirectTo?: string
}

interface UseRequireRoleReturn {
  /** Whether the user has access to the required role */
  hasAccess: boolean
  /** Whether auth/role data is still loading */
  loading: boolean
  /** Error message if there was an issue loading auth data */
  error: string | null
  /** Retry loading auth data after an error */
  retry: () => Promise<void>
}

/**
 * Hook to enforce role-based access control on pages/layouts.
 * Redirects to /unauthorized if the user doesn't have the required role.
 *
 * @param requiredRole - The role required to access the page
 * @param options - Additional options for role checking
 * @returns { hasAccess, loading, error, retry }
 *
 * @example
 * ```tsx
 * // Basic usage
 * export default function AdminPage() {
 *   const { hasAccess, loading } = useRequireRole('admin')
 *
 *   if (loading) return <Loading />
 *   if (!hasAccess) return null
 *
 *   return <AdminContent />
 * }
 *
 * // Allow admin to access promotor routes
 * export default function PromotorLayout({ children }) {
 *   const { hasAccess, loading } = useRequireRole('promotor', {
 *     allowMultipleRoles: ['admin']
 *   })
 *   // ...
 * }
 * ```
 */
export function useRequireRole(
  requiredRole: UserRole,
  options: UseRequireRoleOptions = {}
): UseRequireRoleReturn {
  const {
    user,
    userRoles,
    loading: authLoading,
    initialized,
    profileError,
    errorMessage,
    retry
  } = useAuth()
  const router = useRouter()
  const hasRedirected = useRef(false)

  const { allowMultipleRoles = [], redirectTo = '/unauthorized' } = options

  // Data is fully loaded when:
  // - Auth is not loading
  // - Initialization is complete
  // Note: profileError is handled separately - it's not a loading state, it's an error state
  const isLoading = authLoading || !initialized

  // Compute hasAccess - user must exist, no profile error, and have the required role
  // OR have one of the allowed multiple roles (e.g., admin can access promotor)
  const hasRequiredRole = userRoles.includes(requiredRole)
  const hasAllowedRole = allowMultipleRoles.some(role => userRoles.includes(role))
  const hasAccess = !isLoading && user !== null && !profileError && (hasRequiredRole || hasAllowedRole)

  useEffect(() => {
    // Still loading, wait
    if (isLoading) {
      return
    }

    // Already redirected, don't do it again
    if (hasRedirected.current) return

    // If no user, redirect to login
    if (!user) {
      hasRedirected.current = true
      router.replace('/login')
      return
    }

    // If there was a profile error OR user doesn't have any required role, redirect
    if (profileError) {
      hasRedirected.current = true
      router.replace(redirectTo)
      return
    }

    if (!hasRequiredRole && !hasAllowedRole) {
      hasRedirected.current = true
      router.replace(redirectTo)
    }
  }, [
    user,
    userRoles,
    isLoading,
    requiredRole,
    router,
    profileError,
    hasRequiredRole,
    hasAllowedRole,
    redirectTo,
    allowMultipleRoles
  ])

  return {
    hasAccess,
    loading: isLoading,
    error: errorMessage,
    retry
  }
}
