import { Brand, Client, User } from './database';

// VISITS ENDPOINTS
export interface CreateVisitRequest {
  client_id: string;
  brand_id: string;
  visit_date?: string; // ISO date, defaults to today
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateVisitResponse {
  visit_id: string;
  status: 'success' | 'error';
  message?: string;
}

// ASSESSMENT ENDPOINTS
export interface UpdateAssessmentRequest {
  visit_id: string;
  products: Array<{
    product_id?: string;
    product_name: string;
    presentation: string;
    current_price: number;
    has_discount?: boolean;
    discount_percentage?: number;
    competitor_price?: number;
    competitor_brand?: string;
    package_condition: 'excellent' | 'good' | 'fair' | 'poor';
    display_quality: 'excellent' | 'good' | 'fair' | 'poor';
    stock_level: 'full' | 'medium' | 'low' | 'out_of_stock';
    comments?: string;
    photo_urls?: string[];
  }>;
}

export interface UpdateAssessmentResponse {
  status: 'success' | 'error';
  message?: string;
  assessments_created: number;
}

// PURCHASE ENDPOINTS
export interface CreatePurchaseRequest {
  visit_id: string;
  items: Array<{
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount_amount?: number;
  }>;
  payment_method: 'cash' | 'credit' | 'transfer';
  invoice_number?: string;
  invoice_photo_url?: string;
  apply_promotions?: boolean;
}

export interface CreatePurchaseResponse {
  purchase_ids: string[];
  applied_promotions: Array<{
    promotion_id: string;
    discount_amount: number;
    points_earned: number;
  }>;
  total_amount: number;
  final_amount: number;
  status: 'success' | 'error';
}

// TIPOS DE DATOS (Database entities)
export interface Visit {
  id: string;
  tenant_id: string;
  client_id: string;
  brand_id: string;
  promotor_id: string;
  visit_number: string;
  visit_date: string;
  start_time?: string;
  end_time?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  latitude?: number;
  longitude?: number;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Relations
  client?: Client;
  brand?: Brand;
  promotor?: User;
}

export interface VisitAssessment {
  id: string;
  tenant_id: string;
  visit_id: string;
  product_id?: string;
  product_name: string;
  presentation: string;
  current_price: number;
  has_discount: boolean;
  discount_percentage?: number;
  competitor_price?: number;
  competitor_brand?: string;
  package_condition: 'excellent' | 'good' | 'fair' | 'poor';
  display_quality: 'excellent' | 'good' | 'fair' | 'poor';
  stock_level: 'full' | 'medium' | 'low' | 'out_of_stock';
  comments?: string;
  photo_urls?: string[];
  created_at: string;
  updated_at: string;
}
