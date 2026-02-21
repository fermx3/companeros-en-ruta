'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import { adminService } from '@/lib/services/adminService';
import type {
  Client,
  PaginatedResponse,
  Zone,
  Market
} from '@/lib/types/admin';

/**
 * Vista de gestión de clientes para administradores
 * Permite ver, filtrar, crear y gestionar clientes del tenant
 */
export default function AdminClientsPage() {
  const [clients, setClients] = useState<PaginatedResponse<Client & {
    zone_name?: string;
    market_name?: string;
    client_type_name?: string;
    commercial_structure_name?: string;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    zone_id: '',
    market_id: ''
  });

  // Datos para filtros
  const [zones, setZones] = useState<Zone[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Filtrar valores vacíos
      const activeFilters: Record<string, string> = {};
      if (filters.status) activeFilters.status = filters.status;
      if (filters.zone_id) activeFilters.zone_id = filters.zone_id;
      if (filters.market_id) activeFilters.market_id = filters.market_id;

      const response = await adminService.getClients(currentPage, limit, activeFilters);

      // Verificar si la respuesta es válida
      if (response && typeof response === 'object') {
        setClients(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error loading clients:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los clientes';
      setError(errorMessage);
      setClients(null); // Limpiar datos anteriores en caso de error
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Timeout de seguridad para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - forcing loading to false');
        setLoading(false);
        setError('Timeout: La petición tardó demasiado. Por favor, recarga la página.');
      }
    }, 30000); // 30 segundos timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const loadInitialData = async () => {
    try {
      const [zonesData, marketsData] = await Promise.all([
        adminService.getZones(),
        adminService.getMarkets()
      ]);

      setZones(zonesData);
      setMarkets(marketsData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar datos iniciales');
      // Si falla la carga inicial, también deshabilitar loading para mostrar el error
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ status: '', zone_id: '', market_id: '' });
    setCurrentPage(1);
  };

  const handleStatusToggle = async (publicId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setTogglingStatus(publicId);

    try {
      const response = await adminService.updateClientStatus(
        publicId,
        newStatus as 'active' | 'inactive'
      );

      if (response.error) {
        alert(response.error);
      } else {
        await loadClients();
      }
    } catch (err) {
      console.error('Error updating client status:', err);
      alert('Error al cambiar el estado del cliente');
    } finally {
      setTogglingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading && !clients) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando clientes...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-sm text-gray-600 mt-1">
                Administra los clientes y puntos de venta del tenant
              </p>
            </div>
            <Link href="/admin/clients/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Cliente
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
                <h3 className="font-medium">Error al cargar clientes</h3>
                <p className="mt-1">{error}</p>
              </div>
              <Button
                onClick={loadClients}
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
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona
                </label>
                <select
                  value={filters.zone_id}
                  onChange={(e) => handleFilterChange('zone_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas las zonas</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mercado
                </label>
                <select
                  value={filters.market_id}
                  onChange={(e) => handleFilterChange('market_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los mercados</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name}
                    </option>
                  ))}
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

        {/* Tabla de clientes */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Segmentación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Visita
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
                      <p className="text-gray-500">Cargando clientes...</p>
                    </td>
                  </tr>
                ) : clients?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">No hay clientes</p>
                        <p className="text-sm">Comienza creando tu primer cliente</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients?.data.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.business_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.owner_name}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {client.public_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {client.address_city}, {client.address_state}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.zone_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {client.market_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.client_type_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(client.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {client.last_visit_date
                          ? new Date(client.last_visit_date).toLocaleDateString('es-ES')
                          : 'Sin visitas'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/clients/${client.public_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/admin/clients/${client.public_id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleStatusToggle(client.public_id, client.status)}
                          disabled={togglingStatus === client.public_id}
                          className={`${
                            client.status === 'active'
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          } disabled:opacity-50`}
                        >
                          {togglingStatus === client.public_id
                            ? 'Cambiando...'
                            : client.status === 'active'
                              ? 'Desactivar'
                              : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {clients && clients.totalPages > 1 && (
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
                  onClick={() => setCurrentPage(Math.min(clients.totalPages, currentPage + 1))}
                  disabled={currentPage === clients.totalPages}
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
                      {Math.min((currentPage - 1) * limit + 1, clients.count)}
                    </span>{' '}
                    a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * limit, clients.count)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{clients.count}</span> resultados
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

                    {/* Números de página */}
                    {Array.from({ length: Math.min(5, clients.totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 :
                                    currentPage >= clients.totalPages - 2 ? clients.totalPages - 4 + i :
                                    currentPage - 2 + i;

                      if (pageNum < 1 || pageNum > clients.totalPages) return null;

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
                      onClick={() => setCurrentPage(Math.min(clients.totalPages, currentPage + 1))}
                      disabled={currentPage === clients.totalPages}
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
