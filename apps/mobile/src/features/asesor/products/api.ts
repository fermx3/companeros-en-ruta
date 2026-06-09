import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api'

export interface AsesorProduct {
  id: string
  public_id: string
  name: string
  sku: string
  barcode: string | null
  description: string | null
  base_price: number
  unit_type: string
  is_active: boolean
  product_image_url: string | null
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
}

interface ProductsResponse {
  products: AsesorProduct[]
  total: number
}

export function useAsesorProducts(clientId?: string) {
  return useQuery<ProductsResponse>({
    queryKey: ['asesor', 'products', clientId],
    queryFn: () => {
      const qs = clientId ? `?client_id=${clientId}` : ''
      return apiFetch<ProductsResponse>(`/api/asesor-ventas/products${qs}`)
    },
  })
}
