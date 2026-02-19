'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import type { Zone } from '@/lib/types/admin';

type ZoneDetail = Zone & {
  parent_zone_name?: string | null;
  parent_zone_public_id?: string | null;
  client_count?: number;
};

export default function ZoneDetailPage() {
  const params = useParams();
  const zoneId = params.id as string;

  const [zone, setZone] = useState<ZoneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadZone = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/zones/${zoneId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar la zona');
      }

      setZone(result.data);
    } catch (err) {
      console.error('Error loading zone:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la zona');
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    loadZone();
  }, [loadZone]);

  const getZoneTypeLabel = (zoneType: string) => {
    const labels: Record<string, string> = {
      country: 'País',
      region: 'Región',
      state: 'Estado',
      city: 'Ciudad',
      district: 'Distrito',
      custom: 'Personalizado'
    };
    return labels[zoneType] || zoneType;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando zona...</p>
        </div>
      </div>
    );
  }

  if (error || !zone) {
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
            <p className="text-gray-600 mb-4">{error || 'Zona no encontrada'}</p>
            <Link href="/admin/zones">
              <Button variant="outline">Volver a Zonas</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{zone.name}</h1>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {zone.public_id}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Detalle de zona
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin/zones">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </Button>
              </Link>
              <Link href={`/admin/zones/${zone.id}/edit`}>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                    <dd className="mt-1 text-sm text-gray-900">{zone.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Código</dt>
                    <dd className="mt-1 text-sm text-gray-900">{zone.code}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getZoneTypeLabel(zone.zone_type)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Public ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{zone.public_id}</dd>
                  </div>
                  {zone.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                      <dd className="mt-1 text-sm text-gray-900">{zone.description}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </Card>

            {/* Ubicación */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">País</dt>
                    <dd className="mt-1 text-sm text-gray-900">{zone.country}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{zone.state || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ciudades</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {zone.cities && zone.cities.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {zone.cities.map((city, i) => (
                            <li key={i}>{city}</li>
                          ))}
                        </ul>
                      ) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Códigos Postales</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {zone.postal_codes && zone.postal_codes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {zone.postal_codes.map((code, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 rounded">
                              {code}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estado</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Activa</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      zone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {zone.is_active ? 'Sí' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Clientes asignados</span>
                    <span className="text-sm font-medium text-gray-900">{zone.client_count ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Orden</span>
                    <span className="text-sm text-gray-900">{zone.sort_order}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Jerarquía */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Jerarquía</h3>
                <div>
                  <span className="text-sm text-gray-500">Zona Padre</span>
                  {zone.parent_zone_name ? (
                    <p className="mt-1 text-sm text-gray-900">{zone.parent_zone_name}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">Sin zona padre</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Fechas */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Creada</span>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(zone.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {zone.updated_at && (
                    <div>
                      <span className="text-sm text-gray-500">Actualizada</span>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(zone.updated_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
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
