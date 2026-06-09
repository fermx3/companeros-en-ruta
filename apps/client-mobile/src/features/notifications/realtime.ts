import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useClientProfile } from '@/features/profile/api'

/**
 * Subscribes to Supabase Realtime on the `notifications` table filtered to
 * the currently-logged-in client's id. When an INSERT lands, invalidates the
 * notifications + unread-count queries so the UI updates instantly.
 *
 * Call this once near the top of the auth-protected tree (root tabs layout).
 * Returns nothing — the subscription cleans up automatically on unmount.
 */
export function useNotificationsRealtime(): void {
  const qc = useQueryClient()
  const profileQuery = useClientProfile()
  const clientId = profileQuery.data?.id

  useEffect(() => {
    if (!clientId) return

    // No `filter` here: the notifications table runs with REPLICA IDENTITY
    // DEFAULT (PK only), so Realtime can't compare non-PK columns server-side
    // and a `client_id=eq.X` filter would silently match nothing. RLS still
    // narrows the events to this client's own rows via
    // `notifications_select_own`, so removing the filter is safe.
    const channel = supabase
      .channel(`notifications:client:${clientId}`)
      .on(
        'postgres_changes' as never,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          qc.invalidateQueries({ queryKey: ['client', 'notifications'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId, qc])
}
