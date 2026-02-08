'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, Alert } from '@/components/ui/feedback'
import { adminService } from '@/lib/services/adminService'
import type { UserProfile, UserRole, Brand, Distributor } from '@/lib/types/admin'

// ===========================================
// Types
// ===========================================

interface UserWithRoles extends UserProfile {
  user_roles?: UserRole[]
}

interface NewRoleData {
  role: 'admin' | 'brand_manager' | 'supervisor' | 'promotor' | 'asesor_de_ventas'
  brand_id: string
  distributor_id: string
}

// ===========================================
// Component
// ===========================================

/**
 * Pagina de gestion de roles para un usuario especifico.
 * Permite a administradores asignar y gestionar roles por usuario.
 *
 * @example
 * /admin/users/USR-0001/roles
 *
 * Requiere rol: admin
 */
export default function UserRolesPage() {
  // ===========================================
  // Hooks y State
  // ===========================================

  const params = useParams()
  const userId = params?.id as string

  // Estados principales
  const [user, setUser] = useState<UserWithRoles | null>(null)
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([])
  const [availableDistributors, setAvailableDistributors] = useState<Distributor[]>([])

  // Estados de UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddRole, setShowAddRole] = useState(false)
  const [saving, setSaving] = useState(false)

  // Estado para formulario de nuevo rol
  const [newRole, setNewRole] = useState<NewRoleData>({
    role: 'promotor',
    brand_id: '',
    distributor_id: ''
  })

  // ===========================================
  // Handlers y Effects
  // ===========================================

  /**
   * Cargar datos iniciales: usuario, brands y distribuidores
   */
  const loadData = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // Cargar usuario con roles
      const userData = await adminService.getUserById(userId)
      setUser(userData)

      // Cargar brands disponibles
      const brandsResponse = await adminService.getBrands(1, 100)
      setAvailableBrands(brandsResponse.data)

      // Cargar distribuidores disponibles
      const distributorsResponse = await adminService.getDistributors()
      setAvailableDistributors(distributorsResponse)
    } catch (err) {
      console.error('Error loading data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar datos: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  /**
   * Manejar asignacion de nuevo rol
   */
  const handleAddRole = async () => {
    if (!user) return

    // Validar que los roles que requieren brand_id lo tengan
    const rolesThatRequireBrand = ['brand_manager', 'supervisor', 'promotor']
    if (rolesThatRequireBrand.includes(newRole.role) && !newRole.brand_id) {
      setError(`El rol ${getRoleLabel(newRole.role)} requiere seleccionar una marca`)
      return
    }

    // Validar que asesor_de_ventas tenga distribuidor
    if (newRole.role === 'asesor_de_ventas' && !newRole.distributor_id) {
      setError('El rol Asesor de Ventas requiere seleccionar un distribuidor')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await adminService.assignUserRole(user.id, {
        role: newRole.role,
        brand_id: newRole.role === 'asesor_de_ventas' ? null : (newRole.brand_id || null),
        distributor_id: newRole.role === 'asesor_de_ventas' ? newRole.distributor_id : undefined
      })

      // Recargar datos y limpiar formulario
      await loadData()
      setShowAddRole(false)
      setNewRole({ role: 'promotor', brand_id: '', distributor_id: '' })
    } catch (err) {
      console.error('Error adding role:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al asignar rol: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Activar/desactivar rol existente
   */
  const handleToggleRole = async (roleId: string, currentStatus: boolean) => {
    if (!user) return

    setSaving(true)
    setError(null)

    try {
      if (currentStatus) {
        await adminService.deactivateUserRole(roleId)
      } else {
        await adminService.activateUserRole(roleId)
      }

      await loadData() // Recargar datos
    } catch (err) {
      console.error('Error toggling role:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al modificar rol: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  /**
   * Eliminar rol de usuario
   */
  const handleRemoveRole = async (roleId: string) => {
    if (!user || !confirm('¿Estas seguro de eliminar este rol?')) return

    setSaving(true)
    setError(null)

    try {
      await adminService.removeUserRole(roleId)
      await loadData() // Recargar datos
    } catch (err) {
      console.error('Error removing role:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al eliminar rol: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // ===========================================
  // Utility Functions
  // ===========================================

  /**
   * Obtener etiqueta legible para un rol
   */
  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      brand_manager: 'Gerente de Marca',
      supervisor: 'Supervisor',
      promotor: 'Promotor',
      asesor_de_ventas: 'Asesor de Ventas'
    }
    return labels[role] || role
  }

  /**
   * Obtener nombre de marca por ID
   */
  const getBrandName = (brandId: string | null): string => {
    if (!brandId) return 'Global'
    const brand = availableBrands.find(b => b.id === brandId)
    return brand?.name || 'Marca desconocida'
  }

  /**
   * Obtener nombre de distribuidor por ID
   */
  const getDistributorName = (distributorId: string | null): string => {
    if (!distributorId) return '-'
    const distributor = availableDistributors.find(d => d.id === distributorId)
    return distributor?.name || 'Distribuidor desconocido'
  }

  // ===========================================
  // Render States
  // ===========================================

  // Estado de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Cargando roles del usuario...</p>
      </div>
    )
  }

  // Usuario no encontrado
  if (!user) {
    return (
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
    )
  }

  // Roles que requieren marca
  const rolesThatRequireBrand = ['brand_manager', 'supervisor', 'promotor']
  const requiresBrand = rolesThatRequireBrand.includes(newRole.role)
  const requiresDistributor = newRole.role === 'asesor_de_ventas'

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===========================================
          Header Section
          =========================================== */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Breadcrumb */}
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
                      <Link href={`/admin/users/${userId}`} className="ml-4 text-gray-400 hover:text-gray-500">
                        {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Roles</span>
                    </div>
                  </li>
                </ol>
              </nav>

              {/* Page Title */}
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Roles de {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 mt-1">Gestiona los roles y permisos del usuario</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Link href={`/admin/users/${userId}`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al Usuario
                </Button>
              </Link>

              <Button
                onClick={() => setShowAddRole(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saving}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Rol
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===========================================
          Main Content
          =========================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* ===========================================
            Add Role Modal
            =========================================== */}
        {showAddRole && (
          <Card className="mb-6 p-6 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Agregar Nuevo Rol</h2>
              <Button
                onClick={() => setShowAddRole(false)}
                variant="outline"
                size="sm"
                aria-label="Cerrar modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rol Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newRole.role}
                  onChange={(e) => setNewRole(prev => ({
                    ...prev,
                    role: e.target.value as NewRoleData['role'],
                    brand_id: '',
                    distributor_id: ''
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="promotor">Promotor</option>
                  <option value="asesor_de_ventas">Asesor de Ventas</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="brand_manager">Gerente de Marca</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {/* Brand Selector - solo para roles que requieren marca */}
              {requiresBrand && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRole.brand_id}
                    onChange={(e) => setNewRole(prev => ({ ...prev, brand_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !newRole.brand_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una marca</option>
                    {availableBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {!newRole.brand_id && (
                    <p className="text-red-500 text-xs mt-1">
                      Este rol requiere seleccionar una marca
                    </p>
                  )}
                </div>
              )}

              {/* Distributor Selector - solo para asesor_de_ventas */}
              {requiresDistributor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distribuidor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRole.distributor_id}
                    onChange={(e) => setNewRole(prev => ({ ...prev, distributor_id: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !newRole.distributor_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona un distribuidor</option>
                    {availableDistributors.map(distributor => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.name}
                      </option>
                    ))}
                  </select>
                  {!newRole.distributor_id && (
                    <p className="text-red-500 text-xs mt-1">
                      Este rol requiere seleccionar un distribuidor
                    </p>
                  )}
                  {availableDistributors.length === 0 && (
                    <p className="text-amber-600 text-xs mt-1">
                      No hay distribuidores disponibles. Crea uno primero.
                    </p>
                  )}
                </div>
              )}

              {/* Info para admin */}
              {newRole.role === 'admin' && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                    El rol Administrador tiene acceso global a todas las marcas y funciones del sistema.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => setShowAddRole(false)}
                variant="outline"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddRole}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? 'Asignando...' : 'Asignar Rol'}
              </Button>
            </div>
          </Card>
        )}

        {/* ===========================================
            Roles List Section
            =========================================== */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Roles Actuales</h2>

          <div className="space-y-4">
            {user.user_roles && user.user_roles.length > 0 ? (
              user.user_roles.map((role: UserRole, index: number) => (
                <div key={role.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        role.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getRoleLabel(role.role)}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          {role.brand_id && (
                            <span className="block">Marca: {getBrandName(role.brand_id)}</span>
                          )}
                          {role.role === 'asesor_de_ventas' && user.distributor_id && (
                            <span className="block">Distribuidor: {getDistributorName(user.distributor_id)}</span>
                          )}
                          {role.role === 'admin' && (
                            <span className="block text-blue-600">Acceso global</span>
                          )}
                        </div>
                        {role.permissions && Object.keys(role.permissions).length > 0 && (
                          <div className="text-sm text-gray-500 mt-1">
                            Permisos especiales configurados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge
                      status={role.status === 'active' ? 'active' : 'inactive'}
                    />

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleToggleRole(role.id, role.status === 'active')}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                      >
                        {role.status === 'active' ? 'Desactivar' : 'Activar'}
                      </Button>

                      <Button
                        onClick={() => handleRemoveRole(role.id)}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <p className="text-gray-500">No se han asignado roles a este usuario</p>
                <Button
                  onClick={() => setShowAddRole(true)}
                  className="bg-blue-600 hover:bg-blue-700 mt-4"
                >
                  Agregar Primer Rol
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
