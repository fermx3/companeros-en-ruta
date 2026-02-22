'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import { Settings } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Tenant } from '@/lib/types/admin';

interface SettingsForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
}

const TIMEZONE_OPTIONS = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST/CDT)' },
  { value: 'America/Cancun', label: 'Cancún (EST)' },
  { value: 'America/Monterrey', label: 'Monterrey (CST/CDT)' },
  { value: 'America/Tijuana', label: 'Tijuana (PST/PDT)' },
  { value: 'America/Hermosillo', label: 'Hermosillo (MST)' },
  { value: 'America/Chihuahua', label: 'Chihuahua (MST/MDT)' },
  { value: 'America/Mazatlan', label: 'Mazatlán (MST/MDT)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT/BRST)' },
  { value: 'America/New_York', label: 'Nueva York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (PST/PDT)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
];

export default function AdminSettingsPage() {
  usePageTitle('Configuración');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SettingsForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    timezone: 'America/Mexico_City',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadTenant = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/settings');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar la configuración');
      }

      const data = result.data as Tenant;
      setTenant(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        timezone: data.timezone || 'America/Mexico_City',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const handleInputChange = (field: keyof SettingsForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/settings', {
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
          setError(result.error || 'Error al guardar la configuración');
        }
        return;
      }

      setTenant(result.data);
      setSuccess('Configuración actualizada exitosamente');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Error al guardar la configuración. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      active: 'Activo',
      trial: 'Prueba',
      suspended: 'Suspendido',
      inactive: 'Inactivo',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      base: 'Base',
      pro: 'Pro',
      enterprise: 'Enterprise',
    };
    return labels[plan] || plan;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Configuración</li>
              </ol>
            </nav>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Read-only info */}
          {tenant && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Tenant</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Public ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{tenant.public_id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1">{getStatusBadge(tenant.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plan de Suscripción</dt>
                    <dd className="mt-1 text-sm text-gray-900">{getPlanLabel(tenant.subscription_plan)}</dd>
                  </div>
                  {tenant.trial_ends_at && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Prueba termina</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(tenant.trial_ends_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Creado</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(tenant.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          )}

          {/* Editable form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Editables</h3>
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
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="email@ejemplo.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {TIMEZONE_OPTIONS.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Dirección completa del tenant"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                {saving && <LoadingSpinner size="sm" className="mr-2" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
