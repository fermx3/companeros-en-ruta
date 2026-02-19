'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback';
import { displayPhone } from '@/lib/utils/phone';
import { ExportButton } from '@/components/ui/export-button';

interface TeamMember {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  manager_id: string | null;
  manager_name: string | null;
  last_activity: string | null;
  total_visits: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

/**
 * Página de gestión de equipos de venta para usuarios de marca
 */
export default function BrandTeamPage() {
  const { brandFetch, currentBrandId } = useBrandFetch();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'visits' | 'orders' | 'activity' | 'name'>('visits');

  useEffect(() => {
    if (!currentBrandId) return;

    const controller = new AbortController();

    const loadTeam = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
          ...(searchTerm && { search: searchTerm }),
          ...(selectedRole && { role: selectedRole }),
          ...(selectedStatus && { status: selectedStatus })
        });

        const response = await brandFetch(`/api/brand/team?${params}`, { signal: controller.signal });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar el equipo');
        }

        const data = await response.json();
        setTeam(data.team || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        if (controller.signal.aborted) return;
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar equipo: ${errorMessage}`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadTeam();
    return () => controller.abort();
  }, [page, searchTerm, selectedRole, selectedStatus, brandFetch, currentBrandId]);

  const filteredTeam = team.filter(member => {
    const matchesSearch = !searchTerm ||
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.public_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || member.role === selectedRole;
    const matchesStatus = !selectedStatus || member.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedTeam = [...filteredTeam].sort((a, b) => {
    switch (sortBy) {
      case 'visits': return b.total_visits - a.total_visits;
      case 'orders': return b.total_orders - a.total_orders;
      case 'activity': return new Date(b.last_activity || 0).getTime() - new Date(a.last_activity || 0).getTime();
      case 'name': return a.full_name.localeCompare(b.full_name);
      default: return 0;
    }
  });

  const topPerformers = [...filteredTeam]
    .sort((a, b) => b.total_visits - a.total_visits)
    .slice(0, 3);

  const sortOptions = [
    { value: 'visits', label: 'Más visitas' },
    { value: 'orders', label: 'Más órdenes' },
    { value: 'activity', label: 'Actividad reciente' },
    { value: 'name', label: 'Nombre (A-Z)' }
  ];

  const roles = [
    { value: '', label: 'Todos los roles' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'promotor', label: 'Promotor' }
  ];

  const statuses = [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  if (loading && team.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando equipo de ventas...</p>
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
                      <span className="ml-4 text-gray-900 font-medium">Equipo de Ventas</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Equipo de Ventas
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona promotores y supervisores de tu marca
              </p>
            </div>
            <div className="flex space-x-3">
              <ExportButton
                endpoint="/api/brand/team/export"
                filename="equipo"
                filters={{ search: searchTerm, role: selectedRole, status: selectedStatus }}
              />
              <Link href="/brand/team/invite">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Invitar Miembro
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

        {/* Métricas del equipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {filteredTeam.filter(m => m.role === 'supervisor').length}
              </div>
              <div className="text-sm text-gray-600">Supervisores</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {filteredTeam.filter(m => m.role === 'promotor').length}
              </div>
              <div className="text-sm text-gray-600">Promotores</div>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {filteredTeam.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Miembros Activos</div>
            </div>
          </Card>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPerformers.map((member, index) => {
                  const medalColors = [
                    'bg-yellow-100 text-yellow-800 border-yellow-300',
                    'bg-gray-100 text-gray-700 border-gray-300',
                    'bg-orange-100 text-orange-800 border-orange-300',
                  ];
                  const medalLabels = ['#1', '#2', '#3'];
                  return (
                    <div key={member.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${medalColors[index]}`}>
                      <span className="text-lg font-bold">{medalLabels[index]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.full_name}</p>
                        <p className="text-xs">{member.total_visits} visitas · {member.total_orders} órdenes</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar miembro
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o email..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('');
                    setSelectedStatus('');
                    setSortBy('visits');
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

        {/* Lista de Miembros del Equipo */}
        {sortedTeam.length === 0 && !loading ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            title="No hay miembros en el equipo"
            description={searchTerm || selectedRole || selectedStatus ? "No se encontraron miembros con los filtros aplicados." : "Comienza invitando a tu primer miembro del equipo de ventas."}
            action={
              <Link href="/brand/team/invite">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Invitar Primer Miembro
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Grid de Miembros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedTeam.map((member, index) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  rank={index + 1}
                  supervisors={filteredTeam.filter(m => m.role === 'supervisor' && m.id !== member.id)}
                  onSupervisorChange={async (memberId, supervisorId) => {
                    try {
                      if (supervisorId) {
                        await brandFetch(`/api/brand/team/${memberId}/supervisor`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ supervisor_id: supervisorId }),
                        });
                      } else {
                        await brandFetch(`/api/brand/team/${memberId}/supervisor`, {
                          method: 'DELETE',
                        });
                      }
                      // Reload team
                      setPage(p => p); // trigger re-render
                      // Force a full reload by toggling a counter
                      setTeam(prev => prev.map(m =>
                        m.id === memberId
                          ? { ...m, manager_id: supervisorId, manager_name: supervisorId ? (filteredTeam.find(s => s.id === supervisorId)?.full_name || null) : null }
                          : m
                      ));
                    } catch (err) {
                      console.error('Error updating supervisor:', err);
                      setError('Error al actualizar supervisor');
                    }
                  }}
                />
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

// Componente para cada miembro del equipo
interface TeamMemberCardProps {
  member: TeamMember;
  rank: number;
  supervisors: TeamMember[];
  onSupervisorChange: (memberId: string, supervisorId: string | null) => void;
}

function TeamMemberCard({ member, rank, supervisors, onSupervisorChange }: TeamMemberCardProps) {
  const getRankBadge = (r: number) => {
    if (r === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: '#1' };
    if (r === 2) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', label: '#2' };
    if (r === 3) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', label: '#3' };
    return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: `#${r}` };
  };

  const rankBadge = getRankBadge(rank);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return 'Nunca';

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;

    return formatDate(dateString);
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      supervisor: 'Supervisor',
      promotor: 'Promotor'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      supervisor: 'bg-blue-100 text-blue-800',
      promotor: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-xs font-bold ${rankBadge.bg} ${rankBadge.text} ${rankBadge.border}`}>
                {rankBadge.label}
              </span>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{member.full_name}</h3>
                <p className="text-sm text-gray-500">{member.public_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                {getRoleLabel(member.role)}
              </span>
              <StatusBadge status={member.status as 'active' | 'inactive' | 'suspended' | 'pending'} size="sm" />
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>{member.email}</span>
          </div>

          {member.phone && (
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{displayPhone(member.phone)}</span>
            </div>
          )}
        </div>

        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{member.total_visits}</div>
            <div className="text-xs text-blue-700">Visitas Totales</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{member.total_orders}</div>
            <div className="text-xs text-green-700">Órdenes Generadas</div>
          </div>
        </div>

        {/* Supervisor assignment (only for promotors) */}
        {member.role === 'promotor' && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Supervisor Directo</label>
            <select
              value={member.manager_id || ''}
              onChange={(e) => onSupervisorChange(member.id, e.target.value || null)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sin supervisor</option>
              {supervisors.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.full_name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Última actividad */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Última actividad: {formatLastActivity(member.last_activity)}</span>
          <span>Miembro desde: {formatDate(member.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/brand/team/${member.id}`}>
              <Button size="sm" variant="outline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Perfil
              </Button>
            </Link>
            <Link href={`/brand/team/${member.id}/performance`}>
              <Button size="sm" variant="outline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Rendimiento
              </Button>
            </Link>
          </div>
          <Link href={`/brand/team/${member.id}/edit`}>
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
