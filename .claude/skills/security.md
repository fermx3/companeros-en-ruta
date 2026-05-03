# Skill: Security — Compañeros en Ruta

## Scope

Authentication, authorization, RLS enforcement, secrets handling, input validation, output sanitization, and threat-surface review for changes in this repository.

This skill is the **security overlay** to all other skills. Apply it to every task that touches data, auth, or external surface.

---

## When to Use

- Adding/modifying any API route or Server Action
- Touching auth, sessions, role assignment, or role-based UI
- Working with file uploads, exports, or QR generation
- Handling PII, credentials, tokens, or signed URLs
- Reviewing a change before declaring it done

---

## Threat Model (this app)

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Tenant data | Cross-tenant leak | `tenant_id` filter + RLS + helper-function policies |
| User credentials | Theft | Supabase Auth; never log; bcrypt-managed by Supabase |
| Session cookies | Hijack | HttpOnly + Secure (set by `@supabase/ssr`); refresh in middleware |
| Service-role key | Misuse | Server-only; only loaded via `env.SUPABASE_SERVICE_ROLE_KEY`; never exposed to client |
| QR codes | Replay / forgery | Status enum + redemption count; `validate_qr_data` triggers; `redeem_qr` SECURITY DEFINER |
| Promotor location | Spoofing | Captured client-side; logged with check-in; not used as a security control on its own |
| Storage objects | Cross-tenant access | Path prefix `tenant_id/...` + bucket policies |
| Realtime channels | Unauthorized subscription | RLS-aware channels + filter on `tenant_id` |
| Exports | Data exfiltration | Role-gated route; rate-limit if introduced |

---

## Step-by-Step

### 1. Authenticate the request

Always go through the auth helper for the role:

```typescript
const auth = await resolvePromotorAuth(supabase);
if (isPromotorAuthError(auth)) return promotorAuthErrorResponse(auth);
```

Never:
- Read a user identifier from the request body.
- Decode/trust a JWT manually.
- Skip auth on a "internal" route — there is no internal route.

### 2. Authorize the operation

Three layers:

1. **Role gate** — auth helper proves the user has the role.
2. **Scope gate** — for brand-bound roles, verify the row's `brand_id` is in the user's brand set.
3. **Relationship gate** — for promotor / asesor flows, verify `client_assignments` (or equivalent membership) before reading/writing the related row.

```typescript
// Example: promotor creating a visit
const { data: assignment } = await supabase
  .from("client_assignments")
  .select("id, brand_id")
  .eq("user_profile_id", auth.userProfileId)
  .eq("client_id", parsed.data.client_id)
  .eq("is_active", true)
  .is("deleted_at", null)
  .maybeSingle();
if (!assignment) return NextResponse.json({ error: "Cliente no asignado" }, { status: 403 });
```

### 3. Enforce tenant isolation

See `.claude/rules/multi-tenant.md`. The non-negotiable rules:

- `tenant_id` filter on every read/write of tenant-scoped tables
- `tenant_id` derived from the authenticated user, never from the client
- Validate cross-table FKs share `tenant_id` (in code or via DB trigger)

### 4. Validate input

```typescript
const schema = z.object({
  client_id: z.string().uuid(),
  notes: z.string().max(2000).optional(),
});
const parsed = schema.safeParse(await request.json().catch(() => null));
if (!parsed.success) {
  return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
}
```

Validate query strings with the same discipline — coerce types explicitly:
```typescript
const qsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### 5. Sanitize output

- Never echo back database error messages verbatim — they may reveal schema. Log them; return a generic message.
- Strip server-only fields (e.g., `tenant_id`) from API responses unless the client genuinely needs them.
- Map UUIDs to `public_id` for any user-facing identifier.

### 6. Secrets

- All env access goes through `src/lib/env.ts` (Zod-validated). Add new vars there.
- `NEXT_PUBLIC_*` vars are exposed to the browser by Next.js — use only for non-secret values.
- `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_SECRET` are server-only. Never reference them in a Client Component or in code that ships to the browser bundle.
- `console.log` of an error object can leak headers/cookies. Log a controlled string + the error message only.

### 7. File uploads

- Validate file type (extension AND MIME) and size before upload.
- Store under `<tenant_id>/<entity>/<public_id>/<filename>` paths.
- Use signed URLs for private buckets; never expose service-role-signed URLs from the browser.

### 8. QR codes

- QR payloads MUST encode `public_id`, never raw UUIDs.
- Use the `redeem_qr` RPC for redemption — it enforces atomic state transitions.
- Validate redemption count and status before honoring the QR.

### 9. CSRF & cookies

- Next.js App Router with same-site cookies (Supabase default) covers most CSRF vectors for cookie-auth flows. For state-changing endpoints called from forms, ensure the cookie SameSite policy is intact.
- For Server Actions, Next.js handles CSRF tokens automatically.

### 10. Rate limiting

- Currently not enforced repo-wide. For public-facing endpoints (login, password reset, QR generation), add rate limiting before merging — surface the gap if absent.

### 11. Audit logging

- The `audit_logs` table exists (migrations `20260221180000_*` and earlier). Sensitive ops (role changes, data exports, admin actions) MUST write an audit row.
- Use `audit_action_enum` for the action field.

---

## Anti-Patterns (security)

- ❌ Trusting `tenant_id` / `brand_id` / `role` from the request body.
- ❌ Using `createServiceClient()` to "fix" an RLS error.
- ❌ Returning Supabase error objects as response bodies.
- ❌ Storing tokens, secrets, or PII in `localStorage`.
- ❌ Logging request bodies that might contain PII or tokens.
- ❌ Using `dangerouslySetInnerHTML` with user-supplied content.
- ❌ Building HTML strings with template literals that interpolate user input (use React rendering).
- ❌ Granting `EXECUTE` on a SECURITY DEFINER function to `public` without explicit reason.
- ❌ Disabling RLS in tests instead of seeding a representative auth context.

---

## Validation Checklist (security review)

```
[ ] Auth helper used; role verified
[ ] Scope verified (brand_id, assignment, ownership)
[ ] tenant_id derived from auth, present in every query
[ ] Zod validates body + query string; numeric/uuid types enforced
[ ] No service-role usage in user-facing flows
[ ] Output strips server-only fields; uses public_id outward
[ ] Errors logged, not exposed; status codes are accurate
[ ] No new secrets / tokens; env access through src/lib/env.ts
[ ] File uploads constrained by type + size + path prefix
[ ] QR / signed URLs / public_ids: no raw UUID exposure
[ ] Sensitive ops write to audit_logs
[ ] Tests cover auth-failure, cross-tenant, and validation paths
[ ] No DOM-XSS surface (no dangerouslySetInnerHTML on user input)
```

---

## Stop Conditions

Stop and ask the user if:

1. The change requires reading/writing across tenants.
2. Service-role access seems necessary outside an admin path.
3. RLS policy doesn't exist for a new table you're touching.
4. A required validation can only be enforced client-side (it must also be server-side).
5. PII would appear in logs or exports without explicit handling.

When in doubt, choose the more restrictive option.
