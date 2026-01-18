'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { adminService } from '@/lib/services/adminService';
import type { Brand, AdminDashboardMetrics } from '@/lib/types/admin';

/**
 * Dashboard principal para usuarios con rol de Marca
 * Muestra métricas y gestión específica de su marca asignada
 */
export default function BrandDashboard() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: Implementar endpoint para obtener la marca del usuario actual
        // const brandResponse = await adminService.getCurrentUserBrand();
        // setBrand(brandResponse.data);

        // Por ahora usar métricas generales - TODO: filtrar por marca
        const metricsResponse = await adminService.getDashboardMetrics();
        if (metricsResponse.data) {
          setMetrics(metricsResponse.data);
        }

        // Mock data para desarrollo
        setBrand({
          id: 'mock-brand-1',
          public_id: 'BRD-001',
          tenant_id: 'mock-tenant',
          name: 'Mi Marca',
          slug: 'mi-marca',
          description: 'Descripción de mi marca',
          logo_url: null,
          brand_color_primary: '#3B82F6',
          brand_color_secondary: '#10B981',
          contact_email: 'contacto@mimarca.com',
          contact_phone: null,
          website: 'https://mimarca.com',
          status: 'active',
          settings: null,
          dashboard_metrics: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null
        });

      } catch (err) {
        console.error('Error loading brand dashboard:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar dashboard: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard de marca...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="error">
            {error}
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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {/* Brand Logo/Icon */}
              {brand?.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: brand?.brand_color_primary || '#3B82F6' }}
                >
                  {brand?.name?.charAt(0)?.toUpperCase() || 'M'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {brand?.name || 'Mi Marca'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Panel de gestión de marca
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/brand/settings">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Clientes Activos"
            value={metrics?.totalClients || 0}
            subtitle="En tu marca"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="blue"
          />

          <MetricCard
            title="Visitas del Mes"
            value={metrics?.monthlyVisits || 0}
            subtitle="Por asesores"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            color="green"
          />

          <MetricCard
            title="Órdenes Totales"
            value={metrics?.totalOrders || 0}
            subtitle="Generadas"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            color="yellow"
          />

          <MetricCard
            title="Facturación"
            value={`$${(metrics?.monthlyRevenue || 0).toLocaleString()}`}
            subtitle="Este mes"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Acciones rápidas */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <QuickActionItem
                  title="Gestionar Clientes"
                  description="Ver y administrar tus clientes"
                  href="/brand/clients"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Promociones Activas"
                  description="Gestionar campañas y ofertas"
                  href="/brand/promotions"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Equipos de Venta"
                  description="Administrar asesores y supervisores"
                  href="/brand/team"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  }
                />
                <QuickActionItem
                  title="Reportes y Analytics"
                  description="Ver métricas detalladas"
                  href="/brand/reports"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </Card>

          {/* Información de la marca */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Información de la Marca
              </h3>
              {brand && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">ID Público:</span>
                    <span className="text-sm text-gray-900">{brand.public_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Slug:</span>
                    <span className="text-sm text-gray-900 font-mono">{brand.slug}</span>
                  </div>
                  {brand.contact_email && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900">{brand.contact_email}</span>
                    </div>
                  )}
                  {brand.website && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Website:</span>
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver sitio
                      </a>
                    </div>
                  )}
                  {/* Colores de marca */}
                  {(brand.brand_color_primary || brand.brand_color_secondary) && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 block mb-2">Colores:</span>
                      <div className="flex space-x-3">
                        {brand.brand_color_primary && (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: brand.brand_color_primary }}
                            />
                            <span className="text-xs text-gray-600 font-mono">
                              {brand.brand_color_primary}
                            </span>
                          </div>
                        )}
                        {brand.brand_color_secondary && (
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: brand.brand_color_secondary }}
                            />
                            <span className="text-xs text-gray-600 font-mono">
                              {brand.brand_color_secondary}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para las métricas
interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    yellow: 'bg-yellow-500 text-yellow-100',
    purple: 'bg-purple-500 text-purple-100'
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>
    </Card>
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
