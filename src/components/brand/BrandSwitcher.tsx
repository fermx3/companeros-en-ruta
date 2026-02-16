'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { useTenant } from '@/components/providers/TenantProvider';

export function BrandSwitcher() {
  const { currentBrand, availableBrands, switchBrand } = useTenant();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Don't render if user has 0 or 1 brand
  if (availableBrands.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm"
      >
        {currentBrand?.logo_url ? (
          <img
            src={currentBrand.logo_url}
            alt={currentBrand.name}
            className="h-5 w-5 object-contain rounded"
          />
        ) : (
          <Building2 className="h-4 w-4 text-gray-500" />
        )}
        <span className="font-medium text-gray-700 max-w-[120px] truncate">
          {currentBrand?.name || 'Marca'}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cambiar marca
          </div>
          {availableBrands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => {
                switchBrand(brand.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                brand.id === currentBrand?.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="h-5 w-5 object-contain rounded"
                />
              ) : (
                <Building2 className="h-4 w-4 text-gray-400" />
              )}
              <span className="truncate flex-1 text-left">{brand.name}</span>
              {brand.id === currentBrand?.id && (
                <Check className="h-4 w-4 text-blue-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
