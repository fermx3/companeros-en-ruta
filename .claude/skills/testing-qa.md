# Skill: Testing & QA — Compañeros en Ruta

## Scope

Writing and running tests with the project's existing tooling:

- **Jest 30** + **@testing-library/react 16** + **jest-environment-jsdom** for unit/integration
- **MSW 2** for HTTP mocking
- **Playwright 1.56** for end-to-end (`apps/web/__tests__/e2e/`)
- **pg 8** in `tests/database/` for DB-level tests
- Path alias `@/` resolves to `src/` in jest (`jest.config.cjs`)

Scripts (`package.json`):
```
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
npm run test:db
npm run test:integration
npm run test:all
```

---

## When to Use

- New API route, hook, component, service, or DB function → write/update tests.
- Bugfix → write a regression test that fails before, passes after.
- Refactor → ensure existing tests still pass without modification (if they need to change, the behavior changed, not the refactor).

---

## Test Layout

```
__tests__/
  app/                  # page tests (Server / Client)
  components/           # component tests (UI primitives + domain)
  database/             # RLS / DB function tests (pg client)
  e2e/                  # Playwright specs
  integration/          # auth / multi-step flows
  lib/                  # utility / type / supabase client tests
  middleware.test.tsx   # Next.js middleware
```

Mirror `src/` paths under `apps/web/__tests__/`. Component file `apps/web/src/components/ui/metric-card.tsx` → `apps/web/__tests__/components/ui/metric-card.test.tsx`.

E2E specs go under `apps/web/__tests__/e2e/*.spec.ts`.

---

## Step-by-Step

### 1. Unit test a component

```typescript
// __tests__/components/ui/status-badge.test.tsx
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/status-badge";

describe("StatusBadge", () => {
  it("renders the active status with success styling", () => {
    render(<StatusBadge status="active">Activo</StatusBadge>);
    const badge = screen.getByText("Activo");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toMatch(/bg-success|text-success/);
  });
});
```

### 2. Test a hook

```typescript
// __tests__/hooks/useDebounce.test.ts
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

jest.useFakeTimers();

it("debounces a value", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), {
    initialProps: { v: "a" },
  });
  rerender({ v: "ab" });
  expect(result.current).toBe("a");
  act(() => { jest.advanceTimersByTime(200); });
  expect(result.current).toBe("ab");
});
```

### 3. Test an API route handler

Mock Supabase with a thin chainable mock or use MSW for end-to-end-ish tests.

```typescript
// __tests__/app/api/promotor/visits.test.ts
/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "@/app/api/promotor/visits/route";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));
jest.mock("@/lib/api/promotor-auth", () => ({
  resolvePromotorAuth: jest.fn(),
  isPromotorAuthError: (r: any) => r._type === "promotor_auth_error",
  promotorAuthErrorResponse: (e: any) =>
    new Response(JSON.stringify({ error: e.message }), { status: e.status }),
}));

import { resolvePromotorAuth } from "@/lib/api/promotor-auth";

it("returns 401 when not authenticated", async () => {
  (resolvePromotorAuth as jest.Mock).mockResolvedValue({
    _type: "promotor_auth_error",
    message: "Usuario no autenticado",
    status: 401,
  });
  const req = new NextRequest("http://localhost/api/promotor/visits");
  const res = await GET(req);
  expect(res.status).toBe(401);
});
```

### 4. Multi-tenant negative test (CRITICAL)

For every new API route, add a test that proves a user from tenant A cannot read tenant B's data. Use the `database/rls.test.ts` style for DB-level tests, or mock the helper to return a different tenant and assert the empty result.

### 5. RLS test (DB level)

```typescript
// __tests__/database/visits-rls.test.ts
/** @jest-environment node */
import { Client } from "pg";

let pg: Client;

beforeAll(async () => {
  pg = new Client({ connectionString: process.env.DATABASE_URL_LOCAL });
  await pg.connect();
});
afterAll(() => pg.end());

it("denies cross-tenant SELECT under RLS", async () => {
  // Use SET LOCAL ROLE / pgjwt to assume tenant A user
  await pg.query("BEGIN");
  await pg.query(`SET LOCAL ROLE authenticated`);
  await pg.query(`SET LOCAL request.jwt.claims = '{"sub":"<tenant-A-user-id>"}'`);
  const { rows } = await pg.query("SELECT id FROM visits WHERE tenant_id = $1", [
    "<tenant-B-id>",
  ]);
  expect(rows).toHaveLength(0);
  await pg.query("ROLLBACK");
});
```

(Adjust to the project's actual local-DB JWT scheme — verify with `supabase status`.)

### 6. E2E with Playwright

```typescript
// __tests__/e2e/promotor-visits.spec.ts
import { test, expect } from "@playwright/test";

test("promotor can list and create a visit", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(process.env.E2E_PROMOTOR_EMAIL!);
  await page.getByLabel("Contraseña").fill(process.env.E2E_PROMOTOR_PASSWORD!);
  await page.getByRole("button", { name: /entrar/i }).click();

  await page.waitForURL(/\/promotor/);
  await page.getByRole("link", { name: /visitas/i }).click();
  await expect(page.getByRole("heading", { name: /visitas/i })).toBeVisible();
});
```

E2E credentials live in env vars (set in `playwright.config.ts` or local `.env.test`).

### 7. MSW for fetch mocks in component tests

```typescript
// __tests__/setup/msw.ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  http.get("/api/promotor/visits", () =>
    HttpResponse.json({ visits: [], metrics: {}, pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
  ),
);
```

Then in `jest.setup.js`:
```js
import { server } from "./__tests__/setup/msw";
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 8. Coverage targets

There is no enforced coverage threshold in `jest.config.cjs`. Target by importance:

- API route handlers: 80% line coverage minimum, including auth-failure paths.
- Hooks: cover loading, success, error.
- DB triggers/policies: at minimum a happy-path + cross-tenant negative test per policy.
- UI primitives in `apps/web/src/components/ui/`: cover variants + a11y semantics.

### 9. Test data

- Use realistic, anonymized data — not personal info.
- Build factories under `apps/web/__tests__/factories/` (create as needed) to avoid fixture sprawl.

### 10. Running locally

```
npm run test                                # all unit + integration
npm run test -- src/app/api/promotor       # focused
npm run test:db                             # DB-level (requires local Supabase running)
npm run test:e2e                            # Playwright
npm run test:e2e:ui                         # Playwright UI mode
```

---

## Anti-Patterns

- ❌ Mocking Supabase to return any shape you want without referencing real types — drift makes tests useless.
- ❌ Testing implementation details (internal state, private methods) instead of observable behavior.
- ❌ Skipping the cross-tenant negative test "because RLS will catch it." Tests prove RLS catches it.
- ❌ Overlapping unit + e2e for the same flow without value. Each layer should add unique signal.
- ❌ Using real production credentials in tests.
- ❌ `setTimeout(...)` instead of `jest.useFakeTimers()` or Playwright `waitFor`.
- ❌ Asserting against rendered class names that aren't part of the component's contract.

---

## Examples From the Repo

- `apps/web/__tests__/middleware.test.tsx` — Next.js middleware test.
- `tests/database/rls.test.ts` — RLS pattern (current form is mock-based; extend toward real local DB checks when feasible).
- `apps/web/__tests__/integration/auth-flow.test.tsx` — multi-step auth flow.
- `apps/web/__tests__/components/ui/*.test.tsx` — UI primitive coverage.
- `apps/web/__tests__/e2e/auth.spec.ts` — Playwright login.

---

## Validation Checklist

```
[ ] New API route: at least 1 test for 200, 401, 403, 4xx validation
[ ] Cross-tenant negative test added for new role-scoped endpoints
[ ] Hooks tested with renderHook for loading/success/error
[ ] Component tests assert behavior and a11y, not internal class names
[ ] Tests pass: npm run test
[ ] If UI flow changed: E2E spec added or updated
[ ] If DB changed: __tests__/database/ updated
[ ] Coverage delta is non-negative for changed files
[ ] No flaky timers; no hardcoded delays
[ ] No real credentials committed
```
