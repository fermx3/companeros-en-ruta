import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/qr/redeem
 * TASK-014: Redeem a QR code
 *
 * Uses the redeem_qr_code database function for atomic "first to scan wins" logic
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get user profile and verify asesor_de_ventas role
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, tenant_id, distributor_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verify asesor_de_ventas role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('id, role, status')
      .eq('user_profile_id', userProfile.id)

    const hasAsesorRole = roles?.some(role =>
      role.status === 'active' && role.role === 'asesor_de_ventas'
    )

    if (!hasAsesorRole) {
      return NextResponse.json(
        { error: 'Solo los Asesores de Ventas pueden canjear codigos QR' },
        { status: 403 }
      )
    }

    // 4. Parse request body
    const body = await request.json()
    const { qr_code, latitude, longitude, notes } = body

    if (!qr_code) {
      return NextResponse.json(
        { error: 'Codigo QR requerido' },
        { status: 400 }
      )
    }

    // 5. Call the atomic redemption function
    const { data, error: redeemError } = await supabase
      .rpc('redeem_qr_code', {
        p_qr_code: qr_code,
        p_user_profile_id: userProfile.id,
        p_distributor_id: userProfile.distributor_id || null,
        p_latitude: latitude || null,
        p_longitude: longitude || null,
        p_notes: notes || null
      })

    if (redeemError) {
      console.error('Error in redeem_qr_code:', redeemError)
      return NextResponse.json(
        { error: 'Error al procesar el canje', details: redeemError.message },
        { status: 500 }
      )
    }

    // The function returns an array with one row
    const result = data?.[0]

    if (!result) {
      return NextResponse.json(
        { error: 'No se recibio respuesta del servidor' },
        { status: 500 }
      )
    }

    // 6. Return result
    if (!result.success) {
      return NextResponse.json(
        { error: result.message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      redemption_id: result.redemption_id,
      qr_data: result.qr_data
    })

  } catch (error) {
    console.error('Error in POST /api/qr/redeem:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

/**
 * GET /api/qr/redeem?code=XXX
 * Validate a QR code without redeeming it (preview)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // 2. Get QR code from query params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Codigo QR requerido' },
        { status: 400 }
      )
    }

    // 3. Fetch QR code details
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select(`
        id,
        code,
        qr_type,
        status,
        max_redemptions,
        redemption_count,
        discount_type,
        discount_value,
        discount_description,
        valid_from,
        valid_until,
        created_at,
        client:clients(id, public_id, business_name, owner_name),
        promotion:promotions(id, public_id, name, description),
        brand:brands(id, name, logo_url)
      `)
      .eq('code', code)
      .is('deleted_at', null)
      .single()

    if (qrError || !qrCode) {
      return NextResponse.json(
        { error: 'Codigo QR no encontrado', valid: false },
        { status: 404 }
      )
    }

    // 4. Check validity
    const now = new Date()
    const validFrom = new Date(qrCode.valid_from)
    const validUntil = qrCode.valid_until ? new Date(qrCode.valid_until) : null

    let isValid = true
    let validationMessage = 'Codigo QR valido'

    if (qrCode.status !== 'active') {
      isValid = false
      validationMessage = `Codigo QR ${qrCode.status === 'fully_redeemed' ? 'ya fue canjeado' : qrCode.status === 'expired' ? 'expirado' : 'cancelado'}`
    } else if (now < validFrom) {
      isValid = false
      validationMessage = 'Codigo QR aun no es valido'
    } else if (validUntil && now > validUntil) {
      isValid = false
      validationMessage = 'Codigo QR expirado'
    } else if (qrCode.redemption_count >= qrCode.max_redemptions) {
      isValid = false
      validationMessage = 'Codigo QR ha alcanzado el limite de canjes'
    }

    // 5. Return QR info
    return NextResponse.json({
      valid: isValid,
      message: validationMessage,
      qr_code: {
        id: qrCode.id,
        code: qrCode.code,
        type: qrCode.qr_type,
        status: qrCode.status,
        discount: {
          type: qrCode.discount_type,
          value: qrCode.discount_value,
          description: qrCode.discount_description
        },
        redemptions: {
          used: qrCode.redemption_count,
          max: qrCode.max_redemptions,
          remaining: qrCode.max_redemptions - qrCode.redemption_count
        },
        validity: {
          from: qrCode.valid_from,
          until: qrCode.valid_until
        },
        client: qrCode.client,
        promotion: qrCode.promotion,
        brand: qrCode.brand
      }
    })

  } catch (error) {
    console.error('Error in GET /api/qr/redeem:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
