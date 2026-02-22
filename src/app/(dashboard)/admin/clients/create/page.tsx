'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { usePageTitle } from '@/hooks/usePageTitle';

interface ClientCreateForm {
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
}

/**
 * Formulario para crear un nuevo cliente
 * Permite al admin registrar un nuevo cliente con toda su información
 */
export default function CreateClientPage() {
  usePageTitle('Crear Cliente');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Datos para los selectores
  const [zones, setZones] = useState<Zone[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [commercialStructures, setCommercialStructures] = useState<CommercialStructure[]>([]);

  // Formulario
  const [formData, setFormData] = useState<ClientCreateForm>({
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
    address_country: 'MX',
    visit_frequency_days: 30,
    assessment_frequency_days: 30,
    payment_terms: '',
    minimum_order: 0,
    credit_limit: 0
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [zonesData, marketsData, clientTypesData, commercialStructuresData] = await Promise.all([
        adminService.getZones(),
        adminService.getMarkets(),
        adminService.getClientTypes(),
        adminService.getCommercialStructures()
      ]);

      setZones(zonesData);
      setMarkets(marketsData);
      setClientTypes(clientTypesData);
      setCommercialStructures(commercialStructuresData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Error al cargar los datos del formulario');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClientCreateForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error de validación si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
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
    if (formData.minimum_order < 0) {
      errors.minimum_order = 'El pedido mínimo no puede ser negativo';
    }
    if (formData.credit_limit < 0) {
      errors.credit_limit = 'El límite de crédito no puede ser negativo';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Error de validación con detalles específicos
          const errors: Record<string, string> = {};
          result.details.forEach((detail: { field: string; message: string }) => {
            errors[detail.field] = detail.message;
          });
          setValidationErrors(errors);
          setError('Por favor corrige los errores en el formulario');
        } else {
          setError(result.error || 'Error al crear el cliente');
        }
        return;
      }

      // Éxito - redirigir a la lista de clientes
      router.push('/admin/clients');
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Error al crear el cliente. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crear Cliente</h1>
              <p className="text-sm text-gray-600 mt-1">
                Registra un nuevo cliente en el sistema
              </p>
            </div>
            <Link href="/admin/clients">
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
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
                    placeholder="Ej: Abarrotes La Esquina"
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
                    placeholder="Nombre legal de la empresa"
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
                    placeholder="Nombre completo del dueño"
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
                    placeholder="RFC o identificación fiscal"
                  />
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
                    placeholder="correo@ejemplo.com"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Calle, número y referencias"
                  />
                  {validationErrors.address_street && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.address_street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia/Barrio
                  </label>
                  <input
                    type="text"
                    value={formData.address_neighborhood}
                    onChange={(e) => handleInputChange('address_neighborhood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre de la colonia"
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
                    {zones.map((zone) => (
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
                    {markets.map((market) => (
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
                    {clientTypes.map((type) => (
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
                    {commercialStructures.map((structure) => (
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
                    Frecuencia de Visitas (días)
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
                    Frecuencia de Evaluación (días)
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
                    Términos de Pago
                  </label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Contado, 30 días, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pedido Mínimo ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_order}
                    onChange={(e) => handleInputChange('minimum_order', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.minimum_order ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.minimum_order && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.minimum_order}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Límite de Crédito ($)
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
              </div>
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link href="/admin/clients">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
