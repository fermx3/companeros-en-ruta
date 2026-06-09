import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient, createServiceClient } from '@/lib/supabase/server'

// POST /api/device/register-token
// Registers (or refreshes) an Expo Push token for the authenticated user.
// Supports both staff (user_profile_id) and client (client_id) recipients.
// The endpoint reads the user from the bearer token, resolves the recipient
// shape, then upserts via the service client so RLS doesn't block first-time
// insert for a brand-new device.

const bodySchema = z.object({
  expo_push_token: z.string().min(10),
  device_id: z.string().optional(),
  app_variant: z.enum(['client_mobile', 'staff_mobile']),
  platform: z.enum(['ios', 'android', 'web']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Cuerpo inválido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // Resolve recipient: staff users have a user_profile row; client users
    // only live in `clients`. Mirror the same recipient-or-client pattern
    // used by survey_responses, notifications, etc.
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
          { error: 'Usuario no vinculado a perfil ni cliente activo' },
          { status: 404 }
        )
      }
      tenantId = client.tenant_id
      clientId = client.id
    }

    // app_variant must match the recipient kind. Staff app for staff users,
    // client app for client users.
    if (parsed.data.app_variant === 'client_mobile' && !clientId) {
      return NextResponse.json(
        { error: 'app_variant=client_mobile requiere usuario cliente' },
        { status: 403 }
      )
    }
    if (parsed.data.app_variant === 'staff_mobile' && !userProfileId) {
      return NextResponse.json(
        { error: 'app_variant=staff_mobile requiere perfil de staff' },
        { status: 403 }
      )
    }

    const service = createServiceClient()

    // Upsert by (expo_push_token, app_variant). If the token already exists
    // for a different user (very unusual — device passed between accounts),
    // we overwrite the recipient with the new one and reactivate.
    const { data: upserted, error: upsertError } = await service
      .from('push_tokens')
      .upsert(
        {
          tenant_id: tenantId,
          user_profile_id: userProfileId,
          client_id: clientId,
          expo_push_token: parsed.data.expo_push_token,
          device_id: parsed.data.device_id ?? null,
          app_variant: parsed.data.app_variant,
          platform: parsed.data.platform ?? null,
          is_active: true,
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: 'expo_push_token,app_variant' }
      )
      .select('id, expo_push_token, app_variant')
      .single()

    if (upsertError) {
      console.error('Error registering push token:', upsertError)
      return NextResponse.json(
        { error: 'No se pudo registrar el token' },
        { status: 500 }
      )
    }

    return NextResponse.json({ token: upserted, message: 'Token registrado' })
  } catch (error) {
    console.error('Error en POST /api/device/register-token:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/device/register-token
// Body: { expo_push_token: string, app_variant: 'client_mobile' | 'staff_mobile' }
// Marks the token as inactive (does NOT delete the row — kept for audit).
// Called on signOut; safe to call even if the token isn't ours (no-op).

const deleteSchema = z.object({
  expo_push_token: z.string().min(10),
  app_variant: z.enum(['client_mobile', 'staff_mobile']),
})

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
    }

    // Resolve recipient (same as POST). We only deactivate tokens that belong
    // to this user — RLS would block it via the regular client, so we use the
    // service client and add the recipient filter ourselves.
    let userProfileId: string | null = null
    let clientId: string | null = null

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (profile) userProfileId = profile.id

    if (!userProfileId) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      if (client) clientId = client.id
    }

    const service = createServiceClient()
    const query = service
      .from('push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('expo_push_token', parsed.data.expo_push_token)
      .eq('app_variant', parsed.data.app_variant)

    if (userProfileId) query.eq('user_profile_id', userProfileId)
    else if (clientId) query.eq('client_id', clientId)
    else return NextResponse.json({ message: 'No recipient' }, { status: 200 })

    const { error: updateError } = await query
    if (updateError) {
      console.error('Error deactivating push token:', updateError)
      return NextResponse.json(
        { error: 'No se pudo desactivar el token' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Token desactivado' })
  } catch (error) {
    console.error('Error en DELETE /api/device/register-token:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
