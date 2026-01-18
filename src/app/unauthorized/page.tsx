'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Página de error para acceso denegado
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        <p className="text-gray-600 mb-6">
          No tienes permisos para acceder a esta página.
          Contacta al administrador si crees que esto es un error.
        </p>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">
              Volver a Iniciar Sesión
            </Button>
          </Link>

          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Ir al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
