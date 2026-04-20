# Backlog Planning — Replenish the Wave Queue

**Trigger:** backlog <3 wave-sized items. Runs every 3-5 waves, **not per-wave**.

---

## Scope — NOT a substitute for the refresh ritual

**This ritual replenishes atomic wave-sized tasks** under the existing milestone pipeline in `command-center/product/ROADMAP.md`. It produces 3-5 next waves of concrete TaskMaster tasks.

**This ritual is NOT a strategic roadmap refresh.** If the roadmap itself needs re-evaluation (new milestones, killed milestones, changed horizons, <3 `planned` milestones left), run `command-center/rules/roadmap-refresh-ritual.md` FIRST — then invoke this ritual to populate atomic tasks under the refreshed milestones.

Sequence when both are needed:

```
roadmap-refresh-ritual        (strategic, milestone-level)
      │
      ▼
backlog-planning              (tactical, task-level — this file)
      │
      ▼
Stage 0b per wave             (per-wave assignment)
```

**Pre-check at invocation:** count `planned` milestones in ROADMAP.md. If `<3`, STOP and propose the refresh ritual to the founder before proceeding here.

---

## 🔗 MANDATORY cross-references

These rules are NOT optional. They apply at every step of this ritual.

- **Step 1 spawns `competitive-analyst`**: READ `command-center/rules/sub-agent-workflow.md` + `command-center/Sub-agent Instructions/competitive-analyst-instructions.md` BEFORE spawning. Inject the instructions file as the FIRST directive in the prompt.
- **Step 2 invokes `/plan-ceo-review`**: READ `command-center/rules/skill-use.md` BEFORE invoking.
- **Competitive intelligence methodology**: cross-reference `command-center/rules/autonomous-mode.md` (competitive intelligence section) for competitor priority list, quick-vs-deep benchmark modes, and ethical guidelines.
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
| Effort estimate | S / M / L (wave-size; ~4-8 hours agent work) |
| Differentiation level | `us-only` / `matches-competitors` / `table-stakes-parity` |
| Sub-agents needed | Which specialists will do the work |
| Primary risk | What could derail this wave (technical / product / scope) |
| Success criteria outline | What "done" looks like (details in the wave plan) |

**Write to** `Planning/morning-backlog.md` (or current convention — a single file representing the live queue).

### Step 4 — User approval

Present the prioritized backlog for user approval **before** starting wave execution. Format:

```
## Proposed backlog (next N waves)
1. [feature] — [effort] — [differentiation] — [primary risk]
2. ...
Recommend starting with: [wave N] because [reason]
Shall I proceed?
```

**Do NOT spawn any wave-execution sub-agents until the user approves.** The backlog is a proposal, not a commitment. User may reorder, cut, or add items before approval.

---

## Anti-patterns

- **Do not skip Step 2 (`/plan-ceo-review`).** Without the strategic challenge, you will blindly copy competitors and ship features with no differentiation.
- **Do not present the backlog without differentiation levels.** If the user can't tell at a glance which items are us-only vs table-stakes, they can't make informed prioritization decisions.
- **Do not spawn implementers from the backlog file directly.** The backlog is a menu; the wave plan is the recipe. Always go through Stage 1 (Plan) of the wave loop after backlog approval.
