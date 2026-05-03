'use client'

import { LoginForm } from '@/components/auth'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function LoginPage() {
  usePageTitle('Iniciar Sesión')
  return <LoginForm />
}
