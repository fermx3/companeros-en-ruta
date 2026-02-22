'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import type { Zone } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';

interface ZoneEditForm {
  name: string;
  code: string;
  zone_type: string;
  description: string;
  country: string;
  state: string;
  cities: string;
  postal_codes: string;
  parent_zone_id: string;
  sort_order: number;
  is_active: boolean;
}

export default function EditZonePage() {
  usePageTitle('Editar Zona');
  const router = useRouter();
  const params = useParams();
  const zoneId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [parentZones, setParentZones] = useState<Zone[]>([]);

  const [formData, setFormData] = useState<ZoneEditForm>({
    name: '',
    code: '',
    zone_type: '',
    description: '',
    country: 'MX',
    state: '',
    cities: '',
    postal_codes: '',
    parent_zone_id: '',
    sort_order: 0,
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const [zoneRes, zonesRes] = await Promise.all([
        fetch(`/api/admin/zones/${zoneId}`),
        fetch('/api/admin/zones?limit=200&is_active=true')
      ]);

      const zoneResult = await zoneRes.json();
      const zonesResult = await zonesRes.json();

      if (!zoneRes.ok) {
        throw new Error(zoneResult.error || 'Error al cargar la zona');
      }

      const zoneData = zoneResult.data;

      // Exclude current zone from parent options
      const allZones = (zonesResult.data || []).filter((z: Zone) => z.id !== zoneId);
      setParentZones(allZones);

      setFormData({
        name: zoneData.name || '',
        code: zoneData.code || '',
        zone_type: zoneData.zone_type || '',
        description: zoneData.description || '',
        country: zoneData.country || 'MX',
        state: zoneData.state || '',
        cities: zoneData.cities ? zoneData.cities.join('\n') : '',
        postal_codes: zoneData.postal_codes ? zoneData.postal_codes.join('\n') : '',
        parent_zone_id: zoneData.parent_zone_id || '',
        sort_order: zoneData.sort_order || 0,
        is_active: zoneData.is_active ?? true
      });
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setInitialLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleInputChange = (field: keyof ZoneEditForm, value: string | number | boolean) => {
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
    if (!formData.code.trim()) errors.code = 'El código es requerido';
    if (!formData.zone_type) errors.zone_type = 'El tipo de zona es requerido';
    if (!formData.country.trim()) errors.country = 'El país es requerido';
    if (formData.country.length !== 2) errors.country = 'El código de país debe tener 2 caracteres';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const citiesArray = formData.cities.trim()
        ? formData.cities.split('\n').map(c => c.trim()).filter(Boolean)
        : undefined;
      const postalCodesArray = formData.postal_codes.trim()
        ? formData.postal_codes.split('\n').map(c => c.trim()).filter(Boolean)
        : undefined;

      const payload = {
        name: formData.name,
        code: formData.code,
        zone_type: formData.zone_type,
        description: formData.description || undefined,
        country: formData.country,
        state: formData.state || undefined,
        cities: citiesArray,
        postal_codes: postalCodesArray,
        parent_zone_id: formData.parent_zone_id || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active
      };

      const response = await fetch(`/api/admin/zones/${zoneId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
          setError(result.error || 'Error al actualizar la zona');
        }
        return;
      }

      router.push(`/admin/zones/${zoneId}`);
    } catch (err) {
      console.error('Error updating zone:', err);
      setError('Error al actualizar la zona. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta zona? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/zones/${zoneId}/edit`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al eliminar la zona');
        return;
      }

      router.push('/admin/zones');
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError('Error al eliminar la zona. Intenta nuevamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando zona...</p>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Zona</h1>
              <p className="text-sm text-gray-600 mt-1">
                Modifica la información de la zona
              </p>
            </div>
            <Link href={`/admin/zones/${zoneId}`}>
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
          {/* Información Básica */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Zona Norte CDMX"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: ZN-CDMX"
                  />
                  {validationErrors.code && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Zona *
                  </label>
                  <select
                    value={formData.zone_type}
                    onChange={(e) => handleInputChange('zone_type', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.zone_type ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="country">País</option>
                    <option value="region">Región</option>
                    <option value="state">Estado</option>
                    <option value="city">Ciudad</option>
                    <option value="district">Distrito</option>
                    <option value="custom">Personalizado</option>
                  </select>
                  {validationErrors.zone_type && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.zone_type}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción de la zona..."
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Ubicación */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.country ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="CA">Canadá</option>
                    <option value="GT">Guatemala</option>
                    <option value="BZ">Belice</option>
                  </select>
                  {validationErrors.country && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.country}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Jalisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudades
                  </label>
                  <textarea
                    value={formData.cities}
                    onChange={(e) => handleInputChange('cities', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Una ciudad por línea"
                  />
                  <p className="mt-1 text-xs text-gray-500">Una ciudad por línea</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Códigos Postales
                  </label>
                  <textarea
                    value={formData.postal_codes}
                    onChange={(e) => handleInputChange('postal_codes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Un código por línea"
                  />
                  <p className="mt-1 text-xs text-gray-500">Un código postal por línea</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Jerarquía */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Jerarquía</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Padre
                  </label>
                  <select
                    value={formData.parent_zone_id}
                    onChange={(e) => handleInputChange('parent_zone_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin zona padre</option>
                    {parentZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} ({zone.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Configuración */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Menor número aparece primero</p>
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                    Zona activa
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={deleteLoading || loading}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {deleteLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {deleteLoading ? 'Eliminando...' : 'Eliminar Zona'}
            </Button>

            <div className="flex space-x-4">
              <Link href={`/admin/zones/${zoneId}`}>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
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
