import { createServiceClient } from '@/lib/supabase/server';
import type { NotificationType } from '@/lib/types/database';

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

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      tenant_id: params.tenant_id,
      user_profile_id: params.user_profile_id ?? null,
      client_id: params.client_id ?? null,
      title: params.title,
      message: params.message,
      notification_type: params.notification_type ?? 'system',
      action_url: params.action_url,
      metadata: params.metadata ?? {},
    } as any)
    .select('id')
    .single();

  if (error) {
    console.error('[createNotification] Error:', error.message);
    throw new Error(`Failed to create notification: ${error.message}`);
  }

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
    .insert(rows as any)
    .select('id');

  if (error) {
    console.error('[createBulkNotifications] Error:', error.message);
    throw new Error(`Failed to create bulk notifications: ${error.message}`);
  }

  return data;
}
