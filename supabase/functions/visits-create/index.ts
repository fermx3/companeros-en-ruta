import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateVisitRequest {
  client_id: string
  brand_id: string
  visit_date?: string
  notes?: string
  latitude?: number
  longitude?: number
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente Supabase con service_role para bypassear RLS temporalmente
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Obtener usuario autenticado del header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verificar token y obtener usuario
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const visitData: CreateVisitRequest = await req.json()

    // Validaciones
    if (!visitData.client_id || !visitData.brand_id) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'client_id and brand_id are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verificar que el usuario tenga acceso al cliente y marca
    const { data: clientAccess } = await supabaseClient
      .from('client_brand_profiles')
      .select('id')
      .eq('client_id', visitData.client_id)
      .eq('brand_id', visitData.brand_id)
      .eq('assigned_asesor_id', user.id)
      .single()

    if (!clientAccess) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Access denied to this client',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generar número de visita secuencial
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabaseClient
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('asesor_id', user.id)
      .eq('visit_date', visitData.visit_date || today)

    const visitNumber = `V${(visitData.visit_date || today).replace(
      /-/g,
      ''
    )}-${(count || 0) + 1}`

    // Obtener tenant_id del usuario
    const { data: userData } = await supabaseClient
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    // Crear visita
    const { data: visit, error: visitError } = await supabaseClient
      .from('visits')
      .insert({
        tenant_id: userData?.tenant_id,
        client_id: visitData.client_id,
        brand_id: visitData.brand_id,
        asesor_id: user.id,
        visit_number: visitNumber,
        visit_date: visitData.visit_date || today,
        start_time: new Date().toISOString(),
        status: 'in_progress',
        notes: visitData.notes,
        latitude: visitData.latitude,
        longitude: visitData.longitude,
      })
      .select()
      .single()

    if (visitError) {
      console.error('Error creating visit:', visitError)
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Failed to create visit',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        visit_id: visit.id,
        status: 'success',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in visits-create function:', error)
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
