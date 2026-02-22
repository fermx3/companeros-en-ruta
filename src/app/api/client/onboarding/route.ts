import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const onboardingSchema = z.object({
  // Personal & business
  owner_name: z.string().min(1).max(255),
  owner_last_name: z.string().max(255).optional(),
  gender: z.enum(['masculino', 'femenino', 'otro', 'prefiero_no_decir']).optional(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  email: z.string().email().optional().or(z.literal('')),
  email_opt_in: z.boolean().optional(),
  whatsapp: z.string().optional(),
  whatsapp_opt_in: z.boolean().optional(),
  client_type_id: z.string().uuid().optional(),
  address_state: z.string().max(100).optional(),
  address_postal_code: z.string().max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Store equipment
  has_meat_fridge: z.boolean().optional(),
  has_soda_fridge: z.boolean().optional(),
  accepts_card: z.boolean().optional(),

  // Survey fields (stored in metadata JSONB)
  employees: z.string().optional(),
  offers_topups: z.boolean().optional(),
  supply_sources: z.array(z.string()).optional(),
  digital_restock: z.boolean().optional(),
  digital_restock_detail: z.string().optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    // Get client data
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select(`
        id,
        public_id,
        business_name,
        owner_name,
        owner_last_name,
        email,
        whatsapp,
        gender,
        date_of_birth,
        email_opt_in,
        whatsapp_opt_in,
        client_type_id,
        address_state,
        address_postal_code,
        coordinates,
        has_meat_fridge,
        has_soda_fridge,
        accepts_card,
        onboarding_completed,
        metadata,
        tenant_id
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (clientError || !clientData) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    // Get client_types catalog for dropdown
    const { data: clientTypes } = await supabase
      .from('client_types')
      .select('id, name, code')
      .eq('tenant_id', clientData.tenant_id)
      .is('deleted_at', null)
      .order('name')

    return NextResponse.json({
      client: clientData,
      client_types: clientTypes || [],
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Fetch current client to merge metadata
    const { data: currentClient, error: fetchError } = await supabase
      .from('clients')
      .select('id, metadata')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (fetchError || !currentClient) {
      return NextResponse.json(
        { error: 'No se encontró un perfil de cliente asociado a tu cuenta' },
        { status: 404 }
      )
    }

    // Build metadata merge
    const existingMetadata = (currentClient.metadata as Record<string, unknown>) || {}
    const newMetadata: Record<string, unknown> = { ...existingMetadata }
    if (data.employees !== undefined) newMetadata.employees = data.employees
    if (data.offers_topups !== undefined) newMetadata.offers_topups = data.offers_topups
    if (data.supply_sources !== undefined) newMetadata.supply_sources = data.supply_sources
    if (data.digital_restock !== undefined) newMetadata.digital_restock = data.digital_restock
    if (data.digital_restock_detail !== undefined) newMetadata.digital_restock_detail = data.digital_restock_detail

    // Build coordinates point if provided
    let coordinates: string | undefined
    if (data.latitude !== undefined && data.longitude !== undefined) {
      coordinates = `(${data.longitude},${data.latitude})`
    }

    // Build update object
    const updates: Record<string, unknown> = {
      owner_name: data.owner_name,
      onboarding_completed: true,
      metadata: newMetadata,
    }

    if (data.owner_last_name !== undefined) updates.owner_last_name = data.owner_last_name
    if (data.gender !== undefined) updates.gender = data.gender
    if (data.date_of_birth !== undefined) updates.date_of_birth = data.date_of_birth || null
    if (data.email !== undefined) updates.email = data.email || null
    if (data.email_opt_in !== undefined) updates.email_opt_in = data.email_opt_in
    if (data.whatsapp !== undefined) updates.whatsapp = data.whatsapp || null
    if (data.whatsapp_opt_in !== undefined) updates.whatsapp_opt_in = data.whatsapp_opt_in
    if (data.client_type_id !== undefined) updates.client_type_id = data.client_type_id
    if (data.address_state !== undefined) updates.address_state = data.address_state
    if (data.address_postal_code !== undefined) updates.address_postal_code = data.address_postal_code
    if (coordinates !== undefined) updates.coordinates = coordinates
    if (data.has_meat_fridge !== undefined) updates.has_meat_fridge = data.has_meat_fridge
    if (data.has_soda_fridge !== undefined) updates.has_soda_fridge = data.has_soda_fridge
    if (data.accepts_card !== undefined) updates.accepts_card = data.accepts_card

    const { error: updateError } = await supabase
      .from('clients')
      .update(updates)
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al guardar onboarding', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
