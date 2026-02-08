# CLAUDE.md

## Project Context — Compañeros en Ruta

This repository contains a **production-grade, multi-tenant SaaS** built with **Next.js (App Router)** and **Supabase** as the backend platform. The system is architected around **strict database-driven design**, with **PostgreSQL + Row Level Security (RLS)** as the core enforcement layer for multi-tenancy and access control.

This file defines **non-negotiable rules** for how Claude must operate when working in this repository.

---

## 🚨 NON‑NEGOTIABLE RULES (READ FIRST)

### 1. Schema Truth & No Guessing

* You **MUST NOT assume** any table, column, type, relation, policy, view, function, or enum.
* You **MUST base all schema-dependent work** on the **current project state**:

  * **Versioned migrations in this repo** (primary)
  * A **local Supabase Postgres** instance mounted via **Docker** that is built from those migrations (primary)

The working assumption for this repository is:

* The schema is controlled via migrations.
* No one is changing the database structure outside this repository.
* Therefore, the **local Supabase DB + migrations** represent the **most current schema** when kept in sync.

If you have not verified the schema from **migrations and/or the local Supabase DB**, you are operating on invalid assumptions.

**DO NOT PROCEED.**

---

### 2. Connection Policy (Local-First, Remote When Needed)

You **MUST NOT perform full database dumps repeatedly**.

#### Default workflow: Local-first

You **MUST** use one of these as the default verification sources:

* **Supabase CLI + local Supabase (Docker)** (preferred)
* **Local PostgreSQL connection** to the Supabase Docker DB

#### Remote Supabase connection

A direct connection to the hosted Supabase project is **NOT required for every task**.

You **MUST connect to the hosted Supabase project** only when:

* the task is explicitly about **remote-only resources** (e.g., Edge Functions deployed state, storage buckets configuration, auth settings, project settings)
* you are about to **ship** database changes and need a **final verification** against the hosted project
* there is evidence of **schema drift** (local vs remote mismatch) or uncertainty

Credentials may be used **only to establish connections** — never as a source of schema truth.

#### If connection or sync fails

If you cannot confirm schema from migrations/local DB **or** cannot complete a required remote verification:

* ❌ Do NOT guess
* ❌ Do NOT simulate schema
* ❌ Do NOT continue implementation

Instead:

1. Stop immediately
2. Explain **why** verification failed
3. Provide **exact, actionable steps** to restore verification (local sync and/or remote access)

**DO NOT CONTINUE UNTIL VERIFICATION IS RESTORED.**

---

## 🗄️ REQUIRED DB SNAPSHOT (ONLY WHEN SCHEMA / RLS IS IMPACTED)

When a task impacts database structure or access control, you **MUST base decisions on a verified snapshot**.

### Preferred sources (in order)

1. **Repo migrations** (authoritative history)
2. **Local Supabase DB (Docker)** built from migrations (authoritative current state)
3. **Hosted Supabase DB** (verification when needed)

### Minimum required understanding:

* Tables
* Columns
* Column types
* Views

### Additionally (only if relevant, no overkill):

* Foreign keys / relationships
* RLS policies
* Functions and triggers
* Enums and extensions

### Output rule

* You are **not required** to print a full schema dump.
* Only surface the relevant portion of the snapshot **when it impacts the proposed change**.
* Your solution **must be derived from verified sources above**.

---

## 🧱 DATABASE CHANGES POLICY (MIGRATION-FIRST)

* **All database changes MUST be implemented via migrations**
* Manual or implicit changes are not acceptable

### Local-first change workflow

When proposing database changes, you should assume this workflow:

1. Create / update **versioned migrations** in the repo
2. Apply them to the **local Supabase DB (Docker)**
3. Validate behavior locally (including RLS implications)
4. If the change is destined for production, perform a **final remote verification** step as required

### If you cannot apply migrations yourself

* Provide the **exact SQL migration** required
* Clearly explain **why** you cannot apply it

### Retro-documentation rule

If changes are detected that were made previously without migrations:

* You **MUST retro-document them** into proper migrations
* This must happen **before any new changes** are introduced

---

## 🔐 SECURITY RULES

* Never hardcode secrets
* Never log credentials or tokens
* Prefer local, least-privilege authentication methods
* Treat all tenant data as sensitive
* Never weaken or bypass RLS for convenience

Multi-tenancy isolation is a **hard requirement**, not an optimization.

---

## 🏗️ STACK & ARCHITECTURAL CONTEXT

You are operating in the following environment:

### Frontend

* Next.js 16 (App Router, Turbopack)
* React 19
* TypeScript (strict)
* Tailwind CSS 4 + shadcn/ui
* Zod, React Hook Form, Recharts, date-fns

### Backend / Platform

* Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
* supabase-js v2
* supabase-ssr

### Architecture

* Multi-tenant SaaS
* Tenants → Brands → Users / Zones / Clients
* RLS enforced on **all tables**

You must respect:

* Server Components vs Client Components boundaries
* Server Actions data access patterns
* RLS-aware querying at all times

---

## 🧪 QUALITY GATES (MANDATORY)

Before considering any change complete, the solution must be compatible with:

* Linting
* Type checking
* Unit / integration tests
* Build process

If a proposal would break any of these, you must surface it explicitly.

---

## ⛔ BLOCKING CONDITIONS

You must **STOP IMMEDIATELY** if:

* The database schema cannot be verified
* RLS implications are unclear
* A change risks cross-tenant data leakage
* A migration cannot be validated

In these cases, explain the blocker and propose a safe resolution path.

---

## 🧭 MAINTENANCE OF THIS FILE

If architectural decisions change (database strategy, auth model, tenancy rules):

* This file **must be updated first**
* Code changes should follow only after alignment

When in doubt:

> **Inspect the database first.**

---

## FINAL DIRECTIVE

You are expected to behave as a **senior production engineer**.

Accuracy, safety, and verification are mandatory.

Speed without certainty is failure.
