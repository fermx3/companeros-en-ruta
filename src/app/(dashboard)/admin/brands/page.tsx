'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LoadingSpinner, EmptyState, Alert } from '@/components/ui/feedback';
import { adminService } from '@/lib/services/adminService';
import type { Brand } from '@/lib/types/admin';
import { usePageTitle } from '@/hooks/usePageTitle';

/**
 * Lista de brands con funciones de gestión
 */
export default function BrandsListPage() {
  usePageTitle('Marcas');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminService.getBrands(page, 10);
        setBrands(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error loading brands:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar las brands';
        setError(`Error al cargar brands: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page]);

  const loadBrands = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getBrands(page, 10);
      setBrands(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error reloading brands:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al recargar las brands';
      setError(`Error al recargar brands: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta brand? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(brandId);

    try {
      const response = await adminService.deleteBrand(brandId);

      if (response.error) {
        alert(`Error: ${response.error}`);
      } else {
        alert(response.message || 'Brand eliminada exitosamente');
        await loadBrands(); // Recargar la lista
      }
    } catch (err) {
      console.error('Error deleting brand (catch):', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      alert(`Error al eliminar la brand: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusToggle = async (brandId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await adminService.updateBrand(brandId, { status: newStatus });

      if (response.error) {
        alert(response.error);
      } else {
        await loadBrands(); // Recargar la lista
      }
    } catch (err) {
      console.error('Error updating brand status:', err);
      alert('Error al cambiar el estado de la brand');
    }
  };

  if (loading && brands.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link href="/admin" className="text-gray-400 hover:text-gray-500">
                      Admin
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-900 font-medium">Brands</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Gestión de Brands
              </h1>
              <p className="text-gray-600 mt-1">
                Administra las marcas de tu tenant
              </p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={loadBrands} variant="outline" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Actualizar
              </Button>
              <Link href="/admin/brands/create">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Brand
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Brands List */}
        {brands.length === 0 && !loading ? (
          <EmptyState
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            title="No hay brands registradas"
            description="Comienza creando tu primera brand para empezar a gestionar tu negocio."
            action={
              <Link href="/admin/brands/create">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primera Brand
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  onDelete={() => handleDelete(brand.id)}
                  onToggleStatus={() => handleStatusToggle(brand.id, brand.status)}
                  isDeleting={deleting === brand.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-6">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  variant="outline"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  variant="outline"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada card de brand
interface BrandCardProps {
  brand: Brand;
  onDelete: () => void;
  onToggleStatus: () => void;
  isDeleting: boolean;
}

function BrandCard({ brand, onDelete, onToggleStatus, isDeleting }: BrandCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: brand.brand_color_primary || '#3B82F6' }}
                >
                  {brand.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{brand.name}</h3>
                <p className="text-sm text-gray-500">{brand.public_id}</p>
              </div>
            </div>
          </div>
          <StatusBadge status={brand.status} size="sm" />
        </div>

        {/* Content */}
        <div className="mt-4">
          {brand.description && (
            <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
          )}

          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Slug:</span>
              <span className="font-mono">{brand.slug}</span>
            </div>
            {brand.contact_email && (
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{brand.contact_email}</span>
              </div>
            )}
            {brand.website && (
              <div className="flex justify-between">
                <span>Website:</span>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Ver sitio
                </a>
              </div>
            )}
            <div className="flex justify-between">
              <span>Creado:</span>
              <span>{formatDate(brand.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        {(brand.brand_color_primary || brand.brand_color_secondary) && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Colores de marca:</p>
            <div className="flex space-x-2">
              {brand.brand_color_primary && (
                <div
                  className="w-6 h-6 rounded border border-gray-200"
                  style={{ backgroundColor: brand.brand_color_primary }}
                  title={`Color primario: ${brand.brand_color_primary}`}
                />
              )}
              {brand.brand_color_secondary && (
                <div
                  className="w-6 h-6 rounded border border-gray-200"
                  style={{ backgroundColor: brand.brand_color_secondary }}
                  title={`Color secundario: ${brand.brand_color_secondary}`}
                />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link href={`/admin/brands/${brand.public_id}/edit`}>
              <Button size="sm" variant="outline">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleStatus}
            >
              {brand.status === 'active' ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            {isDeleting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
