'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { DistributorCreateForm } from '@/lib/types/admin';

export default function CreateDistributorPage() {
  usePageTitle('Crear Distribuidor');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<DistributorCreateForm>({
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

  const handleInputChange = (field: keyof DistributorCreateForm, value: string) => {
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
      const response = await fetch('/api/admin/distributors/create', {
        method: 'POST',
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
          setError(result.error || 'Error al crear el distribuidor');
        }
        return;
      }

      router.push('/admin/distributors');
    } catch (err) {
      console.error('Error creating distributor:', err);
      setError('Error al crear el distribuidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Distribuidor</h1>
              <p className="text-sm text-gray-600 mt-1">
                Registra un nuevo distribuidor
              </p>
            </div>
            <Link href="/admin/distributors">
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

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link href="/admin/distributors">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? 'Creando...' : 'Crear Distribuidor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
