# Skill: Frontend — Compañeros en Ruta

## Scope

Building and modifying the Next.js App Router UI (`apps/web/src/app/`, `apps/web/src/components/`, `apps/web/src/hooks/`) using:

- Next.js 16 App Router (RSC + Client Components)
- React 19
- Tailwind CSS 4 + shadcn/ui (locally generated under `apps/web/src/components/ui/`)
- react-hook-form + zod for forms
- recharts for charts
- lucide-react for icons (canonical) plus custom icons in `apps/web/src/components/icons/`

This skill complements `.claude/skills/backend-apis.md` (data fetching) and `.claude/skills/mobile.md` (mobile compatibility constraints).

---

## When to Use

- Adding or modifying any page under `apps/web/src/app/(auth|dashboard)/...`
- Creating, extending, or refactoring components under `apps/web/src/components/`
- Wiring forms, lists, dashboards, charts
- Working with role-scoped layouts (`admin/`, `brand/`, `supervisor/`, `promotor/`, `asesor-ventas/`, `client/`)

Do not use for: backend route handlers (see `backend-apis.md`), DB queries (see `supabase-database.md`), or React Native parity work (see `mobile.md`).

---

## Step-by-Step Execution

### 1. Identify the route group and role

```
src/app/(auth)/login/...               → public
src/app/(dashboard)/<role>/<feature>/  → protected (middleware enforces)
```

Roles: `admin`, `brand`, `supervisor`, `promotor`, `asesor-ventas`, `client`.

### 2. Decide RSC vs Client Component

- Default: **Server Component** (no directive at top).
- Add `"use client"` ONLY for: state, refs, effects, browser APIs, event handlers needing closures, third-party client-only libs (e.g., `html5-qrcode`).
- Data fetching:
  - Server Component → call Supabase server client directly.
  - Client Component → call API route via fetch, OR use a hook from `apps/web/src/hooks/` (e.g., `useVisits`, `useNotifications`).

### 3. Reuse before creating

Before creating any UI, check the canonical registry. **Use existing components, never duplicate.**

| Need | Canonical component | Import |
|------|--------------------|--------|
| Stat / metric tile | `MetricCard` | `@/components/ui/metric-card` |
| Generic status badge | `StatusBadge` | `@/components/ui/status-badge` |
| Order status badge | `OrderStatusBadge` | `@/components/ui/order-status-badge` |
| Visit status badge | `VisitStatusBadge` | `@/components/ui/visit-status-badge` |
| Empty state | `EmptyState` | `@/components/ui/EmptyState` |
| Spinner | `LoadingSpinner` | `@/components/ui/feedback` |
| Page-level loader | `PageLoader` | `@/components/ui/feedback` |
| Error / alert | `Alert` | `@/components/ui/feedback` |
| Multi-step wizard | `WizardStepper` | `@/components/ui/wizard-stepper` |
| Clickable table row | `ClickableRow` | `@/components/ui/clickable-row` |
| Clickable card | `ClickableCard` | `@/components/ui/clickable-card` |
| Row/card actions | `ListItemActions` | `@/components/ui/list-item-actions` |
| QR action (client home) | `QrActionCard` | `@/components/ui/qr-action-card` |
| Progress card | `ProgressCard` | `@/components/ui/progress-card` |
| Image upload | `ImageUpload` | `@/components/ui/image-upload` |
| Phone input | `PhoneInput` | `@/components/ui/phone-input` |
| KPI gauge | `KpiGaugeCard` | `@/components/ui/kpi-gauge-card` |

If a need isn't covered, **extend** an existing component via props before creating a new one.

### 4. Forms

Always: react-hook-form + zod resolver.

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  business_name: z.string().min(1).max(100),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ClientForm({ onSubmit }: { onSubmit: (v: FormValues) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="business_name">Nombre del negocio</Label>
        <Input id="business_name" {...register("business_name")} />
        {errors.business_name && (
          <p className="text-sm text-destructive mt-1">{errors.business_name.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>Guardar</Button>
    </form>
  );
}
```

### 5. Data fetching patterns

#### Server Component (preferred for initial render)

```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PromotorVisitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id, tenant_id")
    .eq("user_id", user.id)
    .single();
  if (!profile) redirect("/login");

  const { data: visits } = await supabase
    .from("visits")
    .select("id, public_id, visit_status, visit_date, client:clients(business_name)")
    .eq("tenant_id", profile.tenant_id)
    .eq("promotor_id", profile.id)
    .is("deleted_at", null)
    .order("visit_date", { ascending: false });

  return <VisitsList visits={visits ?? []} />;
}
```

#### Client Component via hook

```typescript
"use client";
import { useVisits } from "@/hooks/useVisits";

export function VisitsClientView() {
  const { data, isLoading, error } = useVisits({ status: "all" });
  if (isLoading) return <PageLoader />;
  if (error) return <Alert variant="error">{error.message}</Alert>;
  return <VisitsList visits={data?.visits ?? []} />;
}
```

### 6. Styling

- Use Tailwind classes mapped to design tokens. Reference `.claude/skills/architecture.md` § Design tokens.
- For conditional classes, use `cn(...)` from `@/lib/utils`.
- Never hardcode hex values in JSX. If you need a color the tokens don't cover, propose adding a token first.
- Mobile-first: write `flex flex-col gap-4 md:grid md:grid-cols-2`. Most dashboards are now mobile-friendly per recent commits.

### 7. Layouts

- Each role has its own layout: `apps/web/src/app/(dashboard)/<role>/layout.tsx`.
- Add navigation entries via `apps/web/src/lib/navigation-config.ts` (one source of truth).
- For new pages, set page title via `usePageTitle` hook (Client Component) or in layout metadata.

### 8. Charts

- Use `recharts`. Match existing patterns in `apps/web/src/components/kpi/` and `apps/web/src/app/(dashboard)/brand/kpis/`.
- For mobile, charts must respect container width (`ResponsiveContainer`).

### 9. Realtime UI

- Subscribe via `useEffect` in a Client Component, filter by `tenant_id` (and `brand_id` where applicable).
- Always unsubscribe on cleanup.
- See `apps/web/src/hooks/useNotifications.ts` for the canonical realtime pattern.

### 10. Loading / error states

- List pages: `LoadingSpinner` while fetching, `EmptyState` when no data, `Alert` on error.
- Detail pages: skeleton UI ideal but `PageLoader` is acceptable.
- Forms: disable submit button while `isSubmitting`; show inline error per field.

---

## Anti-Patterns (do not do this)

- ❌ Creating a one-off "metric card" inline (`<Card><dl>...</dl></Card>`). Use `MetricCard`.
- ❌ Hardcoding colors: `<div className="bg-blue-600 text-white">`. Use tokens / variants.
- ❌ Inline SVG icons. Use `lucide-react` or `apps/web/src/components/icons/`.
- ❌ Fetching data in `useEffect` inside a feature page when a Server Component or hook fits better.
- ❌ Calling internal API routes (`/api/...`) from a Server Component. Use the data layer directly.
- ❌ Wrapping a Server Component prop in `JSON.stringify` and parsing in client — pass typed props.
- ❌ Using `getStatusLabel()`/`getStatusColor()` switch utilities inline — domain badges are canonical components.
- ❌ Mixing Server and Client logic in the same file. Split into `page.tsx` (server) + `*-client.tsx` (client).
- ❌ Using `next/image` without remotePatterns for the host. `next.config.ts` only allows specific hosts.

---

## Examples From the Repo

### Promotor visits list

`apps/web/src/app/(dashboard)/promotor/visitas/` (page) + `apps/web/src/hooks/useVisits.ts` (data) + `apps/web/src/components/visits/*` (cards).

### Brand dashboard

`apps/web/src/app/(dashboard)/brand/page.tsx` (server) calls into `apps/web/src/lib/services/brandService.ts`.

### QR scanner

Client-only component using `html5-qrcode`. See `apps/web/src/components/qr/`.

### Form with Zod

Login form — `apps/web/src/components/auth/login-form.tsx` (compare against tests in `apps/web/__tests__/components/auth/login-form.test.tsx`).

---

## Validation Checklist

```
[ ] Server vs Client Component decision is correct (Server by default)
[ ] Canonical UI components used; no inline duplicates
[ ] Forms use react-hook-form + zod resolver
[ ] No raw fetch from a Server Component to internal API
[ ] Tailwind classes use design tokens; no hex literals
[ ] Icons from lucide-react or src/components/icons/
[ ] Mobile-first responsive classes (gap, grid, padding scale up via md/lg)
[ ] Loading / empty / error states present
[ ] Realtime subscriptions filter by tenant_id and clean up on unmount
[ ] Public-facing IDs use public_id (URL params, QR payloads, exports)
[ ] Strict TypeScript passes; no new `any`
```
