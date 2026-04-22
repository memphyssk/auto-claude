# Roadmap Lifecycle — Static Reference

This file is the **spec**; `command-center/product/ROADMAP.md` is the **data**. The refresh ritual enforces these rules.

---

## 🔗 MANDATORY cross-references

- **Refresh ritual:** `command-center/rules/roadmap-refresh-ritual.md`
- **Daily checkpoint:** `command-center/rules/daily-checkpoint.md`
- **Backlog replenishment:** `command-center/rules/backlog-planning.md`
- **Per-wave Stage 0b:** `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md`
- **Per-wave Stage 7b:** `command-center/rules/build-iterations/stages/stage-7b-triage.md`
- **3-tier autonomy:** `command-center/management/semi-assisted-mode.md`
- **Full-autonomy / BOARD routing:** `command-center/management/full-autonomy-mode.md`
- **Canonical data files:** `command-center/product/ROADMAP.md`, `command-center/product/FOUNDER-BETS.md`, `command-center/product/product-decisions.md`, `command-center/artifacts/competitive-benchmarks/`

---

## Milestone schema

Every milestone block in `ROADMAP.md` MUST include these fields in this order. Missing fields = malformed block; fails refresh-ritual validation.

### Required fields

| Field | Format | Notes |
|---|---|---|
| Heading | `### M<N> — <Theme Title>` | Sequential numbering. Renaming a theme keeps the number. |
| `**Horizon:**` | `H1` / `H2` / `H3` | Single horizon. Moving horizons = refresh-ritual action, not inline edit. |
| `**Status:**` | See "Milestone states" below | Inline-editable for `planned → active → shipped` only. |
| `**Target success metric:**` | Concrete, measurable, dated | `_TBD by founder_` acceptable while `planned`; MUST be finalized before `active`. |
| `**Bet source:**` | `Competitive` / `Differentiation` / `Founder-bet` / `Trend` | Cites the input channel that generated the milestone. |
| `**Why now:**` | 1–2 sentence rationale | Anchors horizon choice. Re-read at every refresh. |
| `**TaskMaster tag:**` | `m<N>-<kebab-slug>` | The execution bridge. Every atomic task carries this in metadata. |
| `**Scope surfaces:**` | Bullet list | UI surfaces / flows / features in scope. NOT task titles — keep abstract. |
| `**References:**` | Bullet list | Backlinks to `product-decisions.md`, `command-center/artifacts/user-journey-map.md`, `competitive-benchmarks/`. |

### Optional fields

- `**Successor:**` — forward pointer when this milestone seeds a future one (e.g., M3 → H3 tier system)
- `**Depends on:**` — backward pointer when this milestone requires another to ship first
- `**Deferred reason:**` — required when status flips to `deferred`
- `**Cancelled reason:**` — required when status flips to `cancelled`

### Slug conventions

- TaskMaster tag = `m<number>-<kebab-theme>` (e.g., `m1-seller-trust`, `m3-seller-retention`)
- **Number is permanent**; theme slug can change on rename (sync TaskMaster tag + anchor in one pass)
- Anchor in ROADMAP.md is derived from the heading: `### M1 — Seller Trust Signals` → `#m1--seller-trust-signals` (GitHub-style, em-dash becomes double hyphen)

---

## TaskMaster metadata schema

Every TaskMaster task MUST carry the fields below. Orchestrator enforces this at Stage 0b and Stage 2 (plan).

```json
{
  "metadata": {
    "roadmapMilestone": "m1-seller-trust",
    "roadmapAnchor": "command-center/product/ROADMAP.md#m1--seller-trust-signals",
    "successMetric": "buyer-to-purchase conversion +10% on trust-signal listings",
    "source": "competitive",
    "urgency": "next-wave",
    "needsProductDecision": false,
    "productDecision": "online dot = green when presence <5min",
    "productTier": 1,
    "competitiveEvidence": "<competitor-1> + G2G both show green dot; <competitor-3> uses timestamp"
  }
}
```

### Field rules

| Field | Values | Who writes |
|---|---|---|
| `roadmapMilestone` | `m<N>-<slug>` or `unassigned` | Stage 0b (default `unassigned` at creation) |
| `roadmapAnchor` | Path + kebab anchor | Stage 0b (must be kept in sync with heading) |
| `successMetric` | Free text; mirrors milestone metric | Stage 0b (copied from milestone) |
| `source` | `competitive` / `trend-analyst` / `founder-bet` / `user` / `stage-7b-triage` / `auto-split` / `backlog-presize-split` | Task author |
| `urgency` | `blocks` / `fast-follow` / `next-wave` / `backlog` | Stage 7b (triage) |
| `estimatedSize` | `S` / `M` / `L` / `XL` — applies the Stage 1 size rubric (files / primitives / LOC / Stage 4 context). `XL` is a flag, not a queue state — XL rows are split via pre-size protocol before entering the actionable queue. | Task author; re-validated at Stage 0b |
| `needsProductDecision` | boolean | Task author or Stage 0b |
| `productDecision`, `productTier`, `competitiveEvidence` | Set at Stage 0b product-decision resolution | Stage 0b |

**Key invariants:**
- `roadmapMilestone: "unassigned"` is a valid terminal state. Not a defect.
- `urgency` and `roadmapMilestone` are independent axes. A task can be `fast-follow` + `unassigned`, or `backlog` + `m2-seller-analytics`.
- `roadmapAnchor` MUST be updated whenever the milestone heading changes. Refresh-ritual audits this.

---

## Milestone states

```
          ┌─────────┐
          │ planned │──┐
          └────┬────┘  │ refresh-ritual only
     first task        ▼
     → in-progress  ┌──────────┐
          │         │cancelled │── archived at next refresh
          ▼         └──────────┘
     ┌─────────┐
     │ active  │── all tasks done ──► ┌──────────┐
     └────┬────┘                      │ shipped  │── archived at next refresh
          │                           └──────────┘
          │ refresh-ritual decision
          ▼
     ┌──────────┐
     │ deferred │── refresh-ritual revisit ──► back to planned or cancelled
     └──────────┘
```

### Transition rules

| From | To | Trigger | Authorized writer |
|---|---|---|---|
| (new) | `planned` | Refresh ritual creates milestone | Refresh ritual |
| `planned` | `active` | First task under tag → `in-progress` in TaskMaster | Orchestrator (Stage 4) |
| `active` | `shipped` | All tasks under tag → `done` | Orchestrator (Stage 8) |
| `active` | `deferred` | Refresh-ritual decision (CEO review or founder override) | Refresh ritual only |
| `planned` / `active` | `cancelled` | Refresh-ritual decision | Refresh ritual only |
| `deferred` | `planned` | Refresh-ritual revisit (renewed interest / market shift) | Refresh ritual only |
| `shipped` / `cancelled` | archive | Next refresh ritual after state change | Refresh ritual only |

**Inline edits allowed:** status walks `planned → active → shipped` (orchestrator), metric finalization (`_TBD_` → concrete), task-ID backlink sync.

**Inline edits NOT allowed:** add/remove/rename milestones, change horizon, material scope changes. These ALL go through the refresh ritual to gate against ad-hoc scope creep.

---

## The unassigned queue

Tasks with `roadmapMilestone: "unassigned"` live in TaskMaster only. **They are never listed in ROADMAP.md** — keeping the strategy file light is a hard rule.

### How tasks become unassigned

Every new task defaults to `unassigned`, whether created by:

- **Stage 7b triage** — bugs surfaced by Playwright swarm, reality check, 4xx scan
- **`competitive-analyst` proposals** — feature gaps discovered during competitive scans
- **`trend-analyst` surfacings** — market shifts that imply new feature directions
- **Founder ad-hoc additions** — ideas the user drops in TaskMaster directly
- **User feedback / support tickets** — if wired later, default unassigned too

**Exception:** if the orchestrator at Stage 4 discovers a bug that **blocks the current wave**, it becomes a same-wave fast-fix (per `wave-loop.md`). No queue touch.

### How unassigned is resolved

Stage 0b of every subsequent wave walks the unassigned queue and assigns what it can to existing milestones (see `stage-0b-product-decisions.md` for the algorithm). The daily checkpoint (`daily-checkpoint.md`) surfaces three buckets to the founder:

1. **Assigned this cycle** — FYI, reversible
2. **Stayed unassigned** — FYI, founder can override or leave
3. **Tier 3 decisions** — need founder answer

Tasks can stay `unassigned` indefinitely. Not every good idea maps to a current milestone — valid terminal state.

### Viewing the queue

- CLI: `npx task-master list` then filter `metadata.roadmapMilestone === "unassigned"` client-side
- Direct: grep `.taskmaster/tasks/tasks.json` for `"roadmapMilestone":\s*"unassigned"`

---

## Reference format rules

All cross-file references MUST resolve. Refresh ritual validates bi-directional integrity.

### From ROADMAP.md milestone → elsewhere

- **`product-decisions.md`:** quote entry date + title, e.g., `[2026-04-Q1] Seller online status + delivery badge + sort`
- **`command-center/artifacts/user-journey-map.md`:** quote flow name or route; never line numbers (lines rot)
- **`competitive-benchmarks/`:** full relative path to the `.md` file
- **`FOUNDER-BETS.md`:** named bet with anchor, e.g., `FOUNDER-BETS.md#bet-4-tier-gamification`

### From TaskMaster task → ROADMAP.md

- `roadmapAnchor` format: `command-center/product/ROADMAP.md#<kebab-anchor>`
- On milestone rename: update both `roadmapMilestone` tag AND `roadmapAnchor` on every affected task

### Bi-directional integrity check (refresh ritual)

- For every TaskMaster task with `roadmapMilestone: X` → confirm milestone `X` exists in ROADMAP.md with matching `TaskMaster tag`
- For every milestone in ROADMAP.md → report task counts by status (`planned` / `in-progress` / `done` / `blocked`)
- Any drift → surface in refresh ritual output; resolve before closing ritual

---

## Edit permissions

| Change type | Authorized writer | Location |
|---|---|---|
| Status transition `planned → active → shipped` | Orchestrator (Stage 4 / Stage 8) | ROADMAP.md inline |
| Task → milestone tag assignment | Stage 0b, Stage 2 (plan), or founder direct | TaskMaster metadata |
| Finalize `_TBD_` success metric | Refresh ritual OR founder (daily checkpoint) | ROADMAP.md inline |
| Milestone rename | Refresh ritual only | ROADMAP.md + sync ALL affected task metadata |
| Add new milestone | Refresh ritual (invoked via backlog-planning or direct founder call) | ROADMAP.md |
| Remove milestone | Refresh ritual only (state → `cancelled`, then archive at next refresh) | Archive move |
| Material scope change to active milestone | Refresh ritual only (`/plan-ceo-review` gate) | ROADMAP.md |
| Founder direct override | Any time | ROADMAP.md + log entry in `product-decisions.md` |

**Agents editing the roadmap outside these rules = plan defect flagged at Stage 7b triage.**

---

## Anti-patterns

1. **Do not list unassigned tasks in ROADMAP.md.** TaskMaster owns the queue surface.
2. **Do not inline material scope changes** into an active milestone. Use the refresh ritual.
3. **Do not create a milestone without a TaskMaster tag.** Every milestone needs the execution bridge.
4. **Do not partially rename.** If you rename the theme, update tag slug AND anchor AND every affected task's metadata in one pass.
5. **Do not mix themes.** One theme per milestone. If scope grows cross-theme, split (M3 → M3 + M3.1) at refresh.
6. **Do not edit `shipped` or archived milestones.** Preserve history; author a new milestone instead.
7. **Do not promote a `competitive-analyst` proposal straight to `active`.** Must pass through `planned` with `/plan-ceo-review` via refresh ritual.
8. **Do not skip `roadmapAnchor` updates on task metadata.** Stale anchors break the daily-checkpoint view.
9. **Do not treat `unassigned` as a backlog.** It's a queue staged for the next Stage 0b walk. The real backlog (planned milestones) lives in ROADMAP.md.

---

## Companion file hierarchy

```
command-center/product/
├── ROADMAP.md              ← this file's data surface
├── FOUNDER-BETS.md         ← strategic bets, founder voice
├── product-decisions.md    ← append-only decision log
└── roadmap-archive/
    └── <YYYY-QN>.md        ← shipped/cancelled milestones snapshotted at each refresh
```

Flow intent:

- **FOUNDER-BETS.md → ROADMAP.md** at refresh rituals (strategic bets graduate to milestones)
- **ROADMAP.md → product-decisions.md** as milestones commit (append decision entry per material change)
- **competitive-benchmarks/ ↔ ROADMAP.md** — benchmarks cite milestones; milestones cite benchmarks as bet-source evidence

---

## Related rules (quick index)

| Trigger | File |
|---|---|
| Start / invoke a refresh | `command-center/rules/roadmap-refresh-ritual.md` |
| Daily Tier-3 + assignment checkpoint | `command-center/rules/daily-checkpoint.md` |
| Backlog < 3 items | `command-center/rules/backlog-planning.md` |
| Stage 0b per-wave assignment | `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md` |
| Stage 7b per-wave triage | `command-center/rules/build-iterations/stages/stage-7b-triage.md` |
| Tier 1 / 2 / 3 autonomy | `command-center/management/semi-assisted-mode.md` |
| Full-autonomy / BOARD | `command-center/management/full-autonomy-mode.md` |
