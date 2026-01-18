'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { adminService } from '@/lib/services/adminService';
import type { Brand, Zone } from '@/lib/types/admin';

/**
 * Página para invitar nuevos usuarios al sistema
 */
export default function InviteUserPage() {
  const router = useRouter();

  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [availableZones, setAvailableZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    employee_code: '',
    role: 'advisor' as 'admin' | 'brand_manager' | 'supervisor' | 'advisor' | 'market_analyst' | 'client',
    brand_id: '',
    zone_id: '',
    send_email: true
  });

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar brands y zonas disponibles
      const [brandsResponse, zonesData] = await Promise.all([
        adminService.getBrands(1, 100),
        adminService.getZones()
      ]);

      setAvailableBrands(brandsResponse.data);
      setAvailableZones(zonesData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      // Crear invitación de usuario
      await adminService.inviteUser({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        position: formData.position || null,
        department: formData.department || null,
        employee_code: formData.employee_code || null,
        role: formData.role,
        brand_id: formData.brand_id || null,
        zone_id: formData.zone_id || null,
        send_email: formData.send_email
      });

      setSuccess('Invitación enviada exitosamente. El usuario recibirá un email para activar su cuenta.');

      // Limpiar formulario
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        employee_code: '',
        role: 'advisor',
        brand_id: '',
        zone_id: '',
        send_email: true
      });

      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);

    } catch (err) {
      console.error('Error inviting user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al enviar invitación: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      brand_manager: 'Gerente de Marca',
      supervisor: 'Supervisor',
      advisor: 'Asesor',
      market_analyst: 'Analista de Mercado',
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Cargando información...</p>
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
                      <span className="ml-4 text-gray-900 font-medium">Invitar Usuario</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Invitar Nuevo Usuario</h1>
              <p className="text-gray-600 mt-1">Crea una invitación para un nuevo miembro del equipo</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin/users">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Usuarios
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

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      {/* Formulario de invitación */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Información Laboral</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Empleado
                </label>
                <input
                  type="text"
                  value={formData.employee_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej: EMP-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posición
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej: Asesor de Ventas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej: Ventas"
                />
              </div>
            </div>
          </div>

          {/* Rol y Permisos */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Rol y Permisos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    role: e.target.value as typeof formData.role
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="advisor">Asesor</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="brand_manager">Gerente de Marca</option>
                  <option value="market_analyst">Analista de Mercado</option>
                  <option value="admin">Administrador</option>
                  <option value="client">Cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Global (todas las marcas)</option>
                  {availableBrands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona
                </label>
                <select
                  value={formData.zone_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, zone_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las zonas</option>
                  {availableZones
                    .filter(zone => !formData.brand_id || zone.brand_id === formData.brand_id)
                    .map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <input
                  id="send_email"
                  type="checkbox"
                  checked={formData.send_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, send_email: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="send_email" className="ml-2 block text-sm text-gray-700">
                  Enviar email de invitación al usuario
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Si está marcado, se enviará un email con instrucciones para activar la cuenta
              </p>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Resumen de la Invitación</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Usuario:</span> {formData.first_name} {formData.last_name}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Rol:</span> {getRoleLabel(formData.role)}</p>
              <p><span className="font-medium">Marca:</span> {
                formData.brand_id
                  ? availableBrands.find(b => b.id === formData.brand_id)?.name || 'No encontrada'
                  : 'Global (todas las marcas)'
              }</p>
              <p><span className="font-medium">Zona:</span> {
                formData.zone_id
                  ? availableZones.find(z => z.id === formData.zone_id)?.name || 'No encontrada'
                  : 'Todas las zonas'
              }</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link href="/admin/users">
              <Button
                variant="outline"
                disabled={sending}
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={sending}
            >
              {sending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Invitación
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}
