import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/asesor-ventas/qr-history/export
 * Export QR redemption history as CSV for billing purposes
 * TASK-002f: Tracking QRs para facturación distribuidor→marca
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

        // 2. Get user profile
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, tenant_id, distributor_id, first_name, last_name')
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
                { error: 'Acceso no autorizado' },
                { status: 403 }
            )
        }

        // 4. Get query params for filtering
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')

        // 5. Build query
        let query = supabase
            .from('qr_redemptions')
            .select(`
        id,
        qr_code_id,
        status,
        discount_type,
        discount_value,
        latitude,
        longitude,
        notes,
        redeemed_at,
        created_at,
        qr_code:qr_codes(
          id,
          code,
          discount_description,
          client:clients(
            id,
            public_id,
            business_name,
            owner_name,
            phone,
            address_street,
            address_city,
            address_state,
            address_postal_code
          ),
          promotion:promotions(
            id,
            public_id,
            name,
            description
          ),
          brand:brands(
            id,
            name
          )
        )
      `)
            .eq('redeemed_by', userProfile.id)
            .eq('status', 'completed') // Only completed redemptions for billing
            .order('redeemed_at', { ascending: false })

        // Apply date filters if provided
        if (startDate) {
            query = query.gte('redeemed_at', startDate)
        }
        if (endDate) {
            query = query.lte('redeemed_at', endDate)
        }

        const { data: redemptions, error: redemptionsError } = await query

        if (redemptionsError) {
            console.error('Error fetching redemptions:', redemptionsError)
            return NextResponse.json(
                { error: 'Error al obtener datos de facturación' },
                { status: 500 }
            )
        }

        // 6. Get distributor info if available
        let distributorName = 'N/A'
        if (userProfile.distributor_id) {
            const { data: distributor } = await supabase
                .from('distributors')
                .select('name')
                .eq('id', userProfile.distributor_id)
                .single()

            if (distributor) {
                distributorName = distributor.name
            }
        }

        // 7. Generate CSV
        const csvHeaders = [
            'Fecha Canje',
            'ID Redención',
            'Código QR',
            'Cliente',
            'ID Cliente',
            'Teléfono Cliente',
            'Dirección Cliente',
            'Promoción',
            'Marca',
            'Tipo Descuento',
            'Valor Descuento',
            'Descripción',
            'Latitud',
            'Longitud',
            'Notas',
            'Distribuidor',
            'Asesor'
        ].join(',')

        const csvRows = redemptions?.map(r => {
            const qr = r.qr_code as any
            const client = qr?.client
            const promotion = qr?.promotion
            const brand = qr?.brand

            // Format date - use ISO-like format without commas to avoid CSV issues
            const date = new Date(r.redeemed_at).toLocaleString('es-MX', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).replace(',', '') // Remove comma between date and time

            // Format discount type
            const discountTypeMap: Record<string, string> = {
                'percentage': 'Porcentaje',
                'fixed_amount': 'Monto Fijo',
                'free_product': 'Producto Gratis',
                'points': 'Puntos'
            }

            const discountType = r.discount_type ? discountTypeMap[r.discount_type] || r.discount_type : 'N/A'
            const discountValue = r.discount_value !== null ? r.discount_value.toString() : '0'

            // Format address from separate columns
            const addressParts = [
                client?.address_street,
                client?.address_city,
                client?.address_state,
                client?.address_postal_code
            ].filter(Boolean)
            const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : ''

            // Escape CSV values (handle commas and quotes)
            const escape = (val: string | null | undefined) => {
                if (!val) return ''
                const str = String(val)
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`
                }
                return str
            }

            return [
                date,
                r.id,
                escape(qr?.code),
                escape(client?.business_name),
                escape(client?.public_id),
                escape(client?.phone),
                escape(fullAddress),
                escape(promotion?.name),
                escape(brand?.name),
                discountType,
                discountValue,
                escape(qr?.discount_description),
                r.latitude?.toString() || '',
                r.longitude?.toString() || '',
                escape(r.notes),
                escape(distributorName),
                `${userProfile.first_name} ${userProfile.last_name}`
            ].join(',')
        }) || []

        const csv = [csvHeaders, ...csvRows].join('\n')

        // 8. Return CSV file
        const filename = `facturacion_qr_${new Date().toISOString().split('T')[0]}.csv`

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-cache'
            }
        })

    } catch (error) {
        console.error('Error in GET /api/asesor-ventas/qr-history/export:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

        return NextResponse.json(
            { error: 'Error interno del servidor', details: errorMessage },
            { status: 500 }
        )
    }
}
