import { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { router } from 'expo-router'

import { BadgeStatus } from '@/components/ui/BadgeStatus'
import { Card } from '@/components/ui/Card'
import { ChevronRight } from '@/components/ui/Icon'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useMyVisits, type VisitListItem } from '@/features/visits/api'

type Range = 'today' | 'week' | 'month'

interface DaySection {
  key: string
  label: string
  items: VisitListItem[]
}

export default function PromotorSchedule() {
  const [range, setRange] = useState<Range>('week')
  const visitsQuery = useMyVisits(range)
  const visits = visitsQuery.data?.visits ?? []

  const sections = useMemo(() => groupByDay(visits), [visits])

  return (
    <View className="flex-1 bg-app-bg">
      <View
        className="bg-card px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(204,204,204,0.4)' }}
      >
        <SegmentedControl
          options={[
            { value: 'today', label: 'Hoy' },
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mes' },
          ]}
          value={range}
          onChange={setRange}
        />
      </View>

      <FlatList
        data={sections}
        keyExtractor={s => s.key}
        contentContainerClassName="p-4 pb-8"
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={visitsQuery.isRefetching}
            onRefresh={visitsQuery.refetch}
          />
        }
        ListEmptyComponent={
          visitsQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title="Sin visitas programadas"
              body={
                range === 'today'
                  ? 'No tienes visitas para hoy. Cambia a Semana o Mes para ver lo que viene.'
                  : 'Cuando tengas visitas asignadas en este rango, las verás aquí.'
              }
            />
          )
        }
        renderItem={({ item }) => <DayBlock section={item} />}
      />
    </View>
  )
}

function DayBlock({ section }: { section: DaySection }) {
  return (
    <View className="mb-4">
      <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">
        {section.label}
      </Text>
      {section.items.map(v => (
        <VisitRow key={v.id} visit={v} />
      ))}
    </View>
  )
}

function VisitRow({ visit }: { visit: VisitListItem }) {
  const time = visit.visit_date
    ? new Date(visit.visit_date).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null
  return (
    <Pressable onPress={() => router.push(`/(promotor)/visits/${visit.id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start">
          <View className="flex-1 pr-2">
            <Text className="text-sm font-bold text-navy" numberOfLines={1}>
              {visit.client?.business_name ?? 'Cliente'}
            </Text>
            {visit.client?.address_street && (
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                {visit.client.address_street}
              </Text>
            )}
            <View className="flex-row items-center mt-1">
              {time && (
                <Text className="text-[10px] text-muted-foreground mr-2">{time}</Text>
              )}
              <BadgeStatus status={visit.visit_status} />
            </View>
          </View>
          <ChevronRight size={18} color="#999999" />
        </View>
      </Card>
    </Pressable>
  )
}

/**
 * Group visits by their local-date label so the schedule shows "today",
 * "tomorrow", and explicit day names instead of a flat list.
 */
function groupByDay(visits: VisitListItem[]): DaySection[] {
  const map = new Map<string, VisitListItem[]>()
  for (const v of visits) {
    if (!v.visit_date) continue
    const d = new Date(v.visit_date)
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(v)
  }
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const tomorrow = new Date(today.getTime() + 86400000)
  const tomorrowKey = tomorrow.toISOString().slice(0, 10)
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => {
      let label: string
      if (key === todayKey) label = 'Hoy'
      else if (key === tomorrowKey) label = 'Mañana'
      else
        label = new Date(key).toLocaleDateString('es-MX', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      // Sort items inside the day by time ascending.
      items.sort((a, b) => {
        const ta = a.visit_date ? new Date(a.visit_date).getTime() : 0
        const tb = b.visit_date ? new Date(b.visit_date).getTime() : 0
        return ta - tb
      })
      return { key, label, items }
    })
}
