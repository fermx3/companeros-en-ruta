# Supabase Database Skill

## Arquitectura de Base de Datos

**Compañeros en Ruta** utiliza **PostgreSQL** vía **Supabase** con arquitectura **multi-tenant estricta**:

```
Tenants (Empresas)
├── Brands (Marcas)
├── Users (Usuarios)
├── Clients (Clientes/Negocios)
├── Zones (Zonas geográficas)
├── Products (Catálogo)
└── Orders/Visits (Transacciones)
```

## Esquema Actual Verificado

### Core Tables

```sql
-- Multi-tenancy base
tenants (id, name, slug, status, settings...)
brands (id, tenant_id, name, slug, logo_url, colors...)

-- Usuarios y roles
user_profiles (id, tenant_id, user_id, first_name, last_name, position, phone, avatar_url...)
user_roles (id, tenant_id, user_profile_id, brand_id, role, scope, status, granted_by, deleted_at...)
distributors (id, tenant_id, name, rfc, contact_info...)

-- Estructura comercial
zones (id, tenant_id, name, code, zone_type, description, is_active...)
markets (id, tenant_id, name, code, description, is_active...)
client_types (id, tenant_id, name, code, category, description, is_active...)
commercial_structures (id, tenant_id, name, code, structure_type, description, is_active...)

-- Clientes y membresías
clients (id, tenant_id, business_name, owner_name, phone, email,
         zone_id, market_id, client_type_id, commercial_structure_id,
         address_street, address_city, address_state, address_postal_code,
         latitude, longitude, status, user_id, notes...)
client_brand_memberships (id, tenant_id, client_id, brand_id, membership_status,
                          is_primary_brand, current_tier_id, points...)
client_assignments (id, tenant_id, client_id, user_profile_id, brand_id, is_active, deleted_at...)

-- Sistema QR (reciente)
qr_codes (id, tenant_id, client_id, code, status, max_redemptions...)
qr_redemptions (id, qr_code_id, redeemed_by, status...)

-- Productos y órdenes
products (id, tenant_id, brand_id, category_id, name, sku, base_price, unit_type,
          weight_grams, volume_ml, is_active, include_in_assessment...)
orders (id, tenant_id, client_id, brand_id, order_number, order_status, total_amount...)
order_items (id, order_id, product_id, quantity, unit_price, total_price...)

-- Visitas y tracking
visits (id, tenant_id, client_id, promotor_id, visit_status, workflow_status,
        scheduled_date, check_in_at, check_out_at, notes...)
visit_stage_assessments (id, visit_id, stage_type, assessment_data...)
visit_brand_product_assessments (id, visit_id, product_id, stock_level, shelf_position...)
visit_competitor_assessments (id, visit_id, competitor_id, presence_level...)
visit_pop_material_checks (id, visit_id, material_id, condition...)
visit_exhibition_checks (id, visit_id, brand_id, exhibition_data...)
visit_orders (id, tenant_id, visit_id, order_number, order_status...)
visit_order_items (id, tenant_id, visit_order_id, product_id, quantity, unit_price...)
```

### Enums Criticos

```sql
-- Roles de usuario (NO incluye 'client' — clientes usan clients.user_id directamente)
user_role_type_enum: 'admin' | 'brand_manager' | 'supervisor' | 'promotor' | 'asesor_de_ventas' | 'market_analyst'

-- Estados de QR
qr_status_enum: 'active' | 'fully_redeemed' | 'expired' | 'cancelled'

-- Estados de visita
visit_status_enum: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

-- Workflow de visita
visit_workflow_status_enum: 'not_started' | 'check_in' | 'assessment' | 'ordering' | 'communication' | 'check_out' | 'completed'

-- Estados de orden
order_status_enum: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

-- Estados de orden de visita
visit_order_status_enum: 'draft' | 'pending' | 'confirmed' | 'cancelled'

-- Estados de user_roles
user_role_status_enum: 'active' | 'inactive' | 'suspended' | 'expired'

-- Nivel de stock observado
stock_level_observed_enum: 'out_of_stock' | 'low' | 'medium' | 'high' | 'overstock'

-- Condición de material POP
material_condition_enum: 'good' | 'damaged' | 'missing' | 'not_applicable'

-- Tipo de promoción
promotion_type_enum: 'discount_percentage' | 'discount_amount' | 'buy_x_get_y' | 'points_multiplier' | 'free_product' | 'bundle'
```

## Column Name Pitfalls

**Complementa la sección de CLAUDE.md.** Estos son errores frecuentes descubiertos durante desarrollo:

| Tabla | Incorrecto | Correcto | Notas |
|-------|-----------|----------|-------|
| `user_profiles` | `auth_user_id` | `user_id` | Links to `auth.users.id` |
| `user_profiles` | `full_name` | `first_name`, `last_name` | Concatenar para display |
| `user_profiles` | `job_title` | `position` | Cargo del usuario |
| `user_roles` | `user_id` | `user_profile_id` | FK a `user_profiles.id`, NO a `auth.users.id` |
| `user_roles` | `is_active` | `status` | Enum `user_role_status_enum` + `deleted_at` para soft-delete |
| `clients` | `contact_name` | `owner_name` | Nombre del dueño del negocio |
| `clients` | `contact_phone` | `phone` | Teléfono directo |
| `clients` | `contact_email` | `email` | Email directo |
| `clients` | `address_zip` | `address_postal_code` | Código postal |
| `clients` | `client_status` | `status` | Estado simple (text, not enum) |
| `client_assignments` | `user_id` | `user_profile_id` | Renombrado de `promotor_id` |
| `client_assignments` | `role` | `is_active` | No tiene columna role, usa boolean |
| `tiers` | `points_threshold` | `min_points_required` | Puntos mínimos para el tier |
| `tiers` | `multiplier` | `points_multiplier` | Multiplicador de puntos |
| `products` | `code` | `sku` | Renombrado |
| `visits` | `status` | `visit_status` | Enum `visit_status_enum` |
| `visits` | `advisor_id` | `promotor_id` | Renombrado |
| `orders` | `status` | `order_status` | Enum `order_status_enum` |
| `visit_orders` | `status` | `order_status` | Enum `visit_order_status_enum` |
| `zones` | `brand_id` | *(no existe)* | Zones NO son brand-scoped |
| `zones` | `supervisor_id` | *(no existe)* | Zones no tienen supervisor directo |

## TypeScript Types File

**`src/lib/types/database.ts`** is the canonical TypeScript reference for all table interfaces.

- Consult **before** writing any Supabase query
- Contains correct column names, nullable fields, and enum values
- **Must be updated** whenever a migration changes the schema

## Row Level Security (RLS)

**TODAS las tablas tienen RLS habilitado**. Políticas por patrón:

### 1. Tenant Isolation
```sql
-- Ejemplo: usuarios solo ven datos de su tenant
CREATE POLICY "Users can only see own tenant data" ON user_profiles
  FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');
```

### 2. Brand Scope
```sql
-- Ejemplo: brand managers solo ven su marca
CREATE POLICY "Brand users see own brand" ON clients
  FOR ALL USING (
    brand_id IN (
      SELECT ur.brand_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
      AND ur.status = 'active'
      AND ur.deleted_at IS NULL
    )
  );
```

### 3. Role-Based Access
```sql
-- Solo admins pueden crear usuarios
CREATE POLICY "Admin can create users" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_profiles up ON ur.user_profile_id = up.id
      WHERE up.user_id = auth.uid()
      AND ur.role = 'admin'
      AND ur.status = 'active'
      AND ur.deleted_at IS NULL
    )
  );
```

### 4. Client Assignment (Promotores/Asesores)
```sql
-- Promotores solo ven clientes asignados
CREATE POLICY "Promotor sees assigned clients" ON clients
  FOR ALL USING (
    id IN (
      SELECT client_id FROM client_assignments
      WHERE user_profile_id IN (
        SELECT id FROM user_profiles WHERE user_id = auth.uid()
      )
      AND is_active = true
      AND deleted_at IS NULL
    )
  );
```

## Migraciones y Control de Cambios

### Flujo Obligatorio
1. **Crear migración** en `/supabase/migrations/YYYYMMDDHHMMSS_descripción.sql`
2. **Aplicar localmente**: `supabase db reset` o `supabase migration apply`
3. **Validar RLS**: testear políticas con diferentes roles
4. **Deploy remoto**: `supabase db push` (solo cuando esté listo para producción)

### Nomenclatura de Migraciones
```
20260209010000_create_qr_system.sql
20260208090000_make_orders_brand_id_nullable.sql
20260207220000_rename_advisor_to_promotor.sql
```

### Template de Migración
```sql
-- ============================================================================
-- Migration: [Descripción clara]
-- ============================================================================
-- [Explicación del cambio y su impacto]
-- ============================================================================

BEGIN;

-- DDL changes
CREATE TABLE IF NOT EXISTS nueva_tabla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    -- otros campos...
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers para updated_at
CREATE TRIGGER trigger_nueva_tabla_updated_at
    BEFORE UPDATE ON nueva_tabla
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users see own tenant data" ON nueva_tabla
    FOR ALL USING (tenant_id = auth.jwt() ->> 'tenant_id');

COMMIT;
```

## Funciones y Triggers Disponibles

### Funciones del Sistema
```sql
-- Auto-actualizar updated_at
update_updated_at_column() → TRIGGER

-- Generar public_ids (formato: PRE-XXXX)
generate_public_id(prefix TEXT, length INT) → VARCHAR
-- Tablas con public_id: clients, orders, visits, products, etc.

-- Manejar nuevo usuario (trigger on auth.users)
handle_new_user() → TRIGGER
-- Auto-crea user_profiles con datos de raw_user_meta_data
```

### Validation Triggers

Estas funciones se ejecutan como BEFORE INSERT OR UPDATE triggers y validan datos antes de persistir:

| Función | Tabla | Restricciones clave |
|---------|-------|-------------------|
| `validate_market_data()` | `markets` | `code`: regex `^[A-Z]{1,5}$` |
| `validate_client_type_data()` | `client_types` | `code`: regex `^[A-Z]{1,10}$` |
| `validate_commercial_structure_data()` | `commercial_structures` | `code`: regex `^[A-Z]{1,5}$`, `structure_type` NOT NULL |
| `validate_zone_data()` | `zones` | `code` y `zone_type` requeridos |
| `validate_tier_data()` | `tiers` | `benefits`: JSON array de `{type, description}`. Types válidos: `discount`, `free_delivery`, `priority_support`, `exclusive_products`, `bonus_points`, `early_access`, `custom_service`. Cols: `min_points_required`, `points_multiplier` |
| `validate_visit_data()` | `visits` | `promotor_id` **must** have role `'promotor'` or `'supervisor'` (NOT `'asesor_de_ventas'`!) |
| `validate_visit_order_data()` | `visit_orders` | Accepts roles: `'promotor'`, `'supervisor'`, `'asesor_de_ventas'` |
| `validate_order_data()` | `orders` | Valida tenant consistency, brand/client coherence |
| `validate_promotion_data()` | `promotions` | Type-specific: `buy_x_get_y` needs `buy_quantity`+`get_quantity`; `points_multiplier` needs value `> 1.00`; `discount_percentage` needs `discount_percentage`; `discount_amount` needs `discount_amount` |
| `validate_primary_brand_unique()` | `client_brand_memberships` | BEFORE INSERT — fires **before** ON CONFLICT is evaluated |
| `validate_client_data()` | `clients` | Valida tenant consistency para zone, market, client_type |
| `validate_client_brand_membership_data()` | `client_brand_memberships` | Coherencia brand-tenant, membership_status válido |
| `validate_product_data()` | `products` | Brand/category tenant consistency, precio > 0 |
| `validate_product_category_data()` | `product_categories` | Jerarquía (parent level + 1), prevención de ciclos, max depth 10 |
| `validate_campaign_data()` | `campaigns` | Fechas, presupuesto, tipo de campaña |
| `validate_points_transaction_data()` | `points_transactions` | Balance, tipo de transacción |
| `validate_reward_data()` | `rewards` | Costo en puntos, disponibilidad |
| `validate_visit_assessment_data()` | `visit_stage_assessments` | Stage type válido, datos de assessment |
| `validate_visit_inventory_data()` | `visit_brand_product_assessments` | Stock level, product-brand coherence |
| `validate_client_invoice_data()` | `client_invoice_data` | RFC format, datos fiscales |
| `validate_preferred_invoice_data_unique()` | `client_invoice_data` | Solo un registro preferido por cliente |
| `validate_default_tier_unique()` | `tiers` | Solo un tier default por brand |
| `validate_single_primary_role()` | `user_roles` | Gestión de rol primario |
| `validate_current_tier_assignment_unique()` | `client_tier_assignments` | Solo una asignación actual |

### Enum Casts en PL/pgSQL

Cuando insertes datos directamente en SQL (seeds, migraciones), los valores de tipo enum requieren cast explícito:

```sql
-- Ejemplos de cast requeridos en PL/pgSQL
'out_of_stock'::stock_level_observed_enum
'good'::material_condition_enum
'in_progress'::visit_status_enum
'check_in'::visit_workflow_status_enum
'active'::user_role_status_enum
'discount_percentage'::promotion_type_enum
```

## Queries Críticas y Patrones

### 1. Multi-tenant Safe Queries
```sql
-- CORRECTO: incluye tenant_id
SELECT * FROM clients
WHERE tenant_id = current_setting('app.current_tenant')
  AND zone_id = $1;

-- INCORRECTO: puede filtrar cross-tenant
SELECT * FROM clients WHERE zone_id = $1;
```

### 2. RLS-Aware Joins
```sql
-- Las políticas RLS se aplican automáticamente
SELECT c.*, b.name as brand_name, z.name as zone_name
FROM clients c
JOIN client_brand_memberships cbm ON c.id = cbm.client_id
JOIN brands b ON cbm.brand_id = b.id
JOIN zones z ON c.zone_id = z.id
WHERE c.status = 'active';
```

### 3. Aggregaciones Seguras
```sql
-- Dashboard metrics respetando RLS
SELECT
  COUNT(*) as total_clients,
  COUNT(*) FILTER (WHERE cbm.membership_status = 'active') as active_clients,
  AVG(cbm.total_points) as avg_points
FROM client_brand_memberships cbm
WHERE cbm.brand_id = $1;
```

## Gestión de Datos de Desarrollo

### Seed Data — Auth User Creation Pattern

Para crear usuarios demo, se deben insertar directamente en `auth.users`. El trigger `handle_new_user()` auto-crea el `user_profile`:

```sql
-- Hash password una vez
v_password_hash := extensions.crypt('Demo2026!', extensions.gen_salt('bf'));

-- Insertar auth user (trigger crea user_profile automáticamente)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  is_sso_user, deleted_at
)
VALUES (
  'uuid-deterministic',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'user@demo.companerosenruta.com', v_password_hash,
  now(),
  jsonb_build_object('tenant_id', v_tenant_id, 'first_name', 'Nombre', 'last_name', 'Apellido'),
  '{"provider":"email","providers":["email"]}'::jsonb,
  now(), now(), '', '', false, null
)
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

-- Luego consultar el profile generado:
SELECT id INTO v_profile_id FROM user_profiles WHERE user_id = 'uuid-deterministic';

-- Asignar roles (user_roles usa user_profile_id, NO user_id):
INSERT INTO user_roles (tenant_id, user_profile_id, role, scope, brand_id, status, granted_by)
VALUES (v_tenant_id, v_profile_id, 'admin', 'tenant', NULL, 'active', v_profile_id)
ON CONFLICT DO NOTHING;
```

**Ver:** `scripts/seed_demo_data.sql` para el seed completo de usuarios demo.
**Referencia rápida:** `scripts/DEMO_USERS.md` para credenciales y roles.

### Idempotency Patterns for Seed Data

1. **BEFORE INSERT triggers fire before ON CONFLICT** — no se puede usar `ON CONFLICT DO NOTHING` en tablas con validation triggers como `validate_primary_brand_unique()`. Usar `IF NOT EXISTS` check:
```sql
IF NOT EXISTS (
  SELECT 1 FROM client_brand_memberships
  WHERE client_id = v_client_id AND brand_id = v_brand_id
) THEN
  INSERT INTO client_brand_memberships (...) VALUES (...);
END IF;
```

2. **Tables sin unique en composite columns** — check manual antes de INSERT.

3. **Sequences (`*public_id_seq`)** — avanzar con `setval()` para evitar colisiones:
```sql
PERFORM setval('public.' || rec.sequencename,
               GREATEST(nextval('public.' || rec.sequencename), 5000), true);
```

### Backup/Restore
```bash
# Importar backup local
bash ./scripts/import_local_backup.sh

# Exportar backup remoto
bash ./scripts/export_remote_backup.sh

# Reset completo (re-aplica todas las migraciones)
npx supabase db reset
```

## Monitoring y Performance

### Índices Críticos
```sql
-- RLS performance
CREATE INDEX idx_user_roles_profile_active
  ON user_roles(user_profile_id, status) WHERE deleted_at IS NULL;

-- Queries frecuentes
CREATE INDEX idx_orders_client_date ON orders(client_id, created_at DESC);
CREATE INDEX idx_visits_promotor_status ON visits(promotor_id, visit_status);
CREATE INDEX idx_client_assignments_active
  ON client_assignments(user_profile_id, client_id) WHERE is_active = true AND deleted_at IS NULL;
```

### Query Analysis
```sql
-- Verificar uso de índices
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM clients WHERE tenant_id = 'xxx' AND zone_id = 'yyy';

-- Stats de RLS
SELECT schemaname, tablename, rowsecurity, enablerls
FROM pg_tables WHERE schemaname = 'public';
```

## Debugging RLS

### Test Policies Manually
```sql
-- Simular contexto de usuario
SET role authenticated;
SET request.jwt.claims TO '{"sub": "user-id", "tenant_id": "tenant-xxx"}';

-- Probar query
SELECT * FROM clients;

-- Reset
RESET role;
RESET request.jwt.claims;
```

### Common RLS Issues
```sql
-- Política demasiado restrictiva
SELECT * FROM pg_policies WHERE tablename = 'clients';

-- Verificar contexto auth
SELECT auth.uid(), auth.jwt();

-- Debug policy
SELECT * FROM clients WHERE (
  -- copiar lógica de política aquí
  tenant_id = auth.jwt() ->> 'tenant_id'
);
```

---

## REGLAS CRITICAS DE SEGURIDAD

1. **NUNCA** deshabilitar RLS temporalmente
2. **SIEMPRE** incluir `tenant_id` en políticas
3. **VALIDAR** que las migraciones no rompan RLS existente
4. **PROBAR** políticas con múltiples roles antes de deploy
5. **DOCUMENTAR** cualquier función que modifique múltiples tenants
6. **USAR** `SECURITY DEFINER` con extremo cuidado
7. **NUNCA** hardcodear IDs de tenant/brand en código

## Proceso de Emergencia

Si RLS se rompe en producción:
1. **Identificar** tabla/política afectada
2. **Crear** migración de hotfix
3. **Aplicar** con rollback plan preparado
4. **Verificar** que el fix no afecte otros tenants
5. **Documentar** en post-mortem
