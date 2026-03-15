'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PageLoader } from '@/components/ui/feedback'

// Validation schema
const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

type LoginFormData = z.infer<typeof loginSchema>

// Role priority order for determining primary role
const roleOrder = ['admin', 'supervisor', 'brand_manager', 'promotor', 'asesor_de_ventas'] as const

// Get redirect path based on primary role
function getRedirectPath(roles: string[]): string {
    for (const role of roleOrder) {
        if (roles.includes(role)) {
            switch (role) {
                case 'admin':
                    return '/admin'
                case 'supervisor':
                    return '/supervisor'
                case 'brand_manager':
                    return '/brand'
                case 'promotor':
                    return '/promotor'
                case 'asesor_de_ventas':
                    return '/asesor-ventas'
            }
        }
    }
    return '/unauthorized'
}

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [checkingSession, setCheckingSession] = useState(true)
    const [error, setError] = useState('')

    const router = useRouter()
    const supabase = createClient()

    // Check if user is already logged in
    useEffect(() => {
        const checkExistingSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.user) {
                    setCheckingSession(false)
                    return
                }

                // Check if user is a client
                const { data: clientAccount } = await supabase
                    .from('clients')
                    .select('id, status')
                    .eq('user_id', session.user.id)
                    .is('deleted_at', null)
                    .single()

                if (clientAccount && clientAccount.status === 'active') {
                    router.replace('/client')
                    return
                }

                // Check for staff roles
                const { data: userProfile } = await supabase
                    .from('user_profiles')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .single()

                if (!userProfile) {
                    setCheckingSession(false)
                    return
                }

                // Get user roles
                const { data: userRoles } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_profile_id', userProfile.id)
                    .eq('status', 'active')
                    .is('deleted_at', null)

                if (!userRoles || userRoles.length === 0) {
                    setCheckingSession(false)
                    return
                }

                const roles = userRoles.map(r => r.role)
                const redirectPath = getRedirectPath(roles)
                router.replace(redirectPath)
            } catch (err) {
                console.error('Error checking session:', err)
                setCheckingSession(false)
            }
        }

        checkExistingSession()
    }, [supabase, router])

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (values: LoginFormData) => {
        setLoading(true)
        setError('')

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        try {
            // Check if user is a client
            const { data: clientAccount } = await supabase
                .from('clients')
                .select('id, status')
                .eq('user_id', data.user.id)
                .is('deleted_at', null)
                .single()

            if (clientAccount) {
                if (clientAccount.status !== 'active') {
                    setError('Tu cuenta de cliente está inactiva. Contacta al administrador.')
                    setLoading(false)
                    return
                }
                router.push('/client')
                return
            }

            // Check for staff roles
            const { data: userProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('user_id', data.user.id)
                .single()

            if (!userProfile) {
                setError('No se encontró perfil de usuario. Contacta al administrador.')
                setLoading(false)
                return
            }

            // Get user roles
            const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_profile_id', userProfile.id)
                .eq('status', 'active')
                .is('deleted_at', null)

            if (!userRoles || userRoles.length === 0) {
                setError('No tienes roles asignados. Contacta al administrador.')
                setLoading(false)
                return
            }

            // Redirect based on primary role
            const roles = userRoles.map(r => r.role)
            const redirectPath = getRedirectPath(roles)
            router.push(redirectPath)
        } catch (err) {
            console.error('Error durante la redirección:', err)
            setError('Error durante el inicio de sesión')
            setLoading(false)
        }
    }

    // Show loading while checking existing session
    if (checkingSession) {
        return <PageLoader message="Verificando sesión..." />
    }

    return (
        <div className="min-h-screen bg-login-gradient relative overflow-hidden flex flex-col">
            {/* Logo — right-aligned */}
            <div className="pt-12 pb-16 flex justify-end px-8 relative z-10">
                <img src="/perfect-logo-full.png" alt="Perfectapp" className="h-12" />
            </div>

            {/* Text section */}
            <div className="px-8 mb-10 relative z-10">
                <p className="text-sm text-navy mb-1">Compañeros en Ruta</p>
                <h2 className="text-[2.5rem] font-black leading-[1.1] text-navy">
                    Centraliza tu{' '}
                    <span className="text-primary-light">información</span>{' '}
                    comercial
                </h2>
                <p className="text-muted-foreground text-sm mt-4">
                    Gestiona marcas, ventas y puntos de venta en un solo
                    ecosistema inteligente
                </p>
            </div>

            {/* Spacer to push card down */}
            <div className="flex-1" />

            {/* Form card — floating */}
            <div className="mx-6 mb-36 relative z-10">
                <div className="bg-white rounded-3xl shadow-lg p-7 space-y-5">
                    <h3 className="text-2xl font-bold text-secondary">Iniciar Sesión</h3>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-navy">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="correo@empresa.com"
                                                className="h-12 rounded-full border-secondary px-5 placeholder:text-secondary/40"
                                                disabled={loading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-navy">Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    {...field}
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-12 rounded-full border-secondary px-5 pr-12 placeholder:text-secondary/40"
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    disabled={loading}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-full bg-primary-light hover:bg-primary text-white font-bold mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Iniciar Sesión'
                                )}
                            </button>
                        </form>
                    </Form>
                </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -bottom-28 -left-24 w-80 h-80 rounded-full bg-primary z-0" />
            <div className="absolute bottom-6 left-[44%] w-8 h-8 rounded-full bg-navy z-0" />
            <div className="absolute -bottom-8 -right-4 w-36 h-36 rounded-full bg-secondary z-0" />
        </div>
    )
}
