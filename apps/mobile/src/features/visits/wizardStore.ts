import { create } from 'zustand'

import type {
  AssessmentPostBody,
  Stage1Data,
  Stage2Data,
  Stage3Data,
  VisitAssessmentResponse,
} from './types'

type Stage = 1 | 2 | 3

interface VisitWizardSlice {
  stage1: Stage1Data
  stage2: Stage2Data
  stage3: Stage3Data
  completedStages: ReadonlySet<Stage>
  hydrated: boolean
}

interface WizardState {
  byVisitId: Record<string, VisitWizardSlice>
  hydrate: (visitId: string, response: VisitAssessmentResponse) => void
  patchStage1: (visitId: string, patch: Partial<Stage1Data>) => void
  patchStage2: (visitId: string, patch: Partial<Stage2Data>) => void
  patchStage3: (visitId: string, patch: Partial<Stage3Data>) => void
  markCompleted: (visitId: string, stage: Stage) => void
  reset: (visitId: string) => void
}

const emptySlice = (): VisitWizardSlice => ({
  stage1: {
    brandProductAssessments: [],
    competitorAssessments: [],
    pricingAuditNotes: '',
  },
  stage2: {
    hasInventory: false,
    hasPurchaseOrder: false,
    purchaseOrderNumber: null,
    whyNotBuying: null,
    purchaseInventoryNotes: null,
    inventoryItems: [],
    orderId: null,
  },
  stage3: {
    communicationPlanId: null,
    communicationCompliance: null,
    popMaterialChecks: [],
    exhibitionChecks: [],
    popExecutionNotes: null,
  },
  completedStages: new Set(),
  hydrated: false,
})

export const useWizardStore = create<WizardState>((set) => ({
  byVisitId: {},

  hydrate: (visitId, response) =>
    set(state => {
      const completed = new Set<Stage>()
      const sa = response.stageAssessment
      if (sa?.stage1_completed_at) completed.add(1)
      if (sa?.stage2_completed_at) completed.add(2)
      if (sa?.stage3_completed_at) completed.add(3)

      const slice: VisitWizardSlice = {
        stage1: {
          brandProductAssessments: response.brandProductAssessments.map(stripId),
          competitorAssessments: response.competitorAssessments.map(stripId),
          pricingAuditNotes: sa?.pricing_audit_notes ?? '',
        },
        stage2: {
          hasInventory: sa?.has_inventory ?? false,
          hasPurchaseOrder: sa?.has_purchase_order ?? false,
          purchaseOrderNumber: sa?.purchase_order_number ?? null,
          whyNotBuying: sa?.why_not_buying ?? null,
          purchaseInventoryNotes: sa?.purchase_inventory_notes ?? null,
          orderId: sa?.order_id ?? null,
          inventoryItems: response.inventoryItems.map(it => ({
            product_id: it.product_variant_id
              ? `${it.product_id}:${it.product_variant_id}`
              : it.product_id,
            current_stock: it.current_stock,
            notes: it.notes,
          })),
        },
        stage3: {
          communicationPlanId: sa?.communication_plan_id ?? null,
          communicationCompliance: sa?.communication_compliance ?? null,
          popMaterialChecks: response.popMaterialChecks.map(stripId),
          exhibitionChecks: response.exhibitionChecks.map(stripId),
          popExecutionNotes: sa?.pop_execution_notes ?? null,
        },
        completedStages: completed,
        hydrated: true,
      }
      return { byVisitId: { ...state.byVisitId, [visitId]: slice } }
    }),

  patchStage1: (visitId, patch) =>
    set(state => {
      const slice = state.byVisitId[visitId] ?? emptySlice()
      return {
        byVisitId: {
          ...state.byVisitId,
          [visitId]: { ...slice, stage1: { ...slice.stage1, ...patch } },
        },
      }
    }),

  patchStage2: (visitId, patch) =>
    set(state => {
      const slice = state.byVisitId[visitId] ?? emptySlice()
      return {
        byVisitId: {
          ...state.byVisitId,
          [visitId]: { ...slice, stage2: { ...slice.stage2, ...patch } },
        },
      }
    }),

  patchStage3: (visitId, patch) =>
    set(state => {
      const slice = state.byVisitId[visitId] ?? emptySlice()
      return {
        byVisitId: {
          ...state.byVisitId,
          [visitId]: { ...slice, stage3: { ...slice.stage3, ...patch } },
        },
      }
    }),

  markCompleted: (visitId, stage) =>
    set(state => {
      const slice = state.byVisitId[visitId] ?? emptySlice()
      const next = new Set(slice.completedStages)
      next.add(stage)
      return {
        byVisitId: {
          ...state.byVisitId,
          [visitId]: { ...slice, completedStages: next },
        },
      }
    }),

  reset: (visitId) =>
    set(state => {
      const next = { ...state.byVisitId }
      delete next[visitId]
      return { byVisitId: next }
    }),
}))

export function useVisitWizardSlice(visitId: string): VisitWizardSlice {
  return useWizardStore(state => state.byVisitId[visitId] ?? emptySlice())
}

// ----- Serializers (slice → POST body) -----

export function serializeStage1(slice: VisitWizardSlice): AssessmentPostBody {
  return {
    stage: 1,
    data: {
      brandProductAssessments: slice.stage1.brandProductAssessments,
      competitorAssessments: slice.stage1.competitorAssessments,
      pricingAuditNotes: slice.stage1.pricingAuditNotes || null,
    },
  }
}

export function serializeStage2(slice: VisitWizardSlice): AssessmentPostBody {
  return {
    stage: 2,
    data: {
      hasInventory: slice.stage2.hasInventory,
      hasPurchaseOrder: slice.stage2.hasPurchaseOrder,
      purchaseOrderNumber: slice.stage2.purchaseOrderNumber ?? null,
      whyNotBuying: slice.stage2.whyNotBuying ?? null,
      purchaseInventoryNotes: slice.stage2.purchaseInventoryNotes ?? null,
      inventoryItems: slice.stage2.inventoryItems,
      orderId: slice.stage2.orderId ?? null,
    },
  }
}

export function serializeStage3(slice: VisitWizardSlice): AssessmentPostBody {
  return {
    stage: 3,
    data: {
      communicationPlanId: slice.stage3.communicationPlanId ?? null,
      communicationCompliance: slice.stage3.communicationCompliance ?? null,
      popMaterialChecks: slice.stage3.popMaterialChecks,
      exhibitionChecks: slice.stage3.exhibitionChecks,
      popExecutionNotes: slice.stage3.popExecutionNotes ?? null,
    },
  }
}

// ----- helpers -----

function stripId<T extends { id: string }>(row: T): Omit<T, 'id'> {
   
  const { id: _id, ...rest } = row
  return rest
}
