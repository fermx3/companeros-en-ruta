import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { MetricCard } from '@/components/ui/MetricCard'
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
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title="Mi perfil" showBack />
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {profileQuery.isLoading || !profile ? (
          <Card>
            <ActivityIndicator />
          </Card>
        ) : (
          <>
            <Card className="mb-3">
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Negocio
              </Text>
              <Text className="text-base font-bold text-navy mt-1">
                {profile.business_name ?? '—'}
              </Text>
              {profile.legal_name && (
                <Text className="text-xs text-muted-foreground mt-0.5">{profile.legal_name}</Text>
              )}
              <Text className="text-xs text-navy mt-2">
                <Text className="text-muted-foreground">Dueño: </Text>
                {profile.owner_name ?? '—'}
              </Text>
              {profile.client_type_name && (
                <Text className="text-xs text-navy">
                  <Text className="text-muted-foreground">Tipo: </Text>
                  {profile.client_type_name}
                </Text>
              )}
            </Card>

            <Card className="mb-3">
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Ubicación
              </Text>
              {profile.address_street && (
                <Text className="text-sm text-navy mt-1">{profile.address_street}</Text>
              )}
              {profile.address_neighborhood && (
                <Text className="text-sm text-navy">{profile.address_neighborhood}</Text>
              )}
              <Text className="text-xs text-muted-foreground mt-1">
                {profile.address_city ?? ''}
                {profile.address_state ? `, ${profile.address_state}` : ''}
                {profile.address_postal_code ? ` · ${profile.address_postal_code}` : ''}
              </Text>
              {profile.zone_name && (
                <Text className="text-xs text-muted-foreground mt-1">Zona: {profile.zone_name}</Text>
              )}
              {profile.market_name && (
                <Text className="text-xs text-muted-foreground">Mercado: {profile.market_name}</Text>
              )}
            </Card>

            <Card className="mb-3">
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
                Contacto (editable)
              </Text>
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
                Teléfono (10 dígitos)
              </Text>
              <Input
                placeholder="5512345678"
                keyboardType="number-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1 mt-3">
                WhatsApp (10 dígitos)
              </Text>
              <Input
                placeholder="5512345678"
                keyboardType="number-pad"
                value={whatsapp}
                onChangeText={setWhatsapp}
              />
              {profile.email && (
                <Text className="text-xs text-muted-foreground mt-3">Email: {profile.email}</Text>
              )}
              <View className="mt-3">
                <Button
                  onPress={onSave}
                  variant="default"
                  size="default"
                  fullWidth
                  loading={update.isPending}
                >
                  Guardar cambios
                </Button>
              </View>
            </Card>

            <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Estadísticas
            </Text>
            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <MetricCard label="Puntos" value={profile.total_points} />
              </View>
              <View className="flex-1">
                <MetricCard label="Pedidos" value={profile.total_orders} />
              </View>
            </View>
            <Card className="mb-3">
              <Text className="text-xs text-muted-foreground text-center">
                Miembro desde{' '}
                {new Date(profile.created_at).toLocaleDateString('es-MX', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              {profile.last_visit_date && (
                <Text className="text-xs text-muted-foreground text-center mt-1">
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
