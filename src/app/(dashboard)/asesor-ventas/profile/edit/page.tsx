'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidMxPhone } from '@/lib/utils/phone';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/ui/toaster';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface AsesorProfile {
  id: string;
  public_id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  distributor_name: string | null;
  role: string;
  status: string;
}

export default function EditAsesorProfilePage() {
  usePageTitle('Editar Perfil');
  const router = useRouter();
  const [profile, setProfile] = useState<AsesorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  useUnsavedChanges(isDirty);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/asesor-ventas/profile');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al cargar perfil');
        }

        const profileData = await response.json();
        setProfile(profileData);
        setPhone(profileData.phone || '');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (!isValidMxPhone(phone)) {
      setPhoneError('El teléfono debe tener 10 dígitos');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/asesor-ventas/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar perfil');
      }

      toast({ variant: 'success', title: 'Teléfono actualizado correctamente' });
      setIsDirty(false);
      setTimeout(() => {
        router.push('/asesor-ventas');
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
            <Link href="/asesor-ventas">
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
      <div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/asesor-ventas" className="text-gray-400 hover:text-gray-500">
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
              Actualiza tu número de teléfono
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
                    <p className="mt-1 text-sm text-gray-900">{profile.email || 'No registrado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID de Asesor</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.public_id}</p>
                  </div>
                  {profile.distributor_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Distribuidor</label>
                      <p className="mt-1 text-sm text-gray-900">{profile.distributor_name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Solo teléfono es editable */}
            <div className="max-w-sm">
              <PhoneInput
                value={phone}
                onChange={(digits) => { setPhone(digits); setPhoneError(''); setIsDirty(true); }}
                label="Teléfono"
                id="phone"
                error={phoneError}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Link href="/asesor-ventas">
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
