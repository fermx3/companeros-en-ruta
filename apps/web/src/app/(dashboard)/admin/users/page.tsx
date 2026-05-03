'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/status-badge';
import { adminService } from '@/lib/services/adminService';
import { displayPhone } from '@/lib/utils/phone';
import type { UserProfile, UserRoleRecord } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ChevronRight, Plus, UserPlus, Users, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import { ClickableCard } from '@/components/ui/clickable-card';
import { ListItemActions } from '@/components/ui/list-item-actions';

interface UserWithRoles extends UserProfile {
  user_roles?: UserRoleRecord[];
  roles?: UserRoleRecord[];
  is_client?: boolean;
}

/**
 * Página principal de gestión de usuarios y roles
 */
export default function UsersListPage() {
  usePageTitle('Usuarios');
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
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-6">
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
                      <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-300" />
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link href="/admin/users/invite">
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invitar Usuario
                </Button>
              </Link>
              <Link href="/admin/users/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
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
                      <Users className="w-4 h-4 mr-2" />
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
    <Link href={`/admin/users/${user.public_id}`} className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
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
        <div className="flex items-center space-x-2">
          {user.is_client && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
              Cliente
            </span>
          )}
          <StatusBadge status={user.status === 'active' ? 'active' : 'inactive'} />
        </div>
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

      <ListItemActions className="flex flex-wrap gap-2">
        {!user.is_client && (
        <Link href={`/admin/users/${user.public_id}/roles`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full">
            <ShieldCheck className="w-4 h-4 mr-1" />
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
                <Ban className="w-4 h-4 mr-1" />
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
                <CheckCircle className="w-4 h-4 mr-1" />
                Reactivar
              </>
            )}
          </Button>
        )}
      </ListItemActions>
    </Link>
  );
}
