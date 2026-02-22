'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBrandFetch } from '@/hooks/useBrandFetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';
import { usePageTitle } from '@/hooks/usePageTitle';

interface MemberInfo {
  id: string;
  public_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Assignment {
  id: string;
  zone_id: string | null;
  specialization: string;
  experience_level: string;
  monthly_quota: number | null;
  performance_rating: number | null;
}

interface Zone {
  id: string;
  name: string;
  code: string;
}

interface FormData {
  zone_id: string;
  specialization: string;
  experience_level: string;
  monthly_quota: string;
}

const SPECIALIZATION_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'retail', label: 'Retail' },
  { value: 'wholesale', label: 'Mayoreo' },
  { value: 'pharma', label: 'Farmacéutico' },
  { value: 'food_service', label: 'Servicio de Alimentos' },
  { value: 'convenience', label: 'Conveniencia' },
  { value: 'supermarket', label: 'Supermercado' },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'trainee', label: 'En entrenamiento' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
  { value: 'expert', label: 'Experto' },
  { value: 'team_lead', label: 'Líder de equipo' },
];

export default function BrandTeamMemberEditPage() {
  usePageTitle('Editar Miembro');
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;
  const { brandFetch, currentBrandId } = useBrandFetch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [member, setMember] = useState<MemberInfo | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isPromotor, setIsPromotor] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    zone_id: '',
    specialization: 'general',
    experience_level: 'junior',
    monthly_quota: '0',
  });

  useEffect(() => {
    if (!currentBrandId) return;

    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // First fetch team list to resolve the member (URL may use public_id instead of UUID)
        const teamRes = await brandFetch('/api/brand/team?limit=100', { signal: controller.signal });
        if (!teamRes.ok) throw new Error('Error al cargar datos del equipo');
        const teamData = await teamRes.json();
        const foundMember = (teamData.team || []).find(
          (m: MemberInfo) => m.id === memberId || m.public_id === memberId
        );
        if (!foundMember) throw new Error('Miembro no encontrado en el equipo');
        setMember(foundMember);
        setIsPromotor(foundMember.role === 'promotor');

        // Now fetch assignment and zones in parallel using the resolved UUID
        const [assignmentRes, zonesRes] = await Promise.all([
          brandFetch(`/api/brand/team/${foundMember.id}/assignment`, { signal: controller.signal }),
          brandFetch('/api/brand/zones', { signal: controller.signal }),
        ]);

        // Process zones
        if (zonesRes.ok) {
          const zonesData = await zonesRes.json();
          setZones(zonesData.zones || []);
        }

        // Process assignment (may be 404 if not a promotor or no assignment yet)
        if (assignmentRes.ok) {
          const assignmentData = await assignmentRes.json();
          const a: Assignment | null = assignmentData.assignment;
          if (a) {
            setFormData({
              zone_id: a.zone_id || '',
              specialization: a.specialization || 'general',
              experience_level: a.experience_level || 'junior',
              monthly_quota: String(a.monthly_quota ?? 0),
            });
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        setError(msg);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [memberId, brandFetch, currentBrandId]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await brandFetch(`/api/brand/team/${member!.id}/assignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_id: formData.zone_id || null,
          specialization: formData.specialization,
          experience_level: formData.experience_level,
          monthly_quota: parseInt(formData.monthly_quota) || 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar asignación');
      }

      setSuccess('Asignación actualizada exitosamente');
      setTimeout(() => {
        router.push('/brand/team');
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      supervisor: 'Supervisor',
      promotor: 'Promotor',
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      supervisor: 'bg-blue-100 text-blue-800',
      promotor: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del miembro...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Miembro no encontrado</p>
          <Link href="/brand/team">
            <Button variant="outline">Volver al Equipo</Button>
          </Link>
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
                      <Link href="/brand/team" className="ml-4 text-gray-400 hover:text-gray-500">Equipo</Link>
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
              <div className="flex items-center space-x-3 mt-2">
                <h1 className="text-2xl font-bold text-gray-900">{member.full_name}</h1>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              </div>
            </div>
            <Link href="/brand/team">
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

        {/* Read-only member info */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Miembro</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{member.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{member.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">ID Público</label>
                <p className="mt-1 text-sm text-gray-900">{member.public_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Rol</label>
                <p className="mt-1 text-sm text-gray-900">{getRoleLabel(member.role)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Assignment form (only for promotors) */}
        {isPromotor ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Asignación de Promotor</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="zone_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Zona
                    </label>
                    <select
                      id="zone_id"
                      value={formData.zone_id}
                      onChange={(e) => handleChange('zone_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sin zona asignada</option>
                      {zones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                      Especialización *
                    </label>
                    <select
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SPECIALIZATION_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel de Experiencia *
                    </label>
                    <select
                      id="experience_level"
                      value={formData.experience_level}
                      onChange={(e) => handleChange('experience_level', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {EXPERIENCE_LEVEL_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="monthly_quota" className="block text-sm font-medium text-gray-700 mb-1">
                      Cuota Mensual de Visitas
                    </label>
                    <input
                      type="number"
                      id="monthly_quota"
                      min="0"
                      value={formData.monthly_quota}
                      onChange={(e) => handleChange('monthly_quota', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Número de visitas que el promotor debe completar por mes.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end space-x-3">
              <Link href="/brand/team">
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
        ) : (
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-600">
                La edición de asignaciones solo está disponible para promotores.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Este miembro tiene el rol de <strong>{getRoleLabel(member.role)}</strong>.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
