'use client'

import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Inbox, Trash2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/feedback'
import { useNotifications } from '@/hooks/useNotifications'
import { usePageTitle } from '@/hooks/usePageTitle'
import { cn } from '@companeros/shared/utils/cn'
import type { Notification } from '@companeros/shared/types/database'

const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
  promotion_approved: '🎉',
  promotion_rejected: '❌',
  new_promotion: '🏷️',
  visit_completed: '✅',
  order_created: '📦',
  qr_redeemed: '📱',
  tier_upgrade: '⬆️',
  survey_assigned: '📋',
  points_adjusted: '💰',
  welcome: '👋',
  system: '🔔',
}

export default function ClientInboxPage() {
  usePageTitle('Buzón')
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  function handleTap(n: Notification) {
    if (!n.is_read) markAsRead([n.id])
    if (n.action_url) {
      router.push(n.action_url)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Buzón</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} sin leer`
                  : 'Todas tus notificaciones'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marcar todo
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tienes notificaciones</h3>
              <p className="text-muted-foreground">
                Cuando recibas cupones, pedidos o promociones, te avisamos acá.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y divide-gray-100">
              {notifications.map((n) => {
                const icon = NOTIFICATION_TYPE_ICONS[n.notification_type] ?? '🔔'
                return (
                  <button
                    key={n.id}
                    onClick={() => handleTap(n)}
                    className={cn(
                      'group w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors',
                      !n.is_read && 'bg-blue-50/40'
                    )}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-sm',
                              n.is_read ? 'text-gray-700' : 'font-semibold text-gray-900'
                            )}
                          >
                            {n.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary mt-1" />
                            )}
                            <span
                              role="button"
                              tabIndex={0}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-all"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteNotification(n.id)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation()
                                  deleteNotification(n.id)
                                }
                              }}
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                        {n.message && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
