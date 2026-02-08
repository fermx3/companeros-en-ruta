# MVP Status - Compañeros en Ruta

**Last Updated:** 2026-02-08
**Target:** Implementación requerimientos PerfectApp según especificaciones cliente

---

## Quick Summary

### Estructura de Roles (6 Roles Totales)

| Rol | Estado Actual | Cambio Requerido | Ready for Testing |
|-----|---------------|------------------|-------------------|
| Admin | Funciones actuales | Sin cambios | Yes |
| Brand Manager | Funciones actuales | Sin cambios + Config Assessment | Yes |
| Supervisor | Funciones actuales | + Roles activos configurables | Yes |
| **Promotor** | Advisor (renombrar) | RENOMBRAR de Advisor + Assessment 3 secciones | Pending |
| **Asesor de Ventas** | No existe | ROL NUEVO - Para distribuidores | Pending |
| Client (M&P) | Funciones actuales | Rediseño Home + QR + Loyalty | Yes |

### Sistemas Core

| Sistema | Estado Actual | Requerido | Gap |
|---------|---------------|-----------|-----|
| Brand Affiliation | Complete | Complete | None |
| Tier System | Complete | Complete | None |
| Points System | Complete | Complete | None |
| **Sistema QR** | No implementado | Generación + Escaneo + Redención | Full |
| **Promociones UI** | Tabla existe | Formulario + Banners + Workflow | Major |
| **Carga Evidencia** | No implementado | Fotos + GPS + Storage | Full |
| **Flujo Visita Assessment** | Check-in/out básico | 3 secciones assessment | Major |
| **Notificaciones** | No implementado | In-app + Email | Major |
| **Encuestas** | No implementado | Builder + Segmentación | Full |

**Overall MVP Progress:** ~60% hacia requerimientos PerfectApp

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
| REQ-040 | Home Rediseñado - Loyalty Plans, Promociones, Sugeridos | PDF_B p.3-4 | P0 |
| REQ-041 | Loyalty Plans Display - Máximo 6 planes activos | PDF_B p.3 | P0 |
| REQ-042 | Banner Promociones Semanales - 5 banners carrusel | PDF_B p.3 | P0 |
| REQ-043 | Grid Productos Sugeridos - 8 productos | PDF_B p.3 | P1 |
| REQ-044 | Registro Extendido - Datos negocio + encuesta | PDF_B p.2 | P1 |
| REQ-045 | Display Tier Mejorado - Monedas + metas visuales | PDF_B p.3 | P0 |
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
| TASK-002e | Crear módulo "Entregar Promoción" (QR descuento/material) | REQ-033 | 3 | TASK-013, TASK-002b |
| TASK-002f | Implementar tracking QRs para facturación distribuidor→marca | REQ-035 | 2 | TASK-002e |
| TASK-003 | Actualizar middleware routing para ambos roles | REQ-001, REQ-001b | 1 | TASK-001, TASK-002 |
| TASK-004 | Configurar Supabase Storage buckets (evidencia, qr) | REQ-002, REQ-090 | 1 | - |
| TASK-005 | Crear hook useGeolocation | REQ-003 | 1 | - |
| TASK-006 | Crear componente CameraCapture con preview | REQ-004, REQ-091 | 3 | - |
| TASK-007 | Crear servicio file upload a Supabase Storage | REQ-092 | 2 | TASK-004 |
| TASK-010 | Crear tabla qr_codes (migration) con max_redemptions | REQ-071, REQ-075 | 2 | - |
| TASK-010b | Crear tabla qr_redemptions (track múltiples redenciones) | REQ-071b | 2 | TASK-010 |
| TASK-011 | Crear servicio generación QR (qrcode.react) | REQ-070 | 2 | TASK-010 |
| TASK-012 | Crear componente QRCodeDisplay | REQ-046 | 2 | TASK-011 |
| TASK-013 | Crear componente QRScanner (html5-qrcode) | REQ-072 | 3 | - |
| TASK-014 | Crear API redención QR (lógica "primero en escanear gana" + multi-uso) | REQ-073, REQ-075 | 4 | TASK-010, TASK-010b, TASK-013 |

### Semana 2: Promociones y Cliente (P0 Features)

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-020 | Extender schema promotions | REQ-060 | 2 | - |
| TASK-021 | Crear formulario creación promoción | REQ-011 | 5 | TASK-020 |
| TASK-022 | Crear UI targeting promoción | REQ-012, REQ-062 | 3 | TASK-021 |
| TASK-023 | Crear workflow aprobación | REQ-012 | 4 | TASK-020 |
| TASK-024 | Crear API redención promoción | REQ-064 | 3 | TASK-020, TASK-014 |
| TASK-025 | Crear carrusel promociones semanales | REQ-042 | 2 | TASK-020 |
| TASK-030 | Rediseñar layout dashboard cliente | REQ-040 | 4 | - |
| TASK-031 | Crear componente LoyaltyPlansSection | REQ-041 | 3 | - |
| TASK-032 | Crear componente WeeklyPromotionsBanner | REQ-042 | 2 | TASK-025 |
| TASK-033 | Crear componente SuggestedProductsGrid | REQ-043 | 2 | - |
| TASK-034 | Crear página descarga QR personal | REQ-046 | 2 | TASK-012 |

### Semana 3: Evidencia y Encuestas (P0-P1)

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-035 | Crear componente EvidenceUpload | REQ-047 | 3 | TASK-006, TASK-007 |
| TASK-036 | Crear componente CouponsSection | REQ-048 | 2 | TASK-014 |
| TASK-040 | Crear tabla notifications | REQ-080 | 1 | - |
| TASK-041 | Crear componente NotificationBell | REQ-081 | 2 | TASK-040 |
| TASK-042 | Crear página lista notificaciones | REQ-081 | 2 | TASK-040 |
| TASK-043 | Crear servicio email notifications | REQ-082 | 2 | TASK-040 |
| TASK-050 | Crear schema DB surveys (con segmentación y status aprobación) | REQ-100 | 3 | - |
| TASK-051 | Crear builder encuestas para Brand | REQ-101 | 4 | TASK-050 |
| TASK-052 | Crear workflow aprobación encuestas por Admin | REQ-102 | 3 | TASK-050 |
| TASK-053 | Implementar segmentación encuestas (usuario, zona, categoría) | REQ-103 | 3 | TASK-050 |
| TASK-054 | Crear componente SurveyForm | REQ-104 | 4 | TASK-050 |
| TASK-055 | Crear API respuestas survey | REQ-100 | 2 | TASK-050 |

### Semana 4: Flujo Visita Assessment y Polish

| ID | Tarea | Implementa | Esfuerzo | Dependencias |
|----|-------|------------|----------|--------------|
| TASK-060 | Actualizar dashboard Promotor (antes Advisor) | REQ-020 | 2 | TASK-001c |
| TASK-061 | Crear vista campañas asignadas para Promotor | REQ-021 | 2 | TASK-020 |
| TASK-062 | Crear vista plan trabajo semanal | REQ-024 | 3 | TASK-060 |
| TASK-063 | **VISITA Sección 1:** Assessment Producto-Empaque-Precio | REQ-022a | 4 | TASK-006 |
| TASK-063b | UI dinámica por marca/sub-marca + agregar competidor | REQ-025 | 3 | TASK-063 |
| TASK-064 | **VISITA Sección 2:** Promoción del mes (inventario, orden compra) | REQ-022b | 3 | TASK-063 |
| TASK-065 | **VISITA Sección 3:** Plan comunicación (materiales, exhibiciones) | REQ-022c | 3 | TASK-064 |
| TASK-066 | Integrar 3 secciones en flujo check-in/check-out existente | REQ-022 | 3 | TASK-063, 064, 065 |
| TASK-066b | Integrar carga de pedidos dentro del flujo de visita (Promotor) | REQ-026 | 3 | TASK-066 |
| TASK-067 | Brand Manager: Configuración sub-marcas para assessment | REQ-025 | 3 | - |
| TASK-070 | Integrar visitas/documentación en Asesor de Ventas | REQ-034 | 3 | TASK-002b |
| TASK-071 | Supervisor: UI condicional basada en roles asignados (user_roles) | REQ-037, REQ-038, REQ-039 | 2 | TASK-001c, TASK-002b |
| TASK-072 | Testing integración end-to-end | - | 3 | All |

### Backlog: Optimizaciones

| ID | Tarea | Descripción | Esfuerzo | Prioridad |
|----|-------|-------------|----------|-----------|
| OPT-001 | Optimizar API `/api/asesor-ventas/orders` | Actualmente obtiene TODAS las órdenes para calcular resumen, luego pagina en JS. Separar en 2 queries: una para datos paginados y otra para summary. Reduce tiempo de 6-12s a <1s | 2 | Media |

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

### FLUJO VISITA (3 Secciones Assessment)
```
/src/components/visits/
  - VisitAssessmentFlow.tsx (wizard 3 pasos)
  - AssessmentProductoPrecio.tsx (Sección 1)
  - AssessmentPromocionMes.tsx (Sección 2)
  - AssessmentComunicacion.tsx (Sección 3)
/src/app/(dashboard)/promotor/visitas/[visitId]/assessment/
  - page.tsx (flujo integrado check-in → assessment → check-out)
```

### CONFIGURACIÓN SUB-MARCAS
```
/src/app/(dashboard)/brand/assessment-config/
  - page.tsx (configurar marcas/sub-marcas para assessment)
/src/app/api/brand/assessment-config/
  - route.ts
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

### CLIENTE (REDISEÑO HOME)
```
/src/app/(dashboard)/client/page.tsx (rediseño)
/src/components/client/LoyaltyPlansSection.tsx
/src/components/client/WeeklyPromotionsBanner.tsx
/src/components/client/SuggestedProductsGrid.tsx
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

## Próximos Pasos Inmediatos

1. **Renombrar Advisor → Promotor** (TASK-001 a TASK-001c)
   - Migración DB para renombrar enum value
   - Actualizar todas las rutas `/asesor` → `/promotor`
   - Actualizar labels en UI

2. **Crear rol Asesor de Ventas** (TASK-002 a TASK-002f)
   - Agregar enum value en DB
   - Crear dashboard con clientes asignados
   - Módulo órdenes (cargar pedidos)
   - Módulo cliente (validar promociones)
   - Módulo "Entregar Promoción" (QR)
   - Tracking para facturación distribuidor→marca

3. **Implementar flujo visita con 3 secciones assessment**
   - Integrar dentro del check-in/check-out existente
   - Componentes para cada sección según screenshots

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
- [ ] **NUEVO:** Assessment 3 secciones (REQ-022)
- [ ] **NUEVO:** Carga evidencia con GPS (REQ-023)
- [ ] Upload visit photos

---

### CLIENT Role (Rediseño Home)

#### Portal Dashboard (`/client`)
- [x] Dashboard page
- [x] Welcome message
- [x] Points balance
- [x] Business info display
- [ ] **NUEVO:** Loyalty Plans Section (REQ-041)
- [ ] **NUEVO:** Banner Promociones Semanales (REQ-042)
- [ ] **NUEVO:** Grid Productos Sugeridos (REQ-043)
- [ ] **NUEVO:** Display Tier Mejorado (REQ-045)
- [ ] **NUEVO:** Descarga QR Personal (REQ-046)

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
- [ ] `distributors` - Catálogo distribuidores
- [ ] `qr_codes` - Códigos QR generados
- [ ] `qr_redemptions` - Historial redenciones QR
- [ ] `notifications` - Notificaciones sistema
- [ ] `surveys` - Encuestas
- [ ] `survey_questions` - Preguntas encuestas
- [ ] `survey_responses` - Respuestas encuestas
- [ ] `visit_assessments` - Assessment 7Ps de visitas
- [ ] `visit_evidence` - Fotos/evidencia de visitas

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
