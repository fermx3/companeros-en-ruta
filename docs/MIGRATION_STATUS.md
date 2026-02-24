# MongoDB Migration Status — PerfectApp → Compañeros en Ruta

**Last Updated:** 2026-02-25
**Source:** MongoDB (`perfectapp` database)
**Target:** PostgreSQL/Supabase (multi-tenant schema)
**Target Tenant:** Nuevo tenant (cada marca PerfectApp se migra como marca dentro del nuevo tenant)

---

## Overview

Migración de datos desde la app MongoDB legacy (PerfectApp) al schema PostgreSQL existente en Compañeros en Ruta. El sistema destino ya tiene todas las tablas core creadas. Esta migración cubre:

- **5 colecciones MongoDB** → tablas PostgreSQL existentes
- **~1,586 documentos totales** (461 users, 678 visitas, 433 ordenes, 4 config, 10 contactos)
- **Nuevo tenant** creado para alojar todas las marcas migradas

### Decisiones clave

| Decisión | Detalle |
|----------|---------|
| Tenant | Nuevo tenant — los datos migrados NO se mezclan con tenants existentes |
| Config = Marcas | Cada registro de `config` (campo `empresa`) es una marca → tabla `brands` |
| Clientes SIN auth.users | Usuarios LEAL se migran SOLO a `clients` (sin crear `auth.users`). El cliente creará su cuenta después vía el flujo de onboarding existente |
| Staff con auth.users | ADMIN, ASESOR, COORDINADOR, USUARIO se migran a `auth.users` + `user_profiles` + `user_roles` |
| Legacy IDs | Los IDs originales de MongoDB se guardan en `metadata.legacy_id` (y `metadata.legacy_user_id` para public_ids incompatibles) |
| Imágenes Cloudinary | URLs de Cloudinary se mantienen as-is inicialmente (campo `metadata.cloudinary_url` o columna existente) |
| Contactos | Descartados (solo 10 registros, no hay tabla destino) |

---

## Discarded Features

Las siguientes features/datos de MongoDB **NO se migran**:

| Feature | Razón |
|---------|-------|
| Rol IDM | No existe equivalente, no se necesita |
| Mensajes asesores | No hay tabla de mensajes; feature diferida |
| Recompensas LEAL | Sistema de rewards diferente en PG; se reconstruirá |
| Banners LEAL | Se manejan como promociones en el nuevo sistema |
| opcionesDeNoCompra | Capturado como parte del assessment de visita (notes/metadata) |
| Bonus de puntos | Cubierto por `points_transactions` con tipo diferente |
| Colección `contactos` | Solo 10 registros, datos redundantes con clients |

---

## Schema Gaps (pre-migration)

### GAP-001: Tabla `centrales` (centrales de abasto)

**Estado:** ✅ Migración creada (`20260225000000_create_centrales_table.sql`)

MongoDB tiene clientes asociados a centrales de abasto (ej: "Central de Abasto Iztapalapa"). No existía tabla para esto.

- Nueva tabla `centrales` con public_id (`CEN-XXXX`), tenant_id, zone_id FK
- FK `clients.central_id` agregado
- RLS policies siguiendo patrón de `zones`

### GAP-002: Zone assignment sync triggers

**Estado:** ✅ Migración creada (`20260225010000_zone_assignment_sync.sql`)

Cuando se asigna un promotor a una zona, se necesitan crear automáticamente los `client_assignments` para todos los clientes de esa zona (y viceversa cuando se crea un cliente en una zona con promotores asignados).

- Trigger `sync_zone_client_assignments` en `promotor_assignments`
- Trigger `sync_new_client_to_zone_promotors` en `clients`
- Ambos respetan `tenant_id` y usan `ON CONFLICT DO NOTHING`

### GAP-003: public_id format constraints

**Estado:** Documentado — resolver durante migración

El format check `^CLI-[0-9]{4}$` en `clients.public_id` no acepta IDs legacy de MongoDB (ej: "IZT-0104"). Solución: generar nuevos public_ids secuenciales y guardar el ID legacy en `metadata.legacy_user_id`.

### GAP-004: Required NOT NULL FKs en clients

**Estado:** Documentado — crear defaults durante migración

`clients` requiere `market_id`, `client_type_id`, `commercial_structure_id` como NOT NULL. Se crearán registros default para cada uno antes de migrar clientes.

---

## Role Mapping

| MongoDB Role | PostgreSQL Role | Notas |
|-------------|-----------------|-------|
| `ADMIN` | `admin` | → `auth.users` + `user_profiles` + `user_roles` |
| `ASESOR` | `promotor` | → `auth.users` + `user_profiles` + `user_roles` + `promotor_assignments` |
| `COORDINADOR` | `supervisor` | → `auth.users` + `user_profiles` + `user_roles` |
| `USUARIO` | `brand_manager` | → `auth.users` + `user_profiles` + `user_roles` |
| `LEAL` | client (sin rol) | → SOLO `clients` + `client_brand_memberships` + `client_tier_assignments`. **SIN `auth.users`** — el cliente creará su cuenta vía onboarding |

---

## Collection Mapping

### 1. `config` (4 documentos) → Múltiples tablas

Cada registro de `config` representa una **marca** (campo `empresa`).

| MongoDB Field | Target Table | Target Column | Notes |
|---------------|-------------|---------------|-------|
| `_id` | — | `metadata.legacy_id` | Stored for reference |
| `empresa` | `brands` | `name` | Cada config = una marca |
| `empresa` | `brands` | `slug` | Slugified name |
| Logo/images | `brands` | `metadata.logo_url` | Cloudinary URLs |
| Productos | `products` | Multiple columns | Products per brand |
| Competidores | `brand_competitors` | Multiple columns | Competitor config |
| Materiales POP | `brand_pop_materials` | Multiple columns | POP materials config |
| Promociones | `promotions` | Multiple columns | Active promotions |
| Zonas | `zones` | Multiple columns | Zone definitions |
| Centrales | `centrales` | Multiple columns | Wholesale markets |

**Execution notes:**
- Crear el nuevo tenant primero
- Luego crear cada marca (`brands`) dentro del tenant
- Productos, competidores, materiales POP, y promociones dependen de `brand_id`

### 2. `users` (461 documentos) → Múltiples tablas

#### Staff users (ADMIN, ASESOR, COORDINADOR, USUARIO)

| MongoDB Field | Target Table | Target Column | Notes |
|---------------|-------------|---------------|-------|
| `_id` | — | `metadata.legacy_id` | Stored for reference |
| `email` | `auth.users` | `email` | Supabase Admin API |
| `nombre` | `user_profiles` | `first_name` | Split if contains space |
| `apellido` | `user_profiles` | `last_name` | |
| `telefono` | `user_profiles` | `phone` | |
| `role` | `user_roles` | `role` | See role mapping above |
| `zona` | `promotor_assignments` | `zone_id` | Only for ASESOR role |
| `empresa` | — | — | Maps to brand assignment |
| `activo` | `user_roles` | `status` | `true` → 'active', `false` → 'inactive' |
| `avatar` | `user_profiles` | `metadata.avatar_url` | Cloudinary URL |
| `cuotaMensual` | `kpi_targets` | `target_value` | Monthly quota target |

**Auth user creation flow:**
1. Use Supabase Admin API (`supabase.auth.admin.createUser()`)
2. Set temporary password (force change on first login)
3. Create `user_profiles` record
4. Create `user_roles` record with correct role + tenant_id
5. For ASESOR: create `promotor_assignments` with zone_id

#### Client users (LEAL)

| MongoDB Field | Target Table | Target Column | Notes |
|---------------|-------------|---------------|-------|
| `_id` | — | `metadata.legacy_id` | Stored for reference |
| `userId` / custom ID | `clients` | `metadata.legacy_user_id` | Legacy identifier |
| `nombreNegocio` | `clients` | `business_name` | |
| `propietario` | `clients` | `owner_name` | |
| `email` | `clients` | `email` | |
| `telefono` | `clients` | `phone` | |
| `whatsapp` | `clients` | `whatsapp` | |
| `direccion` | `clients` | `address_street` | |
| `colonia` | `clients` | `address_neighborhood` | |
| `ciudad` | `clients` | `address_city` | |
| `estado` | `clients` | `address_state` | |
| `codigoPostal` | `clients` | `address_postal_code` | |
| `coordenadas.lat` | `clients` | `latitude` | |
| `coordenadas.lng` | `clients` | `longitude` | |
| `zona` | `clients` | `zone_id` | Lookup by zone name |
| `central` | `clients` | `central_id` | Lookup by central name |
| `puntos` | `points_transactions` | `points` | Single migration transaction |
| `tier` | `client_tier_assignments` | `tier_id` | Lookup by tier name |
| `empresa` / brand ref | `client_brand_memberships` | `brand_id` | Membership per brand |
| `status` | `clients` | `status` | Map to `client_status_enum` |
| `fechaRegistro` | `clients` | `registration_date` | |
| `user_id` | `clients` | `user_id` | **NULL** — no auth.users for LEAL |

**Important:** `clients.user_id` will be NULL for migrated LEAL users. The client will create their own `auth.users` account later via the existing onboarding flow, which will associate their account with the `clients` record.

### 3. `visitas` (678 documentos) → visits + sub-tables

| MongoDB Field | Target Table | Target Column | Notes |
|---------------|-------------|---------------|-------|
| `_id` | — | `metadata.legacy_id` | |
| `asesor` | `visits` | `promotor_id` | Lookup by legacy user ID |
| `cliente` | `visits` | `client_id` | Lookup by legacy client ID |
| `fecha` | `visits` | `visit_date` | |
| `horaInicio` | `visits` | `check_in_time` | |
| `horaFin` | `visits` | `check_out_time` | |
| `status` | `visits` | `visit_status` | Map to `visit_status_enum` |
| `coordenadas` | `visits` | `check_in_latitude/longitude` | |
| `notas` | `visits` | `notes` | |
| `evidencia[]` | `visit_evidence` | Multiple rows | Photos with GPS |
| `assessment.precios` | `visit_brand_product_assessments` | Multiple rows | Product prices |
| `assessment.competencia` | `visit_competitor_assessments` | Multiple rows | Competitor prices |
| `assessment.pop` | `visit_pop_material_checks` | Multiple rows | POP checks |
| `assessment.exhibicion` | `visit_exhibition_checks` | Multiple rows | Exhibition checks |
| `assessment.general` | `visit_stage_assessments` | Multiple rows | Stage ratings |
| `pedido` | `visit_orders` | Reference | If order created during visit |

### 4. `ordenes` (433 documentos) → orders + order_items

| MongoDB Field | Target Table | Target Column | Notes |
|---------------|-------------|---------------|-------|
| `_id` | — | `metadata.legacy_id` | |
| `numero` | `orders` | `order_number` | |
| `cliente` | `orders` | `client_id` | Lookup by legacy client ID |
| `asesor` | `orders` | `created_by` | Lookup by legacy user ID |
| `fecha` | `orders` | `order_date` | |
| `status` | `orders` | `order_status` | Map to `order_status_enum` |
| `total` | `orders` | `total_amount` | |
| `subtotal` | `orders` | `subtotal` | |
| `descuento` | `orders` | `discount_amount` | |
| `items[]` | `order_items` | Multiple rows | Per-product line items |
| `items[].producto` | `order_items` | `product_id` | Lookup by legacy product |
| `items[].cantidad` | `order_items` | `quantity` | |
| `items[].precio` | `order_items` | `unit_price` | |

### 5. `contactos` (10 documentos) → **DESCARTADO**

No se migra. Datos redundantes con información de clientes.

---

## Migration Layers (Execution Order)

### L1: Config → Structure tables
**Dependencies:** None
**Creates:** tenant, brands, products, brand_competitors, brand_pop_materials, promotions, zones, centrales

1. Crear nuevo tenant en `tenants`
2. Por cada `config` (empresa):
   - Crear `brands` record
   - Crear `products` asociados a la marca
   - Crear `brand_competitors` + `brand_competitor_products`
   - Crear `brand_pop_materials`
   - Crear `promotions` activas
3. Crear `zones` del tenant
4. Crear `centrales` del tenant
5. Crear registros default: `markets`, `client_types`, `commercial_structures` (para FKs NOT NULL de clients)

### L2: Staff Users
**Dependencies:** L1 (tenant, brands, zones)
**Creates:** auth.users, user_profiles, user_roles, promotor_assignments

1. Por cada user con role ADMIN/ASESOR/COORDINADOR/USUARIO:
   - Crear `auth.users` vía Supabase Admin API (email + temp password)
   - Crear `user_profiles` (first_name, last_name, phone, tenant_id)
   - Crear `user_roles` (role mapped, tenant_id, brand_id si aplica)
   - Para ASESOR: crear `promotor_assignments` con zone_id
2. Crear `kpi_targets` para cuotas mensuales

### L3: Clients (LEAL users)
**Dependencies:** L1 (tenant, brands, zones, centrales, defaults), L2 (para assigned_by refs)
**Creates:** clients, client_brand_memberships, client_tier_assignments

1. Por cada user con role LEAL:
   - Crear `clients` (**SIN user_id** — el cliente creará su cuenta después)
   - Nuevo `public_id` secuencial (legacy ID en `metadata.legacy_user_id`)
   - zone_id, central_id por lookup de nombre
   - market_id, client_type_id, commercial_structure_id con defaults de L1
   - Crear `client_brand_memberships` por cada marca asociada
   - Crear `client_tier_assignments` por tier actual
2. Los triggers de zone sync (`20260225010000`) crearán automáticamente los `client_assignments` cuando se inserten clientes con zone_id

### L4: Visits
**Dependencies:** L2 (promotor IDs), L3 (client IDs)
**Creates:** visits, visit_stage_assessments, visit_brand_product_assessments, visit_competitor_assessments, visit_pop_material_checks, visit_exhibition_checks, visit_evidence

1. Por cada visita:
   - Crear `visits` (promotor_id, client_id por lookup)
   - Crear sub-tablas de assessment por cada sección
   - Crear `visit_evidence` por cada foto/evidencia
   - Si tiene pedido asociado, crear referencia en `visit_orders`

### L5: Orders
**Dependencies:** L2 (user IDs), L3 (client IDs), L1 (product IDs)
**Creates:** orders, order_items

1. Por cada orden:
   - Crear `orders` (client_id, created_by por lookup)
   - Crear `order_items` por cada línea de producto

### L6: Points Reconciliation
**Dependencies:** L3 (client IDs, memberships)
**Creates:** points_transactions

1. Por cada cliente con puntos > 0:
   - Crear un único `points_transactions` tipo "migration_initial_balance"
   - `description`: "Migración de saldo inicial desde PerfectApp"
   - Solo para órdenes con status `completed` en MongoDB

### L7: Assignments & KPI
**Dependencies:** L2, L3
**Creates:** client_assignments (manual overrides), kpi_targets

1. Verificar que zone sync triggers crearon los `client_assignments` correctos
2. Crear overrides manuales si hay asignaciones que no siguen el patrón de zona
3. Verificar/crear `kpi_targets` para cuotas mensuales

### L8: Verification
**Dependencies:** All previous layers

Verificaciones post-migración:

- [ ] Count validation: MongoDB docs vs PG rows per table
- [ ] Sample spot-checks: 10 random records per collection
- [ ] Points balance reconciliation: MongoDB `puntos` vs PG `points_transactions` sum
- [ ] Order totals: MongoDB `total` vs PG `orders.total_amount`
- [ ] Visit count per promotor: MongoDB vs PG
- [ ] RLS validation: queries from different user contexts return correct data
- [ ] Zone sync: all clients in assigned zones have `client_assignments` rows
- [ ] No orphan records: all FKs resolve correctly

---

## Key Challenges

### 1. public_id Format Mismatch
**Problem:** `clients.public_id` has CHECK constraint `^CLI-[0-9]{4}$` but MongoDB IDs like "IZT-0104" don't match.
**Solution:** Generate new sequential `CLI-XXXX` public_ids. Store legacy ID in `metadata.legacy_user_id`.

### 2. Auth Users — Staff Only
**Problem:** Need to create `auth.users` for staff but NOT for clients.
**Solution:** Use Supabase Admin API (`supabase.auth.admin.createUser()`) with temporary passwords for staff only. Clients get `clients.user_id = NULL` — they'll create their own account via onboarding.

### 3. Required NOT NULL FKs on clients
**Problem:** `market_id`, `client_type_id`, `commercial_structure_id` are NOT NULL.
**Solution:** Create default records for each reference table before migrating clients. Assign all migrated clients to these defaults. Admin can reassign later.

### 4. Cloudinary Image URLs
**Problem:** Evidence photos stored as Cloudinary URLs, not Supabase Storage.
**Solution:** Keep as-is initially. Store URLs in appropriate columns or metadata. Future task: migrate to Supabase Storage if needed.

### 5. Points Balance Migration
**Problem:** MongoDB stores `puntos` as a running balance. PG uses transaction log (`points_transactions`).
**Solution:** Create a single "migration_initial_balance" transaction per client with the MongoDB balance amount. Only for orders that were `completed`.

### 6. Multi-brand Clients
**Problem:** A client may be associated with multiple brands (empresas) in MongoDB.
**Solution:** Create one `client_brand_memberships` per brand association. The `clients` record is shared.

### 7. Config = Brands
**Problem:** Each `config` document represents a brand (`empresa` field), not just app configuration.
**Solution:** Each `config` document maps to one `brands` record. All config sub-documents (products, competitors, etc.) are created as related records under that brand.

### 8. Nuevo Tenant
**Problem:** Los datos migrados deben estar aislados de tenants existentes.
**Solution:** Crear un nuevo tenant. Todas las marcas, usuarios, y clientes de PerfectApp se crean dentro de este tenant. El RLS existente garantiza el aislamiento.

---

## Status Tracker

### Per-Collection Status

| Collection | Docs | Target Tables | Schema Ready | Script Ready | Migrated | Verified |
|-----------|------|---------------|-------------|-------------|----------|----------|
| `config` | 4 | brands, products, competitors, POP, promotions, zones, centrales | ⬜ | ⬜ | ⬜ | ⬜ |
| `users` (staff) | ~100 | auth.users, user_profiles, user_roles, promotor_assignments | ⬜ | ⬜ | ⬜ | ⬜ |
| `users` (LEAL) | ~361 | clients, client_brand_memberships, client_tier_assignments | ⬜ | ⬜ | ⬜ | ⬜ |
| `visitas` | 678 | visits + 6 sub-tables | ⬜ | ⬜ | ⬜ | ⬜ |
| `ordenes` | 433 | orders, order_items | ⬜ | ⬜ | ⬜ | ⬜ |
| `contactos` | 10 | — | N/A | N/A | N/A | N/A (descartado) |

### Schema Gap Status

| Gap | Description | Status |
|-----|-------------|--------|
| GAP-001 | Tabla `centrales` | ✅ Migración creada |
| GAP-002 | Zone sync triggers | ✅ Migración creada |
| GAP-003 | public_id format | ⬜ Resolver durante migración |
| GAP-004 | NOT NULL FK defaults | ⬜ Crear durante L1 |

### Migration Layer Status

| Layer | Description | Status |
|-------|-------------|--------|
| L1 | Config → structure tables | ⬜ Not started |
| L2 | Staff users | ⬜ Not started |
| L3 | Clients (LEAL) | ⬜ Not started |
| L4 | Visits | ⬜ Not started |
| L5 | Orders | ⬜ Not started |
| L6 | Points reconciliation | ⬜ Not started |
| L7 | Assignments & KPI | ⬜ Not started |
| L8 | Verification | ⬜ Not started |

---

## Migration Script Location

Scripts will be created in: `scripts/migration/`

```
scripts/migration/
├── README.md                  # Instructions
├── 01_create_tenant.ts        # L1: Create tenant + brands
├── 02_migrate_config.ts       # L1: Products, competitors, POP, etc.
├── 03_migrate_staff.ts        # L2: Staff users
├── 04_migrate_clients.ts      # L3: LEAL → clients
├── 05_migrate_visits.ts       # L4: Visits + assessments
├── 06_migrate_orders.ts       # L5: Orders + items
├── 07_reconcile_points.ts     # L6: Points balances
├── 08_verify.ts               # L8: Verification checks
└── data/                      # MongoDB JSON exports
    ├── config.json
    ├── users.json
    ├── visitas.json
    └── ordenes.json
```
