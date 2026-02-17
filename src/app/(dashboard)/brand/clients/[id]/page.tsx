'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LoadingSpinner, Alert } from '@/components/ui/feedback';

interface ClientDetail {
  id: string;
  public_id: string;
  business_name: string;
  legal_name: string | null;
  owner_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address_street: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  zones: { id: string; name: string } | null;
  markets: { id: string; name: string } | null;
  client_types: { id: string; name: string; code: string; category: string } | null;
  commercial_structures: { id: string; name: string; code: string; structure_type: string } | null;
}

interface Membership {
  membership_status: string;
  joined_date: string | null;
  lifetime_points: number;
  points_balance: number;
  last_purchase_date: string | null;
}

interface Stats {
  total_visits: number;
  total_orders: number;
}

export default function BrandClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { brandFetch } = useBrandFetch();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await brandFetch(`/api/brand/clients/${clientId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar cliente');
        }
        const data = await response.json();
        setClient(data.client);
        setMembership(data.membership);
        setStats(data.stats);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [clientId, brandFetch]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="error" className="mb-6">
            {error || 'Cliente no encontrado'}
          </Alert>
          <Link href="/brand/clients">
            <Button variant="outline">Volver a Clientes</Button>
          </Link>
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
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">Marca</Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href="/brand/clients" className="ml-4 text-gray-400 hover:text-gray-500">Clientes</Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">{client.business_name}</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{client.business_name}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-500">{client.public_id}</span>
                <StatusBadge status={client.status as 'active' | 'inactive' | 'suspended' | 'pending'} size="sm" />
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href={`/brand/clients/${clientId}/visits`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver Visitas
                </Button>
              </Link>
              <Link href={`/brand/clients/${clientId}/edit`}>
                <Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column - Client Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Info */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Negocio</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nombre del Negocio</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.business_name}</dd>
                  </div>
                  {client.legal_name && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Razón Social</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.legal_name}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Propietario</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.owner_name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cliente Desde</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(client.created_at)}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Contact Info */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.email || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.phone || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.whatsapp || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Address */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Calle</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.address_street || 'N/A'}</dd>
                  </div>
                  {client.address_neighborhood && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Colonia</dt>
                      <dd className="mt-1 text-sm text-gray-900">{client.address_neighborhood}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Ciudad</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.address_city || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.address_state || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">C.P.</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.address_postal_code || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership */}
            {membership && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Membresía</h2>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Estado</dt>
                      <dd>
                        <StatusBadge status={membership.membership_status as 'active' | 'inactive' | 'suspended' | 'pending'} size="sm" />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Fecha de ingreso</dt>
                      <dd className="text-sm text-gray-900">{formatDate(membership.joined_date)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Puntos acumulados</dt>
                      <dd className="text-sm font-semibold text-gray-900">{membership.lifetime_points.toLocaleString('es-MX')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Saldo de puntos</dt>
                      <dd className="text-sm font-semibold text-blue-600">{membership.points_balance.toLocaleString('es-MX')}</dd>
                    </div>
                    {membership.last_purchase_date && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Última compra</dt>
                        <dd className="text-sm text-gray-900">{formatDate(membership.last_purchase_date)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </Card>
            )}

            {/* Segmentation */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Segmentación</h2>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Zona</dt>
                    <dd className="text-sm text-gray-900">{client.zones?.name || 'Sin asignar'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Mercado</dt>
                    <dd className="text-sm text-gray-900">{client.markets?.name || 'Sin asignar'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Tipo</dt>
                    <dd className="text-sm text-gray-900">{client.client_types?.name || 'Sin categoría'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Estructura</dt>
                    <dd className="text-sm text-gray-900">{client.commercial_structures?.name || 'Sin estructura'}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Stats */}
            {stats && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.total_visits}</div>
                      <div className="text-xs text-blue-700">Visitas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.total_orders}</div>
                      <div className="text-xs text-green-700">Órdenes</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
