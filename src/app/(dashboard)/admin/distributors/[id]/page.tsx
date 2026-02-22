'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import type { Distributor } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';

type DistributorDetail = Distributor & { employee_count: number };

export default function DistributorDetailPage() {
  usePageTitle('Detalle de Distribuidor');
  const params = useParams();
  const distributorId = params.id as string;

  const [distributor, setDistributor] = useState<DistributorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDistributor = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar el distribuidor');
      }

      setDistributor(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el distribuidor');
    } finally {
      setLoading(false);
    }
  }, [distributorId]);

  useEffect(() => {
    loadDistributor();
  }, [loadDistributor]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando distribuidor...</p>
        </div>
      </div>
    );
  }

  if (error || !distributor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Distribuidor no encontrado'}</p>
            <Link href="/admin/distributors">
              <Button variant="outline">Volver a Distribuidores</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{distributor.name}</h1>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {distributor.public_id}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Detalle de distribuidor</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin/distributors">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </Button>
              </Link>
              <Link href={`/admin/distributors/${distributorId}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Básicos */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Básicos</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Razón Social</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.legal_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">RFC</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.rfc || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Public ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.public_id}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Contacto */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre del Contacto</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.contact_name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.contact_email || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.contact_phone || '—'}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Dirección */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Calle</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.address_street || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ciudad</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.address_city || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.address_state || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Código Postal</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.address_postal_code || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">País</dt>
                    <dd className="mt-1 text-sm text-gray-900">{distributor.address_country}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Notas */}
            {distributor.notes && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{distributor.notes}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estado</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Estado</span>
                    {getStatusBadge(distributor.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Empleados asignados</span>
                    <span className="text-sm font-medium text-gray-900">{distributor.employee_count}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Creado</span>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(distributor.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {distributor.updated_at && (
                    <div>
                      <span className="text-sm text-gray-500">Actualizado</span>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(distributor.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
