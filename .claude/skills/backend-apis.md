# Skill: Backend APIs — Compañeros en Ruta

## Scope

Building Next.js Route Handlers under `apps/web/src/app/api/`, server-side data access, validation, and integration with Supabase.

Domains (mirror role-scoped dashboards):
```
src/app/api/admin/
src/app/api/brand/
src/app/api/supervisor/
src/app/api/promotor/
src/app/api/asesor-ventas/
src/app/api/client/
src/app/api/qr/
src/app/api/surveys/
src/app/api/notifications/
```

This skill assumes `.claude/rules/multi-tenant.md` and `.claude/rules/supabase-rules.md` are loaded.

---

## When to Use

- Creating, modifying, or refactoring any file under `apps/web/src/app/api/.../route.ts`
- Adding new server-side logic that the frontend will call via fetch
- Wiring auth helpers, Zod validation, or service-layer calls into a route

Do not use for: server-side data needed by Server Components (call Supabase directly there) or DB-only changes (see `supabase-database.md`).

---

## Step-by-Step Execution

### 1. Choose the role-scoped folder

Place the route under the folder matching the audience role. Example: a route only promotores should hit lives at `apps/web/src/app/api/promotor/...`.

If the route is shared across roles (e.g., `qr/redeem`), put it under a domain folder and resolve the role inside the handler using a generic auth approach.

### 2. Use the role-scoped auth helper

```typescript
// src/app/api/promotor/visits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  resolvePromotorAuth,
  isPromotorAuthError,
  promotorAuthErrorResponse,
} from "@/lib/api/promotor-auth";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const auth = await resolvePromotorAuth(supabase);
  if (isPromotorAuthError(auth)) return promotorAuthErrorResponse(auth);

  const { tenantId, userProfileId, brandId } = auth;
  // ... use tenantId in every query
}
```

Helpers available:

| File | Helper |
|------|--------|
| `apps/web/src/lib/api/admin-auth.ts` | `resolveAdminAuth` |
| `apps/web/src/lib/api/brand-auth.ts` | `resolveBrandAuth` |
| `apps/web/src/lib/api/promotor-auth.ts` | `resolvePromotorAuth` |
| `apps/web/src/lib/api/asesor-auth.ts` | `resolveAsesorAuth` |

If an equivalent helper does not exist for `supervisor` or `client`, follow the same pattern and add a new helper file. Do not inline the resolution in the route.

### 3. Validate input with Zod

```typescript
import { z } from "zod";

const createVisitSchema = z.object({
  client_id: z.string().uuid(),
  visit_date: z.string().date().optional(),
  promotor_notes: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const auth = await resolvePromotorAuth(supabase);
  if (isPromotorAuthError(auth)) return promotorAuthErrorResponse(auth);

  const body = await request.json().catch(() => null);
  const parsed = createVisitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // ...
}
```

### 4. Query Supabase with tenant + soft-delete filters

```typescript
const { data, error, count } = await supabase
  .from("visits")
  .select(
    `
      id, public_id, visit_status, visit_date,
      client:clients(id, public_id, business_name)
    `,
    { count: "exact" }
  )
  .eq("tenant_id", auth.tenantId)
  .eq("promotor_id", auth.userProfileId)
  .is("deleted_at", null)
  .order("visit_date", { ascending: false })
  .range(offset, offset + limit - 1);

if (error) {
  console.error("GET /api/promotor/visits:", error);
  return NextResponse.json({ error: "Error al listar visitas" }, { status: 500 });
}
```

### 5. Authorize the resource (defense in depth)

If the request references a row by id (e.g., `visit_id`), verify:
- The row exists.
- It belongs to the same `tenant_id`.
- The user has the right relationship (e.g., promotor is assigned to the client; brand role matches the client's brand).

```typescript
const { data: assignment } = await supabase
  .from("client_assignments")
  .select("id, brand_id")
  .eq("user_profile_id", auth.userProfileId)
  .eq("client_id", parsed.data.client_id)
  .eq("is_active", true)
  .is("deleted_at", null)
  .maybeSingle();

if (!assignment) {
  return NextResponse.json({ error: "Cliente no asignado" }, { status: 403 });
}
```

### 6. Return a typed response

```typescript
return NextResponse.json(
  { visit: { ...newVisit, visit_number: newVisit.public_id } },
  { status: 201 }
);
```

Status code map:
- 200 success (GET, idempotent)
- 201 created
- 204 no content (DELETE)
- 400 validation
- 401 unauthenticated
- 403 authenticated but unauthorized (wrong role/scope)
- 404 not found
- 409 conflict
- 422 semantic validation failure (Zod parse fine, business rule fails)
- 500 unhandled

### 7. Cache headers

For data that can be cached:

```typescript
import { cacheHeaders } from "@/lib/api/cache-headers";

return NextResponse.json(data, {
  headers: cacheHeaders.shortPrivate, // or other presets in cache-headers.ts
});
```

For mutations, never cache.

### 8. Error handling pattern

```typescript
try {
  // ... handler body
} catch (error) {
  console.error("POST /api/promotor/visits:", error);
  const message = error instanceof Error ? error.message : "Error desconocido";
  return NextResponse.json(
    { error: "Error interno del servidor", details: message },
    { status: 500 }
  );
}
```

Wrap the entire handler body in `try/catch` ONLY for the top-level catchall — don't swallow specific errors inside.

### 9. Service layer for complex flows

If the route orchestrates multiple writes or wraps a non-trivial business rule, push the logic into `apps/web/src/lib/services/`:

- `adminService.ts` — admin entity management
- `brandService.ts` — brand-side operations
- `qrService.ts` — QR generation/redemption
- `visitService.ts` — visit lifecycle

The route becomes thin: auth → validate → service.method() → respond.

### 10. RPC calls

When the operation is multi-step and atomicity matters, prefer a Postgres function (created via migration) over multiple Supabase calls:

```typescript
const { data, error } = await supabase.rpc("create_visit_with_products", {
  p_client_id: parsed.data.client_id,
  p_promotor_id: auth.userProfileId,
  p_products: parsed.data.products,
});
```

The RPC must be `SECURITY INVOKER` or `SECURITY DEFINER` with explicit `search_path` (see `20260221170000_fix_function_search_path.sql`).

---

## Anti-Patterns

- ❌ Re-implementing the `getUser → user_profiles → user_roles` chain in a new route. Use the helper.
- ❌ Trusting `tenant_id` from the request body.
- ❌ `select('*')` in a list endpoint.
- ❌ Returning Supabase error messages verbatim (they may leak schema). Map to user-facing strings; log the original.
- ❌ Forgetting `.is('deleted_at', null)` on tables with soft delete.
- ❌ Routing by raw UUID in user-facing URLs — accept `public_id` and resolve to UUID inside.
- ❌ Spinning up `createServiceClient()` to get around an RLS rejection. Fix the policy via migration.
- ❌ Pagination without `range()` + `count: 'exact'` when the client needs total count.
- ❌ Using `.single()` when zero rows is a legitimate outcome — use `.maybeSingle()` and handle null explicitly.
- ❌ Returning 200 with `{ error: "..." }` body. Use proper status codes.

---

## Examples From the Repo

### Auth helpers (canonical)

`apps/web/src/lib/api/admin-auth.ts:25` — embedded join `user_profiles + user_roles`.
`apps/web/src/lib/api/promotor-auth.ts:38` — same pattern, returns role row + brand_id.
`apps/web/src/lib/api/asesor-auth.ts` — same pattern for asesor_de_ventas.
`apps/web/src/lib/api/brand-auth.ts` — multi-brand resolution.

### Multi-step validation

`apps/web/src/app/api/promotor/visits/route.ts:208` — POST creates a visit but first checks `client_assignments`, then writes with `validate_visit_data()` enforcement at the DB layer.

### Approve/Reject flow

`apps/web/src/app/api/admin/promotions/[id]/approve/route.ts` — admin auth → state transition → response.

### QR redeem

`apps/web/src/app/api/qr/redeem/route.ts` — uses `redeem_qr` RPC with `SECURITY DEFINER` (see migration `20260220110000_fix_redeem_qr_security_definer.sql`).

### Realtime / notifications

`apps/web/src/app/api/notifications/route.ts` — list endpoint scoped to user, uses tenant filter.

---

## Validation Checklist

```
[ ] Role-scoped folder under src/app/api/<role>/
[ ] Auth helper used (no inline auth chain)
[ ] Zod validation on every body / query string with user input
[ ] tenant_id and (where applicable) brand_id derived from auth, not request
[ ] Tenant filter present in every query
[ ] Soft-delete filter present on applicable tables
[ ] Selects are explicit; no select('*') in list endpoints
[ ] Pagination via .range() + count where lists can grow
[ ] Public_id returned for any user-facing identifier
[ ] Status codes correct (401 vs 403 vs 404 vs 422)
[ ] Errors logged with route context; user-facing messages don't leak schema
[ ] No service-role usage outside admin paths
[ ] Cache headers set explicitly when applicable
[ ] If multi-step write, RPC used or transaction discussed
```
