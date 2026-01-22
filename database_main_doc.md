# Database Schema Design for Compañeros en Ruta (PerfectApp) MVP V2.0

## Importante, leer primero!!
La implementacion actual de la database que ya existe en Supabase está en `database_actual.md` y el esquema completo esta en `db_esquema_actual_completo.md`

## 1. Overview del modelo

Compañeros en Ruta implements a multi-tenant SaaS architecture supporting corporate holdings (tenants) that manage one or multiple brands. Each brand operates loyalty programs and field sales operations targeting retail clients (stores/points of sale). The system uses soft isolation with strict Row Level Security (RLS) policies based on tenant_id to ensure complete data segregation.

The core data model centers around three main hierarchies: organizational (tenants → brands → users with roles), commercial (clients as retail stores that may or may not have user accounts), and operational (visits, orders, assessments, loyalty transactions). The loyalty system tracks points, tiers, and redemptions across multiple brands while maintaining brand-specific segmentation and promotion targeting.

All critical tables implement a dual ID system using internal UUIDs for relationships and human-readable public_ids for external references, with comprehensive audit trails and soft deletion patterns throughout.

## 2. Essential Schema for MVP

### tenants
**Purpose:** Corporate holdings/clients that use the platform
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, TEN-0001)
- `name` (varchar, not null) - Company name
- `slug` (varchar, unique) - URL-safe identifier for subdomains
- `status` (enum: active, inactive, suspended, default 'active')
- `subscription_plan` (enum: base, pro, enterprise, default 'base')
- `settings` (jsonb) - Tenant-specific configurations
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** One-to-many with brands, user_roles
**RLS:** Superadmin only for management operations

### brands
**Purpose:** Individual brands within a tenant that run loyalty programs
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, BRD-0001)
- `tenant_id` (uuid, FK to tenants.id, not null)
- `name` (varchar, not null) - Brand display name
- `slug` (varchar, unique) - Subdomain identifier (marca.ruta-perfectapp.com)
- `logo_url` (varchar)
- `primary_color` (varchar) - Hex color for theming
- `secondary_color` (varchar)
- `status` (enum: active, inactive, default 'active')
- `settings` (jsonb) - Brand-specific configurations
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with tenants, one-to-many with clients, user_roles, campaigns
**RLS:** Users can only access brands within their tenant and assigned brands

### clients
**Purpose:** Retail stores/points of sale that participate in loyalty programs
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, CLI-0001)
- `tenant_id` (uuid, FK to tenants.id, not null)
- `user_id` (uuid, FK to auth.users.id, nullable) - Optional link to user account
- `client_code` (varchar, unique) - Internal client reference
- `business_name` (varchar, not null)
- `contact_name` (varchar)
- `email` (varchar)
- `phone` (varchar)
- `address` (text)
- `city` (varchar)
- `state` (varchar)
- `postal_code` (varchar)
- `client_type_id` (uuid, FK to client_types.id)
- `zone_id` (uuid, FK to zones.id)
- `market_type` (enum: tradicional, moderno, premium)
- `route_to_market` (varchar) - Commercial structure designation
- `status` (enum: active, inactive, suspended, default 'active')
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with tenants, client_types, zones; optional one-to-one with auth.users; one-to-many with visits, orders, client_brands
**RLS:** Access restricted by tenant_id and assigned zones/brands for internal users

### user_profiles
**Purpose:** Extended profile information for auth.users
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, FK to auth.users.id, unique, not null)
- `tenant_id` (uuid, FK to tenants.id, not null)
- `first_name` (varchar)
- `last_name` (varchar)
- `phone` (varchar)
- `avatar_url` (varchar)
- `employee_code` (varchar)
- `status` (enum: active, inactive, suspended, default 'active')
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** One-to-one with auth.users, many-to-one with tenants, one-to-many with user_roles
**RLS:** Users can only access their own profile and profiles within their tenant (with appropriate permissions)

### user_roles
**Purpose:** Assigns users to specific roles within brands/zones
- `id` (uuid, PK, default gen_random_uuid())
- `user_id` (uuid, FK to auth.users.id, not null)
- `tenant_id` (uuid, FK to tenants.id, not null)
- `brand_id` (uuid, FK to brands.id, nullable) - Null for tenant-level roles
- `role` (enum: admin, brand_manager, supervisor, advisor, market_analyst, client)
- `zone_id` (uuid, FK to zones.id, nullable) - For zone-specific roles
- `permissions` (jsonb) - Additional granular permissions
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with auth.users, tenants, brands, zones
**RLS:** Users can only see roles within their tenant and authorized scope

### zones
**Purpose:** Geographic/commercial territories for organizing operations
- `id` (uuid, PK, default gen_random_uuid())
- `tenant_id` (uuid, FK to tenants.id, not null)
- `brand_id` (uuid, FK to brands.id, not null)
- `name` (varchar, not null)
- `code` (varchar) - Internal zone reference
- `description` (text)
- `supervisor_id` (uuid, FK to auth.users.id, nullable)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with tenants, brands; one-to-many with clients, user_roles
**RLS:** Access restricted by tenant_id and brand assignments

### client_types
**Purpose:** Categorization of retail clients for segmentation
- `id` (uuid, PK, default gen_random_uuid())
- `tenant_id` (uuid, FK to tenants.id, not null)
- `name` (varchar, not null)
- `description` (text)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with tenants, one-to-many with clients
**RLS:** Access restricted by tenant_id

### client_brands
**Purpose:** Many-to-many relationship between clients and brands with brand-specific data
- `id` (uuid, PK, default gen_random_uuid())
- `client_id` (uuid, FK to clients.id, not null)
- `brand_id` (uuid, FK to brands.id, not null)
- `status` (enum: active, inactive, pending_approval, default 'pending_approval')
- `joined_at` (timestamptz)
- `points_balance` (integer, default 0)
- `lifetime_points` (integer, default 0)
- `tier_id` (uuid, FK to loyalty_tiers.id, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

**Relationships:** Many-to-one with clients, brands, loyalty_tiers
**RLS:** Access restricted by tenant_id through related entities

### loyalty_tiers
**Purpose:** Point-based tier system for client classification
- `id` (uuid, PK, default gen_random_uuid())
- `brand_id` (uuid, FK to brands.id, not null)
- `name` (varchar, not null) - e.g., "Bronce", "Plata", "Oro"
- `min_points` (integer, not null)
- `max_points` (integer) - Null for highest tier
- `benefits` (jsonb) - Tier-specific benefits and perks
- `sort_order` (integer, default 0)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with brands, one-to-many with client_brands
**RLS:** Access restricted by tenant_id through brand relationship

### visits
**Purpose:** Field advisor visits to clients following the mandatory workflow
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, VIS-0001)
- `tenant_id` (uuid, FK to tenants.id, not null)
- `advisor_id` (uuid, FK to auth.users.id, not null)
- `client_id` (uuid, FK to clients.id, not null)
- `brand_id` (uuid, FK to brands.id, not null)
- `visit_type` (enum: scheduled, unscheduled, follow_up)
- `status` (enum: in_progress, completed, cancelled, default 'in_progress')
- `started_at` (timestamptz, default now())
- `completed_at` (timestamptz)
- `assessment_completed` (boolean, default false)
- `inventory_completed` (boolean, default false)
- `purchase_completed` (boolean, default false)
- `communication_plan_completed` (boolean, default false)
- `notes` (text)
- `location_lat` (decimal)
- `location_lng` (decimal)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with tenants, auth.users (advisor), clients, brands; one-to-many with assessments, orders, inventories
**RLS:** Advisors see only their visits, supervisors see visits in their zones, brand managers see brand visits

### assessments
**Purpose:** Product, packaging, and pricing evaluations during visits
- `id` (uuid, PK, default gen_random_uuid())
- `visit_id` (uuid, FK to visits.id, not null)
- `product_id` (uuid, FK to products.id)
- `category` (enum: product, packaging, pricing)
- `score` (integer) - 1-5 rating scale
- `observations` (text)
- `has_competitor` (boolean, default false)
- `competitor_info` (jsonb) - Details about competitive products
- `photo_urls` (jsonb) - Array of photo URLs
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

**Relationships:** Many-to-one with visits, products
**RLS:** Inherit access from parent visit

### orders
**Purpose:** Purchase transactions during visits or client-initiated orders
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, ORD-0001)
- `tenant_id` (uuid, FK to tenants.id, not null)
- `client_id` (uuid, FK to clients.id, not null)
- `brand_id` (uuid, FK to brands.id, not null)
- `visit_id` (uuid, FK to visits.id, nullable) - Null for client-initiated orders
- `order_type` (enum: visit_order, client_order)
- `supplier_type` (enum: mayorista, distribuidor, directo)
- `status` (enum: draft, submitted, confirmed, cancelled, default 'draft')
- `subtotal` (decimal(10,2))
- `tax_amount` (decimal(10,2), default 0)
- `total_amount` (decimal(10,2))
- `points_earned` (integer, default 0)
- `invoice_url` (varchar) - Optional invoice/receipt upload
- `notes` (text)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with tenants, clients, brands; optional many-to-one with visits; one-to-many with order_items, point_transactions
**RLS:** Access restricted by tenant_id and user permissions

### order_items
**Purpose:** Line items for orders with applied promotions
- `id` (uuid, PK, default gen_random_uuid())
- `order_id` (uuid, FK to orders.id, not null)
- `product_id` (uuid, FK to products.id)
- `quantity` (integer, not null)
- `unit_price` (decimal(10,2), not null)
- `discount_amount` (decimal(10,2), default 0)
- `line_total` (decimal(10,2), not null)
- `applied_promotion_id` (uuid, FK to promotions.id, nullable)
- `created_at` (timestamptz, default now())

**Relationships:** Many-to-one with orders, products, promotions
**RLS:** Inherit access from parent order

### products
**Purpose:** Brand product catalogs
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, PRD-0001)
- `brand_id` (uuid, FK to brands.id, not null)
- `sku` (varchar, unique, not null)
- `name` (varchar, not null)
- `description` (text)
- `category` (varchar)
- `unit_size` (varchar) - e.g., "90G", "225G", "500G"
- `unit_price` (decimal(10,2))
- `points_per_unit` (integer, default 0)
- `image_url` (varchar)
- `is_active` (boolean, default true)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with brands; one-to-many with order_items, assessments, inventory_items
**RLS:** Access restricted by tenant_id through brand relationship

### campaigns
**Purpose:** Marketing campaigns and promotional periods
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, CAM-0001)
- `brand_id` (uuid, FK to brands.id, not null)
- `name` (varchar, not null)
- `description` (text)
- `start_date` (date, not null)
- `end_date` (date, not null)
- `status` (enum: draft, active, paused, completed, default 'draft')
- `budget` (decimal(10,2))
- `target_metrics` (jsonb)
- `created_by` (uuid, FK to auth.users.id)
- `approved_by` (uuid, FK to auth.users.id, nullable)
- `approved_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with brands; one-to-many with promotions
**RLS:** Access restricted by tenant_id through brand relationship

### promotions
**Purpose:** Specific promotional offers with advanced segmentation
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, PRM-0001)
- `campaign_id` (uuid, FK to campaigns.id, nullable)
- `brand_id` (uuid, FK to brands.id, not null)
- `name` (varchar, not null)
- `description` (text)
- `promotion_type` (enum: percentage_discount, fixed_discount, bonus_points, free_product)
- `discount_value` (decimal(10,2))
- `bonus_points` (integer, default 0)
- `minimum_purchase` (decimal(10,2))
- `start_date` (timestamptz, not null)
- `end_date` (timestamptz, not null)
- `usage_limit_per_client` (integer)
- `total_usage_limit` (integer)
- `current_usage_count` (integer, default 0)
- `segmentation_rules` (jsonb) - Complex segmentation criteria
- `applicable_products` (jsonb) - Array of product IDs or "all"
- `status` (enum: draft, active, paused, expired, default 'draft')
- `requires_approval` (boolean, default true)
- `approved_by` (uuid, FK to auth.users.id, nullable)
- `approved_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

**Relationships:** Many-to-one with campaigns, brands; one-to-many with order_items, promotion_redemptions
**RLS:** Access restricted by tenant_id through brand relationship

### point_transactions
**Purpose:** Track all point movements (earning, spending, adjustments)
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, PTX-0001)
- `client_brand_id` (uuid, FK to client_brands.id, not null)
- `transaction_type` (enum: earned, redeemed, adjusted, expired)
- `points_amount` (integer, not null) - Positive for earning, negative for spending
- `reference_type` (enum: order, promotion_redemption, manual_adjustment, expiration)
- `reference_id` (uuid) - ID of related order, redemption, etc.
- `description` (text)
- `processed_by` (uuid, FK to auth.users.id, nullable)
- `balance_after` (integer, not null)
- `expires_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

**Relationships:** Many-to-one with client_brands, auth.users (processor)
**RLS:** Access restricted by tenant_id through client_brands relationship

## 3. Full / Extended Schema

### inventories
**Purpose:** Inventory tracking during visits (optional step)
- `id` (uuid, PK, default gen_random_uuid())
- `visit_id` (uuid, FK to visits.id, not null)
- `total_items_counted` (integer, default 0)
- `notes` (text)
- `photo_urls` (jsonb)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

**Relationships:** Many-to-one with visits; one-to-many with inventory_items
**RLS:** Inherit access from parent visit

### inventory_items
**Purpose:** Individual product counts within inventory
- `id` (uuid, PK, default gen_random_uuid())
- `inventory_id` (uuid, FK to inventories.id, not null)
- `product_id` (uuid, FK to products.id, not null)
- `quantity_counted` (integer, not null)
- `expiry_date` (date, nullable)
- `condition_notes` (text)
- `created_at` (timestamptz, default now())

### communication_plans
**Purpose:** Marketing material deployment plans during visits
- `id` (uuid, PK, default gen_random_uuid())
- `visit_id` (uuid, FK to visits.id, not null)
- `material_type` (enum: poster, banner, display, shelf_talker, other)
- `material_name` (varchar)
- `action` (enum: installed, removed, replaced, planned_installation)
- `location_description` (text)
- `installation_date` (date)
- `photo_before_url` (varchar)
- `photo_after_url` (varchar)
- `notes` (text)
- `created_at` (timestamptz, default now())

### promotion_redemptions
**Purpose:** Track individual promotion usage
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, PRR-0001)
- `promotion_id` (uuid, FK to promotions.id, not null)
- `client_brand_id` (uuid, FK to client_brands.id, not null)
- `order_id` (uuid, FK to orders.id, nullable)
- `redemption_date` (timestamptz, default now())
- `discount_applied` (decimal(10,2))
- `points_awarded` (integer, default 0)
- `created_at` (timestamptz, default now())

### rewards
**Purpose:** Loyalty program rewards catalog
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, RWD-0001)
- `brand_id` (uuid, FK to brands.id, not null)
- `name` (varchar, not null)
- `description` (text)
- `points_cost` (integer, not null)
- `reward_type` (enum: discount, product, service, cashback)
- `reward_value` (decimal(10,2))
- `stock_quantity` (integer, nullable)
- `image_url` (varchar)
- `terms_and_conditions` (text)
- `is_active` (boolean, default true)
- `valid_from` (date)
- `valid_until` (date, nullable)
- `tier_restrictions` (jsonb) - Array of tier IDs that can access
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

### reward_redemptions
**Purpose:** Track reward redemptions by clients
- `id` (uuid, PK, default gen_random_uuid())
- `public_id` (varchar, unique, RRD-0001)
- `reward_id` (uuid, FK to rewards.id, not null)
- `client_brand_id` (uuid, FK to client_brands.id, not null)
- `points_spent` (integer, not null)
- `status` (enum: pending, approved, delivered, cancelled)
- `redemption_date` (timestamptz, default now())
- `approved_by` (uuid, FK to auth.users.id, nullable)
- `delivery_notes` (text)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

### surveys
**Purpose:** Market research surveys and assessments
- `id` (uuid, PK, default gen_random_uuid())
- `brand_id` (uuid, FK to brands.id, not null)
- `title` (varchar, not null)
- `description` (text)
- `survey_type` (enum: assessment, market_research, feedback)
- `target_audience` (enum: clients, advisors, general)
- `questions` (jsonb) - Survey structure and questions
- `is_active` (boolean, default true)
- `start_date` (date)
- `end_date` (date, nullable)
- `created_by` (uuid, FK to auth.users.id)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)
- `deleted_at` (timestamptz)

### survey_responses
**Purpose:** Individual survey responses
- `id` (uuid, PK, default gen_random_uuid())
- `survey_id` (uuid, FK to surveys.id, not null)
- `respondent_id` (uuid, FK to auth.users.id, nullable)
- `client_id` (uuid, FK to clients.id, nullable)
- `visit_id` (uuid, FK to visits.id, nullable)
- `responses` (jsonb) - Answer data
- `completion_status` (enum: complete, partial, abandoned)
- `completion_time_minutes` (integer)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

### dashboard_configs
**Purpose:** Brand-specific dashboard metric configurations
- `id` (uuid, PK, default gen_random_uuid())
- `brand_id` (uuid, FK to brands.id, not null)
- `user_id` (uuid, FK to auth.users.id, not null)
- `metric_1` (varchar) - Selected metric type
- `metric_2` (varchar)
- `metric_3` (varchar)
- `metric_4` (varchar)
- `metric_5` (varchar)
- `refresh_frequency` (enum: manual, hourly, daily, weekly, default 'manual')
- `last_refreshed` (timestamptz)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

### ai_insights
**Purpose:** Generated AI insights for brand dashboards
- `id` (uuid, PK, default gen_random_uuid())
- `brand_id` (uuid, FK to brands.id, not null)
- `insight_type` (enum: rationale, problem, opportunity)
- `title` (varchar)
- `content` (text)
- `confidence_score` (decimal(3,2)) - 0.00-1.00
- `data_sources` (jsonb) - References to underlying data
- `is_active` (boolean, default true)
- `generated_at` (timestamptz, default now())
- `expires_at` (timestamptz)
- `created_at` (timestamptz, default now())

### audit_logs
**Purpose:** Comprehensive audit trail for all critical actions
- `id` (uuid, PK, default gen_random_uuid())
- `tenant_id` (uuid, FK to tenants.id, not null)
- `user_id` (uuid, FK to auth.users.id, nullable)
- `action` (varchar, not null) - Action performed
- `resource_type` (varchar, not null) - Table/entity affected
- `resource_id` (uuid) - ID of affected record
- `old_values` (jsonb) - Previous state
- `new_values` (jsonb) - New state
- `ip_address` (inet)
- `user_agent` (text)
- `session_id` (varchar)
- `context` (jsonb) - Additional context data
- `severity` (enum: low, medium, high, critical, default 'medium')
- `created_at` (timestamptz, default now())

### notifications
**Purpose:** System notifications for users
- `id` (uuid, PK, default gen_random_uuid())
- `tenant_id` (uuid, FK to tenants.id, not null)
- `user_id` (uuid, FK to auth.users.id, not null)
- `notification_type` (enum: system, promotion, order, visit, achievement)
- `title` (varchar, not null)
- `message` (text, not null)
- `action_url` (varchar) - Deep link for action
- `is_read` (boolean, default false)
- `priority` (enum: low, medium, high, urgent, default 'medium')
- `metadata` (jsonb) - Additional notification data
- `scheduled_for` (timestamptz, default now())
- `sent_at` (timestamptz, nullable)
- `created_at` (timestamptz, default now())

### system_settings
**Purpose:** Global system and tenant-specific configuration
- `id` (uuid, PK, default gen_random_uuid())
- `tenant_id` (uuid, FK to tenants.id, nullable) - Null for global settings
- `setting_category` (varchar, not null) - Group related settings
- `setting_key` (varchar, not null)
- `setting_value` (text)
- `setting_type` (enum: string, integer, decimal, boolean, json)
- `is_encrypted` (boolean, default false)
- `description` (text)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz)

### scheduled_jobs
**Purpose:** Track background job execution and status
- `id` (uuid, PK, default gen_random_uuid())
- `job_name` (varchar, not null)
- `job_type` (enum: daily_close, promotion_expiry, metrics_digest, cleanup)
- `status` (enum: pending, running, completed, failed)
- `scheduled_for` (timestamptz, not null)
- `started_at` (timestamptz, nullable)
- `completed_at` (timestamptz, nullable)
- `error_message` (text, nullable)
- `execution_time_ms` (integer)
- `metadata` (jsonb)
- `created_at` (timestamptz, default now())

## 4. Resumen de RLS / Seguridad

### Admin Role
**Can see:** All data within their tenant across all brands, user management panels, system-wide metrics and audit logs, approval queues for brand requests
**Can create:** Users, brands, zones, client types, approve/reject promotions and campaigns, manual point adjustments, system notifications
**Can update:** Any profile that cannot self-manage, brand configurations, promotion statuses, user role assignments, system settings within tenant
**Restrictions:** Cannot access data outside their tenant_id, cannot modify other tenants' data, all actions logged in audit trail

### Brand Manager Role
**Can see:** All data specific to their assigned brand(s), dashboard with 5 configurable metrics, client lists within brand scope, campaign performance, AI-generated insights
**Can create:** Promotions (requires approval), campaigns (requires approval), products, assessments, surveys, data export requests (requires approval)
**Can update:** Own profile, brand settings, promotion drafts before approval, product catalog, survey configurations
**Restrictions:** Limited to assigned brand_id(s) within tenant, cannot approve own requests, cannot access other brands' sensitive data, promotion approvals required

### Supervisor Role
**Can see:** All advisors in assigned zone(s), client statistics within zone, visit completion rates, performance metrics for their team, zone-specific campaigns
**Can create:** Communications/messages to advisors, client assignments, visit schedules, approval decisions for advisor actions
**Can update:** Client information in their zone, advisor assignments, visit approvals for large orders, communication plans
**Restrictions:** Limited to assigned zone_id(s) and brand_id(s), cannot see advisor performance outside their zones, approval authority limited by thresholds

### Advisor Role
**Can see:** Assigned clients list, own visit history, applicable promotions for each client, product catalog, personal performance metrics
**Can create:** Visits, assessments, orders, inventory records, communication plans, survey responses, client check-ins
**Can update:** Own visits in progress, assessment scores, inventory counts, order details before submission, communication plan status
**Restrictions:** Can only see clients in assigned zone(s) and brand(s), cannot access other advisors' data, large orders may require supervisor approval

### Market Analyst Role
**Can see:** Assigned surveys and completion statistics, aggregate response data, completion goals and progress, statistical summaries
**Can create:** Survey analysis reports, completion reminders, statistical exports (with approval)
**Can update:** Survey assignments, analysis notes, completion tracking
**Restrictions:** Cannot see individual survey responses, limited to assigned surveys only, subordinate to supervisor approvals, no client PII access

### Client Role
**Can see:** Own multi-brand profile, benefits across all registered brands, available promotions, order history, points balance per brand, rewards catalog
**Can create:** Orders, promotion redemptions, profile update requests, brand registration requests
**Can update:** Own contact information, preferences, password, communication settings
**Restrictions:** Can only see brands where they have active client_brands relationship, cannot access other clients' data, cannot see internal brand operations, limited to own tenant scope through client relationship

### Global Security Rules
- All RLS policies enforced at database level using tenant_id filtering
- Soft deletion prevents accidental data loss while maintaining referential integrity
- Audit logging captures all critical actions with user context and IP tracking
- Session management through Supabase Auth with role-based middleware validation
- API endpoints validate user permissions before database operations
- File uploads restricted by role and scoped to appropriate tenant/brand directories

Modificaciones requeridas para loyalty_tiers
📋 Cambios ÚNICOS a la tabla loyalty_tiers
Campos a AGREGAR:

tenant_id (uuid, FK to tenants.id, not null) - Para permitir que cada tenant defina sus propios tiers
tier_code (varchar, not null) - Código manejable que usa la marca (ej: "BRONZE", "SILVER", "GOLD")
tier_level (integer, not null) - Orden jerárquico numérico (1=más bajo, 5=más alto)
external_tier_id (varchar, nullable) - ID/código que maneja la marca externamente
is_default (boolean, default false) - Tier por defecto para nuevos clientes de esa brand
configuration (jsonb) - Configuraciones adicionales específicas del tenant
can_be_auto_assigned (boolean, default true) - Si el sistema puede asignar este tier automáticamente

Campos a MODIFICAR:

min_points → nullable - Algunas marcas no clasifican solo por puntos
max_points → nullable - Misma razón

Campos EXISTENTES que se mantienen:

brand_id (sigue siendo not null) - Cada tier pertenece a una brand específica
name, benefits, sort_order, is_active, etc.

🔗 Cambios menores en client_brands
Campos a AGREGAR:

tier_assigned_at (timestamptz, nullable) - Cuándo se asignó el tier actual
tier_assigned_by (uuid, FK to auth.users.id, nullable) - Quién lo asignó manualmente (null = automático)
external_tier_sync_data (jsonb, nullable) - Datos de sincronización con sistema externo

🆕 Nueva tabla: client_tier_changes
Propósito: Auditoría de cambios de tier (simple y directo)
Campos:

id (uuid, PK)
client_id (uuid, FK to clients.id, not null) - El cliente que cambió
brand_id (uuid, FK to brands.id, not null) - La brand donde cambió
previous_tier_id (uuid, FK to loyalty_tiers.id, nullable) - Tier anterior (null = primer asignación)
new_tier_id (uuid, FK to loyalty_tiers.id, not null) - Tier nuevo
change_reason (enum: 'points_threshold', 'manual_assignment', 'external_sync', 'tier_recalculation')
changed_by (uuid, FK to auth.users.id, nullable) - Usuario que hizo cambio manual
points_at_change (integer, default 0) - Puntos que tenía cuando cambió
notes (text, nullable) - Notas del cambio
created_at (timestamptz, default now())

⚙️ Constraints y validaciones nuevas
Unique constraints:

(tenant_id, brand_id, tier_code) - Códigos únicos por brand
(brand_id, tier_level) - Levels únicos por brand

Check constraints:

tier_level > 0 - Levels positivos
brand_id IN (SELECT id FROM brands WHERE tenant_id = loyalty_tiers.tenant_id) - Coherencia tenant-brand

Indexes necesarios:

(tenant_id, brand_id, tier_level) - Consultas por jerarquía
(brand_id, tier_code) - Búsquedas por código
(external_tier_id, tenant_id) - Sincronización externa

📈 Cómo queda el flujo:
1. Tenant define tiers para cada brand:
   - Coca-Cola: BRONZE(1), SILVER(2), GOLD(3), PLATINUM(4)
   - Pepsi: BASIC(1), PREMIUM(2), VIP(3)

2. Cliente se registra en multiple brands:
   - client_brands para Coca-Cola → tier_id = BRONZE
   - client_brands para Pepsi → tier_id = BASIC

3. Cliente sube puntos:
   - Sistema recalcula tier automáticamente
   - Se registra cambio en client_tier_changes
   - Se actualiza client_brands.tier_id

4. Auditoría completa:
   - client_tier_changes tiene historial completo
   - client_brands tiene estado actual
Resultado: Cada tenant controla completamente sus tiers, cada brand puede tener tiers diferentes, y hay auditoría completa sin duplicación de lógica.

🔄 Nueva tabla: tenant_tier_configs
Propósito: Configuraciones de sistema de tiers por tenant
Campos:

id (uuid, PK)
tenant_id (uuid, FK to tenants.id, unique, not null)
tier_system_type (enum: 'points_based', 'purchase_based', 'manual', 'external_api')
auto_tier_calculation (boolean, default true) - Si recalcula tiers automáticamente
tier_recalculation_frequency (enum: 'daily', 'weekly', 'monthly', 'manual')
external_tier_api_endpoint (varchar, nullable) - URL si usa API externa
external_tier_api_config (jsonb) - Headers, auth, etc.
custom_tier_rules (jsonb) - Reglas personalizadas de clasificación
last_sync_at (timestamptz, nullable)
created_at, updated_at, deleted_at
