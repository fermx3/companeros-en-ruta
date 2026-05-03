# Skill: Data & SQL — Compañeros en Ruta

## Scope

Writing raw SQL — for ad-hoc analysis, reports, materialized views, KPI computations, seeds, and `SELECT`/`INSERT`/`UPDATE` patterns inside migrations and Postgres functions.

This skill **complements** `.claude/skills/supabase-database.md` (schema/migrations/RLS focus) with a query-craft focus.

---

## When to Use

- Building reporting queries (KPI dashboards, brand metrics)
- Writing materialized views or DB functions for aggregations
- Inspecting the local DB to verify schema or debug data
- Writing seeds (`scripts/seed_demo_data.sql`)
- Crafting RPC functions exposed via `supabase.rpc(...)`

Do not use for: app-side query construction (use Supabase JS client + `.claude/skills/backend-apis.md`).

---

## Step-by-Step

### 1. Use the local Supabase Postgres

- Inspect via the local Docker DB (run `supabase status` to find the connection string).
- For one-off SELECTs, prefer `psql` against the local instance.
- Never run destructive SQL against the remote without explicit user approval.

### 2. Multi-tenant safety in raw SQL

Every analytic query MUST scope by `tenant_id`. There is **no implicit tenant** in raw SQL — RLS only applies under an authenticated user, and most analytical work runs as a privileged session.

```sql
-- CORRECT
SELECT v.id, v.public_id, v.visit_status, c.business_name
FROM visits v
JOIN clients c ON c.id = v.client_id
WHERE v.tenant_id = $1
  AND c.tenant_id = $1
  AND v.deleted_at IS NULL
  AND c.deleted_at IS NULL
  AND v.visit_date >= date_trunc('month', current_date)
ORDER BY v.visit_date DESC;
```

Filter `tenant_id` on **both sides** of the join for defense-in-depth. The schema doesn't structurally prevent cross-tenant joins.

### 3. Soft delete

Always include `deleted_at IS NULL` for tables that have it. Tables in this repo with `deleted_at` (verify per-table):

- `user_roles`
- `client_assignments`
- `client_brand_memberships`
- `visits`
- `clients` (verify)

### 4. Enums require explicit cast

```sql
-- in PL/pgSQL or seeds
INSERT INTO visits (tenant_id, client_id, promotor_id, visit_status)
VALUES ($1, $2, $3, 'in_progress'::visit_status_enum);
```

### 5. JSONB columns

Several tables use JSONB (`preferences`, `settings`, `permissions`, `benefits`, etc.). Use `->` / `->>` carefully and prefer `jsonb_path_query` for complex shapes.

```sql
SELECT
  t.name,
  jsonb_array_elements(t.benefits) ->> 'description' AS benefit_desc
FROM tiers t
WHERE t.tenant_id = $1
  AND t.brand_id = $2;
```

### 6. Aggregations

For monthly KPIs, follow the existing pattern in `20260219120000_create_kpi_targets_and_enrichment_views.sql`. Aggregate via views or SQL functions, not in app code.

```sql
SELECT
  date_trunc('month', v.visit_date)::date AS month,
  v.brand_id,
  COUNT(*)                                     AS total_visits,
  COUNT(*) FILTER (WHERE v.visit_status = 'completed') AS completed_visits,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE v.visit_status = 'completed') / NULLIF(COUNT(*), 0),
    2
  ) AS completion_pct
FROM visits v
WHERE v.tenant_id = $1
  AND v.deleted_at IS NULL
GROUP BY 1, 2
ORDER BY 1 DESC, 2;
```

### 7. Window functions for "latest per group"

```sql
SELECT DISTINCT ON (client_id) client_id, visit_date, visit_status
FROM visits
WHERE tenant_id = $1
  AND deleted_at IS NULL
ORDER BY client_id, visit_date DESC;
```

### 8. RPC functions exposed to the app

```sql
CREATE OR REPLACE FUNCTION public.get_promotor_dashboard(p_promotor_id UUID)
RETURNS TABLE (
  total_clients BIGINT,
  monthly_quota INT,
  completed_visits BIGINT,
  effectiveness NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER  -- preferred
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM client_assignments
       WHERE user_profile_id = p_promotor_id
         AND is_active = true
         AND deleted_at IS NULL)                         AS total_clients,
    COALESCE((SELECT monthly_quota FROM promotor_assignments
       WHERE user_profile_id = p_promotor_id
         AND is_active = true LIMIT 1), 100)             AS monthly_quota,
    (SELECT COUNT(*) FROM visits
       WHERE promotor_id = p_promotor_id
         AND visit_status = 'completed'
         AND deleted_at IS NULL
         AND visit_date >= date_trunc('month', current_date))::BIGINT AS completed_visits,
    -- ...
    0::NUMERIC                                           AS effectiveness;
END;
$$;
```

Always set `search_path` on functions. Prefer `SECURITY INVOKER` so RLS still applies.

### 9. Performance

- Use `EXPLAIN ANALYZE` against the local DB to confirm index usage.
- Add indexes in the same migration that introduces a new query pattern.
- Avoid `SELECT *` in functions and views — return only what callers need.
- Avoid functions that perform unbounded scans inside loops; rewrite as set-based queries.

### 10. Seeds

`scripts/seed_demo_data.sql` is the canonical seed file. Match its conventions:

- Insert tenants → brands → users → roles → clients → memberships → products.
- Use `ON CONFLICT DO NOTHING` to keep seeds idempotent.
- Cast enums explicitly.
- Use deterministic UUIDs (`gen_random_uuid()` is fine for new seeds, but for cross-referenced rows use `WITH ... AS (INSERT ... RETURNING id)` or `RETURNING` chains).

---

## Anti-Patterns

- ❌ Single-side tenant filter on a join (filter on the parent only).
- ❌ Forgetting `deleted_at IS NULL` on soft-delete tables.
- ❌ Writing aggregations in app code that should be in a view or function.
- ❌ Casting enums implicitly (`'active'` instead of `'active'::user_role_status_enum`) inside PL/pgSQL.
- ❌ Using `auth.uid()` raw inside a hot policy (wrap with `(SELECT auth.uid())`).
- ❌ Creating functions without `search_path` set.
- ❌ Returning `JSONB` columns in views without thinking about RLS on nested entities.

---

## Examples From the Repo

- `20260219120000_create_kpi_targets_and_enrichment_views.sql` — KPI computation pattern.
- `20260215150000_create_admin_dashboard_metrics_function.sql` — RPC for admin dashboard.
- `20260221180000_fix_audit_logs_and_pg_trgm.sql` — extension + index fix.
- `scripts/seed_demo_data.sql` — seed style.

---

## Validation Checklist

```
[ ] tenant_id filter on every table in the FROM/JOIN
[ ] deleted_at IS NULL where applicable
[ ] Enums cast explicitly in PL/pgSQL and seeds
[ ] Functions have SET search_path
[ ] Functions default to SECURITY INVOKER unless DEFINER is justified
[ ] Indexes exist for every WHERE/JOIN column used by hot queries
[ ] EXPLAIN ANALYZE inspected for new analytical queries
[ ] No SELECT * in views or functions
[ ] Aggregations live in views/functions, not app code
[ ] Seeds use ON CONFLICT DO NOTHING and explicit casts
```
