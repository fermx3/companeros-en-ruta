import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Card } from '@/components/ui/Card'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useClientProfile, useUpdateClientProfile } from '@/features/profile/api'

function digitsOnly(s: string) {
  return s.replace(/\D/g, '')
}

export default function ProfileScreen() {
  const profileQuery = useClientProfile()
  const update = useUpdateClientProfile()

  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    if (profileQuery.data?.phone) setPhone(profileQuery.data.phone)
    if (profileQuery.data?.whatsapp) setWhatsapp(profileQuery.data.whatsapp)
  }, [profileQuery.data])

  const profile = profileQuery.data

  async function onSave() {
    const phoneClean = digitsOnly(phone)
    const wppClean = digitsOnly(whatsapp)
    if (phone && phoneClean.length !== 10) {
      Alert.alert('Teléfono inválido', 'Debe tener 10 dígitos.')
      return
    }
    if (whatsapp && wppClean.length !== 10) {
      Alert.alert('WhatsApp inválido', 'Debe tener 10 dígitos.')
      return
    }
    try {
      await update.mutateAsync({
        phone: phoneClean || undefined,
        whatsapp: wppClean || undefined,
      })
      Alert.alert('Listo', 'Datos actualizados.')
    } catch (e) {
      Alert.alert('Error al guardar', e instanceof Error ? e.message : '')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScreenHeader title="Mi perfil" showBack />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {profileQuery.isLoading || !profile ? (
          <Card>
            <ActivityIndicator />
          </Card>
        ) : (
          <>
            <Card className="mb-3">
              <Text className="text-xs text-gray-500">Negocio</Text>
              <Text className="text-base font-semibold text-navy mt-1">
                {profile.business_name ?? '—'}
              </Text>
              {profile.legal_name && (
                <Text className="text-xs text-gray-500 mt-0.5">{profile.legal_name}</Text>
              )}
              <Text className="text-xs text-gray-500 mt-2">
                Dueño: {profile.owner_name ?? '—'}
              </Text>
              {profile.client_type_name && (
                <Text className="text-xs text-gray-500">Tipo: {profile.client_type_name}</Text>
              )}
            </Card>

            <Card className="mb-3">
              <Text className="text-xs text-gray-500">Ubicación</Text>
              {profile.address_street && (
                <Text className="text-sm text-navy mt-1">{profile.address_street}</Text>
              )}
              {profile.address_neighborhood && (
                <Text className="text-sm text-gray-700">{profile.address_neighborhood}</Text>
              )}
              <Text className="text-xs text-gray-500 mt-1">
                {profile.address_city ?? ''}{profile.address_state ? `, ${profile.address_state}` : ''}{profile.address_postal_code ? ` · ${profile.address_postal_code}` : ''}
              </Text>
              {profile.zone_name && (
                <Text className="text-xs text-gray-500 mt-1">Zona: {profile.zone_name}</Text>
              )}
              {profile.market_name && (
                <Text className="text-xs text-gray-500">Mercado: {profile.market_name}</Text>
              )}
            </Card>

            <Card className="mb-3">
              <Text className="text-xs text-gray-500 mb-2">Contacto (editable)</Text>
              <Text className="text-xs text-gray-500 mb-1">Teléfono (10 dígitos)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-3"
                placeholder="5512345678"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <Text className="text-xs text-gray-500 mb-1">WhatsApp (10 dígitos)</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                placeholder="5512345678"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                value={whatsapp}
                onChangeText={setWhatsapp}
              />
              {profile.email && (
                <Text className="text-xs text-gray-400 mt-3">Email: {profile.email}</Text>
              )}
              <Pressable
                className="mt-3 h-11 rounded-full bg-primary-light items-center justify-center disabled:opacity-50"
                onPress={onSave}
                disabled={update.isPending}
              >
                {update.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Guardar cambios</Text>
                )}
              </Pressable>
            </Card>

            <Card className="mb-3">
              <Text className="text-xs text-gray-500 mb-2">Estadísticas</Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-navy">{profile.total_points}</Text>
                  <Text className="text-xs text-gray-500">Puntos</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-navy">{profile.total_orders}</Text>
                  <Text className="text-xs text-gray-500">Pedidos</Text>
                </View>
              </View>
              <Text className="text-xs text-gray-400 mt-3 text-center">
                Miembro desde{' '}
                {new Date(profile.created_at).toLocaleDateString('es-MX', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              {profile.last_visit_date && (
                <Text className="text-xs text-gray-400 text-center">
                  Última visita:{' '}
                  {new Date(profile.last_visit_date).toLocaleDateString('es-MX')}
                </Text>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
