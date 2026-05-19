import { useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from '@/components/ui/Icon'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

// Mobile login mirrors the web version's composition (apps/web/src/components/
// auth/login-form.tsx): logo top-right, hero headline with "información" in
// primary-light, floating card with the form, and 3 decorative circles behind.

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <View className="flex-1 bg-app-bg">
      {/* Decorative circles — mirror web's bottom-left primary, middle navy,
        bottom-right secondary. Absolute-positioned behind everything. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -110,
          left: -90,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: '#dd5025',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 60,
          left: '46%',
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: '#202456',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -20,
          right: -16,
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: '#4d71ed',
        }}
      />

      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo top-right */}
            <View className="flex-row justify-end pt-2 pb-6 px-6">
              <Image
                source={require('../../assets/images/perfect-logo-full.png')}
                style={{ height: 32, width: 130 }}
                resizeMode="contain"
              />
            </View>

            {/* Hero text */}
            <View className="px-6">
              <Text className="text-sm text-navy mb-1">Compañeros en Ruta</Text>
              <Text className="text-4xl font-black text-navy" style={{ lineHeight: 42 }}>
                Tus{' '}
                <Text className="text-primary-light">beneficios</Text>
                {' '}en un solo lugar
              </Text>
              <Text className="text-sm text-muted-foreground mt-4">
                Acumula puntos, canjea cupones y descubre las promociones exclusivas de tus marcas favoritas.
              </Text>
            </View>

            {/* Form card vertically centered in the remaining viewport space */}
            <View style={{ flex: 1, justifyContent: 'center' }} className="mx-6 my-6">
              <View
                className="bg-card p-6"
                style={{
                  borderRadius: 24,
                  shadowColor: '#000',
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <Text className="text-2xl font-bold text-secondary mb-5">Iniciar Sesión</Text>

                {error && (
                  <View
                    className="rounded-xl px-4 py-3 mb-4"
                    style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}
                  >
                    <Text className="text-sm text-destructive">{error}</Text>
                  </View>
                )}

                <Text className="text-sm font-bold text-navy mb-2">Email</Text>
                <Input
                  placeholder="correo@empresa.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  style={{ height: 48, borderRadius: 999, paddingHorizontal: 20 }}
                />

                <Text className="text-sm font-bold text-navy mb-2 mt-4">Contraseña</Text>
                <View>
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!submitting}
                    style={{ height: 48, borderRadius: 999, paddingHorizontal: 20, paddingRight: 48 }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(s => !s)}
                    disabled={submitting}
                    hitSlop={8}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: 0,
                      bottom: 0,
                      width: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#4b5563" />
                    ) : (
                      <Eye size={18} color="#4b5563" />
                    )}
                  </Pressable>
                </View>

                <View className="mt-5">
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
