'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/useRequireRole';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { clientNavConfig } from '@/lib/navigation-config';

interface ClientLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout para las rutas del cliente
 * Maneja la verificación de rol de forma centralizada
 */
export default function ClientLayout({ children }: ClientLayoutProps) {
  const { hasAccess, loading: roleLoading, error, retry } = useRequireRole('client');
  const { user } = useAuth();
  const [ownerName, setOwnerName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from('clients')
      .select('owner_name')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()
      .then(({ data }) => {
        if (data?.owner_name) setOwnerName(data.owner_name);
      });
  }, [user]);

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (error && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error de autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SideNavigation items={clientNavConfig.items} title={clientNavConfig.title} displayName={ownerName ?? undefined} profileHref="/client/profile" />
      <div className="lg:pl-64">
        <DashboardHeader title={clientNavConfig.title} displayName={ownerName ?? undefined} profileHref="/client/profile" />
        <main className="pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNavigation items={clientNavConfig.items.slice(0, 5)} />
    </div>
  );
}
