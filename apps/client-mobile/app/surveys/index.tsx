import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { BrandLogo } from '@/components/ui/BrandLogo'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import { ScreenHeader } from '@/components/ui/ScreenHeader'
import { useSurveys, type SurveyListItem } from '@/features/surveys/api'

export default function SurveysListScreen() {
  const surveysQuery = useSurveys()
  const surveys = surveysQuery.data?.surveys ?? []

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScreenHeader title="Encuestas" showBack />
      <FlatList
        data={surveys}
        keyExtractor={s => s.id}
        contentContainerClassName="p-4 pb-8"
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
              body="Cuando una marca lance una encuesta para ti, va a aparecer aquí."
            />
          )
        }
        renderItem={({ item }) => <SurveyRow s={item} />}
      />
    </SafeAreaView>
  )
}

function SurveyRow({ s }: { s: SurveyListItem }) {
  return (
    <Pressable onPress={() => router.push(`/surveys/${s.id}` as never)}>
      <Card className="mb-2">
        <View className="flex-row items-start">
          <BrandLogo logoUrl={s.brands?.logo_url ?? null} name={s.brands?.name ?? 'Marca'} size={36} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold text-navy" numberOfLines={2}>
              {s.title}
            </Text>
            {s.brands?.name && (
              <Text className="text-xs text-gray-500 mt-0.5">{s.brands.name}</Text>
            )}
            {s.description && (
              <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                {s.description}
              </Text>
            )}
            {s.end_date && (
              <Text className="text-[10px] text-gray-400 mt-1">
                Hasta {new Date(s.end_date).toLocaleDateString('es-MX')}
              </Text>
            )}
            {s.has_responded && (
              <Text className="text-[10px] text-success mt-1 font-semibold">
                Ya respondida
              </Text>
            )}
          </View>
          <Text className="text-gray-400">›</Text>
        </View>
      </Card>
    </Pressable>
  )
}
