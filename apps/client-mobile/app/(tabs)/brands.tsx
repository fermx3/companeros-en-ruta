import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { router } from 'expo-router'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import {
  useAvailableBrands,
  useMemberships,
  type AvailableBrand,
  type ClientMembership,
} from '@/features/home/api'
import { useJoinBrand } from '@/features/brands/api'

const PRIMARY_HEX = '#dd5025' // mirrors colors.primary.DEFAULT

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
    <View className="flex-1 bg-app-bg">
      <View
        className="bg-card px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <SegmentedControl
          options={[
            { value: 'memberships', label: 'Mis membresías' },
            { value: 'discover', label: 'Descubrir' },
          ]}
          value={tab}
          onChange={setTab}
        />
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
              body="Ve a 'Descubrir' para unirte a las marcas disponibles."
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
              <Text className="text-xs text-muted-foreground mt-0.5">
                {tier?.name ?? 'Sin nivel'} · {m.points_balance} pts
              </Text>
            </View>
          </View>
          <BadgeStatus status={m.membership_status} />
        </View>
        {next && next.points_needed > 0 && (
          <>
            <View className="h-2 bg-muted rounded-full overflow-hidden">
              <View
                className="h-2 bg-primary rounded-full"
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </View>
            <Text className="text-xs text-muted-foreground mt-1">
              Te faltan {next.points_needed} pts para {next.name}
            </Text>
          </>
        )}
        <Text className="text-[10px] text-muted-foreground mt-2">
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
  // Brand-color CTA is intentional — each brand owns its action button color.
  // Falls back to primary orange if the brand has no color configured.
  const _color = brand.brand_color_primary ?? PRIMARY_HEX
  void _color
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
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
                {brand.description}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View className="mt-1">
        <Button onPress={onJoin} variant="default" size="default" fullWidth disabled={pending}>
          + Unirme
        </Button>
      </View>
    </Card>
  )
}
