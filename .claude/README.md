# .claude/ Documentation Index

This directory contains **project-specific AI agent instructions** and implementation guides for **Compañeros en Ruta**.

---

## 📖 Quick Navigation

### 🚨 Start Here (MANDATORY)
1. **[../CLAUDE.md](../CLAUDE.md)** — **Non-negotiable rules** for all agents
   - Database-first, migration-first, RLS-first principles
   - Schema verification requirements
   - Multi-tenant security rules
   - Blocking conditions

2. **[agents.md](agents.md)** — **Subagent compliance control**
   - Pre-implementation checklist
   - Task execution template
   - Blocking conditions for subagents
   - Escalation procedures

### 📚 Implementation Guides

#### Project-Specific Skills (`skills/`)
Located in `.claude/skills/` — Read before implementing features in this project:

- **[supabase-database.md](skills/supabase-database.md)**
  - Multi-tenant DB architecture
  - Current schema reference
  - RLS patterns and policies
  - Query examples

- **[api-integration.md](skills/api-integration.md)**
  - Next.js Route Handlers
  - Supabase client patterns
  - Server Actions
  - Authentication flows

- **[frontend-design.md](skills/frontend-design.md)**
  - Design system guidelines
  - shadcn/ui components
  - Tailwind CSS conventions
  - Server vs Client Components

#### General Skills (`../skills/`)
Located in root `skills/` directory — Reusable across projects:

- `backend-apis/` — API development best practices
- `data-sql/` — SQL patterns and database design
- `frontend/` — Frontend architecture
- `security/` — Security and auth patterns
- `testing-qa/` — Testing strategies
- `safe-refactor/` — Refactoring guidelines
- `pr-review/` — Code review checklists
- `research-docs/` — Documentation research

### 🧩 Task Templates (`blueprints/`)

- **[example-task.md](blueprints/example-task.md)**
  - Standard task structure
  - Schema verification template
  - Step-by-step implementation guide
  - RLS considerations

---

## 🗺️ Documentation Hierarchy

```
CLAUDE.md (root)                    ← Source of truth
    ↓
.claude/agents.md                   ← Subagent control
    ↓
.claude/skills/                     ← Project-specific guides
    ├── supabase-database.md
    ├── api-integration.md
    └── frontend-design.md
    ↓
.claude/blueprints/                 ← Task templates
    └── example-task.md
    ↓
../skills/                          ← General reusable skills
    ├── backend-apis/
    ├── data-sql/
    ├── frontend/
    └── ...
```

---

## 🎯 When to Use What

### Use [CLAUDE.md](../CLAUDE.md) when:
- Starting any new task in this repository
- Uncertain about database verification requirements
- Need to understand project architecture
- Checking if a proposed change is allowed

### Use [agents.md](agents.md) when:
- Invoking a subagent to complete a task
- Need template for subagent prompts
- Defining expectations for agent behavior
- Escalating blocked tasks

### Use [skills/supabase-database.md](skills/supabase-database.md) when:
- Writing queries or migrations
- Need to understand table structure
- Implementing RLS policies
- Verifying multi-tenant isolation

### Use [skills/api-integration.md](skills/api-integration.md) when:
- Creating new API routes
- Implementing Server Actions
- Writing auth middleware
- Integrating Supabase client

### Use [skills/frontend-design.md](skills/frontend-design.md) when:
- Creating UI components
- Styling with Tailwind CSS
- Using shadcn/ui components
- Deciding Server vs Client Component

### Use [blueprints/example-task.md](blueprints/example-task.md) when:
- Structuring a new implementation task
- Need template for schema verification
- Creating step-by-step implementation plans
- Documenting DB changes with migrations

### Use [../skills/](../skills/) (general) when:
- Need broader context beyond this project
- Reference patterns applicable to other codebases
- Learn about general best practices

---

## 🔄 Workflow for New Features

### For Primary Agents:
```
1. Read CLAUDE.md (understand rules)
   ↓
2. Consult relevant .claude/skills/ (understand implementation patterns)
   ↓
3. Verify schema (from migrations or local DB)
   ↓
4. Use blueprints/example-task.md (structure your task)
   ↓
5. Implement or invoke subagent with clear instructions
   ↓
6. Validate (test locally, check RLS, run type checks)
```

### For Subagents:
```
1. Read CLAUDE.md (mandatory)
   ↓
2. Read agents.md (understand expectations)
   ↓
3. Follow verification checklist
   ↓
4. Acknowledge compliance
   ↓
5. Propose implementation (with schema verification)
   ↓
6. Report back or escalate if blocked
```

---

## 🚫 Common Pitfalls (Avoid These)

❌ **Assuming database schema** without reading migrations
✅ **Verify from** `supabase/migrations/` or local DB

❌ **Proposing manual ALTER TABLE** outside migrations
✅ **Create versioned migration file** in `supabase/migrations/`

❌ **Bypassing RLS** for convenience
✅ **Respect tenant isolation** and use authenticated context

❌ **Using `any` types** without justification
✅ **Proper TypeScript** aligned with DB schema

❌ **Skipping local validation**
✅ **Test locally** before proposing remote changes

---

## 📝 Additional Configuration Files

- **[settings.local.json](settings.local.json)** — Local permissions for bash commands
- **[../.github/copilot-instructions.md](../.github/copilot-instructions.md)** — GitHub Copilot config (references CLAUDE.md)

---

## 🔧 Maintenance

### When to update these files:

- **[CLAUDE.md](../CLAUDE.md)** — When core architectural decisions change (auth model, DB strategy, tenancy rules)
- **[agents.md](agents.md)** — When subagent behavior needs adjustment or new blocking conditions arise
- **[skills/*.md](skills/)** — When project patterns evolve (new tables, changed RLS, updated stack)
- **[blueprints/*.md](blueprints/)** — When task structure or templates need refinement

### Update order:
1. Update [CLAUDE.md](../CLAUDE.md) first (source of truth)
2. Update dependent files ([agents.md](agents.md), skills, blueprints)
3. Verify references and links are correct
4. Test with a sample task to confirm compliance

---

## 🆘 Need Help?

**If you're an agent and:**
- Cannot verify schema → Stop and escalate (see [agents.md](agents.md))
- RLS rules are unclear → Read [skills/supabase-database.md](skills/supabase-database.md)
- Task structure is unclear → Use [blueprints/example-task.md](blueprints/example-task.md)
- Authentication patterns unclear → Read [skills/api-integration.md](skills/api-integration.md)

**If you're a human developer:**
- All AI behavior is controlled by files in this directory
- [CLAUDE.md](../CLAUDE.md) is the single source of truth
- Modify these files to change agent behavior
- Keep documentation synchronized with actual codebase

---

## 📊 File Summary

| File | Purpose | Read Frequency | Update Frequency |
|------|---------|----------------|------------------|
| [../CLAUDE.md](../CLAUDE.md) | Core rules | Every task | Rarely (architectural changes) |
| [agents.md](agents.md) | Subagent control | When invoking subagents | Occasionally (behavior adjustments) |
| [skills/*.md](skills/) | Implementation guides | As needed for features | Regularly (as patterns evolve) |
| [blueprints/*.md](blueprints/) | Task templates | Creating structured tasks | Occasionally (template improvements) |
| [settings.local.json](settings.local.json) | Permissions | At runtime | Rarely (permission changes) |

---

**Remember:** This is a production system. Accuracy, safety, and verification are mandatory. Speed without certainty is failure.
