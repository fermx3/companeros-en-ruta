import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

/**
 * POST /api/notifications/demo
 *
 * Creates a notification targeting **the authenticated user themselves** and
 * dispatches push (via createNotification()). Useful to smoke-test the full
 * notification stack end-to-end without having to drive a real domain event
 * (QR scan, order status change, etc.).
 *
 * Body (all optional):
 *   - title?: string         (defaults to "🔔 Notificación de prueba")
 *   - message?: string       (defaults to a generic message)
 *   - notification_type?: string  (defaults to 'system')
 *   - action_url?: string    (optional deep-link path)
 *
 * Auth: any authenticated user. Self-target — you can only send to yourself,
 * so leaving this endpoint enabled is harmless.
 */

const bodySchema = z.object({
  title: z.string().min(1).max(140).optional(),
  message: z.string().min(1).max(500).optional(),
  notification_type: z.string().optional(),
  action_url: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Cuerpo inválido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Resolve self as recipient. Staff users live in user_profiles; client
    // users only have a row in `clients`.
    let tenantId: string
    let userProfileId: string | null = null
    let clientId: string | null = null

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      tenantId = profile.tenant_id
      userProfileId = profile.id
    } else {
      const { data: client } = await supabase
        .from('clients')
        .select('id, tenant_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .is('deleted_at', null)
        .limit(1)
        .single()
      if (!client) {
        return NextResponse.json(
          { error: 'Usuario sin perfil ni cliente activo' },
          { status: 404 }
        )
      }
      tenantId = client.tenant_id
      clientId = client.id
    }

    const result = await createNotification({
      tenant_id: tenantId,
      user_profile_id: userProfileId ?? undefined,
      client_id: clientId ?? undefined,
      title: parsed.data.title ?? '🔔 Notificación de prueba',
      message: parsed.data.message
        ?? 'Esta es una notificación demo enviada desde /api/notifications/demo.',
      notification_type: (parsed.data.notification_type ?? 'system') as Parameters<
        typeof createNotification
      >[0]['notification_type'],
      action_url: parsed.data.action_url,
      metadata: { demo: true, source: 'api/notifications/demo' },
    })

    return NextResponse.json({
      notification_id: result.id,
      sent_to: clientId ? { client_id: clientId } : { user_profile_id: userProfileId },
      message: 'Notificación creada. El push se dispara en background.',
    })
  } catch (error) {
    console.error('[POST /api/notifications/demo]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
