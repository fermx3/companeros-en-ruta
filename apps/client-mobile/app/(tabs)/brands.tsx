import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import {
  useAvailableBrands,
  useMemberships,
  type AvailableBrand,
  type ClientMembership,
} from '@/features/home/api'
import { useJoinBrand } from '@/features/brands/api'

type Tab = 'memberships' | 'discover'

export default function BrandsTab() {
  const [tab, setTab] = useState<Tab>('memberships')
  const membershipsQuery = useMemberships()
  const availableBrandsQuery = useAvailableBrands()
  const joinBrand = useJoinBrand()

  const memberships = membershipsQuery.data?.memberships ?? []
  const allBrands = availableBrandsQuery.data?.brands ?? []
  const nonMemberBrands = allBrands.filter(b => !b.is_member)

  function onJoin(brand: AvailableBrand) {
    Alert.alert('Unirme a la marca', `¿Solicitar membresía con ${brand.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Solicitar',
        onPress: async () => {
          try {
            await joinBrand.mutateAsync(brand.id)
            Alert.alert(
              'Solicitud enviada',
              'La marca recibirá tu solicitud y te aprobará en breve.'
            )
            setTab('memberships')
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo solicitar')
          }
        },
      },
    ])
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View style={tabStyles.header}>
        <View style={tabStyles.track}>
          {(['memberships', 'discover'] as const).map(opt => {
            const selected = tab === opt
            return (
              <Pressable
                key={opt}
                style={[tabStyles.option, selected && tabStyles.optionSelected]}
                onPress={() => setTab(opt)}
              >
                <Text
                  style={[tabStyles.optionLabel, selected && tabStyles.optionLabelSelected]}
                >
                  {opt === 'memberships' ? 'Mis membresías' : 'Descubrir'}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        {tab === 'memberships' ? (
          membershipsQuery.isLoading ? (
            <Card>
              <ActivityIndicator />
            </Card>
          ) : memberships.length === 0 ? (
            <ListEmptyState
              title="Sin membresías"
              body="Andá a 'Descubrir' para unirte a las marcas disponibles."
              ctaLabel="Descubrir marcas"
              onCta={() => setTab('discover')}
            />
          ) : (
            memberships.map(m => <MembershipRow key={m.id} m={m} />)
          )
        ) : availableBrandsQuery.isLoading ? (
          <Card>
            <ActivityIndicator />
          </Card>
        ) : nonMemberBrands.length === 0 ? (
          <ListEmptyState
            title="Ya estás en todas las marcas"
            body="No hay nuevas marcas a las que unirte por ahora."
          />
        ) : (
          nonMemberBrands.map(b => (
            <DiscoverRow
              key={b.id}
              brand={b}
              onJoin={() => onJoin(b)}
              pending={joinBrand.isPending}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

function MembershipRow({ m }: { m: ClientMembership }) {
  const tier = m.current_tier
  const next = m.next_tier
  const ratio = next && next.points_needed > 0
    ? Math.min(1, m.points_balance / (m.points_balance + next.points_needed))
    : 1
  return (
    <Pressable onPress={() => router.push(`/points/${m.brand_id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-row items-center flex-1 pr-2">
            <BrandLogo logoUrl={m.brand_logo_url} name={m.brand_name} size={40} />
            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-navy" numberOfLines={1}>
                {m.brand_name}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                {tier?.name ?? 'Sin nivel'} · {m.points_balance} pts
              </Text>
            </View>
          </View>
          <BadgeStatus status={m.membership_status} />
        </View>
        {next && next.points_needed > 0 && (
          <>
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-2 bg-primary-light rounded-full"
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Te faltan {next.points_needed} pts para {next.name}
            </Text>
          </>
        )}
        <Text className="text-[10px] text-gray-400 mt-2">
          Ver historial de puntos →
        </Text>
      </Card>
    </Pressable>
  )
}

function DiscoverRow({
  brand,
  onJoin,
  pending,
}: {
  brand: AvailableBrand
  onJoin: () => void
  pending: boolean
}) {
  const color = brand.brand_color_primary ?? '#1a4480'
  return (
    <Card className="mb-2">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          <BrandLogo logoUrl={brand.logo_url} name={brand.name} size={40} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {brand.name}
            </Text>
            {brand.description && (
              <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={2}>
                {brand.description}
              </Text>
            )}
          </View>
        </View>
      </View>
      <Pressable
        className="h-10 rounded-full items-center justify-center mt-1 disabled:opacity-50"
        style={{ backgroundColor: color }}
        onPress={onJoin}
        disabled={pending}
      >
        <Text className="text-white font-semibold text-sm">+ Unirme</Text>
      </Pressable>
    </Card>
  )
}

const tabStyles = StyleSheet.create({
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  track: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  optionLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  optionLabelSelected: { color: '#0f2444' },
})
