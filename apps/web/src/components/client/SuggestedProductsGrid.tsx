'use client'

import { Package } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

interface ProductBrand {
  id: string
  name: string
  logo_url: string | null
}

interface ProductCategory {
  id: string
  name: string
}

interface Product {
  id: string
  public_id: string
  name: string
  base_price: number
  product_image_url: string | null
  brand: ProductBrand
  category: ProductCategory | null
}

interface SuggestedProductsGridProps {
  products: Product[]
}

export function SuggestedProductsGrid({ products }: SuggestedProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Productos Destacados</h2>
        <div className="rounded-2xl bg-gray-50 p-8 text-center shadow-sm">
          <Package className="mx-auto h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-900">No hay productos destacados</p>
          <p className="text-sm text-gray-500 mt-1">
            Los productos destacados de tus marcas apareceran aqui.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Productos Destacados</h2>

      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-x-visible">
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[160px] snap-start rounded-2xl bg-white p-3 shadow-sm flex flex-col gap-2"
          >
            {/* Product image */}
            <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {product.product_image_url ? (
                <img
                  src={product.product_image_url}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <Package className="h-10 w-10 text-gray-300" />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Avatar
                  src={product.brand?.logo_url}
                  alt={product.brand?.name || ''}
                  size="sm"
                />
                <span className="text-xs text-gray-500 truncate">{product.brand?.name}</span>
              </div>
            </div>

            {/* Price */}
            <p className="text-base font-bold text-gray-900">
              ${Number(product.base_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
