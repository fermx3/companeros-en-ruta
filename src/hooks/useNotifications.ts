'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Notification } from '@/lib/types/database';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  // Extract profile id safely — userProfile is typed as `unknown`
  const profileId = (userProfile as { id?: string } | null)?.id ?? null;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data ?? []);
    } catch (err) {
      console.error('[useNotifications] fetch error:', err);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (!res.ok) return;
      const json = await res.json();
      setUnreadCount(json.count ?? 0);
    } catch (err) {
      console.error('[useNotifications] unread count error:', err);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [profileId, refresh]);

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!profileId) return;

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`notifications:${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_profile_id=eq.${profileId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  const markAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: ids }),
      });
      if (!res.ok) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          ids.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (err) {
      console.error('[useNotifications] markAsRead error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_read: true }),
      });
      if (!res.ok) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: n.read_at ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('[useNotifications] markAllAsRead error:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: [id] }),
      });
      if (!res.ok) return;

      // Optimistic update
      const removed = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (removed && !removed.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[useNotifications] deleteNotification error:', err);
    }
  }, [notifications]);

  const deleteAllRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delete_all_read: true }),
      });
      if (!res.ok) return;

      // Optimistic update: remove all read notifications
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } catch (err) {
      console.error('[useNotifications] deleteAllRead error:', err);
    }
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, deleteAllRead, refresh };
}
