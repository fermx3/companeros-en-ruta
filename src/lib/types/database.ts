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
  public_id: string;
  logo_url?: string;
  brand_color_primary?: string | null;
  brand_color_secondary?: string | null;
  description?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website?: string | null;
  status?: string | null;
  settings?: Record<string, unknown> | null;
  dashboard_metrics?: Record<string, unknown> | null;
  dashboard_metrics_updated_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Client {
  id: string;
  tenant_id: string;
  code: string;
  business_name: string;
  owner_name?: string;
  owner_last_name?: string;
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
  gender?: string;
  date_of_birth?: string;
  email_opt_in?: boolean;
  whatsapp_opt_in?: boolean;
  has_meat_fridge?: boolean;
  has_soda_fridge?: boolean;
  accepts_card?: boolean;
  onboarding_completed?: boolean;
  metadata?: Record<string, unknown>;
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

/**
 * Client type category enum values
 * Column: client_types.category
 */
export type ClientTypeCategoryEnum =
  | 'retail'
  | 'wholesale'
  | 'institutional'
  | 'online'
  | 'hybrid';

export interface ClientType {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description?: string;
  category: ClientTypeCategoryEnum;
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
  | 'points_adjusted'
  | 'assignment_changed'
  | 'supervisor_changed'
  | 'welcome'
  | 'membership_pending'
  | 'client_status_changed'
  | 'system';

/**
 * notifications table
 */
export interface Notification {
  id: string;
  tenant_id: string;
  user_profile_id: string | null;
  client_id?: string | null;
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
  | 'yes_no'
  | 'checkbox'
  | 'ordered_list'
  | 'percentage_distribution';

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
 * Visibility condition for survey sections (stored in JSONB)
 * Determines whether a section is shown based on a previous question's answer
 */
export interface VisibilityCondition {
  question_id: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  values: string[];
}

/**
 * Input attributes for survey questions (stored in JSONB)
 * Metadata controlling HTML input rendering
 */
export interface InputAttributes {
  placeholder?: string;
  maxLength?: number;
  max?: number;
  count?: number;
  prefix?: string;
  suffix?: string;
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
  targeting_criteria?: TargetingCriteria | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

/**
 * survey_sections table
 */
export interface SurveySection {
  id: string;
  survey_id: string;
  tenant_id: string;
  title: string;
  description?: string | null;
  sort_order: number;
  visibility_condition?: VisibilityCondition | null;
  created_at: string;
  updated_at?: string;
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
  section_id?: string | null;
  input_attributes?: InputAttributes | null;
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
  answer_choices?: string[];
  answer_json?: Record<string, unknown>;
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

// =============================================================================
// TARGETING / SEGMENTATION TYPES
// =============================================================================

/**
 * Gender values (CHECK constraint, not enum)
 * Column: clients.gender
 */
export type GenderValue = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';

/**
 * Promotor specialization enum values
 * Column: promotor_assignments.specialization
 */
export type AdvisorSpecializationEnum =
  | 'retail'
  | 'wholesale'
  | 'pharma'
  | 'food_service'
  | 'convenience'
  | 'supermarket'
  | 'general';

/**
 * Promotor experience level enum values
 * Column: promotor_assignments.experience_level
 */
export type AdvisorExperienceLevelEnum =
  | 'trainee'
  | 'junior'
  | 'senior'
  | 'expert'
  | 'team_lead';

/**
 * Unified targeting criteria stored as JSONB in
 * promotions, surveys, and brand_communication_plans.
 *
 * Client criteria: used by promotions, surveys (when target_roles includes 'client'),
 *   and communication plans.
 * Staff criteria: used by surveys only (when target_roles includes 'promotor' or 'asesor_de_ventas').
 */
export interface TargetingCriteria {
  // --- Client criteria ---
  zone_ids?: string[];
  market_ids?: string[];
  client_type_categories?: ClientTypeCategoryEnum[];
  client_type_ids?: string[];
  commercial_structure_ids?: string[];
  tier_ids?: string[];

  // Equipment
  has_meat_fridge?: boolean;
  has_soda_fridge?: boolean;
  accepts_card?: boolean;

  // Demographics
  gender?: GenderValue[];
  min_age?: number;
  max_age?: number;

  // Communication preferences
  email_opt_in?: boolean;
  whatsapp_opt_in?: boolean;

  // Business profile (from clients.metadata JSONB)
  employees?: string[];
  supply_sources?: string[];
  digital_restock?: boolean;
  offers_topups?: boolean;

  // --- Staff criteria (surveys only) ---
  staff_zone_ids?: string[];
  staff_specializations?: AdvisorSpecializationEnum[];
  staff_experience_levels?: AdvisorExperienceLevelEnum[];
  staff_distributor_ids?: string[];
}

/**
 * Promotion interface
 * Table: promotions
 * Note: promotions use `status` (NOT promotion_status)
 */
export interface Promotion {
  id: string;
  public_id: string;
  tenant_id: string;
  brand_id: string;
  name: string;
  description?: string | null;
  promotion_type: string;
  status: string;
  start_date: string;
  end_date: string;
  start_time?: string | null;
  end_time?: string | null;
  days_of_week?: number[] | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  min_purchase_amount?: number | null;
  max_discount_amount?: number | null;
  buy_quantity?: number | null;
  get_quantity?: number | null;
  points_multiplier?: number | null;
  usage_limit_per_client?: number | null;
  usage_limit_total?: number | null;
  usage_count_total?: number;
  budget_allocated?: number | null;
  budget_spent?: number;
  priority?: number;
  stackable?: boolean;
  auto_apply?: boolean;
  requires_code?: boolean;
  promo_code?: string | null;
  terms_and_conditions?: string | null;
  internal_notes?: string | null;
  creative_assets?: unknown | null;
  targeting_criteria?: TargetingCriteria | null;
  approved_at?: string | null;
  approval_notes?: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/**
 * Brand communication plan interface
 * Table: brand_communication_plans
 */
export interface BrandCommunicationPlan {
  id: string;
  public_id: string;
  tenant_id: string;
  brand_id: string;
  plan_name: string;
  plan_period?: string | null;
  target_locations?: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  targeting_criteria?: TargetingCriteria | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}
