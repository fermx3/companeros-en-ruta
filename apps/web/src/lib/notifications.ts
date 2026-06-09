import { createServiceClient } from '@/lib/supabase/server';
import { sendPushToRecipients } from '@/lib/push';
import type { Database } from '@companeros/shared/types/supabase';
import type { NotificationType } from '@companeros/shared/types/database';

type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

interface CreateNotificationParams {
  tenant_id: string;
  /** Required for staff users. Mutually exclusive with client_id — at least one must be set. */
  user_profile_id?: string;
  /** Required for client users. Mutually exclusive with user_profile_id — at least one must be set. */
  client_id?: string;
  title: string;
  message: string;
  notification_type?: NotificationType;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a single notification using the service client (bypasses RLS).
 * Call from API routes or server actions only.
 */
export async function createNotification(params: CreateNotificationParams) {
  if (!params.user_profile_id && !params.client_id) {
    throw new Error('createNotification requires either user_profile_id or client_id');
  }

  const supabase = createServiceClient();

  // metadata is Record<string, unknown> while the generated Supabase Insert
  // type expects strict Json — cast bridges the runtime/compile gap.
  const insert = {
    tenant_id: params.tenant_id,
    user_profile_id: params.user_profile_id ?? null,
    client_id: params.client_id ?? null,
    title: params.title,
    message: params.message,
    notification_type: params.notification_type ?? 'system',
    action_url: params.action_url,
    metadata: params.metadata ?? {},
  } as unknown as NotificationInsert;

  const { data, error } = await supabase
    .from('notifications')
    .insert(insert)
    .select('id')
    .single();

  if (error) {
    console.error('[createNotification] Error:', error.message);
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  // Fire-and-forget push dispatch. Failures don't fail the in-app notification
  // (which already lives in the table and will reach the recipient via the
  // app's realtime subscription).
  void sendPushToRecipients([
    {
      user_profile_id: params.user_profile_id,
      client_id: params.client_id,
      title: params.title,
      body: params.message,
      url: params.action_url ?? null,
      data: { notification_id: data.id, notification_type: params.notification_type ?? 'system' },
    },
  ]).catch(err => console.error('[createNotification] push dispatch:', err));

  return data;
}

/**
 * Creates multiple notifications in a single batch insert.
 * Call from API routes or server actions only.
 */
export async function createBulkNotifications(params: CreateNotificationParams[]) {
  if (params.length === 0) return [];

  const supabase = createServiceClient();

  const rows = params.map((p) => {
    if (!p.user_profile_id && !p.client_id) {
      throw new Error('createBulkNotifications: each entry requires either user_profile_id or client_id');
    }
    return {
      tenant_id: p.tenant_id,
      user_profile_id: p.user_profile_id ?? null,
      client_id: p.client_id ?? null,
      title: p.title,
      message: p.message,
      notification_type: p.notification_type ?? 'system',
      action_url: p.action_url,
      metadata: p.metadata ?? {},
    };
  });

  const { data, error } = await supabase
    .from('notifications')
    .insert(rows as unknown as NotificationInsert[])
    .select('id');

  if (error) {
    console.error('[createBulkNotifications] Error:', error.message);
    throw new Error(`Failed to create bulk notifications: ${error.message}`);
  }

  // Fire-and-forget push dispatch for the whole batch. `data` rows match the
  // input `params` order, so we can correlate notification_id back to each.
  void sendPushToRecipients(
    params.map((p, idx) => ({
      user_profile_id: p.user_profile_id,
      client_id: p.client_id,
      title: p.title,
      body: p.message,
      url: p.action_url ?? null,
      data: {
        notification_id: data?.[idx]?.id,
        notification_type: p.notification_type ?? 'system',
      },
    }))
  ).catch(err => console.error('[createBulkNotifications] push dispatch:', err));

  return data;
}
