# MVP Status - Compañeros en Ruta

**Last Updated:** 2026-02-17
**Target:** Implementación requerimientos PerfectApp según especificaciones cliente

---

## Quick Summary

### Estructura de Roles (6 Roles Totales)

| Rol | Estado Actual | Cambio Requerido | Ready for Testing |
|-----|---------------|------------------|-------------------|
| Admin | ✅ Protegido con useRequireRole | Sin cambios | Yes |
| Brand Manager | ✅ Protegido con useRequireRole | ✅ Client detail/edit/visits + /brand/visits implementados | Yes |
| Supervisor | ✅ Protegido + UI condicional roles | ✅ team, team/[id], clients, visits, reports implementados | Yes |
| **Promotor** | ✅ Assessment Wizard + useRequireRole | Assessment 3 secciones completo | Ready |
| **Asesor de Ventas** | ✅ Implementado + useRequireRole | Dashboard, Órdenes, QR, Historial, Billing | Ready |
| Client (M&P) | ✅ QR con Promociones + useRequireRole | QR generado, selección promociones, tracking | Ready |

### Sistemas Core

| Sistema | Estado Actual | Requerido | Gap |
|---------|---------------|-----------|-----|
| Brand Affiliation | Complete | Complete | None |
| Tier System | Complete | Complete | None |
| Points System | Complete | Complete | None |
| **Auth & Role Guards** | ✅ Complete | useRequireRole hook + all 6 layouts | None |
| **Sistema QR** | ✅ Completo | Generación + Escaneo + Redención + Billing | None |
| **Promociones UI** | ✅ Formulario + Workflow | Formulario + Banners + Aprobación Admin + Targeting | Targeting/segmentación (TASK-022, depende REQ-044) |
| **Carga Evidencia** | ✅ Complete | PhotoEvidenceUpload con GPS, integrado en wizard | None |
| **Flujo Visita Assessment** | ✅ Wizard 3 secciones | 3 secciones assessment | None |
| **Notificaciones** | ✅ Completo | In-app Bell + API + integrado en 8 flujos | None |
| **Encuestas** | ✅ Completo | Schema + Builder + Aprobación + Segmentación + Form + Resultados | None |

**Overall MVP Progress:** ~99% P0 features | ~88% total (incluyendo P1 y polish)
**Audit Status:** 31 hallazgos documentados (1 P0 pendiente, 15 P1, 8 P2) across 6 perfiles — 71/82 páginas funcionales, 85/85 APIs OK
**Cambios 2026-02-17:** SUPV-001/002/003 ✅, ADMIN-002 ✅, BRAND-001/002/003 ✅ (commits fd4b58b, c0fdfb5, 1f56248)

---

## Requerimientos del Cliente (PerfectApp)

### SUPUESTOS (SUP)

| ID | Supuesto |
|----|----------|
| SUP-001 | Supabase Storage soporta uploads de archivos para evidencia |
| SUP-002 | QR se generará con librería client-side (qrcode.react) |
| SUP-003 | WhatsApp/SMS requiere servicio tercero (Twilio) - diferido P2 |
| SUP-004 | **CONFIRMADO:** Promotor = Advisor renombrado (mismas funciones + assessment) |
| SUP-005 | **CONFIRMADO:** Asesor de Ventas = ROL NUEVO para distribuidores (Vender + Documentar + Validar promociones + QR "Entregar Promoción") |
| SUP-006 | Diseño mobile-responsive es suficiente; app nativa no requerida MVP |
| SUP-007 | Email via Supabase Auth email o Resend |
| SUP-008 | GPS disponible via browser Geolocation API |
| SUP-009 | Cámara via browser MediaDevices API |
| SUP-010 | Arquitectura multi-tenant (tenant_id) se mantiene |
| SUP-011 | **CONFIRMADO:** Assessment se integra dentro del flujo check-in/check-out existente |
| SUP-012 | **CONFIRMADO:** Marcas/sub-marcas del assessment son configurables por Brand Manager |
| SUP-013 | **CONFIRMADO:** Asesor de Ventas trabaja para distribuidores (entidades externas no controladas) |
| SUP-014 | **CONFIRMADO:** QRs canjeados deben trackear data para facturación distribuidor→marca |
| SUP-015 | **CONFIRMADO:** Supervisor tiene roles activos configurables (puede tener Promotor, AdV, ambos, o ninguno) |
| SUP-016 | **CONFIRMADO:** Promotor puede cargar pedidos desde la visita |
| SUP-017 | **CONFIRMADO:** Asesor de Ventas puede cargar pedidos desde módulo especial |
| SUP-018 | **CONFIRMADO:** Supervisor se maneja via roles asignados (sin función especial, solo UI condicional) |
| SUP-019 | **CONFIRMADO:** Admin hace validación 48 hrs de promociones (ordenar datos, copys, material gráfico) |
| SUP-020 | **CONFIRMADO:** Sistema Encuestas es SEPARADO del Assessment 7Ps de visitas |
| SUP-021 | **CONFIRMADO:** Encuestas: Brand crea → Admin aprueba → Circulación con segmentación |
| SUP-022 | **CONFIRMADO:** Cliente genera QR → Asesor de Ventas canjea |
| SUP-023 | **CONFIRMADO:** Múltiples distribuidores visitan cliente - primero en escanear redime |
| SUP-024 | **CONFIRMADO:** Promociones pueden ser multi-uso (max_redemptions configurable) |
| SUP-025 | **CONFIRMADO:** Se creará tabla distributors y campo user_profiles.distributor_id |
| SUP-026 | **CONFIRMADO:** Por ahora un Asesor de Ventas solo puede pertenecer a 1 distribuidor |

### PREGUNTAS ABIERTAS (Q)

| ID | Pregunta | Prioridad | Estado |
|----|----------|-----------|--------|
| ~~Q-001~~ | ~~¿Promotor es rol nuevo o extensión de Advisor?~~ | ~~Alta~~ | RESPONDIDO: Renombrar |
| ~~Q-002~~ | ~~¿Quién aprueba promociones en workflow 48 horas?~~ | ~~Alta~~ | RESPONDIDO: Admin |
| Q-003 | ¿Qué proveedor WhatsApp/SMS usar? Twilio, MessageBird, otro? | Media | Pendiente |
| Q-004 | ¿QR estáticos o dinámicos (regenerados por transacción)? | Alta | Pendiente |
| ~~Q-005~~ | ~~¿Cuáles son los 7 Ps específicos a recolectar?~~ | ~~Alta~~ | RESPONDIDO: Ver screenshots |
| Q-006 | ¿Fotos en Supabase Storage o CDN externo? | Media | Pendiente |
| Q-007 | ¿Máximo 6 loyalty plans es configurable o fijo? | Baja | Pendiente |
| Q-008 | ¿Chatbot custom o servicio como Dialogflow? | Media | Pendiente |
| ~~Q-009~~ | ~~¿Encuestas configurables por marca o templates sistema?~~ | ~~Media~~ | RESPONDIDO: Config por marca |
| Q-010 | ¿Ratio puntos-moneda para redención? | Media | Pendiente |
| Q-011 | ¿Cómo se gestiona facturación distribuidor→marca por QRs canjeados? | Alta | Pendiente |
| Q-012 | ¿Asesor de Ventas asignado a múltiples distribuidores o solo uno? | Media | Pendiente |

---

## Requerimientos por Módulo

### CORE PLATFORM

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-001 | **RENOMBRAR** Advisor → Promotor en DB, código y UI | PDF_A p.5-6 | P0 |
| REQ-001b | **NUEVO ROL** Asesor de Ventas - Vender, documentar, validar promociones, QR | PDF_A p.5-6 | P0 |
| REQ-001c | **TABLA** distributors - Catálogo de distribuidores (id, name, tenant_id, etc.) | Clarificación | P0 |
| REQ-001d | **CAMPO** user_profiles.distributor_id → Link a tabla distributors | Clarificación | P0 |
| REQ-002 | Infraestructura Storage - Buckets para evidencia y QR | PDF_A p.8, PDF_B p.5 | P0 |
| REQ-003 | Servicio Geolocalización - Hook reutilizable GPS | PDF_A p.8 | P1 |
| REQ-004 | Servicio Cámara - Componente captura con preview | PDF_B p.5 | P0 |

### MÓDULO MARCA (Brand)

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-010 | Dashboard KPIs - Volumen, Reach, Mix, Market Share, Precios | PDF_A p.12 | P1 |
| REQ-011 | Crear Promoción - Formulario complejo con targeting | PDF_A p.13-14 | P0 |
| REQ-012 | Workflow Aprobación - Cola validación 48 horas **por Admin** | PDF_A p.13, Clarificación | P0 |
| REQ-013 | Configurar Incentivos RTM/M&P | PDF_A p.6 | P1 |
| REQ-014 | Vista Performance Equipo | PDF_A p.8 | P1 |

### MÓDULO PROMOTOR (Renombrado de Advisor)

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-020 | Dashboard Promotor - Plan trabajo semanal | PDF_A p.6 | P0 |
| REQ-021 | Vista Campañas Asignadas | PDF_A p.6 | P0 |
| REQ-022 | **Flujo Visita con Assessment 3 Secciones** (integrado en check-in/out) | Screenshots | P0 |
| REQ-022a | Sección 1: Assessment Producto-Empaque-Precio por marca/sub-marca | Screenshot 01 | P0 |
| REQ-022b | Sección 2: Promoción del mes (inventario, orden compra, distribuidor) | Screenshot 02 | P0 |
| REQ-022c | Sección 3: Plan comunicación (materiales POP, exhibiciones) | Screenshot 03 | P0 |
| REQ-023 | Evidencia por sección - Fotos con GPS (precios, compra, comunicación) | Screenshots | P0 |
| REQ-024 | Calendario Plan Trabajo | PDF_A p.6 | P1 |
| REQ-025 | Configuración Assessment por Marca - Sub-marcas configurables | Clarificación | P0 |
| REQ-026 | **Carga de pedidos desde la visita** (dentro del flujo de visita) | Clarificación | P0 |

### MÓDULO ASESOR DE VENTAS (NUEVO ROL - Para Distribuidores)

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-030 | Dashboard Asesor de Ventas con clientes asignados | PDF_A p.6 | P0 |
| REQ-031 | **Módulo Órdenes** - Cargar pedidos/órdenes de compra | Clarificación | P0 |
| REQ-032 | **Módulo Cliente** - Acceso a perfil cliente para validar promociones | Clarificación | P0 |
| REQ-033 | **Módulo "Entregar Promoción"** - QR para descuento o material promocional | PDF_A p.14, Clarificación | P0 |
| REQ-034 | Documentar ejecución (similar a Promotor - visitas, evidencia) | Clarificación | P0 |
| REQ-035 | Historial de QRs canjeados con data para facturación distribuidor→marca | Clarificación | P0 |
| REQ-035b | Asociación Asesor de Ventas ↔ Distribuidor (via distributor_id) | Clarificación | P0 |

### MÓDULO SUPERVISOR (Via Roles)

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-036 | Mantiene funciones actuales de supervisión | Existente | P0 |
| REQ-037 | Detectar roles asignados al usuario (supervisor, promotor, asesor_de_ventas) | Clarificación | P0 |
| REQ-038 | UI condicional: mostrar botón módulo Promotor si tiene rol promotor | Clarificación | P0 |
| REQ-039 | UI condicional: mostrar botón módulo Asesor de Ventas si tiene rol asesor_de_ventas | Clarificación | P0 |

### MÓDULO M&P / CLIENTE (RTM / Punto de Venta)

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| ~~REQ-040~~ | ~~Home Rediseñado - Loyalty Plans, Promociones, Sugeridos~~ | PDF_B p.3-4 | ✅ DONE |
| ~~REQ-041~~ | ~~Loyalty Plans Display - Máximo 6 planes activos~~ | PDF_B p.3 | ✅ DONE |
| ~~REQ-042~~ | ~~Banner Promociones Semanales - 5 banners carrusel~~ | PDF_B p.3 | ✅ DONE |
| REQ-043 | Grid Productos Sugeridos - 8 productos | PDF_B p.3 | P1 |
| REQ-044 | Registro Extendido - Datos negocio + encuesta | PDF_B p.2 | P1 |
| ~~REQ-045~~ | ~~Display Tier Mejorado - Monedas + metas visuales~~ | PDF_B p.3 | ✅ DONE |
| REQ-046 | Descarga QR Personal - Generar QR para promociones | PDF_B p.3 | P0 |
| REQ-047 | Carga Evidencia - Upload fotos con cámara | PDF_B p.5 | P1 |
| REQ-048 | Sección Cupones/Email - QR con tracking estado | PDF_B p.6 | P1 |

### SISTEMA CÓDIGOS QR

**Flujo QR:**
```
Cliente genera QR → Asesor de Ventas (del distribuidor) escanea y canjea
                    ↓
           Múltiples distribuidores pueden visitar al cliente
                    ↓
           PRIMERO en escanear = PRIMERO en redimir
```

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-070 | Servicio Generación QR (Cliente genera) | PDF_A p.14, PDF_B p.3 | P0 |
| REQ-071 | Tabla qr_codes - Metadata, estado, historial de redenciones | PDF_A p.14 | P0 |
| REQ-071b | Tabla qr_redemptions - Trackear múltiples redenciones por QR | Clarificación | P0 |
| REQ-072 | Componente Escáner QR (Asesor de Ventas escanea) | PDF_A p.14 | P0 |
| REQ-073 | API Redención QR - Lógica "primero en escanear gana" | PDF_A p.14, Clarificación | P0 |
| REQ-074 | Tracking Estado QR - Pending, validated (parcial/total), expired | PDF_B p.6 | P0 |
| REQ-075 | Soporte promociones multi-uso (max_redemptions configurable) | Clarificación | P0 |
| REQ-075b | Cliente puede generar múltiples QRs activos (uno por promoción) | Requerimiento nuevo | P1 |

### SISTEMA PROMOCIONES/CAMPANAS

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-060 | Schema Promociones Extendido | PDF_A p.13-14 | P0 |
| REQ-061 | Tipos Promoción - %, monto fijo, puntos, producto gratis | PDF_A p.13 | P0 |
| REQ-062 | Motor Reglas Promoción | PDF_A p.13-14 | P1 |
| REQ-063 | Scheduling Promociones - Fechas inicio/fin | PDF_A p.13 | P0 |
| REQ-064 | Tracking Redención | PDF_A p.14 | P0 |

### SISTEMA NOTIFICACIONES

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-080 | Tabla Notificaciones | PDF_A p.14 | P0 |
| REQ-081 | Notificaciones In-App - Bell icon con badge | PDF_A p.6 | P0 |
| REQ-082 | Notificaciones Email | PDF_A p.14 | P1 |
| REQ-083 | Integración WhatsApp - Via Twilio/chatbot | PDF_A p.14-16 | P2 |
| REQ-084 | Integración SMS | PDF_A p.14 | P2 |

### SISTEMA EVIDENCIA/MEDIA

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-090 | Setup Supabase Storage - Buckets con RLS | PDF_B p.5 | P0 |
| REQ-091 | Componente Captura Foto - Interface cámara | PDF_B p.5 | P0 |
| REQ-092 | Servicio Upload Fotos - A Supabase Storage | PDF_B p.5 | P0 |
| REQ-093 | Metadata Evidencia - GPS, timestamp, device | PDF_B p.5 | P0 |

### SISTEMA ENCUESTAS (Separado del Assessment 7Ps)

**IMPORTANTE:** Este módulo es DIFERENTE al assessment de 7Ps que se hace en visitas.
- **Assessment 7Ps**: Se hace durante la visita (Secciones 1-3), es parte del flujo check-in/out
- **Encuestas**: Sistema independiente para encuestas configurables por marca con segmentación

**Flujo:**
1. Brand crea encuesta
2. Admin aprueba encuesta (validación)
3. Una vez aprobada, se pone en circulación con segmentación

| ID | Requerimiento | Fuente | Prioridad |
|----|---------------|--------|-----------|
| REQ-100 | Schema Surveys - Tablas surveys, questions, responses, segmentation | PDF_A p.15-16 | P0 |
| REQ-101 | Builder Encuestas - Brand crea surveys custom | PDF_A p.15 | P0 |
| REQ-102 | Workflow aprobación encuestas por Admin | Clarificación | P0 |
| REQ-103 | Segmentación encuestas (tipo usuario, zona, categoría) | Clarificación | P0 |
| REQ-104 | Componente SurveyForm | PDF_A p.15-16 | P0 |
| REQ-105 | Tipos Pregunta - Text, number, multiple choice, scale | PDF_A p.15 | P0 |

---

## Tareas Técnicas

### Semana 1: Fundación - Roles y Core (P0)

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-001 | ~~**RENOMBRAR** advisor → promotor en DB (enum, tablas, constraints)~~ | REQ-001 | 2 | - | **DONE** |
| TASK-001b | ~~**RENOMBRAR** advisor → promotor en código (routes, APIs, types)~~ | REQ-001 | 3 | TASK-001 | **DONE** |
| TASK-001c | ~~**RENOMBRAR** advisor → promotor en UI (labels, textos, navegación)~~ | REQ-001 | 2 | TASK-001b | **DONE** |
| TASK-002 | ~~**CREAR** rol asesor_de_ventas en DB (enum, migration)~~ | REQ-001b | 1 | - | **DONE** |
| TASK-002-dist | ~~**CREAR** tabla distributors (id, name, tenant_id, contact_info, etc.)~~ | REQ-001c | 2 | - | **DONE** |
| TASK-002-link | ~~**AGREGAR** columna distributor_id a user_profiles (FK a distributors)~~ | REQ-001d | 1 | TASK-002-dist | **DONE** |
| TASK-002b | ~~Crear route group /asesor-ventas con dashboard clientes asignados~~ | REQ-030 | 3 | TASK-002 | **DONE** |
| TASK-002c | ~~Crear módulo órdenes para Asesor de Ventas~~ | REQ-031 | 4 | TASK-002b | **DONE** |
| TASK-002d | ~~Crear módulo cliente (acceso perfil para validar promociones)~~ | REQ-032 | 3 | TASK-002b | **DONE** |
| TASK-002e | ~~Crear módulo "Entregar Promoción" (QR descuento/material)~~ | REQ-033 | 3 | TASK-013, TASK-002b | **DONE** |
| TASK-002f | ~~Implementar tracking QRs para facturación distribuidor→marca~~ | REQ-035 | 2 | TASK-002e | **DONE** |
| TASK-003 | ~~Actualizar middleware routing para ambos roles~~ | REQ-001, REQ-001b | 1 | TASK-001, TASK-002 | **DONE** (via useRequireRole en layouts) |
| TASK-004 | ~~Configurar Supabase Storage buckets (evidencia, qr)~~ | REQ-002, REQ-090 | 1 | - | **DONE** (migration + RLS policies for visit-evidence, brand-logos) |
| TASK-005 | ~~Crear hook useGeolocation~~ | REQ-003 | 1 | - | **DONE** (commit a6a46e8) |
| TASK-006 | ~~Crear componente CameraCapture con preview~~ | REQ-004, REQ-091 | 3 | - | **DONE** (integrado en PhotoEvidenceUpload via `<input capture="environment">`) |
| TASK-007 | ~~Crear servicio file upload a Supabase Storage~~ | REQ-092 | 2 | TASK-004 | **DONE** (inline en API routes evidence + logo) |
| TASK-010 | ~~Crear tabla qr_codes (migration) con max_redemptions~~ | REQ-071, REQ-075 | 2 | - | **DONE** |
| TASK-010b | ~~Crear tabla qr_redemptions (track múltiples redenciones)~~ | REQ-071b | 2 | TASK-010 | **DONE** |
| TASK-011 | ~~Crear servicio generación QR (qrcode.react)~~ | REQ-070 | 2 | TASK-010 | **DONE** |
| TASK-012 | ~~Crear componente QRCodeDisplay~~ | REQ-046 | 2 | TASK-011 | **DONE** |
| TASK-013 | ~~Crear componente QRScanner (html5-qrcode)~~ | REQ-072 | 3 | - | **DONE** |
| TASK-014 | ~~Crear API redención QR (lógica "primero en escanear gana" + multi-uso)~~ | REQ-073, REQ-075 | 4 | TASK-010, TASK-010b, TASK-013 | **DONE** |

### Semana 2: Promociones y Cliente (P0 Features)

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-020 | Extender schema promotions | REQ-060 | 2 | - |
| TASK-021 | ~~Crear formulario creación promoción~~ | REQ-011 | 5 | TASK-020 | **DONE** |
| TASK-022 | Crear UI targeting promoción | REQ-012, REQ-062 | 3 | TASK-021 |
| TASK-023 | ~~Crear workflow aprobación~~ | REQ-012 | 4 | TASK-020 | **DONE** |
| TASK-024 | Crear API redención promoción | REQ-064 | 3 | TASK-020, TASK-014 |
| TASK-025 | ~~Crear carrusel promociones semanales~~ | REQ-042 | 2 | TASK-020 | **DONE** (WeeklyPromotionsBanner component) |
| TASK-030 | ~~Rediseñar layout dashboard cliente~~ | REQ-040 | 4 | - | **DONE** |
| TASK-031 | ~~Crear componente LoyaltyPlansSection~~ | REQ-041 | 3 | - | **DONE** |
| TASK-032 | ~~Crear componente WeeklyPromotionsBanner~~ | REQ-042 | 2 | TASK-025 | **DONE** |
| TASK-033 | Crear componente SuggestedProductsGrid | REQ-043 | 2 | - |
| TASK-034 | ~~Crear página descarga QR personal~~ | REQ-046 | 2 | TASK-012 | **DONE** (client/qr/page.tsx) |

### Semana 3: Evidencia y Encuestas (P0-P1)

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-035 | ~~Crear componente EvidenceUpload~~ | REQ-047 | 3 | TASK-006, TASK-007 | **DONE** (implementado como PhotoEvidenceUpload) |
| TASK-036 | Crear componente CouponsSection | REQ-048 | 2 | TASK-014 |
| TASK-040 | ~~Crear tabla notifications~~ | REQ-080 | 1 | - | **DONE** |
| TASK-041 | ~~Crear componente NotificationBell~~ | REQ-081 | 2 | TASK-040 | **DONE** |
| TASK-042 | ~~Crear página lista notificaciones~~ | REQ-081 | 2 | TASK-040 | **DONE** |
| TASK-043 | Crear servicio email notifications | REQ-082 | 2 | TASK-040 |
| TASK-050 | ~~Crear schema DB surveys (con segmentación y status aprobación)~~ | REQ-100 | 3 | - | **DONE** |
| TASK-051 | ~~Crear builder encuestas para Brand~~ | REQ-101 | 4 | TASK-050 | **DONE** |
| TASK-052 | ~~Crear workflow aprobación encuestas por Admin~~ | REQ-102 | 3 | TASK-050 | **DONE** |
| TASK-053 | ~~Implementar segmentación encuestas (usuario, zona, categoría)~~ | REQ-103 | 3 | TASK-050 | **DONE** |
| TASK-054 | ~~Crear componente SurveyForm~~ | REQ-104 | 4 | TASK-050 | **DONE** |
| TASK-055 | ~~Crear API respuestas survey~~ | REQ-100 | 2 | TASK-050 | **DONE** |

### Semana 4: Flujo Visita Assessment y Polish

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-060 | Actualizar dashboard Promotor (antes Advisor) | REQ-020 | 2 | TASK-001c |
| TASK-061 | Crear vista campañas asignadas para Promotor | REQ-021 | 2 | TASK-020 |
| TASK-062 | Crear vista plan trabajo semanal | REQ-024 | 3 | TASK-060 |
| TASK-063 | ~~**VISITA Sección 1:** Assessment Producto-Empaque-Precio *(Wizard Step 1)*~~ | REQ-022a | 4 | TASK-006 | **DONE** |
| TASK-063b | ~~UI dinámica por marca/sub-marca + agregar competidor~~ | REQ-025 | 3 | TASK-063 | **DONE** |
| TASK-064 | ~~**VISITA Sección 2:** Promoción del mes (inventario, orden compra) *(Wizard Step 2)*~~ | REQ-022b | 3 | TASK-063 | **DONE** |
| TASK-065 | ~~**VISITA Sección 3:** Plan comunicación (materiales, exhibiciones) *(Wizard Step 3)*~~ | REQ-022c | 3 | TASK-064 | **DONE** |
| TASK-066 | ~~**Integrar 3 secciones como WIZARD SECUENCIAL** en flujo check-in/check-out~~ | REQ-022 | 3 | TASK-063, 064, 065 | **DONE** |
| TASK-066b | ~~Integrar carga de pedidos dentro del flujo de visita (Promotor)~~ | REQ-026 | 3 | TASK-066 | **DONE** |
| TASK-067 | ~~Brand Manager: Página productos + Configuración productos para assessment~~ | REQ-025 | 3 | - | **DONE** |
| TASK-070 | Integrar visitas/documentación en Asesor de Ventas | REQ-034 | 3 | TASK-002b |
| TASK-071 | ~~Supervisor: UI condicional basada en roles asignados (user_roles)~~ | REQ-037, REQ-038, REQ-039 | 2 | TASK-001c, TASK-002b | **DONE** |
| TASK-072 | Testing integración end-to-end | - | 3 | All |

### Backlog: Optimizaciones

| ID | Tarea | Descripción | Esfuerzo | Prioridad | Estado |
|----|-------|-------------|----------|-----------|--------|
| OPT-001 | Optimizar API `/api/asesor-ventas/orders` | Actualmente obtiene TODAS las órdenes para calcular resumen, luego pagina en JS. Separar en 2 queries: una para datos paginados y otra para summary. Reduce tiempo de 6-12s a <1s | 2 | Media | Pendiente |
| OPT-002 | ~~Optimizar API `/api/admin/metrics`~~ | ~~Traía TODAS las visitas y órdenes, luego filtraba en JS. Ahora usa filtros SQL `.gte('created_at', monthStart)` y `head: true` para counts. Llamadas paralelizadas en frontend.~~ | 1 | Alta | **DONE** |
| OPT-003 | Actividad reciente admin con Supabase Realtime | Actualmente `getRecentActivity()` hace queries compuestas (visits, orders, clients) on-load. Migrar a Supabase Realtime subscriptions para que el feed se actualice en tiempo real sin refresh. | 3 | Media | Pendiente |

### Backlog: UX/UI Enhancements

| ID | Tarea | Descripción | Esfuerzo | Prioridad | Estado |
|----|-------|-------------|----------|-----------|--------|
| UX-001 | ~~**Flujo Visita con Wizard Secuencial**~~ | ~~Implementar el flujo de visita (Assessment 3 secciones) como wizard multi-step similar al formulario de promociones. Incluye: (1) Progress indicator visual, (2) Validación por paso, (3) Botones Anterior/Siguiente, (4) Resumen final~~ | 4 | Alta | **DONE** |
| UX-001b | ~~**Integrar Wizard en Check-in/Check-out**~~ | ~~El wizard se integra dentro del flujo existente de visitas. Secuencia: Check-in → Sección 1 → Sección 2 → Sección 3 → Check-out. No permite check-out sin completar todas las secciones~~ | 3 | Alta | **DONE** |

---

## Evaluación Factibilidad 1 Mes

| Categoría | Factible 1 Mes | Notas |
|-----------|----------------|-------|
| Core Platform | Sí | Tasks baja complejidad |
| Sistema QR | Sí | Usando librerías existentes |
| Promociones Básico | Sí | Extender tabla existente |
| Dashboard Cliente | Sí | Trabajo UI-focused |
| Carga Evidencia | Sí | Browser APIs |
| Encuestas Básico | Sí | Formularios standard |
| Módulo Promotor | Parcial | Solo workflow básico |
| Notificaciones | Parcial | Solo in-app, WhatsApp P2 |
| Analytics Avanzado | No | Prioridad P2-P3 |
| Chatbot | No | Prioridad P3 |

**Recomendación:** Enfocarse en P0 (QR, Promociones, Home Cliente, Evidencia) para MVP. P1 en Mes 2. P2-P3 (WhatsApp, Analytics, Chatbot) Mes 3+.

---

## Trazabilidad Slide → REQ → TASK

| Slide PDF | Descripción | REQ | TASK |
|-----------|-------------|-----|------|
| PDF_A p.5-6 | 4 Perfiles definidos | REQ-001 | TASK-001, TASK-002, TASK-003 |
| PDF_A p.6 | Acciones Promotor | REQ-020 a REQ-024 | TASK-060 a TASK-064 |
| PDF_A p.6 | Acciones Asesor de Ventas | REQ-030 a REQ-035 | TASK-002b a TASK-002f, TASK-070 |
| PDF_A p.8 | Interacción flujo datos | REQ-003, REQ-093 | TASK-005 |
| PDF_A p.12 | Summary Dashboard KPIs | REQ-010 | (Fase 2) |
| PDF_A p.13-14 | Send Promotion form | REQ-011, REQ-012, REQ-060-064 | TASK-020 a TASK-025 |
| PDF_A p.14 | QR redemption flow | REQ-070-074 | TASK-010 a TASK-014 |
| PDF_A p.15-16 | Sistema Encuestas | REQ-100-105 | TASK-050 a TASK-055 |
| PDF_B p.2 | Data Contact extended | REQ-044 | (Fase 2) |
| PDF_B p.3-4 | Home Cliente RTM | REQ-040-046 | TASK-030 a TASK-034 |
| PDF_B p.5 | Cargar Evidencia | REQ-047, REQ-090-093 | TASK-035, TASK-004, TASK-006, TASK-007 |
| PDF_B p.6 | Email/Cupones | REQ-048 | TASK-036 |

---

## Archivos Críticos a Crear/Modificar

### RENOMBRAR (Advisor → Promotor)
```
/src/app/(dashboard)/asesor/ → /src/app/(dashboard)/promotor/
/src/app/api/asesor/ → /src/app/api/promotor/
/src/hooks/useVisits.ts (cambiar referencias)
/src/lib/types/visits.ts (cambiar referencias)
/supabase/migrations/YYYYMMDD_rename_advisor_to_promotor.sql
```

### NUEVO ROL (Asesor de Ventas - para Distribuidores)
```
/src/app/(dashboard)/asesor-ventas/
  - page.tsx (dashboard con clientes asignados)
  - clients/[clientId]/page.tsx (perfil cliente - validar promociones)
  - orders/page.tsx (módulo órdenes)
  - orders/create/page.tsx (crear pedido)
  - entregar-promocion/page.tsx (QR descuento/material promocional)
/src/app/api/asesor-ventas/
  - clients/route.ts (lista clientes asignados)
  - clients/[id]/route.ts (detalle cliente)
  - orders/route.ts (CRUD órdenes)
  - qr/deliver/route.ts (entregar promoción via QR)
  - qr/history/route.ts (historial para facturación)
```

### FLUJO VISITA (3 Secciones Assessment - WIZARD SECUENCIAL) ✅ IMPLEMENTADO
```
COMPONENTES CREADOS:
/src/components/visits/
  - VisitAssessmentWizard.tsx (orquestador del wizard 3 pasos)
  - WizardProgress.tsx (indicador de progreso visual)
  - AssessmentStage1.tsx (Pricing & Category Audit)
  - AssessmentStage2.tsx (Purchase, Inventory & Loyalty)
  - AssessmentStage3.tsx (Communication & POP Execution)
  - PhotoEvidenceUpload.tsx (captura de fotos con GPS)
  - CompetitorProductsForm.tsx (form precios competencia)
  - ClientPromotionsPanel.tsx (panel promociones disponibles)
  - OrderQuickAccess.tsx (acceso rápido a crear órdenes)
  - OrderModal.tsx (modal creación de órdenes)

/src/app/(dashboard)/promotor/visitas/[visitId]/
  - page.tsx (wizard integrado en check-in/check-out)

APIS CREADAS:
/src/app/api/promotor/visits/[id]/
  - assessment/route.ts (GET/POST/PUT assessment data)
  - orders/route.ts (órdenes de la visita)
/src/app/api/brand/
  - products/route.ts (productos de marca)
  - competitors/route.ts (competidores)
  - pop-materials/route.ts (materiales POP)
  - communication-plans/route.ts (planes comunicación)
  - exhibitions/route.ts (exhibiciones)
/src/app/api/client/[clientId]/
  - promotions/route.ts (promociones del cliente)

BRAND DASHBOARD PAGES:
/src/app/(dashboard)/brand/
  - competitors/page.tsx (gestión competidores)
  - pop-materials/page.tsx (gestión materiales POP)
  - communication-plans/page.tsx (planes comunicación)
  - exhibitions/page.tsx (exhibiciones)

FLUJO IMPLEMENTADO:
  Check-in → Stage 1 (Precios) → Stage 2 (Compra/Inventario) → Stage 3 (POP) → Check-out
  (No permite check-out sin completar todas las secciones)
```

### CONFIGURACIÓN PRODUCTOS PARA ASSESSMENT
```
/src/app/(dashboard)/brand/assessment-config/
  - page.tsx (configurar productos para assessment — toggle include_in_assessment)
  - Usa PUT /api/brand/products/[id] (no necesita API separada)
```

### DISTRIBUIDORES
```
/supabase/migrations/20260208_create_distributors.sql
/supabase/migrations/20260208_add_distributor_id_to_user_profiles.sql
```

### QR SYSTEM
```
/supabase/migrations/20260208_create_qr_codes.sql
/supabase/migrations/20260208_create_qr_redemptions.sql
/src/components/qr/QRCodeDisplay.tsx
/src/components/qr/QRScanner.tsx
/src/app/api/qr/generate/route.ts
/src/app/api/qr/redeem/route.ts
```

### CAMERA & EVIDENCE
```
/src/components/camera/CameraCapture.tsx
/src/components/evidence/EvidenceUpload.tsx
/src/hooks/useGeolocation.ts
/src/services/fileUpload.ts
```

### PROMOCIONES
```
/supabase/migrations/20260208_extend_promotions.sql
/src/app/(dashboard)/brand/promotions/
/src/app/api/promotions/route.ts
```

### NOTIFICACIONES
```
/supabase/migrations/20260210_create_notifications.sql
/src/components/notifications/NotificationBell.tsx
/src/app/api/notifications/route.ts
```

### CLIENTE (REDISEÑO HOME) ✅ IMPLEMENTADO
```
/src/app/(dashboard)/client/page.tsx (rediseñado - 6 secciones)
/src/components/client/TierProgressCard.tsx ✅
/src/components/client/LoyaltyPlansSection.tsx ✅
/src/components/client/WeeklyPromotionsBanner.tsx ✅
/src/components/client/SuggestedProductsGrid.tsx (P1 - pendiente)
```

---

## Verificación

Para validar la implementación:

1. **QR System:**
   - Cliente genera QR → Asesor escanea → Verificar redención
   - Probar "primero en escanear gana" con 2 asesores
   - Probar promoción multi-uso (max_redemptions > 1)
   - Verificar tracking para facturación distribuidor→marca
2. **Promociones:** Crear promoción → Workflow aprobación → Ver en cliente
3. **Evidencia:** Capturar foto → Upload → Ver en galería con GPS
4. **Encuestas:** Crear survey → Completar en visita → Ver resultados
5. **Notificaciones:** Crear promoción → Verificar notificación in-app
6. **Promotor:** Login → Ver dashboard → Completar assessment 3 secciones
7. **Asesor de Ventas:** Login → Ver clientes asignados → Crear orden → Entregar promoción vía QR → Verificar tracking para facturación

---

## Recent Fixes & Changes (2026-02-15 — 2026-02-17)

| Fix | Description | Commit |
|-----|-------------|--------|
| Auth race condition | `getSession()` + `onAuthStateChange(INITIAL_SESSION)` race caused empty roles to appear "ready". Fixed by deduplicating initialization paths. | `fcb42d0` |
| Client role detection | Client users have no `user_roles` entry. AuthProvider now checks `clients.user_id` as fallback for role resolution. | `fcb42d0` |
| Assessment PUT handler | Used wrong column name (`status` instead of `visit_status`) and missing RLS filters in assessment PUT route handler. | `f03ccaf` |
| Survey PUT empty update | `.update({}).select().single()` failed with "Cannot coerce to single JSON object" when only questions were sent. Now skips update when no survey-level fields changed. | `ba2ce7d` |
| Notification action_url 404 | Survey notification `action_url` was `/surveys/{id}` (no dashboard prefix), causing 404. NotificationBell now resolves relative URLs by prepending the current dashboard prefix from pathname. Works for all roles. | `0d0c695` |
| Admin mobile sidebar | Clicking a nav item in the mobile sidebar didn't close it, requiring manual dismiss. | `b72aa31` |
| Brand logo upload | Replaced URL field with Supabase Storage uploader (bucket `brand-logos`). Includes preview, type/size validation, and progress indicator. | `d05cb31` |
| Visit evidence save | PhotoEvidenceUpload was failing to save evidence records due to missing fields in the API insert. | `d05cb31` |
| Notification visit_completed URL | `action_url: '/supervisor'` didn't match the dashboard prefix regex (needs trailing `/`), causing brand managers to see `/brand/supervisor`. Fixed to `/supervisor/`. | `e5d25b4` |
| Brand manager wrong brand | Multi-brand managers saw data from arbitrary brand (`.find()` on `user_roles` returned first match). Centralized brand resolution via `resolveBrandAuth()`, migrated 28 API routes and 19 pages, added BrandSwitcher UI and `useBrandFetch` hook. Uses `is_primary` flag + localStorage persistence. | `b960556` |
| Extract useGeolocation hook | Consolidated geolocation logic from 3 files (PhotoEvidenceUpload, nueva visita, entregar-promocion) into reusable `useGeolocation` hook with `autoFetch` option. | `a6a46e8` |
| Evidence not loading on revisit | Evidence photos uploaded successfully but didn't show on page load — snake_case DB fields (`file_url`, `evidence_type`) weren't mapped to camelCase wizard fields (`fileUrl`, `evidenceType`). Added `mapEvidence()` mapper + broadened stage loading conditions. | `637ebf9` |
| Supervisor conditional nav | Supervisors with extra roles (promotor, asesor_de_ventas) now see module links in nav + "Mis Otros Módulos" dashboard card. Dynamic `navItems` via `useMemo` + `useAuth().userRoles`. | `92e67a8` |

---

## Auditoría: Panel de Administración — Cambios Pendientes

**Descubierto:** 2026-02-16
**Estado:** Documentado, pendiente de implementación

El panel de admin (`/admin`) tiene las funcionalidades core implementadas (users, brands, clients, surveys, promotions), pero una auditoría contra los requerimientos revela gaps funcionales: items faltantes en la navegación, páginas placeholder y features no implementados.

### ADMIN-P0 — Bugs / Gaps funcionales (bloquean flujo existente)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| ~~ADMIN-001~~ | ~~**Promociones sin link en sidebar**~~ | `src/app/(dashboard)/admin/layout.tsx` | ✅ **DONE** — Agregado link "Promociones" al sidebar (entre Encuestas y Configuración). |
| ADMIN-002 | **Zonas sin CRUD** — Las zonas (`zones`) se usan extensivamente en clients, supervisors y surveys como filtro/asignación, pero el admin no puede crear ni editar zonas — solo existen como datos seed en la DB. | Crear: `admin/zones/page.tsx`, `api/admin/zones/route.ts`, `api/admin/zones/[id]/route.ts` | Crear CRUD (list + create + edit + soft delete) + agregar link en sidebar nav. |
| ~~ADMIN-003~~ | ~~**Link "/admin/profile" causa 404**~~ | `src/app/(dashboard)/admin/profile/page.tsx` | ✅ **DONE** — Creada página de perfil admin (read-only: nombre, email, rol, fecha). |

### ADMIN-P1 — Features faltantes (no bloquean pero afectan completitud)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| ADMIN-004 | **Settings: placeholder "Página en Construcción"** — Muestra icono amarillo y texto placeholder, sin funcionalidad real. | `src/app/(dashboard)/admin/settings/page.tsx` | Implementar formulario GET/PUT contra `/api/admin/settings` que lea/escriba `tenants` table (nombre, email, teléfono, zona horaria, país). |
| ADMIN-005 | **Distribuidores sin CRUD** — `adminService.getDistributors()` existe y se usa en role assignment (asesor_de_ventas), pero no hay UI para crear/editar distribuidores. Si no existen distribuidores, no se puede asignar el rol asesor_de_ventas. | Crear: `admin/distributors/page.tsx`, `api/admin/distributors/route.ts`, `api/admin/distributors/[id]/route.ts` | Crear CRUD + agregar link en sidebar nav. |
| ADMIN-006 | **Catálogos sin administración (Markets, Client Types, Commercial Structures)** — Se usan como filtros/asignación en clientes pero no son administrables por el admin. | Crear: `admin/catalogs/page.tsx` + API routes para markets, client_types, commercial_structures | Página con tabs por catálogo, CRUD por cada uno. O bien secciones dentro de Settings. |
| ADMIN-007 | **Estadísticas de cliente: placeholders** — La sección de estadísticas (visitas, órdenes, última orden) en detalle de cliente muestra guiones "-" como placeholder. | `src/app/(dashboard)/admin/clients/[clientId]/page.tsx` | Queries reales contra `visits` y `orders` tables filtrando por `client_id`. |

### ADMIN-P2 — Nice to have (polish, no bloquean MVP)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| ADMIN-008 | **Editar perfil de usuario incompleto** — Admin puede ver usuario y gestionar roles, pero no puede editar campos como nombre, teléfono, posición desde la UI. | `src/app/(dashboard)/admin/users/[id]/page.tsx` | Asegurar que la página de detalle tenga modo edición completo con PUT al API. |
| ADMIN-009 | **Soft delete de clientes sin botón** — La API soporta soft delete pero la UI no tiene botón de eliminar/archivar. | `src/app/(dashboard)/admin/clients/[clientId]/page.tsx` | Agregar botón con confirmación modal. |
| ADMIN-010 | **Verificar preview de encuesta antes de aprobar** — La página carga `survey_questions` pero verificar que se rendericen como preview (read-only) antes de aprobar. | `src/app/(dashboard)/admin/surveys/[id]/page.tsx` | Verificar/implementar renderizado de preguntas como preview. |
| ADMIN-011 | **Indicador de ventana 48h en promociones** — REQ-012 menciona validación en 48 horas. No hay indicador visual de cuánto tiempo lleva pendiente una promoción. | `src/app/(dashboard)/admin/promotions/page.tsx` | Calcular `hours_pending = now - created_at` y mostrar badge de urgencia si > 24h. |

### Resumen de archivos a tocar

| ID | Acción | Archivos |
|----|--------|----------|
| ADMIN-001 | Editar | `admin/layout.tsx` — agregar Promociones al nav |
| ADMIN-002 | Crear | `admin/zones/page.tsx`, `api/admin/zones/route.ts`, `api/admin/zones/[id]/route.ts` |
| ADMIN-003 | Crear | `admin/profile/page.tsx` (o redirect) |
| ADMIN-004 | Reescribir | `admin/settings/page.tsx` + crear `api/admin/settings/route.ts` |
| ADMIN-005 | Crear | `admin/distributors/page.tsx`, `api/admin/distributors/route.ts`, `[id]/route.ts` |
| ADMIN-006 | Crear | `admin/catalogs/page.tsx` + API routes para markets, client_types, commercial_structures |
| ADMIN-007 | Editar | `admin/clients/[clientId]/page.tsx` — queries reales para stats |
| ADMIN-008 | Editar | `admin/users/[id]/page.tsx` — modo edición completo |
| ADMIN-009 | Editar | `admin/clients/[clientId]/page.tsx` — botón eliminar |
| ADMIN-010 | Verificar | `admin/surveys/[id]/page.tsx` — preview de preguntas |
| ADMIN-011 | Editar | `admin/promotions/page.tsx` — badge de urgencia |

### Criterios de verificación

1. Todos los links del sidebar navegan a páginas funcionales (no 404, no placeholder)
2. Admin puede crear zona, distribuidor, market, client type
3. Admin puede acceder a Promociones desde el sidebar
4. Settings muestra y guarda info del tenant
5. `npm run build` pasa sin errores

---

## Auditoría: Brand Manager — Cambios Pendientes

**Descubierto:** 2026-02-16
**Estado:** ✅ BRAND-001/002/003 RESUELTOS (2026-02-17, commit 1f56248) — BRAND-004/005 P1 pendientes
**Cobertura:** 21/21 páginas funcionales, 31/31 APIs

El perfil Brand Manager (`/brand`) tiene la mayoría de funcionalidades implementadas (dashboard, clients, reports, tiers, memberships, promotions, surveys, assessment config), pero presenta links rotos a páginas no creadas y datos mock que ocultan empty states.

### BRAND-P0 — Bugs / Gaps funcionales (bloquean flujo existente)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| BRAND-001 | **Links rotos en lista clientes** — "Ver Detalle", "Visitas", "Editar" llevan a 404. Las páginas `/brand/clients/[id]`, `/brand/clients/[id]/visits`, `/brand/clients/[id]/edit` NO existen. | `src/app/(dashboard)/brand/clients/page.tsx:409,418,428` | Crear 3 páginas: detail, visits, edit |
| BRAND-002 | **Mock clients fallback** — Cuando API retorna vacío, muestra 3 clientes hardcodeados (Supermercado Central, Tienda La Esquina, Distribuidora Regional) en vez de empty state. | `src/app/(dashboard)/brand/clients/page.tsx:69-111` | Remover mock data, usar EmptyState existente (línea 258) |
| BRAND-003 | **Quick action "Visitas" causa 404** — Dashboard tiene botón a `/brand/visits` que no existe. | `src/app/(dashboard)/brand/page.tsx:266` | Crear página o remover link |

### BRAND-P1 — Features faltantes (no bloquean pero afectan completitud)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| BRAND-004 | **Dashboard KPIs incompletos** (REQ-010) — Solo muestra 4 de 9 KPIs: faltan Volumen, Reach, Mix, Market Share, Price positioning. | `src/app/(dashboard)/brand/page.tsx:176-233`, `src/app/api/brand/metrics/route.ts` | Expandir métricas |
| BRAND-005 | **Team performance básico** (REQ-014) — Lista equipo pero sin rankings, métricas individuales, ni trends. | `src/app/(dashboard)/brand/team/page.tsx` | Agregar performance metrics |

### BRAND-P2 — Nice to have (polish, no bloquean MVP)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| BRAND-006 | **Incentivos RTM/M&P no implementados** (REQ-013) — No hay página ni API para configurar incentivos. | — | Crear página config incentivos |

### Resumen de archivos a tocar

| ID | Acción | Archivos |
|----|--------|----------|
| BRAND-001 | Crear | `brand/clients/[id]/page.tsx`, `brand/clients/[id]/visits/page.tsx`, `brand/clients/[id]/edit/page.tsx` |
| BRAND-002 | Editar | `brand/clients/page.tsx` — remover mock data lines 69-111 |
| BRAND-003 | Crear o Editar | `brand/visits/page.tsx` (crear) o `brand/page.tsx:266` (remover link) |
| BRAND-004 | Editar | `brand/page.tsx`, `api/brand/metrics/route.ts` — expandir KPIs |
| BRAND-005 | Editar | `brand/team/page.tsx` — agregar rankings y métricas individuales |
| BRAND-006 | Crear | `brand/incentives/page.tsx`, `api/brand/incentives/route.ts` |

### Criterios de verificación

1. Todos los links en `/brand/clients` navegan a páginas funcionales
2. Lista de clientes vacía muestra EmptyState, no datos mock
3. Quick action "Visitas" no produce 404
4. `npm run build` pasa sin errores

---

## Auditoría: Supervisor — Cambios Pendientes

**Descubierto:** 2026-02-16
**Estado:** ✅ SUPV-001/002/003 RESUELTOS (2026-02-17, commit fd4b58b) — SUPV-004/005 P1 pendientes
**Cobertura:** 6/6 páginas funcionales, 5/5 APIs

El perfil Supervisor (`/supervisor`) tiene solo el dashboard funcional. Las 5 páginas restantes del sidebar (team, clients, visits, reports) no existen, y todas las quick actions del dashboard llevan a 404.

### SUP-P0 — Bugs / Gaps funcionales (bloquean flujo existente)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| SUPV-001 | **5 de 6 links del sidebar son 404** — team, clients, visits, reports NO existen. Solo el dashboard funciona. | `src/lib/navigation-config.ts:91-101` | Crear las 4 páginas faltantes |
| SUPV-002 | **Quick actions del dashboard todos 404** — 4 botones (Visitas del Equipo, Clientes, Asignaciones, Reportes) llevan a páginas inexistentes. | `src/app/(dashboard)/supervisor/page.tsx:345-371` | Crear páginas o deshabilitar botones |
| SUPV-003 | **"Ver detalle" de equipo es 404** — Link a `/supervisor/team/{id}` no existe. | `src/app/(dashboard)/supervisor/page.tsx:312` | Crear `/supervisor/team/[id]/page.tsx` |

### SUP-P1 — Features faltantes (no bloquean pero afectan completitud)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| SUPV-004 | **"Asignaciones" no está en sidebar** — Botón quick action va a `/supervisor/assignments` pero no aparece en nav config. | `src/app/(dashboard)/supervisor/page.tsx:359` | Agregar a nav o remover botón |
| SUPV-005 | **API usa tabla posiblemente renombrada** — `client_assignments` puede haberse renombrado a `promotor_client_assignments` durante refactor advisor→promotor. | `src/app/api/supervisor/metrics/route.ts:104` | Verificar tabla en DB |

### Resumen de archivos a tocar

| ID | Acción | Archivos |
|----|--------|----------|
| SUPV-001 | Crear | `supervisor/team/page.tsx`, `supervisor/clients/page.tsx`, `supervisor/visits/page.tsx`, `supervisor/reports/page.tsx` + APIs correspondientes |
| SUPV-002 | Editar o Crear | Crear las 4 páginas destino o deshabilitar botones en `supervisor/page.tsx:345-371` |
| SUPV-003 | Crear | `supervisor/team/[id]/page.tsx` |
| SUPV-004 | Editar | `navigation-config.ts` (agregar) o `supervisor/page.tsx:359` (remover) |
| SUPV-005 | Verificar | `api/supervisor/metrics/route.ts:104` — verificar nombre tabla en DB |

### Criterios de verificación

1. Todos los links del sidebar navegan a páginas funcionales
2. Quick actions del dashboard no producen 404
3. "Ver detalle" de equipo navega a página funcional
4. Tabla `client_assignments` vs `promotor_client_assignments` verificada en DB
5. `npm run build` pasa sin errores

---

## Auditoría: Promotor — Cambios Pendientes

**Descubierto:** 2026-02-16
**Estado:** Documentado, pendiente de implementación
**Cobertura:** 8/8 páginas funcionales, 10/10 APIs

El perfil Promotor (`/promotor`) es el más completo — todas las páginas y APIs funcionan. Los hallazgos son features faltantes y inconsistencias de tipo.

### PROM-P1 — Features faltantes (no bloquean pero afectan completitud)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| PROM-001 | **Campañas asignadas no implementado** (REQ-021, TASK-061) — No hay página ni link en sidebar para ver campañas asignadas al promotor. | — | Crear `promotor/campaigns/page.tsx` + API + sidebar link |
| PROM-002 | **Reportes con stats hardcodeados** — "Desglose de Desempeño" muestra porcentajes estáticos (40%, 30%, 20%, 10%) en vez de datos calculados. | `src/app/(dashboard)/promotor/reports/page.tsx:390-405` | Implementar cálculo real |

### PROM-P2 — Nice to have (polish, no bloquean MVP)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| PROM-003 | **`full_name` field inconsistency** — Múltiples archivos usan `full_name` pero DB tiene `first_name`/`last_name`. API lo computa, pero type safety rota. | `src/app/(dashboard)/promotor/page.tsx:13,146`, `src/app/(dashboard)/promotor/visitas/page.tsx:31`, `src/app/(dashboard)/promotor/profile/edit/page.tsx:250` | Usar `first_name`+`last_name` directamente |

### Resumen de archivos a tocar

| ID | Acción | Archivos |
|----|--------|----------|
| PROM-001 | Crear | `promotor/campaigns/page.tsx`, `api/promotor/campaigns/route.ts`, agregar a `navigation-config.ts` |
| PROM-002 | Editar | `promotor/reports/page.tsx:390-405` — reemplazar percentages hardcodeados con cálculo |
| PROM-003 | Editar | `promotor/page.tsx`, `promotor/visitas/page.tsx`, `promotor/profile/edit/page.tsx` — usar `first_name`+`last_name` |

### Criterios de verificación

1. Campañas asignadas accesible desde sidebar y muestra datos reales
2. Reportes muestran datos calculados, no porcentajes estáticos
3. No hay referencias a `full_name` como campo directo de DB
4. `npm run build` pasa sin errores

---

## Auditoría: Asesor de Ventas — Cambios Pendientes

**Descubierto:** 2026-02-16
**Estado:** Documentado, pendiente de implementación
**Cobertura:** 11/11 páginas funcionales, 9/9 APIs

El perfil Asesor de Ventas (`/asesor-ventas`) tiene todas las páginas y APIs funcionales. Los hallazgos son un link 404 y features faltantes de integración.

### ADV-P1 — Features faltantes (no bloquean pero afectan completitud)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| ADV-001 | **Link "Editar Perfil" causa 404** — Dashboard tiene link a `/asesor-ventas/profile/edit` que no existe. | `src/app/(dashboard)/asesor-ventas/page.tsx:155` | Crear página o remover link |
| ADV-002 | **Visitas/documentación no integrado** (TASK-070, REQ-034) — No tiene módulo de visitas paralelo al de Promotor. | — | Implementar flujo visitas para asesor |

### ADV-P2 — Nice to have (polish, no bloquean MVP)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| ADV-003 | **`full_name` field inconsistency** — Usa `profile.full_name` (computado por API) pero no hay fallback si API cambia. | `src/app/(dashboard)/asesor-ventas/page.tsx:135` | Agregar fallback `first_name`+`last_name` |

### Resumen de archivos a tocar

| ID | Acción | Archivos |
|----|--------|----------|
| ADV-001 | Crear o Editar | `asesor-ventas/profile/edit/page.tsx` (crear) o `asesor-ventas/page.tsx:155` (remover link) |
| ADV-002 | Crear | `asesor-ventas/visits/page.tsx`, `api/asesor-ventas/visits/route.ts` + componentes del flujo |
| ADV-003 | Editar | `asesor-ventas/page.tsx:135` — agregar fallback |

### Criterios de verificación

1. Link "Editar Perfil" navega a página funcional o está removido
2. Flujo de visitas accesible (si se implementa)
3. No hay dependencia de `full_name` sin fallback
4. `npm run build` pasa sin errores

---

## Auditoría: Cliente — Cambios Pendientes

**Descubierto:** 2026-02-16
**Estado:** Documentado, pendiente de implementación
**Cobertura:** 7/7 páginas funcionales, 7/7 APIs

El perfil Cliente (`/client`) tiene todas las páginas y APIs funcionales. Los hallazgos son un link 404, componentes no implementados y debug logging en producción.

### CLI-P0 — Bugs / Gaps funcionales (bloquean flujo existente)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| CLI-001 | **Link "/client/profile" causa 404** — Quick action en home lleva a página inexistente. API `/api/client/profile` sí existe. | `src/app/(dashboard)/client/page.tsx:272` | Crear `client/profile/page.tsx` |

### CLI-P1 — Features faltantes (no bloquean pero afectan completitud)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| CLI-002 | **SuggestedProductsGrid no implementado** (REQ-043, TASK-033) — Componente falta completamente. Debería mostrar 8 productos sugeridos en home. | — | Crear `components/client/SuggestedProductsGrid.tsx` + integrar en home |
| CLI-003 | **CouponsSection no implementado** (REQ-048, TASK-036) — Sección cupones/email con tracking QR no existe. | — | Crear `components/client/CouponsSection.tsx` |
| CLI-004 | **Registro extendido no implementado** (REQ-044) — No hay formulario de datos de negocio extendidos ni encuesta de onboarding. | — | Crear flujo registro extendido |

### CLI-P2 — Nice to have (polish, no bloquean MVP)

| ID | Problema | Archivo(s) | Fix |
|----|----------|------------|-----|
| CLI-005 | **Debug logging en API promotions** — `console.log` en producción. | `src/app/api/client/promotions/route.ts:55,68,74,121-125` | Remover console.log |

### Resumen de archivos a tocar

| ID | Acción | Archivos |
|----|--------|----------|
| CLI-001 | Crear | `client/profile/page.tsx` |
| CLI-002 | Crear | `components/client/SuggestedProductsGrid.tsx`, editar `client/page.tsx` |
| CLI-003 | Crear | `components/client/CouponsSection.tsx` |
| CLI-004 | Crear | `client/register/extended/page.tsx` o flujo dentro de onboarding existente |
| CLI-005 | Editar | `api/client/promotions/route.ts` — remover console.log lines 55,68,74,121-125 |

### Criterios de verificación

1. Link "/client/profile" navega a página funcional
2. SuggestedProductsGrid renderiza en home (si se implementa)
3. CouponsSection renderiza en home (si se implementa)
4. No hay `console.log` en API de producción
5. `npm run build` pasa sin errores

---

## Resumen Consolidado de Auditorías (Todos los Perfiles)

| Perfil | Páginas OK | APIs OK | P0 | P1 | P2 | Total |
|--------|-----------|---------|----|----|----|----|
| Admin | 18/20 | 22/22 | 0 ✅ | 4 | 4 | 8 |
| Brand Manager | 21/21 | 31/31 | 0 ✅ | 2 | 1 | 3 |
| Supervisor | 6/6 ✅ | 5/5 ✅ | 0 ✅ | 2 | 0 | 2 |
| Promotor | 8/8 ✅ | 10/10 ✅ | 0 | 2 | 1 | 3 |
| Asesor de Ventas | 11/11 ✅ | 9/9 ✅ | 0 | 2 | 1 | 3 |
| Cliente | 7/8 | 7/7 | 1 | 3 | 1 | 5 |
| **TOTAL** | **71/82** | **85/85** | **1** | **15** | **8** | **24** |

> Actualizado 2026-02-17 tras commits fd4b58b (Supervisor), c0fdfb5 (Admin Zones), 1f56248 (Brand client pages + security_invoker migration)

### Todos los P0 pendientes (por orden de impacto)

| ID | Perfil | Problema | Estado |
|----|--------|----------|--------|
| ~~BRAND-001~~ | ~~Brand Manager~~ | ~~Links rotos en lista clientes (3 páginas 404)~~ | ✅ RESUELTO (commit 1f56248) |
| ~~BRAND-002~~ | ~~Brand Manager~~ | ~~Mock clients fallback en vez de empty state~~ | ✅ RESUELTO (commit 1f56248) |
| ~~BRAND-003~~ | ~~Brand Manager~~ | ~~Quick action "Visitas" causa 404~~ | ✅ RESUELTO (commit 1f56248, `/brand/visits` creada) |
| ~~SUPV-001~~ | ~~Supervisor~~ | ~~5 de 6 links del sidebar son 404~~ | ✅ RESUELTO (commit fd4b58b) |
| ~~SUPV-002~~ | ~~Supervisor~~ | ~~Quick actions del dashboard todos 404~~ | ✅ RESUELTO (commit fd4b58b) |
| ~~SUPV-003~~ | ~~Supervisor~~ | ~~"Ver detalle" de equipo es 404~~ | ✅ RESUELTO (commit fd4b58b, `/supervisor/team/[id]` creada) |
| CLI-001 | Cliente | Link "/client/profile" causa 404 | ⏳ Pendiente |
| ~~ADMIN-002~~ | ~~Admin~~ | ~~Zonas sin CRUD~~ | ✅ RESUELTO (commit c0fdfb5, CRUD completo) |

---

## Próximos Pasos Inmediatos

### Tier 1 — Bugs / Blockers
1. ~~**FINDING-001: Fix hardcoded tenant UUID in RLS policies**~~ — ✅ RESUELTO (commit 354e7f7). Dynamic resolution via `get_user_tenant_ids()`.

### Tier 2 — P0 Features Done
2. ~~**Notification system**~~ (REQ-080/081) — ✅ COMPLETO.
3. ~~**Survey system**~~ (REQ-100-105) — ✅ COMPLETO.
4. ~~**Client dashboard redesign**~~ (REQ-040-042, 045) — ✅ COMPLETO.
5. ~~**Promotion creation form**~~ (REQ-011) — ✅ COMPLETO.
6. ~~**Storage buckets**~~ (TASK-004) — ✅ COMPLETO. Migration + RLS policies.
7. ~~**useGeolocation hook**~~ (TASK-005) — ✅ COMPLETO (commit `a6a46e8`).
8. ~~**Evidence upload fix**~~ — ✅ COMPLETO (commit `637ebf9`). Snake→camelCase mapping.

### Tier 3 — All Profiles Audit (P0 — Links rotos y 404s)
9. ~~**Supervisor UI** (TASK-071) — UI condicional roles.~~ ✅ DONE (commit `92e67a8`)
10. ~~**Brand assessment config** (TASK-067) — Productos configurables por Brand Manager para assessment.~~ ✅ DONE
11. ~~**ADMIN-001:** Agregar Promociones al sidebar admin.~~ ✅ DONE
12. ~~**ADMIN-002:** Crear CRUD de Zonas + sidebar link.~~ ✅ DONE (commit `c0fdfb5` — list, create, detail, edit + 4 APIs)
13. ~~**ADMIN-003:** Fix /admin/profile 404.~~ ✅ DONE
14. ~~**BRAND-001:** Crear 3 páginas clientes Brand (detail, visits, edit).~~ ✅ DONE (commit `1f56248`)
15. ~~**BRAND-002:** Remover mock clients fallback, usar EmptyState.~~ ✅ DONE (commit `1f56248`)
16. ~~**BRAND-003:** Crear `/brand/visits` o remover link del dashboard.~~ ✅ DONE (commit `1f56248`, página + API creados)
17. ~~**SUPV-001:** Crear 4 páginas faltantes del sidebar Supervisor (team, clients, visits, reports).~~ ✅ DONE (commit `fd4b58b`)
18. ~~**SUPV-002:** Resolver quick actions 404 del dashboard Supervisor.~~ ✅ DONE (commit `fd4b58b`)
19. ~~**SUPV-003:** Crear `/supervisor/team/[id]` (detalle equipo).~~ ✅ DONE (commit `fd4b58b`)
20. **CLI-001:** Crear `/client/profile` page. Esfuerzo: 2. ⏳ **PENDIENTE — único P0 restante**

### Tier 4 — All Profiles Audit (P1 — Features faltantes) + Admin P1
21. **ADMIN-004:** Settings — reemplazar placeholder con config tenant. Esfuerzo: 3.
22. **ADMIN-005:** CRUD de Distribuidores. Esfuerzo: 3.
23. **ADMIN-006:** CRUD de Catálogos (Markets, Client Types, Commercial Structures). Esfuerzo: 3.
24. **ADMIN-007:** Estadísticas reales en detalle cliente. Esfuerzo: 2.
25. **BRAND-004:** Dashboard KPIs completos (Volumen, Reach, Mix, Market Share, Precios). Esfuerzo: 3.
26. **BRAND-005:** Team performance con rankings y métricas individuales. Esfuerzo: 3.
27. **SUPV-004:** Resolver inconsistencia "Asignaciones" (nav vs quick action). Esfuerzo: 1.
28. **SUPV-005:** Verificar tabla `client_assignments` vs `promotor_client_assignments`. Esfuerzo: 1.
29. **PROM-001:** Campañas asignadas al promotor (REQ-021, TASK-061). Esfuerzo: 2.
30. **PROM-002:** Reportes con stats calculados (no hardcodeados). Esfuerzo: 2.
31. **ADV-001:** Crear `/asesor-ventas/profile/edit` o remover link. Esfuerzo: 2.
32. **ADV-002:** Integrar visitas/documentación en Asesor de Ventas (TASK-070). Esfuerzo: 3.
33. **CLI-002:** SuggestedProductsGrid (TASK-033). Esfuerzo: 2.
34. **CLI-003:** CouponsSection (TASK-036). Esfuerzo: 2.
35. **CLI-004:** Registro extendido (REQ-044). Esfuerzo: 3.
36. **Ampliar targeting de promociones** (TASK-022) — Segmentación por zona, tipo de cliente, categoría. Depende de REQ-044. Esfuerzo: 3.

### Tier 5 — All Profiles Audit (P2 — Polish) + Optimization
37. **ADMIN-008:** Editar perfil usuario desde admin. Esfuerzo: 2.
38. **ADMIN-009:** Soft delete clientes desde UI. Esfuerzo: 1.
39. **ADMIN-010:** Verificar preview encuesta antes de aprobar. Esfuerzo: 1.
40. **ADMIN-011:** Indicador ventana 48h en promociones. Esfuerzo: 1.
41. **BRAND-006:** Incentivos RTM/M&P (REQ-013). Esfuerzo: 3.
42. **PROM-003:** Fix `full_name` inconsistency en Promotor. Esfuerzo: 1.
43. **ADV-003:** Fix `full_name` inconsistency en Asesor de Ventas. Esfuerzo: 1.
44. **CLI-005:** Remover `console.log` en API client promotions. Esfuerzo: 1.
45. **Calendario plan trabajo** (TASK-062) — Vista semanal para promotor. Esfuerzo: 3.
46. **Email notifications** (TASK-043) — Notificaciones por email. Esfuerzo: 2.
47. **OPT-001:** Optimize asesor-ventas orders API. Esfuerzo: 2.
48. **E2E testing** (TASK-072) — Testing integración end-to-end. Esfuerzo: 3.

---

## Detalle Roles (Comparación)

### Promotor vs Asesor de Ventas

| Aspecto | Promotor | Asesor de Ventas |
|---------|----------|------------------|
| **Empleador** | Trabaja para la marca | Trabaja para el distribuidor |
| **Objetivo principal** | Assessment/documentación 7Ps | Vender (cargar pedidos) |
| **Visitas** | Flujo completo (3 secciones) | Documentar ejecución (similar) |
| **Órdenes** | Carga pedidos **desde la visita** | Carga pedidos **desde módulo especial** |
| **QR** | No entrega promociones | "Entregar Promoción" |
| **Tracking facturación** | N/A | Requiere para cobrar a marca |

### Supervisor: Manejo via Roles

| Roles asignados | UI Supervisor muestra |
|-----------------|----------------------|
| Solo `supervisor` | Dashboard supervisión básico |
| `supervisor` + `promotor` | + Botón acceso módulo Promotor |
| `supervisor` + `asesor_de_ventas` | + Botón acceso módulo Asesor de Ventas |
| `supervisor` + ambos | + Ambos botones de acceso |

---

## Estado Anterior (Referencia)

### ADMIN Role (Sin cambios)

#### Authentication & Access
- [x] Login flow with Supabase Auth
- [x] Role-based routing to `/admin`
- [x] Protected routes via middleware
- [x] Session management

#### Dashboard (`/admin`)
- [x] Dashboard page exists and loads
- [x] Real data from database (not mock)
- [x] Metrics cards (Brands, Clients, Users, Visits)
- [x] Monthly revenue display
- [x] Recent activity log

#### User Management
- [x] List all users (`/admin/users`)
- [x] Create new user (`/admin/users/create`)
- [x] Invite user via email (`/admin/users/invite`)
- [x] View user profile (`/admin/users/[id]`)
- [x] Manage user roles (`/admin/users/[id]/roles`)
- [x] API: `POST /api/admin/users/create`
- [ ] Edit user profile
- [ ] Deactivate/delete user

#### Brand Management
- [x] List all brands (`/admin/brands`)
- [x] Create new brand (`/admin/brands/create`)
- [x] Edit brand (`/admin/brands/[id]/edit`)
- [x] API: `GET /api/admin/brands`
- [x] API: `POST /api/admin/brands`
- [ ] Delete/archive brand

#### Client Management
- [x] List all clients (`/admin/clients`)
- [x] Create new client (`/admin/clients/create`)
- [x] View client details (`/admin/clients/[clientId]`)
- [x] Edit client (`/admin/clients/[clientId]/edit`)
- [x] API: `GET /api/admin/clients`
- [x] API: `POST /api/admin/clients/create`
- [ ] Delete/archive client

---

### BRAND MANAGER Role (Sin cambios + Config Assessment)

#### Authentication & Access
- [x] Login flow routes to `/brand`
- [x] Role check for `brand_manager`
- [x] Protected routes via middleware

#### Dashboard (`/brand`)
- [x] Dashboard page exists
- [x] Real data loading via API
- [x] Metrics: Total Clients, Active Visits, Monthly Revenue
- [x] Average Rating display
- [x] Performance summary cards

#### Client Management
- [x] List clients for brand (`/brand/clients`)
- [x] Search and filter clients
- [x] Create client (`/brand/clients/create`)
- [x] API: `GET /api/brand/clients`
- [x] API: `POST /api/brand/clients`
- [ ] Remove client from brand

#### Reports
- [x] Reports page (`/brand/reports`)
- [x] Analytics dashboard
- [x] Performance metrics

#### Tier Management
- [x] Tiers list page (`/brand/tiers`)
- [x] Create new tier
- [x] Edit tier requirements (points, visits, purchases)
- [x] Edit tier benefits (multiplier, discounts)
- [x] Set default tier for new members
- [ ] Enable/disable auto-assignment

#### Membership Management
- [x] Pending memberships queue (`/brand/memberships`)
- [x] Approve membership requests
- [x] Active members list with tier filter
- [x] Manual tier assignment
- [x] Award/deduct points (Points modal)
- [ ] View member tier history

---

### PROMOTOR Role (Antes ADVISOR - Renombrar)

#### Authentication & Access
- [x] Login flow routes to `/asesor` → **CAMBIAR a `/promotor`**
- [x] Role check for `advisor` → **CAMBIAR a `promotor`**
- [x] Protected routes via middleware

#### Profile Dashboard (`/asesor` → `/promotor`)
- [x] Profile page exists
- [x] Real data from `/api/asesor/profile` → **CAMBIAR a `/api/promotor/profile`**
- [x] Statistics from `/api/asesor/stats` → **CAMBIAR a `/api/promotor/stats`**
- [x] Metrics: Assigned Clients, Visits, Rating
- [x] Performance score display
- [x] Quick action links

#### Visit Management
- [x] Visit list page (`/asesor/visitas` → `/promotor/visitas`)
- [x] Visit detail page
- [x] Visit filters component
- [x] `useMyVisits()` hook
- [x] Create new visit
- [x] Start visit (check-in)
- [x] Complete visit (check-out)
- [x] Add visit notes
- [x] **IMPLEMENTADO:** Assessment 3 secciones (REQ-022) - Wizard integrado
- [x] **IMPLEMENTADO:** Carga evidencia con GPS (REQ-023) - PhotoEvidenceUpload component
- [x] Upload visit photos con metadata GPS

---

### CLIENT Role (Rediseño Home)

#### Portal Dashboard (`/client`)
- [x] Dashboard page
- [x] Welcome message
- [x] Points balance
- [x] Business info display
- [x] **NUEVO:** Loyalty Plans Section (REQ-041)
- [x] **NUEVO:** Banner Promociones Semanales (REQ-042)
- [ ] **NUEVO:** Grid Productos Sugeridos (REQ-043) — P1, diferido
- [x] **NUEVO:** Display Tier Mejorado (REQ-045)
- [x] **NUEVO:** Descarga QR Personal con selección de promociones (REQ-046)

#### Brand Memberships
- [x] My Brands page (`/client/brands`)
- [x] View membership status per brand
- [x] Current tier display with benefits
- [x] Points balance per brand
- [x] Join new brand flow (self-subscribe)
- [ ] Accept terms and conditions

#### Points & Rewards
- [x] Points balance page (`/client/points`)
- [x] Points history per brand
- [x] Total points summary
- [ ] Redeem rewards
- [ ] Available promotions

---

## Database Status

### Core Tables
- [x] `tenants` - Multi-tenant support
- [x] `brands` - Brand information
- [x] `clients` - Client/business data
- [x] `user_profiles` - User information
- [x] `user_roles` - Role assignments
- [x] `visits` - Visit tracking
- [x] `orders` - Order management
- [x] `products` - Product catalog

### Advisor Tables (Renombrar a Promotor)
- [x] `advisor_assignments` → **promotor_assignments**
- [x] `advisor_client_assignments` → **promotor_client_assignments**

### Loyalty Tables
- [x] `tiers` - Membership tiers
- [x] `client_brand_memberships` - Client-brand relationships
- [x] `points_transactions` - Points ledger
- [x] `promotions` - Marketing promotions (extender)
- [x] `rewards` - Rewards catalog

### NUEVAS TABLAS REQUERIDAS
- [x] `distributors` - Catálogo distribuidores
- [x] `qr_codes` - Códigos QR generados
- [x] `qr_redemptions` - Historial redenciones QR
- [x] `notifications` - Notificaciones sistema
- [x] `surveys` - Encuestas
- [x] `survey_questions` - Preguntas encuestas
- [x] `survey_responses` - Respuestas encuestas
- [x] `survey_answers` - Respuestas individuales por pregunta
- [x] `visit_stage_assessments` - Assessment de visitas (3 stages)
- [x] `visit_evidence` - Fotos/evidencia de visitas con GPS
- [x] `visit_brand_product_assessments` - Precios productos de marca
- [x] `visit_competitor_assessments` - Precios competencia
- [x] `visit_pop_material_checks` - Verificación materiales POP
- [x] `visit_exhibition_checks` - Verificación exhibiciones
- [x] `brand_competitors` - Competidores por marca
- [x] `brand_competitor_products` - Productos competidor
- [x] `brand_competitor_product_sizes` - Tamaños productos competidor
- [x] `brand_pop_materials` - Materiales POP (sistema + custom)
- [x] `brand_communication_plans` - Planes comunicación por marca
- [x] `brand_communication_plan_materials` - Materiales del plan
- [x] `brand_communication_plan_activities` - Actividades del plan
- [x] `brand_exhibitions` - Exhibiciones negociadas

---

## Test Credentials

| Role | Email | Notes |
|------|-------|-------|
| Admin | (your admin email) | Full platform access |
| Brand Manager | (brand manager email) | Brand: Iberia |
| Promotor | fermx3@gmail.com | Has advisor role (cambiar a promotor) |
| Supervisor | (create user) | Needs dashboard |
| Client | (create user) | Needs portal |
| **Asesor de Ventas** | (create user) | **NUEVO ROL** |

---

## Notes

- All roles use Supabase Auth for authentication
- Tenant isolation is enforced at database level (RLS)
- Migrations are tracked in `supabase/migrations/`
- Environment variables in `.env` (see `.env.example`)
- **IMPORTANTE:** Respetar reglas de CLAUDE.md - verificar DB antes de cambios

---

## Technical Debt & Findings

### FINDING-001: Hardcoded Tenant UUIDs en RLS Policies (CRÍTICO)
**Descubierto:** 2026-02-12
**Prioridad:** CRÍTICA
**Estado:** ✅ RESUELTO (commit 354e7f7)

**Problema:**
Tres políticas RLS contienen UUID hardcodeado `fe0f429d-2d83-4738-af65-32c655cef656`:

1. **`brands_tenant_access`** (línea 17828 en `20260207212543_remote_schema.sql`)
2. **`clients_tenant_access`** (línea 18032)
3. **`user_profiles_tenant_access`** (línea 18982)

```sql
-- ❌ PROBLEMA ACTUAL
CREATE POLICY "brands_tenant_access" ON "public"."brands"
TO "authenticated"
USING (("tenant_id" = 'fe0f429d-2d83-4738-af65-32c655cef656'::"uuid"));
```

**Impacto:**
- Solo usuarios del tenant hardcodeado pueden acceder a brands, clients y user_profiles
- Bloquea acceso multi-tenant para otros tenants
- Viola CLAUDE.md Rule 7: "NUNCA hardcodear IDs de tenant/brand en código"
- **BLOQUEANTE para multi-tenant en producción**

**Solución Requerida:**
```sql
-- ✅ DEBE SER (dinámico)
CREATE POLICY "brands_tenant_access" ON public.brands
TO authenticated
USING (
  tenant_id IN (
    SELECT ur.tenant_id
    FROM public.user_roles ur
    JOIN public.user_profiles up ON ur.user_profile_id = up.id
    WHERE up.user_id = auth.uid()
      AND ur.status = 'active'
      AND ur.deleted_at IS NULL
  )
);
```

**Nota Crítica:** La política de `user_profiles` debe ser SIMPLE (`user_id = auth.uid()`) para evitar **circular dependency**.

❌ **NUNCA hacer esto:**
```sql
-- Circular dependency - user_profiles JOIN user_profiles
CREATE POLICY "user_profiles_tenant_access" ON user_profiles
USING (
  tenant_id IN (
    SELECT ur.tenant_id
    FROM user_roles ur
    JOIN user_profiles up ON ...  -- ⚠️ CIRCULAR!
  )
);
```

✅ **Patrón correcto:**
```sql
-- Simple, sin self-reference
CREATE POLICY "user_profiles_tenant_access" ON user_profiles
USING (user_id = auth.uid());
```

**Tasks para resolver:**
- [ ] Crear migración para DROP/CREATE de 3 políticas RLS
- [ ] Implementar resolución dinámica via user_roles
- [ ] Simplificar política user_profiles (evitar circular dependency)
- [ ] Testing con múltiples tenants
- [ ] Aplicar a local, staging, y producción

---

### FINDING-002: Hardcoded Tenant UUID en handle_new_user() Function
**Descubierto:** 2026-02-12
**Prioridad:** MEDIA
**Estado:** PENDIENTE (diferido hasta registro multi-tenant)

**Problema:**
La función `handle_new_user()` tiene default tenant hardcodeado:

```sql
-- Línea 2453 en supabase/migrations/20260207212543_remote_schema.sql
CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
AS $$
declare
  default_tenant_id uuid := 'fe0f429d-2d83-4738-af65-32c655cef656'::uuid;
  ...
```

**Impacto:**
- Nuevos usuarios sin `tenant_id` en metadata se asignan al tenant hardcodeado
- Funciona para desarrollo single-tenant
- Bloqueará registro multi-tenant en producción

**Tasks para resolver:**
- [ ] Requerir `tenant_id` en signup metadata (frontend)
- [ ] Eliminar fallback hardcodeado de función
- [ ] Implementar manejo de errores si tenant_id falta
- [ ] Actualizar flows de signup en todas las rutas de registro
- [ ] Testing con múltiples tenants

---

### FINDING-003: Schema Inconsistency - full_name vs first_name/last_name
**Descubierto:** 2026-02-12
**Prioridad:** BAJA (documentación)
**Estado:** PENDIENTE (auditar codebase)

**Problema:**
El schema real de `user_profiles` NO tiene campo `full_name`:

```sql
user_profiles:
  - first_name (text, NOT NULL)  ✅ Existe
  - last_name (text, NOT NULL)   ✅ Existe
  - full_name                    ❌ NO existe como campo directo
```

**Impacto:**
- Queries que referencian `full_name` fallan con "column does not exist"
- Código inconsistente - algunos lugares concatenan, otros asumen campo

**Tasks para resolver:**
- [ ] Auditar codebase para todas las referencias a `full_name`
- [ ] Reemplazar con `first_name || ' ' || last_name AS full_name`
- [ ] Considerar agregar generated column en DB si se usa frecuentemente:
  ```sql
  ALTER TABLE user_profiles
  ADD COLUMN full_name text
  GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED;
  ```
- [ ] Actualizar tipos TypeScript para reflejar schema real

**Archivos conocidos que necesitan actualización:**
- `/src/app/api/admin/promotions/route.ts`
- `/src/app/api/brand/metrics/route.ts`
- Cualquier API que consulte user_profiles

### FINDING-004: Views Running as SECURITY DEFINER (RLS Bypass)
**Descubierto:** 2026-02-17
**Prioridad:** CRITICA (seguridad multi-tenant)
**Estado:** RESUELTO (migración `20260217100000_fix_views_security_invoker.sql`)

**Problema:**
Todas las ~43 vistas en el schema público corrían como `SECURITY DEFINER` (default de PostgreSQL). Esto bypasea completamente el RLS de las tablas subyacentes. Cualquier usuario autenticado podía ver datos de TODOS los tenants via las vistas.

Referencia: Supabase lint `0010_security_definer_view`

**Impacto:**
- Fuga de datos cross-tenant en cualquier API que use vistas (ej: `brand_membership_stats`, `active_orders`, `active_promotions`)
- Todas las vistas `active_*` y vistas de estadísticas afectadas

**Resolución:**
- Migración aplica `ALTER VIEW ... SET (security_invoker = on)` a todas las vistas
- Después de la migración, queries a vistas respetan las políticas RLS de las tablas subyacentes
- PostgreSQL 15+ feature, soportado en todas las instancias de Supabase

**Mejora futura:**
- [ ] Crear vista `brand_visit_stats` (similar a `brand_membership_stats`) que agrupe visits por brand_id
- [ ] La vista `active_visits` actual NO tiene columna `brand_id` — considerar agregar al SELECT de la vista
- [ ] Revocar grants de `anon` en vistas que no deberían ser accesibles sin autenticación
