'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form-legacy';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { adminService } from '@/lib/services/adminService';
import { brandCreateSchema, type BrandCreateForm } from '@/lib/types/admin';

/**
 * Formulario para crear una nueva brand
 */
export default function CreateBrandPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<BrandCreateForm>({
    name: '',
    slug: '',
    status: 'active',
    description: '',
    logo_url: '',
    brand_color_primary: '#3B82F6',
    brand_color_secondary: '#1E40AF',
    contact_email: '',
    contact_phone: '',
    website: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof BrandCreateForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = (): boolean => {
    try {
      brandCreateSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (err: any) {
      const errors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        errors[error.path[0]] = error.message;
      });
      setValidationErrors(errors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await adminService.createBrand(formData);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(response.message || 'Brand creada exitosamente');
        setTimeout(() => {
          router.push('/admin/brands');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating brand:', err);
      setError('Error al crear la brand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
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
                    <Link href="/admin/brands" className="ml-4 text-gray-400 hover:text-gray-500">
                      Brands
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">Nueva</span>
                  </div>
                </li>
              </ol>
            </nav>
            <div className="mt-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Nueva Brand
              </h1>
              <p className="text-gray-600 mt-1">
                Agrega una nueva marca al sistema
              </p>
            </div>
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

        <Card>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Nombre de la Brand"
                      placeholder="Ej: Mi Marca"
                      error={validationErrors.name}
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <Input
                    label="Slug"
                    placeholder="mi-marca"
                    helperText="Solo letras minúsculas, números y guiones. Se usará en URLs."
                    error={validationErrors.slug}
                    required
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                  />

                  <Select
                    label="Estado"
                    error={validationErrors.status}
                    required
                    options={[
                      { value: 'active', label: 'Activa' },
                      { value: 'inactive', label: 'Inactiva' }
                    ]}
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Descripción"
                      placeholder="Breve descripción de la brand"
                      error={validationErrors.description}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Email de contacto"
                    type="email"
                    placeholder="contacto@mibrand.com"
                    error={validationErrors.contact_email}
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  />

                  <Input
                    label="Teléfono de contacto"
                    placeholder="+52 55 1234 5678"
                    error={validationErrors.contact_phone}
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Sitio web"
                      type="url"
                      placeholder="https://www.mibrand.com"
                      error={validationErrors.website}
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Imagen de Marca
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="URL del logo"
                    type="url"
                    placeholder="https://ejemplo.com/logo.png"
                    helperText="URL pública donde se encuentra el logo de la brand"
                    error={validationErrors.logo_url}
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color primario
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          className="w-12 h-10 rounded border border-gray-300"
                          value={formData.brand_color_primary}
                          onChange={(e) => handleInputChange('brand_color_primary', e.target.value)}
                        />
                        <Input
                          placeholder="#3B82F6"
                          className="flex-1"
                          value={formData.brand_color_primary}
                          onChange={(e) => handleInputChange('brand_color_primary', e.target.value)}
                        />
                      </div>
                      {validationErrors.brand_color_primary && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.brand_color_primary}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color secundario
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          className="w-12 h-10 rounded border border-gray-300"
                          value={formData.brand_color_secondary}
                          onChange={(e) => handleInputChange('brand_color_secondary', e.target.value)}
                        />
                        <Input
                          placeholder="#1E40AF"
                          className="flex-1"
                          value={formData.brand_color_secondary}
                          onChange={(e) => handleInputChange('brand_color_secondary', e.target.value)}
                        />
                      </div>
                      {validationErrors.brand_color_secondary && (
                        <p className="mt-1 text-sm text-red-600">
                          {validationErrors.brand_color_secondary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                {(formData.brand_color_primary || formData.brand_color_secondary) && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Vista previa de colores:</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: formData.brand_color_primary || '#3B82F6' }}
                        />
                        <span className="text-sm text-gray-600">Primario</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: formData.brand_color_secondary || '#1E40AF' }}
                        />
                        <span className="text-sm text-gray-600">Secundario</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Link href="/admin/brands">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creando Brand...
                    </>
                  ) : (
                    'Crear Brand'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
