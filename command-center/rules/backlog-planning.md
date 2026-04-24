# Backlog Planning — Replenish the Wave Queue

**Trigger:** backlog <3 wave-sized items. Runs every 3-5 waves, **not per-wave**.

---

## Scope

**Tactical, task-level.** Replenishes atomic wave-sized TaskMaster tasks under the existing milestone pipeline in `product/ROADMAP.md`. Produces 3-5 next waves of concrete tasks.

**NOT a strategic roadmap refresh.** If the roadmap itself needs re-evaluation (new/killed milestones, changed horizons, <3 `planned` milestones left) → run `rules/roadmap-refresh-ritual.md` FIRST, then this ritual to populate tasks under refreshed milestones.

Sequence: `roadmap-refresh-ritual` (strategic) → `backlog-planning` (tactical, this file) → Stage 0b (per-wave assignment).

**Pre-check:** count `planned` milestones. If <3 → STOP and propose the refresh ritual before proceeding.

---

## 🔗 MANDATORY cross-references

These rules are NOT optional. They apply at every step of this ritual.

- **Step 1 spawns `competitive-analyst`**: READ `command-center/rules/sub-agent-workflow.md` + `command-center/Sub-agent Instructions/competitive-analyst-instructions.md` BEFORE spawning. Inject the instructions file as the FIRST directive in the prompt.
- **Step 2 invokes `/plan-ceo-review`**: READ `command-center/rules/skill-use.md` BEFORE invoking.
- **Competitive intelligence methodology**: cross-reference `command-center/management/semi-assisted-mode.md` (competitive intelligence section) for competitor priority list, quick-vs-deep benchmark modes, and ethical guidelines.
- **Benchmark artifacts**: store in `command-center/artifacts/competitive-benchmarks/<feature-kebab-case>.md`. Files persist across conversations so the same question is never re-researched.

---

## When this ritual fires

- **Primary:** At Stage 1 of a new wave, if backlog has <3 prioritized wave-sized items.
- **Secondary:** User explicitly asks ("refresh the backlog", "what's next?", "run competitive research").
- **Proactive:** After a cluster of 3-5 waves ships and feels like a natural checkpoint — don't wait until empty.

**Do NOT run this per-wave.** It's a heavyweight ritual (~30-60 min of agent work + user review). Per-wave execution creates churn and prevents the current backlog from actually being executed.

---

## The 4-step ritual

### Step 1 — Competitive research (competitive-analyst)

Spawn `competitive-analyst` to scan <competitor-1>, <competitor-2>, <competitor-3> (plus <competitor-4> / <competitor-5> if relevant) for feature gaps.

**Output:** candidate feature list with:
- Feature name
- What competitors have it (and how they implement it)
- Effort estimate (S/M/L wave-size)
- Our current state (missing / partial / present-but-bad)
- Differentiation level — us-only or table-stakes parity?

**Store benchmarks in** `command-center/artifacts/competitive-benchmarks/<feature-kebab-case>.md` per file (so future waves don't re-research the same question).

### Step 2 — Strategic challenge (`/plan-ceo-review`)

Run `/plan-ceo-review` on the candidate list from Step 1. The skill challenges priorities, cuts scope, ranks by impact, and **prevents blind competitor-copying** — not every competitor feature is worth building; some are table-stakes parity, some are vanity, some are distracting.

### Step 3 — Prioritized backlog

Produce the next 3-5 waves, ordered and scoped. Each entry must include:

| Field | Notes |
|---|---|
| Feature name | — |
| `estimatedSize` | `S` / `M` / `L` / `XL` — apply the Stage 1 size rubric (files / primitives / LOC / Stage 4 context). XL = any of the four thresholds would trip. |
| Differentiation level | `us-only` / `matches-competitors` / `table-stakes-parity` |
| Sub-agents needed | Which specialists will do the work |
| Primary risk | What could derail this wave (technical / product / scope) |
| Success criteria outline | What "done" looks like (details in the wave plan) |

**Write to** `Planning/morning-backlog.md` (or current convention — a single file representing the live queue). Persist `estimatedSize` on the corresponding TaskMaster task metadata.

### Step 3.5 — Pre-size split for XL items

Any entry sized `XL` is split BEFORE presentation to founder — don't push monoliths through the backlog. For each XL item:
1. Apply the Stage 1 size rubric split protocol: name the slices (e.g., `m7a / m7b / m7c`), write a concrete first-slice scope that fits under all four thresholds, execution order, and sibling seed data per deferred slice.
2. Create sibling TaskMaster rows with `metadata.source: "backlog-presize-split"`, `metadata.urgency: "next-wave"` or `"backlog"`, `metadata.estimatedSize` per slice.
3. The first slice becomes the backlog entry; siblings land in TaskMaster deferred.

No XL entries reach the founder approval step (§Step 4). This kills monoliths at authorship rather than at Stage 1.

### Step 4 — Approval (mode-aware)

**Under `founder-review` / `semi-assisted` / `full-autonomy`:** present the prioritized backlog to the user for approval **before** starting wave execution. Format:

```
## Proposed backlog (next N waves)
1. [feature] — [effort] — [differentiation] — [primary risk]
2. ...
Recommend starting with: [wave N] because [reason]
Shall I proceed?
```

**Do NOT spawn any wave-execution sub-agents until the user approves.** The backlog is a proposal, not a commitment. User may reorder, cut, or add items before approval.

**Under `danger-builder`:** skip the user-approval step. The backlog proposal routes to **ceo-agent** which reads `ceo-bound.md` (no default restriction on backlog — § 5 applies if set), applies cognitive patterns (focus as subtraction: what shouldn't we do?), approves or reprioritizes the backlog, and appends the approved list to `Planning/ceo-digest-YYYY-MM-DD.md`. Orchestrator proceeds to wave execution same tick.

---

## Anti-patterns

### 1. Never skip Step 2 (`/plan-ceo-review`).
Why: without the strategic challenge you blindly copy competitors and ship features with no differentiation.

### 2. Never present the backlog without differentiation levels per item.
Why: if the user can't tell at a glance which items are us-only vs table-stakes, they can't prioritize informedly.

### 3. Never spawn implementers from the backlog file directly.
Why: the backlog is a menu; the wave plan is the recipe. Always route approved backlog items through Stage 1 (Plan) of the wave loop.
