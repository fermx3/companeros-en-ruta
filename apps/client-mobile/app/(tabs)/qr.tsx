import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
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
import { discountLabel, useQRCodes, type QRCode } from '@/features/qr/api'

export default function QRTab() {
  const qrQuery = useQRCodes()

  const [tab, setTab] = useState<'active' | 'used'>('active')

  const qrCodes = qrQuery.data?.qr_codes ?? []

  const filtered = useMemo(() => {
    // Active: soonest expiry first so the cupón about to expire surfaces on top.
    // Used: most recently redeemed first.
    if (tab === 'active') {
      return qrCodes
        .filter(qr => qr.status === 'active')
        .slice()
        .sort((a, b) => {
          const av = a.valid_until ? new Date(a.valid_until).getTime() : Number.POSITIVE_INFINITY
          const bv = b.valid_until ? new Date(b.valid_until).getTime() : Number.POSITIVE_INFINITY
          return av - bv
        })
    }
    return qrCodes
      .filter(
        qr => qr.status === 'fully_redeemed' || qr.status === 'used' || qr.status === 'expired'
      )
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [qrCodes, tab])

  return (
    <View className="flex-1 bg-app-bg">
      <View
        className="bg-card px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <SegmentedControl
          options={[
            { value: 'active', label: 'Activos' },
            { value: 'used', label: 'Usados' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl refreshing={qrQuery.isRefetching} onRefresh={qrQuery.refetch} />
        }
      >
        {qrQuery.isLoading ? (
          <Card>
            <ActivityIndicator />
          </Card>
        ) : filtered.length === 0 ? (
          <ListEmptyState
            title={tab === 'active' ? 'Sin cupones activos' : 'Sin cupones usados todavía'}
            body={
              tab === 'active'
                ? 'Genera tus cupones desde el detalle de cada promoción en Inicio.'
                : 'Cuando tu promotor escanee uno de tus cupones, aparecerá aquí.'
            }
          />
        ) : (
          filtered.map(qr => <QRListCard key={qr.id} qr={qr} />)
        )}
      </ScrollView>
    </View>
  )
}

function QRListCard({ qr }: { qr: QRCode }) {
  const brandName = qr.brand?.name ?? 'Marca'
  const promotionName = qr.promotion?.name ?? 'Cupón'
  const discount = discountLabel(qr)
  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-center flex-1 pr-2">
          <BrandLogo logoUrl={qr.brand?.logo_url ?? null} name={brandName} size={32} />
          <View className="ml-2 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {promotionName}
            </Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {brandName}
            </Text>
          </View>
        </View>
        <BadgeStatus status={qr.status} />
      </View>

      {discount && (
        <Text className="text-lg font-bold mt-1 mb-2 text-success">{discount}</Text>
      )}

      <View className="pt-2" style={{ borderTopWidth: 1, borderTopColor: 'rgba(204,204,204,0.4)' }}>
        {qr.valid_until && (
          <Text className="text-xs text-muted-foreground">
            Vigente hasta{' '}
            {new Date(qr.valid_until).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        )}
        <Text className="text-xs text-muted-foreground mt-0.5">Código {qr.code}</Text>
      </View>

      {qr.status === 'active' && (
        <View className="mt-3">
          <Button
            onPress={() => router.push(`/qr/${qr.id}` as never)}
            variant="default"
            size="default"
            fullWidth
          >
            Ver QR
          </Button>
        </View>
      )}
    </Card>
  )
}
