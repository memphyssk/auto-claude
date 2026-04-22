# Stage v11 — Handoff: git init + CI + Initial Commit + First Wave Pickup

## Purpose
Finalize the repo — ensure git is initialized, CI pipeline exists, everything produced across v0-v10 is committed, and the wave loop is primed to pick up the first task. After this stage, onboarding is done and the wave loop owns all subsequent work.

## Prerequisites
- v10 complete (ROADMAP + TaskMaster + product-decisions populated)
- Repo exists locally (either auto-claude was cloned and extended, or the user is in a fresh scaffolded repo)

## Actions

### 1. Git state check

```bash
git status
git log --oneline -5 2>/dev/null || echo "no commits yet"
```

If no `.git/` exists: `git init` + `git branch -M main`.

If commits exist from prior incremental commits (optional snapshots in v0-v10): inventory them; the final commit closes out any remaining unstaged work.

### 2. Create `.gitignore` if missing

Copy from `auto-claude/.gitignore` baseline (or ensure equivalent exists). Minimum content:

```
# Session-scoped orchestrator state (see management/mode-switching.md)
Planning/.autonomous-session

# Dependencies
node_modules/

# Build outputs
dist/
.next/
.turbo/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store

# Test account credentials — NEVER commit
Planning/test-accounts*.md
```

### 3. Seed CI workflow

Create `.github/workflows/ci.yml` with the baseline from `dev/architecture/devops.md`. Baseline (for the default stack):

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: test }
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

Every job has explicit `timeout-minutes` + `permissions: contents: read` per `planning-principles.md` discipline.

If stack diverges from default (v5 override), adapt the CI workflow accordingly — the v6 DevOps branch is the source of truth.

### 4. Scrub secrets

Before the initial commit:
- Grep staged content for `API_KEY` / `SECRET` / `PASSWORD` / `TOKEN` / `.env`
- Ensure `.env` files are NOT staged (gitignore catches them, but double-check)
- Any credentials in `docs-input/` that v0 captured verbatim should be moved to a gitignored location or redacted

### 5. Initial commit

Stage and commit everything produced during onboarding:

```bash
git add -A
git status --short
```

Review the file list. If it matches expectations (`command-center/` + `design/` + `.github/` + `.gitignore` + `CLAUDE.md` + `README.md` + `.taskmaster/`), commit:

```bash
git commit -m "$(cat <<'EOF'
chore: initial project scaffold (auto-claude onboarding v0-v11)

PRODUCT
- FOUNDER-BETS.md + ROADMAP.md (v1) — vision, north star, H1/H2/H3 intents
- product-decisions.md (v10) — initial 10-20 decisions from stack + architecture + design
- user-journey-map.md (v4) — page map + flow cross-reference
- per-page-pd/* (v4) — detailed product description per page

ARCHITECTURE
- dev/stack-decisions.md (v5) — locked tech stack
- dev/architecture/_library.md (v6b) — unified architecture reference
- dev/architecture/{modules,services,databases,sdks,tools,security,devops,test}.md (v6)
- dev/module-list.md (v6b) — locked module inventory

COMPETITIVE
- artifacts/competitive-benchmarks/ (v2) — tier-ranked evidence per competitor

DESIGN
- design/direction.html (v7) — approved visual direction
- design/DESIGN-SYSTEM.md (v8) — tokens + module primitives
- design/<page>.html * N (v9) — per-page approved mockups

TASKS
- .taskmaster/tasks/tasks.json — populated with milestone-anchored tasks

CI
- .github/workflows/ci.yml — baseline lint / typecheck / test / build jobs

The wave loop (command-center/rules/build-iterations/wave-loop.md) is now ready.
First wave picks up from TaskMaster via Stage 0.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### 6. Push to origin (if remote configured)

```bash
git remote -v
```

If a remote exists:
```bash
git push -u origin main
```

If no remote configured, prompt the founder: "Repo has no `origin` remote. Create the GitHub repo first, then run `git remote add origin <URL>` and `git push -u origin main`."

### 7. Handoff announcement

Produce an announcement summarizing what's ready and what the founder should do next:

```markdown
# Onboarding Complete — <Your Project>

Everything's committed and pushed. You can start execution now.

## What exists
- Vision + bets + roadmap + decisions → `command-center/product/`
- Competitor research (Tier 1/2/3) → `command-center/artifacts/competitive-benchmarks/`
- Architecture (8 domains + library) → `command-center/dev/architecture/`
- Design direction + system + per-page designs → `design/`
- Tasks wired to milestones → TaskMaster
- CI pipeline → `.github/workflows/ci.yml`

## First wave

To start the first execution wave, tell me:

> "Start the first wave"

Or pick a specific task:

> "npx task-master next"

The wave loop (`command-center/rules/build-iterations/wave-loop.md`) will take it from there — Stage 0 → 11.
```

Save this as: `Planning/onboarding-complete-<YYYY-MM-DD>.md`

## Deliverable

- `.gitignore` — present (if absent, written)
- `.github/workflows/ci.yml` — CI pipeline baseline for the chosen stack
- Initial commit — everything from v0-v10 committed with comprehensive message
- (If remote configured) `git push origin main` succeeded
- `Planning/onboarding-complete-<YYYY-MM-DD>.md` — handoff announcement

## Exit criteria

- Working tree is clean (`git status --short` is empty)
- Initial commit is on `main` (local at minimum; pushed to origin if remote configured)
- CI workflow is runnable (no syntax errors in YAML; jobs are wired)
- No secrets in committed files
- Handoff announcement is written

## Next

→ **Onboarding loop ends here.** Control passes to the wave loop. The first wave begins when the founder invokes it — at which point read `command-center/rules/build-iterations/wave-loop.md` → Stage 0.
