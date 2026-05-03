import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveAsesorAuth, isAsesorAuthError, asesorAuthErrorResponse } from '@/lib/api/asesor-auth'

interface Product {
  id: string
  public_id: string
  name: string
  sku: string
  barcode: string | null
  description: string | null
  base_price: number
  unit_type: string
  is_active: boolean
  product_image_url: string | null
  category: {
    id: string
    name: string
  } | null
  brand: {
    id: string
    name: string
  } | null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate and verify asesor role
    const authResult = await resolveAsesorAuth(supabase)
    if (isAsesorAuthError(authResult)) return asesorAuthErrorResponse(authResult)
    const { userProfileId, brandId } = authResult

    // 4. Obtener parametros de busqueda
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('category_id') || ''
    const clientId = searchParams.get('client_id') || ''

    // 5. Determinar las marcas de las cuales obtener productos
    let brandIds: string[] = []

    if (brandId) {
      // Rol con marca asignada (promotor, etc): solo productos de su marca
      brandIds = [brandId]
    } else {
      // Asesor de ventas sin marca: productos de las marcas del cliente
      if (!clientId) {
        return NextResponse.json({
          products: [],
          message: 'Se requiere client_id para obtener productos'
        })
      }

      // Verificar que el asesor tiene acceso al cliente
      const { data: clientAssignment } = await supabase
        .from('client_assignments')
        .select('id')
        .eq('client_id', clientId)
        .eq('user_profile_id', userProfileId)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single()

      if (!clientAssignment) {
        return NextResponse.json(
          { error: 'No tiene acceso a este cliente' },
          { status: 403 }
        )
      }

      // Obtener las marcas a las que el cliente está suscrito
      const { data: clientMemberships, error: membershipsError } = await supabase
        .from('client_brand_memberships')
        .select('brand_id')
        .eq('client_id', clientId)
        .eq('membership_status', 'active')
        .is('deleted_at', null)

      if (membershipsError) {
        console.error('Error fetching client memberships:', membershipsError)
        return NextResponse.json(
          { error: 'Error al obtener suscripciones del cliente' },
          { status: 500 }
        )
      }

      brandIds = (clientMemberships || [])
        .map(m => m.brand_id)
        .filter((id): id is string => id !== null)

      if (brandIds.length === 0) {
        return NextResponse.json({
          products: [],
          message: 'El cliente no está suscrito a ninguna marca'
        })
      }
    }

    // 6. Consultar productos de las marcas determinadas
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        public_id,
        name,
        sku,
        barcode,
        description,
        base_price,
        unit_type,
        is_active,
        product_image_url,
        category:product_categories(
          id,
          name
        ),
        brand:brands(
          id,
          name
        )
      `)
      .in('brand_id', brandIds)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    // Aplicar filtros
    if (search) {
      productsQuery = productsQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }

    if (categoryId) {
      productsQuery = productsQuery.eq('category_id', categoryId)
    }

    const { data: productsData, error: productsError } = await productsQuery

    if (productsError) {
      console.error('Error fetching products:', productsError)
      return NextResponse.json(
        { error: 'Error al obtener productos', details: productsError.message },
        { status: 500 }
      )
    }

    // 7. Transformar datos
    const products: Product[] = (productsData || []).map((product: unknown) => {
      const p = product as Record<string, unknown>

      const categoryData = p.category as unknown
      const category = (Array.isArray(categoryData) ? categoryData[0] : categoryData) as {
        id: string
        name: string
      } | null

      const brandData = p.brand as unknown
      const brand = (Array.isArray(brandData) ? brandData[0] : brandData) as {
        id: string
        name: string
      } | null

      return {
        id: p.id as string,
        public_id: p.public_id as string,
        name: p.name as string,
        sku: p.sku as string,
        barcode: p.barcode as string | null,
        description: p.description as string | null,
        base_price: (p.base_price || 0) as number,
        unit_type: (p.unit_type || 'pieza') as string,
        is_active: p.is_active as boolean,
        product_image_url: p.product_image_url as string | null,
        category,
        brand
      }
    })

    return NextResponse.json({
      products,
      total: products.length
    })

  } catch (error) {
    console.error('Error en GET /api/asesor-ventas/products:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    return NextResponse.json(
      { error: 'Error interno del servidor', details: errorMessage },
      { status: 500 }
    )
  }
}
