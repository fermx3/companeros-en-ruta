import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ChevronRight } from '@/components/ui/Icon'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useStaffSurveys, type StaffSurveyListItem } from '@/features/staff-surveys/api'

interface SurveyListScreenProps {
  /** Used by the runner route to build the deep-link path back to the detail. */
  rolePathPrefix: string
}

/**
 * Reusable list of staff surveys. Each role wrapper passes its own
 * `rolePathPrefix` (e.g. "/(asesor)") so the row navigates to the runner
 * inside its own tab group.
 */
export function SurveyListScreen({ rolePathPrefix }: SurveyListScreenProps) {
  const surveysQuery = useStaffSurveys()
  const surveys = surveysQuery.data?.surveys ?? []

  return (
    <SafeAreaView className="flex-1 bg-app-bg" edges={['top']}>
      <ScreenHeader title="Encuestas" showBack />
      <FlatList
        data={surveys}
        keyExtractor={s => s.id}
        contentContainerClassName="p-4 pb-8"
        // alwaysBounceVertical keeps the pull-to-refresh gesture available
        // when the list is empty/short (FlatList otherwise locks the
        // ScrollView without bounce on iOS).
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={surveysQuery.isRefetching}
            onRefresh={surveysQuery.refetch}
          />
        }
        ListEmptyComponent={
          surveysQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title="Sin encuestas disponibles"
              body="Cuando una marca lance una encuesta dirigida a tu rol, va a aparecer aquí."
            />
          )
        }
        renderItem={({ item }) => <SurveyRow s={item} rolePathPrefix={rolePathPrefix} />}
      />
    </SafeAreaView>
  )
}

function SurveyRow({
  s,
  rolePathPrefix,
}: {
  s: StaffSurveyListItem
  rolePathPrefix: string
}) {
  return (
    <Pressable onPress={() => router.push(`${rolePathPrefix}/surveys/${s.id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start">
          <BrandLogo logoUrl={s.brands?.logo_url ?? null} name={s.brands?.name ?? 'Marca'} size={36} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={2}>
              {s.title}
            </Text>
            {s.brands?.name && (
              <Text className="text-xs text-muted-foreground mt-0.5">{s.brands.name}</Text>
            )}
            {s.description && (
              <Text className="text-xs text-muted-foreground mt-1" numberOfLines={2}>
                {s.description}
              </Text>
            )}
            {s.end_date && (
              <Text className="text-[10px] text-muted-foreground mt-1">
                Hasta {new Date(s.end_date).toLocaleDateString('es-MX')}
              </Text>
            )}
            {s.has_responded && (
              <Text className="text-[10px] text-success mt-1 font-bold uppercase tracking-wider">
                Ya respondida
              </Text>
            )}
          </View>
          <ChevronRight size={18} color="#999999" />
        </View>
      </Card>
    </Pressable>
  )
}
