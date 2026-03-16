'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { DistributorUpdateForm } from '@/lib/types/admin';

interface BrandAssignment {
  id: string
  name: string
  logo_url: string | null
  assigned: boolean
}

export default function EditDistributorPage() {
  usePageTitle('Editar Distribuidor');
  const router = useRouter();
  const params = useParams();
  const distributorId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [brands, setBrands] = useState<BrandAssignment[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsSaving, setBrandsSaving] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [brandsSuccess, setBrandsSuccess] = useState(false);

  const [formData, setFormData] = useState<DistributorUpdateForm>({
    name: '',
    legal_name: '',
    rfc: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country: 'México',
    status: 'active',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadDistributor = useCallback(async () => {
    setInitialLoading(true);
    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar el distribuidor');
      }

      const data = result.data;
      setEmployeeCount(data.employee_count || 0);
      setFormData({
        name: data.name || '',
        legal_name: data.legal_name || '',
        rfc: data.rfc || '',
        contact_name: data.contact_name || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        address_street: data.address_street || '',
        address_city: data.address_city || '',
        address_state: data.address_state || '',
        address_postal_code: data.address_postal_code || '',
        address_country: data.address_country || 'México',
        status: data.status || 'active',
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setInitialLoading(false);
    }
  }, [distributorId]);

  useEffect(() => {
    loadDistributor();
  }, [loadDistributor]);

  const loadBrands = useCallback(async () => {
    setBrandsLoading(true);
    setBrandsError(null);
    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/brands`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al cargar marcas');
      setBrands(result.brands || []);
    } catch (err) {
      setBrandsError(err instanceof Error ? err.message : 'Error al cargar marcas');
    } finally {
      setBrandsLoading(false);
    }
  }, [distributorId]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const handleBrandToggle = (brandId: string) => {
    setBrands(prev => prev.map(b =>
      b.id === brandId ? { ...b, assigned: !b.assigned } : b
    ));
    setBrandsSuccess(false);
  };

  const handleSaveBrands = async () => {
    setBrandsSaving(true);
    setBrandsError(null);
    setBrandsSuccess(false);
    try {
      const assignedIds = brands.filter(b => b.assigned).map(b => b.id);
      const response = await fetch(`/api/admin/distributors/${distributorId}/brands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_ids: assignedIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al guardar marcas');
      setBrandsSuccess(true);
    } catch (err) {
      setBrandsError(err instanceof Error ? err.message : 'Error al guardar marcas');
    } finally {
      setBrandsSaving(false);
    }
  };

  const handleInputChange = (field: keyof DistributorUpdateForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      errors.contact_email = 'Email inválido';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          const errors: Record<string, string> = {};
          result.details.forEach((detail: { field: string; message: string }) => {
            errors[detail.field] = detail.message;
          });
          setValidationErrors(errors);
          setError('Por favor corrige los errores en el formulario');
        } else {
          setError(result.error || 'Error al actualizar el distribuidor');
        }
        return;
      }

      router.push(`/admin/distributors/${distributorId}`);
    } catch (err) {
      console.error('Error updating distributor:', err);
      setError('Error al actualizar el distribuidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este distribuidor? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/distributors/${distributorId}/edit`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al eliminar el distribuidor');
        return;
      }

      router.push('/admin/distributors');
    } catch (err) {
      console.error('Error deleting distributor:', err);
      setError('Error al eliminar el distribuidor. Intenta nuevamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando distribuidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Distribuidor</h1>
              <p className="text-sm text-gray-600 mt-1">
                Modifica la información del distribuidor
              </p>
            </div>
            <Link href={`/admin/distributors/${distributorId}`}>
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Básicos */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Distribuidora del Norte"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social</label>
                  <input
                    type="text"
                    value={formData.legal_name}
                    onChange={(e) => handleInputChange('legal_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Razón social completa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RFC</label>
                  <input
                    type="text"
                    value={formData.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
                    maxLength={13}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="RFC del distribuidor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Contacto */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Contacto</label>
                  <input
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre completo del contacto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.contact_email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="contacto@ejemplo.com"
                  />
                  {validationErrors.contact_email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.contact_email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+52 55 1234 5678"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Dirección */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calle</label>
                  <input
                    type="text"
                    value={formData.address_street}
                    onChange={(e) => handleInputChange('address_street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Calle y número"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                  <input
                    type="text"
                    value={formData.address_city}
                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <input
                    type="text"
                    value={formData.address_state}
                    onChange={(e) => handleInputChange('address_state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Estado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                  <input
                    type="text"
                    value={formData.address_postal_code}
                    onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                  <input
                    type="text"
                    value={formData.address_country}
                    onChange={(e) => handleInputChange('address_country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="México"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Notas */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notas adicionales sobre el distribuidor..."
              />
            </div>
          </Card>

          {/* Marcas Disponibles */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Marcas Disponibles</h3>
                <Button
                  type="button"
                  onClick={handleSaveBrands}
                  disabled={brandsSaving || brandsLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  {brandsSaving && <LoadingSpinner size="sm" className="mr-2" />}
                  {brandsSaving ? 'Guardando...' : 'Guardar Marcas'}
                </Button>
              </div>

              {brandsError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {brandsError}
                </div>
              )}

              {brandsSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
                  Marcas actualizadas correctamente
                </div>
              )}

              {brandsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : brands.length === 0 ? (
                <p className="text-sm text-gray-500 py-4">
                  No hay marcas activas en el tenant
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {brands.map(brand => (
                    <label
                      key={brand.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        brand.assigned
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={brand.assigned}
                        onChange={() => handleBrandToggle(brand.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <div className="flex items-center min-w-0">
                        {brand.logo_url && (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-6 h-6 object-contain rounded mr-2 flex-shrink-0"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {brand.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Botones */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={deleteLoading || loading}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {deleteLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {deleteLoading ? 'Eliminando...' : 'Eliminar Distribuidor'}
            </Button>

            {employeeCount > 0 && (
              <p className="text-xs text-gray-500 self-center">
                Este distribuidor tiene {employeeCount} empleado(s) asignado(s)
              </p>
            )}

            <div className="flex space-x-4">
              <Link href={`/admin/distributors/${distributorId}`}>
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                {loading && <LoadingSpinner size="sm" className="mr-2" />}
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
