import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Define the shape of a promotion provisionally
type ApplicablePromotion = {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_to: string;
};

export function usePromotionsForClient(clientId: string, brandId: string, purchaseAmount?: number) {
  const [promotions, setPromotions] = useState<ApplicablePromotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromotions() {
      if (!clientId || !brandId) return;

      const supabase = createClient();

      const { data, error } = await supabase.rpc('get_applicable_promotions', {
        p_client_id: clientId,
        p_brand_id: brandId,
        p_purchase_amount: purchaseAmount
      });

      if (error) {
        console.error('Error fetching promotions:', error);
        return;
      }

      setPromotions(data || []);
      setLoading(false);
    }

    fetchPromotions();
  }, [clientId, brandId, purchaseAmount]);

  return { promotions, loading };
}
