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
    const requestHeaders = new Headers(request.headers)
    requestHeaders.delete('x-supabase-user-id')
    requestHeaders.set('x-supabase-user-id', user.id)

    const response = NextResponse.next({ request: { headers: requestHeaders } })

    // Preserve auth refresh cookies from the supabase response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })

    return response
  }

  return supabaseResponse
}
