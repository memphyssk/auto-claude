# Stage v5 — Stack Selection: Baseline Default + Override Path

## Purpose
Make the single tech-stack decision that v6 architecture branches will assume as a given. Fast-path: accept the baseline and move on in 1 minute. Slow-path: override with explicit research when the project's shape requires a different stack (mobile app, ML pipeline, Rails monolith, etc.).

## Prerequisites
- v0-v4 complete (product shape is clear — we know what's being built, for whom, with what pages/features)
- READ `command-center/rules/dev-principles.md` § Code conventions (baseline stack lives here)

## Actions

### 1. Present baseline stack

Orchestrator proposes the auto-claude baseline:

```markdown
## Proposed stack (baseline)

**Monorepo:** Turborepo + pnpm
**Backend:** NestJS (Node.js + TypeScript strict)
**Frontend:** Next.js 15 (App Router, React 19 if available) + Tailwind + shadcn/ui
**Shared contracts:** Zod schemas in `@your-project/shared`, bridged to NestJS DTOs via `@anatine/zod-nestjs`
**Database:** PostgreSQL + Prisma ORM
**Cache / queues:** Redis (ioredis) — optional depending on scope
**Realtime:** Socket.IO namespaces (if realtime needed per v3 feature-list)
**Auth:** Auth0 (managed identity — MFA, social, Post-Login Actions)
**Payments:** Stripe (Checkout + Connect for payouts if marketplace)
**Storage:** Cloudflare R2 (S3-compatible, zero egress)
**Hosting:** Railway (API + DB + Redis) + Netlify (Web + deploy previews)
**CI/CD:** GitHub Actions (lint + typecheck + test + build, parallel jobs)
**Lint/format:** Biome (single tool — no ESLint + Prettier split)
**Testing:** Vitest (unit + integration) + Supertest (HTTP) + React Testing Library (components) + Playwright MCP (live E2E, swarm-parallel)
**Observability:** Sentry or similar for error tracking (optional)
**Secrets:** platform env vars only — never committed
```

### 2. Poll founder — accept or override

Single `AskUserQuestion`:

> "Proposed stack above. Three options:
>
> 1. **Accept** — use this baseline; proceed to architecture (v6).
> 2. **Partial override** — I want most of this but swap specific pieces. Tell me which (e.g., 'Postgres → SQLite', 'Railway → Fly.io', 'Auth0 → native').
> 3. **Full override** — this isn't the right stack for my project. Propose a different baseline and I'll research fit."

### 3a. Fast-path — accept

If option 1: the baseline becomes locked-in. Write `command-center/dev/stack-decisions.md`:

```markdown
# Stack Decisions

## Selected: auto-claude baseline (accepted <YYYY-MM-DD>)

[baseline block from step 1]

## Rationale
Accepted unchanged. v6 architecture branches assume these choices.
```

Proceed to v6.

### 3b. Partial override

If option 2: list each override the founder provided. For EACH override:
- Record: what changed, from-what, to-what, rationale
- Cross-impact check: does this override cascade? (e.g., switching Postgres → SQLite breaks Prisma migrations pattern; switching Auth0 → native requires the security branch to build auth from scratch)
- If cross-impact is material, flag to founder and request confirmation before locking in

Write `command-center/dev/stack-decisions.md` with the final resolved stack (baseline ± overrides).

### 3c. Full override — research path

If option 3: spawn research agent to evaluate the founder's proposed alternative. Agent questions:
- Is this stack well-matched to the product shape (v3 feature-list + v4 page-map) vs the baseline?
- What's the ecosystem maturity / hiring availability / LLM-tool support?
- What's the DevOps story (deployment, monitoring, cost)?
- What adjustments does `dev-principles.md` + `test-writing-principles.md` need? (Those files assume the baseline; overrides require updates)

Agent returns: stack proposal + pros/cons vs baseline + cascading doc updates required.

Founder confirms. Write `command-center/dev/stack-decisions.md` with the alternative stack + cascading-update action list.

### 4. Log as product decision

Append to `command-center/product/product-decisions.md`:

```markdown
### [<YYYY-QN>] Tech stack selected
**Category**: Architecture
**Status**: Active
**Context**: v5 onboarding stack selection.
**Decision**: <baseline | partial-override | full-override summary>
**Rationale**: <accepted defaults | rationale for overrides>
**Alternatives considered**: <baseline + any alternatives the founder raised>
```

## Deliverable

- `command-center/dev/stack-decisions.md` — the locked-in stack (baseline or override)
- `command-center/product/product-decisions.md` — updated with the stack-selection decision entry

## Exit criteria

- Stack is locked; v6 branches know what to assume
- If override: cascading doc-update list captured (updates happen in v6 architecture branches, not here)
- Founder has explicitly confirmed the final stack

## Next

→ Return to `../onboarding-loop.md` → Stage v6 (architecture)
