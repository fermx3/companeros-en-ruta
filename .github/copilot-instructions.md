# GitHub Copilot Instructions — Compañeros en Ruta

## 🚨 Critical: Read CLAUDE.md First

This repository has **strict, non-negotiable rules** defined in [CLAUDE.md](../CLAUDE.md).

**Before suggesting any code, you MUST:**
1. Read [CLAUDE.md](../CLAUDE.md)
2. Follow its database-first, migration-first, RLS-first principles
3. Never assume schema — always verify from migrations or local DB

---

## Project Type

**Multi-tenant SaaS** built with:
- **Next.js 16** (App Router, React 19, TypeScript strict mode)
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Row Level Security (RLS)** for tenant isolation
- **Tailwind CSS 4** + **shadcn/ui**

---

## Core Principles

### 1. Database Schema
- **NEVER assume** tables, columns, types, or relations
- **ALWAYS verify** from:
  - `supabase/migrations/` (authoritative)
  - Local Supabase DB (Docker) via `psql` or Supabase CLI
- If uncertain about schema → **stop and ask**

### 2. All DB Changes via Migrations
- **NO manual ALTER TABLE** commands outside migrations
- Workflow: Create migration file → Apply locally → Validate → Ship
- Migration naming: `YYYYMMDDHHMMSS_descriptive_name.sql`
- Location: `supabase/migrations/`

### 3. Multi-Tenant Security (RLS)
- Every table has RLS policies enforcing `tenant_id` isolation
- **NEVER bypass RLS** with service role keys in application code
- Always use authenticated user context for queries
- Test tenant isolation before shipping

### 4. TypeScript Strict Mode
- All code must pass `npx tsc --noEmit`
- Types should align with database schema
- Use Zod for runtime validation
- No `any` types unless absolutely necessary with justification

---

## Code Patterns

### Database Queries (Server-Side)
```typescript
// ✅ GOOD - RLS enforced, tenant-aware
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('tenant_id', tenantId) // Explicit tenant filter for clarity
```

```typescript
// ❌ BAD - Service role bypasses RLS
const supabase = createClient(serviceRoleKey)
```

### Server Components vs Client Components
```typescript
// ✅ Server Component (default) - can query DB directly
export default async function ClientsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('clients').select()
  return <ClientsList clients={data} />
}

// ✅ Client Component - receives data as props or uses hooks
'use client'
export function ClientsList({ clients }: { clients: Client[] }) {
  return <div>{clients.map(c => <ClientCard key={c.id} {...c} />)}</div>
}
```

### Server Actions
```typescript
// ✅ Server Action with validation
'use server'
export async function createClient(formData: FormData) {
  const supabase = await createClient()

  // Validate with Zod
  const schema = z.object({
    business_name: z.string().min(1),
    tenant_id: z.string().uuid(),
  })
  const validated = schema.parse(Object.fromEntries(formData))

  // Insert - RLS will enforce tenant_id match
  const { data, error } = await supabase
    .from('clients')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## Tech Stack Reference

### Frontend
- **Next.js 16** with App Router (stable)
- **React 19** (Server Components, Actions, useActionState)
- **TypeScript 5+** (strict: true)
- **Tailwind CSS 4** + **shadcn/ui** components
- **React Hook Form** + **Zod** for forms
- **Recharts** for data visualization
- **date-fns** for date handling

### Backend
- **Supabase** (PostgreSQL 15+, Auth, Storage, Realtime)
- **supabase-js v2** for client operations
- **supabase-ssr** for Server Components
- **Edge Functions** in Deno for backend logic

### Database
- **PostgreSQL** with RLS policies on all tables
- **Multi-tenant architecture**: `tenants` → `brands` → `users`/`clients`/`zones`
- **Migrations managed** via Supabase CLI

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API route handlers
│   └── layout.tsx         # Root layout
├── components/
│   ├── auth/              # Auth-related components
│   ├── layout/            # Layout components (nav, sidebar)
│   ├── ui/                # shadcn/ui components
│   └── visits/            # Business logic components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client utilities
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
└── middleware.ts          # Auth middleware

supabase/
├── migrations/            # Database migrations (AUTHORITATIVE)
├── functions/             # Edge Functions
└── config.toml           # Supabase local config
```

---

## Common Tasks

### When suggesting DB changes:
1. Verify current schema from `supabase/migrations/`
2. Create new migration file: `YYYYMMDDHHMMSS_description.sql`
3. Include RLS policies in the migration
4. Show how to apply: `supabase migration up`

### When suggesting API routes:
1. Use Server Components by default
2. Validate input with Zod
3. Use authenticated Supabase client (RLS enforced)
4. Handle errors gracefully
5. Return proper HTTP status codes

### When suggesting components:
1. Check if it can be a Server Component (default)
2. Use `'use client'` only when needed (interactivity, hooks)
3. Import shadcn/ui components from `@/components/ui/`
4. Follow Tailwind CSS conventions
5. Ensure TypeScript types are correct

---

## Additional Resources

For detailed implementation guides, see:
- [CLAUDE.md](../CLAUDE.md) — **Non-negotiable rules** (READ FIRST)
- [.claude/agents.md](../.claude/agents.md) — Subagent compliance control
- [.claude/skills/](../.claude/skills/) — Project-specific implementation guides
- [.claude/blueprints/](../.claude/blueprints/) — Task templates

---

## Quality Gates

All suggestions must be compatible with:
- ✅ `npm run lint` (ESLint)
- ✅ `npx tsc --noEmit` (TypeScript)
- ✅ `npm run test` (Jest + React Testing Library)
- ✅ `npm run build` (Next.js production build)

---

## ⛔ Never Do This

- ❌ Assume database schema without verification
- ❌ Suggest manual SQL changes outside migrations
- ❌ Bypass or weaken RLS policies
- ❌ Use service role keys in application code
- ❌ Hardcode secrets or credentials
- ❌ Ignore tenant_id in multi-tenant queries
- ❌ Use `any` type without justification
- ❌ Mix Server/Client Component patterns incorrectly

---

## When Uncertain

If you're unsure about schema, RLS policies, or implementation details:

1. **Stop** — Don't guess or make assumptions
2. **Ask** — Request clarification from the developer
3. **Verify** — Check migrations, CLAUDE.md, or project skills
4. **Proceed** — Only after confirmation

**Accuracy and safety are more important than speed.**
