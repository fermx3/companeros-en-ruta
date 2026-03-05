'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PageLoader, Alert } from '@/components/ui/feedback'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/ui/metric-card'
import { Building2, Users, UserCheck, BarChart3, DollarSign } from 'lucide-react'
import type { AdminDashboardMetrics, RecentActivity } from '@/lib/types/admin'
import { usePageTitle } from '@/hooks/usePageTitle'

// Componente AlertDescription simple
const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-2 text-sm text-gray-600">{children}</div>
);

/**
 * Dashboard principal del administrador
 * Muestra métricas clave y navegación rápida a las secciones principales
 */
export default function AdminDashboard() {
  usePageTitle('Panel de Administración')
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)

    try {
      if (signal?.aborted) return

      // Single API call — metrics + activity are returned together
      const response = await fetch('/api/admin/metrics', { signal })

      if (signal?.aborted) return

      if (!response.ok) {
        let errorMessage = 'Error al obtener métricas';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json()

      if (signal?.aborted) return

      // Extract activity from combined response
      const { recentActivity: activityData, ...metricsData } = data
      setMetrics(metricsData)
      setRecentActivity(
        (activityData || []).map((a: Record<string, unknown>) => ({
          id: a.id as string,
          tenant_id: '',
          user_id: '',
          action: 'CREATE',
          resource_type: a.resource_type as string,
          resource_id: a.id as string,
          created_at: a.created_at as string,
          action_type: a.action_type as string,
          description: a.description as string,
        }))
      )
    } catch (err) {
      if (signal?.aborted) return
      console.error('Error loading dashboard:', err)
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Error al cargar las métricas del dashboard')
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadDashboard(controller.signal)
    return () => controller.abort()
  }, [loadDashboard])

  if (loading) {
    return <PageLoader message="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="error" title="Error al cargar dashboard">
          <AlertDescription>
            <p>{error}</p>
            <Button
              onClick={() => loadDashboard()}
              className="mt-4"
              variant="outline"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona tu tenant, brands y usuarios
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin/brands">
                <Button variant="outline">
                  Gestionar Brands
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button>
                  Gestionar Usuarios
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Brands"
            value={metrics?.totalBrands || 0}
            change={`${metrics?.activeBrands || 0} activos`}
            icon={<Building2 className="h-6 w-6" />}
          />

          <MetricCard
            title="Clientes"
            value={metrics?.totalClients || 0}
            change={`${metrics?.activeClients || 0} activos`}
            icon={<Users className="h-6 w-6" />}
          />

          <MetricCard
            title="Usuarios"
            value={metrics?.totalUsers || 0}
            change={`${metrics?.activeUsers || 0} activos`}
            icon={<UserCheck className="h-6 w-6" />}
          />

          <MetricCard
            title="Visitas"
            value={metrics?.totalVisits || 0}
            change={`${metrics?.monthlyVisits || 0} este mes`}
            icon={<BarChart3 className="h-6 w-6" />}
          />
        </div>

        {/* Revenue Card */}
        <div className="mb-8">
          <MetricCard
            title="Ingresos del Mes"
            value={`$${(metrics?.monthlyRevenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            change={`${metrics?.totalOrders || 0} órdenes totales`}
            icon={<DollarSign className="h-6 w-6" />}
            variant="warning"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <QuickActionItem
                  title="Crear nueva Brand"
                  description="Agregar una marca al sistema"
                  href="/admin/brands/create"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Invitar Usuario"
                  description="Enviar invitación a un nuevo usuario"
                  href="/admin/users/invite"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Registrar Cliente"
                  description="Agregar un nuevo cliente al sistema"
                  href="/admin/clients/create"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Aprobar Promociones"
                  description="Revisar promociones pendientes de aprobación"
                  href="/admin/promotions"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Configuración"
                  description="Ajustar configuraciones del tenant"
                  href="/admin/settings"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <RecentActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No hay actividad reciente</p>
                  </div>
                )}

                {recentActivity.length > 0 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" size="sm">
                      Ver toda la actividad
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para acciones rápidas
interface QuickActionItemProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickActionItem({ title, description, href, icon }: QuickActionItemProps) {
  return (
    <Link href={href} className="block">
      <div className="flex items-center p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="ml-3 flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Componente auxiliar para mostrar actividad reciente
interface RecentActivityItemProps {
  activity: RecentActivity;
}

function RecentActivityItem({ activity }: RecentActivityItemProps) {
  // Función para obtener el icono y color según el tipo de actividad
  const getActivityIcon = (actionType: RecentActivity['action_type']) => {
    const iconProps = "w-4 h-4";

    switch (actionType) {
      case 'brand_created':
      case 'brand_updated':
        return {
          icon: (
            <svg className={`${iconProps} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          bgColor: 'bg-blue-100'
        };
      case 'user_created':
      case 'user_role_assigned':
        return {
          icon: (
            <svg className={`${iconProps} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          ),
          bgColor: 'bg-purple-100'
        };
      case 'client_created':
      case 'client_updated':
        return {
          icon: (
            <svg className={`${iconProps} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          bgColor: 'bg-green-100'
        };
      case 'visit_created':
        return {
          icon: (
            <svg className={`${iconProps} text-indigo-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          bgColor: 'bg-indigo-100'
        };
      case 'order_created':
        return {
          icon: (
            <svg className={`${iconProps} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          ),
          bgColor: 'bg-yellow-100'
        };
      default:
        return {
          icon: (
            <svg className={`${iconProps} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          bgColor: 'bg-gray-100'
        };
    }
  };

  // Función para formatear el tiempo relativo
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'ahora';
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  };

  const { icon, bgColor } = getActivityIcon(activity.action_type);

  return (
    <div className="flex items-start space-x-3">
      <div className={`flex-shrink-0 w-8 h-8 ${bgColor} rounded-full flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {activity.description}
          {activity.user_name && (
            <span className="text-gray-600"> por {activity.user_name}</span>
          )}
        </p>
        <p className="text-xs text-gray-500">{formatRelativeTime(activity.created_at)}</p>
      </div>
    </div>
  );
}
