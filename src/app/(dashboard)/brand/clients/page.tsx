'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback';
import { ExportButton } from '@/components/ui/export-button';
import { displayPhone } from '@/lib/utils/phone';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Client {
  id: string;
  public_id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  client_type: string;
  commercial_structure?: string;
  commercial_structure_type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Página de gestión de clientes para usuarios de marca
 */
export default function BrandClientsPage() {
  usePageTitle('Clientes');
  const { brandFetch, currentBrandId } = useBrandFetch();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    if (!currentBrandId) return;

    const controller = new AbortController();

    const loadClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(searchTerm && { search: searchTerm }),
          ...(selectedType && { type: selectedType })
        })

        const response = await brandFetch(`/api/brand/clients?${params}`, {
          signal: controller.signal
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al cargar clientes')
        }

        const data = await response.json()
        setClients(data.clients || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } catch (err) {
        if (controller.signal.aborted) return;
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar clientes: ${errorMessage}`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadClients();
    return () => controller.abort();
  }, [page, searchTerm, selectedType, brandFetch, currentBrandId]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = !searchTerm ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.public_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !selectedType || client.client_type === selectedType;

    return matchesSearch && matchesType;
  });

  const clientTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'mayorista', label: 'Mayorista' },
    { value: 'minorista', label: 'Minorista' },
    { value: 'distribuidor', label: 'Distribuidor' },
    { value: 'institucional', label: 'Institucional' }
  ];

  if (loading && clients.length === 0) {
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">
                      Marca
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Clientes</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra los clientes de tu marca
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton
                endpoint="/api/brand/clients/export"
                filename="clientes"
                filters={{ search: searchTerm, type: selectedType }}
              />
              <Link href="/brand/clients/create">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Cliente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar cliente
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o ID del cliente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cliente
                </label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {clientTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de Clientes */}
        {filteredClients.length === 0 && !loading ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="No hay clientes registrados"
            description={searchTerm || selectedType ? "No se encontraron clientes con los filtros aplicados." : "Comienza agregando tu primer cliente para empezar a gestionar tu cartera."}
            action={
              <Link href="/brand/clients/create">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primer Cliente
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Grid de Clientes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada cliente
interface ClientCardProps {
  client: Client;
}

function ClientCard({ client }: ClientCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      mayorista: 'Mayorista',
      minorista: 'Minorista',
      distribuidor: 'Distribuidor',
      institucional: 'Institucional'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      mayorista: 'bg-blue-100 text-blue-800',
      minorista: 'bg-green-100 text-green-800',
      distribuidor: 'bg-purple-100 text-purple-800',
      institucional: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
              <StatusBadge status={client.status as 'active' | 'inactive' | 'suspended' | 'pending'} size="sm" />
            </div>
            <p className="text-sm text-gray-500">{client.public_id}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(client.commercial_structure || client.client_type)}`}>
                {getTypeLabel(client.commercial_structure || client.client_type)}
              </span>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          {client.contact_email && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{client.contact_email}</span>
            </div>
          )}

          {client.contact_phone && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{displayPhone(client.contact_phone)}</span>
            </div>
          )}

          {client.address && (
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="flex-1">{client.address}</span>
            </div>
          )}
        </div>

        {/* Fechas */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Cliente desde: {formatDate(client.created_at)}</span>
          <span>Actualizado: {formatDate(client.updated_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/brand/clients/${client.public_id}`}>
              <Button size="sm" variant="outline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Detalle
              </Button>
            </Link>
            <Link href={`/brand/clients/${client.public_id}/visits`}>
              <Button size="sm" variant="outline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visitas
              </Button>
            </Link>
          </div>
          <Link href={`/brand/clients/${client.public_id}/edit`}>
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
