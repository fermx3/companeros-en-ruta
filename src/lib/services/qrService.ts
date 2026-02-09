/**
 * QR Code Service
 * TASK-011: Service for QR code generation and management
 */

import { createClient } from '@/lib/supabase/client'

// Types
export interface QRCode {
  id: string
  code: string
  tenant_id: string
  client_id: string
  promotion_id: string | null
  brand_id: string | null
  qr_type: 'promotion' | 'loyalty' | 'discount'
  status: 'active' | 'fully_redeemed' | 'expired' | 'cancelled'
  max_redemptions: number
  redemption_count: number
  discount_type: 'percentage' | 'fixed_amount' | 'free_product' | 'points' | null
  discount_value: number | null
  discount_description: string | null
  valid_from: string
  valid_until: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string | null
}

export interface QRRedemption {
  id: string
  qr_code_id: string
  tenant_id: string
  redeemed_by: string
  distributor_id: string | null
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  discount_type: string | null
  discount_value: number | null
  latitude: number | null
  longitude: number | null
  metadata: Record<string, unknown>
  notes: string | null
  redeemed_at: string
  created_at: string
}

export interface CreateQRCodeParams {
  client_id: string
  promotion_id?: string
  brand_id?: string
  qr_type?: 'promotion' | 'loyalty' | 'discount'
  max_redemptions?: number
  discount_type?: 'percentage' | 'fixed_amount' | 'free_product' | 'points'
  discount_value?: number
  discount_description?: string
  valid_until?: string
  metadata?: Record<string, unknown>
}

export interface RedeemQRParams {
  qr_code: string
  user_profile_id: string
  distributor_id?: string
  latitude?: number
  longitude?: number
  notes?: string
}

export interface RedeemQRResult {
  success: boolean
  message: string
  redemption_id: string | null
  qr_data: {
    qr_id: string
    client_id: string
    promotion_id: string | null
    discount_type: string | null
    discount_value: number | null
    discount_description: string | null
    redemptions_remaining: number
  } | null
}

export class QRService {
  private supabase = createClient()

  /**
   * Generate a new QR code for a client
   */
  async createQRCode(params: CreateQRCodeParams): Promise<{ data: QRCode | null; error: string | null }> {
    try {
      // Get current user's tenant_id
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        return { data: null, error: 'User profile not found' }
      }

      const { data, error } = await this.supabase
        .from('qr_codes')
        .insert({
          tenant_id: profile.tenant_id,
          client_id: params.client_id,
          promotion_id: params.promotion_id || null,
          brand_id: params.brand_id || null,
          qr_type: params.qr_type || 'promotion',
          max_redemptions: params.max_redemptions || 1,
          discount_type: params.discount_type || null,
          discount_value: params.discount_value || null,
          discount_description: params.discount_description || null,
          valid_until: params.valid_until || null,
          metadata: params.metadata || {}
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating QR code:', error)
        return { data: null, error: error.message }
      }

      return { data: data as QRCode, error: null }
    } catch (error) {
      console.error('Error in createQRCode:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get QR code by code string
   */
  async getQRByCode(code: string): Promise<{ data: QRCode | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('qr_codes')
        .select(`
          *,
          client:clients(id, business_name, owner_name),
          promotion:promotions(id, name, description),
          brand:brands(id, name, logo_url)
        `)
        .eq('code', code)
        .is('deleted_at', null)
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data as QRCode, error: null }
    } catch (error) {
      console.error('Error in getQRByCode:', error)
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get all QR codes for a client
   */
  async getClientQRCodes(clientId: string): Promise<{ data: QRCode[]; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('qr_codes')
        .select(`
          *,
          promotion:promotions(id, name, description),
          brand:brands(id, name)
        `)
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: [], error: error.message }
      }

      return { data: data as QRCode[], error: null }
    } catch (error) {
      console.error('Error in getClientQRCodes:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Redeem a QR code (uses database function for atomicity)
   */
  async redeemQRCode(params: RedeemQRParams): Promise<RedeemQRResult> {
    try {
      const { data, error } = await this.supabase
        .rpc('redeem_qr_code', {
          p_qr_code: params.qr_code,
          p_user_profile_id: params.user_profile_id,
          p_distributor_id: params.distributor_id || null,
          p_latitude: params.latitude || null,
          p_longitude: params.longitude || null,
          p_notes: params.notes || null
        })

      if (error) {
        console.error('Error redeeming QR:', error)
        return {
          success: false,
          message: error.message,
          redemption_id: null,
          qr_data: null
        }
      }

      // The RPC returns an array with one row
      const result = data?.[0]

      if (!result) {
        return {
          success: false,
          message: 'No response from server',
          redemption_id: null,
          qr_data: null
        }
      }

      return {
        success: result.success,
        message: result.message,
        redemption_id: result.redemption_id,
        qr_data: result.qr_data
      }
    } catch (error) {
      console.error('Error in redeemQRCode:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        redemption_id: null,
        qr_data: null
      }
    }
  }

  /**
   * Get redemption history for a user (Asesor de Ventas)
   */
  async getMyRedemptions(limit = 50): Promise<{ data: QRRedemption[]; error: string | null }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        return { data: [], error: 'User not authenticated' }
      }

      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profile) {
        return { data: [], error: 'User profile not found' }
      }

      const { data, error } = await this.supabase
        .from('qr_redemptions')
        .select(`
          *,
          qr_code:qr_codes(
            id,
            code,
            discount_description,
            client:clients(id, business_name, owner_name)
          )
        `)
        .eq('redeemed_by', profile.id)
        .order('redeemed_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { data: [], error: error.message }
      }

      return { data: data as QRRedemption[], error: null }
    } catch (error) {
      console.error('Error in getMyRedemptions:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Cancel a QR code
   */
  async cancelQRCode(qrCodeId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('qr_codes')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', qrCodeId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      console.error('Error in cancelQRCode:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Singleton instance
export const qrService = new QRService()
