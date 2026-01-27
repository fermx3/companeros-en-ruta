'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // Después del login exitoso, obtener el rol del usuario y redirigir apropiadamente
      try {
        // First get the user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', data.user.id)
          .single();

        if (profileError || !userProfile) {
          setError('No se encontró perfil de usuario. Contacta al administrador.');
          return;
        }

        // Then get the user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role, brand_id, status')
          .eq('user_profile_id', userProfile.id)
          .eq('status', 'active');

        if (rolesError) {
          setError('Error al obtener roles del usuario');
          return;
        }

        if (!userRoles || userRoles.length === 0) {
          setError('No tienes roles asignados. Contacta al administrador.');
          return;
        }

        // Determine primary role (priority: admin > supervisor > brand_manager > advisor > client)
        const roleOrder = ['admin', 'supervisor', 'brand_manager', 'advisor', 'client'];
        const roles = userRoles.map(r => r.role);

        let primaryRole = 'unauthorized';
        for (const role of roleOrder) {
          if (roles.includes(role)) {
            primaryRole = role;
            break;
          }
        }

        // Redirect based on role
        switch (primaryRole) {
          case 'admin':
            router.push('/admin');
            break;
          case 'supervisor':
            router.push('/supervisor');
            break;
          case 'brand_manager':
            router.push('/brand');
            break;
          case 'advisor':
            router.push('/asesor');
            break;
          case 'client':
            router.push('/client');
            break;
          default:
            router.push('/unauthorized');
        }
      } catch (err) {
        console.error('Error durante la redirección:', err);
        setError('Error durante el inicio de sesión');
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Compañeros en Ruta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
