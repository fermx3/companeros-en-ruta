'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Brand } from '@/lib/types';

interface TenantContextType {
  tenantId: string | null;
  currentBrand: Brand | null;
  availableBrands: Brand[];
  switchBrand: (brandId: string) => void;
}

export const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  currentBrand: null,
  availableBrands: [],
  switchBrand: () => {},
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
 *   const { tenantId, currentBrand } = useTenant();
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
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);

  useEffect(() => {
    async function loadTenantData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Obtener tenant_id del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (userData) {
        setTenantId(userData.tenant_id);

        // Obtener marcas disponibles
        const { data: brands } = await supabase
          .from('brands')
          .select('*')
          .eq('tenant_id', userData.tenant_id);

        setAvailableBrands(brands || []);
        if (brands && brands.length > 0) {
          setCurrentBrand(brands[0]);
        }
      }
    }

    loadTenantData();
  }, []);

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
      switchBrand
    }}>
      {children}
    </TenantContext.Provider>
  );
}
