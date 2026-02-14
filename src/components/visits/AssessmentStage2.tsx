'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Package, Gift, Clipboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PhotoEvidenceUpload, EvidencePhoto } from './PhotoEvidenceUpload'
import { ClientPromotionsPanel, ClientPromotion } from './ClientPromotionsPanel'
import { OrderQuickAccess, WhyNotBuyingReason, PendingOrder } from './OrderQuickAccess'
import { OrderModal } from './OrderModal'
import { VisitInventoryForm } from './VisitInventoryForm'
import { cn } from '@/lib/utils'
import type { WizardData } from './VisitAssessmentWizard'

interface AssessmentStage2Props {
  data: WizardData['stage2']
  onDataChange: (updates: Partial<WizardData['stage2']>) => void
  visitId: string
  clientId: string
  className?: string
}

const INVENTORY_EVIDENCE_TYPES = [
  { value: 'purchase_order', label: 'Orden de compra' },
  { value: 'inventory_count', label: 'Conteo de inventario' },
  { value: 'promotion_display', label: 'Display de promoción' },
  { value: 'general', label: 'General' }
]

export function AssessmentStage2({
  data,
  onDataChange,
  visitId,
  clientId,
  className
}: AssessmentStage2Props) {
  const [promotions, setPromotions] = useState<ClientPromotion[]>([])
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
  const [loadingPromotions, setLoadingPromotions] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showInventorySection, setShowInventorySection] = useState(data.hasInventory)

  // Load client promotions and pending orders
  useEffect(() => {
    const loadData = async () => {
      setLoadingPromotions(true)
      try {
        // Load client promotions
        const promotionsRes = await fetch(`/api/client/${clientId}/promotions`).catch(() => null)
        if (promotionsRes?.ok) {
          const promotionsData = await promotionsRes.json()
          setPromotions(promotionsData.promotions || [])
        }

        // Load pending orders for this client
        const ordersRes = await fetch(`/api/promotor/visits/${visitId}/orders?status=pending`).catch(() => null)
        if (ordersRes?.ok) {
          const ordersData = await ordersRes.json()
          setPendingOrders(ordersData.orders || [])
        }
      } catch (error) {
        console.error('Error loading stage 2 data:', error)
      } finally {
        setLoadingPromotions(false)
      }
    }

    loadData()
  }, [clientId, visitId])

  const handleEvidenceChange = (photos: EvidencePhoto[]) => {
    onDataChange({
      evidence: photos.map(p => ({
        id: p.id,
        file: p.file,
        previewUrl: p.previewUrl,
        fileUrl: p.fileUrl,
        caption: p.caption,
        evidenceType: p.evidenceType,
        captureLatitude: p.captureLatitude,
        captureLongitude: p.captureLongitude
      }))
    })
  }

  const handleOrderCreated = (orderId: string) => {
    onDataChange({
      orderId,
      hasPurchaseOrder: true
    })
  }

  const handleInventorySave = async (inventoryData: { inventory_skipped: boolean; items: Array<{ product_id: string; current_stock: number; notes?: string | null }> }) => {
    onDataChange({
      hasInventory: !inventoryData.inventory_skipped
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
          Compra, Inventario y Fidelización
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Gestiona promociones, órdenes de compra e inventario
        </p>
      </div>

      {/* Client Promotions Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            Promociones del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClientPromotionsPanel
            promotions={promotions}
            loading={loadingPromotions}
          />
        </CardContent>
      </Card>

      {/* Order Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Clipboard className="w-4 h-4 mr-2" />
            Orden de Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderQuickAccess
            hasPurchaseOrder={data.hasPurchaseOrder}
            onHasPurchaseOrderChange={(value) => onDataChange({ hasPurchaseOrder: value })}
            purchaseOrderNumber={data.purchaseOrderNumber}
            onPurchaseOrderNumberChange={(value) => onDataChange({ purchaseOrderNumber: value })}
            whyNotBuying={data.whyNotBuying as WhyNotBuyingReason | null}
            onWhyNotBuyingChange={(value) => onDataChange({ whyNotBuying: value })}
            pendingOrders={pendingOrders}
            onCreateOrder={() => setShowOrderModal(true)}
            onViewOrderHistory={() => {
              // Navigate to order history or open modal
              window.open(`/promotor/visitas/${visitId}/orders`, '_blank')
            }}
          />
        </CardContent>
      </Card>

      {/* Inventory Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </CardTitle>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInventorySection}
                onChange={(e) => {
                  setShowInventorySection(e.target.checked)
                  onDataChange({ hasInventory: e.target.checked })
                }}
                className="mr-2 rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm text-gray-600">Registrar inventario</span>
            </label>
          </div>
        </CardHeader>
        {showInventorySection && (
          <CardContent>
            <VisitInventoryForm
              visit={{ id: visitId }}
              onSave={handleInventorySave}
            />
          </CardContent>
        )}
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas de compra e inventario
          </label>
          <textarea
            value={data.purchaseInventoryNotes}
            onChange={(e) => onDataChange({ purchaseInventoryNotes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Observaciones sobre la compra, inventario, promociones aplicadas..."
          />
        </CardContent>
      </Card>

      {/* Photo Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidencia Fotográfica</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoEvidenceUpload
            photos={data.evidence.map(e => ({
              id: e.id,
              file: e.file,
              previewUrl: e.previewUrl,
              fileUrl: e.fileUrl,
              caption: e.caption,
              evidenceType: e.evidenceType,
              captureLatitude: e.captureLatitude,
              captureLongitude: e.captureLongitude,
              capturedAt: new Date()
            }))}
            onPhotosChange={handleEvidenceChange}
            evidenceStage="inventory"
            evidenceTypes={INVENTORY_EVIDENCE_TYPES}
            minPhotos={0}
            maxPhotos={5}
          />
        </CardContent>
      </Card>

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onOrderCreated={handleOrderCreated}
        clientId={clientId}
        visitId={visitId}
      />
    </div>
  )
}
