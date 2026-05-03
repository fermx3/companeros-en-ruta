# LEARNINGS.md — Compañeros en Ruta

> Persistent log of non-obvious findings discovered during implementation.
> Append-only. Never delete; supersede.

---

## Purpose

Each entry captures a **surprise** — something that wasn't visible from the code/schema alone and that, if forgotten, would lead to repeated mistakes. The aim is to prevent the same trap from being hit twice.

**DO NOT** record:
- Things obvious from `src/lib/types/database.ts`
- Style preferences (those go in `.claude/rules/coding-standards.md`)
- One-off ticket details
- Generic Next.js / Supabase facts

**DO** record:
- Schema quirks not captured by types (constraints, triggers, enum casts)
- RLS gotchas (recursion, helper-function dependencies, performance traps)
- Cross-table coupling that isn't enforced by FKs
- Hidden invariants enforced only by `validate_*` triggers
- Build/runtime traps (Next.js 16 + Turbopack quirks, RSC boundaries)
- Things that broke once and silently regressed

---

## Entry Format

```markdown
### YYYY-MM-DD — <Short title>

- **Context:** <Where this came up — file/route/migration>
- **Symptom:** <What went wrong / what was confusing>
- **Root cause:** <Why — the underlying invariant>
- **Fix / Rule:** <What to do next time>
- **Tags:** <#schema #rls #frontend #migration #auth #multi-tenant #performance ...>
```

Keep each section to 1–3 lines. Link to commits, files, or migrations when useful.

---

## Append Rules

1. **One entry per finding.** Don't bundle.
2. **Date in ISO format** (YYYY-MM-DD). Use today's actual date.
3. **Tag aggressively** so future agents can grep.
4. **Supersede, don't rewrite.** If a learning becomes wrong, add a new entry that says "supersedes <date> — <title>" and explains what changed. Leave the old entry in place.
5. **No PII, no secrets, no tenant data.** Anonymize tenant/brand/client names.
6. After appending, **read the previous 3 entries** to detect duplicate findings.

---

## How Future Agents Use This File

Before starting non-trivial work:

1. Identify the area you'll touch (auth, RLS, visits, QR, etc.).
2. `grep` LEARNINGS.md for relevant tags.
3. Apply the rules from any matching entries.
4. If you discover a contradiction with current state, supersede.

---

## Avoiding Repetition

A finding worth recording is worth **operationalizing**. After three entries on the same theme, promote the rule into:

- `.claude/rules/*.md` (a hard rule), or
- A skill page in `.claude/skills/*.md` (a pattern), or
- A lint / type-level check (best when feasible)

LEARNINGS.md is the staging ground; rules and skills are the canon.

---

## Entries

> Append below. Newest at top.

<!-- ### 2026-05-03 — Example finding -->
<!-- - **Context:** src/app/api/promotor/visits/route.ts -->
<!-- - **Symptom:** Visit insert failed with "promotor_id role mismatch" despite role being 'asesor_de_ventas' -->
<!-- - **Root cause:** validate_visit_data() trigger only accepts 'promotor' or 'supervisor'; visit_orders trigger accepts 'asesor_de_ventas' too -->
<!-- - **Fix / Rule:** For asesor flows, write to visit_orders, not visits. Document at top of any visit-creation handler. -->
<!-- - **Tags:** #schema #triggers #visits #asesor -->
