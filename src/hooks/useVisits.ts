import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Visit } from '../lib/types/visits';

export function useVisits(filters?: { clientId?: string; dateFrom?: string; dateTo?: string }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVisits() {
      const supabase = createClient();

      let query = supabase
        .from('visits')
        .select(`
          id,
          visit_number,
          visit_date,
          status,
          clients (business_name),
          brands (name)
        `)
        .order('visit_date', { ascending: false });

      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters?.dateFrom) {
        query = query.gte('visit_date', filters.dateFrom);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching visits:', error);
        return;
      }

        setVisits(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data || []).map((item: any) => ({
          id: item.id,
          visit_number: item.visit_number,
          visit_date: item.visit_date,
          status: item.status,
          tenant_id: item.tenant_id,
          client_id: item.client_id,
          brand_id: item.brand_id,
          asesor_id: item.asesor_id,
          clients: item.clients,
          brands: item.brands,
          created_at: item.created_at ?? '',
          updated_at: item.updated_at ?? ''
        }) as Visit)
      );
      setLoading(false);
    }

    fetchVisits();
  }, [filters]);

  return { visits, loading };
}
