'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/feedback';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidMxPhone } from '@/lib/utils/phone';
import { adminService } from '@/lib/services/adminService';
import type {
  Zone,
  Market,
  ClientType,
  CommercialStructure
} from '@/lib/types/admin';

interface ClientDetail {
  id: string;
  public_id: string;
  business_name: string;
  legal_name: string | null;
  owner_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  tax_id: string | null;
  zone_id: string;
  market_id: string;
  client_type_id: string;
  commercial_structure_id: string;
  address_street: string;
  address_neighborhood: string | null;
  address_city: string;
  address_state: string;
  address_postal_code: string | null;
  address_country: string;
  visit_frequency_days: number;
  assessment_frequency_days: number;
  payment_terms: string | null;
  minimum_order: number;
  credit_limit: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ClientEditForm {
  business_name: string;
  legal_name: string;
  owner_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  tax_id: string;
  zone_id: string;
  market_id: string;
  client_type_id: string;
  commercial_structure_id: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  address_country: string;
  visit_frequency_days: number;
  assessment_frequency_days: number;
  payment_terms: string;
  minimum_order: number;
  credit_limit: number;
  status: string;
}

/**
 * Formulario para editar un cliente existente
 * Permite al admin actualizar la información de un cliente
 */
export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.clientId as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos para los selectores
  const [zones, setZones] = useState<Zone[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [commercialStructures, setCommercialStructures] = useState<CommercialStructure[]>([]);
  const [originalClient, setOriginalClient] = useState<ClientDetail | null>(null);

  // Formulario
  const [formData, setFormData] = useState<ClientEditForm>({
    business_name: '',
    legal_name: '',
    owner_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    tax_id: '',
    zone_id: '',
    market_id: '',
    client_type_id: '',
    commercial_structure_id: '',
    address_street: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country: '',
    visit_frequency_days: 30,
    assessment_frequency_days: 30,
    payment_terms: '',
    minimum_order: 1,
    credit_limit: 0,
    status: 'active'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    setError(null);
    try {
      // Cargar datos en paralelo
      const [client, zonesData, marketsData, clientTypesData, commercialStructuresData] = await Promise.all([
        fetch(`/api/admin/clients/${clientId}`).then(r => {
          if (!r.ok) throw new Error('Cliente no encontrado');
          return r.json();
        }),
        adminService.getZones(),
        adminService.getMarkets(),
        adminService.getClientTypes(),
        adminService.getCommercialStructures()
      ]);

      const clientData = client.data;
      setOriginalClient(clientData);

      // Prellenar formulario con datos del cliente
      setFormData({
        business_name: clientData.business_name || '',
        legal_name: clientData.legal_name || '',
        owner_name: clientData.owner_name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        whatsapp: clientData.whatsapp || '',
        tax_id: clientData.tax_id || '',
        zone_id: clientData.zone_id || '',
        market_id: clientData.market_id || '',
        client_type_id: clientData.client_type_id || '',
        commercial_structure_id: clientData.commercial_structure_id || '',
        address_street: clientData.address_street || '',
        address_neighborhood: clientData.address_neighborhood || '',
        address_city: clientData.address_city || '',
        address_state: clientData.address_state || '',
        address_postal_code: clientData.address_postal_code || '',
        address_country: clientData.address_country || 'MX',
        visit_frequency_days: clientData.visit_frequency_days || 30,
        assessment_frequency_days: clientData.assessment_frequency_days || 30,
        payment_terms: clientData.payment_terms || '',
        minimum_order: clientData.minimum_order || 1,
        credit_limit: clientData.credit_limit || 0,
        status: clientData.status || 'active'
      });

      setZones(zonesData);
      setMarkets(marketsData);
      setClientTypes(clientTypesData);
      setCommercialStructures(commercialStructuresData);
    } catch (err) {
      console.error('Error loading client data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar datos: ${errorMessage}`);
    } finally {
      setInitialLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      loadInitialData();
    }
  }, [clientId, loadInitialData]);

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Campos requeridos
    if (!formData.business_name.trim()) {
      errors.business_name = 'El nombre del negocio es requerido';
    }
    if (!formData.owner_name.trim()) {
      errors.owner_name = 'El nombre del propietario es requerido';
    }
    if (!formData.zone_id) {
      errors.zone_id = 'La zona es requerida';
    }
    if (!formData.market_id) {
      errors.market_id = 'El mercado es requerido';
    }
    if (!formData.client_type_id) {
      errors.client_type_id = 'El tipo de cliente es requerido';
    }
    if (!formData.commercial_structure_id) {
      errors.commercial_structure_id = 'La estructura comercial es requerida';
    }
    if (!formData.address_street.trim()) {
      errors.address_street = 'La dirección es requerida';
    }
    if (!formData.address_city.trim()) {
      errors.address_city = 'La ciudad es requerida';
    }
    if (!formData.address_state.trim()) {
      errors.address_state = 'El estado es requerido';
    }
    if (!formData.address_country.trim()) {
      errors.address_country = 'El país es requerido';
    }

    // Validaciones de email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validaciones de teléfono
    if (!isValidMxPhone(formData.phone)) {
      errors.phone = 'El teléfono debe tener 10 dígitos';
    }
    if (!isValidMxPhone(formData.whatsapp)) {
      errors.whatsapp = 'El WhatsApp debe tener 10 dígitos';
    }

    // Validaciones de números
    if (formData.visit_frequency_days < 1) {
      errors.visit_frequency_days = 'La frecuencia de visitas debe ser mayor a 0';
    }
    if (formData.assessment_frequency_days < 1) {
      errors.assessment_frequency_days = 'La frecuencia de evaluación debe ser mayor a 0';
    }
    if (formData.minimum_order < 1) {
      errors.minimum_order = 'El pedido mínimo debe ser mayor a 0';
    }
    if (formData.credit_limit < 0) {
      errors.credit_limit = 'El límite de crédito no puede ser negativo';
    }

    return errors;
  };

  const handleInputChange = (field: keyof ClientEditForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error de este campo si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el cliente');
      }

      // Redirigir a la página de detalle del cliente
      router.push(`/admin/clients/${clientId}`);
    } catch (err) {
      console.error('Error updating client:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al actualizar cliente: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  if (error && !originalClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/admin/clients">
            <Button variant="outline">Volver a Clientes</Button>
          </Link>
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
                      <Link href="/admin/clients" className="ml-4 text-gray-400 hover:text-gray-500">
                        Clientes
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <Link href={`/admin/clients/${clientId}`} className="ml-4 text-gray-400 hover:text-gray-500">
                        {originalClient?.business_name}
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-500">Editar</span>
                    </div>
                  </li>
                </ol>
              </nav>
              <h1 className="text-2xl font-bold text-gray-900 mt-2">
                Editar Cliente: {originalClient?.business_name}
              </h1>
              <p className="text-gray-600 mt-1">Actualiza la información del cliente</p>
            </div>
            <div className="flex space-x-3">
              <Link href={`/admin/clients/${clientId}`}>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.business_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del negocio"
                  />
                  {validationErrors.business_name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.business_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    value={formData.legal_name}
                    onChange={(e) => handleInputChange('legal_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Razón social"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Propietario *
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) => handleInputChange('owner_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.owner_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre del propietario"
                  />
                  {validationErrors.owner_name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.owner_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RFC/Tax ID
                  </label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => handleInputChange('tax_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="RFC o Tax ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="pending">Pendiente</option>
                    <option value="suspended">Suspendido</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@ejemplo.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                <PhoneInput
                  value={formData.phone}
                  onChange={(digits) => handleInputChange('phone', digits)}
                  label="Teléfono"
                  id="phone"
                  error={validationErrors.phone}
                />

                <PhoneInput
                  value={formData.whatsapp}
                  onChange={(digits) => handleInputChange('whatsapp', digits)}
                  label="WhatsApp"
                  id="whatsapp"
                  error={validationErrors.whatsapp}
                />
              </div>
            </div>
          </Card>

          {/* Ubicación */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={formData.address_street}
                    onChange={(e) => handleInputChange('address_street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.address_street ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Calle y número"
                  />
                  {validationErrors.address_street && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address_street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colonia
                    </label>
                    <input
                      type="text"
                      value={formData.address_neighborhood}
                      onChange={(e) => handleInputChange('address_neighborhood', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Colonia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={formData.address_city}
                      onChange={(e) => handleInputChange('address_city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.address_city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Ciudad"
                    />
                    {validationErrors.address_city && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.address_city}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      value={formData.address_state}
                      onChange={(e) => handleInputChange('address_state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.address_state ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar estado</option>
                      <option value="AG">Aguascalientes</option>
                      <option value="BC">Baja California</option>
                      <option value="BS">Baja California Sur</option>
                      <option value="CM">Campeche</option>
                      <option value="CO">Coahuila</option>
                      <option value="CL">Colima</option>
                      <option value="CS">Chiapas</option>
                      <option value="CH">Chihuahua</option>
                      <option value="DF">Ciudad de México</option>
                      <option value="DG">Durango</option>
                      <option value="GT">Guanajuato</option>
                      <option value="GR">Guerrero</option>
                      <option value="HG">Hidalgo</option>
                      <option value="JA">Jalisco</option>
                      <option value="MX">Estado de México</option>
                      <option value="MI">Michoacán</option>
                      <option value="MO">Morelos</option>
                      <option value="NA">Nayarit</option>
                      <option value="NL">Nuevo León</option>
                      <option value="OA">Oaxaca</option>
                      <option value="PU">Puebla</option>
                      <option value="QT">Querétaro</option>
                      <option value="QR">Quintana Roo</option>
                      <option value="SL">San Luis Potosí</option>
                      <option value="SI">Sinaloa</option>
                      <option value="SO">Sonora</option>
                      <option value="TB">Tabasco</option>
                      <option value="TM">Tamaulipas</option>
                      <option value="TL">Tlaxcala</option>
                      <option value="VE">Veracruz</option>
                      <option value="YU">Yucatán</option>
                      <option value="ZA">Zacatecas</option>
                    </select>
                    {validationErrors.address_state && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.address_state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={formData.address_postal_code}
                      onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País *
                    </label>
                    <select
                      value={formData.address_country}
                      onChange={(e) => handleInputChange('address_country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MX">México</option>
                      <option value="US">Estados Unidos</option>
                      <option value="CA">Canadá</option>
                      <option value="GT">Guatemala</option>
                      <option value="BZ">Belice</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Segmentación */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Segmentación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona *
                  </label>
                  <select
                    value={formData.zone_id}
                    onChange={(e) => handleInputChange('zone_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.zone_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar zona</option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.zone_id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.zone_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mercado *
                  </label>
                  <select
                    value={formData.market_id}
                    onChange={(e) => handleInputChange('market_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.market_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar mercado</option>
                    {markets.map(market => (
                      <option key={market.id} value={market.id}>
                        {market.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.market_id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.market_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cliente *
                  </label>
                  <select
                    value={formData.client_type_id}
                    onChange={(e) => handleInputChange('client_type_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.client_type_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar tipo</option>
                    {clientTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.client_type_id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.client_type_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estructura Comercial *
                  </label>
                  <select
                    value={formData.commercial_structure_id}
                    onChange={(e) => handleInputChange('commercial_structure_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.commercial_structure_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar estructura</option>
                    {commercialStructures.map(structure => (
                      <option key={structure.id} value={structure.id}>
                        {structure.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.commercial_structure_id && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.commercial_structure_id}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Configuración Comercial */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Comercial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Visitas (días) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.visit_frequency_days}
                    onChange={(e) => handleInputChange('visit_frequency_days', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.visit_frequency_days ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.visit_frequency_days && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.visit_frequency_days}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Evaluación (días) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.assessment_frequency_days}
                    onChange={(e) => handleInputChange('assessment_frequency_days', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.assessment_frequency_days ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.assessment_frequency_days && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.assessment_frequency_days}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pedido Mínimo *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={formData.minimum_order}
                    onChange={(e) => handleInputChange('minimum_order', parseFloat(e.target.value) || 1)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.minimum_order ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.minimum_order && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.minimum_order}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Límite de Crédito
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={(e) => handleInputChange('credit_limit', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.credit_limit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.credit_limit && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.credit_limit}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Términos de Pago
                  </label>
                  <textarea
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ejemplo: 30 días neto, descuento 2% por pago anticipado"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3">
            <Link href={`/admin/clients/${clientId}`}>
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Cliente'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
