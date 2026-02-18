'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { PhoneInput } from '@/components/ui/phone-input';
import { adminService } from '@/lib/services/adminService';
import type { Brand, BrandCreateForm } from '@/lib/types/admin';

// ===========================================
// Types & Interfaces
// ===========================================

interface BrandEditPageProps {
  params: Promise<{ id: string }>
}

interface FormState {
  name: string
  description: string
  logo_url: string
  brand_color_primary: string
  brand_color_secondary: string
  contact_email: string
  contact_phone: string
  website: string
  status: 'active' | 'inactive'
}

// ===========================================
// Main Component
// ===========================================

/**
 * Página de edición de marca específica
 * Permite modificar todos los campos editables de una marca
 */
export default function BrandEditPage({ params }: BrandEditPageProps) {
  // Desenvolver params Promise para Next.js 16
  const resolvedParams = React.use(params)
  const { id: brandId } = resolvedParams

  // ===========================================
  // State Management
  // ===========================================

  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    logo_url: '',
    brand_color_primary: '#3B82F6',
    brand_color_secondary: '#1E40AF',
    contact_email: '',
    contact_phone: '',
    website: '',
    status: 'active'
  })

  // ===========================================
  // Effects
  // ===========================================

  useEffect(() => {
    const loadBrand = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await adminService.getBrandById(brandId)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setBrand(response.data)

          // Populate form with existing data
          setFormData({
            name: response.data.name || '',
            description: response.data.description || '',
            logo_url: response.data.logo_url || '',
            brand_color_primary: response.data.brand_color_primary || '#3B82F6',
            brand_color_secondary: response.data.brand_color_secondary || '#1E40AF',
            contact_email: response.data.contact_email || '',
            contact_phone: response.data.contact_phone || '',
            website: response.data.website || '',
            status: response.data.status || 'active'
          })
        }

      } catch (err) {
        console.error('Error loading brand:', err)
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(`Error al cargar marca: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    if (brandId) {
      loadBrand()
    }
  }, [brandId])

  // ===========================================
  // Event Handlers
  // ===========================================

  /**
   * Manejar cambios en inputs del formulario
   */
  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null)
    }
  }

  /**
   * Validar formulario antes del envío
   */
  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'El nombre de la marca es requerido'
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      return 'El email de contacto no es válido'
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      return 'La URL del sitio web debe comenzar con http:// o https://'
    }

    return null
  }

  /**
   * Enviar formulario de actualización
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updateData: Partial<BrandCreateForm> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        logo_url: formData.logo_url.trim() || undefined,
        brand_color_primary: formData.brand_color_primary,
        brand_color_secondary: formData.brand_color_secondary,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        status: formData.status
      }

      const response = await adminService.updateBrand(brandId, updateData)

      if (response.error) {
        throw new Error(response.error)
      }

      setSuccessMessage('Marca actualizada exitosamente')

      // Update local brand state
      if (response.data) {
        setBrand(response.data)
      }

    } catch (err) {
      console.error('Error updating brand:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al actualizar marca: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // ===========================================
  // Render States
  // ===========================================

  // Estado de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600">Cargando información de la marca...</p>
      </div>
    )
  }

  // Marca no encontrada
  if (!brand) {
    return (
      <div className="text-center py-12">
        <Alert variant="error" className="max-w-md mx-auto">
          Marca no encontrada
        </Alert>
        <div className="mt-6">
          <Link href="/admin/brands">
            <Button variant="outline">Volver a Marcas</Button>
          </Link>
        </div>
      </div>
    )
  }

  // ===========================================
  // Main Render
  // ===========================================

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Marca
            </h1>
            <p className="mt-2 text-gray-600">
              Modifica la información de la marca {brand.name}
            </p>
          </div>
          <Link href="/admin/brands">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6">
          {successMessage}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>
              Datos principales de la marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Marca *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Coca-Cola"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Breve descripción de la marca..."
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Identidad Visual</CardTitle>
            <CardDescription>
              Configuración de colores y logo de la marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo URL */}
            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                URL del Logo
              </label>
              <input
                type="url"
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Color Primario */}
              <div>
                <label htmlFor="brand_color_primary" className="block text-sm font-medium text-gray-700 mb-1">
                  Color Primario
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="brand_color_primary"
                    value={formData.brand_color_primary}
                    onChange={(e) => handleInputChange('brand_color_primary', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_color_primary}
                    onChange={(e) => handleInputChange('brand_color_primary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Color Secundario */}
              <div>
                <label htmlFor="brand_color_secondary" className="block text-sm font-medium text-gray-700 mb-1">
                  Color Secundario
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="brand_color_secondary"
                    value={formData.brand_color_secondary}
                    onChange={(e) => handleInputChange('brand_color_secondary', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.brand_color_secondary}
                    onChange={(e) => handleInputChange('brand_color_secondary', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Datos de contacto de la marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email de Contacto
              </label>
              <input
                type="email"
                id="contact_email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contacto@marca.com"
              />
            </div>

            {/* Teléfono */}
            <PhoneInput
              value={formData.contact_phone}
              onChange={(digits) => handleInputChange('contact_phone', digits)}
              label="Teléfono de Contacto"
              id="contact_phone"
            />

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Sitio Web
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.marca.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <Link href="/admin/brands">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
