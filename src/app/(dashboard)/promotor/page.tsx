'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { PageLoader, Alert } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { displayPhone } from '@/lib/utils/phone';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Star } from 'lucide-react';
import { IconClientes, IconCompletado, IconPendiente, IconVisitas, IconAgenda } from '@/components/icons';

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
  manager_id: string | null;
  performance_rating: number | null;
  total_clients: number;
  active_visits: number;
  completed_visits_month: number;
  created_at: string;
  updated_at: string;
}

interface PromotorStats {
  total_visits: number;
  pending_visits: number;
  completed_visits: number;
  visits_this_month: number;
  total_clients: number;
  new_clients_month: number;
  avg_visit_rating: number;
  performance_score: number;
}

export default function PromotorProfilePage() {
  usePageTitle('Dashboard Promotor');
  const [profile, setProfile] = useState<PromotorProfile | null>(null);
  const [stats, setStats] = useState<PromotorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPromotorProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const profileResponse = await fetch('/api/promotor/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Error al cargar perfil');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        const statsResponse = await fetch('/api/promotor/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

      } catch (err) {
        console.error('Error loading promotor profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar perfil del promotor: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadPromotorProfile();
  }, []);

  if (loading) {
    return <PageLoader message="Cargando perfil..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="error" title="Error">{error}</Alert>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="warning" title="Sin acceso">
            No tienes un perfil de promotor asignado.
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-navy truncate">
                {profile.full_name}
              </h1>
              <p className="text-muted-foreground text-sm">
                Promotor · {profile.public_id}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={profile.status as 'active' | 'inactive'} size="sm" />
                {profile.specialization && (
                  <span className="text-sm text-muted-foreground">· {profile.specialization}</span>
                )}
                {profile.performance_rating && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    · <Star className="h-3.5 w-3.5 text-warning fill-warning" /> {profile.performance_rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <Link href="/promotor/profile/edit">
              <Button variant="outline" size="sm" className="border-navy text-navy hover:bg-navy/5">
                Editar Perfil
              </Button>
            </Link>
          </div>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-navy">
                  <IconClientes className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Clientes Asignados</p>
                  <p className="text-2xl font-bold text-navy">{stats.total_clients}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-primary-light text-white border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <IconCompletado className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Visitas Completadas</p>
                  <p className="text-2xl font-bold">{stats.completed_visits}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-primary-light text-white border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <IconPendiente className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Visitas Pendientes</p>
                  <p className="text-2xl font-bold">{stats.pending_visits}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-navy">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating Promedio</p>
                  <p className="text-2xl font-bold text-navy">{stats.avg_visit_rating ? stats.avg_visit_rating.toFixed(1) : '0.0'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy mb-4">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1 text-sm text-navy">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Teléfono</label>
                    <p className="mt-1 text-sm text-navy">{displayPhone(profile.phone)}</p>
                  </div>
                )}
                {profile.territory_assigned && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Territorio Asignado</label>
                    <p className="mt-1 text-sm text-navy">{profile.territory_assigned}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Nivel de Experiencia</label>
                  <p className="mt-1 text-sm text-navy">{profile.experience_level}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-bold text-navy mb-4">
                Accesos Rápidos
              </h3>
              <div className="space-y-3">
                <Link href="/promotor/visitas" className="block">
                  <div className="p-3 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors">
                    <div className="flex items-center">
                      <IconVisitas className="w-5 h-5 text-primary mr-3" />
                      <span className="text-sm font-medium text-navy">Mis Visitas</span>
                    </div>
                  </div>
                </Link>
                <Link href="/promotor/clients" className="block">
                  <div className="p-3 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors">
                    <div className="flex items-center">
                      <IconClientes className="w-5 h-5 text-primary mr-3" />
                      <span className="text-sm font-medium text-navy">Mis Clientes</span>
                    </div>
                  </div>
                </Link>
                <Link href="/promotor/schedule" className="block">
                  <div className="p-3 border border-border rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors">
                    <div className="flex items-center">
                      <IconAgenda className="w-5 h-5 text-primary mr-3" />
                      <span className="text-sm font-medium text-navy">Mi Agenda</span>
                    </div>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
