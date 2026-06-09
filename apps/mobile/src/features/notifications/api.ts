import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface NotificationItem {
  id: string
  title: string
  message: string
  notification_type: string
  is_read: boolean
  read_at: string | null
  action_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Shape returned by GET /api/notifications. Flat — not nested under
// `pagination`. The endpoint owns the contract; we match it exactly.
export interface NotificationsListResponse {
  data: NotificationItem[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export function useNotifications(unreadOnly = false, limit = 20) {
  return useInfiniteQuery<NotificationsListResponse>({
    queryKey: ['staff', 'notifications', unreadOnly ? 'unread' : 'all', limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const qs = new URLSearchParams({ page: String(pageParam), limit: String(limit) })
      if (unreadOnly) qs.set('unread_only', 'true')
      return apiFetch<NotificationsListResponse>(`/api/notifications?${qs.toString()}`)
    },
    getNextPageParam: last =>
      last.page < last.totalPages ? last.page + 1 : undefined,
  })
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ['staff', 'notifications', 'unread-count'],
    queryFn: () => apiFetch<{ count: number }>('/api/notifications/unread-count'),
    // Refresh every 60s in case realtime missed something (e.g., backgrounded).
    refetchInterval: 60_000,
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      apiFetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ notification_ids: notificationIds }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'notifications'] })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ mark_all_read: true }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff', 'notifications'] })
    },
  })
}
