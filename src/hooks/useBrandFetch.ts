'use client';

import { useCallback } from 'react';
import { useTenant } from '@/components/providers/TenantProvider';

/**
 * Hook that wraps fetch() to automatically append `brand_id` query param
 * from the current TenantProvider context.
 *
 * Usage:
 * ```ts
 * const { brandFetch, currentBrandId } = useBrandFetch();
 *
 * const res = await brandFetch('/api/brand/metrics');
 * // => GET /api/brand/metrics?brand_id=<currentBrandId>
 *
 * const res = await brandFetch('/api/brand/clients?page=2');
 * // => GET /api/brand/clients?page=2&brand_id=<currentBrandId>
 * ```
 */
export function useBrandFetch() {
  const { currentBrand } = useTenant();
  const currentBrandId = currentBrand?.id ?? null;

  const brandFetch = useCallback(
    (url: string, init?: RequestInit): Promise<Response> => {
      if (!currentBrandId || url.includes('brand_id=')) {
        return fetch(url, init);
      }

      const separator = url.includes('?') ? '&' : '?';
      const urlWithBrand = `${url}${separator}brand_id=${currentBrandId}`;
      return fetch(urlWithBrand, init);
    },
    [currentBrandId]
  );

  return { brandFetch, currentBrandId };
}
