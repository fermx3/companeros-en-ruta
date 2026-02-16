import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveBrandAuth, isBrandAuthError, brandAuthErrorResponse } from '@/lib/api/brand-auth'

interface PointsTransactionRequest {
  membership_id: string
  points_amount: number
  // Database enum values only
  transaction_type: 'earned' | 'penalty' | 'adjusted' | 'bonus'
  reference_type?: 'order' | 'visit' | 'promotion' | 'manual' | 'tier_upgrade' | 'birthday' | 'referral' | 'other'
  reference_id?: string
  description?: string
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { userProfileId, allBrandRoles } = result

    // 2. Validate that user has a valid role for points management
    // The resolveBrandAuth already validates brand access, but we also need to check
    // for supervisor/promotor roles which have special permission rules
    // Note: resolveBrandAuth covers brand_manager, brand_admin, and also
    // promotor/supervisor roles (step 7 of resolveBrandAuth). If the user got
    // through resolveBrandAuth, they have at least one valid brand role.

    // 3. Get request body
    const body: PointsTransactionRequest = await request.json()
    const {
      membership_id,
      points_amount,
      transaction_type,
      reference_type = 'manual',
      reference_id,
      description,
      notes
    } = body

    // Validate required fields
    if (!membership_id) {
      return NextResponse.json(
        { error: 'El ID de membresía es requerido' },
        { status: 400 }
      )
    }

    if (points_amount === undefined || points_amount === null) {
      return NextResponse.json(
        { error: 'La cantidad de puntos es requerida' },
        { status: 400 }
      )
    }

    // Validate transaction type (database enum values only)
    const validTypes = ['earned', 'penalty', 'adjusted', 'bonus']
    if (!validTypes.includes(transaction_type)) {
      return NextResponse.json(
        { error: 'Tipo de transacción inválido. Debe ser: earned, penalty, adjusted, o bonus' },
        { status: 400 }
      )
    }

    // 4. Get membership and verify permissions
    const { data: membership, error: membershipError } = await supabase
      .from('client_brand_memberships')
      .select('id, client_id, brand_id, tenant_id, points_balance, lifetime_points, membership_status')
      .eq('id', membership_id)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      )
    }

    // Check if user has permission for this brand/client
    // Look for a brand_manager or brand_admin role for this specific brand
    const brandRole = allBrandRoles.find(role =>
      role.brand_id === membership.brand_id &&
      ['brand_manager', 'brand_admin'].includes(role.role)
    )

    // If no brand manager/admin role, check for supervisor/promotor with client assignment
    let hasClientPermission = false
    if (!brandRole) {
      // Check if client is assigned to this user
      const { data: assignment } = await supabase
        .from('client_assignments')
        .select('id')
        .eq('user_profile_id', userProfileId)
        .eq('client_id', membership.client_id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      hasClientPermission = !!assignment
    }

    if (!brandRole && !hasClientPermission) {
      return NextResponse.json(
        { error: 'No tienes permisos para gestionar puntos de esta membresía' },
        { status: 403 }
      )
    }

    // 5. Verify membership is active
    if (membership.membership_status !== 'active') {
      return NextResponse.json(
        { error: 'Solo se pueden gestionar puntos de membresías activas' },
        { status: 400 }
      )
    }

    // 6. Calculate new balance
    const currentBalance = Number(membership.points_balance) || 0
    const currentLifetime = Number(membership.lifetime_points) || 0
    const pointsAmountNum = Number(points_amount)

    if (isNaN(pointsAmountNum) || pointsAmountNum <= 0) {
      return NextResponse.json(
        { error: 'La cantidad de puntos debe ser un número positivo' },
        { status: 400 }
      )
    }

    // Determine if this is a deduction or addition based on database enum values
    const isDeduction = transaction_type === 'penalty'
    const isAddition = transaction_type === 'earned' || transaction_type === 'bonus'

    let effectiveAmount = Math.abs(pointsAmountNum)
    if (isDeduction) {
      effectiveAmount = -effectiveAmount
      if (currentBalance + effectiveAmount < 0) {
        return NextResponse.json(
          { error: `Saldo insuficiente. Balance actual: ${currentBalance} puntos` },
          { status: 400 }
        )
      }
    }

    const newBalance = currentBalance + effectiveAmount
    const newLifetime = isAddition
      ? currentLifetime + Math.abs(pointsAmountNum)
      : currentLifetime

    // 7. Create transaction record
    const now = new Date().toISOString()
    const transactionDescription = description || `${isAddition ? 'Puntos otorgados' : isDeduction ? 'Puntos deducidos' : 'Ajuste'} manualmente`

    // Build insert object
    // Note: We pass balance_after directly as triggers may not fire in all contexts
    const pointsValue = parseFloat(String(effectiveAmount))
    const basePointsValue = parseFloat(String(Math.abs(pointsAmountNum)))

    const insertData = {
      client_brand_membership_id: membership_id,
      tenant_id: membership.tenant_id,
      transaction_type: transaction_type,
      points: pointsValue,
      balance_after: newBalance,
      source_type: reference_type || 'manual',
      source_description: transactionDescription,
      transaction_date: now,
      base_points: basePointsValue,
      multiplier_applied: 1.0
    }

    console.log('Points transaction insert data:', JSON.stringify(insertData, null, 2))

    const { data: transaction, error: transactionError } = await supabase
      .from('points_transactions')
      .insert(insertData)
      .select()
      .single()

    if (transactionError) {
      throw new Error(`Error al crear transacción: ${transactionError.message}`)
    }

    // 8. Update membership balance
    const { error: updateError } = await supabase
      .from('client_brand_memberships')
      .update({
        points_balance: newBalance,
        lifetime_points: newLifetime,
        updated_at: now
      })
      .eq('id', membership_id)

    if (updateError) {
      throw new Error(`Error al actualizar balance: ${updateError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: `${Math.abs(effectiveAmount)} puntos ${isDeduction ? 'deducidos' : 'otorgados'} correctamente`,
      transaction: {
        id: transaction.id,
        public_id: transaction.public_id,
        points: effectiveAmount,
        transaction_type: transaction_type,
        new_balance: newBalance,
        lifetime_points: newLifetime
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/brand/points:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}

// GET - List points transactions for a membership (Brand Manager view)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Resolve brand auth
    const { searchParams } = new URL(request.url)
    const result = await resolveBrandAuth(supabase, searchParams.get('brand_id'))
    if (isBrandAuthError(result)) return brandAuthErrorResponse(result)
    const { brandId } = result

    // 3. Get query parameters
    const membershipId = searchParams.get('membership_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const transactionType = searchParams.get('type')
    const offset = (page - 1) * limit

    if (!membershipId) {
      return NextResponse.json(
        { error: 'El parámetro membership_id es requerido' },
        { status: 400 }
      )
    }

    // 4. Verify membership belongs to this brand
    const { data: membership, error: membershipError } = await supabase
      .from('client_brand_memberships')
      .select('id, brand_id, points_balance, lifetime_points')
      .eq('id', membershipId)
      .eq('brand_id', brandId)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Membresía no encontrada o no pertenece a tu marca' },
        { status: 404 }
      )
    }

    // 5. Build query - using only common columns
    let query = supabase
      .from('points_transactions')
      .select('*')
      .eq('client_brand_membership_id', membershipId)
      .order('created_at', { ascending: false })

    if (transactionType) {
      query = query.eq('transaction_type', transactionType)
    }

    // 6. Get total count
    let countQuery = supabase
      .from('points_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('client_brand_membership_id', membershipId)

    if (transactionType) {
      countQuery = countQuery.eq('transaction_type', transactionType)
    }

    const { count } = await countQuery

    // 7. Get paginated data
    const { data: transactions, error: dataError } = await query
      .range(offset, offset + limit - 1)

    if (dataError) {
      throw new Error(`Error al obtener transacciones: ${dataError.message}`)
    }

    // 8. Return transactions as-is (columns may vary)
    const transformedTransactions = transactions || []

    return NextResponse.json({
      transactions: transformedTransactions,
      summary: {
        current_balance: membership.points_balance || 0,
        lifetime_points: membership.lifetime_points || 0
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error en GET /api/brand/points:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
