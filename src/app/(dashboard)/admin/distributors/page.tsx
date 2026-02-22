'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import type { Distributor, PaginatedResponse } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';

type DistributorWithCount = Distributor & { employee_count: number };

export default function AdminDistributorsPage() {
  usePageTitle('Distribuidores');
  const [distributors, setDistributors] = useState<PaginatedResponse<DistributorWithCount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const debouncedSearch = useDebounce(filters.search, 300);

  const loadDistributors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.status) params.set('status', filters.status);

      const response = await fetch(`/api/admin/distributors?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar distribuidores');
      }

      setDistributors(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los distribuidores';
      setError(errorMessage);
      setDistributors(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearch, filters.status]);

  useEffect(() => {
    loadDistributors();
  }, [loadDistributors]);

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
    setFilters({ search: '', status: '' });
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading && !distributors) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando distribuidores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Distribuidores</h1>
              <p className="text-sm text-gray-600 mt-1">
                Administra los distribuidores del tenant
              </p>
            </div>
            <Link href="/admin/distributors/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Distribuidor
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
                <h3 className="font-medium">Error al cargar distribuidores</h3>
                <p className="mt-1">{error}</p>
              </div>
              <Button
                onClick={loadDistributors}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Nombre, RFC, contacto o ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
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

        {/* Tabla */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <LoadingSpinner size="sm" className="mx-auto mb-2" />
                      <p className="text-gray-500">Cargando distribuidores...</p>
                    </td>
                  </tr>
                ) : distributors?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <p className="text-lg font-medium">No hay distribuidores</p>
                        <p className="text-sm">Comienza creando tu primer distribuidor</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  distributors?.data.map((dist) => (
                    <tr key={dist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{dist.name}</div>
                          {dist.legal_name && (
                            <div className="text-sm text-gray-500">{dist.legal_name}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">{dist.public_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dist.rfc || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{dist.contact_name || '—'}</div>
                        {dist.contact_email && (
                          <div className="text-sm text-gray-500">{dist.contact_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{dist.address_city || '—'}</div>
                        {dist.address_state && (
                          <div className="text-sm text-gray-500">{dist.address_state}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(dist.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {dist.employee_count}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/distributors/${dist.public_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/admin/distributors/${dist.public_id}/edit`}
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
          {distributors && distributors.totalPages > 1 && (
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
                  onClick={() => setCurrentPage(Math.min(distributors.totalPages, currentPage + 1))}
                  disabled={currentPage === distributors.totalPages}
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
                      {Math.min((currentPage - 1) * limit + 1, distributors.count)}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, distributors.count)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{distributors.count}</span> resultados
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

                    {Array.from({ length: Math.min(5, distributors.totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 :
                                    currentPage >= distributors.totalPages - 2 ? distributors.totalPages - 4 + i :
                                    currentPage - 2 + i;

                      if (pageNum < 1 || pageNum > distributors.totalPages) return null;

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
                      onClick={() => setCurrentPage(Math.min(distributors.totalPages, currentPage + 1))}
                      disabled={currentPage === distributors.totalPages}
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
