'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import type { Client } from '@/lib/types/admin';

/**
 * Página de detalle de cliente
 * Muestra la información completa de un cliente específico
 */
export default function ClientDetailPage() {
  const params = useParams();
  const [client, setClient] = useState<(Client & {
    zone_name?: string;
    market_name?: string;
    client_type_name?: string;
    commercial_structure_name?: string;
  }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientPublicId = params.clientId as string;

  const loadClientDetail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientPublicId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar el cliente');
      }

      setClient(result.data);
    } catch (err) {
      console.error('Error loading client:', err);
      setError('Error al cargar la información del cliente');
    } finally {
      setLoading(false);
    }
  }, [clientPublicId]);

  useEffect(() => {
    if (clientPublicId) {
      loadClientDetail();
    }
  }, [clientPublicId, loadClientDetail]);

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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el cliente</h3>
          <p className="text-gray-600 mb-4">{error || 'Cliente no encontrado'}</p>
          <Link href="/admin/clients">
            <Button variant="outline">
              Volver a Clientes
            </Button>
          </Link>
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
            <div className="flex items-center space-x-4">
              <Link href="/admin/clients">
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.business_name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {client.public_id} • {client.owner_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(client.status)}
              <Link href={`/admin/clients/${clientPublicId}/edit`}>
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
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre del Negocio</label>
                    <p className="mt-1 text-sm text-gray-900">{client.business_name}</p>
                  </div>
                  {client.legal_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Razón Social</label>
                      <p className="mt-1 text-sm text-gray-900">{client.legal_name}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Propietario</label>
                    <p className="mt-1 text-sm text-gray-900">{client.owner_name}</p>
                  </div>
                  {client.tax_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">RFC/Tax ID</label>
                      <p className="mt-1 text-sm text-gray-900">{client.tax_id}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {client.registration_date
                        ? new Date(client.registration_date).toLocaleDateString('es-ES')
                        : 'No registrada'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Última Visita</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {client.last_visit_date
                        ? new Date(client.last_visit_date).toLocaleDateString('es-ES')
                        : 'Sin visitas'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {client.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">
                        <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                          {client.email}
                        </a>
                      </p>
                    </div>
                  )}
                  {client.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">
                        <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800">
                          {client.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  {client.whatsapp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">WhatsApp</label>
                      <p className="mt-1 text-sm text-gray-900">
                        <a
                          href={`https://wa.me/${client.whatsapp.replace(/[^\d]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          {client.whatsapp}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Ubicación */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{client.address_street}</p>
                  {client.address_neighborhood && (
                    <p className="text-sm text-gray-600">{client.address_neighborhood}</p>
                  )}
                  <p className="text-sm text-gray-900">
                    {client.address_city}, {client.address_state} {client.address_postal_code}
                  </p>
                  <p className="text-sm text-gray-600">{client.address_country}</p>
                </div>
              </div>
            </Card>

            {/* Configuración Comercial */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Comercial</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Frecuencia de Visitas</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {client.visit_frequency_days ? `${client.visit_frequency_days} días` : 'No definida'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Frecuencia de Evaluación</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {client.assessment_frequency_days ? `${client.assessment_frequency_days} días` : 'No definida'}
                    </p>
                  </div>
                  {client.payment_terms && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Términos de Pago</label>
                      <p className="mt-1 text-sm text-gray-900">{client.payment_terms}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Pedido Mínimo</label>
                    <p className="mt-1 text-sm text-gray-900">
                      ${client.minimum_order?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Límite de Crédito</label>
                    <p className="mt-1 text-sm text-gray-900">
                      ${client.credit_limit?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Segmentación */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Segmentación</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Zona</label>
                    <p className="mt-1 text-sm text-gray-900">{client.zone_name || 'No asignada'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mercado</label>
                    <p className="mt-1 text-sm text-gray-900">{client.market_name || 'No asignado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipo de Cliente</label>
                    <p className="mt-1 text-sm text-gray-900">{client.client_type_name || 'No asignado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estructura Comercial</label>
                    <p className="mt-1 text-sm text-gray-900">{client.commercial_structure_name || 'No asignada'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Acciones Rápidas */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones</h3>
                <div className="space-y-3">
                  <Link href={`/admin/clients/${clientPublicId}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Cliente
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Ver Historial
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Programar Visita
                  </Button>
                </div>
              </div>
            </Card>

            {/* Estadísticas */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Visitas</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Pedidos</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Facturación Total</span>
                    <span className="text-sm font-medium text-gray-900">$0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Último Pedido</span>
                    <span className="text-sm font-medium text-gray-900">-</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
