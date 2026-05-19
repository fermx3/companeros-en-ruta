import { useState } from 'react'
import { Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    if (!email || !password) {
      setError('Ingresa tu correo y contraseña')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return
      }
      router.replace('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-black mb-2 text-navy">Compañeros Cliente</Text>
        <Text className="text-base text-muted-foreground mb-8">Inicia sesión para continuar</Text>

        <View className="w-full mb-3">
          <Input
            placeholder="correo@empresa.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
          />
        </View>
        <View className="w-full mb-4">
          <Input
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!submitting}
          />
        </View>

        {error && <Text className="text-destructive mb-3 text-center">{error}</Text>}

        <View className="w-full">
          <Button
            onPress={onSubmit}
            variant="default"
            size="lg"
            fullWidth
            loading={submitting}
          >
            Iniciar Sesión
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}
