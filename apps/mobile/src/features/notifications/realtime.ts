import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import { useUserRole } from '@/lib/auth'

/**
 * Subscribes to Supabase Realtime on the `notifications` table for the
 * authenticated staff user (promotor / asesor / supervisor). When an INSERT
 * lands, invalidates the staff notifications + unread-count queries so the UI
 * updates instantly.
 *
 * Call this once near the top of any role-specific tab layout. Returns
 * nothing — the subscription cleans up automatically on unmount.
 *
 * NOTE: no `filter` here. notifications runs with REPLICA IDENTITY default
 * (PK only) so a `user_profile_id=eq.X` filter would silently match nothing.
 * RLS narrows the events to this user's own rows via the
 * `notifications_select_own` policy, so removing the filter is safe.
 */
export function useNotificationsRealtime(): void {
  const qc = useQueryClient()
  const { userProfileId } = useUserRole()

  useEffect(() => {
    if (!userProfileId) return

    const channel = supabase
      .channel(`notifications:staff:${userProfileId}`)
      .on(
        'postgres_changes' as never,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          qc.invalidateQueries({ queryKey: ['staff', 'notifications'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userProfileId, qc])
}
