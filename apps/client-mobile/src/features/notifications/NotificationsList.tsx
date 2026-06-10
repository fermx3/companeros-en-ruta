import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { router } from 'expo-router'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ListEmptyState } from '@/components/ui/ListEmptyState'
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  type NotificationItem,
} from '@/features/notifications/api'

interface NotificationsListProps {
  /** Optional header rendered above the FlatList. Pass a ScreenHeader / tab header. */
  header?: React.ReactNode
  /** Renders a "Marcar todo" action when there are unread items. Defaults to true. */
  showMarkAllAction?: boolean
}

export function NotificationsList({ header, showMarkAllAction = true }: NotificationsListProps) {
  const notificationsQuery = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const items = notificationsQuery.data?.pages.flatMap(p => p.data) ?? []
  const total = notificationsQuery.data?.pages[0]?.count ?? 0
  const hasUnread = items.some(n => !n.is_read)

  function handleTap(n: NotificationItem) {
    if (!n.is_read) markRead.mutate([n.id])
    if (n.action_url) {
      router.push(n.action_url as never)
    }
  }

  return (
    <>
      {header}
      <FlatList
        data={items}
        keyExtractor={n => n.id}
        contentContainerClassName="p-4 pb-8"
        refreshControl={
          <RefreshControl
            refreshing={notificationsQuery.isRefetching}
            onRefresh={notificationsQuery.refetch}
          />
        }
        ListHeaderComponent={
          <View>
            {total > 0 ? (
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  {total} {total === 1 ? 'notificación' : 'notificaciones'}
                </Text>
                {showMarkAllAction && hasUnread ? (
                  <Button
                    onPress={() => markAllRead.mutate()}
                    variant="ghost"
                    size="sm"
                    loading={markAllRead.isPending}
                  >
                    Marcar todo
                  </Button>
                ) : null}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          notificationsQuery.isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator />
            </View>
          ) : (
            <ListEmptyState
              title="No tienes notificaciones"
              body="Cuando recibas cupones, pedidos o promociones, te avisamos acá."
            />
          )
        }
        renderItem={({ item }) => <NotificationRow notification={item} onPress={handleTap} />}
        onEndReached={() => {
          if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
            notificationsQuery.fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          notificationsQuery.isFetchingNextPage ? (
            <View className="py-3">
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </>
  )
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: NotificationItem
  onPress: (n: NotificationItem) => void
}) {
  return (
    <Pressable onPress={() => onPress(notification)}>
      <Card className="mb-2">
        <View className="flex-row items-start">
          {!notification.is_read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#dd5025',
                marginTop: 6,
                marginRight: 10,
              }}
            />
          )}
          <View className="flex-1">
            <Text
              className={`text-sm ${notification.is_read ? 'text-navy' : 'font-bold text-navy'}`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={3}>
              {notification.message}
            </Text>
            <Text className="text-[10px] text-muted-foreground mt-2">
              {new Date(notification.created_at).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  )
}
