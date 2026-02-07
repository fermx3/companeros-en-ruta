# MVP Status - Compañeros en Ruta

**Last Updated:** 2026-02-05
**Target:** User testing with all roles working at MVP level + Brand Affiliation System

---

## Quick Summary

| Role | Status | Ready for Testing |
|------|--------|-------------------|
| Admin | ✅ Complete | Yes |
| Brand Manager | ✅ Complete | Yes |
| Advisor (Asesor) | ✅ Complete | Yes |
| Supervisor | ✅ Complete | Yes |
| Client | ✅ Complete | Yes |

| System | Status | Ready for Testing |
|--------|--------|-------------------|
| Brand Affiliation | ✅ Complete | Yes |
| Tier System | ✅ Complete | Yes |
| Points System | ✅ Complete | Yes |

**Overall MVP Progress: ~95%** (Dashboards + Brand Affiliation + Tiers + Points + Visit Management complete)

---

## ADMIN Role

### Authentication & Access
- [x] Login flow with Supabase Auth
- [x] Role-based routing to `/admin`
- [x] Protected routes via middleware
- [x] Session management

### Dashboard (`/admin`)
- [x] Dashboard page exists and loads
- [x] Real data from database (not mock)
- [x] Metrics cards (Brands, Clients, Users, Visits)
- [x] Monthly revenue display
- [x] Recent activity log

### User Management
- [x] List all users (`/admin/users`)
- [x] Create new user (`/admin/users/create`)
- [x] Invite user via email (`/admin/users/invite`)
- [x] View user profile (`/admin/users/[id]`)
- [x] Manage user roles (`/admin/users/[id]/roles`)
- [x] API: `POST /api/admin/users/create`
- [ ] Edit user profile
- [ ] Deactivate/delete user

### Brand Management
- [x] List all brands (`/admin/brands`)
- [x] Create new brand (`/admin/brands/create`)
- [x] Edit brand (`/admin/brands/[id]/edit`)
- [x] API: `GET /api/admin/brands`
- [x] API: `POST /api/admin/brands`
- [ ] Delete/archive brand

### Client Management
- [x] List all clients (`/admin/clients`)
- [x] Create new client (`/admin/clients/create`)
- [x] View client details (`/admin/clients/[clientId]`)
- [x] Edit client (`/admin/clients/[clientId]/edit`)
- [x] API: `GET /api/admin/clients`
- [x] API: `POST /api/admin/clients/create`
- [ ] Delete/archive client

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/admin/metrics` | GET | ✅ |
| `/api/admin/brands` | GET | ✅ |
| `/api/admin/brands` | POST | ✅ |
| `/api/admin/users/create` | POST | ✅ |
| `/api/admin/users/invite` | GET | ✅ |
| `/api/admin/clients` | GET | ✅ |
| `/api/admin/clients/create` | POST | ✅ |
| `/api/admin/clients/[id]` | GET | ✅ |
| `/api/admin/clients/[id]/edit` | PUT | ✅ |

---

## BRAND MANAGER Role

### Authentication & Access
- [x] Login flow routes to `/brand`
- [x] Role check for `brand_manager`
- [x] Protected routes via middleware

### Dashboard (`/brand`)
- [x] Dashboard page exists
- [x] Real data loading via API
- [x] Metrics: Total Clients, Active Visits, Monthly Revenue
- [x] Average Rating display
- [x] Performance summary cards

### Client Management
- [x] List clients for brand (`/brand/clients`)
- [x] Search and filter clients
- [x] Create client (`/brand/clients/create`)
- [x] API: `GET /api/brand/clients`
- [x] API: `POST /api/brand/clients`
- [ ] Remove client from brand

### Reports
- [x] Reports page (`/brand/reports`)
- [x] Analytics dashboard
- [x] Performance metrics

### Brand Settings
- [x] Settings page (`/brand/settings`)
- [x] Edit brand info (name, colors, contact)
- [x] Load real brand data
- [x] API: `GET /api/brand/info`
- [ ] Upload brand logo

### Team Management
- [x] List team members (`/brand/team`)
- [x] API: `GET /api/brand/team`
- [x] Filter by role and status
- [x] View team metrics (supervisors, advisors, active)
- [ ] Add advisor to brand
- [ ] Remove advisor from brand
- [ ] View advisor performance details

### Tier Management (NEW - Required for MVP)
- [x] Tiers list page (`/brand/tiers`)
- [x] Create new tier
- [x] Edit tier requirements (points, visits, purchases)
- [x] Edit tier benefits (multiplier, discounts)
- [x] Set default tier for new members
- [ ] Enable/disable auto-assignment

### Membership Management (NEW - Required for MVP)
- [x] Pending memberships queue (`/brand/memberships`)
- [x] Approve membership requests
- [x] Active members list with tier filter
- [x] Manual tier assignment
- [x] Award/deduct points (Points modal)
- [ ] View member tier history

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/brand/metrics` | GET | ✅ |
| `/api/brand/info` | GET | ✅ |
| `/api/brand/clients` | GET | ✅ |
| `/api/brand/clients` | POST | ✅ |
| `/api/brand/team` | GET | ✅ |
| `/api/brand/tiers` | GET | ✅ |
| `/api/brand/tiers` | POST | ✅ |
| `/api/brand/tiers/[id]` | PUT | ✅ |
| `/api/brand/tiers/[id]` | DELETE | ✅ |
| `/api/brand/memberships` | GET | ✅ |
| `/api/brand/memberships` | POST | ✅ |
| `/api/brand/memberships/[id]/approve` | PUT | ✅ |
| `/api/brand/memberships/[id]/assign-tier` | POST | ✅ |
| `/api/brand/points` | GET | ✅ |
| `/api/brand/points` | POST | ✅ |

---

## ADVISOR (Asesor) Role

### Authentication & Access
- [x] Login flow routes to `/asesor`
- [x] Role check for `advisor`
- [x] Protected routes via middleware

### Profile Dashboard (`/asesor`)
- [x] Profile page exists
- [x] Real data from `/api/asesor/profile`
- [x] Statistics from `/api/asesor/stats`
- [x] Metrics: Assigned Clients, Visits, Rating
- [x] Performance score display
- [x] Quick action links

### Profile Management
- [x] View profile info
- [x] Edit profile page (`/asesor/profile/edit`)
- [ ] Update phone/contact info
- [ ] Change password

### Client Management
- [x] Database table: `advisor_client_assignments`
- [x] List assigned clients (`/asesor/clients`)
- [x] View client details
- [x] Contact client (WhatsApp link)

### Visit Management
- [x] Visit list page (`/asesor/visitas`)
- [x] Visit detail page (`/asesor/visitas/[visitId]`)
- [x] Visit filters component
- [x] `useMyVisits()` hook
- [x] Create new visit
- [x] Start visit (check-in)
- [x] Complete visit (check-out)
- [x] Add visit notes
- [ ] Upload visit photos

### Schedule/Agenda
- [x] Schedule page (`/asesor/schedule`)
- [x] Day/Week/Month views
- [x] Visit calendar integration

### Reports
- [x] Reports page (`/asesor/reports`)
- [x] Performance metrics dashboard
- [x] Visit statistics

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/asesor/profile` | GET | ✅ |
| `/api/asesor/profile` | PUT | ✅ |
| `/api/asesor/stats` | GET | ✅ |
| `/api/asesor/clients` | GET | ✅ |
| `/api/asesor/visits` | GET | ✅ |
| `/api/asesor/visits` | POST | ✅ |
| `/api/asesor/visits/[id]` | GET | ✅ |
| `/api/asesor/visits/[id]` | PUT | ✅ |
| `/api/asesor/visits/[id]/checkin` | POST | ✅ |
| `/api/asesor/visits/[id]/checkout` | POST | ✅ |

---

## SUPERVISOR Role

### Authentication & Access
- [x] Login routing configured
- [x] Middleware recognizes role
- [x] Dashboard page implementation

### Dashboard (`/supervisor`)
- [x] Dashboard page
- [x] Team overview metrics
- [x] Active visits display
- [x] Performance summary

### Team Management
- [ ] List advisors in team
- [ ] View advisor details
- [ ] Assign clients to advisors
- [ ] Set advisor quotas

### Visit Oversight
- [ ] View all team visits
- [ ] Approve/review visits
- [ ] Add supervisor notes
- [ ] Flag problematic visits

### Reporting
- [ ] Team performance report
- [ ] Visit completion rates
- [ ] Client coverage report

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/supervisor/metrics` | GET | ✅ |
| `/api/supervisor/team` | GET | ❌ |
| `/api/supervisor/visits` | GET | ❌ |

---

## CLIENT Role

### Authentication & Access
- [x] Login routing configured
- [x] Middleware recognizes role
- [x] Dashboard page implementation

### Portal Dashboard (`/client`)
- [x] Dashboard page
- [x] Welcome message
- [x] Recent orders (placeholder)
- [x] Points balance
- [x] Business info display

### Profile Management
- [ ] View profile
- [ ] Update contact info
- [ ] Manage addresses
- [ ] Invoice data (RFC)

### Order Management
- [x] Order history (`/client/orders`)
- [x] API: `GET /api/client/orders`
- [x] Filter by status
- [x] Order status tracking
- [ ] View order details
- [ ] Reorder functionality

### Brand Memberships (NEW - Required for MVP)
- [x] My Brands page (`/client/brands`)
- [x] View membership status per brand
- [x] Current tier display with benefits
- [x] Points balance per brand
- [x] Join new brand flow (self-subscribe)
- [ ] Accept terms and conditions

### Points & Rewards
- [x] Points balance page (`/client/points`)
- [x] Points history per brand
- [x] Total points summary
- [ ] Redeem rewards
- [ ] Available promotions

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/client/profile` | GET | ✅ |
| `/api/client/orders` | GET | ✅ |
| `/api/client/memberships` | GET | ✅ |
| `/api/client/brands` | GET | ✅ |
| `/api/client/brands` | POST | ✅ |
| `/api/client/tier` | GET | ❌ |
| `/api/client/points` | GET | ✅ |
| `/api/client/promotions` | GET | ❌ |

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

### Advisor Tables (NEW)
- [x] `advisor_assignments` - Advisor zone/specialization
- [x] `advisor_client_assignments` - Advisor-client links

### Supporting Tables
- [x] `zones` - Geographic zones
- [x] `markets` - Market segments
- [x] `client_types` - Client categories
- [x] `commercial_structures` - Distribution channels

### Loyalty Tables
- [x] `tiers` - Membership tiers
- [x] `client_brand_memberships` - Client-brand relationships
- [x] `points_transactions` - Points ledger
- [x] `promotions` - Marketing promotions
- [x] `rewards` - Rewards catalog

### Data Status
| Table | Has Data | Sample Count | Notes |
|-------|----------|--------------|-------|
| tenants | ✅ | 1 | |
| brands | ✅ | 8 | |
| clients | ✅ | 3 | |
| user_profiles | ✅ | 4 | |
| user_roles | ✅ | 7 | |
| visits | ❌ | 0 | |
| orders | ❌ | 0 | |
| advisor_assignments | ✅ | 1 | |
| advisor_client_assignments | ✅ | 1 | |
| **tiers** | ✅ | - | Created via UI |
| **client_brand_memberships** | ✅ | - | Created via UI |
| **client_tier_assignments** | ✅ | - | Created via UI |
| **points_transactions** | ✅ | - | Migration created, ready for use |

---

## Priority Tasks for MVP Completion

### P0 - Critical (Block user testing)

#### ~~Supervisor Dashboard~~ ✅ DONE
- [x] Create `/src/app/(dashboard)/supervisor/page.tsx`
- [x] Create `/api/supervisor/metrics` endpoint
- [x] Display team members list
- [x] Display basic metrics

#### ~~Client Portal~~ ✅ DONE
- [x] Create `/src/app/(dashboard)/client/page.tsx`
- [x] Create `/api/client/profile` endpoint
- [x] Display welcome message
- [x] Display basic profile info

#### ~~Brand Affiliation System~~ ✅ DONE
- [x] API: `GET /api/client/memberships` - Client's brand memberships
- [x] API: `GET /api/client/brands` - Available brands + self-subscribe
- [x] API: `GET /api/brand/memberships` - Brand's members list
- [x] API: `POST /api/brand/memberships` - Add clients to brand
- [x] API: `PUT /api/brand/memberships/[id]/approve` - Approve membership
- [x] API: `POST /api/brand/memberships/[id]/assign-tier` - Manual tier assignment
- [x] Client Portal: "My Brands" page with memberships
- [x] Brand Manager: Members list with status
- [x] RLS: Client self-subscribe with pending status

#### ~~Tier System~~ ✅ DONE
- [x] API: `GET/POST /api/brand/tiers` - List and create tiers
- [x] API: `PUT/DELETE /api/brand/tiers/[id]` - Update/delete tiers
- [x] Client Portal: Current tier display with benefits
- [x] Brand Manager: Tiers configuration page

### P1 - High (Core functionality)

#### ~~Visit Management (Advisor)~~ ✅ DONE
- [x] Create visit API: `POST /api/asesor/visits`
- [x] Check-in API: `POST /api/asesor/visits/[id]/checkin`
- [x] Check-out API: `POST /api/asesor/visits/[id]/checkout`
- [x] Visit creation form
- [x] Visit workflow UI

#### ~~Client Assignment (Advisor)~~ ✅ DONE
- [x] Assigned clients API: `GET /api/asesor/clients`
- [x] Client list page for advisor
- [x] Client quick actions

### P2 - Medium (Enhanced features)

- [ ] Supervisor: Approve/review visits
- [x] Client: Order history
- [x] Brand Manager: Team management (list view)
- [ ] Notifications system
- [ ] Email integration

### P1.5 - Brand Affiliation System (NEW)

#### ~~Client Brand Memberships~~ ✅ DONE
- [x] API: `GET /api/client/memberships` - List client's brand memberships
- [x] API: `POST /api/client/brands` - Request to join a brand (self-subscribe)
- [x] API: `GET /api/brand/memberships` - List brand's client memberships (Brand Manager)
- [x] API: `POST /api/brand/memberships` - Add clients to brand (bulk)
- [x] API: `PUT /api/brand/memberships/[id]/approve` - Approve membership request
- [ ] API: `PUT /api/brand/memberships/[id]/reject` - Reject membership request
- [x] Client Portal: "My Brands" page showing all memberships
- [x] Client Portal: Join brand flow (self-subscribe pending)
- [x] Brand Manager: Pending memberships approval queue
- [x] Brand Manager: Active members list with status filters

#### ~~Tier Management (Brand Manager)~~ ✅ DONE
- [x] API: `GET /api/brand/tiers` - List brand's tiers
- [x] API: `POST /api/brand/tiers` - Create new tier
- [x] API: `PUT /api/brand/tiers/[id]` - Update tier settings
- [x] API: `DELETE /api/brand/tiers/[id]` - Delete tier
- [x] Brand Manager: Tiers configuration page
- [x] Brand Manager: Tier benefits editor (points multiplier, discounts)
- [x] Brand Manager: Tier requirements editor (min points, visits, purchases)

#### ~~Client Tier Assignments~~ ✅ DONE
- [x] API: `POST /api/brand/memberships/[id]/assign-tier` - Manual tier assignment
- [x] Client Portal: Display current tier with benefits
- [x] Client Portal: Progress to next tier indicator
- [x] Brand Manager: Member tier assignment interface
- [ ] Brand Manager: Tier assignment history view
- [ ] Auto-assignment logic (evaluate client metrics vs tier requirements)

#### ~~Points System~~ ✅ DONE
- [x] Migration: `points_transactions` table
- [x] API: `GET /api/client/points` - Points summary and history
- [x] API: `POST /api/brand/points` - Award/deduct points
- [x] API: `GET /api/brand/points` - View member points history
- [x] Client Portal: Points page (`/client/points`)
- [x] Brand Manager: Points modal in memberships page

### P2 - Medium (Enhanced features)

- [ ] Supervisor: Approve/review visits
- [x] Client: Order history
- [x] Brand Manager: Team management (list view)
- [ ] Notifications system
- [ ] Email integration

### Features Implementadas (Febrero 2026)

- Asesor Schedule/Agenda - Vista de calendario con día/semana/mes
- Asesor Reports - Dashboard de métricas y desempeño
- Asesor Clients - Lista de clientes asignados con acciones rápidas
- Brand Create Client - Formulario simplificado para crear clientes
- Brand Reports - Dashboard de analítica de marca
- Visit Management completo - Check-in, check-out, notas
- Brand Team Management - Lista de equipo con filtros y métricas
- Client Order History - Historial de órdenes con filtros y resumen

### P3 - Low (Nice to have)

- [ ] Reports generation
- [ ] Advanced analytics
- [ ] Promotions management
- [ ] Rewards redemption system
- [ ] Mobile-optimized views

---

## Brand Affiliation System - Tables Reference

### client_brand_memberships
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| public_id | varchar | Human-readable ID |
| client_id | uuid | FK to clients |
| brand_id | uuid | FK to brands |
| tenant_id | uuid | FK to tenants |
| membership_status | enum | pending, active, suspended, cancelled |
| joined_date | date | When client joined |
| approved_by | uuid | FK to user_profiles |
| approved_date | date | When approved |
| current_tier_id | uuid | FK to tiers |
| lifetime_points | numeric | Total points ever earned |
| points_balance | numeric | Available points |
| last_purchase_date | date | Last purchase |
| is_primary_brand | boolean | Client's primary brand |
| terms_accepted_date | timestamp | Terms acceptance |
| communication_preferences | jsonb | Notification settings |

### client_tier_assignments
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| client_brand_membership_id | uuid | FK to memberships |
| tier_id | uuid | FK to tiers |
| assignment_type | enum | automatic, manual, promotional |
| assigned_by | uuid | FK to user_profiles (if manual) |
| assigned_date | date | When assigned |
| effective_from | date | Start date |
| effective_until | date | End date (null = indefinite) |
| previous_tier_id | uuid | Previous tier |
| reason | text | Assignment reason |
| points_at_assignment | numeric | Points when assigned |
| is_current | boolean | Current active assignment |
| benefits_activated | boolean | Benefits active |

### tiers
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| brand_id | uuid | FK to brands |
| name | varchar | Tier name (Bronze, Silver, Gold) |
| tier_level | integer | Level order (1, 2, 3...) |
| min_points_required | numeric | Points threshold |
| min_visits_required | integer | Visit threshold |
| min_purchases_required | integer | Purchase count threshold |
| min_purchase_amount | numeric | Spend threshold |
| evaluation_period_months | integer | Evaluation window |
| points_multiplier | numeric | Points earning multiplier |
| discount_percentage | numeric | Discount benefit |
| benefits | jsonb | Additional benefits |
| is_default | boolean | Default tier for new members |
| is_active | boolean | Tier available |
| auto_assignment_enabled | boolean | Auto tier upgrades |

---

## Test Credentials

| Role | Email | Notes |
|------|-------|-------|
| Admin | (your admin email) | Full platform access |
| Brand Manager | (brand manager email) | Brand: Iberia |
| Advisor | fermx3@gmail.com | Has advisor role |
| Supervisor | (create user) | Needs dashboard |
| Client | (create user) | Needs portal |

---

## Quick Links

- **Supabase Dashboard:** [Project URL]
- **Local Dev:** http://localhost:3000
- **API Base:** http://localhost:3000/api

---

## Notes

- All roles use Supabase Auth for authentication
- Tenant isolation is enforced at database level (RLS)
- Migrations are tracked in `supabase/migrations/`
- Environment variables in `.env` (see `.env.example`)
