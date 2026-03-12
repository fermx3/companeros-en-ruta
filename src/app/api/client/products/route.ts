import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/client/products
 * Fetch featured products from brands the client has active memberships with.
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            )
        }

        // Get client
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (clientError || !client) {
            return NextResponse.json(
                { error: 'Cliente no encontrado' },
                { status: 404 }
            )
        }

        // Get active brand memberships
        const { data: memberships, error: membershipsError } = await supabase
            .from('client_brand_memberships')
            .select('brand_id')
            .eq('client_id', client.id)
            .eq('membership_status', 'active')
            .is('deleted_at', null)

        if (membershipsError) {
            console.error('Error fetching memberships:', membershipsError)
            return NextResponse.json(
                { error: 'Error al obtener membresías' },
                { status: 500 }
            )
        }

        const brandIds = memberships?.map(m => m.brand_id) || []

        if (brandIds.length === 0) {
            return NextResponse.json({ products: [] })
        }

        // Fetch featured active products from those brands
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
                id,
                public_id,
                name,
                base_price,
                product_image_url,
                brand:brands(id, name, logo_url),
                category:product_categories(id, name)
            `)
            .in('brand_id', brandIds)
            .eq('is_active', true)
            .eq('is_featured', true)
            .is('deleted_at', null)
            .order('brand_id')
            .order('name')
            .limit(8)

        if (productsError) {
            console.error('Error fetching products:', productsError)
            return NextResponse.json(
                { error: 'Error al obtener productos' },
                { status: 500 }
            )
        }

        return NextResponse.json({ products: products || [] })

    } catch (error) {
        console.error('Error in GET /api/client/products:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        return NextResponse.json(
            { error: 'Error interno del servidor', details: errorMessage },
            { status: 500 }
        )
    }
}
