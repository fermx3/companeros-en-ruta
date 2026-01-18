import React from 'react';

/**
 * Layout para el panel de Marca
 * La validación de permisos se maneja en la página raíz para evitar bucles de redirección
 */
export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación específica de marca - se puede agregar aquí */}
      <main>{children}</main>
    </div>
  );
}
