'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import type { Zone, PaginatedResponse } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';

type ZoneWithParent = Zone & { parent_zone_name?: string | null };

export default function AdminZonesPage() {
  usePageTitle('Zonas');
  const [zones, setZones] = useState<PaginatedResponse<ZoneWithParent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    zone_type: '',
    is_active: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const loadZones = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.zone_type) params.set('zone_type', filters.zone_type);
      if (filters.is_active) params.set('is_active', filters.is_active);

      const response = await fetch(`/api/admin/zones?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar zonas');
      }

      setZones(result);
    } catch (err) {
      console.error('Error loading zones:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las zonas';
      setError(errorMessage);
      setZones(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout: La petición tardó demasiado. Por favor, recarga la página.');
      }
    }, 30000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', zone_type: '', is_active: '' });
    setCurrentPage(1);
  };

  const getZoneTypeBadge = (zoneType: string) => {
    const styles: Record<string, string> = {
      country: 'bg-purple-100 text-purple-800',
      region: 'bg-blue-100 text-blue-800',
      state: 'bg-indigo-100 text-indigo-800',
      city: 'bg-green-100 text-green-800',
      district: 'bg-yellow-100 text-yellow-800',
      custom: 'bg-gray-100 text-gray-800'
    };

    const labels: Record<string, string> = {
      country: 'País',
      region: 'Región',
      state: 'Estado',
      city: 'Ciudad',
      district: 'Distrito',
      custom: 'Personalizado'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[zoneType] || styles.custom}`}>
        {labels[zoneType] || zoneType}
      </span>
    );
  };

  const getActiveBadge = (isActive: boolean) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? 'Activa' : 'Inactiva'}
    </span>
  );

  if (loading && !zones) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando zonas...</p>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Zonas</h1>
              <p className="text-sm text-gray-600 mt-1">
                Administra las zonas geográficas del tenant
              </p>
            </div>
            <Link href="/admin/zones/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Zona
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex justify-between items-start">
              <div className="text-red-700">
                <h3 className="font-medium">Error al cargar zonas</h3>
                <p className="mt-1">{error}</p>
              </div>
              <Button
                onClick={loadZones}
                variant="outline"
                size="sm"
                disabled={loading}
                className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Cargando...
                  </>
                ) : (
                  'Reintentar'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Nombre, código o ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Zona
                </label>
                <select
                  value={filters.zone_type}
                  onChange={(e) => handleFilterChange('zone_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="country">País</option>
                  <option value="region">Región</option>
                  <option value="state">Estado</option>
                  <option value="city">Ciudad</option>
                  <option value="district">Distrito</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  <option value="true">Activas</option>
                  <option value="false">Inactivas</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabla de zonas */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona Padre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <LoadingSpinner size="sm" className="mx-auto mb-2" />
                      <p className="text-gray-500">Cargando zonas...</p>
                    </td>
                  </tr>
                ) : zones?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-lg font-medium">No hay zonas</p>
                        <p className="text-sm">Comienza creando tu primera zona</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  zones?.data.map((zone) => (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {zone.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {zone.code}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {zone.public_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getZoneTypeBadge(zone.zone_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {zone.parent_zone_name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {zone.state || '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {zone.country}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getActiveBadge(zone.is_active)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/zones/${zone.public_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/admin/zones/${zone.public_id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {zones && zones.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(zones.totalPages, currentPage + 1))}
                  disabled={currentPage === zones.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando{' '}
                    <span className="font-medium">
                      {Math.min((currentPage - 1) * limit + 1, zones.count)}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, zones.count)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{zones.count}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="rounded-r-none"
                    >
                      Anterior
                    </Button>

                    {Array.from({ length: Math.min(5, zones.totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 :
                                    currentPage >= zones.totalPages - 2 ? zones.totalPages - 4 + i :
                                    currentPage - 2 + i;

                      if (pageNum < 1 || pageNum > zones.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="rounded-none"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      onClick={() => setCurrentPage(Math.min(zones.totalPages, currentPage + 1))}
                      disabled={currentPage === zones.totalPages}
                      variant="outline"
                      size="sm"
                      className="rounded-l-none"
                    >
                      Siguiente
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
