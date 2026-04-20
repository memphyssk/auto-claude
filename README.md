# auto-claude — MD Orchestration System for Claude Code

A project-agnostic operating system for running LLM coding agents on real product work. Drop the files in this repo into your project and you inherit a **17-stage wave loop**, a **two-reviewer gate**, **dual-document sub-agent memory**, a **canonical PM backlog pattern**, and a **design-gap resolution stage** — all wired through a single `CLAUDE.md` trigger table that Claude Code consults every turn.

The files here are the actual running system, battle-tested on a real product and then scrubbed to remove project-specific content. You fork, fill in the scaffolds, and run.

---

## What's inside

| Path | What it does |
|---|---|
| `CLAUDE.md` | Orchestration hub — trigger table + 9 always-on rules. Loaded by Claude Code every turn. |
| `command-center/rules/` | 14 topic-scoped rule files covering sub-agent workflow, decision autonomy, planning/execution principles, testing, security, housekeeping, skill use, triage, external SDKs, backlog planning, PM rituals (roadmap-lifecycle / roadmap-refresh / daily-checkpoint), product mega-testing. |
| `command-center/rules/build-iterations/wave-loop.md` | Stage dispatcher — the 17-stage sequence the orchestrator runs for every wave. |
| `command-center/rules/build-iterations/stages/*.md` | 18 per-stage specs (0 → 11 + 0b/3b/4b/5b/6b/7b). Each stage file states its Purpose, Prerequisites, Actions, Deliverable, Exit criteria. |
| `command-center/Sub-agent Instructions/` | 19 agent-specific directive files (karen, Jenny, problem-framer, product-manager, backend/frontend/react/nextjs/websocket/security engineers, ui-comprehensive-tester, knowledge-synthesizer, etc.). Injected as the FIRST directive in every sub-agent spawn prompt. |
| `command-center/Sub-agent Observations/` | 20 empty stubs — the Stage 9/10 pipeline writes behavioral notes here, Stage 10 karen promotes them to instructions. Accumulates over time; never injected at spawn. |
| `command-center/product/` | Product scaffolds: `ROADMAP.md` (themes + horizons), `FOUNDER-BETS.md` (founder voice), `product-decisions.md` (append-only log), `roadmap-archive/`. |
| `command-center/artifacts/` | Persistent reference material: `user-journey-map.md` (daily-regen flow inventory scaffold), `Concept/`, `competitive-benchmarks/`. |
| `command-center/test-writing-principles.md` | Master testing guide — §0-13 code-level patterns, §15-16 live production E2E with Playwright. |
| `design/` | Canonical design pipeline: `DESIGN-SYSTEM.md` scaffold, `brief-template.md`, `review-gate.md`, `staging/`. Stage 3b canonicalizes approved mockups here. |

---

## Why

LLM coding agents fail in predictable ways: hallucinated facts, right-code-for-wrong-problem, memory cliff between sessions, silent drift between plan and spec and shipped code, workarounds that become permanent features, deploy races that pass false tests. This system prevents each of those by construction:

- **Hallucination** — Karen (source-claim verification) runs in a fresh context at Stage 3 before code is written.
- **Wrong problem** — Stage 1 problem-framer + ceo-reviewer split the symptom-vs-cause check across two independent lenses.
- **Memory cliff** — Sub-agent instructions + observations + retro-driven principles files persist lessons across sessions.
- **Silent drift** — Jenny (spec-semantic verification) cross-references plan vs specs at Stage 3; Karen + Jenny re-run at Stage 7 against the deployed state.
- **Workaround-as-feature** — Stage 1 antipatterns catalog + /retro pipeline surface these patterns before they ship.
- **Deploy races** — Deploy-race detection rules + network-tab scanning + Stage 5b QA + Stage 6 Playwright swarm on live prod.

---

## How to use

### 1. Fork or copy the repo into your project

Drop `CLAUDE.md` at your repo root + `command-center/` + `design/` alongside it. The `.taskmaster/` directory you manage separately (install `task-master-ai` per TaskMaster docs).

### 2. Fill in the project placeholder

`CLAUDE.md` top section has a `<Your Project>` placeholder block. Replace with your project name, stack, commands, test users. Everything below the `---` is project-agnostic and works as-is.

### 3. Fill in the product scaffolds when ready

- `FOUNDER-BETS.md` — your strategic takes
- `ROADMAP.md` — will be populated by the first `roadmap-refresh-ritual.md` run; you don't edit milestones by hand
- `product-decisions.md` — grows append-only as the refresh ritual and daily checkpoint log decisions
- `user-journey-map.md` — regenerates from prod crawl; scaffold contains the format

### 4. Fill in `design/DESIGN-SYSTEM.md`

Populate the token sections (colors / typography / spacing / shadows / icons). Every generated mockup and every frontend implementation reads from here.

### 5. Run your first wave

Tell Claude Code "start a new wave on task <id>". It will read `CLAUDE.md`, load `wave-loop.md`, and begin executing the 17-stage sequence. Karen + Jenny are spawned at Stage 3 (non-negotiable).

---

## The 17 stages at a glance

```
0  Prior-work query (claude-mem lookup)
0b Roadmap alignment + product decisions (conditional)
1  Problem reframing (problem-framer + ceo-reviewer parallel)
2  Plan authoring
3  Gate (Karen + Jenny + Gemini for high-stakes)
3b Design-gap resolution — Dx loop (conditional, skip for non-UI)
4  Execute (topic-chosen specialists, parallel)
4b Post-build review (/review skill)
5  Deploy + CI watch
5b Post-deploy QA (/qa skill)
6  Playwright functional test swarm (3-5 testers)
6b Layout verification (conditional)
7  Reality check (Karen + Jenny post-test)
7b Triage opportunistic findings
8  Closeout + doc updates
9  Observations retro (knowledge-synthesizer writes)
10 Distillation (karen promotes obs → instructions)
11 Next task
```

---

## Canonical rule: triggers live in consumers, not in the files themselves

Every rule file in this system describes its **purpose**, not **when to read it**. The "when" lives in `CLAUDE.md`'s trigger table, `wave-loop.md`'s cross-references, and each stage file's Prerequisites block. This means rule files don't self-declare ("Read BEFORE X") — they're pure content. The single dispatch surface is CLAUDE.md + wave-loop + stage files.

---

## The three PM rituals

- **`backlog-planning.md`** — tactical: replenishes the atomic-task queue when backlog < 3 items. Spawns `competitive-analyst`, runs `/plan-ceo-review`, produces the next 3-5 waves.
- **`roadmap-refresh-ritual.md`** — strategic: quarterly-ish full refresh of `ROADMAP.md`. Founder-invocable; also proposed by Stage 11 when planned milestones drop below 3 or Stage 0b sees >30 unassigned tasks.
- **`daily-checkpoint.md`** — operational: 3-bucket batch (Tier 3 decisions / new assignments / stayed-unassigned) surfaced to founder once per day, triggered by Stage 11 when `task-master next` returns nothing actionable.

---

## Context cost (at 1M context Opus)

- **Ambient (always loaded):** ~4K tokens (CLAUDE.md + wave-loop.md)
- **Typical wave:** ~75K tokens total across all 17 stages
- **Worst-case wave** (all conditional stages fire): ~175K tokens (~18% of context)

You can run 4-5 full waves back-to-back before needing compaction.

---

## License

See `LICENSE`.
