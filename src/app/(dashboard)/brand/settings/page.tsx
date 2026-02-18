'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { ImageUpload } from '@/components/ui/image-upload';
import { PhoneInput } from '@/components/ui/phone-input';
import type { Brand } from '@/lib/types/admin';

/**
 * Página de configuración de marca
 * Permite a los brand managers editar la información de su marca
 */
export default function BrandSettingsPage() {
  const { brandFetch, currentBrandId } = useBrandFetch();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    logo_url: '',
    brand_color_primary: '#3B82F6',
    brand_color_secondary: '#10B981'
  });

  useEffect(() => {
    const loadBrandData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obtener datos reales de la marca
        const response = await brandFetch('/api/brand/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar datos de la marca');
        }

        const data = await response.json();
        const brandData = data.brand;

        setBrand(brandData);
        setFormData({
          name: brandData.name || '',
          description: brandData.description || '',
          contact_email: brandData.contact_email || '',
          contact_phone: brandData.contact_phone || '',
          website: brandData.website || '',
          logo_url: brandData.logo_url || '',
          brand_color_primary: brandData.brand_color_primary || '#3B82F6',
          brand_color_secondary: brandData.brand_color_secondary || '#10B981'
        });

      } catch (err) {
        console.error('Error loading brand data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar datos de la marca: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadBrandData();
  }, [brandFetch, currentBrandId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = useCallback(async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('file', file);

    const response = await brandFetch('/api/brand/logo', { method: 'POST', body });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al subir logo');
    }

    const data = await response.json();
    setFormData(prev => ({ ...prev, logo_url: data.logo_url }));
    return data.logo_url;
  }, [brandFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Actualizar marca con datos reales
      const response = await brandFetch('/api/brand/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar marca');
      }

      const data = await response.json();
      setBrand(data.brand);
      setSuccessMessage('Configuración guardada correctamente');

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving brand settings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al guardar configuración: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/brand" className="text-gray-400 hover:text-gray-500">
                      Marca
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Configuración</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Configuración de Marca
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona la información y configuración de tu marca
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Información General
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la marca
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <PhoneInput
                  value={formData.contact_phone}
                  onChange={(digits) => handleInputChange('contact_phone', digits)}
                  label="Teléfono de contacto"
                  id="contact_phone"
                />

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de tu marca..."
                />
              </div>
            </div>
          </Card>

          {/* Identidad Visual */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Identidad Visual
              </h3>

              {/* Logo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo de la marca
                </label>
                <ImageUpload
                  currentImageUrl={formData.logo_url || undefined}
                  onUpload={handleLogoUpload}
                  maxSizeMB={2}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Sube una imagen PNG, JPG, SVG o WebP (max 2MB). El logo se guarda inmediatamente al seleccionarlo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand_color_primary" className="block text-sm font-medium text-gray-700 mb-2">
                    Color primario
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="brand_color_primary"
                      value={formData.brand_color_primary}
                      onChange={(e) => handleInputChange('brand_color_primary', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.brand_color_primary}
                      onChange={(e) => handleInputChange('brand_color_primary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="brand_color_secondary" className="block text-sm font-medium text-gray-700 mb-2">
                    Color secundario
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="brand_color_secondary"
                      value={formData.brand_color_secondary}
                      onChange={(e) => handleInputChange('brand_color_secondary', e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.brand_color_secondary}
                      onChange={(e) => handleInputChange('brand_color_secondary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    />
                  </div>
                </div>
              </div>

              {/* Vista previa de colores */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vista previa
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: formData.brand_color_primary }}
                    />
                    <span className="text-sm text-gray-600">Primario</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                      style={{ backgroundColor: formData.brand_color_secondary }}
                    />
                    <span className="text-sm text-gray-600">Secundario</span>
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-8 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{
                        background: `linear-gradient(45deg, ${formData.brand_color_primary}, ${formData.brand_color_secondary})`
                      }}
                    >
                      {formData.name || 'Mi Marca'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Información del Sistema */}
          {brand && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  Información del Sistema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <label className="block text-gray-500 mb-1">ID Público</label>
                    <span className="font-mono text-gray-900">{brand.public_id}</span>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Slug</label>
                    <span className="font-mono text-gray-900">{brand.slug}</span>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      brand.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {brand.status === 'active' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Fecha de creación</label>
                    <span className="text-gray-900">
                      {new Date(brand.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Link href="/brand">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving && <LoadingSpinner size="sm" className="mr-2" />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
