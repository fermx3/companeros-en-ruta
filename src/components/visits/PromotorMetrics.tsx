'use client'

import { Card, CardContent } from '../ui/Card'

interface PromotorMetricsProps {
  metrics: {
    totalClients: number
    monthlyQuota: number
    completedVisits: number
    effectiveness: number
  }
}

export function PromotorMetrics({ metrics }: PromotorMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.monthlyQuota}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Cuota del mes
            </div>
            <div className="text-xs text-gray-400">
              No hay cuota asignada
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.completedVisits}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Avance de compra
            </div>
            <div className="text-xs text-gray-400">
              0 cajas
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.effectiveness.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              % de avance de compra
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.totalClients}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Clientes totales
            </div>
            <div className="text-xs text-gray-400">
              No hay promociones
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
