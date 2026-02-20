import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { escapeCsvValue, csvResponse, formatCsvDate } from '@/lib/utils/csv'
import { resolveAsesorAuth, isAsesorAuthError, asesorAuthErrorResponse } from '@/lib/api/asesor-auth'

/**
 * GET /api/asesor-ventas/qr-history/export
 * Export QR redemption history as CSV for billing purposes
 * TASK-002f: Tracking QRs para facturación distribuidor→marca
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Authenticate and verify asesor role
        const authResult = await resolveAsesorAuth(supabase)
        if (isAsesorAuthError(authResult)) return asesorAuthErrorResponse(authResult)
        const { userProfileId, distributorId } = authResult

        // Fetch extra profile fields needed for CSV export
        const { data: profileExtra } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', userProfileId)
            .single()

        const firstName = profileExtra?.first_name || ''
        const lastName = profileExtra?.last_name || ''

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
            .eq('redeemed_by', userProfileId)
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
        if (distributorId) {
            const { data: distributor } = await supabase
                .from('distributors')
                .select('name')
                .eq('id', distributorId)
                .single()

            if (distributor) {
                distributorName = distributor.name
            }
        }

        // 7. Generate CSV using shared utility
        const headers = [
            'Fecha Canje', 'ID Redención', 'Código QR', 'Cliente',
            'ID Cliente', 'Teléfono Cliente', 'Dirección Cliente',
            'Promoción', 'Marca', 'Tipo Descuento', 'Valor Descuento',
            'Descripción', 'Latitud', 'Longitud', 'Notas',
            'Distribuidor', 'Asesor'
        ]

        const discountTypeMap: Record<string, string> = {
            'percentage': 'Porcentaje',
            'fixed_amount': 'Monto Fijo',
            'free_product': 'Producto Gratis',
            'points': 'Puntos'
        }

        const rows = (redemptions || []).map(r => {
            const qr = r.qr_code as any
            const client = qr?.client
            const promotion = qr?.promotion
            const brand = qr?.brand

            const addressParts = [
                client?.address_street, client?.address_city,
                client?.address_state, client?.address_postal_code
            ].filter(Boolean)

            return [
                formatCsvDate(r.redeemed_at),
                r.id,
                qr?.code || '',
                client?.business_name || '',
                client?.public_id || '',
                client?.phone || '',
                addressParts.join(', '),
                promotion?.name || '',
                brand?.name || '',
                r.discount_type ? discountTypeMap[r.discount_type] || r.discount_type : 'N/A',
                r.discount_value !== null ? r.discount_value.toString() : '0',
                qr?.discount_description || '',
                r.latitude?.toString() || '',
                r.longitude?.toString() || '',
                r.notes || '',
                distributorName,
                `${firstName} ${lastName}`
            ]
        })

        // 8. Build and return CSV using shared utility (includes UTF-8 BOM)
        const UTF8_BOM = '\uFEFF'
        const headerLine = headers.map(escapeCsvValue).join(',')
        const dataLines = rows.map(row => row.map(escapeCsvValue).join(','))
        const csv = UTF8_BOM + [headerLine, ...dataLines].join('\n')

        return csvResponse(csv, `facturacion_qr_${new Date().toISOString().split('T')[0]}.csv`)

    } catch (error) {
        console.error('Error in GET /api/asesor-ventas/qr-history/export:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

        return NextResponse.json(
            { error: 'Error interno del servidor', details: errorMessage },
            { status: 500 }
        )
    }
}
