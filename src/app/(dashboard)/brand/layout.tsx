'use client';

import React from 'react';
import { useRequireRole } from '@/hooks/useRequireRole';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SideNavigation } from '@/components/layout/SideNavigation';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { brandNavConfig } from '@/lib/navigation-config';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { BrandSwitcher } from '@/components/brand/BrandSwitcher';

interface BrandLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout para el panel de Marca
 * Maneja la verificación de rol de forma centralizada
 *
 * Note: Role protection is handled by useRequireRole hook which redirects
 * unauthorized users to /unauthorized
 */
export default function BrandLayout({ children }: BrandLayoutProps) {
  // Note: allowMultipleRoles removed because /api/brand/* endpoints
  // require the actual 'brand_manager' role, not just admin access
  const { hasAccess, loading: roleLoading, error, retry } = useRequireRole('brand_manager');

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
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error de autenticacion</h2>
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
    <TenantProvider>
      <div className="min-h-screen bg-gray-50">
        <SideNavigation items={brandNavConfig.items} title={brandNavConfig.title} />
        <div className="lg:pl-64">
          <DashboardHeader title={brandNavConfig.title} headerExtra={<BrandSwitcher />} />
          <main className="pb-20 lg:pb-0">{children}</main>
        </div>
        <BottomNavigation items={brandNavConfig.items} />
      </div>
    </TenantProvider>
  );
}
