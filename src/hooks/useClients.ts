import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Client } from '../lib/types/database';

export function useClients(brandId?: string) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchClients() {
    const supabase = createClient();

    let query = supabase
      .from('client_brand_profiles')
      .select(`
        id,
        client_id,
        brand_id,
        loyalty_points,
        loyalty_tier,
        clients (
          id,
          business_name,
          owner_name,
          phone,
          address,
          zones (name),
          client_types (name)
        )
      `)
      .eq('is_active', true);

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      return;
    }

    // Map the fetched data to the Client[] shape
    setClients(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data || []).map((item: any) => {
        const client = Array.isArray(item.clients) ? item.clients[0] : item.clients;
        return {
          id: client?.id,
          tenant_id: client?.tenant_id,
          code: client?.code,
          business_name: client?.business_name,
          owner_name: client?.owner_name,
          phone: client?.phone,
          address: client?.address,
          is_active: item.is_active,
          loyalty_points: item.loyalty_points,
          loyalty_tier: item.loyalty_tier,
          brand_id: item.brand_id,
          zones: client?.zones || [],
          client_types: client?.client_types || [],
        } as unknown as Client;
      })
    );
    setLoading(false);
  }

  useEffect(() => {
    const fetch = async () => {
      await fetchClients();
    };
    fetch();
  }, [brandId]);

  return { clients, loading, refetch: fetchClients };
}
