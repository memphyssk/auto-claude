# auto-claude — MD Orchestration System for Claude Code

A project-agnostic operating system for running LLM coding agents on real product work. Drop these files into a fresh repo and Claude Code will:

1. **Onboard** — turn your founder docs into a fully seeded project (vision, competitors, scope, stack, architecture, design, task plan) across **13 pre-launch stages**.
2. **Execute** — run every feature wave through a **17-stage wave loop** with mandatory two-reviewer gates, dual-document sub-agent memory, and a canonical PM backlog pattern.

All of it wired through a single `CLAUDE.md` trigger table that Claude Code consults every turn.

The files here are the actual running system, battle-tested on a real product and scrubbed of project specifics. You fork, run the onboarding loop once, and the wave loop takes over from there.

---

## The two loops at a glance

```
  ┌────────────────────────────────────────┐
  │  Onboarding loop (once, at seeding)    │
  │  13 stages (v0 → v11)                  │
  │  INPUT:  founder docs                  │
  │  OUTPUT: vision, competitors, scope,   │
  │          stack, architecture, design,  │
  │          seeded TaskMaster, first CI   │
  └──────────────┬─────────────────────────┘
                 │ handoff at v11
                 ↓
  ┌────────────────────────────────────────┐
  │  Wave loop (per feature wave)          │
  │  17 stages (0 → 11)                    │
  │  INPUT:  next TaskMaster task          │
  │  OUTPUT: shipped feature + updated     │
  │          product-decisions, ROADMAP,   │
  │          user-journey-map, lessons     │
  └────────────────────────────────────────┘
```

---

## How to launch

### Step 1 — Put the repo in place

Fork `auto-claude` (or `git clone`), then in your new project either:

- **Green-field:** use auto-claude as the scaffold, commit the initial state.
- **Existing repo:** copy `CLAUDE.md` + `command-center/` + `design/` + `.gitignore` into your project root.

Install TaskMaster separately if you don't already have it:
```bash
npm install -g task-master-ai
task-master init
```

### Step 2 — Put your founder docs somewhere

Anywhere Claude Code can read them — pasted into the chat, files in the repo, Google Doc links, etc. Minimum viable: a one-paragraph product description + target user.

More is better: vision, initial bets, named competitors, MVP features, business model, existing market research. The onboarding loop extracts whatever you've provided and polls you only for what's missing.

### Step 3 — Start the onboarding loop

Tell Claude Code:

> **"Start a new project"**

Or more explicitly:

> **"Run the onboarding loop — here are my docs: [paste / link]"**

Claude Code will match the trigger table row *"Starting a NEW project"* and invoke `command-center/rules/onboarding/onboarding-loop.md`, which runs stages v0 → v11 sequentially.

### Step 4 — Review and answer when polled

Onboarding polls you at specific checkpoints:
- **v1 gap check** — only if docs are incomplete (batched single-question ≤5 items)
- **v5 stack selection** — accept the baseline or override (one question)
- **v7 design direction** — approve / revise / reject the first design proposal
- **v8 design system** — approve / revise / reject the system build
- **v9 per-page designs** — approve each page (iterate or escalate)
- **v10 Tier 3 decisions** — resolve any deferred founder-only decisions
- **v11 handoff** — review the handoff announcement

Everything else is autonomous. Expect 1-3 days elapsed for a typical onboarding run (most of it agent work; your actual review time is usually <90 minutes total).

### Step 5 — Run the first wave

After v11 commits and pushes, tell Claude Code:

> **"Start the first wave"**

The wave loop picks up the highest-priority task from TaskMaster and runs through its 17 stages.

---

## The 13 onboarding stages

```
v0   Receive service/product description docs
v1   Vision & gaps — parse docs, poll only for what's missing;
     seed FOUNDER-BETS.md + ROADMAP.md north star
v2   360° competitive scan (5-10 targets, Playwright live browsing);
     agent-ranked Tier 1/2/3
v3   User flows + feature list + tools/modules mapping
v4   Page map + parallelized per-page PDs
v5   Stack selection — baseline default; AskUserQuestion override
v6   Architecture — 8 parallel branches:
     Modules / Services / DB / SDK / Tools / Security / DevOps / Test
v6b  Cross-check + integrate into single library doc
v7   Design direction — /aidesigner proposal + approval loop
v8   Design system — DESIGN-SYSTEM.md (gated on v6b)
v9   Per-page designs (approval loop per page)
v10  Planning — milestones + TaskMaster + seed ROADMAP + decisions backfill
v11  Handoff — git init + CI + initial commit + push
     → control passes to wave-loop.md Stage 0
```

**Skip conditions** let non-UI projects (API-only, CLI, backend services) skip v7/v8/v9 entirely.

Each stage file lives at `command-center/rules/onboarding/stages/stage-vN-<name>.md` and describes its Purpose / Prerequisites / Actions / Deliverable / Exit criteria.

---

## The 17 wave-loop stages

```
0   Prior-work query (claude-mem lookup)
0b  Roadmap alignment + product decisions (conditional)
1   Problem reframing (problem-framer + ceo-reviewer parallel)
2   Plan authoring
3   Gate (Karen + Jenny + Gemini for high-stakes)
3b  Design-gap resolution — Dx loop (conditional, skip for non-UI)
4   Execute (topic-chosen specialists, parallel)
4b  Post-build review (/review skill)
5   Deploy + CI watch
5b  Post-deploy QA (/qa skill)
6   Playwright functional test swarm (3-5 testers)
6b  Layout verification (conditional)
7   Reality check (Karen + Jenny post-test)
7b  Triage opportunistic findings
8   Closeout + doc updates
9   Observations retro (knowledge-synthesizer writes)
10  Distillation (karen promotes obs → instructions)
11  Next task
```

Each stage file lives at `command-center/rules/build-iterations/stages/stage-<N>-<name>.md`.

---

## What's in the repo

| Path | What it does |
|---|---|
| `CLAUDE.md` | Orchestration hub — trigger table + 9 always-on rules. Loaded by Claude Code every turn. |
| `command-center/rules/onboarding/` | **13-stage pre-launch loop** (dispatcher + stages v0-v11). Fires on "starting a NEW project". |
| `command-center/rules/build-iterations/` | **17-stage wave loop** (dispatcher + 18 stage files). Fires for every feature wave. |
| `command-center/rules/` (root) | 14 topic-scoped rules: sub-agent workflow, decision autonomy, planning/execution principles, testing, security, housekeeping, skill use, triage, external SDKs, backlog planning, PM rituals (roadmap-lifecycle / roadmap-refresh / daily-checkpoint), product mega-testing. |
| `command-center/Sub-agent Instructions/` | 19 agent-specific directive files. Injected as the FIRST directive in every sub-agent spawn prompt. |
| `command-center/Sub-agent Observations/` | 20 empty stubs — the Stage 9/10 pipeline writes behavioral notes; Stage 10 karen promotes them to instructions. |
| `command-center/product/` | Product scaffolds: `ROADMAP.md`, `FOUNDER-BETS.md`, `product-decisions.md`, `roadmap-archive/`. **Populated by onboarding v1 + v10**, maintained by rituals. |
| `command-center/artifacts/` | `user-journey-map.md`, `Concept/`, `competitive-benchmarks/`. **Populated by onboarding v2 + v4**. |
| `command-center/dev/` | Dev-time artifacts: `stack-decisions.md`, `architecture/*.md`, `module-list.md`. **Populated by onboarding v5 + v6 + v6b**. |
| `command-center/test-writing-principles.md` | Master testing guide — §0-13 code-level patterns, §15-16 live production E2E with Playwright. |
| `command-center/setup-tools/` | `install.md` — external-tooling setup (Claude Code agents, skills, MCPs, plugins, supporting CLIs). Hand-authored reference; consult when bootstrapping a new machine or debugging "skill/MCP not found" errors. |
| `design/` | Canonical design pipeline: `DESIGN-SYSTEM.md`, `brief-template.md`, `review-gate.md`, `staging/`. **Populated by onboarding v7 + v8 + v9**, maintained by Stage 3b. |

---

## Why

LLM coding agents fail in predictable ways: hallucinated facts, right-code-for-wrong-problem, memory cliff between sessions, silent drift between plan and spec and shipped code, workarounds that become permanent features, deploy races that pass false tests. This system prevents each of those by construction:

- **Hallucination** — Karen (source-claim verification) runs in a fresh context at Stage 3 before code is written.
- **Wrong problem** — Stage 1 problem-framer + ceo-reviewer split the symptom-vs-cause check across two independent lenses.
- **Memory cliff** — Sub-agent instructions + observations + retro-driven principles files persist lessons across sessions.
- **Silent drift** — Jenny (spec-semantic verification) cross-references plan vs specs at Stage 3; Karen + Jenny re-run at Stage 7 against the deployed state.
- **Workaround-as-feature** — Stage 1 antipatterns catalog + /retro pipeline surface these patterns before they ship.
- **Deploy races** — Deploy-race detection rules + network-tab scanning + Stage 5b QA + Stage 6 Playwright swarm on live prod.
- **Cold start bias** — Onboarding v1 extracts vision before polling, so the founder doesn't get re-asked things already written down.
- **Architecture drift** — v6b cross-check hard-gates v8 design-system (module list must be locked) so design doesn't consume a moving target.

---

## Canonical rule: triggers live in consumers, not in the files themselves

Every rule file in this system describes its **purpose**, not **when to read it**. The "when" lives in `CLAUDE.md`'s trigger table, `wave-loop.md` / `onboarding-loop.md` cross-references, and each stage file's Prerequisites block. Rule files don't self-declare ("Read BEFORE X") — they're pure content. The single dispatch surface is CLAUDE.md + loop dispatchers + stage files.

---

## The three PM rituals (post-onboarding)

Onboarding seeds the PM system. These three rituals maintain it thereafter:

- **`backlog-planning.md`** — tactical: replenishes the atomic-task queue when backlog < 3 items. Spawns `competitive-analyst`, runs `/plan-ceo-review`, produces the next 3-5 waves.
- **`roadmap-refresh-ritual.md`** — strategic: quarterly-ish full refresh of `ROADMAP.md`. Founder-invocable; also proposed by Stage 11 when planned milestones drop below 3 or Stage 0b sees >30 unassigned tasks.
- **`daily-checkpoint.md`** — operational: 3-bucket batch (Tier 3 decisions / new assignments / stayed-unassigned) surfaced to founder once per day, triggered by Stage 11 when `task-master next` returns nothing actionable.

---

## Context cost (at 1M context Opus)

- **Ambient (always loaded):** ~4K tokens (CLAUDE.md + wave-loop.md)
- **Typical wave:** ~75K tokens total across all 17 stages
- **Worst-case wave** (all conditional stages fire): ~175K tokens (~18% of context)
- **Full onboarding run:** ~250K tokens spread across 13 stages (single session can complete it)

You can run 4-5 full waves back-to-back before needing compaction.

## Wave-size auto-split (deterministic, no user-ask)

Stage 1 problem-framer applies a size rubric to every incoming task. If **any** of the four thresholds trips, the verdict is `RESCOPE-AUTO-SPLIT` — orchestrator creates sibling TaskMaster rows for deferred slices and proceeds with the first slice automatically. No user-ask. Subjective "feels big" language is insufficient grounds; quantitative thresholds are:

| Measure | Threshold |
|---|---|
| Files touched | > 30 |
| New primitives (models + routes + services + migrations + SDKs + major components) | > 30 |
| Estimated net LOC | > 5,000 |
| Anticipated Stage 4 working set | > 250K tokens |

`backlog-planning.md` applies the same rubric at task authorship — any `estimatedSize: XL` backlog entry is pre-sized and split before reaching the founder. Monoliths don't enter the actionable queue. User-ask is reserved for strategic scope changes (killing features, changing direction) and unbreakable monoliths where even the first slice trips.

---

## Design principles

1. **Triggers in consumers, not declarations in files.** Every rule file describes what it is; the dispatch surface decides when to read it.
2. **Extract before polling.** Onboarding v1 is the prototype — the founder is never re-asked anything already written in their docs.
3. **Sub-agent memory is dual-document.** Instructions are positive directives injected at spawn; Observations are negative behavioral notes written only by the Stage 9/10 pipeline. Never cross-contaminate.
4. **Reviewer independence.** Karen (source claims) and Jenny (spec semantics) run in fresh parallel contexts. No single reviewer can sign off alone.
5. **Canonical writer per data file.** ROADMAP.md ← refresh ritual only. FOUNDER-BETS.md ← founder only. product-decisions.md ← append-only. user-journey-map.md ← daily regen from prod.
6. **Race-condition prevention via explicit gates.** v6b produces `module-list.md status: locked` before v8 can consume it.
7. **Retro-driven lessons.** /retro skill promotes wave-level observations into `planning-principles.md` (Stage 2 readable) and `dev-principles.md` (Stage 4 readable). Lessons compound across projects.

---

## Keeping the brain in sync across projects — `auto-claude sync`

After forking this repo into N projects, brain updates need to propagate back out. `bin/auto-claude` is a small bash tool that automates the sync while preserving project-local content.

### One-time setup per consumer project

In the consumer project root:

```bash
# Point at the auto-claude brain repo + pin a starting version
/path/to/auto-claude/bin/auto-claude init --version=v0.5.0

# Edit the generated .brainignore — mark project-local paths as ignore:
# and divergent-but-sync-friendly files as interactive:
$EDITOR .brainignore

# Commit the sync infrastructure
git add .brainignore command-center/.brain-version command-center/.brain-snapshot/
git commit -m "chore: add auto-claude sync infrastructure (pinned v0.5.0)"
```

Three mode keywords in `.brainignore`:

- `ignore:<path>` — never touch this file/directory during sync (product state, benchmarks, project-specific dev lessons, architecture docs, Planning/, etc.)
- `interactive:<path>` — show hunk-by-hunk diff with 3-way conflict detection; prompt per file when both brain and project have changed
- (default) — silent overwrite from brain (stage files, management/, monitors/, onboarding stages — everything brain-owned)

### Day-to-day commands

```bash
# Is my project up to date?
auto-claude status

# What would sync do?
auto-claude diff                   # vs upstream HEAD
auto-claude diff --to=v0.6.0       # vs a specific release

# Apply the sync
auto-claude sync                   # interactive (prompts for CONFLICT files)
auto-claude sync --to=v0.6.0       # to a specific version
auto-claude sync --non-interactive # CI-safe; aborts on any CONFLICT
auto-claude sync --dry-run         # same as `diff`
```

### How conflict resolution works

When a file is marked `interactive:` and both the brain *and* your project changed it since the last sync, the tool shows you the brain's diff and offers four choices:

- **[m]erge 3-way** — use git's 3-way merge engine (opens `$EDITOR` if there are true conflicts)
- **[o]verwrite with brain** — take the brain's version, discard project changes
- **[k]eep project version** — skip this file, leave project as-is
- **[s]kip** — defer (same effect as `k` but intentionally non-committal)

After a successful sync:
- `command-center/.brain-version` updates to the new pin
- `command-center/.brain-snapshot/` refreshes to match the new pinned state (becomes the new 3-way base for future syncs)
- A single commit bundles all changes, including the new version pin

### Release workflow (for brain authors)

```bash
# 1. Land feature commits on main
# 2. Bump command-center/VERSION
# 3. Add a CHANGELOG entry using the template at the top of CHANGELOG.md
# 4. Tag and push
git tag -a v0.6.0 -m "v0.6.0 — <summary>"
git push origin main v0.6.0
```

The `Consumer sync` section in each CHANGELOG entry is what downstream projects read before running `auto-claude sync --to=v0.6.0`.

---

## License

See `LICENSE`.
