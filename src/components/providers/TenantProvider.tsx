'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthProvider';
import type { Brand } from '@/lib/types';

interface TenantContextType {
  tenantId: string | null;
  currentBrand: Brand | null;
  availableBrands: Brand[];
  loading: boolean;
  switchBrand: (brandId: string) => void;
}

export const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  currentBrand: null,
  availableBrands: [],
  loading: true,
  switchBrand: () => { },
});

/**
 * Hook to access tenant context
 *
 * Provides access to tenant_id and brand information.
 * Must be used within a TenantProvider.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tenantId, currentBrand, loading } = useTenant();
 *   if (loading) return <Loading />;
 *   // Use tenantId in queries...
 * }
 * ```
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, initialized } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenantData() {
      // Wait for AuthProvider to initialize
      if (!initialized) return;

      // If no user, clear tenant data
      if (!user) {
        setTenantId(null);
        setCurrentBrand(null);
        setAvailableBrands([]);
        setLoading(false);
        return;
      }

      // Use tenant_id from AuthProvider's userProfile if available
      // This avoids an extra query since AuthProvider already loaded the profile
      const profileTenantId = (userProfile as { tenant_id?: string })?.tenant_id;

      if (profileTenantId) {
        setTenantId(profileTenantId);

        // Load available brands for this tenant
        const supabase = createClient();
        const { data: brands } = await supabase
          .from('brands')
          .select('*')
          .eq('tenant_id', profileTenantId);

        setAvailableBrands(brands || []);
        if (brands && brands.length > 0) {
          setCurrentBrand(brands[0]);
        }
        setLoading(false);
        return;
      }

      // Fallback: query user_profiles directly if userProfile is not available
      // This shouldn't normally happen since AuthProvider loads it first
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.tenant_id) {
        setTenantId(profile.tenant_id);

        // Load available brands for this tenant
        const { data: brands } = await supabase
          .from('brands')
          .select('*')
          .eq('tenant_id', profile.tenant_id);

        setAvailableBrands(brands || []);
        if (brands && brands.length > 0) {
          setCurrentBrand(brands[0]);
        }
      }

      setLoading(false);
    }

    loadTenantData();
  }, [user, userProfile, initialized]);

  const switchBrand = (brandId: string) => {
    const brand = availableBrands.find(b => b.id === brandId);
    if (brand) {
      setCurrentBrand(brand);
    }
  };

  return (
    <TenantContext.Provider value={{
      tenantId,
      currentBrand,
      availableBrands,
      loading,
      switchBrand
    }}>
      {children}
    </TenantContext.Provider>
  );
}
