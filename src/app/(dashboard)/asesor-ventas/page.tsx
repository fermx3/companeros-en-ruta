'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { PageLoader, StatusBadge, Alert } from '@/components/ui/feedback';
import { displayPhone } from '@/lib/utils/phone';

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="error" title="Error">{error}</Alert>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="warning" title="Sin acceso">
            No tienes un perfil de Asesor de Ventas asignado.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Clientes Asignados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_clients}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ordenes del Mes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.orders_this_month}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Ordenes Pendientes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.pending_orders}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        QRs Canjeados (Mes)
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.qr_redeemed_this_month}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Card>
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
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Accesos Rapidos
                </h3>

                <div className="space-y-3">
                  <Link href="/asesor-ventas/clients" className="block">
                    <div className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Mis Clientes</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/asesor-ventas/orders" className="block">
                    <div className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Mis Ordenes</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/asesor-ventas/orders/create" className="block">
                    <div className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Nueva Orden</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/asesor-ventas/entregar-promocion" className="block">
                    <div className="p-3 border border-emerald-200 bg-emerald-50 rounded-lg hover:border-emerald-400 hover:bg-emerald-100 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        <span className="text-sm font-medium text-emerald-700">Entregar Promocion (QR)</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/asesor-ventas/historial-qr" className="block">
                    <div className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Historial QR</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/asesor-ventas/surveys" className="block">
                    <div className="p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-emerald-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">Encuestas</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
