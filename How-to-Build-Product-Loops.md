# How to Build Product Loops

A complete, abstracted template for running agentic product development with LLM coding agents. Based on a battle-tested system that ships code through a 17-stage wave loop, dual-document memory, and a mandatory review-gate pattern.

This is not a theory paper. It is a copy-pasteable operating system for a product.

---

## Table of Contents

1. [Prologue — Why this exists](#1-prologue--why-this-exists)
2. [The Three Loops](#2-the-three-loops)
3. [Two Filesystems — Persistent Brain vs. Hot Working Dir](#3-two-filesystems--persistent-brain-vs-hot-working-dir)
4. [The Orchestrator File (`CLAUDE.md`)](#4-the-orchestrator-file-claudemd)
5. [The Wave Loop — Dispatcher + 17 Stage Files](#5-the-wave-loop--dispatcher--17-stage-files)
6. [Stage-by-Stage Walkthrough (with templates)](#6-stage-by-stage-walkthrough)
7. [The Gate Pattern — Why Two Reviewers, Never One](#7-the-gate-pattern)
8. [Sub-Agents — The Dual-Document System](#8-sub-agents--the-dual-document-system)
9. [Topic-Scoped Rules](#9-topic-scoped-rules)
10. [Skills / Slash Commands — Injection Points](#10-skills--slash-commands)
11. [Backlog — Canonical Task Source](#11-backlog--canonical-task-source)
12. [The Antipatterns Catalog](#12-the-antipatterns-catalog)
13. [Working-Dir Artifacts (plans, reviews, test reports, closeouts)](#13-working-dir-artifacts)
14. [Always-On Invariants](#14-always-on-invariants)
15. [Meta-Patterns — What Makes This System Work](#15-meta-patterns)
16. [Adoption Path — Setting This Up on a New Product](#16-adoption-path)
17. [Common Pitfalls](#17-common-pitfalls)
18. [Appendix — Full Template Library](#18-appendix--full-template-library)

---

## 1. Prologue — Why this exists

LLM coding agents fail in predictable ways:

- **Hallucinated facts.** "I'll update `src/auth/guards.ts` line 47" — the file doesn't exist, or line 47 is something else.
- **Right code, wrong problem.** The agent solves the visible symptom while the root cause ships untouched.
- **Memory cliff.** Each wave starts fresh. Lessons from wave N are forgotten by wave N+1.
- **Silent drift.** The plan said X, the spec requires Y, the shipped code does Z — and nobody noticed.
- **Workarounds become features.** "We couldn't fix X so we added a toggle." The toggle stays forever.
- **Deploy races.** Testing runs against stale code. False passes. The bug is still live.

This guide defines a **product-loop operating system** that fixes these by construction. It uses:

1. **A rigid 17-stage wave sequence** that no one — not even the orchestrator — is allowed to shortcut.
2. **A mandatory two-reviewer gate** before any line of code is written. The two reviewers have different blind spots on purpose.
3. **A dual-document memory**: one file tells agents *what to do* (positive directives); a parallel file silently accumulates *behavioral patterns* the orchestrator sees. Every N waves, the patterns are distilled into the directives.
4. **A persistent brain folder + an ephemeral working folder**, with a hard rule about what goes where.
5. **A single canonical backlog** where specs live inside the task itself — never in loose floating documents.
6. **Skills (slash commands)** plugged into specific stages as extra verification layers.
7. **A trigger table at the top of the project** that tells the orchestrator *which file to read before doing X*.

The net result: agents ship reliably, hallucinations are caught before code is written, and institutional knowledge compounds across waves instead of evaporating.

---

## 2. The Three Loops

Three loops run simultaneously. They share data but have different cycles.

### Execution Loop (inside a wave)

```
Task  →  Reframe  →  Plan  →  Gate  →  Code  →  Test  →  Deploy  →  Verify  →  Close
```

Stages 0–8. Runs once per wave. Ships code or explicitly blocks.

### Knowledge Loop (across waves)

```
Wave N behavior  →  Observations file  →  (filter + cap)  →  Instructions file  →  Wave N+1 behavior
```

Stages 9–10. Runs once per wave. Compounds quality over time.

### Backlog Loop (across waves)

```
Spec (inside task)  →  Wave pulls task  →  Ships  →  Marks done  →  Pulls next task
```

Runs continuously. The backlog is the only canonical source of scope.

### How they interact

The execution loop consumes a task from the backlog loop and writes into the knowledge loop on close. The knowledge loop updates the agent directives that the next execution loop reads. The backlog loop is replenished periodically by a separate "backlog planning" ritual (see §9).

```
                  ┌──────────────────┐
                  │   BACKLOG        │  (canonical specs, one-per-task)
                  │                  │
                  └────────┬─────────┘
                           │ pull next
                           ▼
┌──────────────────────────────────────────────────────────┐
│                       WAVE (execution loop)              │
│   0 → 0b → 1 → 2 → 3 → 4 → 4b → 5 → 5b → 6 → 6b → 7 → 7b │
│                                                         → 8
└──────────────────────────────┬───────────────────────────┘
                               │ at close
                               ▼
                  ┌──────────────────┐
                  │  KNOWLEDGE       │  (observations → instructions)
                  │  9 → 10          │
                  └────────┬─────────┘
                           │ updates agent directives
                           ▼
                  (next wave reads improved directives)
```

---

## 3. Two Filesystems — Persistent Brain vs. Hot Working Dir

The single most important architectural rule: **separate persistent memory from ephemeral work.**

### Persistent Brain: `command-center/`

Survives across waves. Rules, agent memory, reference material. Read-on-trigger. Touched only at specific stages (9, 10) or on explicit rule change.

```
command-center/
├── README.md                        ← map of this folder
├── dev-principles.md                ← cross-wave lessons (from /retro)
├── tech-architecture.md             ← stack, conventions
├── product-glossary.md              ← domain terminology
├── test-writing-guidelines.md       ← master testing reference
│
├── rules/                           ← topic-scoped, read on-trigger
│   ├── sub-agent-workflow.md
│   ├── decision-framework.md
│   ├── security-waves.md           (or "high-stakes-waves.md")
│   ├── testing.md
│   ├── skill-use.md
│   ├── backlog-planning.md
│   ├── housekeeping.md
│   ├── external-sdks.md
│   └── build-iterations/
│       ├── wave-loop.md            ← the dispatcher
│       └── stages/
│           ├── stage-0-prior-work.md
│           ├── stage-0b-product-decisions.md
│           ├── stage-1-problem-reframing.md
│           ├── stage-2-plan.md
│           ├── stage-3-gate.md
│           ├── stage-4-execute.md
│           ├── stage-4b-review.md
│           ├── stage-5-deploy.md
│           ├── stage-5b-qa.md
│           ├── stage-6-test.md
│           ├── stage-6b-layout.md
│           ├── stage-7-reality-check.md
│           ├── stage-7b-triage.md
│           ├── stage-8-closeout.md
│           ├── stage-9-observations.md
│           ├── stage-10-distillation.md
│           └── stage-11-next.md
│
├── Sub-agent Instructions/          ← per-agent positive directives (READ at spawn)
│   ├── <archetype-A>-instructions.md
│   ├── <archetype-B>-instructions.md
│   └── ...
│
├── Sub-agent Observations/          ← orchestrator-only behavioral memory (Stage 9/10 ONLY)
│   ├── <archetype-A>-observations.md
│   ├── <archetype-B>-observations.md
│   └── ...
│
└── artifacts/                       ← persistent reference material
    ├── Concept/                     ← per-role research, master plan
    ├── competitive-benchmarks/
    ├── DESIGN.md
    └── design-flow-semantics.md
```

### Hot Working Dir: `working/` (or `Planning/`)

Ephemeral. Wave deliverables. Written during stages 1–8 and consumed by 9–10.

```
working/
├── wave-<N>-reframing.md
├── wave-<N>-strategic-review.md
├── wave-<N>-plan.md
├── wave-<N>-halluc-gate.md
├── wave-<N>-spec-gate.md
├── wave-<N>-xmodel-gate.md          (if applicable)
├── wave-<N>-test-reports/
│   ├── tester-1.md
│   ├── tester-2.md
│   └── ...
├── wave-<N>-halluc-realitycheck.md
├── wave-<N>-spec-realitycheck.md
├── wave-<N>-closeout.md
│
└── archive/                         ← compact old waves here periodically
```

### Canonical Root Docs

Two files live at the project root, not in `command-center/`:

- **`CLAUDE.md`** — the orchestrator's entry point: trigger table, always-on rules, conventions, directory map.
- **`UserFlows.md`** (or equivalent) — canonical inventory of every screen, route, endpoint, and user flow. Status column tracks shipped state.

### The Lifecycle Contract

| Where | Lifecycle | Who writes | Who reads |
|---|---|---|---|
| `CLAUDE.md` | Project lifetime | Orchestrator (rare, explicit) | Every turn, every agent |
| `command-center/rules/` | Project lifetime | Orchestrator (on rule change) | On trigger |
| `command-center/Sub-agent Instructions/` | Project lifetime | Stage 10 only | On every agent spawn |
| `command-center/Sub-agent Observations/` | Project lifetime | Stage 9 only | Stage 10 only — **never injected into prompts** |
| `command-center/artifacts/` | Project lifetime | On-demand | On trigger (historical research) |
| `working/wave-<N>-*.md` | One wave | The wave itself | Same wave + Stage 9 retro |
| `working/archive/` | Indefinite | On close | Rare historical reference |

This contract is load-bearing. If observations leak into prompts, agents start gaming their own retros. If plans leak into `command-center/`, the persistent brain gets polluted with wave-specific noise.

---

## 4. The Orchestrator File (`CLAUDE.md`)

The single entry point the orchestrator reads every turn. Three things live here and nothing else should.

1. **Trigger table** — "when X happens, READ file Y before acting"
2. **Always-on rules** — invariants that apply every turn regardless of trigger
3. **Directory map + conventions** — terse reference

### Why a trigger table

Without a trigger table, the orchestrator either:

- Reads everything every turn (context blow-up, slow), or
- Reads nothing and hallucinates (quality collapse)

A trigger table reads as conditional branches: "IF the wave is starting, READ `wave-loop.md` BEFORE acting." It forces JIT loading of the right knowledge at the right time.

### Template: `CLAUDE.md`

```markdown
# <PRODUCT NAME>

<One-line description of what you're building and why.>

## Architecture
- <Repo layout: monorepo? apps? packages?>
- <Stack: language, framework, database, hosting>

## Quick Start
```bash
<commands to bring up the dev env>
```

## Commands
| Command | Description |
|---------|-------------|
| `<cmd>` | <what it does> |
| ... | ... |

## Task Management
<Name the canonical backlog tool (e.g., TaskMaster, Linear, Jira) and
 how to interact with it. Include the 5–6 most-used commands.>

`<backlog-tool>` is the canonical task tracking system. All features, bugs,
and backlog items live there. Specs live inside each task's description field
(NOT in loose working/*.md files).

---

# ⚡ Trigger Table — READ THESE FILES WHEN:

**This is the most important section. Each row is a conditional instruction:
when the trigger fires, you MUST read the linked file BEFORE acting.**

| Trigger | READ BEFORE acting |
|---|---|
| Starting a new wave | `command-center/rules/build-iterations/wave-loop.md` (then read each stage file before entering that stage) |
| Picking next task | `<backlog next command>` — <tool> is canonical |
| Spawning ANY sub-agent | `command-center/rules/sub-agent-workflow.md` + `command-center/Sub-agent Instructions/<agent>-instructions.md` |
| Any test work | `command-center/rules/testing.md` + `command-center/test-writing-guidelines.md` |
| Making a product/UX decision | `command-center/rules/decision-framework.md` |
| Wave touches <high-stakes scope> (auth, payments, data migrations, etc.) | `command-center/rules/security-waves.md` |
| Task touches any external SDK / 3rd-party | `command-center/rules/external-sdks.md` |
| Invoking any slash command / skill | `command-center/rules/skill-use.md` |
| Starting any wave | `command-center/dev-principles.md` (cross-wave lessons) |
| Closing a wave | `command-center/rules/housekeeping.md` |
| Running backlog replenishment (or backlog < 3 at wave start) | `command-center/rules/backlog-planning.md` |
| Historical research / design spec needed | `command-center/artifacts/` |

**Companion docs referenced by many files:**
- `UserFlows.md` — canonical flow/route/endpoint inventory
- `command-center/test-writing-guidelines.md` — master testing guide

---

# 🔒 Always-on rules

1. **Follow the canonical wave loop — at all times.** Every wave follows the stage
   sequence in `command-center/rules/build-iterations/wave-loop.md`. Before EVERY
   stage, read the corresponding stage file. Never invent, skip, or reorder stages.

2. **Never commit secrets.** `.env`, credentials, API keys — secrets go in
   env-var management systems only (CI, deploy platform).

3. **Two-reviewer gate on every wave.** The baseline reviewer pair (see §7) is
   non-negotiable. Specialists layer on top but never substitute.

4. **Root-cause before escalation. Iron Law: no fixes without root cause.** After
   2 failed fix attempts, spawn a domain expert. Never debug-by-deploy with
   `console.log` PRs.

5. **Self-serve mechanical actions.** Generating secrets (`openssl rand -base64
   32`), creating branches, running lints — never wait for the user on routine
   mechanical work.

6. **Product specs live inside the backlog task.** Embed the full spec in the
   task's description field. The backlog is the single source of truth.

7. **No time-based shortcuts.** Wall-clock cost is never a reason to skip a
   stage. Only explicit skip conditions in the stage files justify skipping.

8. **Persistent brain is write-guarded.** `command-center/` is only written to
   at specific stages (9, 10) or on explicit rule changes. Plans, test reports,
   and wave artifacts go to `working/`.

9. **<Add domain-specific rules your project needs.>**

---

# Code Conventions

<Typescript / Python / Go / whatever rules specific to your stack>
<Linting, formatting, testing conventions>
<API design, database, security baseline>

---

# Directory Structure

```
<paste the repo structure map>
```
```

---

## 5. The Wave Loop — Dispatcher + 17 Stage Files

A wave is one unit of "do a thing end-to-end." The wave loop is modular: a dispatcher file lists the sequence, and each stage has its own file with entry conditions, actions, exit criteria, and deliverables.

### Why modular?

If the entire loop is one giant file, the orchestrator has to load thousands of lines every turn. If it's split per stage, the orchestrator loads `wave-loop.md` once at wave start, then loads one stage file per stage — JIT knowledge.

### The 17-stage sequence

```
0  → 0b → 1  → 2  → 3  → 4  → 4b → 5  → 5b → 6  → 6b → 7  → 7b → 8  → 9  → 10 → 11
```

| Stage | Purpose | One-line |
|---|---|---|
| 0 | Prior-work query | Did we already do this? |
| 0b | Product decisions (cond.) | Autonomous product choices flagged by the task |
| 1 | Problem reframing | Symptom vs. cause + antipatterns red-team |
| 2 | Plan | Author the plan; file targets, agents, verification approach |
| 3 | **Gate** | Two reviewers + optional cross-model adversary |
| 4 | Execute | Implementer agents write code in parallel |
| 4b | Post-build review | Contract-mismatch / null-access / production-bug checks |
| 5 | Deploy | PR → CI → hosting platform |
| 5b | Post-deploy QA | Fast headless smoke test |
| 6 | Test swarm | Parallel functional testers with persona partitioning |
| 6b | Layout verification (cond.) | Visual layout match if frontend changed |
| 7 | **Reality check** | Same two reviewers verify on FINAL deploy |
| 7b | Triage | Classify opportunistic findings (block / fast-follow / next-wave / backlog) |
| 8 | Closeout + doc updates | Update canonical docs; write closeout artifact |
| 9 | Observations retro | Write behavioral notes into observation files |
| 10 | Distillation | Promote load-bearing patterns → instructions |
| 11 | Next task | Mark done, pull next from backlog, loop |

### Template: `rules/build-iterations/wave-loop.md`

```markdown
# Wave Loop — Stage Dispatcher

**This is the single source of truth for the build iteration process.** Before
EVERY stage, read the corresponding stage file. Do not invent stages, skip
stages, or reorder stages.

## Stage sequence

```
0 → 0b → 1 → 2 → 3 → 4 → 4b → 5 → 5b → 6 → 6b → 7 → 7b → 8 → 9 → 10 → 11
```

## Stage index

| Stage | File | Purpose |
|-------|------|---------|
| 0 | `stages/stage-0-prior-work.md` | Query prior work to avoid redundant effort |
| 0b | `stages/stage-0b-product-decisions.md` | Autonomous product decisions (conditional) |
| **1** | `stages/stage-1-problem-reframing.md` | **Symptom-vs-cause check + antipatterns red-team** |
| 2 | `stages/stage-2-plan.md` | Author the wave plan |
| 3 | `stages/stage-3-gate.md` | Two-reviewer + cross-model pre-implementation gate |
| 4 | `stages/stage-4-execute.md` | Implement the plan |
| 4b | `stages/stage-4b-review.md` | Post-build code review |
| 5 | `stages/stage-5-deploy.md` | PR + CI + deploy |
| 5b | `stages/stage-5b-qa.md` | Post-deploy QA |
| 6 | `stages/stage-6-test.md` | Functional test swarm |
| 6b | `stages/stage-6b-layout.md` | Layout verification (conditional) |
| 7 | `stages/stage-7-reality-check.md` | Post-test reality check |
| 7b | `stages/stage-7b-triage.md` | Triage opportunistic findings |
| 8 | `stages/stage-8-closeout.md` | Update docs + produce closeout |
| 9 | `stages/stage-9-observations.md` | Behavioral retrospective |
| 10 | `stages/stage-10-distillation.md` | Promote observations to instructions |
| 11 | `stages/stage-11-next.md` | Pick next task, return to Stage 0 |

## How to use this loop

1. Read this file at the START of every wave.
2. Before entering Stage N: READ `stages/stage-N-<name>.md`.
3. Execute exactly what the stage file says.
4. When the stage's exit criteria are met, return here.
5. Identify the next stage. READ it. Enter.
6. Repeat until Stage 11.

**Do NOT proceed to Stage N+1 without reading its file first.** No file read =
no instructions = do not proceed.

## Skip conditions

| Stage | May skip when |
|-------|--------------|
| 0b | Task has no `needsProductDecision` flag |
| 1 | Pure typo/copy (<5 LOC), pure dep bumps, pure doc changes |
| 3 cross-model check | Low-stakes UI/copy/seed waves (baseline pair still required) |
| 6b | Backend-only, infra-only, doc-only waves |
| All others | NEVER — every other stage is mandatory |

## Cross-references (apply at every stage)

- Before spawning ANY sub-agent: READ `command-center/rules/sub-agent-workflow.md`
  + `command-center/Sub-agent Instructions/<agent>-instructions.md`
- Observation files: Stage 9/10 only — NEVER read during Stages 1–8
- High-stakes scope: READ `command-center/rules/security-waves.md`
- Any tester swarm: READ `command-center/rules/testing.md`
- Any skill invocation: READ `command-center/rules/skill-use.md`
- Product/UX decisions: READ `command-center/rules/decision-framework.md`

## Task management hooks

- Stage 2: `<backlog next>` to pick task
- Stage 4: `<backlog set in-progress>` when starting execution
- Stage 8: `<backlog set done>` when shipping
- Stage 11: `<backlog next>` to pick next wave

## Operational rules

- **Same-wave fast-fix:** When testers find small bugs (<20 LOC), fix in a
  follow-up before Stage 7. Reviewers re-review the fixed state.
- **Deploy-race detection:** Before Stage 6, verify deploy is complete (health
  endpoint, uptime < 120s after merge, SHA match).
- **Never deploy from local:** All deploys go through CI.
```

### Per-Stage File Schema

Every stage file follows the same skeleton. This regularity is the whole point — the orchestrator knows exactly what to expect.

```markdown
# Stage N — <name>

## Purpose
<One paragraph. What problem this stage solves. What it produces.>

## Prerequisites
- <What must exist before entering>
- READ <companion rule files>
- READ <agent instruction files for any agents being spawned>

## Actions
<Numbered or bulleted steps. Concrete. Include:>
- What to spawn (sub-agents, skills)
- What to read
- What to write
- Commands to run

### <Sub-section for each sub-process if needed>

## Deliverable
<The specific file(s) or state this stage produces.>

## Exit criteria
<How the orchestrator knows the stage is done.>

## Skip conditions (if any)
<When to legitimately skip.>

## Next
→ Return to `../wave-loop.md` → Stage N+1
```

---

## 6. Stage-by-Stage Walkthrough

Each stage below includes: purpose, key mechanics, and a ready-to-fill template. Copy the templates verbatim, then tune for your product.

---

### Stage 0 — Prior-Work Query

**Purpose:** Avoid re-doing work already shipped. One semantic search saves a full re-investigation.

**Mechanics:** Query a memory system (vector search over prior wave artifacts, `/learn` output, or a retrieval MCP) for prior work on the current topic. If relevant work exists, cite it in the plan and reduce scope to the delta.

**Template:**

```markdown
# Stage 0 — Prior-Work Query

## Purpose
Avoid re-doing work that was already done in a prior wave.

## Prerequisites
- Wave topic identified.

## Actions
1. Query memory system (`<tool>`) for prior work on topic.
2. If prior output covers same surface and is still current: cite in plan,
   reduce Stage 3 scope to the delta.
3. If nothing relevant: proceed.

## Deliverable
None — informs Stage 1 and Stage 2.

## Exit criteria
- Semantic search completed (or skipped if unavailable).
- Prior work noted for reframing and plan.

## Next
→ Stage 0b (if applicable) or Stage 1.
```

---

### Stage 0b — Product Decisions (conditional)

**Purpose:** Resolve product choices flagged on the task before planning begins.

**Mechanics:** Run only when the task has a `needsProductDecision` flag or equivalent. Apply the 3-tier decision framework (§9). Optionally spawn a competitive-analyst for Tier 2/3 decisions.

**Skip:** If the task has no product-decision flag, skip silently.

---

### Stage 1 — Problem Reframing

**Purpose:** Prevent "right code, wrong problem" by running two parallel lenses:
- **Technical lens** (problem-framer): symptom-vs-cause, solution classes, antipatterns red-team
- **Strategic lens** (strategic-reviewer): worth doing now? direction check? prime directives at risk?

Both are read-only, fresh context. They do NOT see each other's output.

**Mechanics:**

```
┌────────────────────┐          ┌──────────────────────┐
│  problem-framer    │          │  strategic-reviewer  │
│  (technical lens)  │          │  (founder/CEO lens)  │
└─────────┬──────────┘          └───────────┬──────────┘
          │ parallel spawn                   │
          ▼                                  ▼
 wave-<N>-reframing.md            wave-<N>-strategic-review.md

                     │
                     ▼
          Orchestrator consolidates verdicts:
          - Both PROCEED  → Stage 2
          - RESCOPE       → update task, re-run Stage 1
          - EXPAND/REDUCE → ask user (AskUserQuestion)
          - ESCALATE      → escalate to user
          - Conflicting   → escalate to user
```

**Skip:** Pure typo (<5 LOC), dependency bumps, doc-only changes.

**Template:**

```markdown
# Stage 1 — Problem Reframing

## Purpose
Prevent "right code for wrong problem" failures. Two parallel agents apply
different lenses:
- problem-framer — symptom-vs-cause, antipatterns, solution classes
- strategic-reviewer — user/business value, scope, prime directives

## Prerequisites
- Task/issue text available from backlog.
- READ sub-agent instruction files for both agents.

## Actions

### 1. Spawn the review team in parallel
Both sub-agents are read-only, fresh context, spawned in ONE message.

**problem-framer** → `working/wave-<N>-reframing.md`
Answers:
1. Restate problem in user's terms. Is it cause or symptom?
2. If symptom, hypothesize 1–2 underlying causes (with evidence).
3. Name 3 fundamentally different solution classes.
4. Red-team against the antipatterns catalog (see §12).
Verdict: PROCEED / RESCOPE / ESCALATE

**strategic-reviewer** → `working/wave-<N>-strategic-review.md`
Answers:
1. Worth doing right now? (value, cost of not doing, higher-leverage alts)
2. Direction check via 2–3 cognitive patterns.
3. Prime directives at risk.
Verdict: PROCEED / RECONSIDER / EXPAND_PROPOSAL / REDUCE_PROPOSAL

### 2. Orchestrator decision
Consolidate:
- Both PROCEED → continue to Stage 2
- RESCOPE → update task description, re-run Stage 1 if scope changed materially
- RECONSIDER → escalate to user with proposed alternative
- EXPAND_PROPOSAL / REDUCE_PROPOSAL → present via AskUserQuestion. Never auto-apply.
- Either ESCALATE → escalate before Stage 2
- Conflicting verdicts → escalate; both lenses caught different things.

## Skip conditions
- Pure typo/copy (<5 LOC)
- Pure dependency bumps
- Pure documentation changes

## Deliverable
- `working/wave-<N>-reframing.md`
- `working/wave-<N>-strategic-review.md`

## Exit criteria
- Both review files written
- Orchestrator decision recorded
- Any user-escalations resolved
- Stage 2 plan references both verdicts

## Next
→ Stage 2

---

## Antipatterns Catalog
<See §12 of this guide — reproduce full catalog here or link.>
```

---

### Stage 2 — Plan

**Purpose:** Author the wave plan. Who builds what, who verifies, what's out of scope.

**Default path (~90%):** Orchestrator authors from direct codebase audit. For non-trivial features, spawn an `Explore` agent first to inventory existing support.

**Exception (greenfield):** `Explore` → `product-manager` → orchestrator finalize. Never run planning agents without prior grounding — they hallucinate.

**Mandatory features of the plan:**

1. Targets — what to build, with file paths (use symbol/method names, not line numbers — line numbers rot fast)
2. Sub-agents — by name, what each handles, why
3. Sub-agent partitioning — zero file collisions (verifiable)
4. Skills to invoke and when
5. Tester swarm size
6. Non-goals — explicit out-of-scope list
7. **Stage completion checklist** (copy below) — marks each stage as it completes; Stage 11 can't fire until all prior stages are checked off

**Post-write consistency sweep:** Before handing to the gate, grep the plan against itself: task-message, Targets, Non-goals, checklist all agree on every irreversible action (flip, delete, migrate). Contradictions invalidate Stage 4.

**Plan-review skills fire BEFORE the gate** (§10): `/plan-eng-review` for architecture, `/plan-design-review` for UI, `/plan-devex-review` for API/CLI/SDK, `/autoplan` for multi-dim.

**Template: wave plan**

```markdown
# Wave <N> — Plan

## Task
<Backlog task ID + title + link>

## Reframing summary
- problem-framer verdict: PROCEED / RESCOPE
- strategic-reviewer verdict: PROCEED / RECONSIDER
- Chosen solution class: <A | B | C>

## Status
<Ready for autonomous loop | blocked pending decision | v2 revision>

## Branch + PR metadata
- Branch: `<feat|fix|chore>/<slug>`
- PR title: `<conventional commit format>`

## Targets (file-by-file change list)

| File | Fix IDs | Change | Est. LOC | Owner |
|------|---------|--------|----------|-------|
| `path/to/file.ts` | P0-1 | Modify `methodName()` to ... | 10 | backend-developer |
| ...  | ...     | ... | ... | ... |

(Use symbol/method-name references, not line numbers.)

## Sub-agent partitioning
- Agent A (<role>): `<files>` — no overlap with B
- Agent B (<role>): `<files>` — no overlap with A
- ... (zero collisions mandatory)

## Skills
- `/plan-eng-review` (before Stage 3): architecture check
- `/simplify` (after Stage 4): complexity reduction
- `/review` (before push): contract-mismatch + null checks
- `/qa` (post-deploy): headless smoke

## Tester swarm
- Size: 3 | 4 | 5
- Personas: buyer, seller, admin, visitor, mobile
- Partition: <how testers divide scope>

## Non-goals (explicit out-of-scope)
- Do NOT touch <file/flow>
- Do NOT change <behavior>
- Deferred to wave <N+1>: <item>

## Risk notes
- Per-fix risk assessment + mitigation

## Implementation sequence
1. <step> (agent)
2. <step> (agent)
...

## Stage completion checklist
- [ ] Stage 0 — Prior work query
- [ ] Stage 0b — Product decisions (if applicable)
- [ ] Stage 1 — Problem reframing
- [ ] Stage 2 — Plan written
- [ ] Stage 3 — Two-reviewer gate (+ cross-model if high-stakes)
- [ ] Stage 4 — Execute
- [ ] Stage 4b — Post-build review
- [ ] Stage 5 — Deploy (PR merged, CI green)
- [ ] Stage 5b — Post-deploy QA
- [ ] Stage 6 — Test swarm
- [ ] Stage 6b — Layout verification (skip if no frontend)
- [ ] Stage 7 — Reality check
- [ ] Stage 7b — Triage opportunistic findings
- [ ] Stage 8 — Closeout + docs
- [ ] Stage 9 — Observations retro
- [ ] Stage 10 — Instruction distillation
- [ ] Stage 11 — Pick next task

## Corrections from prior gate (if v2+)
- <Block X>: addressed by doing Y in file Z
- ...
```

---

### Stage 3 — The Gate (Two Reviewers + Cross-Model)

**Purpose:** The single most valuable stage. Catch hallucinations, spec drift, and strategic wrong-turns BEFORE any code is written.

**Three reviewers, spawned in parallel:**

- **Hallucination Gate (Karen archetype)** — always
  - Spot-checks 3–5 load-bearing claims (file paths, line numbers, function existence) via Read/Grep
  - Verifies prior blocks are addressed
  - Verifies sub-agent partitioning (zero file collisions)
  - Checks for invented helpers, non-existent fields, scope creep
  - **Strategic correctness check (MANDATORY):** if this wave ships as planned, does the user's original problem go away — or only its symptom? Cross-reference every fix against the antipatterns catalog (§12). Match → BLOCK with antipattern name + evidence.

- **Spec Gate (Jenny archetype)** — always
  - Cross-references 3 sources: master plan, current wave plan, implementer claims
  - **Contract drift detection** — compares (backend service shape | shared type | frontend consumer). Mismatches = findings.
  - Port-forward re-verification — ported text silently preserves removed clauses; treat as unverified.
  - Coverage gaps: "1 of 4 scenarios" vs "verified"

- **Cross-Model Gate (Gemini / different-family adversary)** — conditional
  - Single shot, no interactive loop
  - Single task: find the ONE thing most likely to be the wrong solution to a right problem
  - Focus: symptom-vs-cause, metric misalignment, band-aid, workaround-becomes-feature, solving-for-demo, over-engineering
  - Output: max 200 words. Format: CONCERN + EVIDENCE + SUGGESTION

**When is the cross-model gate MANDATORY?**

- Auth, sessions, cookies, CSRF, rate limits
- Payments, wallet, money movement
- Data integrity (migrations, cascading deletes, unique constraints)
- Core user flows
- Anything touching money
- High-stakes orchestrator judgment

**When is it SKIPPABLE?**
- Pure UI/layout/copy
- Seed data tweaks
- Doc updates
- Dep bumps

**Fallback if cross-model tool is unavailable:** Substitute with **two independent specialist reviewers from different lenses** (e.g., architect-reviewer + security-engineer). Both must have fresh context and produce independent findings. If both converge on the same blocker, the adversarial requirement is met. Document the substitution.

**Verdicts (from each reviewer):**
- `APPROVE` — proceed
- `APPROVE WITH NOTES` — proceed with caveats
- `BLOCK` — revise plan, re-run gate

**Security-critical waves:** If first gate returns BLOCK with >2 medium+ findings, produce v2 plan, run second gate pass. This **2-iteration gate** is the correct pattern for security scope, not overhead.

**Hard rules:**
- Both baseline reviewers required on every wave, every time, regardless of scope.
- Specialists layer on top but NEVER substitute for either baseline reviewer.
- Pre-impl gate catches hallucinations before they cost implementation cycles. Cheapest possible catch point.

**Template: `stage-3-gate.md`**

```markdown
# Stage 3 — Gate (Hallucination + Spec + Cross-Model)

## Purpose
Pre-implementation gate with adversarial reviewers spawned in parallel. All
required reviewers must APPROVE before any code is written.

## Prerequisites
- Stage 2 plan file exists
- Stage 1 reframing file exists (reviewers cross-reference)
- READ `rules/sub-agent-workflow.md`
- READ instruction files for both baseline reviewers

## Actions

### 1. Spawn baseline pair in parallel
- **Hallucination Gate** — spot-checks 3–5 load-bearing claims via Read/Grep +
  strategic correctness check against antipatterns catalog
- **Spec Gate** — cross-references plan against master plan, user-flow
  inventory, current code; detects contract drift

### 2. Cross-model adversarial review (conditional)
Run via alternate-family model CLI:

```bash
cat working/wave-<N>-plan.md working/wave-<N>-reframing.md | \
  <alt-model-cli> -p "You are an adversarial reviewer from a different model
  family than the author. Review this plan. Your single task: find the ONE
  thing most likely to be the wrong solution to a right problem. Focus on:
  symptom-vs-cause, metric misalignment, band-aid, workaround-as-feature,
  solving-for-demo, over-engineering. If nothing serious, say so explicitly.
  Output: max 200 words. Format: CONCERN (1-2 sentences) + EVIDENCE (file/line
  if applicable) + SUGGESTION (1 sentence)."
```

Save output to `working/wave-<N>-xmodel-gate.md`.

### 3. MANDATORY trigger list
Run cross-model on:
- Auth, sessions, cookies, CSRF, rate limits
- Payments, wallets, money movement
- Data integrity (migrations, cascades, unique constraints)
- Core user flows
- High-stakes judgment

### 4. OPTIONAL (skip allowed)
- Pure UI/layout/copy
- Seed data tweaks
- Doc updates
- Dep bumps
When skipping, note reason in plan: `X-model check skipped: <reason>`.

### 5. Fallback
If cross-model tool unavailable: two independent specialists from different
lenses (both fresh-context). Document substitution.

## Non-negotiable rules
- Baseline pair mandatory EVERY wave, EVERY time, regardless of scope
- Specialists layer on top; NEVER substitute
- All required reviewers must APPROVE before Stage 4
- Security-critical + first-pass BLOCK with >2 medium+ findings → v2 plan + second gate

## Deliverable
- `working/wave-<N>-halluc-gate.md`
- `working/wave-<N>-spec-gate.md`
- `working/wave-<N>-xmodel-gate.md` (if run)

## Exit criteria
- Both baseline reviewers return APPROVE (or APPROVE WITH NOTES)
- If cross-model ran: CONCERN either addressed in plan revision or explicitly
  acknowledged as accepted risk
- Any BLOCK findings addressed

## Next
→ Stage 4
```

---

### Stage 4 — Execute

**Purpose:** Implement the plan. Write the code.

**Key mechanics:**

1. Mark task in-progress in the backlog.
2. Pick best-fit specialist(s) for the topic — no default roster.
3. **Spawn in parallel when file scopes don't overlap** — this is load-bearing. The gate already verified zero collisions.
4. Each sub-agent receives its instruction file as the FIRST directive in the prompt.
5. Apply `/simplify` after implementation on touched files.

**Agent deviation accountability:**

- Allowed: minor implementation choices within plan scope (equivalent patterns, helper functions)
- Must document: any deviation from plan's file targets, method names, or architectural decisions → "Deviation from plan" section in agent report
- Unacceptable silent deviations: making a module global without plan approval, creating extra files not in spec, changing a guard pattern, skipping a test case from the plan
- Orchestrator reviews all deviations before accepting agent output

**Template:**

```markdown
# Stage 4 — Execute

## Purpose
Implement the plan. Write the code.

## Prerequisites
- Stage 3 gate passed (both baseline reviewers APPROVE)
- READ `rules/sub-agent-workflow.md`
- READ instruction file for each specialist being spawned

## Actions
0. Mark task in-progress: `<backlog set-status>`
1. Pick best-fit expert(s) for topic — no default roster.
2. Spawn in parallel when file scopes don't overlap.
3. Each sub-agent receives its instruction file as FIRST directive.
4. Apply `/simplify` on touched files after implementation.

### Agent deviation accountability
- Allowed: minor choices within plan scope
- Must document: any deviation from file targets, method names, or
  architectural decisions
- Orchestrator reviews deviations before accepting output
- Unacceptable silent deviations → agent re-implements per plan

## Deliverable
Code changes in the working tree (not yet committed).

## Exit criteria
- All plan targets implemented
- No known compile errors
- Deviations documented and reviewed

## Next
→ Stage 4b
```

---

### Stage 4b — Post-Build Review

**Purpose:** Fast contract-mismatch + null-access + production-bug check. **Not** a style review.

**Mechanics:** Run a `/review` skill (or equivalent) on the diff. It's a production-bug hunter, not a linter.

---

### Stage 5 — Deploy

**Purpose:** PR → CI → hosting platform. All deploys go through CI — never local-to-prod pushes.

**Key rules:**
- PR-based workflow
- CI runs lint + typecheck + test + build
- Deploy to staging/preview environment for Stage 5b
- Merge to main only after Stage 7 APPROVE

---

### Stage 5b — Post-Deploy QA

**Purpose:** Fast headless smoke test on touched pages. Catches obvious crashes before the full swarm at Stage 6.

**Critical rule:** This **supplements** the full test swarm; it NEVER replaces it.

---

### Stage 6 — Test Swarm

**Purpose:** The authoritative test mechanism. Parallel functional testers, each with a persona, each with one dedicated browser-automation instance.

**Mechanics:**
- 3–5 testers spawned in parallel
- Each tester: ONE dedicated browser MCP instance (`playwright`, `playwright-2`, etc.)
- Partition by persona + flow (buyer, seller, admin, visitor, mobile)
- Each tester reads the testing guide + user flow inventory
- Regression smoke of prior-wave fixes required

**Hard rules:**
- **NEVER** tell testers to close the browser instance — it kills the MCP for subsequent batch agents
- Each tester uses ONLY their assigned instance — no cross-calling
- Test CONTENT, not just layout (values, row counts, form submissions)
- Network-tab scan for 4xx/5xx on every page
- Edge cases required: invalid IDs, expired tokens, empty states

**End-user simulation discipline (Playwright-specific):**

ALLOWED:
- Click visible elements, type in visible fields, scroll, screenshot
- Read visible text
- Navigate to starting URL once via `page.goto()`
- `browser_network_requests` passively for diagnostics (after the fact)

NEVER ALLOWED:
- `page.goto()` to any URL after the initial entry point — navigate by clicking links only
- `page.evaluate(fetch(...))` to call API endpoints
- Direct API calls via curl/fetch
- Typing URLs in the address bar to jump pages
- `page.evaluate()` to read localStorage as substitute for visible UI

**Why:** If a flow only works via API call or address-bar jump, it's broken for real users.

**Same-wave fast-fix:** When testers find bugs <20 LOC, fix in a follow-up BEFORE Stage 7. Reviewers then see the fixed state.

---

### Stage 6b — Layout Verification (conditional)

**Purpose:** Figma-match verification for frontend changes.

**Skip when:** Backend-only, infra-only, or doc-only waves.

---

### Stage 7 — Reality Check

**Purpose:** Post-test sanity gate. The same two baseline reviewers return, but now with a different question: **"did it ACTUALLY work end-to-end on the FINAL deploy?"**

**Mechanics:**
- Both reviewers spawn in parallel
- Both consume: tester reports, layout verification, original plan
- **Hallucination Gate:** verify fixes actually work end-to-end on the final deploy; surface buried findings; apply downstream test to "minor" and "cosmetic" verdicts
- **Spec Gate:** gap classification on deployed state:
  - **Missing** — spec names, not present
  - **Incomplete** — exists but fewer paths than required
  - **Degraded** — weaker mechanism (alert vs toast; polling vs WebSocket)

**Deployment-gap detection:** Before live probes, verify service runs post-merge code. Compare service uptime / deployment timestamp vs. merge timestamp. If uptime >300s post-merge OR deploy predates merge → deployment gap → BLOCK until redeploy.

> "CI green + merged" ≠ "production running code."

**Live probe discipline:** Run ≥2 direct HTTP probes — one wave-introduced/modified route, one pre-existing regression route. If wave route returns 404/5xx while others succeed, diagnose cause (deploy race, routing, wrong service) before BLOCK/APPROVE.

---

### Stage 7b — Triage Opportunistic Findings

**Purpose:** The test swarm surfaces pre-existing bugs that aren't wave regressions. Classify so they don't get buried.

**Classifications:**
- (a) **Blocks this wave** — fix in-wave
- (b) **Fast-follow** — fix before next wave
- (c) **Next-wave candidate** — create backlog task with wave identifier
- (d) **Backlog** — create backlog task, unprioritized

For every Major/Critical classified as (b) or (c): run `/investigate` for root-cause analysis.

**Hard rule:** Items classified (c) or (d) **must** have a corresponding backlog task. No task = invisible post-close.

---

### Stage 8 — Closeout + Doc Updates

**Purpose:** Update canonical docs; produce closeout artifact.

**Actions:**
1. Mark task done in backlog
2. Update `UserFlows.md` (status column, new routes, guard changes)
3. Update `test-writing-guidelines.md` append-only log (new patterns)
4. Master plan housekeeping (mark shipped items complete)
5. Produce `working/wave-<N>-closeout.md`
6. Optionally run `/document-release`

**Housekeeping rule (load-bearing):**
> Verify before applying "mark as shipped" recommendations. A never-shipped fix marked shipped disappears from the backlog and remains broken in production while the next wave's planning treats it as done.

30-second grep prevents that silent failure mode.

**What NOT to update here:**
- Sub-agent Instructions → Stage 10
- Sub-agent Observations → Stage 9
- Always-on CLAUDE.md rules → require explicit user approval

**Template: closeout**

```markdown
# Wave <N> Closeout

## Verdict
SHIP | SHIP WITH CONCERNS | BLOCK

## Shipped
| PR | Description | Status |
|----|-------------|--------|
| #NNN | <short> | merged + deployed |

## Opportunistic findings triage
| Finding | Severity | Classification | Notes / Next action |
|---------|----------|----------------|---------------------|
| <desc> | Major | next-wave (wave N+2) | backlog task created: <id> |
| <desc> | Medium | fast-follow | fixed in follow-up PR |
| ... | ... | ... | ... |

## Housekeeping applied
- UserFlows.md rows updated: <list>
- Master plan: marked <items> shipped
- test-writing-guidelines §<section> appended with: <pattern>

## Plan-authoring defects to correct for next wave
- <e.g., "Plan cited 30 files; actual count was 48. Re-run greps at plan time, not in Stage 3.">
- <e.g., "Sub-agent partitioning missed shared utility; gate caught it. Write out the shared-util column explicitly next time.">
```

---

### Stage 9 — Observations Retro

**Purpose:** Write the wave's behavioral retrospective into the observation files. Observations only — no instruction updates (that's Stage 10).

**Two sub-agents:**

1. **Writer (knowledge-synthesizer archetype)** — reads wave artifacts (plan, implementer reports, gate reviews, test reports, reality checks) and writes per-agent behavioral findings into `command-center/Sub-agent Observations/<agent>-observations.md`
2. **Compactor (technical-writer archetype)** — rolling-window compaction:
   - Drops entries already promoted to instructions in a prior Stage 10
   - Trims stale entries unpromoted for ≥5 waves
   - Preserves fresh entries + pending promotion candidates

---

### Stage 10 — Instruction Distillation

**Purpose:** The **ONLY** stage that reads observation files. Promote load-bearing behavioral patterns into positive forward-looking instruction directives.

**Two sub-agents:**

1. **Converter (karen archetype)** — reads this wave's observations + current instructions for each agent. Filter brutally: most patterns are NOT load-bearing. Cap: **3 changes per agent per wave**. **Zero promotions is acceptable.**
2. **Compactor (technical-writer archetype)** — aggressive compaction on the updated instruction files. War stories out. Prose to bullets. Merge redundancy. Preserve every rule, trigger, and load-bearing example.

**Orchestrator step 3:** Review the diff. Sanity-check no rules were lost. Commit.

**Why the cap?** Unbounded promotion turns instruction files into essays. The cap forces selection. Zero is a legitimate answer — not every wave surfaces load-bearing patterns.

---

### Stage 11 — Next Task

**Purpose:** Close the wave. Loop.

**Actions:**
1. Mark current task done in backlog
2. Query backlog for next task
3. Also check secondary sources if backlog low (bug lists, deferred items, competitive-analyst output)
4. If backlog empty: report to user, ask for direction
5. Otherwise: identified task becomes next wave scope → Stage 0

**Hard prerequisite:** Stage completion checklist in the wave plan is fully checked off (Stages 0–10). If any stage is unchecked, **STOP** — go back and complete it. No exceptions.

---

## 7. The Gate Pattern

Why two named reviewers, always, together? Because hallucination and spec-drift are **different failure modes with different blind spots**. One reviewer can't catch both reliably.

### Archetype: Hallucination Gate (Karen)

**Failure mode caught:** invented facts, wrong file paths, non-existent methods, strategically wrong problem framing.

**Method:**
- Spot-check 3–5 load-bearing claims via Read/Grep (BEFORE accepting the plan's claims as true)
- Strategic correctness: match the plan against the antipatterns catalog. Match → BLOCK with antipattern name.
- Surface buried findings (tester "minor" flags that are actually major once downstream impact is assessed)
- Require network-tab evidence for data-fetch fixes. 404-silenced zero-state = FAIL.

**Output format:**

```markdown
# <reviewer> — review
**Verdict:** APPROVE / APPROVE WITH NOTES / BLOCK

## Top-line judgment
<1–2 sentences>

## Per-fix verification (table)
| Fix ID | Claim | Verified via | Result |
|--------|-------|--------------|--------|
| P0-1 | `foo.ts:42` has method `bar()` | Read foo.ts | ✓ confirmed |
| ...  | ...   | ... | ... |

## Buried findings (if any)
- <finding> + evidence

## Required changes before spawn
- <specific changes needed for APPROVE>
```

### Archetype: Spec Gate (Jenny)

**Failure mode caught:** spec drift, contract mismatch, coverage gaps, inverted logic.

**Method:**
- Cross-reference 3 sources per claim: master plan, current wave plan, implementer claims
- **Contract drift detection** — compare backend service shape, shared types, frontend consumer. Mismatches = findings.
- Port-forward re-verification — ported text silently preserves removed clauses; treat as unverified.
- Severity: Critical (blocks) / High / Medium / Low (backlog).
- Gap classification: **Missing** / **Incomplete** / **Degraded**.
- Coverage gaps: "1 of 4 scenarios" vs "verified."

**Output format:**

```markdown
# <reviewer> — verification
**Verdict:** SPEC MATCH / SPEC MATCH WITH GAPS / SPEC MISMATCH

## Master plan alignment (table)
| Spec item | Plan treatment | Match? |
|-----------|----------------|--------|
| §X line Y | Plan §Z | ✓ or drift quote |

## Contract drift (if any)
- <backend shape> vs <shared type> vs <frontend consumer>

## Coverage gaps
- <X of Y scenarios tested>

## Severity-classified gap list
| # | Severity | Gap | Classification |
|---|----------|-----|----------------|
| 1 | Critical | <desc> | Missing |

## Distilled summary (≤150 words)
```

### Archetype: Cross-Model Gate (Gemini / alt-family adversary)

**Failure mode caught:** biases the primary model silently accepted. A different model family notices different things.

**Method:** single-shot prompt, 200-word cap, one focus: find the ONE thing most likely to be wrong.

**Why single-shot:** interactive loops turn into synthetic consensus. Single shot forces independence.

### Why the pair is non-negotiable

- Hallucination Gate without Spec Gate: fixes are real but might not match the spec.
- Spec Gate without Hallucination Gate: verifies against specs that reference invented files.
- Specialists instead of the pair: specialists have domain expertise but not the discipline of Read/Grep spot-checking or 3-source cross-reference. Both blind spots remain.

### 2-iteration gate for high-stakes waves

Standard flow is single-pass. For auth, payments, data integrity, and anything touching user money:
1. Run the gate
2. If first pass returns BLOCK with >2 medium+ findings → produce v2 plan addressing findings
3. Run a second gate pass

Catching a Critical finding pre-impl costs minutes. Catching it post-deploy is a security incident. The 2-iteration gate is the correct pattern, not overhead.

### Pair dynamics — blind-spot matrix

| Dimension | Hallucination Gate | Spec Gate |
|---|---|---|
| Primary catch | Invented facts, bad strategic framing | Spec drift, contract mismatch |
| Scope | Does the plan match *reality*? | Does the plan match the *spec*? |
| Stage 3 specialty | Antipattern red-team, load-bearing-claim verification | Cross-reference 3 sources of truth |
| Stage 7 specialty | "Did it ACTUALLY work end-to-end?" | "Does deployed state match spec?" |
| Tone | Blunt, evidence-first | Precise, quote-heavy |
| Read-only? | Yes | Yes |

Both required. Different blind spots.

---

## 8. Sub-Agents — The Dual-Document System

This is the single most important pattern for agentic quality compounding.

### The core separation

Every sub-agent archetype has two files in `command-center/`:

1. **`Sub-agent Instructions/<archetype>-instructions.md`** — second-person positive directives. Injected as the FIRST directive in every spawn prompt.
2. **`Sub-agent Observations/<archetype>-observations.md`** — orchestrator-only behavioral memory. Written at Stage 9, read at Stage 10, **never** injected into any prompt.

### Why they MUST be separate

- **If observations leaked into prompts:** agents would start gaming their own retros. They'd see "you caught X last wave" and perform for the observer instead of doing the work.
- **If instructions included raw observations:** directives would become diffuse, anecdotal, and unbounded. Rules get lost in war stories.
- **If there was only one file:** every retro bloats the instruction set; cap discipline is impossible; selection is impossible.

Separating them enforces a **promotion pipeline**: observations are raw; instructions are distilled. A pattern must survive filtering to become an instruction.

### Instruction file schema

**Read at:** every sub-agent spawn (Stage 1, 2, 3, 4, 6, 7, 9, 10 — any stage that spawns this agent).

**Write at:** Stage 10 ONLY. By the converter agent (Hallucination Gate archetype). Cap: 3 changes/agent/wave.

**Schema:**

```markdown
# <archetype> — instructions

<One-sentence mission statement.>

## <Primary capability>
- <Positive directive 1 — what TO DO>
- <Positive directive 2>
- <Positive directive 3>

## <Secondary capability>
- <Positive directive>
- <Positive directive>

## Output format
```markdown
# <archetype> — <output-type>
**Verdict:** <enum values>
## <section>
## <section>
```

<Optional: 2–4 promoted patterns from recent waves, each marked with origin:>
<!-- promoted from observations Wave <N> -->

## Do NOT
- <anti-directive>
- <anti-directive>

## Tone
<Short, direct tone guidance.>
```

**Style rules:**
- Second person ("spot-check 3–5 claims" NOT "spot-checks 3–5 claims")
- Positive ("do X") not negative-first ("don't do Y" goes in a `Do NOT` section)
- Minimize tactical references (hashes, PRs, wave IDs) — they rot
- Symbol/method names beat line numbers (line numbers rot instantly)
- Mark promoted lines with `<!-- promoted from observations Wave <N> -->` — audit trail
- Aggressive compaction: bullets over prose, one page over three

**Example (abstracted):**

```markdown
# hallucination-gate — instructions

Pre-implementation sanity gate + post-test reality check. Find what's
genuinely wrong, surface bluntly, approve cleanly.

## Pre-implementation gate
- Spot-check 3–5 load-bearing claims (paths, line#, function existence) via Read/Grep
- Verify each prior block addressed
- Verify sub-agent partitioning: zero file collisions
- Check for hidden assumptions (invented helpers, non-existent fields)
- Check for scope creep

## Strategic correctness check (MANDATORY)
Before APPROVE: if wave ships as planned, does user's original problem go
away — or only its symptom?
1. Read Stage 1 outputs
2. Read Antipatterns Catalog
3. For each fix, match against antipatterns
4. Match → BLOCK with antipattern name + evidence
5. Stage 1 cause → plan must address or document why symptom-only fix acceptable

## Post-test reality check
- Verify workflow works end-to-end on FINAL deploy, not just tester verdicts
- Surface buried findings ("minor", "side note") — often most valuable
- Require network-tab evidence for fetch fixes. 404-silenced zero-state = FAIL
- Apply downstream test to "minor" findings: recur/damage other flows?

## Output format
```markdown
# hallucination-gate — review
**Verdict:** APPROVE / APPROVE WITH NOTES / BLOCK
## Top-line judgment
## Per-fix verification (table)
## Buried findings (if any)
## Required changes before spawn
```

Read-only: detect, don't code.

## Deployment-gap detection (Stage 7)
Before live probes, verify service runs post-merge code. If uptime >300s
post-merge or deploy predates merge → BLOCK until redeploy. <!-- promoted from observations Wave <N> -->

## Do NOT
- Write source code outside the Sub-agent Instructions directory (exception:
  Stage 10 instruction converter carve-out)
- Compact instructions (separate compactor role)
- Read observation files outside Stage 10
```

### Observations file schema

**Read at:** Stage 10 ONLY. By the converter agent.
**Write at:** Stage 9 ONLY. By the knowledge-synthesizer archetype.
**NEVER:** injected into any sub-agent spawn prompt. Enforced by header.

**Schema:**

```markdown
# <archetype> — orchestrator observations

**Orchestrator-only. Never inject into the agent's prompt.**

## Behavioral patterns
<Steady-state observations — no specific wave. e.g., "highest signal of any
review agent; reliably catches X; sometimes hedges on Y.">

## How to compensate when prompting
<Prompt-shaping tricks that work for this archetype.>

## <Standing recommendation sections>
<e.g., "Defer to her judgment on process changes">
<e.g., "Root-cause depth prompt cue">

## Wave <N> (<date>)

### <Short pattern name>
**Observed:** <what happened>
**Context:** <what situation>
**Proposed compensation:** <orchestrator-side prompt shaping | promote to
instructions | document in rules>

### <next pattern from same wave>
...

## Wave <N+1> (<date>)
...
```

**Style rules:**
- Start with the header declaring orchestrator-only (this is load-bearing — it deters accidental prompt injection)
- Per-wave subsections with the wave identifier
- Every entry names a `Proposed compensation` (what the orchestrator should DO about it)
- No directives to the agent — this file never reaches the agent

**Example (abstracted):**

```markdown
# hallucination-gate — orchestrator observations

**Orchestrator-only. Never inject into the agent's prompt.**

## Behavioral patterns
Highest signal of any review agent. Reliably catches hallucinated file paths,
optimistic test verdicts hiding partial failures, buried findings, scope creep.

Sometimes hedges on things that are actually fine — cross-reference warnings
with hard evidence before treating them as blockers. Process recommendations
are reliably correct — listen to them.

## How to compensate when prompting
- Give SPECIFIC things to verify, not vague "review this plan" prompts
- For pre-impl gates, list prior block reasons explicitly so she can verify each
- For post-test reality checks: "did the workflow ACTUALLY work end-to-end on
  the FINAL deploy?" — this framing beats "are the verdicts reasonable?"
- Explicitly invite clean approvals: "do not invent objections if everything
  is fine"

## Wave <N> (<date>)

### Pre-impl grep verification prevents false "OK" on load-bearing claims
**Observed:** Verified 5 specific structural pre-conditions against actual
code before approving. All five verified correctly.
**Context:** Stage 3 pre-impl gate for auth migration wave.
**Proposed compensation:** orchestrator-side prompt shaping — always give
3–5 explicit structural claims to grep-verify.
```

### The Promotion Pipeline (Stage 9 → Stage 10)

```
Wave closes (Stage 8)
        │
        ▼
Stage 9 — Knowledge Synthesizer writes fresh observations
        │
        ▼
Stage 9b — Compactor applies rolling-window trim
        │       - drop entries promoted in prior waves
        │       - trim stale entries unpromoted ≥5 waves
        │       - preserve fresh + pending promotion candidates
        ▼
Stage 10 — Converter reads observations + current instructions
        │   Filter brutally: most patterns NOT load-bearing.
        │   Cap: 3/agent/wave. Zero-promotion acceptable.
        │   Writes promoted patterns as positive directives.
        ▼
Stage 10b — Compactor aggressively trims instruction files
        │   War stories out. Prose to bullets.
        │   Preserve every rule, trigger, load-bearing example.
        ▼
Orchestrator reviews diff → commit
        │
        ▼
(Next wave's agents read updated instructions)
```

### The Stage 10 writing carve-out

The converter (Hallucination Gate archetype) is normally read-only. At Stage 10, it has a narrow writing carve-out: it MAY write to `command-center/Sub-agent Instructions/<agent>-instructions.md`. Nothing else. No code, no tests, no design files.

This carve-out is the ONLY time a review agent writes outside its own reports.

### Agent archetypes to seed

You don't need 140 sub-agents on day one. Start with ~8–10 core archetypes that cover the full loop, then add specialists as scope hits them.

**Core roster (seed on day one):**

| Archetype | Stage | Role |
|---|---|---|
| **hallucination-gate** (a.k.a. `karen`) | 3, 7, 10 | Pre-impl spot-check + post-test reality + Stage 10 instruction converter |
| **spec-gate** (a.k.a. `jenny`) | 3, 7 | Cross-reference 3 sources of truth (master plan / wave plan / implementation) |
| **problem-framer** | 1 | Symptom-vs-cause + antipatterns red-team |
| **ceo-reviewer** (a.k.a. strategic-reviewer) | 1, periodic | Worth-doing-now lens; `/plan-ceo-review` periodic driver |
| **Explore** | 0, 2 | Codebase reconnaissance, fast multi-file search |
| **backend-developer** | 4 | Server/API implementer |
| **frontend-developer** | 4 | UI/component implementer |
| **ui-comprehensive-tester** | 6 | Functional tester, one spawn per persona |
| **knowledge-synthesizer** | 9 | Writes observations files from wave evidence |
| **technical-writer** | 9, 10 | Compacts long observations + rewrites instructions on Stage 10B |

**Specialists (add when scope demands):**

| Archetype | Typical trigger | Role |
|---|---|---|
| **architect-reviewer** | Auth, payments, any "what SHOULD exist" question | Counterpart to security-engineer; pairs at Stage 3 |
| **security-engineer** | Auth, cookies, CSRF, session mgmt, money movement | `/cso`-style review; "what DOES exist" check |
| **refactoring-specialist** | Symbol-swap waves, large rename/remove waves | Scope sweep + partition proposal |
| **ultrathink-debugger** | 2+ failed fix attempts (Iron Law escalation) | Deep root-cause investigation |
| **websocket-engineer** | Realtime features, long-lived connections | WS-specific implementation + testing |
| **database-administrator** | Schema migrations, index tuning, query plans | Migration safety + rollback review |
| **react-specialist** | React-heavy waves (hooks, suspense, state mgmt) | Framework-specific implementer |
| **nextjs-developer** | Route / middleware / RSC work | Next.js-specific implementer |
| **ui-designer** | New pages / significant visual design | Design spec + mockup alignment |
| **competitive-analyst** | Backlog replenishment, Tier 2→1 decisions | Competitor evidence lookup |
| **product-manager** | Spec authoring for new backlog tasks | Writes task specs against user outcomes |

**Seeding discipline.** Don't create a new archetype until you've spawned its equivalent twice ad-hoc. Premature specialization fragments the roster.

### Hard sub-agent workflow rules

From the `rules/sub-agent-workflow.md` file. These apply to every spawn.

1. **Verify planning-agent claims yourself.** Planning agents hallucinate file paths and "this already exists" claims. Before passing any plan to implementers, independently verify load-bearing claims with grep/Read.
2. **Root-cause before escalation. Iron Law: no fixes without root cause.** After 2 failed fix attempts, spawn a domain specialist rather than iterating with debug-by-deploy console.log PRs.
3. **Plan-authoring claims about layout/routing/component ownership must be Read/Grep-verified before publishing.**
4. **Display-format consistency is a plan-authoring responsibility.** If a plan specifies a display format, grep for other components rendering the same field first. If multiple formats exist, plan must unify or defer explicitly.
5. **Follow-up PRs must state "why the previous attempt failed."** Diagnosis makes the learning searchable in git history.
6. **Plan text must use symbol/method-name references, not line numbers.** Line numbers rot the moment any earlier code changes. Exception: line numbers are acceptable in reality-check and closeout documents describing already-shipped code.
7. **Architect + security reviewer are a complementary pair.** For auth/middleware/security-critical wiring: spawn architect first (what SHOULD exist), then security (what DOES exist).
8. **Pre-impl gate prompt specificity correlates with catch rate.** Enumerate 5–8 most load-bearing factual claims from the plan as verification targets rather than "review the plan."
9. **Success criteria for enum-valued features must enumerate every enum branch.** "Resolve a dispute end-to-end" is satisfiable by a single enum value while leaving others silently broken.
10. **Generate secrets yourself — do not wait for the user.** `openssl rand -base64 32`, `crypto.randomBytes(32).toString('base64')`, `uuidgen`. Exception: credentials issued by a provider (OAuth, API keys from consoles) must be requested.

---

## 9. Topic-Scoped Rules

Every rule file in `command-center/rules/` is read on-trigger (see CLAUDE.md trigger table). Keep each file focused on one topic. A rule file should be readable in <5 minutes.

**Rules registry (every file in `command-center/rules/` should appear here):**

| File | One-line purpose | Read when |
|---|---|---|
| `build-iterations/wave-loop.md` | Stage dispatcher | Wave start |
| `build-iterations/stages/stage-N-*.md` | Per-stage playbook | Entering that stage |
| `sub-agent-workflow.md` | 10 cross-cutting spawn rules | Before any sub-agent spawn |
| `decision-framework.md` | 3-tier product-decision autonomy | Any ambiguous product call |
| `security-waves.md` | High-stakes scope playbook | Auth/payments/session/money waves |
| `testing.md` + `test-writing-guidelines.md` | Risk tiers + test patterns | Any test work |
| `skill-use.md` | Slash-command integration map | Before invoking any skill |
| `backlog-planning.md` | Heavyweight replenishment ritual | Fewer than 3 pending backlog tasks |
| `housekeeping.md` | Close-out verification | Stage 8 shipped/unshipped audit |
| `external-sdks.md` | Third-party SDK pre-flight | Wave touches any SDK |
| `dev-principles.md` | Cross-wave distilled lessons | Every wave start (always) |

### `sub-agent-workflow.md`
The 10 cross-cutting rules above. Read BEFORE spawning any sub-agent.

### `decision-framework.md`
3-tier product-decision autonomy.

**Tier 1 — Auto-decide (do it + log in closeout):**
- Alignment with existing design (copy, label, layout drift from canonical frame)
- Missing standard features (password change, pause/unpause — things every competitor has)
- Routing consolidation (duplicate routes → redirect)
- Unambiguous bug fixes (500 from enum mismatch, trailing-zero price format)
- Seed data additions

**Tier 2 — Proceed + notify in morning file:**
- Component extractions / refactors
- New shared UI components implied but not discussed
- Routing pattern decisions (query param vs sub-path)
- Display-format unification
- Adding a standard settings tab when design frame exists

**Tier 3 — Must-ask (queue in `open-questions-morning.md`):**
- Removing existing features (prod may have evolved intentionally)
- External service integrations (payment, analytics, identity)
- Major UX direction changes
- Money/payments/security architecture
- Feature additions beyond the design
- Renaming user-facing concepts where semantics matter

**When in doubt:** spawn a competitive-analyst first. Competitor evidence often resolves Tier 2 into Tier 1.

### `security-waves.md` (or `high-stakes-waves.md`)
Read when the wave touches auth, payments, user creation, cookies, CSRF, rate limits, session management, or anything involving money movement.

Key rules:
- **Architect + Security reviewer are a pair**, not alternatives. Architect first (what SHOULD exist) → security second (what DOES exist).
- **2-iteration gate for security-critical scope.** If first gate BLOCKs with >2 medium+ findings → v2 plan + second gate. This is the correct pattern, not overhead.
- **Baseline security rules** (whatever your project's are): JWT expiry, password hashing cost, Zod/class-validator input discipline, CSRF model.
- **Credential least-privilege:** any elevated M2M credential must be paired with a scope-minimized reader sibling for non-mutating consumers.
- **Dual-path guard downgrade prevention:** when a guard bridges two auth systems during migration, the legacy path MUST return 401 once a user has been migrated.

### `testing.md` + `test-writing-guidelines.md`
Testing stack, risk tiers, when/what to test. Mandatory reading before any test work.

Sections to cover:
- Risk tiers (Tier 1: financial/auth; Tier 2: pre-beta; Tier 3: normal)
- Pre-flight checklist
- Code-level testing patterns (unit, integration, API)
- Live production E2E discipline
- Auto-updated rules log (append-only; discovered patterns)

### `skill-use.md`
See §10.

### `backlog-planning.md`
Heavyweight ritual for replenishing the backlog when fewer than 3 pending tasks remain at wave start. User-gated. Spawns competitive-analyst, ceo-reviewer, architect-reviewer in sequence. Output: 5–10 new backlog tasks with specs embedded.

### `housekeeping.md`
Per-wave close-out checklist. Verify before applying "mark as shipped" — 30-second grep prevents silent-failure of a never-shipped fix disappearing from the backlog.

### `external-sdks.md`
Pre-build checklist for any third-party SDK. Verify installed versions, actual method signatures, env var contracts. Do NOT plan against assumed API surfaces. Maintain an SDK registry: for each SDK your project uses, a short reference file in `SDK-Docs/<name>/<name>.md` with gotchas, version pins, and known issues.

**SDK doc auto-linking:** when writing or describing a task in the backlog, scan the task description for SDK/tool names. If a doc exists, add `SDK Reference: SDK-Docs/<name>/<name>.md` to task details. Implementers at Stage 4 have research at hand without rediscovering known gotchas.

### `dev-principles.md`
Cross-wave lessons distilled from periodic `/retro` skill runs. Read at the start of every wave. Short, high-signal. Topics: process improvements, anti-patterns discovered, tooling recommendations.

---

## 10. Skills / Slash Commands

Skills are reusable routines (often implemented as slash commands in Claude Code or equivalents). They plug into specific stages as verification / amplification layers.

### Always-on (every session)

| Skill | Purpose |
|---|---|
| `/careful` | PreToolUse hook — warns before destructive commands (`rm -rf`, `DROP TABLE`, force-push, `kubectl delete`). Invoke at wave start. Zero friction, high catch rate. |

### Per-wave mandatory

| Skill | Stage | Purpose | Duration |
|---|---|---|---|
| `/simplify` | 4 (after implementation) | Reduce complexity on touched files | ~1 min |
| `/review` | 4b (before push) | Contract-mismatch + null-access + production-bug check. **Not a style review.** | ~1 min |
| `/qa` | 5b (after deploy preview) | Headless browser smoke test on touched pages | ~2–3 min |

### Per-wave conditional (scope-driven)

**Plan-review skills (fire BEFORE Stage 3 gate):**

| Skill | When | Purpose |
|---|---|---|
| `/plan-eng-review` | Any non-trivial wave | Architecture, data flow, edge cases, test coverage, performance |
| `/plan-design-review` | UI-heavy waves | Designer's eye, 0–10 rating per dimension, explains what would make it a 10 |
| `/plan-devex-review` | API / CLI / SDK waves | Developer experience review. 3 modes: EXPANSION / POLISH / TRIAGE |
| `/autoplan` | Complex multi-dim | Runs CEO + eng + design + devex reviews sequentially — heaviest option |

**Security + visual:**

| Skill | When | Purpose |
|---|---|---|
| `/cso` | Auth, payments, security-critical endpoints | OWASP Top 10 + STRIDE. Complements architect + security pair. |
| `/design-review` | New pages / significant UI | Visual consistency on LIVE site |

**Deploy (optional):**

| Skill | When | Purpose |
|---|---|---|
| `/health` | Stage 4 pre-flight, large-diff | Typecheck + lint + tests + dead code → 0–10 score |
| `/ship` | Stage 4 formal-release | Full PR workflow: merge base, tests, diff review, version bump, CHANGELOG |
| `/land-and-deploy` | Stage 4 post-merge | Waits for CI + deploy, verifies production health via canary |

**Debugging:**

| Skill | When | Purpose |
|---|---|---|
| `/investigate` | Stage 7b, batch on Major/Critical | Systematic root-cause. **Iron Law: no fixes without root cause.** |

**Closeout:**

| Skill | Stage | Purpose |
|---|---|---|
| `/document-release` | 8 | Post-ship doc sync: README / ARCHITECTURE / CLAUDE.md / CHANGELOG |
| `/learn` | 9 | Persist project learnings across sessions — searchable, prunable, exportable |

### Periodic

| Skill | Cadence | Purpose |
|---|---|---|
| `/plan-ceo-review` | Every 3–5 waves | 4 modes: SCOPE EXPANSION / SELECTIVE / HOLD / REDUCTION. Prevents blind competitor-copying. |
| `/retro` | Every 5–6 waves | Engineering retrospective. Output → `dev-principles.md`. **Do NOT dump retro output into CLAUDE.md.** |

### Critical rules

- **`/qa` supplements the full test swarm but NEVER replaces it.** The swarm is the authoritative test mechanism with persona discipline, network-tab scanning, and regression coverage.
- **Plan-review skills supplement the baseline reviewer pair but NEVER replace them.** Plan-review skills catch architecture/UX/DX. Baseline reviewers catch hallucination/spec-drift.
- **`/ship` and `/land-and-deploy` are optional.** Manual `git commit` + PR workflow still works.

### Template: `rules/skill-use.md`

```markdown
# Skill Use

**Read BEFORE invoking any slash command / skill.**

## Always-on
| Skill | Purpose |
|---|---|
| `/careful` | Destructive-command guard. Invoke at wave start. |

## Per-wave mandatory
<Table per above>

## Per-wave conditional
<Table per above>

## Periodic
<Table per above>

## Critical rules
- `/qa` supplements but never replaces the full test swarm.
- Plan-review skills supplement but never replace the baseline reviewer pair.

## Not integrated
<List skills known to exist but not yet plumbed into this system, so agents
don't invent new integration points. Propose integration explicitly before
using.>
```

---

## 11. Backlog — Canonical Task Source

One place for all work. Specs embedded in the task itself. No loose floating docs.

### Choice of tool

Any backlog system works: TaskMaster (an LLM-integrated Markdown-backed tool), Linear, Jira, GitHub Issues. Pick one and make it canonical.

### The spec-embedding rule

The task's description field holds the full spec: requirements, success criteria, constraints, links to design frames, data schema excerpts, everything needed to plan the wave.

**Why:** if specs live in loose `working/*.md` files, they rot, duplicate, and drift. The backlog task is the only place the orchestrator can reliably find the spec.

### Task field schema

Whatever tool you pick, standardize these fields:

| Field | Purpose |
|---|---|
| `id` | Unique identifier |
| `title` | Short name |
| `description` | Full spec + requirements (spec lives here) |
| `status` | `backlog` / `planning` / `in_progress` / `done` / `blocked` |
| `priority` | `high` / `medium` / `low` |
| `dependencies` | Array of task IDs this depends on |
| `subtasks` | Child tasks |
| `tags` | Category tags |
| `metadata.wave` | Wave ID (filled at Stage 2) |
| `metadata.effort` | S/M/L estimate |
| `metadata.needsProductDecision` | Triggers Stage 0b |
| `metadata.highStakes` | Triggers security-waves.md + cross-model gate |

### Integration points with the wave loop

| Stage | Hook |
|---|---|
| 0 | `<tool> next` — identify task |
| 2 | Read task description for the spec |
| 4 | `<tool> set-status --id=N --status=in-progress` |
| 8 | `<tool> set-status --id=N --status=done` |
| 7b | For (c)/(d) triage items: `<tool> add-task --prompt="..." --tag=bugs` |
| 11 | `<tool> next` — pick next wave |

### Backlog replenishment ritual

When the backlog has fewer than 3 pending wave-sized items, run the `backlog-planning.md` ritual at wave start (BEFORE Stage 1):

1. Spawn competitive-analyst to benchmark 2–3 competitors on current gaps
2. Spawn strategic-reviewer in `/plan-ceo-review` mode to rank remaining scope
3. Spawn architect-reviewer to surface architectural debt worth addressing
4. Orchestrator consolidates and writes 5–10 new backlog tasks, each with a full spec embedded
5. User approves the new batch before proceeding

Heavyweight, user-gated. Do not run more often than every 10 waves.

---

## 12. The Antipatterns Catalog

A reusable asset embedded in `stage-1-problem-reframing.md`. Read at Stage 1 by the problem-framer, and **again at Stage 3 by the Hallucination Gate during the strategic-correctness check.**

10 antipatterns. Each has: name, example, smell test.

### 1. Symptom-as-problem
The problem statement describes what the user sees, not why. Solution targets the visible artifact, not the cause.

**Example:** "Images load after the page" → "delay the whole page until images load." Wrong direction. Right direction: why are images slow? unoptimized? uncached? CDN miss? Too large? Each has a different fix.

**Smell test:** Does the proposed fix make the symptom less visible without changing the underlying behavior?

### 2. Metric misalignment
Solution optimizes a metric the user doesn't actually care about.

**Example:** User wants fast page loads. Proposed fix prioritizes uniform rendering by hiding content until everything is ready. Uniformity ≠ speed. User experiences a slower page.

**Smell test:** Write the user's actual goal in one sentence. Does the solution's success metric match?

### 3. Band-aid over root cause
Defensive checks or null guards around a crash instead of fixing the invariant.

**Example:** Endpoint crashes when field is undefined → wrap in try/catch and return empty. Right direction: why is the field undefined? Fix the producer.

**Smell test:** Would a different caller reproduce the crash? If yes, the fix didn't address the root cause.

### 4. Workaround becomes feature
"We can't fix X, so let's add a toggle." The workaround ships as a permanent feature, growing tech debt.

**Example:** API is flaky → add "retry" toggle exposed to users. Users now manage infrastructure failures.

**Smell test:** Would a senior engineer be embarrassed to ship this as a user-facing feature?

### 5. Solving for the demo
Fix works in seed data but breaks at scale or in production edge cases.

**Example:** Volume discount works with 3 seed orders but fails when `orders.length > 100` because of an N+1 query.

**Smell test:** Has anyone verified this with production-shaped data, not test fixtures?

### 6. Default feature-flag
Shipping broken code behind a toggle instead of not shipping. Flag stays off for months.

**Example:** New checkout flow has issues → wrap in feature flag defaulting off.

**Smell test:** If we can't turn this on today, why are we merging it today?

### 7. Over-engineering for a one-off
Abstraction with no second caller.

**Example:** One admin dashboard needs a chart → build a generic `<Chart>` with 15 config props that will never be reused.

**Smell test:** Are there ≥2 current or near-term callers? If no, inline.

### 8. Trusting the claim
"X already exists" or "handled by Y" without verification. Later discovered false.

**Example:** Plan references "the existing notification system" but it doesn't support the new type.

**Smell test:** Did the Hallucination Gate grep/read the claimed component during Stage 3?

### 9. Optimizing the wrong layer
Frontend patching around backend bug, or database change instead of service-layer logic.

**Example:** Backend returns 404 for "no record yet" → frontend adds `.catch()` to silence. Right direction: backend should return 200 with null for expected-absence cases.

**Smell test:** If another client (mobile, admin) hits this API, will they have to reinvent the workaround?

### 10. Optimizing for the pull request, not the product
Fix makes the current PR smaller/faster to ship, but leaves the underlying problem.

**Example:** One specific 404 handler added, ignoring 7 other endpoints with the same issue.

**Smell test:** Are there similar issues elsewhere that this fix doesn't address? If yes, batch them or defer explicitly with a tracked task.

### How to extend

When `/retro` surfaces a new antipattern:
- Name (one short phrase)
- Example (concrete, from an actual wave)
- Smell test (one-question check)

If the catalog grows past ~15 entries, extract to standalone `rules/solution-antipatterns.md` and reference from the Stage 1 file.

---

## 13. Working-Dir Artifacts

Everything a wave produces lives in `working/` (or `Planning/`). Filename convention: `wave-<ID>-<artifact>.md`.

**Wave IDs** — pick a scheme and stick to it. Common schemes:
- Letter+number: `wave-g24`, `wave-g25`, `wave-g26` (sequential generations)
- Phase+wave: `wave-5a-w1`, `wave-5a-w2` (nested sub-waves)
- Date+slug: `wave-2026-04-18-auth-migration`

### Artifact index

Two naming conventions are viable. Pick one up-front and stick to it:

- **Archetype-named** (this guide's preferred convention) — names the *role* (`halluc-gate`, `spec-gate`). Survives agent-name changes.
- **Agent-named** (common in practice) — names the *agent* (`karen-realitycheck`, `jenny-realitycheck`, `ceo-review`). Easier when orchestrator prompts reference the agent by name.

Both are shown below. Use one consistently across a project.

| Artifact | Filename (archetype-named) | Filename (agent-named, example) | Stage produced | Read by |
|---|---|---|---|---|
| Problem reframing | `wave-<ID>-reframing.md` | `wave-<ID>-reframing.md` | 1 | 2, 3 (Hallucination Gate strategic check) |
| Strategic review | `wave-<ID>-strategic-review.md` | `wave-<ID>-ceo-review.md` | 1 | 2, 3 |
| Wave plan | `wave-<ID>-plan.md` | `wave-<ID>-plan.md` | 2 | 3, 4, 7, 8 |
| Hallucination gate review | `wave-<ID>-halluc-gate.md` | `wave-<ID>-karen-review.md` | 3 | 4 (before spawning), orchestrator |
| Spec gate review | `wave-<ID>-spec-gate.md` | `wave-<ID>-jenny-review.md` | 3 | 4, orchestrator |
| Cross-model gate | `wave-<ID>-xmodel-gate.md` | `wave-<ID>-gemini-review.md` | 3 (conditional) | orchestrator |
| Plan skill reviews | `wave-<ID>-plan-<skill>-review.md` | `wave-<ID>-plan-eng-review.md` | 2→3 | 3, orchestrator |
| Implementer reports | `wave-<ID>-impl-<agent>.md` | `wave-<ID>-impl-<agent>.md` | 4 | 7 (reality check) |
| Post-build review | `wave-<ID>-post-build.md` | `wave-<ID>-review-output.md` | 4b | 5 |
| Deploy verification | `wave-<ID>-deploy.md` | `wave-<ID>-deploy.md` | 5 | 5b, 6 |
| Post-deploy QA | `wave-<ID>-qa-smoke.md` | `wave-<ID>-qa-smoke.md` | 5b | 6, 7 |
| Test reports (folder) | `wave-<ID>-test-reports/tester-N.md` | `wave-<ID>-test-reports/tester-N.md` | 6 | 7, 7b |
| Layout verification | `wave-<ID>-layout-verification.md` | `wave-<ID>-layout-verification.md` | 6b (conditional) | 7 |
| Hallucination reality check | `wave-<ID>-halluc-realitycheck.md` | `wave-<ID>-karen-realitycheck.md` | 7 | 7b, 8 |
| Spec reality check | `wave-<ID>-spec-realitycheck.md` | `wave-<ID>-jenny-realitycheck.md` | 7 | 7b, 8 |
| Triage output | `wave-<ID>-triage.md` | `wave-<ID>-triage.md` | 7b | 8 |
| Closeout | `wave-<ID>-closeout.md` | `wave-<ID>-closeout.md` | 8 | 9 (retro), next wave |
| Retro notes | `wave-<ID>-retro.md` | `wave-<ID>-retro.md` | 9 | 10, ongoing |

### Archiving

Every ~20 waves, move old wave artifacts from `working/` to `working/archive/<phase>/` to keep the hot working dir scannable. Archives remain accessible for historical research but don't clutter day-to-day operations.

---

## 14. Always-On Invariants

Eleven invariants apply every turn, every stage, every wave. Violations immediately compound — fixing any one of them retroactively is much more expensive than enforcing on day one.

1. **Follow the canonical wave loop — at all times.** Every wave, every stage, every time. Before entering any stage, read its file. Never invent, skip, or reorder stages.

2. **Never commit secrets.** `.env`, credentials, API keys, tokens — in env-var management systems only.

3. **Baseline reviewer pair on every Stage 3 gate.** Non-negotiable. Specialists layer on top; never substitute.

4. **Root-cause before escalation. Iron Law: no fixes without root cause.** After 2 failed fix attempts, spawn a domain expert. Never debug-by-deploy with `console.log` PRs.

5. **Never tear down shared MCP state mid-swarm.** Browser-automation MCPs, file-watchers, DB connection pools — closing them kills subsequent batch agents.

6. **Generate secrets yourself** — `openssl rand -base64 32`, `crypto.randomBytes`, `uuidgen`. Routine mechanical action. Never gate the autonomous loop on the user.

7. **Invoke destructive-command guard at wave start** (`/careful` or equivalent). Zero-friction catch for `rm -rf`, `DROP TABLE`, force-push, `git reset --hard`.

8. **Product specs live inside the backlog task description.** Embed the full spec. Backlog is the single source of truth for scope.

9. **Never shortcut wave-loop stages for time.** Wall-clock cost is not a valid reason. Only the explicit skip table in `wave-loop.md` justifies skipping.

10. **Observation files are Stage 9/10 pipeline only.** Never read during Stages 1–8. Never injected into any spawn prompt.

11. **Persistent brain is write-guarded.** `command-center/` is only written to at specific stages (9, 10) or on explicit rule changes. Plans, test reports, and wave artifacts go to `working/`.

---

## 15. Meta-Patterns

The system's deepest architectural patterns. If you understand these, you can adapt the system to any project.

### Pattern 1 — The Dual Loop (execution + knowledge)

Execution and knowledge are separate loops that share data. Execution ships code; knowledge ships improved agents. They don't block each other — a wave can ship even if its retro surfaces nothing promotable.

Without the knowledge loop: every wave rediscovers the same bugs.
Without the execution loop: you have a great playbook and no product.

### Pattern 2 — The Memory Cliff and the Promotion Pipeline

LLM agents don't retain cross-session learnings. After wave A, agent B starts fresh with no memory of wave A's lessons.

Dual-document pattern solves this:
- Wave A: knowledge-synthesizer captures behavior → Observations
- Wave boundary: converter promotes load-bearing patterns → Instructions
- Wave B: agent reads updated Instructions

Without this: every wave's retros evaporate. With it: patterns bootstrap quality improvements.

### Pattern 3 — Partitioning (zero collisions)

Parallel implementation only works if file scopes don't overlap. The plan must explicitly list partitioning. The Hallucination Gate verifies it at Stage 3.

Why:
- No merge conflicts
- Agents can run fully in parallel without coordination
- Failures are isolated — if one agent fails, others aren't affected
- Review is scoped: each report maps to its own file set

### Pattern 4 — The 3-Sources-of-Truth Check

Contract drift is one of the most expensive silent-failure modes. The Spec Gate compares:
1. Backend service method (actual shape)
2. Shared type (contract)
3. Frontend consumer (usage)

Any two out of three agreeing means nothing if the third is wrong. All three must agree. Mismatches = findings, quoted verbatim.

### Pattern 5 — Strategic vs. Tactical Gates

- **Strategic gate** (Hallucination Gate): does the plan solve the RIGHT problem? Antipattern match → BLOCK.
- **Tactical gate** (Spec Gate): is the plan implementation-ready given the current spec? Contract drift → finding.
- **Cross-model gate** (alt-family adversary): what's the ONE thing most likely wrong that both other models missed?

Three lenses. Two leaves blindspots.

### Pattern 6 — Iron Law: No Fixes Without Root Cause

After 2 failed fix attempts, spawn a domain specialist. The failure mode this prevents is "debug-by-deploy": PRs that add `console.log`, see what breaks, push again, repeat. Each round costs a deploy cycle and doesn't produce a root-cause diagnosis.

Domain specialists diagnose in seconds what self-iteration takes hours to find.

### Pattern 7 — Instruction Cap and Zero-Promotion

The 3-changes-per-agent-per-wave cap forces selection. Without it:
- Instructions become essays
- War stories dilute rules
- New behavior is impossible to see in the noise

**Zero promotion is acceptable.** Not every wave surfaces load-bearing patterns. Inventing promotions to "use the budget" pollutes instructions with low-signal entries.

### Pattern 8 — Port-Forward Re-Verification

When a plan or review is a revision (v2, v3), every clause carried from the prior version is TREATED AS UNVERIFIED. Ported text silently preserves removed clauses.

Practically: grep every "still true" claim against current code before carrying it. This is how rescue missions fail — by carrying the assumptions that caused the original failure.

### Pattern 9 — Deploy-Race Detection

CI green ≠ production running code. Before Stage 6, verify the deploy is real:
- Health endpoint returns the expected commit SHA
- Uptime < 300s (fresh deploy, not a pre-merge container)

Testing against stale code produces false PASS verdicts — the bug is still live.

### Pattern 10 — Fast-Fix Same-Wave

When testers find small bugs (<20 LOC) that are mechanical and local:
1. Fix in a follow-up PR BEFORE Stage 7
2. Reviewers see the fixed state, not the broken state
3. Gate before triage

Bugs <20 LOC don't warrant a new wave. Bugs >20 LOC or architectural do.

### Pattern 11 — Symbol References, Not Line Numbers

Line numbers rot the moment any earlier code is added or removed. A plan saying "line 47 of foo.ts" is wrong by the time Stage 4 runs.

Use symbol/method-name references: "in the `grace-window` branch of `refresh()`, after the `findById` call."

Exception: line numbers are acceptable in reality-check and closeout documents describing already-shipped code.

### Pattern 12 — Enumerate Every Enum Branch

"Resolve a dispute end-to-end with an audit trail" is satisfiable by a single enum value (e.g., `SELLER_WIN`) while leaving `BUYER_WIN`, `PARTIAL_REFUND`, `MUTUAL` untested and silently broken.

Success criteria for enum-valued features must name every enum value and specify the expected side-effect for each. If a value is out-of-scope for this wave, say so explicitly.

### Pattern 13 — End-User Simulation Discipline

Functional tests must interact like a real user:
- Click visible elements, type in visible fields
- Never jump with `page.goto()` after the initial entry point — use links
- Never call APIs directly via `page.evaluate(fetch(...))`
- Never inspect storage as a substitute for visible UI

If a flow only works via API call or address-bar jump, it's broken.

---

## 16. Adoption Path

You don't need to build the full system on day one. Here's a phased rollout.

### Week 1 — The Skeleton

Minimum viable loop. You can ship with this.

Create:
- `CLAUDE.md` (trigger table + always-on rules + conventions)
- `UserFlows.md` (or equivalent canonical inventory)
- `command-center/README.md`
- `command-center/rules/build-iterations/wave-loop.md` (dispatcher)
- `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` through `stage-11-next.md` (17 files)
- `command-center/rules/sub-agent-workflow.md`
- `working/` (empty dir; `.gitkeep`)
- Pick a backlog tool; seed with 5–10 initial tasks with specs embedded

Run one wave end-to-end manually. Note friction points.

### Week 2 — The Gate and the Dual-Doc

Add the invariants that make quality compound.

Create:
- `command-center/Sub-agent Instructions/` with:
  - `hallucination-gate-instructions.md` (Karen archetype)
  - `spec-gate-instructions.md` (Jenny archetype)
  - `problem-framer-instructions.md`
  - `strategic-reviewer-instructions.md` (CEO archetype)
  - `knowledge-synthesizer-instructions.md`
  - `technical-writer-instructions.md`
- `command-center/Sub-agent Observations/` with matching empty stubs

Wire into Stage 3 (gate), Stage 7 (reality check), Stage 9 (retro writer), Stage 10 (distillation).

Run 3–5 waves. Watch observations accumulate. Run Stage 10 distillation at least once.

### Week 3 — Skills + Rules

Add the verification layers and topic-scoped rules.

Create:
- `command-center/rules/skill-use.md`
- `command-center/rules/decision-framework.md`
- `command-center/rules/testing.md`
- `command-center/test-writing-guidelines.md`
- `command-center/rules/housekeeping.md`
- Skills integration: `/careful` always-on, `/simplify` + `/review` + `/qa` per-wave
- `command-center/rules/security-waves.md` once you hit a security wave
- `command-center/rules/external-sdks.md` once you hit an SDK wave

### Week 4 — Specialists + Refinement

Add specialist agents as needs emerge. `backend-developer`, `frontend-developer`, `ui-comprehensive-tester`, `websocket-engineer`, `database-administrator`, `architect-reviewer`, `security-engineer`, `refactoring-specialist`, `ui-designer`, `competitive-analyst`. Each gets an instruction file + observation file.

Run `/retro` for the first time. Distill into `command-center/dev-principles.md`.

### Ongoing cadence

- Every wave: full 17-stage loop.
- Every 3–5 waves: `/plan-ceo-review` for priority sanity check.
- Every 5–6 waves: `/retro` → append to `dev-principles.md`.
- Every 10 waves: consider `backlog-planning.md` ritual.
- Every 20 waves: archive old wave artifacts.

### What to resist

- **Don't split the trigger table across multiple files.** It lives at the top of CLAUDE.md, period.
- **Don't write "optional" stages.** Skip conditions go in the dispatcher; otherwise stages are mandatory.
- **Don't inline observations into instructions.** The promotion pipeline is the only path.
- **Don't scope-creep the gate.** Two baseline reviewers + conditional cross-model. No more no less.
- **Don't skip the Stage 9/10 pipeline for "this wave didn't teach us anything."** Zero-promotion Stage 10 is a valid outcome; skipping Stage 9 entirely means no observations, which compounds into observation-file decay.

---

## 17. Common Pitfalls

Seen often. Each has a named rule above, but they bear repeating.

1. **Injecting observations into agent prompts.** Breaks the retro signal. Agents start performing for the observer.

2. **Skipping gates for speed.** "It's a small wave, Karen isn't needed." Gates are cheapest when nothing goes wrong. Skipping makes the expensive case (hallucinated load-bearing claim) hit Stage 4.

3. **Trusting plan claims without grep.** Planning agents hallucinate. Hallucination Gate catches it at Stage 3 — but only if you actually run the gate.

4. **Inventing agent names.** Spawning "react-performance-specialist" when no instruction file exists means the agent runs with no directives. Symptom: agent does something unpredictable. Fix: only spawn agents with instruction files. If a new archetype is needed, create the file first (even as a minimal stub) THEN spawn.

5. **Committing `.env` or secrets.** Always-on rule. Easiest catch: a `.gitignore` rule + a pre-commit hook.

6. **Using line numbers in plans and instructions.** They rot. Use symbol/method-name references.

7. **Testing a flow via API call.** If it only works via API, users can't reach it. Use end-user simulation discipline.

8. **Closing shared MCP state mid-swarm.** Browser MCPs, DB pools. Don't close — let them persist.

9. **"Mark as shipped" without verifying.** 30-second grep. A never-shipped fix marked shipped disappears into the "done" bucket while the bug ships live.

10. **Debug-by-deploy.** 3+ PRs with `console.log` and no root-cause diagnosis = violation of the Iron Law. Spawn a domain specialist.

11. **Letting the instruction files grow without compaction.** Stage 10b compactor is mandatory. Prose creeps in; rules get lost.

12. **Running `/retro` output into CLAUDE.md.** Wrong destination. `dev-principles.md` is canonical.

13. **Creating loose `working/*.md` specs instead of embedding in the backlog task.** Specs drift. Backlog task description is the single source of truth.

14. **Skipping the post-write consistency sweep on plan revisions.** v2 plans often contradict themselves (task-message says "flip this wave"; §Non-goals says "defer flip"). Grep before handing to the gate.

15. **Accepting tester verdicts without reality-checking on final deploy.** "5 of 5 PASSED" can coexist with "the deploy never actually went out" or "the flow works nearby but not on the repro path." Stage 7 exists for this reason.

---

## 18. Appendix — Full Template Library

Everything you need to copy-paste to start. Each template is minimal-working; adapt freely.

### A.1 `CLAUDE.md`

See §4 for the full template.

### A.2 `command-center/README.md`

```markdown
# command-center/

Operational rules, long-term memory, and persistent artifacts. Loaded
on-demand via the CLAUDE.md trigger table.

## Subfolders

- **`rules/`** — topic-scoped orchestration rules, read on-trigger.
  - **`rules/build-iterations/`** — wave loop dispatcher + stage files.
- **`Sub-agent Instructions/`** — per-agent positive directives. Inject as
  FIRST directive in every spawn prompt.
- **`Sub-agent Observations/`** — wave-close behavioral retrospective.
  Written Stage 9, read Stage 10 ONLY. NOT read during Stages 1–8. Never
  injected into any prompt. After Stage 10, inert until next wave's Stage 9.
- **`artifacts/`** — persistent reference material (research, design, benchmarks).
- **`test-writing-guidelines.md`** — master testing reference.
- **`dev-principles.md`** — cross-wave lessons distilled by `/retro`.

## What does NOT live here

Wave-scoped deliverables (plans, test reports, closeouts) live in `working/`
at the repo root. `working/` is the hot working directory; `command-center/`
is the persistent brain.
```

### A.3 `rules/build-iterations/wave-loop.md`

See §5.

### A.4 Stage file (generic)

See §5's per-stage schema.

### A.5 Stage 1 — Problem Reframing

See §6, Stage 1 template.

### A.6 Stage 2 — Plan

See §6, Stage 2 template + wave-plan schema.

### A.7 Stage 3 — Gate

See §6, Stage 3 template.

### A.8 Stage 4 — Execute

See §6, Stage 4 template.

### A.9 Sub-agent Instructions — generic skeleton

```markdown
# <archetype> — instructions

<Mission statement in one sentence.>

## <primary capability>
- <positive directive>
- <positive directive>

## <secondary capability>
- <positive directive>

## Output format
```markdown
# <archetype> — <output type>
**Verdict:** <enum>
## <section>
## <section>
```

## Do NOT
- <anti-directive>
- <anti-directive>

## Tone
<2–3 sentences.>
```

### A.10 Sub-agent Observations — generic skeleton

```markdown
# <archetype> — orchestrator observations

**Orchestrator-only. Never inject into the agent's prompt.**

## Behavioral patterns
<Steady-state signal density, blind spots, reliability notes.>

## How to compensate when prompting
- <Prompt-shaping trick>
- <Prompt-shaping trick>

## <Standing recommendation>
<Named cue or standing rule for the orchestrator.>

## Wave <N> (<date>)

### <short pattern name>
**Observed:** <what happened>
**Context:** <what situation>
**Proposed compensation:** <orchestrator-side | promote to instructions | document in rules>
```

### A.11 Wave plan

See §6, Stage 2 template.

### A.12 Gate review outputs

See §7 (both Hallucination Gate and Spec Gate output formats).

### A.13 Closeout

```markdown
# Wave <N> Closeout

## Verdict
SHIP | SHIP WITH CONCERNS | BLOCK

## Shipped
| PR | Description | Status |
|----|-------------|--------|
| #NNN | <short> | merged + deployed |

## Opportunistic findings triage
| Finding | Severity | Classification | Notes |
|---------|----------|----------------|-------|
| <desc> | Major | next-wave (wave N+2) | backlog task: <id> |
| <desc> | Medium | fast-follow | fixed in follow-up PR |

## Housekeeping applied
- UserFlows.md rows updated: <list>
- Master plan: marked <items> shipped
- test-writing-guidelines §<section> appended with: <pattern>

## Plan-authoring defects to correct for next wave
- <specific defect + fix>
```

### A.14 `rules/sub-agent-workflow.md`

```markdown
# Sub-Agent Workflow

**Read BEFORE spawning any sub-agent.** Discipline is mandatory.

## Before every spawn
1. Read `Sub-agent Instructions/<agent-name>-instructions.md` and inject as
   FIRST directive in the spawn prompt.
2. If missing, create an empty stub. Only create files for agents that exist
   in the available agent list — never invent agent names.

**Observations are Stage 9/10 pipeline only.** Never read at spawn time. Never
inject into any spawn prompt.

## Sub-agent limitations
- Limited context windows. Bad at generalizing. Never offload broad open-ended work.
- Always give: specific well-scoped task, explicit file paths, clear deliverable format.
- Prefer parallel execution when scopes don't overlap.
- Never duplicate work. Each agent owns a distinct scope.
- Name agents descriptively.

## Cross-cutting rules
1. Verify planning-agent claims yourself (grep/Read load-bearing claims).
2. Root-cause before escalation. After 2 failed attempts, spawn a specialist.
3. Plan-authoring claims about layout/routing/component ownership must be
   Read/Grep-verified before publishing.
4. Display-format consistency is a plan-authoring responsibility.
5. Follow-up PRs must state "why the previous attempt failed."
6. Plan text uses symbol/method-name references, not line numbers.
7. Architect-reviewer + security-engineer are a complementary pair for
   security-critical wiring.
8. Pre-impl gate prompt specificity correlates with catch rate. Enumerate
   5–8 most load-bearing factual claims.
9. Success criteria for enum-valued features must enumerate every enum branch.
10. Generate secrets yourself — do not wait for the user.

## After each build iteration
Propose review/verification sub-agents + skills before launching.
```

### A.15 `rules/decision-framework.md`

See §9.

### A.16 `rules/housekeeping.md`

```markdown
# Per-wave Housekeeping

**Read BEFORE closing any wave.**

## Master plan housekeeping

At the close of every wave, update the master plan to mark shipped items as
complete. Stale scope entries cause re-implementation risk.

- Orchestrator owns the edit.
- **Verify before applying "mark as shipped."** Sub-agents propose based on
  the plan's status column, which may not reflect reality. 30-second grep
  prevents the worst silent failure:

> A never-shipped fix gets marked shipped, disappears from the backlog, and
> remains broken in production while the next wave treats it as done.

## Stage 8 update checklist

1. UserFlows.md — status column for affected routes, new routes added
2. test-writing-guidelines.md §14 — new patterns (append-only)
3. Master plan — mark shipped items complete (per verification rule)
4. working/wave-<N>-closeout.md — verdict, shipped fixes, triage, housekeeping,
   plan-authoring defects

Sub-agent Instructions and Observations are NOT updated here — Stages 9 and 10.

## Wave closeout document structure
<See Appendix A.13.>
```

### A.17 `rules/skill-use.md`

See §10 template.

---

## Closing note

This system is a **scaffold**, not a cage. Every rule in it exists because its absence caused a specific, expensive failure. Adopt the scaffold as-is, run 10 waves, then start editing. The parts that don't earn their keep in your domain will become obvious.

Two principles survive every domain and every rewrite:

1. **Separate persistent memory from ephemeral work.** `command-center/` vs. `working/`.
2. **Make the gate non-negotiable.** Two baseline reviewers, every wave, every time. Strategic vs. tactical. Different blind spots.

Everything else is mechanics around these two anchors.

Ship well.

