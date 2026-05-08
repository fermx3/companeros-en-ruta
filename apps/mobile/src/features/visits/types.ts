// Wizard data shapes — mobile-native (no File / previewUrl, only server URLs).
//
// Mirrors apps/web/src/components/visits/VisitAssessmentWizard.tsx without the
// browser-only fields. The POST bodies match
// apps/web/src/app/api/promotor/visits/[id]/assessment/route.ts (POST handler).

export type StockLevel = 'out_of_stock' | 'low' | 'medium' | 'high'
export type WhyNotBuying =
  | 'lack_of_budget'
  | 'low_turnover'
  | 'too_much_stock'
  | 'price'
  | 'other'
export type CommunicationCompliance = 'full' | 'partial' | 'non_compliant'
export type PopCondition = 'good' | 'damaged' | 'missing'
export type ExecutionQuality = 'excellent' | 'good' | 'fair' | 'poor'

export interface BrandProductAssessment {
  product_id: string
  product_variant_id?: string | null
  current_price?: number | null
  suggested_price?: number | null
  is_product_present: boolean
  stock_level?: StockLevel | null
  has_active_promotion: boolean
  promotion_description?: string | null
  has_pop_material: boolean
}

export interface CompetitorAssessment {
  competitor_id: string
  competitor_product_id?: string | null
  product_name_observed?: string | null
  size_grams?: number | null
  observed_price?: number | null
  has_active_promotion: boolean
  promotion_description?: string | null
  has_pop_material: boolean
}

export interface InventoryItem {
  // Mirrors web's encoding: a productId can be `<product_id>` OR
  // `<product_id>:<variant_id>` so the server splits in stage 2 handler.
  product_id: string
  current_stock: number
  notes?: string | null
}

export interface PopMaterialCheck {
  pop_material_id: string
  is_present: boolean
  condition?: PopCondition | null
  notes?: string | null
}

export interface ExhibitionCheck {
  exhibition_id: string
  is_executed: boolean
  execution_quality?: ExecutionQuality | null
  notes?: string | null
}

export interface Stage1Data {
  brandProductAssessments: BrandProductAssessment[]
  competitorAssessments: CompetitorAssessment[]
  pricingAuditNotes: string
}

export interface Stage2Data {
  hasInventory: boolean
  hasPurchaseOrder: boolean
  purchaseOrderNumber?: string | null
  whyNotBuying?: WhyNotBuying | null
  purchaseInventoryNotes?: string | null
  inventoryItems: InventoryItem[]
  orderId?: string | null
}

export interface Stage3Data {
  communicationPlanId?: string | null
  communicationCompliance?: CommunicationCompliance | null
  popMaterialChecks: PopMaterialCheck[]
  exhibitionChecks: ExhibitionCheck[]
  popExecutionNotes?: string | null
}

// ----- Catalog response types -----

export interface BrandProductVariant {
  id: string
  variant_name: string
  size_value: number | null
  size_unit: string | null
  price: number | null
  suggested_price: number | null
}

export interface BrandProduct {
  id: string
  name: string
  sku: string | null
  code: string | null
  brand_id: string
  base_price: number | null
  product_variants: BrandProductVariant[]
}

export interface BrandProductsResponse {
  products: BrandProduct[]
}

export interface CompetitorProductSize {
  size_value: number | null
  size_unit: string | null
}

export interface CompetitorProduct {
  id: string
  product_name: string
  default_size_grams: number | null
  default_size_ml: number | null
  brand_competitor_product_sizes?: CompetitorProductSize[]
}

export interface BrandCompetitor {
  id: string
  competitor_name: string
  logo_url: string | null
  brand_competitor_products: CompetitorProduct[]
}

export interface BrandCompetitorsResponse {
  competitors: BrandCompetitor[]
}

export interface PopMaterial {
  id: string
  material_name: string
  material_category: string | null
  is_system_template?: boolean | null
}

export interface PopMaterialsResponse {
  materials: PopMaterial[]
  systemTemplates?: PopMaterial[]
}

export interface CommunicationPlan {
  id: string
  plan_name: string
  plan_period: string | null
  target_locations: string[] | null
  brand_communication_plan_materials: {
    pop_material_id: string
    quantity_required: number | null
    placement_notes: string | null
    brand_pop_materials?: { id: string; material_name: string; material_category: string | null }
  }[]
  brand_communication_plan_activities: {
    activity_name: string
    activity_description: string | null
  }[]
}

export interface CommunicationPlansResponse {
  plans: CommunicationPlan[]
}

export interface BrandExhibition {
  id: string
  exhibition_name: string
  location_description: string | null
  start_date: string | null
  end_date: string | null
}

export interface BrandExhibitionsResponse {
  exhibitions: BrandExhibition[]
}

export interface Distributor {
  id: string
  name: string
  contact_name: string | null
  contact_phone: string | null
}

export interface DistributorsResponse {
  distributors: Distributor[]
}

export interface ClientPromotion {
  id: string
  name: string
  description: string | null
  promotion_type: string
  discount_display: string | null
  valid_until: string | null
  status: string
  usage_limit: number | null
  times_used: number | null
  remaining_uses: number | null
}

export interface ClientPromotionsResponse {
  promotions: ClientPromotion[]
}

export type OrderPaymentMethod = 'cash' | 'transfer' | 'credit' | 'check' | 'card'

export interface VisitOrderItem {
  product_id: string
  product_variant_id: string | null
  product_name: string
  quantity: number
  unit_price: number
}

export interface VisitOrder {
  id: string
  order_number: string | null
  order_status: string
  total_amount: number | string
  distributor_id: string | null
  distributor_name: string | null
  payment_method: OrderPaymentMethod | null
  order_notes: string | null
  created_at: string
  items: VisitOrderItem[]
}

export interface VisitOrdersResponse {
  orders: VisitOrder[]
}

export interface CreateOrderBody {
  distributor_id: string
  payment_method: OrderPaymentMethod
  order_notes?: string | null
  items: {
    product_id: string
    product_variant_id?: string | null
    quantity: number
    unit_price: number
  }[]
}

// ----- Assessment GET response (used to hydrate the wizard store) -----

export interface VisitAssessmentResponse {
  stageAssessment: {
    stage1_completed_at: string | null
    stage2_completed_at: string | null
    stage3_completed_at: string | null
    pricing_audit_notes: string | null
    has_inventory: boolean | null
    has_purchase_order: boolean | null
    purchase_order_number: string | null
    why_not_buying: WhyNotBuying | null
    purchase_inventory_notes: string | null
    order_id: string | null
    communication_plan_id: string | null
    communication_compliance: CommunicationCompliance | null
    pop_execution_notes: string | null
    all_stages_completed: boolean
  } | null
  brandProductAssessments: (BrandProductAssessment & { id: string })[]
  competitorAssessments: (CompetitorAssessment & { id: string })[]
  popMaterialChecks: (PopMaterialCheck & { id: string })[]
  exhibitionChecks: (ExhibitionCheck & { id: string })[]
  inventoryItems: {
    id: string
    product_id: string
    product_variant_id: string | null
    current_stock: number
    notes: string | null
  }[]
  evidence: {
    id: string
    visit_id: string
    evidence_stage: string
    evidence_type: string | null
    file_url: string
    caption: string | null
    capture_latitude: number | null
    capture_longitude: number | null
    captured_at: string | null
    created_at: string
  }[]
}

// ----- POST /assessment body union -----

export type AssessmentPostBody =
  | { stage: 1; data: { brandProductAssessments: BrandProductAssessment[]; competitorAssessments: CompetitorAssessment[]; pricingAuditNotes: string | null } }
  | { stage: 2; data: { hasInventory: boolean; hasPurchaseOrder: boolean; purchaseOrderNumber: string | null; whyNotBuying: WhyNotBuying | null; purchaseInventoryNotes: string | null; inventoryItems: InventoryItem[]; orderId?: string | null } }
  | { stage: 3; data: { communicationPlanId: string | null; communicationCompliance: CommunicationCompliance | null; popMaterialChecks: PopMaterialCheck[]; exhibitionChecks: ExhibitionCheck[]; popExecutionNotes: string | null } }
