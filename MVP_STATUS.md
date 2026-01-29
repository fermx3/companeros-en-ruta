# MVP Status - Compañeros en Ruta

**Last Updated:** 2026-01-29
**Target:** User testing with all roles working at MVP level + Brand Affiliation System

---

## Quick Summary

| Role | Status | Ready for Testing |
|------|--------|-------------------|
| Admin | ✅ Complete | Yes |
| Brand Manager | 🟡 Partial | Needs tier management |
| Advisor (Asesor) | ✅ Complete | Yes |
| Supervisor | ✅ Complete | Yes |
| Client | 🟡 Partial | Needs brand memberships |

| System | Status | Ready for Testing |
|--------|--------|-------------------|
| Brand Affiliation | 🔴 Not Started | No |
| Tier System | 🔴 Not Started | No |
| Points System | 🔴 Not Started | No |

**Overall MVP Progress: ~70%** (Dashboards complete, loyalty system pending)

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
- [x] API: `GET /api/brand/clients`
- [ ] Add client to brand
- [ ] Remove client from brand

### Brand Settings
- [x] Settings page (`/brand/settings`)
- [x] Edit brand info (name, colors, contact)
- [x] Load real brand data
- [x] API: `GET /api/brand/info`
- [ ] Upload brand logo

### Team Management
- [ ] List team members (`/brand/team`)
- [ ] Add advisor to brand
- [ ] Remove advisor from brand
- [ ] View advisor performance

### Tier Management (NEW - Required for MVP)
- [ ] Tiers list page (`/brand/tiers`)
- [ ] Create new tier
- [ ] Edit tier requirements (points, visits, purchases)
- [ ] Edit tier benefits (multiplier, discounts)
- [ ] Set default tier for new members
- [ ] Enable/disable auto-assignment

### Membership Management (NEW - Required for MVP)
- [ ] Pending memberships queue (`/brand/memberships/pending`)
- [ ] Approve/reject membership requests
- [ ] Active members list with tier filter
- [ ] Manual tier assignment
- [ ] Award/deduct points
- [ ] View member tier history

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/brand/metrics` | GET | ✅ |
| `/api/brand/info` | GET | ✅ |
| `/api/brand/clients` | GET | ✅ |
| `/api/brand/team` | GET | ❌ |
| `/api/brand/tiers` | GET | ❌ |
| `/api/brand/tiers` | POST | ❌ |
| `/api/brand/tiers/[id]` | PUT | ❌ |
| `/api/brand/memberships` | GET | ❌ |
| `/api/brand/memberships/[id]/approve` | PUT | ❌ |
| `/api/brand/memberships/[id]/assign-tier` | POST | ❌ |
| `/api/brand/points/award` | POST | ❌ |

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
- [ ] List assigned clients
- [ ] View client details
- [ ] Contact client (WhatsApp link)

### Visit Management
- [x] Visit list page (`/asesor/visitas`)
- [x] Visit detail page (`/asesor/visitas/[visitId]`)
- [x] Visit filters component
- [x] `useMyVisits()` hook
- [ ] Create new visit
- [ ] Start visit (check-in)
- [ ] Complete visit (check-out)
- [ ] Add visit notes
- [ ] Upload visit photos

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/asesor/profile` | GET | ✅ |
| `/api/asesor/profile` | PUT | ✅ |
| `/api/asesor/stats` | GET | ✅ |
| `/api/asesor/clients` | GET | ❌ |
| `/api/asesor/visits` | GET | ❌ |
| `/api/asesor/visits` | POST | ❌ |
| `/api/asesor/visits/[id]/checkin` | POST | ❌ |
| `/api/asesor/visits/[id]/checkout` | POST | ❌ |

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
- [ ] Order history
- [ ] View order details
- [ ] Reorder functionality
- [ ] Order status tracking

### Brand Memberships (NEW - Required for MVP)
- [ ] My Brands page (`/client/brands`)
- [ ] View membership status per brand
- [ ] Current tier display with benefits
- [ ] Points balance per brand
- [ ] Join new brand flow
- [ ] Accept terms and conditions

### Promotions & Rewards
- [ ] Available promotions
- [ ] Points balance
- [ ] Redeem rewards
- [ ] Promotion history

### API Endpoints
| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/client/profile` | GET | ✅ |
| `/api/client/orders` | GET | ❌ |
| `/api/client/memberships` | GET | ❌ |
| `/api/client/memberships/join` | POST | ❌ |
| `/api/client/tier` | GET | ❌ |
| `/api/client/points/history` | GET | ❌ |
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
| **tiers** | ❌ | 0 | Need to create for each brand |
| **client_brand_memberships** | ❌ | 0 | Need to link clients to brands |
| **client_tier_assignments** | ❌ | 0 | Need to assign tiers to members |
| **points_transactions** | ❌ | 0 | Points ledger |

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

#### Brand Affiliation System (NEW - CRITICAL)
- [ ] API: `GET /api/client/memberships` - Client's brand memberships
- [ ] API: `GET /api/brand/memberships` - Brand's members list
- [ ] API: `PUT /api/brand/memberships/[id]/approve` - Approve membership
- [ ] Client Portal: "My Brands" page with memberships
- [ ] Brand Manager: Members list with status

#### Tier System (NEW - CRITICAL)
- [ ] API: `GET /api/brand/tiers` - List brand tiers
- [ ] API: `GET /api/client/tier` - Client's current tier
- [ ] Client Portal: Current tier display with benefits
- [ ] Brand Manager: Tiers configuration page

### P1 - High (Core functionality)

#### Visit Management (Advisor)
- [ ] Create visit API: `POST /api/asesor/visits`
- [ ] Check-in API: `POST /api/asesor/visits/[id]/checkin`
- [ ] Check-out API: `POST /api/asesor/visits/[id]/checkout`
- [ ] Visit creation form
- [ ] Visit workflow UI

#### Client Assignment (Advisor)
- [ ] Assigned clients API: `GET /api/asesor/clients`
- [ ] Client list page for advisor
- [ ] Client quick actions

### P2 - Medium (Enhanced features)

- [ ] Supervisor: Approve/review visits
- [ ] Client: Order history
- [ ] Brand Manager: Team management
- [ ] Notifications system
- [ ] Email integration

### P1.5 - Brand Affiliation System (NEW)

#### Client Brand Memberships
- [ ] API: `GET /api/client/memberships` - List client's brand memberships
- [ ] API: `POST /api/client/memberships/join` - Request to join a brand
- [ ] API: `GET /api/brand/memberships` - List brand's client memberships (Brand Manager)
- [ ] API: `PUT /api/brand/memberships/[id]/approve` - Approve membership request
- [ ] API: `PUT /api/brand/memberships/[id]/reject` - Reject membership request
- [ ] Client Portal: "My Brands" page showing all memberships
- [ ] Client Portal: Join brand flow with terms acceptance
- [ ] Brand Manager: Pending memberships approval queue
- [ ] Brand Manager: Active members list with status filters

#### Tier Management (Brand Manager)
- [ ] API: `GET /api/brand/tiers` - List brand's tiers
- [ ] API: `POST /api/brand/tiers` - Create new tier
- [ ] API: `PUT /api/brand/tiers/[id]` - Update tier settings
- [ ] Brand Manager: Tiers configuration page
- [ ] Brand Manager: Tier benefits editor (points multiplier, discounts)
- [ ] Brand Manager: Tier requirements editor (min points, visits, purchases)

#### Client Tier Assignments
- [ ] API: `GET /api/client/tier` - Get current tier for each membership
- [ ] API: `POST /api/brand/memberships/[id]/assign-tier` - Manual tier assignment
- [ ] Client Portal: Display current tier with benefits
- [ ] Client Portal: Progress to next tier indicator
- [ ] Brand Manager: Member tier assignment interface
- [ ] Brand Manager: Tier assignment history view
- [ ] Auto-assignment logic (evaluate client metrics vs tier requirements)

#### Points System
- [ ] API: `GET /api/client/points/history` - Points transaction history
- [ ] API: `POST /api/brand/points/award` - Award points to client
- [ ] API: `POST /api/brand/points/deduct` - Deduct points from client
- [ ] Client Portal: Points balance and history
- [ ] Brand Manager: Points management for members

### P2 - Medium (Enhanced features)

- [ ] Supervisor: Approve/review visits
- [ ] Client: Order history
- [ ] Brand Manager: Team management
- [ ] Notifications system
- [ ] Email integration

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
