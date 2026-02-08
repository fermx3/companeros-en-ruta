'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

/**
 * Pagina de ordenes del Asesor de Ventas
 * TODO: Implementar listado de ordenes (TASK-002c)
 */
export default function AsesorVentasOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Ordenes</h1>
                <p className="text-gray-600">Gestiona tus ordenes de compra</p>
              </div>
              <div className="flex space-x-2">
                <Link href="/asesor-ventas">
                  <Button variant="outline" size="sm">
                    Volver
                  </Button>
                </Link>
                <Link href="/asesor-ventas/orders/create">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Nueva Orden
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Modulo de Ordenes</h3>
            <p className="text-gray-500 mb-4">
              Esta funcionalidad esta en desarrollo (TASK-002c).
            </p>
            <p className="text-sm text-gray-400">
              Aqui podras ver el historial de ordenes, crear nuevas ordenes y dar seguimiento.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
