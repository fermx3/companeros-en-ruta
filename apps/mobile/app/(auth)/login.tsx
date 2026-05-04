import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return
      }
      router.replace('/(promotor)/visits')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold mb-2 text-navy">Compañeros en Ruta</Text>
        <Text className="text-base text-gray-500 mb-8">Inicia sesión para continuar</Text>

        <TextInput
          className="w-full h-12 rounded-full border border-secondary px-5 mb-3 text-base"
          placeholder="correo@empresa.com"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!submitting}
        />
        <TextInput
          className="w-full h-12 rounded-full border border-secondary px-5 mb-4 text-base"
          placeholder="••••••••"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!submitting}
        />

        {error && <Text className="text-destructive mb-3 text-center">{error}</Text>}

        <Pressable
          className="w-full h-12 rounded-full bg-primary-light items-center justify-center disabled:opacity-50"
          onPress={onSubmit}
          disabled={submitting || !email || !password}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Iniciar Sesión</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
