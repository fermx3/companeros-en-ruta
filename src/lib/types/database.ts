/**
 * =============================================================================
 * DATABASE TYPES - CRITICAL FIELD REFERENCE
 * =============================================================================
 *
 * IMPORTANT: These types reflect the ACTUAL database schema.
 * Always verify against local Supabase DB before making changes.
 *
 * COMMON MISTAKES TO AVOID:
 *
 * 1. user_profiles.user_id (NOT auth_user_id)
 *    - Links to auth.users.id
 *    - Query: .eq('user_id', user.id)
 *
 * 2. orders.order_status (NOT status)
 *    - Enum: order_status_enum
 *    - Query: .eq('order_status', 'pending')
 *
 * 3. visit_orders.order_status (NOT status)
 *    - Enum: visit_order_status_enum
 *    - Query: .eq('order_status', 'draft')
 *
 * 4. user_profiles has first_name + last_name (NOT full_name)
 *    - Use: `${first_name} ${last_name}` for display
 *
 * =============================================================================
 */

/**
 * user_profiles table
 * Links auth.users to application user data
 */
export interface UserProfile {
  id: string;
  user_id: string;              // FK to auth.users.id (NOT auth_user_id!)
  public_id: string;
  tenant_id: string;
  employee_code?: string;
  first_name: string;           // NOT full_name
  last_name: string;            // NOT full_name
  email: string;
  phone?: string;
  avatar_url?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  manager_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  distributor_id?: string;
  preferences?: Record<string, unknown>;
  last_login_at?: string;
  timezone: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * @deprecated Use UserProfile instead
 */
export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo_url?: string;
  primary_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  tenant_id: string;
  code: string;
  business_name: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  zone_id?: string;
  market_id?: string;
  commercial_structure_id?: string;
  client_type_id?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relations
  zone?: Zone;
  market?: Market;
  client_type?: ClientType;
  commercial_structure?: CommercialStructure;
}

export interface Zone {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  state?: string;
  country: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientType {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommercialStructure {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// VISIT TYPES
// =============================================================================

/**
 * Visit status enum values
 * Column: visits.visit_status (NOT status!)
 */
export type VisitStatusEnum =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * visits table
 */
export interface Visit {
  id: string;
  public_id: string;
  tenant_id: string;
  client_id: string;
  brand_id?: string;
  promotor_id: string;            // FK to user_profiles.id
  visit_status: VisitStatusEnum;  // NOT "status"!
  visit_date: string;
  scheduled_start_time?: string;
  scheduled_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  checkin_latitude?: number;
  checkin_longitude?: number;
  checkout_latitude?: number;
  checkout_longitude?: number;
  promotor_notes?: string;
  overall_rating?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// =============================================================================
// ORDER TYPES
// =============================================================================

/**
 * Order status enum values
 * Column: orders.order_status (NOT status!)
 */
export type OrderStatusEnum =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

/**
 * orders table - General orders
 */
export interface Order {
  id: string;
  public_id: string;
  tenant_id: string;
  client_id: string;
  brand_id?: string;
  order_number: string;
  order_type: 'standard' | 'express' | 'scheduled' | 'recurring';
  order_status: OrderStatusEnum;    // NOT "status"!
  order_date: string;
  requested_delivery_date?: string;
  confirmed_delivery_date?: string;
  actual_delivery_date?: string;
  delivery_time_slot?: string;
  delivery_address?: string;
  delivery_instructions?: string;
  commercial_structure_id: string;
  distributor_id?: string;
  payment_method: 'cash' | 'credit' | 'transfer' | 'card';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  payment_terms?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source_channel: 'client_portal' | 'sales_rep' | 'phone' | 'whatsapp' | 'api';
  invoice_required: boolean;
  assigned_to?: string;
  internal_notes?: string;
  client_notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * Visit order status enum values
 * Column: visit_orders.order_status (NOT status!)
 */
export type VisitOrderStatusEnum =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'delivered'
  | 'cancelled';

/**
 * visit_orders table - Orders created during visits
 */
export interface VisitOrder {
  id: string;
  public_id: string;
  tenant_id: string;
  visit_id: string;
  client_id: string;
  promotor_id: string;
  order_number?: string;
  order_type: 'immediate' | 'scheduled' | 'sample';
  order_status: VisitOrderStatusEnum;  // NOT "status"!
  order_date: string;
  delivery_date?: string;
  delivery_address?: string;
  payment_method: 'cash' | 'credit' | 'transfer' | 'card';
  payment_terms?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  exchange_rate: number;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  invoice_required: boolean;
  delivery_instructions?: string;
  order_notes?: string;
  external_order_id?: string;
  commission_rate?: number;
  commission_amount?: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// =============================================================================
// VISIT ASSESSMENT TYPES
// =============================================================================

/**
 * visit_stage_assessments table
 */
export interface VisitStageAssessment {
  id: string;
  visit_id: string;
  tenant_id: string;

  // Stage completion timestamps
  stage1_completed_at?: string;
  stage2_completed_at?: string;
  stage3_completed_at?: string;
  all_stages_completed: boolean;

  // Stage 1: Pricing
  pricing_audit_notes?: string;

  // Stage 2: Purchase & Inventory
  has_inventory: boolean;
  has_purchase_order: boolean;
  purchase_order_number?: string;
  order_id?: string;
  why_not_buying?: 'lack_of_budget' | 'low_turnover' | 'sufficient_inventory' | 'prefers_other_brand' | 'distributor_issues' | 'not_applicable';
  purchase_inventory_notes?: string;

  // Stage 3: Communication & POP
  communication_plan_id?: string;
  communication_compliance?: 'full' | 'partial' | 'non_compliant';
  pop_execution_notes?: string;

  created_at: string;
  updated_at?: string;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification type enum values
 * Column: notifications.notification_type
 */
export type NotificationType =
  | 'promotion_approved'
  | 'promotion_rejected'
  | 'new_promotion'
  | 'visit_completed'
  | 'order_created'
  | 'qr_redeemed'
  | 'tier_upgrade'
  | 'survey_assigned'
  | 'survey_approved'
  | 'survey_rejected'
  | 'new_survey_pending'
  | 'system';

/**
 * notifications table
 */
export interface Notification {
  id: string;
  tenant_id: string;
  user_profile_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

// =============================================================================
// SURVEY TYPES
// =============================================================================

/**
 * Survey status enum values
 * Column: surveys.survey_status (NOT status!)
 */
export type SurveyStatusEnum =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'closed'
  | 'archived';

/**
 * Survey question type enum values
 */
export type SurveyQuestionTypeEnum =
  | 'text'
  | 'number'
  | 'multiple_choice'
  | 'scale'
  | 'yes_no';

/**
 * Survey target role enum values
 */
export type SurveyTargetRoleEnum =
  | 'promotor'
  | 'asesor_de_ventas'
  | 'client';

/**
 * Multiple choice option shape (stored in JSONB)
 */
export interface MultipleChoiceOption {
  value: string;
  label: string;
}

/**
 * Scale question options (stored in JSONB)
 */
export interface ScaleOptions {
  min: number;
  max: number;
  min_label?: string;
  max_label?: string;
}

/**
 * surveys table
 */
export interface Survey {
  id: string;
  public_id: string;
  tenant_id: string;
  brand_id: string;
  title: string;
  description?: string;
  survey_status: SurveyStatusEnum;  // NOT "status"!
  target_roles: SurveyTargetRoleEnum[];
  target_zone_ids?: string[] | null;
  target_client_type_categories?: string[] | null;
  start_date: string;
  end_date: string;
  created_by: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  rejection_reason?: string;
  max_responses_per_user: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * survey_questions table
 */
export interface SurveyQuestion {
  id: string;
  public_id: string;
  survey_id: string;
  tenant_id: string;
  question_text: string;
  question_type: SurveyQuestionTypeEnum;
  is_required: boolean;
  sort_order: number;
  options?: MultipleChoiceOption[] | ScaleOptions | null;
  created_at: string;
  updated_at?: string;
}

/**
 * survey_responses table
 */
export interface SurveyResponse {
  id: string;
  public_id: string;
  survey_id: string;
  tenant_id: string;
  respondent_id: string;
  respondent_role: SurveyTargetRoleEnum;
  submitted_at: string;
  created_at: string;
}

/**
 * survey_answers table
 */
export interface SurveyAnswer {
  id: string;
  response_id: string;
  question_id: string;
  tenant_id: string;
  answer_text?: string;
  answer_number?: number;
  answer_choice?: string;
  answer_scale?: number;
  answer_boolean?: boolean;
  created_at: string;
}

// =============================================================================
// KPI TYPES
// =============================================================================

/**
 * kpi_targets table
 * Brand Manager defines monthly/weekly/quarterly targets per KPI
 */
export interface KpiTarget {
  id: string;
  tenant_id: string;
  brand_id: string;
  kpi_slug: string;
  period_type: 'monthly' | 'weekly' | 'quarterly';
  period_start: string;
  period_end: string;
  target_value: number;
  target_unit: string;
  zone_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Row from v_kpi_dashboard_summary view
 */
export interface KpiSummaryRow {
  brand_id: string;
  tenant_id: string;
  period_month: string;
  kpi_slug: string;
  actual_value: number;
  target_value: number | null;
  unit: string;
  achievement_pct: number | null;
}

/**
 * Volume KPI detail response
 */
export interface KpiVolumeDetail {
  weekly: Array<{
    week: string;
    revenue: number;
    weight_tons: number;
  }>;
  monthly_total: number;
  weight_tons_total: number;
  by_zone: Array<{
    zone_id: string | null;
    zone_name: string | null;
    revenue: number;
    weight_tons: number;
  }>;
  target: number | null;
  achievement_pct: number | null;
}

/**
 * Reach KPI detail response
 */
export interface KpiReachDetail {
  by_zone: Array<{
    zone_id: string | null;
    zone_name: string | null;
    clients_visited: number;
    total_active_members: number;
    reach_pct: number;
  }>;
  monthly_total_visited: number;
  total_active_members: number;
  reach_pct: number;
  target: number | null;
  achievement_pct: number | null;
}

/**
 * Mix KPI detail response
 */
export interface KpiMixDetail {
  channels: Array<{
    market_id: string;
    market_name: string;
    client_count: number;
  }>;
  distinct_count: number;
  target: number | null;
  achievement_pct: number | null;
}

/**
 * Assortment KPI detail response
 */
export interface KpiAssortmentDetail {
  avg_pct: number;
  by_zone: Array<{
    zone_id: string | null;
    zone_name: string | null;
    avg_pct: number;
    visit_count: number;
  }>;
  target: number | null;
  achievement_pct: number | null;
}

/**
 * Market Share KPI detail response
 */
export interface KpiMarketShareDetail {
  share_pct: number;
  brand_present: number;
  competitor_present: number;
  share_by_facings_pct: number;
  by_zone: Array<{
    zone_id: string | null;
    zone_name: string | null;
    share_pct: number;
    brand_present: number;
    competitor_present: number;
  }>;
  target: number | null;
  achievement_pct: number | null;
}

/**
 * Share of Shelf KPI detail response
 */
export interface KpiShareOfShelfDetail {
  combined_pct: number;
  pop_pct: number;
  exhib_pct: number;
  by_zone: Array<{
    zone_id: string | null;
    zone_name: string | null;
    combined_pct: number;
    pop_pct: number;
    exhib_pct: number;
  }>;
  target: number | null;
  achievement_pct: number | null;
}

/**
 * Summary KPI response (for ring displays)
 */
export interface KpiDashboardSummary {
  kpis: Array<{
    slug: string;
    label: string;
    actual: number;
    target: number | null;
    achievement_pct: number | null;
    unit: string;
    icon: string;
    color: string;
  }>;
  period: string;
}
