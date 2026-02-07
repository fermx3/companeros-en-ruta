# CLAUDE.md

## Project Context — Compañeros en Ruta

This repository contains a **production-grade, multi-tenant SaaS** built with **Next.js (App Router)** and **Supabase** as the backend platform. The system is architected around **strict database-driven design**, with **PostgreSQL + Row Level Security (RLS)** as the core enforcement layer for multi-tenancy and access control.

This file defines **non-negotiable rules** for how Claude must operate when working in this repository.

---

## 🚨 NON‑NEGOTIABLE RULES (READ FIRST)

### 1. Database Is the Only Source of Truth

* You **MUST NOT assume** any table, column, type, relation, policy, view, function, or enum.
* You **MUST inspect the live Supabase database schema** before:

  * modifying database structure
  * writing queries that depend on schema
  * changing RLS policies
  * introducing or modifying data-access logic

If you have not verified the database structure **directly**, you are operating on invalid assumptions.

**DO NOT PROCEED.**

---

### 2. Mandatory Direct Connection to Supabase

You **MUST attempt a direct connection** to the Supabase project using one or more of the following approved methods:

* **Supabase CLI** (preferred)
* **Direct PostgreSQL connection** (fallback)

Credentials may be used **only to establish a connection** — never as a source of schema truth.

If connection fails:

* ❌ Do NOT guess
* ❌ Do NOT simulate schema
* ❌ Do NOT continue implementation

Instead:

1. Stop immediately
2. Explain **why** the connection failed
3. Provide **exact, actionable steps** to resolve it

**DO NOT CONTINUE UNTIL CONNECTION IS RESTORED.**

---

## 🗄️ REQUIRED DB SNAPSHOT (ONLY WHEN SCHEMA / RLS IS IMPACTED)

When a task impacts database structure or access control, you **MUST base decisions on a verified snapshot** of the current database.

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

You are not required to always output the full snapshot, but your solution **must be derived from it**.

---

## 🧱 DATABASE CHANGES POLICY (MIGRATION-FIRST)

* **All database changes MUST be implemented via migrations**
* Manual or implicit changes are not acceptable

### If you cannot apply a migration yourself:

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
