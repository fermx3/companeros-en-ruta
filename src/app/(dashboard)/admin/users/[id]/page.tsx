'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LoadingSpinner, Alert } from '@/components/ui/feedback';
import { PhoneInput } from '@/components/ui/phone-input';
import { displayPhone } from '@/lib/utils/phone';
import { adminService } from '@/lib/services/adminService';
import type { UserProfile, UserRoleRecord, Brand } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';

interface SupervisorOption {
  id: string;
  first_name: string;
  last_name: string;
}

interface UserWithDetails extends UserProfile {
  user_roles?: UserRoleRecord[];
  brands?: Brand[];
}

/**
 * Página de detalles y edición de un usuario específico
 */
export default function UserDetailPage() {
  usePageTitle('Detalle de Usuario');
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    employee_code: '',
    position: '',
    department: '',
    timezone: '',
    manager_id: '' as string | null,
  });
  const [availableSupervisors, setAvailableSupervisors] = useState<SupervisorOption[]>([]);
  const [managerName, setManagerName] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userData = await adminService.getUserById(userId);
      setUser(userData);

      // Check if this user is a client
      const clientCheck = await adminService.isClientUser(userId);
      setIsClient(clientCheck);

      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        employee_code: userData.employee_code || '',
        position: userData.position || '',
        department: userData.department || '',
        timezone: userData.timezone || '',
        manager_id: userData.manager_id || '',
      });

      // Load manager name for read mode
      if (userData.manager_id) {
        try {
          const managerData = await adminService.getUserById(userData.manager_id);
          setManagerName(`${managerData.first_name} ${managerData.last_name}`.trim());
        } catch {
          setManagerName(null);
        }
      } else {
        setManagerName(null);
      }
    } catch (err) {
      console.error('Error loading user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar usuario';
      setError(`Error al cargar usuario: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      // Convert empty strings to null for nullable unique/FK fields
      const cleanedData = {
        ...formData,
        phone: formData.phone || null,
        employee_code: formData.employee_code || null,
        position: formData.position || null,
        department: formData.department || null,
        timezone: formData.timezone || undefined,
        manager_id: formData.manager_id || null,
      };
      await adminService.updateUser(user.id, cleanedData);
      await loadUser();
      setEditMode(false);
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al actualizar usuario';
      setError(`Error al actualizar usuario: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user || !confirm(`¿Estás seguro de desactivar al usuario ${user.first_name} ${user.last_name}?`)) return;

    setSaving(true);
    setError(null);

    try {
      await adminService.deactivateUser(user.id);
      await loadUser();
    } catch (err) {
      console.error('Error deactivating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al desactivar usuario';
      setError(`Error al desactivar usuario: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      await adminService.reactivateUser(user.id);
      await loadUser();
    } catch (err) {
      console.error('Error reactivating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al reactivar usuario';
      setError(`Error al reactivar usuario: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Alert variant="error" className="max-w-md mx-auto">
              Usuario no encontrado
            </Alert>
            <div className="mt-6">
              <Link href="/admin/users">
                <Button variant="outline">Volver a Usuarios</Button>
              </Link>
            </div>
          </div>
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
                      <Link href="/admin/users" className="ml-4 text-gray-400 hover:text-gray-500">
                        Usuarios
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">{user.first_name} {user.last_name}</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Detalle de Usuario
              </h1>
              <p className="text-gray-600 mt-1">
                {user.email}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <StatusBadge
                status={user.status === 'active' ? 'active' : 'inactive'}
              />
              {isClient && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Cliente
                </span>
              )}
              {editMode ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={async () => {
                    setEditMode(true);
                    try {
                      const usersData = await adminService.getUsers(1, 100);
                      const supervisors = usersData.data
                        .filter(u =>
                          u.id !== userId &&
                          u.status === 'active' &&
                          u.user_roles?.some(r => r.role === 'supervisor' && r.status === 'active')
                        )
                        .map(u => ({ id: u.id, first_name: u.first_name, last_name: u.last_name }));
                      setAvailableSupervisors(supervisors);
                    } catch (err) {
                      console.error('Error loading supervisors:', err);
                    }
                  }}
                  variant="outline"
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="space-y-6">
          {/* Información Principal */}
          <Card className="p-6">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="w-20 h-20 rounded-full object-cover"
                    width={80}
                    height={80}
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-2xl">
                    {user.first_name?.charAt(0)?.toUpperCase() || 'U'}
                    {user.last_name?.charAt(0)?.toUpperCase() || ''}
                  </span>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                {editMode ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(digits) => setFormData({...formData, phone: digits})}
                      label="Teléfono"
                      id="phone"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posición
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código de Empleado
                      </label>
                      <input
                        type="text"
                        value={formData.employee_code}
                        onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supervisor Directo
                      </label>
                      <select
                        value={formData.manager_id || ''}
                        onChange={(e) => setFormData({...formData, manager_id: e.target.value || null})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sin supervisor asignado</option>
                        {availableSupervisors.map(sup => (
                          <option key={sup.id} value={sup.id}>
                            {sup.first_name} {sup.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="text-lg font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-gray-900">{user.phone ? displayPhone(user.phone) : 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Posición</p>
                      <p className="text-gray-900">{user.position || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Código Empleado</p>
                      <p className="text-gray-900">{user.employee_code || 'No asignado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Supervisor Directo</p>
                      <p className="text-gray-900">{managerName || 'Sin supervisor asignado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID Público</p>
                      <p className="text-gray-900 font-mono text-sm">{user.public_id}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Roles del Usuario */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Roles Asignados</h2>
              {!isClient && (
              <Link href={`/admin/users/${userId}/roles`}>
                <Button variant="outline" size="sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Gestionar Roles
                </Button>
              </Link>
              )}
            </div>

            <div className="space-y-3">
              {user.user_roles && user.user_roles.length > 0 ? (
                user.user_roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">
                        {role.role.replace('_', ' ')}
                      </span>
                    </div>
                    <StatusBadge status={role.status === 'active' ? 'active' : 'inactive'} size="sm" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p>No se han asignado roles a este usuario</p>
                </div>
              )}
            </div>
          </Card>

          {/* Acciones de Usuario */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Acciones de Usuario</h2>
            <div className="flex space-x-4">
              {user.status === 'active' ? (
                <Button
                  onClick={handleDeactivate}
                  variant="destructive"
                  disabled={saving}
                >
                  {saving ? 'Procesando...' : 'Desactivar Usuario'}
                </Button>
              ) : (
                <Button
                  onClick={handleReactivate}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={saving}
                >
                  {saving ? 'Procesando...' : 'Reactivar Usuario'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
