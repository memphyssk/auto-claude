# Stage v6 — Architecture: 8 Parallel Branches

## Purpose
Produce the reusability-first architecture spec across 8 domain branches, each authored in parallel by a specialist agent. Branches converge in v6b for cross-check and integration into the unified library doc.

## Prerequisites
- v5 complete (stack-decisions.md exists — branches assume this stack)
- v3 complete (feature-list + tools-modules-map drive branch scope)
- v4 complete (page-map tells us what surfaces need architectural support)
- READ `command-center/rules/sub-agent-workflow.md`

## Actions

### 1. Spawn 8 branch-author agents in parallel

Each branch gets a dedicated specialist sub-agent. Spawn all 8 in parallel (batch by context-window capacity — typically 4 at a time, two batches).

| Branch | Agent | Output file |
|---|---|---|
| **Modules / Reusable elements** | `backend-developer` + `frontend-developer` (collab) | `command-center/dev/architecture/modules.md` |
| **Services** | `backend-developer` | `command-center/dev/architecture/services.md` |
| **Databases** | `database-administrator` or `backend-developer` | `command-center/dev/architecture/databases.md` |
| **SDKs (third-party integrations)** | `backend-developer` | `command-center/dev/architecture/sdks.md` |
| **Tools (dev tooling, linting, build)** | `devops-engineer` or `backend-developer` | `command-center/dev/architecture/tools.md` |
| **Security** | `security-engineer` + `architect-reviewer` (pair per `security-waves.md`) | `command-center/dev/architecture/security.md` |
| **DevOps (deploy, CI, envs, observability)** | `devops-engineer` | `command-center/dev/architecture/devops.md` |
| **Test** | `test-automator` or `qa-expert` | `command-center/dev/architecture/test.md` |

### 2. Per-branch inputs

Each agent receives:

- `command-center/dev/stack-decisions.md` (locked stack)
- `command-center/product/feature-list.md` + `tools-modules-map.md` (what to architect)
- `command-center/artifacts/user-journey-map.md` (page/flow context)
- `command-center/product/FOUNDER-BETS.md` (strategic constraints)
- Prior architecture branches already written (if batch 2, batch 1 outputs are visible)

### 3. Per-branch output spec

Each `command-center/dev/architecture/<branch>.md` contains:

```markdown
# <Branch name> Architecture

## Summary
<One-paragraph overview of how this branch is organized>

## Inventory
<Enumerated list of units in this branch — modules, services, tables, SDKs, tools, etc.>

## Conventions
<How units in this branch are structured / named / composed>

## Reusability principles
<How modules expose themselves for reuse across the product>

## Cross-references
<Which other branches' units this branch consumes/produces>

## Stack-specific decisions
<Any stack-dependent choices — e.g., "Prisma schema per module" for databases branch>

## Risk / open items
<Unknowns that v6b integration or future waves need to resolve>
```

### 4. Branch-specific requirements (condensed)

- **Modules** — list every reusable module (auth, billing, notifications, search, admin, etc.) with clear in/out contracts. Label MVP vs H2.
- **Services** — backend service boundaries + inter-service communication patterns + API versioning policy.
- **Databases** — schema boundaries + migration policy + data retention + backup strategy.
- **SDKs** — each third-party SDK: auth mechanism, rate limits, error handling pattern, cost model, migration path if deprecated.
- **Tools** — language version, linting (Biome config), build system (Turborepo), package manager (pnpm), typecheck strictness, CI gates.
- **Security** — threat model (STRIDE), auth flow end-to-end, session management, secrets handling, rate limiting, input validation, CSRF, M2M credentials, audit logging.
- **DevOps** — environment strategy (dev/staging/prod), CI workflow (GitHub Actions jobs with `timeout-minutes` + least-privilege `permissions` per `planning-principles.md`), deploy platforms, secret management, observability stack.
- **Test** — framework stack (per v5), test-writing conventions (co-location, AAA, mock policies), coverage targets per package, live E2E policy (per `test-writing-principles.md` §15-16).

### 5. Write first-pass module list snapshot

After the Modules branch completes (or concurrent with it), produce: `command-center/dev/module-list.md`

This is a lightweight snapshot of approved reusable modules — consumed by v8 design-system as the gate input. Format:

```markdown
# Module List (v6 snapshot)

## MVP modules
- **<module-name>** — <one-line purpose>
- ...

## H2 modules
- ...

## H3 modules (planned)
- ...

Last updated: <timestamp>, source: v6 Modules branch
```

## Deliverable

- `command-center/dev/architecture/modules.md`
- `command-center/dev/architecture/services.md`
- `command-center/dev/architecture/databases.md`
- `command-center/dev/architecture/sdks.md`
- `command-center/dev/architecture/tools.md`
- `command-center/dev/architecture/security.md`
- `command-center/dev/architecture/devops.md`
- `command-center/dev/architecture/test.md`
- `command-center/dev/module-list.md`

## Exit criteria

- All 8 branch files exist and follow the per-branch output spec
- `module-list.md` snapshot written (enables v8 gate)
- No branch left with TODOs in its summary — open items go in the Risk section, not the summary

## Next

→ Return to `../onboarding-loop.md` → Stage v6b (architecture-integrate)
