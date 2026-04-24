# Roadmap Refresh Ritual

On-demand full refresh of `command-center/product/ROADMAP.md`. Gathers fresh competitive intelligence + market trends + founder bets, applies a strategic challenge, then rewrites the roadmap — including archival of shipped/cancelled milestones and synchronization of TaskMaster metadata.

This is the **heavyweight** roadmap ritual. Typical duration: 60–90 minutes of agent work + founder checkpoint. Not run per-wave.

---

## 🔗 MANDATORY cross-references (apply at every step)

- **Roadmap schema, states, edit permissions:** `command-center/rules/roadmap-lifecycle.md`
- **Sub-agent spawn discipline:** `command-center/rules/sub-agent-workflow.md` + per-agent instructions under `command-center/Sub-agent Instructions/`
- **Competitive intelligence methodology:** `command-center/management/semi-assisted-mode.md` (§ Competitive intelligence) — reuse the same Playwright-live-browsing mandate as Stage 0b; do NOT regress to WebSearch-only research
- **Skill use (for `/plan-ceo-review`):** `command-center/rules/skill-use.md`
- **Canonical data:** `command-center/product/ROADMAP.md`, `command-center/product/FOUNDER-BETS.md`, `command-center/product/product-decisions.md`, `command-center/artifacts/competitive-benchmarks/`

---

## Scope

**This ritual does:** full re-evaluation of the roadmap. Refreshes competitive evidence, re-scores every active milestone, archives what shipped, kills what no longer makes sense, promotes H2 → H1 candidates, integrates new founder bets.

**This ritual does NOT:**
- Replenish the atomic wave backlog — that's `backlog-planning.md` (smaller ritual, consumes this one's output)
- Resolve Tier 3 product decisions — that's `daily-checkpoint.md`
- Walk the unassigned queue — that's Stage 0b per wave
- Fix trivial metadata drift — inline corrections are fine at any time

**Relationship to other rituals:**
```
roadmap-refresh-ritual          ← strategic (this file)
      │  outputs refreshed milestones
      ▼
backlog-planning                ← tactical: atomic tasks per milestone
      │  outputs wave-sized task list
      ▼
Stage 0b (per wave)             ← assignment: unassigned → milestone
      │  outputs Tier 3 queue
      ▼
daily-checkpoint                ← founder-facing: Tier 3 + notifications
```

---

## The ritual — 6 steps

### Step 1 — Gather inputs (parallel: 3 agent passes + founder review)

**1a. Competitive sweep (`ui-comprehensive-tester` × 3, parallel, Playwright).** Follow the same live-browsing mandate as `stage-0b-product-decisions.md`. Spawn one agent per competitor on dedicated Playwright instances:
- `playwright-3` → <competitor-1>
- `playwright-4` → <competitor-2>
- `playwright-5` → <competitor-3>

Scope covers: (a) every active milestone's feature area, (b) candidate themes in `FOUNDER-BETS.md`, (c) features referenced in unassigned tasks with `source: competitive`. Each agent MUST produce direct-observation evidence (screenshots + navigation notes) — no help-article summaries.

**Output:** refreshed `command-center/artifacts/competitive-benchmarks/<feature>.md` files + updated `command-center/artifacts/competitive-benchmarks/INDEX.md` freshness timestamps.

**1b. Trend-forward scan (`trend-analyst`, single agent).** Scope: project's sector as inferred from `command-center/product/FOUNDER-BETS.md` + active ROADMAP.md milestone themes, ~60–90 day window. Surface emerging patterns, regulatory shifts, platform moves, technology changes, and category consolidation relevant to that sector. READ `command-center/Sub-agent Instructions/trend-analyst-instructions.md` before spawning — the file defines methodology, source-selection rules, and output format. Output: `Planning/trend-scan-<YYYY-MM-DD>.md`.

**1c. Founder review of `FOUNDER-BETS.md`.** Founder updates the file with any new strategic bets they want on the table. This is the forward-thinking channel. Agents never edit this file — the orchestrator reads it and cites bets as milestone bet-source.

READ `command-center/Sub-agent Instructions/ui-comprehensive-tester-instructions.md` + `command-center/Sub-agent Instructions/competitive-analyst-instructions.md` + `command-center/Sub-agent Instructions/trend-analyst-instructions.md` before spawning.

---

### Step 2 — Integrity check (bi-directional validation)

Per `roadmap-lifecycle.md` § Reference format rules. Orchestrator runs both directions:

**Roadmap → TaskMaster:** for every milestone in ROADMAP.md, report task counts by status (`planned` / `in-progress` / `done` / `blocked`). Flag milestones with zero `in-progress` tasks that are marked `active` (likely stale status).

**TaskMaster → Roadmap:** for every task with `roadmapMilestone=X`, confirm milestone `X` exists with matching `TaskMaster tag`. Flag:
- Tasks pointing to milestones that have been renamed (anchor drift)
- Tasks pointing to milestones that no longer exist (orphaned tasks → revert to `unassigned`)
- Milestones with zero tasks (consider cancelling or demoting to backlog idea)

**Output:** `Planning/roadmap-integrity-<YYYY-MM-DD>.md` — a drift report. Fix mechanical drift inline (anchor updates, tag sync). Surface semantic drift (orphaned tasks, empty milestones) to the founder checkpoint at Step 4.

---

### Step 3 — Strategic challenge (`/plan-ceo-review`)

Invoke `/plan-ceo-review` on ROADMAP.md with the integrity report and fresh competitive/trend evidence in context. The skill challenges priorities, cuts scope, ranks by impact.

**For each active + planned milestone, CEO review produces one of:**
- `KEEP` — milestone stays as-is
- `RETHEME` — same scope, different framing (e.g., "Seller Trust Signals" → "Buyer Confidence Surface")
- `RESCOPE` — expand or contract
- `DEFER` — move to deferred state, revisit next refresh
- `KILL` — cancel; bet source no longer holds
- `PROMOTE` — move horizon forward (H2 → H1) if trust + capacity allow
- `DEMOTE` — move horizon back (H1 → H2) if evidence weakened

**CEO review also proposes NEW milestones** from: (a) fresh founder bets, (b) competitive gaps with differentiation value, (c) trend-driven opportunities.

**Output:** `Planning/roadmap-refresh-<YYYY-MM-DD>-ceo-review.md`. Never auto-apply CEO recommendations — they're proposals for Step 4.

---

### Step 4 — Founder checkpoint (mode-aware)

**Under `founder-review` / `semi-assisted` / `full-autonomy`:**
Orchestrator presents the CEO-review recommendations to the founder via `AskUserQuestion`, batched into one session. Include:

1. **Per-milestone disposition** — KEEP / RETHEME / RESCOPE / DEFER / KILL / PROMOTE / DEMOTE — with one-line CEO reasoning
2. **New milestone proposals** — each with horizon, bet-source, scope sketch, primary risk
3. **Semantic drift from Step 2** — orphaned tasks, empty milestones — founder decides disposition
4. **Vision / North Star changes** — if founder updated `FOUNDER-BETS.md`, confirm North Star in ROADMAP.md matches

Founder answers. Any override replaces the CEO recommendation.

**Under `danger-builder`:**
This checkpoint routes to **ceo-agent** instead of founder. Spawn ceo-agent with the full refresh packet (Step 2 competitive sweep + Step 3 CEO-review output). ceo-agent reads `ceo-bound.md` § 5 (pivot / roadmap-refresh / product-kill authority) — all default to unlimited; explicit restrictions bind. ceo-agent resolves all four bullets in one decision pass, appends entry to `Planning/ceo-digest-YYYY-MM-DD.md` with per-milestone disposition + reasoning, returns the approved refresh state to orchestrator.

Founder reviews the refresh retroactively via the daily digest. Overrides can be applied via the rollback path (session halt + manual revert of the refresh commit).

**Anti-pattern:** do NOT spawn implementers or modify any file before this checkpoint resolves (regardless of mode).

---

### Step 5 — Write outputs (atomic)

Once founder approves the disposition, the orchestrator executes all writes in one pass:

**5a. Update `command-center/product/ROADMAP.md`:**
- Apply per-milestone dispositions (KEEP unchanged, RETHEME renames, etc.)
- Add new approved milestones
- Move KILL → `cancelled` with reason; DEFER → `deferred` with reason
- Update `Last refresh` timestamp + `Last refresh trigger` line
- Finalize any `_TBD_` success metrics founder resolved

**5b. Archive shipped/cancelled:**
- Move `shipped` + `cancelled` milestone blocks to `command-center/product/roadmap-archive/<YYYY-QN>.md` (quarterly file, append if exists)
- Preserve the original block + add `**Final verdict:**` and `**Metric outcome:**` lines
- Remove from ROADMAP.md

**5c. Sync TaskMaster metadata:**
- Renamed milestones: update `roadmapMilestone` tag + `roadmapAnchor` on every affected task
- Cancelled milestones: tasks revert to `roadmapMilestone: "unassigned"` (or bulk-archive via `set-status cancelled` if the tasks themselves are no longer relevant — founder call at Step 4)
- Deferred milestones: keep metadata; tasks remain but will be skipped by Stage 0b's "assign to active" pass
- New milestones: no task changes at this step — backlog-planning ritual will populate atomic tasks

**5d. Append to `command-center/product/product-decisions.md`:**
- One entry per material refresh decision (new milestone, kill, promotion, North Star change)
- Follows the append-only log format

**5e. Competitive benchmarks freshness:**
- `command-center/artifacts/competitive-benchmarks/INDEX.md` reflects Step 1a updates

---

### Step 6 — Commit

Single commit containing all Step 5 outputs. Commit message template:

```
docs(roadmap): refresh ritual <YYYY-MM-DD> — <one-line summary>

- <disposition summary: N kept, N re-themed, N deferred, N cancelled, N new>
- <archive note: Q<N> archive updated>
- <TaskMaster sync note: X tasks reassigned, Y reverted to unassigned>

See: Planning/roadmap-refresh-<YYYY-MM-DD>-ceo-review.md
```

Do NOT commit mid-ritual. Atomicity matters — a partial refresh leaves the roadmap + TaskMaster in inconsistent states.

---

## Deliverables

Written at ritual close:
- **`command-center/product/ROADMAP.md`** — updated in place
- **`command-center/product/roadmap-archive/<YYYY-QN>.md`** — shipped/cancelled appended
- **`command-center/product/product-decisions.md`** — refresh decisions appended
- **`command-center/artifacts/competitive-benchmarks/`** — refreshed benchmarks + INDEX
- **`Planning/trend-scan-<YYYY-MM-DD>.md`** — trend-analyst output
- **`Planning/roadmap-integrity-<YYYY-MM-DD>.md`** — Step 2 drift report
- **`Planning/roadmap-refresh-<YYYY-MM-DD>-ceo-review.md`** — Step 3 CEO-review output
- **TaskMaster metadata** — synced per Step 5c
- **One git commit** — per Step 6

---

## Anti-patterns

### 1. Never skip the competitive sweep.
Why: milestones without fresh evidence drift toward vanity. If nothing new surfaces (scanned last week), reference existing benchmarks at Step 1a — but still validate staleness.

### 2. Never skip the integrity check.
Why: silent drift between ROADMAP.md and TaskMaster compounds across refreshes until the whole surface is untrustworthy.

### 3. Never auto-apply CEO recommendations.
Why: the Step 4 founder checkpoint is non-negotiable. CEO review produces proposals, not commitments.

### 4. Never commit piecemeal.
Why: atomic refresh. Partial commits leave ROADMAP.md + TaskMaster in inconsistent state.

### 5. Never inline material scope changes into an active milestone mid-refresh.
Why: even inside this ritual, material changes go through the Step 3 CEO challenge + Step 4 founder checkpoint — no bypass.

### 6. Never let new milestones enter with `_TBD_` success metrics.
Why: metrics must be finalized before `planned → active`. Refresh is the moment to finalize.

### 7. Never promote a competitive-analyst proposal to `active` in one refresh.
Why: new milestones enter `planned`. At least one subsequent wave (backlog-planning + Stage 0b) must bring them live before they're actionable.
