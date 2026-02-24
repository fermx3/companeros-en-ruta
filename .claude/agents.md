# Agent Compliance Control

## Purpose

This file ensures that **all agents and subagents** working in this repository follow the strict rules defined in [CLAUDE.md](../CLAUDE.md).

**THIS IS NOT OPTIONAL.** Every agent must read and comply with these instructions before taking any action.

---

## 🚨 BEFORE YOU START: MANDATORY READING

If you are a **subagent** or **secondary agent** invoked to complete a task in this repository:

1. **STOP** — Do not proceed with implementation yet
2. **READ** — Open and read [../CLAUDE.md](../CLAUDE.md) in its entirety (this is NON-NEGOTIABLE)
3. **UNDERSTAND** — This is a multi-tenant SaaS with strict database-first, migration-first, RLS-first rules
4. **VERIFY** — Follow the verification checklist below before making any changes
5. **PROCEED** — Only after completing steps 1-4

---

## ⚠️ Key Principles (from CLAUDE.md)

### 1. Schema Truth & No Guessing
- **NEVER assume** database schema, tables, columns, types, or relations
- **ALWAYS verify** from:
  - Versioned migrations in `supabase/migrations/`
  - Local Supabase DB (Docker) via `psql` or Supabase CLI
- If you cannot verify schema → **STOP and ask for clarification**

### 2. Migration-First Policy
- **ALL database changes** must be implemented via versioned migrations
- Workflow: Create migration → Apply locally → Validate → (optionally) Verify remote
- **NO manual changes** to database structure outside migrations

### 3. RLS-First Security
- Multi-tenant isolation is **mandatory**, not optional
- Every table must have appropriate RLS policies
- Never bypass or weaken RLS for convenience
- Always verify RLS implications before proposing changes

### 4. Local-First Development
- Default to **local Supabase Docker DB** for verification
- Only connect to remote when:
  - Task requires remote-only resources (Edge Functions, storage config, auth settings)
  - Shipping changes and need final verification
  - Evidence of schema drift
- **Do NOT** perform repeated full database dumps

---

## ✅ Pre-Implementation Verification Checklist

Before implementing ANY task that touches the database, you MUST:

- [ ] Read [CLAUDE.md](../CLAUDE.md) completely
- [ ] Identify which tables/schemas are affected
- [ ] Verify current schema from one of:
  - [ ] Latest migrations in `supabase/migrations/`
  - [ ] Local Supabase DB via `psql` command
  - [ ] Supabase CLI (`supabase db inspect`)
- [ ] Check existing RLS policies on affected tables
- [ ] Confirm multi-tenant implications (tenant_id, brand_id isolation)
- [ ] Plan migration file if schema changes are needed

### For Frontend/API Tasks:
- [ ] Understand Server Component vs Client Component boundaries
- [ ] Verify TypeScript types are schema-aligned
- [ ] Check that queries respect RLS (no raw SQL bypassing policies)
- [ ] Validate with Zod schemas where applicable

---

## 📋 Task Execution Template for Subagents

When you receive a task, structure your response like this:

### 1. Acknowledge Compliance
```
✓ I have read CLAUDE.md
✓ I understand this is a multi-tenant SaaS with strict DB rules
✓ I will verify schema before proposing changes
```

### 2. Schema Verification (if DB-related)
```sql
-- Show the SQL commands you'll use to verify schema
-- Example:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'target_table'
AND table_schema = 'public';
```

### 3. Propose Implementation
- Break down the task into steps
- Show migration SQL if schema changes are needed
- Explain RLS implications
- Provide code with proper type safety

### 4. Validation Plan
- How will you test locally?
- What RLS scenarios need validation?
- Any edge cases to consider?

---

## 🚫 BLOCKING CONDITIONS

You **MUST STOP IMMEDIATELY** and report to the invoking agent if:

- You cannot access or verify the database schema
- RLS implications are unclear or risky
- A proposed change could cause cross-tenant data leakage
- Migration cannot be validated locally
- You detect schema drift between migrations and actual DB

**Do NOT guess. Do NOT simulate. Do NOT proceed without verification.**

---

## 📚 Additional Resources

### Project-Specific Skills
Located in `.claude/skills/`:
- [supabase-database.md](skills/supabase-database.md) — Multi-tenant DB architecture, current schema, RLS patterns
- [api-integration.md](skills/api-integration.md) — Next.js Route Handlers + Supabase integration
- [frontend-design.md](skills/frontend-design.md) — Design system, components, Tailwind + shadcn/ui

### Task Templates
Located in `.claude/blueprints/`:
- [example-task.md](blueprints/example-task.md) — Standard task structure with schema verification steps

### General Skills
Located in `skills/`:
- `backend-apis/` — API development patterns
- `data-sql/` — SQL and database best practices
- `frontend/` — Frontend development guidelines
- `security/` — Security best practices
- `testing-qa/` — Testing strategies

---

## 🎯 Workflow Summary

```
┌─────────────────────────────────────┐
│  Subagent Invoked with Task        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Read CLAUDE.md (MANDATORY)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Verify Schema (if DB-related)      │
│  - Check migrations                 │
│  - Query local Supabase DB          │
│  - Confirm RLS policies             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Propose Implementation             │
│  - Migration SQL (if needed)        │
│  - Code changes                     │
│  - RLS implications                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Validate Locally                   │
│  - Apply migration                  │
│  - Run tests                        │
│  - Verify RLS behavior              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Report Back to Invoking Agent     │
└─────────────────────────────────────┘
```

---

## 🔄 When to Escalate

If you encounter any of these situations, **stop and escalate** to the primary agent:

1. **Schema verification fails** — Cannot access DB or migrations are unclear
2. **RLS ambiguity** — Unsure how to enforce tenant isolation safely
3. **Migration conflict** — Proposed change conflicts with existing structure
4. **Breaking change detected** — Change would break existing functionality
5. **Cross-tenant risk** — Potential data leakage across tenants
6. **Insufficient context** — Task requirements are ambiguous

**NEVER make assumptions in these cases. Always ask for clarification.**

---

## 🎓 What Makes a Good Subagent Response

### ✅ GOOD:
```
I've read CLAUDE.md and understand the constraints.

Schema Verification:
- Checked migrations/20260208020000_fix_asesor_ventas_clients_policy.sql
- Confirmed 'clients' table has: tenant_id, business_name, zone_id
- RLS policy 'clients_tenant_isolation' enforces tenant_id match

Implementation Plan:
1. Create migration: 20260212120000_add_client_tags.sql
2. Add 'tags' JSONB column to clients table
3. Update RLS policies to include tags in selection
4. Update TypeScript types in lib/types/client.ts

This change is safe because:
- Maintains tenant_id isolation
- JSONB is flexible and non-breaking
- Existing RLS policies still apply
```

### ❌ BAD:
```
I'll add a tags field to the clients table. Here's the code:

ALTER TABLE clients ADD COLUMN tags TEXT[];

Done!
```

**Why bad?**
- No CLAUDE.md acknowledgment
- No schema verification
- No migration mentioned
- No RLS consideration
- No tenant isolation check

---

## FINAL REMINDER

**This is a production system with real user data.**

Your actions have consequences. Follow the rules in [CLAUDE.md](../CLAUDE.md) without exception.

When in doubt: **Verify first, implement second.**
