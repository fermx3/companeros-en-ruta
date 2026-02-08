'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';

interface PromotorProfile {
  id: string;
  public_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  territory_assigned: string | null;
  specialization: string | null;
  experience_level: string;
  status: string;
}

/**
 * Página de edición del perfil del promotor
 */
export default function EditPromotorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PromotorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: '',
    territory_assigned: '',
    specialization: '',
    experience_level: 'junior'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const experienceLevels = [
    { value: 'junior', label: 'Junior (0-2 años)' },
    { value: 'mid', label: 'Intermedio (2-5 años)' },
    { value: 'senior', label: 'Senior (5+ años)' },
    { value: 'expert', label: 'Experto (10+ años)' }
  ];

  const specializations = [
    { value: '', label: 'Sin especialización' },
    { value: 'retail', label: 'Retail' },
    { value: 'horeca', label: 'HORECA (Hotel/Restaurante/Café)' },
    { value: 'wholesale', label: 'Mayoreo' },
    { value: 'corporate', label: 'Corporativo' },
    { value: 'institutional', label: 'Institucional' }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/promotor/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar perfil');
        }

        const data = await response.json();
        const profileData = data.profile;

        setProfile(profileData);
        setFormData({
          phone: profileData.phone || '',
          territory_assigned: profileData.territory_assigned || '',
          specialization: profileData.specialization || '',
          experience_level: profileData.experience_level || 'junior'
        });

      } catch (err) {
        console.error('Error loading profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar perfil: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error de validación cuando el usuario corrija el campo
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone.trim())) {
      errors.phone = 'Formato de teléfono inválido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/promotor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar perfil');
      }

      setSuccessMessage('Perfil actualizado correctamente');

      // Redireccionar al perfil después de 2 segundos
      setTimeout(() => {
        router.push('/promotor');
      }, 2000);

    } catch (err) {
      console.error('Error saving profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al guardar perfil: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="error" title="Error">{error}</Alert>
          <div className="mt-6 text-center">
            <Link href="/promotor">
              <Button variant="outline">Volver al Perfil</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/promotor" className="text-gray-400 hover:text-gray-500">
                    Mi Perfil
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-4 text-gray-900 font-medium">Editar Perfil</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Editar Mi Perfil
            </h1>
            <p className="text-gray-600 mt-1">
              Actualiza tu información personal y preferencias
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" title="Error" className="mb-6">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" title="Éxito" className="mb-6">
            {successMessage}
          </Alert>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información No Editable */}
            {profile && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Información de la Cuenta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID de Promotor</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.public_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Información Editable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teléfono */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>

              {/* Nivel de Experiencia */}
              <div>
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Experiencia <span className="text-red-500">*</span>
                </label>
                <select
                  id="experience_level"
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {experienceLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Territorio Asignado */}
              <div>
                <label htmlFor="territory_assigned" className="block text-sm font-medium text-gray-700 mb-2">
                  Territorio Asignado
                </label>
                <input
                  type="text"
                  id="territory_assigned"
                  value={formData.territory_assigned}
                  onChange={(e) => handleInputChange('territory_assigned', e.target.value)}
                  placeholder="Ej: Zona Norte CDMX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Especialización */}
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Especialización
                </label>
                <select
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {specializations.map(spec => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link href="/promotor">
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
        </Card>
      </div>
    </div>
  );
}
