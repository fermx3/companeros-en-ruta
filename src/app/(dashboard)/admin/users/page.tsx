'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback';
import { adminService } from '@/lib/services/adminService';
import { displayPhone } from '@/lib/utils/phone';
import type { UserProfile, UserRoleRecord } from '@/lib/types/admin';

interface UserWithRoles extends UserProfile {
  user_roles?: UserRoleRecord[];
  roles?: UserRoleRecord[];
  is_client?: boolean;
}

/**
 * Página principal de gestión de usuarios y roles
 */
export default function UsersListPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getUsers(page, 10);

      // Mapear user_roles a roles para compatibilidad
      const usersWithRoles = response.data.map(user => ({
        ...user,
        roles: user.user_roles || []
      }));

      setUsers(usersWithRoles);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error loading users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar usuarios';
      setError(`Error al cargar usuarios: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de desactivar este usuario? Podrás reactivarlo más tarde.')) {
      return;
    }

    setDeleting(userId);
    try {
      await adminService.deactivateUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error deactivating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al desactivar usuario: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    setDeleting(userId);
    try {
      await adminService.reactivateUser(userId);
      await loadUsers();
    } catch (err) {
      console.error('Error reactivating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al reactivar usuario: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando usuarios...</p>
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
                    <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                      Admin
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Usuarios</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-1">
                Administra usuarios, perfiles y asignación de roles
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin/users/invite">
                <Button className="bg-green-600 hover:bg-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Invitar Usuario
                </Button>
              </Link>
              <Link href="/admin/users/create">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Usuario
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Lista de usuarios */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Usuarios del Sistema
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {users.length} usuarios encontrados
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onDeactivate={() => handleDeactivateUser(user.id)}
                  onReactivate={() => handleReactivateUser(user.id)}
                  isProcessing={deleting === user.id}
                />
              ))
            ) : (
              <EmptyState
                title="No hay usuarios"
                description="No se han creado usuarios aún."
                action={
                  <Link href="/admin/users/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Crear Primer Usuario
                    </Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {page} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Componente para cada card de usuario
interface UserCardProps {
  user: UserWithRoles;
  onDeactivate: () => void;
  onReactivate: () => void;
  isProcessing: boolean;
}

function UserCard({ user, onDeactivate, onReactivate, isProcessing }: UserCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMainRole = () => {
    if (!user.roles || user.roles.length === 0) return 'Sin rol asignado';

    // Buscar roles activos - considerar activo si status es 'active' o null/undefined
    const activeRoles = user.roles.filter(r =>
      r.status === 'active' || r.status === null || r.status === undefined
    );

    if (activeRoles.length === 0) return 'Roles inactivos';

    // Mapeo de roles con mejores etiquetas
    const roleLabels: Record<string, string> = {
      'admin': 'Administrador',
      'brand_manager': 'Gerente de Marca',
      'supervisor': 'Supervisor',
      'promotor': 'Promotor',
      'market_analyst': 'Analista de Mercado',
      'client': 'Cliente'
    };

    // Jerarquía de roles para mostrar el más importante
    const hierarchy = ['admin', 'brand_manager', 'supervisor', 'promotor', 'market_analyst', 'client'];

    for (const roleType of hierarchy) {
      const role = activeRoles.find(r => r.role === roleType);
      if (role) return roleLabels[role.role] || role.role;
    }

    // Fallback: usar el primer rol activo
    const firstRole = activeRoles[0];
    return roleLabels[firstRole.role] || firstRole.role;
  };

  const getRoleCount = () => {
    if (!user.roles) return 0;
    return user.roles.filter(r =>
      r.status === 'active' || r.status === null || r.status === undefined
    ).length;
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={`${user.first_name} ${user.last_name}`}
                className="w-12 h-12 rounded-full object-cover"
                width={48}
                height={48}
              />
            ) : (
              <span className="text-blue-600 font-semibold text-lg">
                {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                {user.last_name?.charAt(0)?.toUpperCase() || ''}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-500">{user.public_id}</p>
          </div>
        </div>
        <StatusBadge status={user.status === 'active' ? 'active' : 'inactive'} />
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Email:</span>
          <span className="text-gray-900">{user.email}</span>
        </div>
        {user.phone && (
          <div className="flex justify-between">
            <span>Teléfono:</span>
            <span className="text-gray-900">{displayPhone(user.phone)}</span>
          </div>
        )}
        {user.position && (
          <div className="flex justify-between">
            <span>Posición:</span>
            <span className="text-gray-900">{user.position}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Rol principal:</span>
          <span className="text-gray-900 font-medium">{getMainRole()}</span>
        </div>
        <div className="flex justify-between">
          <span>Total roles:</span>
          <span className="text-blue-600 font-medium">{getRoleCount()}</span>
        </div>
        <div className="flex justify-between">
          <span>Creado:</span>
          <span>{formatDate(user.created_at)}</span>
        </div>
        {user.last_login_at && (
          <div className="flex justify-between">
            <span>Último login:</span>
            <span>{formatDate(user.last_login_at)}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Link href={`/admin/users/${user.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver Perfil
          </Button>
        </Link>
        {!user.is_client && (
        <Link href={`/admin/users/${user.id}/roles`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Roles
          </Button>
        </Link>
        )}
        {user.status === 'active' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onDeactivate}
            disabled={isProcessing}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Desactivar
              </>
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={onReactivate}
            disabled={isProcessing}
            className="text-green-600 hover:text-green-700 hover:border-green-300"
          >
            {isProcessing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reactivar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
