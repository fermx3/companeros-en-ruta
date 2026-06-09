import { Expo, type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk'

import { createServiceClient } from '@/lib/supabase/server'

/**
 * Sends Expo push notifications to all active tokens belonging to the given
 * recipients. Intended to be called fire-and-forget right after notifications
 * are inserted to the `notifications` table.
 *
 * Failures are swallowed (logged only): the in-app notification is the
 * source of truth; push is best-effort delivery on top.
 */

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN, // optional but raises rate limits
})

interface PushRecipient {
  /** One of these MUST be set (matches the notifications recipient shape). */
  user_profile_id?: string | null
  client_id?: string | null
  /** What we want the user to see. */
  title: string
  body: string
  /** Deep-link path opened on tap. Stored in the push payload's `data.url`. */
  url?: string | null
  /** Extra context for the mobile client (notification_id, type, etc.). */
  data?: Record<string, unknown>
}

export async function sendPushToRecipients(recipients: PushRecipient[]): Promise<void> {
  if (recipients.length === 0) return

  // 1. Collect distinct recipient ids by type.
  const userProfileIds = new Set<string>()
  const clientIds = new Set<string>()
  for (const r of recipients) {
    if (r.user_profile_id) userProfileIds.add(r.user_profile_id)
    if (r.client_id) clientIds.add(r.client_id)
  }

  if (userProfileIds.size === 0 && clientIds.size === 0) return

  // 2. Look up active tokens for those recipients. Service client because we
  //    need to read tokens that don't belong to the request's caller.
  const service = createServiceClient()
  const tokenRows: { expo_push_token: string; user_profile_id: string | null; client_id: string | null }[] = []

  if (userProfileIds.size > 0) {
    const { data, error } = await service
      .from('push_tokens')
      .select('expo_push_token, user_profile_id, client_id')
      .in('user_profile_id', Array.from(userProfileIds))
      .eq('is_active', true)
    if (error) console.error('[sendPush] read user tokens:', error.message)
    if (data) tokenRows.push(...data)
  }
  if (clientIds.size > 0) {
    const { data, error } = await service
      .from('push_tokens')
      .select('expo_push_token, user_profile_id, client_id')
      .in('client_id', Array.from(clientIds))
      .eq('is_active', true)
    if (error) console.error('[sendPush] read client tokens:', error.message)
    if (data) tokenRows.push(...data)
  }

  if (tokenRows.length === 0) return

  // 3. Build messages: each recipient may have multiple tokens (multiple
  //    devices), and each notification can fan out to all of them.
  const messages: ExpoPushMessage[] = []
  for (const r of recipients) {
    for (const t of tokenRows) {
      const matches = (r.user_profile_id && t.user_profile_id === r.user_profile_id)
        || (r.client_id && t.client_id === r.client_id)
      if (!matches) continue
      if (!Expo.isExpoPushToken(t.expo_push_token)) continue
      messages.push({
        to: t.expo_push_token,
        sound: 'default',
        title: r.title,
        body: r.body,
        data: { url: r.url ?? null, ...(r.data ?? {}) },
      })
    }
  }

  if (messages.length === 0) return

  // 4. Chunk + send. Expo recommends ≤100 messages per request.
  const chunks = expo.chunkPushNotifications(messages)
  const tickets: ExpoPushTicket[] = []
  for (const chunk of chunks) {
    try {
      const chunkTickets = await expo.sendPushNotificationsAsync(chunk)
      tickets.push(...chunkTickets)
    } catch (err) {
      console.error('[sendPush] chunk error:', err)
    }
  }

  // 5. Deactivate tokens reported as invalid by Expo. Don't await — fire and
  //    forget so the request completes quickly.
  const invalidTokens: string[] = []
  tickets.forEach((ticket, idx) => {
    if (ticket.status === 'error') {
      const message = messages[idx]
      const errorType = ticket.details?.error
      if (errorType === 'DeviceNotRegistered' && typeof message?.to === 'string') {
        invalidTokens.push(message.to)
      }
    }
  })
  if (invalidTokens.length > 0) {
    void service
      .from('push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in('expo_push_token', invalidTokens)
      .then(({ error }) => {
        if (error) console.error('[sendPush] deactivate invalid:', error.message)
      })
  }
}
