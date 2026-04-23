# Changelog

All notable changes to auto-claude's brain. Format: one section per release, following [Keep a Changelog](https://keepachangelog.com/). Versions follow [semver](https://semver.org/) with the following discipline:

- **Major (x.0.0)** — breaking changes to the wave loop, removed stages, or rule files renamed in a way that invalidates consumer references.
- **Minor (0.x.0)** — new stages, new rules, new trigger-table rows, new management modes, or additive changes to existing rules.
- **Patch (0.0.x)** — typo fixes, clarifications, cross-reference repairs.

The current brain version is always in [`command-center/VERSION`](./command-center/VERSION).

## Release template

Every release entry follows this structure. `Consumer sync` tells downstream projects what to do when pulling this release.

```
## vX.Y.Z — YYYY-MM-DD

### Added
- (new files, new sections, new features)

### Changed
- (behavioral or structural changes to existing files)

### Removed
- (deleted files, retired rules)

### Consumer sync
- **Breaking:** (yes/no — details if yes)
- **New files:** (list — safe to pull in full)
- **Changed files (safe-overwrite):** (list — purely additive to brain-owned content)
- **Changed files (review recommended):** (list — behavioral changes; run sync in interactive mode)
- **Migration action:** (none / short steps / link to migrations/vA-to-vB.md)
```

---

## v0.6.0 — 2026-04-23

Setup tooling documentation + brain-sync tooling (`bin/auto-claude`).

### Added
- `command-center/setup-tools/` — new directory
  - `install.md` — canonical external-tooling setup guide. Covers Claude Code agents (VoltAgent marketplace + custom Jenny/karen/founder-proxy), skills (gstack family + built-ins + claude-mem plugin skills), MCP servers (aidesigner, Playwright × 10, mcp-search, domain-mcp), plugins (claude-mem), supporting CLIs (task-master, playwright-mcp, rtk, gh, netlify, railway), shell config (rtk hook, SSH keep-alive, tmux persistence), project bootstrap, verification checklist, and known gotchas.
  - `README.md` — directory overview + when to consult it
- `bin/auto-claude` + subcommands — brain-sync tool (init / diff / sync / status). See README § "Keeping the brain in sync across projects".
- Trigger table row in `CLAUDE.md` for "Setting up a new machine / onboarding team member / diagnosing skill-not-found or MCP-not-available errors" → `command-center/setup-tools/install.md`

### Changed
- `README.md` — adds `command-center/setup-tools/` row to the directory table. Adds full section on `auto-claude sync` tool (consumer setup + day-to-day commands + release workflow for brain authors).
- `command-center/VERSION` — bumped to 0.6.0

### Consumer sync
- **Breaking:** no. Purely additive.
- **New files:** `command-center/setup-tools/{install.md,README.md}` + `bin/auto-claude*` scripts (~1000 LOC in bash) — safe to pull
- **Changed files (safe-overwrite):** `command-center/VERSION`
- **Changed files (review recommended):** `CLAUDE.md` (one new trigger row — merge cleanly if not locally customized), `README.md` (new directory row + new full section)
- **Migration action:** consumers on pre-0.6 should install `bin/auto-claude*` once (or use it from the auto-claude clone directly), then future syncs run through the tool.

---

## v0.5.0 — 2026-04-23

External-wait doctrine. Adds STATUS state machine, `/loop` bootstrap, Spawn-and-Block pattern, and the three-condition monitor contract.

### Added
- `command-center/rules/monitors/` — new directory with master doctrine + platform templates
  - `monitor-principles.md` — three-condition contract (`success_condition`, `failure_condition`, `timeout_budget`) + state machine + named anti-patterns
  - `railway-deploy.md` — Railway deploy monitor template with full state classification
  - `gh-actions.md` — GitHub Actions workflow monitor template
  - `netlify-deploy.md` — Netlify deploy monitor template (documented exception for `commit_ref` check)
- `command-center/management/STATUS` — new runtime file tracking wave/loop state (RUNNING / HANDOFF / IDLE / BLOCKED / DONE)
- `command-center/management/handoff.md` — mid-wave + cross-wave resume artifact (written at 75% context or cross-wave boundary)

### Changed
- `CLAUDE.md` — new MONITOR trigger row; full-autonomy trigger row updated to reference `/loop` bootstrap + STATUS tick behavior
- `command-center/management/full-autonomy-mode.md` — major rewrite. Adds 5-step mode-entry sequence, STATUS routing table, tick behavior, 75% context-budget rule, self-management carveout, external-wait anti-pattern (with Spawn-and-Block as preferred response)
- `command-center/management/board.md` — adds "Out of BOARD scope — resolve by rule" section (session/context management never convenes BOARD)
- `command-center/rules/build-iterations/stages/stage-4-execute.md` — adds context-budget clause for full-autonomy
- `command-center/rules/build-iterations/stages/stage-5-deploy.md` — async-deploy Spawn-and-Block clause
- `command-center/rules/build-iterations/stages/stage-5b-qa.md` — platform-in-progress clause
- `command-center/rules/build-iterations/stages/stage-6-test.md` — prod-URL-readiness clause
- `command-center/rules/build-iterations/stages/stage-11-next.md` — STATUS handling section with 5-branch cross-wave transition logic

### Consumer sync
- **Breaking:** no. Purely additive. Existing waves continue to work.
- **New files:** `command-center/rules/monitors/*.md` (4 files) — safe to pull
- **Changed files (safe-overwrite):** all 9 brain files above, assuming they have not been customized project-side
- **Changed files (review recommended):** `CLAUDE.md` — if your project has customized the trigger table or always-on rules, run sync in interactive mode
- **Migration action:** before first full-autonomy run post-upgrade, read the new STATUS routing table in `full-autonomy-mode.md`. No file-level migration required.

---

## v0.4.0 — 2026-04-22

Orchestration mega-release. Four bundled features: founder-stage axis, wave-size auto-split, Stage 8 TaskMaster sweep, and BOARD autonomy system.

### Added
- `command-center/product/founder-stage.md` — single-variable modulator (self-use-mvp / pilot-customer / paying-customers / regulated-day-1) that biases v3/v4/v6/v10 onboarding away from legal/GDPR/admin bloom for early-stage projects
- `command-center/management/` — new folder replacing `rules/autonomous-mode.md`
  - `README.md` — directory overview
  - `board.md` — BOARD composition, hard-stops, rollback
  - `board-members.md` — 7 members + per-member reading list (ceo-reviewer, architect-reviewer, ux-researcher, risk-manager, founder-proxy, competitive-analyst, product-manager)
  - `conflict-resolution.md` — voting rules (4+/7 default, 6+/7 strict for Tier 3), split outcomes, hard-stop veto, retro feedback loop
  - `full-autonomy-mode.md` — mode spec + routing table + hard-stops
  - `semi-assisted-mode.md` — skip-nice-to-haves behavior + founder escalation thresholds
  - `mode-switching.md` — flag spec + transitions
- `command-center/Sub-agent Instructions/founder-proxy-instructions.md` — new agent, simulates founder voice via claude-mem memory + product-decisions.md precedent
- CLAUDE.md always-on rule #10: "Respect the mode flag"

### Changed
- `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` — adds deterministic Size rubric (files>30, primitives>30, LOC>5000, Stage 4 context>250K). New `RESCOPE-AUTO-SPLIT` verdict auto-creates sibling TaskMaster rows. User-ask narrowed to 4 specific cases.
- `command-center/rules/backlog-planning.md` — XL items pre-split at authorship via new Step 3.5; `estimatedSize` field added to backlog entries
- `command-center/rules/build-iterations/stages/stage-8-closeout.md` — step 1 expanded to mandatory 6-step TaskMaster sweep (primary + subtasks + fast-fixes + auto-split siblings + Stage 7b triage rows + writeback ledger)
- `command-center/rules/build-iterations/stages/stage-11-next.md` — becomes verifier of Stage 8 sweep; catches misses as logged defects
- `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md` — mode-aware routing for Tier 3 decisions
- `command-center/rules/build-iterations/stages/stage-3b-design-gap.md` — mode-aware routing for 3-cap escalation
- `command-center/rules/build-iterations/stages/stage-7b-triage.md` — mode-aware routing for investigate-chain exhaustion
- `command-center/rules/daily-checkpoint.md` — mode-aware three-bucket resolution
- `command-center/rules/housekeeping.md` — stage numbering fixed (was stale "Stage 7")
- `command-center/Sub-agent Instructions/ceo-reviewer-instructions.md` — EXPAND/REDUCE verdict taxonomy refined
- `command-center/Sub-agent Instructions/problem-framer-instructions.md` — adds Size rubric application directive
- Onboarding stages v1/v3/v4/v6/v10 — read founder-stage flag to modulate compliance-surface quota, security depth, and milestone horizons
- `CLAUDE.md` — new trigger rows for mode flags; always-on rule #10

### Removed
- `command-center/rules/autonomous-mode.md` — 179 lines, content split + expanded across new `management/` folder (13 cross-references updated)

### Consumer sync
- **Breaking:** yes, if any project referenced `command-center/rules/autonomous-mode.md` directly (file removed)
- **New files:** 8 files in `command-center/management/` + `command-center/product/founder-stage.md` + `command-center/Sub-agent Instructions/founder-proxy-instructions.md` — safe to pull
- **Changed files (safe-overwrite):** stage files, backlog-planning, daily-checkpoint, housekeeping, onboarding stages — assuming not customized project-side
- **Changed files (review recommended):** `CLAUDE.md` (new trigger rows + always-on rule #10); `Sub-agent Instructions/ceo-reviewer-instructions.md` + `problem-framer-instructions.md` (if customized)
- **Migration action:** (1) if you referenced `rules/autonomous-mode.md`, update to `management/` paths (see commit 87c9fb1 for rewrites); (2) set your project's `founder-stage.md` value after pulling.

---

## v0.3.0 — 2026-04-20

README rewrite: two-loop system (onboarding + wave loop).

### Changed
- `README.md` — full rewrite. Adds the "two loops at a glance" diagram, 5-step launch flow, 13-stage onboarding breakdown, design principles section. Previous README described a manual scaffold-filling workflow that no longer matched reality.

### Consumer sync
- **Breaking:** no. Docs-only.
- **Migration action:** none. Consumer projects rarely copy the upstream README verbatim.

---

## v0.2.0 — 2026-04-19

13-stage onboarding loop for pre-launch project seeding.

### Added
- `command-center/rules/onboarding/` — new directory
  - `onboarding-loop.md` — dispatcher for stages v0 → v11
  - `stages/stage-v0-input.md` through `stage-v11-handoff.md` — 13 stage files covering vision/gaps, competitive scan, product scope, page map, stack selection, architecture, design direction, design system, per-page designs, planning, handoff
- `CLAUDE.md` — new trigger row for "Starting a NEW project"

### Consumer sync
- **Breaking:** no. Net-new directory.
- **New files:** 14 files in `command-center/rules/onboarding/` — safe to pull
- **Changed files:** `CLAUDE.md` (one new trigger row)
- **Migration action:** existing projects past onboarding don't need to consume this, but future project forks benefit.

---

## v0.1.0 — 2026-04-18

Initial extracted brain. Replaces conceptual docs with the actual running management system.

### Added
- Everything. First project-agnostic release.

### Consumer sync
- N/A (baseline).
