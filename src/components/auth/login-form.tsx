'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
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
import { ActionButton } from '@/components/ui/action-button'
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
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header con branding */}
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                        <span className="text-lg font-bold text-white">CR</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Compañeros</h1>
                        <span className="text-sm font-medium text-primary">EN RUTA</span>
                    </div>
                </div>

                {/* Heading principal */}
                <div className="space-y-3 mb-8">
                    <h2 className="text-3xl font-bold leading-tight">
                        Centraliza tu <span className="text-primary">información</span> comercial.
                    </h2>
                    <p className="text-muted-foreground">
                        Gestiona marcas, ventas y puntos de venta en un solo ecosistema inteligente.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 bg-white rounded-t-3xl p-6 space-y-6">
                <h3 className="text-xl font-semibold">Iniciar Sesión</h3>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="nombre@empresa.com"
                                                className="pl-10 h-12 rounded-xl"
                                                disabled={loading}
                                            />
                                        </div>
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
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-12 rounded-xl"
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

                        <ActionButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            className="mt-6"
                        >
                            Iniciar Sesión
                        </ActionButton>
                    </form>
                </Form>
            </div>
        </div>
    )
}
