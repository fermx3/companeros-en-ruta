'use client';

import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { VisitStatusBadge } from '@/components/ui/visit-status-badge';
import { ExportButton } from '@/components/ui/export-button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ClickableCard } from '@/components/ui/clickable-card';
import { ChevronRight, MapPin, Star } from 'lucide-react';

interface Visit {
  id: string;
  public_id: string;
  visit_date: string;
  visit_status: string;
  duration: number | null;
  rating: number | null;
  promotor_notes: string | null;
  client_id: string;
  client_name: string;
  promotor_name: string;
}

interface Summary {
  total: number;
  active: number;
  completed: number;
  avg_rating: number;
}

export default function BrandVisitsPage() {
  usePageTitle('Visitas');
  const { brandFetch, currentBrandId } = useBrandFetch();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, completed: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!currentBrandId) return;

    const controller = new AbortController();

    const loadVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(statusFilter && { status: statusFilter }),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(dateFrom && { date_from: dateFrom }),
          ...(dateTo && { date_to: dateTo }),
        });
        const response = await brandFetch(`/api/brand/visits?${queryParams}`, { signal: controller.signal });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar visitas');
        }
        const data = await response.json();
        setVisits(data.visits || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setSummary(data.summary || { total: 0, active: 0, completed: 0, avg_rating: 0 });
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setError(msg);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadVisits();
    return () => controller.abort();
  }, [brandFetch, page, statusFilter, debouncedSearch, dateFrom, dateTo, currentBrandId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'scheduled', label: 'Programada' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  if (loading && visits.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando visitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
                      <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-300" />
                      <span className="ml-4 text-gray-900 font-medium">Visitas</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Visitas de la Marca</h1>
              <p className="text-gray-600 mt-1">Historial de visitas a clientes</p>
            </div>
            <ExportButton
              endpoint="/api/brand/visits/export"
              filename="visitas"
              filters={{ status: statusFilter, search: debouncedSearch, date_from: dateFrom, date_to: dateTo }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Visitas" value={summary.total} />
          <MetricCard title="En Progreso" value={summary.active} variant="warning" />
          <MetricCard title="Completadas" value={summary.completed} variant="success" />
          <MetricCard title="Rating Promedio" value={summary.avg_rating > 0 ? summary.avg_rating.toFixed(1) : 'N/A'} variant="primary" />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar cliente
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre de cliente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  id="date-from"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateFrom(val);
                    if (dateTo && val > dateTo) setDateTo(val);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  id="date-to"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateTo(val);
                    if (dateFrom && val < dateFrom) setDateFrom(val);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => { setSearchTerm(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Visits List */}
        {visits.length === 0 && !loading ? (
          <EmptyState
            icon={<MapPin className="w-16 h-16" />}
            title="No hay visitas registradas"
            description={statusFilter || searchTerm || dateFrom
              ? 'No se encontraron visitas con los filtros aplicados.'
              : 'Aún no se han registrado visitas para esta marca.'}
          />
        ) : (
          <div className="space-y-4">
            {visits.map((visit) => (
              <ClickableCard key={visit.id} href={`/brand/visits/${visit.id}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500">{visit.public_id}</span>
                          <VisitStatusBadge status={visit.visit_status} />
                          {visit.rating != null && (
                            <span className="inline-flex items-center text-sm text-yellow-600">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                              {visit.rating}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <span className="ml-1 text-gray-900">{formatDate(visit.visit_date)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cliente:</span>
                            <span className="ml-1 text-blue-600">{visit.client_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Promotor:</span>
                            <span className="ml-1 text-gray-900">{visit.promotor_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duración:</span>
                            <span className="ml-1 text-gray-900">
                              {visit.duration ? `${visit.duration} min` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0 mt-1" />
                    </div>
                  </div>
              </ClickableCard>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button onClick={() => setPage(page - 1)} disabled={page <= 1} variant="outline">
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button onClick={() => setPage(page + 1)} disabled={page >= totalPages} variant="outline">
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
