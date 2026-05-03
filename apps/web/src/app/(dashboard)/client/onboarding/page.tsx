'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, ArrowRight } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function ClientOnboardingWelcomePage() {
  usePageTitle('Bienvenido')
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full rounded-2xl border-0 shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
            <ClipboardCheck className="h-8 w-8 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Completa tu perfil
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Para brindarte una mejor experiencia, necesitamos algunos datos sobre ti y tu negocio. Solo te tomará unos minutos.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => router.push('/client/onboarding/form')}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              Completar ahora
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                sessionStorage.setItem('onboarding_dismissed', '1')
                router.push('/client')
              }}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              En otro momento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
