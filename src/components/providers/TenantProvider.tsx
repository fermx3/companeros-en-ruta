'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthProvider';

const STORAGE_KEY = 'cer_current_brand_id';

interface TenantBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: string;
}

interface TenantContextType {
  tenantId: string | null;
  currentBrand: TenantBrand | null;
  availableBrands: TenantBrand[];
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
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, userRoles, userBrandRoles, initialized } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState<TenantBrand | null>(null);
  const [availableBrands, setAvailableBrands] = useState<TenantBrand[]>([]);
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

      const profileTenantId = (userProfile as { tenant_id?: string })?.tenant_id;
      if (!profileTenantId) {
        setLoading(false);
        return;
      }

      setTenantId(profileTenantId);

      const supabase = createClient();
      const brandSelect = 'id, name, slug, logo_url, status';

      // Determine which brands this user can access
      const isGlobalAdmin = userRoles.includes('admin');
      const userBrandIds = userBrandRoles
        .map(r => r.brandId)
        .filter((id, i, arr) => arr.indexOf(id) === i); // unique

      let brands: TenantBrand[] = [];

      if (isGlobalAdmin || userBrandIds.length === 0) {
        // Global admins see all tenant brands;
        // fallback if no brand-specific roles (shouldn't happen for brand_manager)
        const { data } = await supabase
          .from('brands')
          .select(brandSelect)
          .eq('tenant_id', profileTenantId)
          .eq('status', 'active')
          .order('name');

        brands = data || [];
      } else {
        // Filter brands to only those the user has roles for
        const { data } = await supabase
          .from('brands')
          .select(brandSelect)
          .in('id', userBrandIds)
          .eq('status', 'active')
          .order('name');

        brands = data || [];
      }

      setAvailableBrands(brands);

      if (brands.length > 0) {
        // Determine default brand: localStorage > is_primary > first
        const savedBrandId = typeof window !== 'undefined'
          ? localStorage.getItem(STORAGE_KEY)
          : null;

        const savedBrand = savedBrandId
          ? brands.find(b => b.id === savedBrandId)
          : null;

        if (savedBrand) {
          setCurrentBrand(savedBrand);
        } else {
          // Find the brand marked as primary in user roles
          const primaryRole = userBrandRoles.find(r => r.isPrimary);
          const primaryBrand = primaryRole
            ? brands.find(b => b.id === primaryRole.brandId)
            : null;

          setCurrentBrand(primaryBrand || brands[0]);
        }
      }

      setLoading(false);
    }

    loadTenantData();
  }, [user, userProfile, userRoles, userBrandRoles, initialized]);

  const switchBrand = useCallback((brandId: string) => {
    const brand = availableBrands.find(b => b.id === brandId);
    if (brand) {
      setCurrentBrand(brand);
      try {
        localStorage.setItem(STORAGE_KEY, brandId);
      } catch {
        // localStorage may not be available (SSR, private browsing)
      }
    }
  }, [availableBrands]);

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
