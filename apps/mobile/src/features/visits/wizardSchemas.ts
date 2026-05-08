import { z } from 'zod'

// Mirror of POST /api/promotor/visits/[id]/assessment body validation.
// Source of truth: apps/web/src/app/api/promotor/visits/[id]/assessment/route.ts
//
// Keep in sync until / unless we extract the schemas to @companeros/shared.
//
// Note on IDs: we use a permissive UUID-like regex instead of zod's strict
// `.uuid()` because the seed data ships with nil-pattern UUIDs
// (e.g. `d0000002-0000-0000-0000-000000000009`) that don't conform to RFC
// 4122 v1-v8 — the server-side handler doesn't run zod, it just hands them
// to Postgres which accepts any 8-4-4-4-12 hex pattern.
const uuidLike = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    'Identificador inválido'
  )

const stockLevelEnum = z.enum(['out_of_stock', 'low', 'medium', 'high'])
const whyNotBuyingEnum = z.enum([
  'lack_of_budget',
  'low_turnover',
  'sufficient_inventory',
  'prefers_other_brand',
  'distributor_issues',
  'not_applicable',
])
const communicationComplianceEnum = z.enum(['full', 'partial', 'non_compliant'])
const popConditionEnum = z.enum(['good', 'damaged', 'missing'])
const executionQualityEnum = z.enum(['excellent', 'good', 'fair', 'poor'])

const brandProductAssessmentSchema = z.object({
  product_id: uuidLike,
  product_variant_id: uuidLike.nullable().optional(),
  current_price: z.number().nullable().optional(),
  suggested_price: z.number().nullable().optional(),
  is_product_present: z.boolean(),
  stock_level: stockLevelEnum.nullable().optional(),
  has_active_promotion: z.boolean(),
  promotion_description: z.string().nullable().optional(),
  has_pop_material: z.boolean(),
})

const competitorAssessmentSchema = z.object({
  competitor_id: uuidLike,
  competitor_product_id: uuidLike.nullable().optional(),
  product_name_observed: z.string().nullable().optional(),
  size_grams: z.number().nullable().optional(),
  observed_price: z.number().nullable().optional(),
  has_active_promotion: z.boolean(),
  promotion_description: z.string().nullable().optional(),
  has_pop_material: z.boolean(),
})

const inventoryItemSchema = z.object({
  product_id: z.string().min(1), // may be `<uuid>` or `<uuid>:<variantUuid>`
  current_stock: z.number().int().nonnegative(),
  notes: z.string().nullable().optional(),
})

const popMaterialCheckSchema = z.object({
  pop_material_id: uuidLike,
  is_present: z.boolean(),
  condition: popConditionEnum.nullable().optional(),
  notes: z.string().nullable().optional(),
})

const exhibitionCheckSchema = z.object({
  exhibition_id: uuidLike,
  is_executed: z.boolean(),
  execution_quality: executionQualityEnum.nullable().optional(),
  notes: z.string().nullable().optional(),
})

// ----- Stage 1 -----
//
// Web-side requirement (VisitAssessmentWizard.tsx):
// - ≥1 brand product marked is_product_present
// - ≥1 brand product with current_price filled
// - ≥1 evidence photo uploaded for the visit (validated outside this schema —
//   evidence lives server-side after upload, so we check it at the call site).
export const stage1Schema = z
  .object({
    brandProductAssessments: z.array(brandProductAssessmentSchema),
    competitorAssessments: z.array(competitorAssessmentSchema),
    pricingAuditNotes: z.string().nullable().optional(),
  })
  .refine(d => d.brandProductAssessments.some(p => p.is_product_present), {
    message: 'Marca al menos un producto como presente',
    path: ['brandProductAssessments'],
  })
  .refine(
    d => d.brandProductAssessments.some(p => p.is_product_present && p.current_price != null),
    {
      message: 'Ingresa el precio de al menos un producto presente',
      path: ['brandProductAssessments'],
    }
  )

// ----- Stage 2 -----
//
// Cross-field rule depends on `orders.length` which lives outside the form.
// Use a factory: `makeStage2Schema(ordersCount)` returns the right schema.
export function makeStage2Schema(ordersCount: number) {
  return z
    .object({
      hasInventory: z.boolean(),
      hasPurchaseOrder: z.boolean(),
      purchaseOrderNumber: z.string().nullable().optional(),
      whyNotBuying: whyNotBuyingEnum.nullable().optional(),
      purchaseInventoryNotes: z.string().nullable().optional(),
      inventoryItems: z.array(inventoryItemSchema),
      orderId: uuidLike.nullable().optional(),
    })
    .refine(
      d => d.hasPurchaseOrder || ordersCount > 0 || d.whyNotBuying != null,
      {
        message:
          'Si no hay pedido de compra, indica el motivo (whyNotBuying).',
        path: ['whyNotBuying'],
      }
    )
}

export const stage2Schema = makeStage2Schema(0)

// ----- Stage 3 -----
//
// All fields optional on the server side; we just type-check.
export const stage3Schema = z.object({
  communicationPlanId: uuidLike.nullable().optional(),
  communicationCompliance: communicationComplianceEnum.nullable().optional(),
  popMaterialChecks: z.array(popMaterialCheckSchema),
  exhibitionChecks: z.array(exhibitionCheckSchema),
  popExecutionNotes: z.string().nullable().optional(),
})

// ----- Order POST body (PR E uses it; declared here for cohesion) -----
export const orderPaymentMethodEnum = z.enum([
  'cash',
  'transfer',
  'credit',
  'check',
  'card',
])

export const orderItemSchema = z.object({
  product_id: uuidLike,
  product_variant_id: uuidLike.nullable().optional(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
})

export const orderSchema = z.object({
  distributor_id: uuidLike,
  payment_method: orderPaymentMethodEnum,
  order_notes: z.string().nullable().optional(),
  items: z.array(orderItemSchema).min(1),
})

export type Stage1Body = z.infer<typeof stage1Schema>
export type Stage2Body = z.infer<typeof stage2Schema>
export type Stage3Body = z.infer<typeof stage3Schema>
export type OrderBody = z.infer<typeof orderSchema>
