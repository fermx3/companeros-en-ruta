'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidMxPhone } from '@/lib/utils/phone';

interface FormData {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
}

export default function BrandClientEditPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { brandFetch } = useBrandFetch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address_street: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
  });

  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);
      try {
        const response = await brandFetch(`/api/brand/clients/${clientId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar cliente');
        }
        const data = await response.json();
        const c = data.client;
        setClientName(c.business_name);
        setFormData({
          business_name: c.business_name || '',
          owner_name: c.owner_name || '',
          email: c.email || '',
          phone: c.phone || '',
          whatsapp: c.whatsapp || '',
          address_street: c.address_street || '',
          address_neighborhood: c.address_neighborhood || '',
          address_city: c.address_city || '',
          address_state: c.address_state || '',
          address_postal_code: c.address_postal_code || '',
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [clientId, brandFetch]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!formData.business_name.trim()) {
      setError('El nombre del negocio es requerido');
      setSaving(false);
      return;
    }

    if (!isValidMxPhone(formData.phone)) {
      setError('El teléfono debe tener 10 dígitos');
      setSaving(false);
      return;
    }
    if (!isValidMxPhone(formData.whatsapp)) {
      setError('El WhatsApp debe tener 10 dígitos');
      setSaving(false);
      return;
    }

    try {
      const response = await brandFetch(`/api/brand/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar cliente');
      }

      setSuccess('Cliente actualizado exitosamente');
      setTimeout(() => {
        router.push(`/brand/clients/${clientId}`);
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando cliente...</p>
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
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">Marca</Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href="/brand/clients" className="ml-4 text-gray-400 hover:text-gray-500">Clientes</Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href={`/brand/clients/${clientId}`} className="ml-4 text-gray-400 hover:text-gray-500">{clientName}</Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Editar</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">Editar Cliente</h1>
            </div>
            <Link href={`/brand/clients/${clientId}`}>
              <Button variant="outline">Cancelar</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Negocio</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Propietario
                  </label>
                  <input
                    type="text"
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => handleChange('owner_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Contact Info */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <PhoneInput
                  value={formData.phone}
                  onChange={(digits) => handleChange('phone', digits)}
                  label="Teléfono"
                  id="phone"
                />
                <PhoneInput
                  value={formData.whatsapp}
                  onChange={(digits) => handleChange('whatsapp', digits)}
                  label="WhatsApp"
                  id="whatsapp"
                />
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-1">
                    Calle
                  </label>
                  <input
                    type="text"
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="address_neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                    Colonia
                  </label>
                  <input
                    type="text"
                    id="address_neighborhood"
                    value={formData.address_neighborhood}
                    onChange={(e) => handleChange('address_neighborhood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => handleChange('address_city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="address_state"
                    value={formData.address_state}
                    onChange={(e) => handleChange('address_state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="address_postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    id="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={(e) => handleChange('address_postal_code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-3">
            <Link href={`/brand/clients/${clientId}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
