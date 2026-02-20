import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '../env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas protegidas
  const protectedRoutes = ['/admin', '/brand', '/supervisor', '/promotor', '/asesor-ventas', '/client']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Don't auto-redirect from login - let the login page handle role detection
  // This prevents security issues where users get redirected to wrong dashboards

  // Inject user ID as internal request header so API routes can skip getUser()
  // Defense in depth: always strip any externally-provided header first
  if (user) {
    // Mutate the original request.headers directly so the request object
    // retains all cookie mutations from supabase's setAll callback.
    // Creating `new Headers(request.headers)` + `{ request: { headers } }`
    // detaches the request context and breaks cookie forwarding to API routes.
    request.headers.delete('x-supabase-user-id')
    request.headers.set('x-supabase-user-id', user.id)

    const response = NextResponse.next({ request })

    // Preserve auth refresh cookies from the supabase response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })

    return response
  }

  return supabaseResponse
}
