# API Integration Skill

## Arquitectura API del Proyecto

**Compañeros en Ruta** usa **Next.js App Router** con **Route Handlers** para APIs REST y **Supabase** para realtime:

```
src/app/api/
├── auth/           # Autenticación personalizada
├── admin/          # Gestión de tenants, users, brands
├── brand/          # APIs específicas de marca
├── client/         # APIs para clientes finales
├── visits/         # Tracking de visitas
├── orders/         # Gestión de órdenes
├── qr/             # Sistema QR codes
└── webhooks/       # Integraciones externas
```

## Patrones de Autenticación y Autorización

### 1. Auth Handler Base
```typescript
// src/lib/auth/middleware.ts
export async function withAuth(
  request: NextRequest,
  handler: (user: User, supabase: SupabaseClient) => Promise<Response>
) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handler(user, supabase)
}
```

### 2. Role-Based Authorization
```typescript
// src/lib/auth/permissions.ts
export async function checkRole(
  supabase: SupabaseClient,
  userId: string,
  requiredRole: UserRole,
  brandId?: string
): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role, brand_id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (!data) return false

  // Admin puede todo
  if (data.role === 'admin') return true

  // Brand-scoped roles
  if (brandId && data.brand_id !== brandId) return false

  return data.role === requiredRole
}
```

### 3. Multi-tenant Context
```typescript
// src/lib/auth/context.ts
export async function getTenantContext(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id, brand_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')

  return { userId: user.id, tenantId: profile.tenant_id, brandId: profile.brand_id }
}
```

## Route Handlers por Dominio

### 1. Admin APIs (`/api/admin/`)

#### Gestión de Usuarios
```typescript
// src/app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    const isAdmin = await checkRole(supabase, user.id, 'admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { tenantId } = await getTenantContext(supabase)

    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles!user_profiles_user_id_fkey(role, brand_id, is_active)
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: users })
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    const isAdmin = await checkRole(supabase, user.id, 'admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { tenantId } = await getTenantContext(supabase)

    // Crear usuario con transacción
    const { data: newUser, error } = await supabase.rpc('create_user_with_role', {
      p_tenant_id: tenantId,
      p_email: body.email,
      p_first_name: body.first_name,
      p_last_name: body.last_name,
      p_role: body.role,
      p_brand_id: body.brand_id
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: newUser }, { status: 201 })
  })
}
```

### 2. Brand APIs (`/api/brand/`)

#### Gestión de Clientes
```typescript
// src/app/api/brand/clients/route.ts
export async function GET(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    const { tenantId, brandId } = await getTenantContext(supabase)

    // Verificar acceso a la marca
    const hasAccess = await checkRole(supabase, user.id, 'brand') ||
                     await checkRole(supabase, user.id, 'supervisor') ||
                     await checkRole(supabase, user.id, 'admin')

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''

    let query = supabase
      .from('client_brand_memberships')
      .select(`
        *,
        clients!client_brand_memberships_client_id_fkey(
          id, business_name, owner_name, phone, address,
          zones(name), client_types(name)
        )
      `)
      .eq('brand_id', brandId)
      .eq('tenant_id', tenantId)
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.ilike('clients.business_name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  })
}
```

### 3. Client APIs (`/api/client/`)

#### QR Code Management
```typescript
// src/app/api/client/qr/route.ts
export async function GET(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    // Obtener perfil de cliente
    const { data: clientProfile, error: clientError } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (clientError) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Obtener QR codes del cliente
    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        qr_redemptions(
          id, redeemed_by, redeemed_at, status
        )
      `)
      .eq('client_id', clientProfile.id)
      .eq('tenant_id', clientProfile.tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: qrCodes })
  })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    const body = await request.json()
    const { promotion_id, max_redemptions = 1 } = body

    const { data: clientProfile } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single()

    if (!clientProfile) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Generar QR code único
    const qrCode = generateUniqueCode()

    const { data: newQR, error } = await supabase
      .from('qr_codes')
      .insert({
        tenant_id: clientProfile.tenant_id,
        client_id: clientProfile.id,
        promotion_id,
        code: qrCode,
        max_redemptions,
        qr_type: 'promotion',
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: newQR }, { status: 201 })
  })
}
```

### 4. Visits API (`/api/visits/`)

#### Gestión de Visitas
```typescript
// src/app/api/visits/route.ts
export async function POST(request: NextRequest) {
  return withAuth(request, async (user, supabase) => {
    const body = await request.json()
    const { client_id, brand_id, products = [] } = body

    // Verificar que es promotor con acceso al cliente
    const hasAccess = await supabase.rpc('check_user_client_access', {
      p_user_id: user.id,
      p_client_id: client_id
    })

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Crear visita con productos en transacción
    const { data: visit, error } = await supabase.rpc('create_visit_with_products', {
      p_client_id: client_id,
      p_brand_id: brand_id,
      p_promotor_id: user.id,
      p_products: products
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: visit }, { status: 201 })
  })
}
```

## Validación y Schemas

### Request Validation
```typescript
// src/lib/validation/schemas.ts
import { z } from 'zod'

export const createClientSchema = z.object({
  business_name: z.string().min(1).max(100),
  owner_name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  zone_id: z.string().uuid()
})

export const createVisitSchema = z.object({
  client_id: z.string().uuid(),
  brand_id: z.string().uuid(),
  products: z.array(z.object({
    product_id: z.string().uuid(),
    stock_level: z.enum(['full', 'medium', 'low', 'out_of_stock']),
    notes: z.string().optional()
  }))
})

// Middleware de validación
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return handler(validatedData, request)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          error: 'Validation failed',
          details: error.errors
        }, { status: 400 })
      }
      throw error
    }
  }
}
```

## Error Handling

### Centralized Error Handler
```typescript
// src/lib/errors/handler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown): Response {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json({
      error: error.message,
      code: error.code
    }, { status: error.statusCode })
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 })
  }

  // PostgreSQL errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const pgError = error as { code: string; message: string }

    switch (pgError.code) {
      case '23505': // unique_violation
        return NextResponse.json({
          error: 'Resource already exists',
          code: 'DUPLICATE_RESOURCE'
        }, { status: 409 })
      case '23503': // foreign_key_violation
        return NextResponse.json({
          error: 'Referenced resource not found',
          code: 'FOREIGN_KEY_ERROR'
        }, { status: 400 })
      default:
        return NextResponse.json({
          error: 'Database error',
          code: 'DB_ERROR'
        }, { status: 500 })
    }
  }

  return NextResponse.json({
    error: 'Internal server error'
  }, { status: 500 })
}
```

## Real-time con Supabase

### Setup de Canales
```typescript
// src/lib/realtime/channels.ts
export function subscribeToVisits(brandId: string, callback: (payload: any) => void) {
  const supabase = createClient()

  return supabase
    .channel(`visits:brand:${brandId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'visits',
      filter: `brand_id=eq.${brandId}`
    }, callback)
    .subscribe()
}

export function subscribeToOrders(clientId: string, callback: (payload: any) => void) {
  const supabase = createClient()

  return supabase
    .channel(`orders:client:${clientId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'orders',
      filter: `client_id=eq.${clientId}`
    }, callback)
    .subscribe()
}
```

## Testing APIs

### Integration Tests
```typescript
// __tests__/api/brand/clients.test.ts
import { POST, GET } from '@/app/api/brand/clients/route'
import { createMockRequest } from '@/__tests__/utils/request'

describe('/api/brand/clients', () => {
  it('should create client with valid data', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        business_name: 'Test Business',
        owner_name: 'John Doe',
        zone_id: 'valid-zone-id'
      },
      user: mockUser
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toHaveProperty('id')
    expect(data.data.business_name).toBe('Test Business')
  })

  it('should reject unauthorized requests', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {},
      user: null // No authenticated user
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

## Rate Limiting y Security

### Rate Limiting
```typescript
// src/lib/security/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10s
})

export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<Response>
): Promise<Response> {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({
      error: 'Too many requests'
    }, { status: 429 })
  }

  return handler()
}
```

### CORS Configuration
```typescript
// src/lib/security/cors.ts
export function withCors(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_DOMAIN || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
```

---

## ⚠️ REGLAS CRÍTICAS DE API

1. **NUNCA** exponer APIs sin autenticación adecuada
2. **SIEMPRE** validar entrada con Zod schemas
3. **VERIFICAR** permisos RLS en cada endpoint
4. **USAR** transacciones para operaciones complejas
5. **IMPLEMENTAR** logging completo de errores
6. **APLICAR** rate limiting en endpoints públicos
7. **SANITIZAR** todos los inputs de usuario
8. **MANEJAR** errores de forma consistente
9. **DOCUMENTAR** contratos de API con OpenAPI/Swagger
10. **PROBAR** todos los endpoints con diferentes roles
