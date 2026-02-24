'use client'

import { Card } from '@/components/ui/Card'
import { VisitHeader } from '@/components/visits/VisitHeader'
import type { VisitDetailData } from '@/lib/api/visit-detail'

interface VisitDetailReadOnlyProps {
  data: VisitDetailData
}

// ============================================
// Sub-components
// ============================================

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 mb-3">{children}</h2>
}

function EmptySection({ message }: { message: string }) {
  return <p className="text-sm text-gray-500 italic py-4 text-center">{message}</p>
}

function EvidenceGrid({ evidence, stage }: { evidence: Array<Record<string, unknown>>; stage: string }) {
  const filtered = evidence.filter(e => e.evidence_stage === stage)
  if (filtered.length === 0) return null

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Evidencia fotográfica</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((e) => (
          <div key={e.id as string} className="relative group">
            <img
              src={e.file_url as string}
              alt={e.caption as string || 'Evidencia'}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            {typeof e.caption === 'string' && e.caption && (
              <p className="text-xs text-gray-600 mt-1 truncate">{e.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <p className="text-sm text-gray-900">{value ?? 'N/A'}</p>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function VisitDetailReadOnly({ data }: VisitDetailReadOnlyProps) {
  const { visit, assessment, orders } = data
  const { stageAssessment, brandProductAssessments, competitorAssessments, popMaterialChecks, exhibitionChecks, evidence } = assessment

  const sa = stageAssessment as Record<string, unknown> | null

  const promotorName = visit.promotor
    ? `${(visit.promotor as { first_name: string }).first_name} ${(visit.promotor as { last_name: string }).last_name}`
    : 'N/A'

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A'
    if (minutes < 60) return `${minutes} min`
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs}h ${mins}min`
  }

  const formatCurrency = (amount: string | number | null | undefined) => {
    if (amount == null) return '$0.00'
    return `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Efectivo',
    credit: 'Crédito',
    transfer: 'Transferencia',
    check: 'Cheque',
  }

  const conditionLabels: Record<string, string> = {
    good: 'Bueno',
    damaged: 'Dañado',
    missing: 'Faltante',
  }

  return (
    <div className="space-y-6">
      {/* Visit Header (reusing existing component) */}
      <VisitHeader visit={{
        client: visit.client ? {
          business_name: visit.client.business_name ?? undefined,
          owner_name: visit.client.owner_name ?? undefined,
          owner_last_name: visit.client.owner_last_name ?? undefined,
          address_street: visit.client.address_street ?? undefined,
          address_neighborhood: visit.client.address_neighborhood ?? undefined,
        } : undefined,
        brand: visit.brand || undefined,
        visit_number: visit.public_id,
        visit_date: visit.visit_date,
        status: visit.visit_status,
      }} />

      {/* Visit Info */}
      <Card>
        <div className="p-6">
          <SectionTitle>Información de la Visita</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoRow label="Promotor" value={promotorName} />
            <InfoRow label="Check-in" value={formatDateTime(visit.check_in_time)} />
            <InfoRow label="Check-out" value={formatDateTime(visit.check_out_time)} />
            <InfoRow label="Duración" value={formatDuration(visit.duration_minutes)} />
            <InfoRow label="Rating" value={visit.client_satisfaction_rating != null ? `${visit.client_satisfaction_rating}/5` : null} />
            {visit.promotor_notes && (
              <div className="col-span-2 md:col-span-4">
                <span className="text-sm font-medium text-gray-500">Notas del promotor</span>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{visit.promotor_notes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stage 1: Auditoría de Precios */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">1</span>
            <SectionTitle>Auditoría de Precios</SectionTitle>
            {!!sa?.stage1_completed_at && (
              <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Completada</span>
            )}
          </div>

          {brandProductAssessments.length > 0 ? (
            <>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Productos de la Marca</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Presente</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Sugerido</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Stock</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Promoción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {brandProductAssessments.map((bpa) => (
                      <tr key={bpa.id as string}>
                        <td className="px-4 py-2 text-gray-900">{bpa.product_name as string}</td>
                        <td className="px-4 py-2 text-center">
                          {bpa.is_product_present ? (
                            <span className="text-green-600">Sí</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">{bpa.current_price != null ? formatCurrency(bpa.current_price as number) : '—'}</td>
                        <td className="px-4 py-2 text-right">{bpa.suggested_price != null ? formatCurrency(bpa.suggested_price as number) : '—'}</td>
                        <td className="px-4 py-2 text-center">{(bpa.stock_level as string) || '—'}</td>
                        <td className="px-4 py-2 text-center">
                          {bpa.has_active_promotion ? (
                            <span className="text-green-600" title={bpa.promotion_description as string || ''}>Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptySection message="Sin datos recopilados" />
          )}

          {competitorAssessments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Competencia</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Competidor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Promoción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {competitorAssessments.map((ca) => (
                      <tr key={ca.id as string}>
                        <td className="px-4 py-2 text-gray-900">{ca.competitor_name as string}</td>
                        <td className="px-4 py-2 text-gray-700">{(ca.product_name_observed as string) || '—'}</td>
                        <td className="px-4 py-2 text-right">{ca.observed_price != null ? formatCurrency(ca.observed_price as number) : '—'}</td>
                        <td className="px-4 py-2 text-center">
                          {ca.has_active_promotion ? (
                            <span className="text-green-600" title={ca.promotion_description as string || ''}>Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {typeof sa?.pricing_audit_notes === 'string' && sa.pricing_audit_notes && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Notas</span>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{sa.pricing_audit_notes as string}</p>
            </div>
          )}

          <EvidenceGrid evidence={evidence} stage="pricing" />
        </div>
      </Card>

      {/* Stage 2: Inventario y Compra */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">2</span>
            <SectionTitle>Inventario y Compra</SectionTitle>
            {!!sa?.stage2_completed_at && (
              <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Completada</span>
            )}
          </div>

          {sa ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoRow label="Tiene inventario" value={sa.has_inventory ? 'Sí' : 'No'} />
              <InfoRow label="Tiene orden de compra" value={sa.has_purchase_order ? 'Sí' : 'No'} />
              {typeof sa.purchase_order_number === 'string' && sa.purchase_order_number && (
                <InfoRow label="No. Orden de Compra" value={sa.purchase_order_number as string} />
              )}
              {typeof sa.why_not_buying === 'string' && sa.why_not_buying && (
                <div className="col-span-2">
                  <span className="text-sm font-medium text-gray-500">Razón de no compra</span>
                  <p className="text-sm text-gray-900">{sa.why_not_buying as string}</p>
                </div>
              )}
              {typeof sa.purchase_inventory_notes === 'string' && sa.purchase_inventory_notes && (
                <div className="col-span-2 md:col-span-4">
                  <span className="text-sm font-medium text-gray-500">Notas</span>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{sa.purchase_inventory_notes as string}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptySection message="Sin datos recopilados" />
          )}

          <EvidenceGrid evidence={evidence} stage="inventory" />
        </div>
      </Card>

      {/* Stage 3: Comunicación y POP */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">3</span>
            <SectionTitle>Comunicación y POP</SectionTitle>
            {!!sa?.stage3_completed_at && (
              <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Completada</span>
            )}
          </div>

          {popMaterialChecks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Materiales POP</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Material</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Presente</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Condición</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {popMaterialChecks.map((pm) => (
                      <tr key={pm.id as string}>
                        <td className="px-4 py-2 text-gray-900">{pm.material_name as string}</td>
                        <td className="px-4 py-2 text-center">
                          {pm.is_present ? (
                            <span className="text-green-600">Sí</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {pm.condition ? conditionLabels[pm.condition as string] || (pm.condition as string) : '—'}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{(pm.notes as string) || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {exhibitionChecks.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Exhibiciones</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Exhibición</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Ejecutada</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Calidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {exhibitionChecks.map((ec) => (
                      <tr key={ec.id as string}>
                        <td className="px-4 py-2 text-gray-900">{ec.exhibition_name as string}</td>
                        <td className="px-4 py-2 text-center">
                          {ec.is_executed ? (
                            <span className="text-green-600">Sí</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">{(ec.execution_quality as string) || '—'}</td>
                        <td className="px-4 py-2 text-gray-700">{(ec.notes as string) || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {popMaterialChecks.length === 0 && exhibitionChecks.length === 0 && (
            <EmptySection message="Sin datos recopilados" />
          )}

          {sa?.communication_compliance !== undefined && sa?.communication_compliance !== null && (
            <div className="mt-4">
              <InfoRow label="Cumplimiento de comunicación" value={`${sa.communication_compliance}%`} />
            </div>
          )}

          {typeof sa?.pop_execution_notes === 'string' && sa.pop_execution_notes && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Notas</span>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{sa.pop_execution_notes as string}</p>
            </div>
          )}

          <EvidenceGrid evidence={evidence} stage="communication" />
        </div>
      </Card>

      {/* Orders */}
      <Card>
        <div className="p-6">
          <SectionTitle>Pedidos</SectionTitle>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, orderIdx) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {order.order_number || `Pedido ${orderIdx + 1}`}
                      </span>
                      <OrderStatusBadge status={order.order_status} />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                    {order.distributor_name && (
                      <InfoRow label="Distribuidor" value={order.distributor_name} />
                    )}
                    <InfoRow label="Método de pago" value={paymentMethodLabels[order.payment_method || ''] || order.payment_method} />
                    <InfoRow label="Fecha" value={new Date(order.created_at).toLocaleDateString('es-MX')} />
                  </div>

                  {order.order_notes && (
                    <p className="text-sm text-gray-600 italic mb-3">{order.order_notes}</p>
                  )}

                  {order.items.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Producto</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Precio Unit.</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-gray-900">{item.product_name}</td>
                              <td className="px-3 py-2 text-right">{item.quantity}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                              <td className="px-3 py-2 text-right">{formatCurrency(item.quantity * item.unit_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptySection message="Sin pedidos registrados" />
          )}
        </div>
      </Card>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { style: string; label: string }> = {
    draft: { style: 'bg-gray-100 text-gray-800', label: 'Borrador' },
    confirmed: { style: 'bg-blue-100 text-blue-800', label: 'Confirmado' },
    delivered: { style: 'bg-green-100 text-green-800', label: 'Entregado' },
    cancelled: { style: 'bg-red-100 text-red-800', label: 'Cancelado' },
  }
  const c = config[status] || { style: 'bg-gray-100 text-gray-800', label: status }
  return (
    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${c.style}`}>
      {c.label}
    </span>
  )
}
