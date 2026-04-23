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

## v0.8.0 — 2026-04-23

Ships `danger-builder` — fourth operating mode for indefinite (365-day) autonomous operation. Adds `ceo-agent` as BOARD tiebreaker + HARD-STOP resolver + founder-ask fallback, a founder-authored `ceo-bound.md` charter that restricts (not approves) CEO authority, and daily Resend-delivered digest. Every existing stage + rule that could previously escalate to founder under full-autonomy now has a parallel danger-builder branch routing to ceo-agent.

### Added
- `command-center/management/danger-builder-mode.md` — mode spec: prerequisite verification at entry, 5-step mode-entry sequence, STATUS routing (shared with full-autonomy plus kill-switch / founder-message / charter-destroyed checks), routing table for BOARD-to-CEO escalation, digest delivery protocol, precedence rules, deactivation sequence
- `command-center/management/ceo-bound.md` — CEO charter template. **Restrictions-only semantics:** blank sections = unlimited CEO authority; explicit restrictions bind. Eleven sections: mode-activation prerequisites (§ 0), financial (§ 1), external commitments (§ 2), customer-facing (§ 3), infra + code (§ 4), strategic (§ 5), novelty handling (§ 6), kill-switch (§ 7), reporting (§ 8), charter revision protocol (§ 9), permanent hard limits (§ 10). Founder-edited only; CEO cannot amend, can only propose via `Planning/ceo-charter-proposals.md`.
- `command-center/Sub-agent Instructions/ceo-agent-instructions.md` — 18-pattern cognitive profile synthesized from `/plan-ceo-review` (classification instinct, paranoid scanning, inversion reflex, focus as subtraction, people-first sequencing, speed calibration, proxy skepticism, narrative coherence, temporal depth, founder-mode bias, wartime awareness, courage accumulation, willfulness as strategy, leverage obsession, hierarchy as service, edge case paranoia, subtraction default, design for trust). Voice rules inherited from gstack (no em dashes, no AI vocabulary, no banned phrases, direct-concrete-sharp tone, max 1 dry aside per digest). Decision procedure with 6 ordered steps: read inputs → scan charter → apply patterns → decide → write digest entry → emit decision. Digest format specified. Never-do list: silently amend charter, amend FOUNDER-BETS.md, skip digest, self-rubber-stamp past decisions, ignore charter restrictions.
- `command-center/management/digest-delivery/resend.md` — Resend integration spec: env vars (`RESEND_API_KEY`, `CEO_DIGEST_EMAIL_TO`, `CEO_DIGEST_EMAIL_FROM`, `CEO_DIGEST_PROJECT_NAME`), send mechanics (plain-text body, daily + activation + deactivation + halt triggers), failure handling (3 retries with exponential backoff, log but never halt loop on delivery failure), rate limits, security notes, pre-activation connectivity test.

### Changed — management/
- `command-center/management/mode-switching.md` — four-mode table (was three), `danger-builder` trigger phrases, entry/exit transitions, prerequisite verification on `danger-builder` entry, extended flag file format with `charter:` and `digest_to:` fields
- `command-center/management/board.md` — "Hard-stops — NEVER go to BOARD" section extended with full routing-by-mode table; under `danger-builder`, destructive + money + HARD-STOP all route to ceo-agent (within charter restrictions), never to founder during runtime
- `command-center/management/conflict-resolution.md` — "Escalation path" section split into two: BOARD → founder (first three modes) and BOARD → ceo-agent (danger-builder). HARD-STOP veto semantics updated for danger-builder: weighed as strong signal, recorded in digest, not a hard halt

### Changed — stages + rules
- `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md` — Step 5 Tier 3 resolution gains danger-builder branch (BOARD → ceo-agent fallback)
- `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` — user-ask escalations (a/b/c/d) gain danger-builder branch
- `command-center/rules/build-iterations/stages/stage-3b-design-gap.md` — 3-cap escalation gains danger-builder branch
- `command-center/rules/build-iterations/stages/stage-7b-triage.md` — /investigate chain exhaustion gains danger-builder branch
- `command-center/rules/build-iterations/stages/stage-11-next.md` — STATUS handling section renamed from "full-autonomy only" to "full-autonomy + danger-builder"; hard-stop branch extended
- `command-center/rules/daily-checkpoint.md` — three-bucket resolution gains danger-builder branch (BOARD first, ceo-agent for unresolved items)
- `command-center/rules/roadmap-refresh-ritual.md` — Step 4 founder-checkpoint gains danger-builder branch (CEO resolves; founder reviews via digest retroactively)
- `command-center/rules/backlog-planning.md` — Step 4 user-approval gains danger-builder branch (CEO approves + reprioritizes; wave execution proceeds same tick)
- `CLAUDE.md` — new trigger-table row for `danger-builder` activation. Always-on rule #10 rewritten for four-mode handling with explicit hard-stop routing table.

### Policy highlights
- **Charter is a limiter, not an approver.** This is a deliberate reframe from normal permission systems. Silent `ceo-bound.md` = unlimited CEO authority inside that section. Founder adds restrictions only for categories they genuinely want to stay involved in. More restrictions = more founder involvement = less autonomy.
- **HARD-STOP vetoes route to CEO under danger-builder, not founder.** CEO weighs the veto, may still authorize, records engagement in digest. Keeps the veto as signaling tool without blocking indefinite operation.
- **Daily digest via Resend** — not optional. A file-only digest defeats the 365-day premise (log nobody reads). Mode refuses to activate if `RESEND_API_KEY` + `CEO_DIGEST_EMAIL_TO` are not set.
- **Kill-switch is always founder-only.** `touch /tmp/ceo-mode-stop` halts the loop. So does any session message, `STATUS=STOP`, or mode-flag change.
- **Onboarding carve-out.** ceo-agent + BOARD both OFF during v0-v11 regardless of mode. High-taste moment; founder presence is the feature. danger-builder only activates after v11 handoff.

### Consumer sync
- **Breaking:** no. Purely additive — existing full-autonomy behavior unchanged; danger-builder is a new mode that consumers adopt opt-in.
- **New files:** 4 files (`management/danger-builder-mode.md`, `management/ceo-bound.md`, `Sub-agent Instructions/ceo-agent-instructions.md`, `management/digest-delivery/resend.md`) — safe to pull
- **Changed files (safe-overwrite):** stages 0b/1/3b/7b/11, daily-checkpoint, roadmap-refresh-ritual, backlog-planning, management/{mode-switching,board,conflict-resolution}.md, VERSION — assuming not customized project-side
- **Changed files (review recommended):** `CLAUDE.md` (new trigger row + rewritten always-on rule #10 — both merge cleanly if not locally customized)
- **Migration action:** to activate `danger-builder`: (1) fill in `command-center/management/ceo-bound.md` with your charter restrictions (default all blank = unlimited CEO authority), (2) set `RESEND_API_KEY` + `CEO_DIGEST_EMAIL_TO` env vars, (3) verify kill-switch works: `touch /tmp/ceo-mode-stop && rm /tmp/ceo-mode-stop`, (4) say "danger builder" to Claude Code. Mode entry runs prerequisite checks and aborts if anything is missing.

---

## v0.7.0 — 2026-04-23

Ships the `/update-tools` skill with auto-claude. The skill reads `command-center/setup-tools/install.md` as the canonical source, runs verification checks against the current machine, and prompts per item to install anything missing. Wired into onboarding v0 as the prerequisite gate; the founder can also invoke it manually anytime.

### Added
- `command-center/setup-tools/skills/` — new subdirectory for auto-claude's own shipped skills
  - `README.md` — explains install options (symlink vs copy) and the rationale for shipping skills via the brain repo
  - `update-tools/SKILL.md` — full skill specification: install.md discovery order, three-tier risk classification (low-risk auto-fix-if-approved / medium-risk command-before-running / high-friction print-instructions-only), always-ask policy, report/prompt/summary flow, subcommand filters (`agents` / `skills` / `mcps` / `clis` / `plugins` / `shell`)
- `setup-tools/install.md` § 2d — new subsection documenting how to install the `/update-tools` skill itself (symlink or copy from the auto-claude repo)

### Changed
- `command-center/rules/onboarding/onboarding-loop.md` — Prerequisite section now invokes `/update-tools` directly, with a fallback for first-ever auto-claude machines where the skill isn't yet installed
- `command-center/rules/onboarding/stages/stage-v0-input.md` — prereq block references the skill rather than manual checklist verification
- `command-center/VERSION` — bumped to 0.7.0

### Policy notes
- `/update-tools` **always asks per item** — there is no `--yes` batch flag. This is deliberate: founder remains in control of every install.
- For high-friction items (MCP configs, auth, shell config), the skill **never modifies files**. It prints copy-pasteable JSON fragments and exact commands; the founder applies them manually.
- The skill is **not wired anywhere except onboarding v0**. Founder invokes it otherwise. No CLAUDE.md trigger row, no wave-loop pre-check, no full-autonomy mode-entry integration.

### Consumer sync
- **Breaking:** no. Purely additive.
- **New files:** `command-center/setup-tools/skills/README.md` + `command-center/setup-tools/skills/update-tools/SKILL.md` — safe to pull
- **Changed files (safe-overwrite):** `command-center/VERSION`, `command-center/rules/onboarding/onboarding-loop.md`, `command-center/rules/onboarding/stages/stage-v0-input.md`, `command-center/setup-tools/install.md` — assuming not customized project-side
- **Migration action:** after sync, run the one-line symlink from install.md § 2d to install `/update-tools` into `~/.claude/skills/update-tools`. The skill is available across all auto-claude projects on that machine once installed once.

---

## v0.6.1 — 2026-04-23

Refines v0.6.0 setup tooling: reorganizes agent sources into three categories, removes built-in-agent references, and moves the entry point from the CLAUDE.md trigger table into the onboarding loop (where it naturally belongs — setup runs before any tool is needed).

### Changed
- `command-center/setup-tools/install.md` — agent section restructured into three explicit sources:
  - (a) **gstack** — <https://github.com/garrytan/gstack> (agents + skills together)
  - (b) **VoltAgent** — <https://github.com/VoltAgent/awesome-claude-code-subagents> (generic dev-role agents)
  - (c) **DarcyEGB** — <https://github.com/darcyegb/ClaudeCodeAgents> (supplementary / alternative takes)
  Collision handling documented (last install wins; verify specific agents after install).
- `install.md` — removed "Built-in agents" subsection (`Explore`, `Plan`, `general-purpose`). These ship with Claude Code and don't need documentation in this guide.
- `install.md` — removed "Built-in skills" subsection for the same reason.
- `command-center/rules/onboarding/onboarding-loop.md` — new "Prerequisite — machine setup" section directs founder to read `setup-tools/install.md` and run verification checklist before v0. Runs once per machine, not per project.
- `command-center/rules/onboarding/stages/stage-v0-input.md` — prerequisites block now explicitly requires machine tooling to be installed.
- `CLAUDE.md` — **removed** the "setting up a new machine" trigger-table row added in v0.6.0. Setup is an onboarding prerequisite, not a runtime trigger; no need for trigger-table weight.

### Consumer sync
- **Breaking:** no.
- **Changed files (safe-overwrite):** `command-center/setup-tools/install.md`, `command-center/rules/onboarding/onboarding-loop.md`, `command-center/rules/onboarding/stages/stage-v0-input.md`, `command-center/VERSION` — assuming not customized project-side
- **Changed files (review recommended):** `CLAUDE.md` (one row removed — consumers with locally-customized trigger tables need to decide whether to keep or remove the setup-tools row)
- **Migration action:** none required. Projects already on v0.6.0 lose the trigger-table row for setup-tools but gain the onboarding prerequisite — both point at the same `install.md`, so there's no loss of routing.

---

## v0.6.0 — 2026-04-23

Setup tooling documentation + brain-sync tooling (`bin/auto-claude`).

### Added
- `command-center/setup-tools/` — new directory
  - `install.md` — canonical external-tooling setup guide. Covers Claude Code agents (VoltAgent marketplace + custom Jenny/karen/founder-proxy), skills (gstack family + built-ins + claude-mem plugin skills), MCP servers (aidesigner, Playwright × 10, mcp-search, domain-mcp), plugins (claude-mem), supporting CLIs (task-master, playwright-mcp, rtk, gh, netlify, railway), shell config (rtk hook, SSH keep-alive, tmux persistence), project bootstrap, verification checklist, and known gotchas.
  - `README.md` — directory overview + when to consult it
- `bin/auto-claude` + subcommands — brain-sync tool (init / diff / sync / status). See README § "Keeping the brain in sync across projects".
- Trigger table row in `CLAUDE.md` for "Setting up a new machine / onboarding team member / diagnosing skill-not-found or MCP-not-available errors" → `command-center/setup-tools/install.md` (**superseded in v0.6.1** — now an onboarding prerequisite instead).

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
