import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/notifications - Lista paginada de notificaciones del usuario autenticado
 * Query params: ?page=1&limit=20&unread_only=true
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // RLS ensures user can only see their own notifications
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_profile_id', profile.id)
      .is('deleted_at', null);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error: notifError, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (notifError) {
      console.error('[GET /api/notifications] Error:', notifError.message);
      return NextResponse.json(
        { error: `Error al obtener notificaciones: ${notifError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: notifications ?? [],
      count: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    console.error('[GET /api/notifications] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications - Marcar notificaciones como leídas
 * Body: { notification_ids: string[] } or { mark_all_read: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { notification_ids, mark_all_read } = body as {
      notification_ids?: string[];
      mark_all_read?: boolean;
    };

    if (!mark_all_read && (!notification_ids || notification_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Se requiere notification_ids o mark_all_read' },
        { status: 400 }
      );
    }

    // RLS ensures user can only update their own notifications
    let query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_profile_id', profile.id)
      .eq('is_read', false);

    if (!mark_all_read && notification_ids) {
      query = query.in('id', notification_ids);
    }

    const { error: updateError, count } = await query.select('id');

    if (updateError) {
      console.error('[PATCH /api/notifications] Error:', updateError.message);
      return NextResponse.json(
        { error: `Error al actualizar notificaciones: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ updated: count ?? 0 });
  } catch (error) {
    console.error('[PATCH /api/notifications] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * DELETE /api/notifications - Soft-delete notificaciones
 * Body: { notification_ids: string[] } or { delete_all_read: true }
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { notification_ids, delete_all_read } = body as {
      notification_ids?: string[];
      delete_all_read?: boolean;
    };

    if (!delete_all_read && (!notification_ids || notification_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Se requiere notification_ids o delete_all_read' },
        { status: 400 }
      );
    }

    // Soft-delete via UPDATE (RLS only has UPDATE policy)
    let query = supabase
      .from('notifications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_profile_id', profile.id)
      .is('deleted_at', null);

    if (delete_all_read) {
      query = query.eq('is_read', true);
    } else if (notification_ids) {
      query = query.in('id', notification_ids);
    }

    const { error: deleteError, count } = await query.select('id');

    if (deleteError) {
      console.error('[DELETE /api/notifications] Error:', deleteError.message);
      return NextResponse.json(
        { error: `Error al eliminar notificaciones: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: count ?? 0 });
  } catch (error) {
    console.error('[DELETE /api/notifications] Unexpected error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
