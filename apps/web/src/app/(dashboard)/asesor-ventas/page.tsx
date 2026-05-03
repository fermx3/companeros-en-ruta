'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { PageLoader, Alert } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { displayPhone } from '@/lib/utils/phone';
import { usePageTitle } from '@/hooks/usePageTitle';
import { QuickActions } from '@/components/layout';
import { Users, ClipboardList, Clock, QrCode, Plus, History, FileText } from 'lucide-react';

interface AsesorVentasProfile {
  id: string;
  public_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  distributor_id: string | null;
  distributor_name: string | null;
  status: string;
  total_clients: number;
  created_at: string;
  updated_at: string;
}

interface AsesorVentasStats {
  total_clients: number;
  orders_this_month: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  qr_redeemed_this_month: number;
  total_sales_amount: number;
  avg_order_value: number;
}

/**
 * Pagina principal del dashboard del Asesor de Ventas
 * Muestra informacion personal, estadisticas y accesos rapidos
 */
export default function AsesorVentasPage() {
  usePageTitle('Dashboard Asesor de Ventas');
  const [profile, setProfile] = useState<AsesorVentasProfile | null>(null);
  const [stats, setStats] = useState<AsesorVentasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar perfil del asesor de ventas
        const profileResponse = await fetch('/api/asesor-ventas/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Error al cargar perfil');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Cargar estadisticas del asesor de ventas
        const statsResponse = await fetch('/api/asesor-ventas/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

      } catch (err) {
        console.error('Error loading asesor de ventas profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar perfil: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <PageLoader message="Cargando perfil..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="error" title="Error">{error}</Alert>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="warning" title="Sin acceso">
            No tienes un perfil de Asesor de Ventas asignado.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.full_name}
                  </h1>
                  <p className="text-gray-600">
                    Asesor de Ventas
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <StatusBadge status={profile.status as 'active' | 'inactive'} size="sm" />
                    {profile.distributor_name && (
                      <span className="text-sm text-gray-500">• {profile.distributor_name}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link href="/asesor-ventas/profile/edit">
                  <Button variant="outline" size="sm">
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadisticas principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Clientes Asignados"
              value={stats.total_clients}
              icon={<Users className="h-6 w-6" />}
            />
            <MetricCard
              title="Ordenes del Mes"
              value={stats.orders_this_month}
              icon={<ClipboardList className="h-6 w-6" />}
            />
            <MetricCard
              title="Ordenes Pendientes"
              value={stats.pending_orders}
              icon={<Clock className="h-6 w-6" />}
              variant="warning"
            />
            <MetricCard
              title="QRs Canjeados (Mes)"
              value={stats.qr_redeemed_this_month}
              icon={<QrCode className="h-6 w-6" />}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informacion Personal */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informacion Personal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  </div>

                  {profile.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Telefono</label>
                      <p className="mt-1 text-sm text-gray-900">{displayPhone(profile.phone)}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Distribuidor</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {profile.distributor_name || 'Sin distribuidor asignado'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Clientes Asignados</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.total_clients}</p>
                  </div>
                </div>

                {/* Resumen de ventas */}
                {stats && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Resumen de Ventas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Total Ordenes</p>
                        <p className="text-xl font-semibold text-gray-900">{stats.total_orders}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Ventas Totales</p>
                        <p className="text-xl font-semibold text-gray-900">
                          ${stats.total_sales_amount.toLocaleString('es-MX')}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500">Promedio por Orden</p>
                        <p className="text-xl font-semibold text-gray-900">
                          ${stats.avg_order_value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Accesos Rapidos */}
          <div>
            <QuickActions
              title="Accesos Rápidos"
              actions={[
                { href: '/asesor-ventas/clients', icon: Users, label: 'Mis Clientes' },
                { href: '/asesor-ventas/orders', icon: ClipboardList, label: 'Mis Ordenes' },
                { href: '/asesor-ventas/orders/create', icon: Plus, label: 'Nueva Orden' },
                { href: '/asesor-ventas/entregar-promocion', icon: QrCode, label: 'Entregar Promoción (QR)' },
                { href: '/asesor-ventas/historial-qr', icon: History, label: 'Historial QR' },
                { href: '/asesor-ventas/surveys', icon: FileText, label: 'Encuestas' },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
