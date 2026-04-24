# Daily Checkpoint

Daily batch of founder-facing items: Tier 3 product decisions, Stage 0b assignments made since the last checkpoint, and tasks that stayed `unassigned` after the most recent Stage 0b walk. Single `AskUserQuestion` session. Keeps the founder in the loop without interrupting wave execution.

Lightweight by design — typical duration under 5 minutes if buckets are small.

---

## 🔗 MANDATORY cross-references

- **Roadmap schema (for any assignment changes):** `command-center/rules/roadmap-lifecycle.md`
- **3-tier autonomy rubric:** `command-center/management/semi-assisted-mode.md`
- **Full-autonomy BOARD routing:** `command-center/management/full-autonomy-mode.md` (under full-autonomy, BOARD resolves all three buckets; see Step 3 below)
- **Stage 0b (source of assignments + Tier 3 flags):** `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md`
- **Canonical data files:** `command-center/product/ROADMAP.md`, `command-center/product/product-decisions.md`, `.taskmaster/tasks/tasks.json`, `Planning/pending.md`

---

## Scope

**This ritual does:** batch 3 founder-facing surfaces into one session — Tier 3 decisions, assignments-for-review, stayed-unassigned-for-override. Writes founder decisions back to TaskMaster and `product-decisions.md`.

**This ritual does NOT:**
- Populate or restructure the roadmap — that's `roadmap-refresh-ritual.md`
- Replenish atomic backlog — that's `backlog-planning.md`
- Run Stage 0b assignment — that happens per-wave; this ritual consumes its output

**Relationship:** the daily checkpoint is the downstream consumer of Stage 0b. Stage 0b populates the buckets; the checkpoint resolves them.

```
Stage 0b (per wave)        ← populates buckets via metadata
      │
      ▼
daily-checkpoint           ← founder resolves (this file)
      │
      ▼
TaskMaster + product-decisions.md  ← final writeback
```

---

## Required TaskMaster metadata (written by Stage 0b / consumed here)

| Field | Written by | Purpose |
|---|---|---|
| `needsProductDecision` / `productTier` / `productRecommendation` / `productQuestion` / `competitiveEvidence` | Stage 0b (product-decision pipeline) | Feeds Tier 3 bucket |
| `assignedAt` (ISO timestamp) | Stage 0b on every milestone assignment | Feeds "assigned this cycle" bucket |
| `stage0bReviewed: true` + `roadmapMilestone: "unassigned"` | Stage 0b when a task couldn't be mapped | Feeds "stayed unassigned" bucket |
| `checkpointSurfacedAt` (ISO timestamp) | This ritual on any surfaced task | Prevents re-surfacing until state changes |

Without these fields the ritual cannot filter — Stage 0b MUST write them. See `stage-0b-product-decisions.md` for the authoring contract.

---

## The ritual — 4 steps

### Step 1 — Gather the 3 buckets

Orchestrator queries TaskMaster against `Planning/.last-daily-checkpoint` timestamp:

**1a. Tier 3 pending.** Tasks with `metadata.needsProductDecision === true` AND `metadata.productTier === 3`. Union with manually-added entries in `Planning/pending.md` (founder can drop questions there ad-hoc).

**1b. Assigned this cycle.** Tasks where `metadata.assignedAt > lastCheckpointAt` AND `metadata.roadmapMilestone !== "unassigned"`. These are Stage 0b decisions since the last checkpoint — surfaced for review, reversible.

**1c. Stayed unassigned.** Tasks with `metadata.stage0bReviewed === true` AND `metadata.roadmapMilestone === "unassigned"` AND (`metadata.checkpointSurfacedAt < lastCheckpointAt` OR unset). Excludes tasks already surfaced in a prior checkpoint — they re-appear only if state changes.

**Empty-bucket short-circuit:** if all three buckets are empty, report "nothing to surface today" and exit. No `AskUserQuestion` call. No timestamp write.

---

### Step 2 — Format for founder

Concise, scannable, one-line-per-item where possible. Template:

```
## Daily checkpoint — <YYYY-MM-DD>

### Tier 3 decisions (N)
- Task #<id> — <title>
  Question: <productQuestion>
  Recommendation: <productRecommendation>
  Why Tier 3: <money | security | core-UX | feature-removal>
  Evidence: <competitiveEvidence or "none">

### Assigned this cycle (N) — FYI, reversible
- Task #<id> — <title> → <milestone-tag> (<one-line Stage 0b reasoning>)

### Stayed unassigned (N) — override or leave
- Task #<id> — <title>
  Source: <competitive | trend-analyst | founder-bet | user | stage-7b-triage>
  Why no match: <one-line orchestrator note>
```

---

### Step 3 — Resolution (mode-aware)

Read active mode from `Planning/.autonomous-session` per `command-center/management/mode-switching.md`. Branch on mode:

**Under `founder-review` or `semi-assisted`** — AskUserQuestion batch.

One interactive session. For each Tier 3 item the recommendation is pre-filled; founder confirms, overrides, or defers. For assignments and unassigned, founder can override any item by task ID (e.g., "Move #57 to M2" / "Kill #94" / "Confirm all assignments").

**Batch-accept:** if the founder answers "approve all" with no overrides, every Tier 3 item adopts its recommendation, every assignment stands, every unassigned stays unassigned. Single answer closes the session.

**Skip:** founder can skip any bucket. Skipped items stay in their bucket for the next checkpoint.

**Under `full-autonomy`** — BOARD resolves all three buckets.

Per Tier 3 item (bucket 1a): spawn BOARD with decision-slug `checkpoint-tier3-<task-id>`, strict 6+/7 threshold. If 6+/7 met → apply and flip `needsProductDecision: false`. If threshold not met → leave in bucket (next cycle re-evaluates under possibly different mode).

Per assignment (bucket 1b): BOARD "confirm assignment" vote with default 4+/7 threshold. Most confirmations are low-stakes — ceo-reviewer + architect-reviewer + product-manager usually align. 4+ APPROVE → assignment stands. 4+ REJECT → revert `metadata.roadmapMilestone` to `"unassigned"` + record reasoning.

Per stayed-unassigned (bucket 1c): BOARD "map or leave" vote with default 4+/7 threshold. 4+ APPROVE with a named target milestone → apply assignment. Otherwise stays unassigned.

All BOARD decisions append to `Planning/board-digest-<YYYY-MM-DD>.md` grouped by bucket. Close splits and vetoes flagged at top of digest for founder review.

**Under `danger-builder`** — BOARD resolves the three buckets first (same thresholds and logic as full-autonomy). Any bucket item that BOARD can't resolve (threshold miss or HARD-STOP) routes to **ceo-agent**:

Per unresolved item: spawn ceo-agent per `Sub-agent Instructions/ceo-agent-instructions.md` with the BOARD vote file + bucket context. ceo-agent reads `ceo-bound.md` for any relevant restriction (§ 5 for strategic, § 2 for vendor/contract Tier 3 items, etc.). ceo-agent decides; entry appended to `Planning/ceo-digest-YYYY-MM-DD.md` grouped by bucket.

daily-checkpoint under `danger-builder` effectively never blocks — every item resolves within the same tick (BOARD if possible, ceo-agent as fallback). The checkpoint ritual completes autonomously and the results appear in the following day's digest for founder review.

---

### Step 4 — Apply and commit

Orchestrator writes the founder's decisions atomically:

**4a. Tier 3 resolutions:**
- `metadata.needsProductDecision` → `false`
- `metadata.productDecision` → founder's answer
- If material (touches money, security, vendor commitment, feature removal): append entry to `command-center/product/product-decisions.md`
- Remove resolved entries from `Planning/pending.md`

**4b. Assignment overrides:**
- Update `metadata.roadmapMilestone` + `metadata.roadmapAnchor` per founder's choice
- If overridden back to `unassigned`, add `metadata.overriddenAt: <timestamp>` so it won't be re-walked until state clearly changes

**4c. New assignments for stayed-unassigned:**
- Set `metadata.roadmapMilestone` + `metadata.roadmapAnchor` per founder's mapping
- Leave `stage0bReviewed: true` as-is

**4d. Surface marker:** every task that appeared in ANY bucket this session gets `metadata.checkpointSurfacedAt: <ISO-timestamp>` — prevents re-surfacing until state changes.

**4e. Update timestamp:** write `<ISO-timestamp>` to `Planning/.last-daily-checkpoint`.

**4f. Commit — single:**
```
chore(pm): daily checkpoint <YYYY-MM-DD>

- Tier 3: N resolved, M deferred
- Assignments: N confirmed, M overridden
- Unassigned: N mapped, M stayed
```

---

## Deliverables

- TaskMaster metadata updates (per Steps 4a–4d)
- `command-center/product/product-decisions.md` — append entries for material Tier 3 resolutions
- `Planning/.last-daily-checkpoint` — updated ISO timestamp
- `Planning/pending.md` — resolved entries removed
- One git commit

---

## Anti-patterns

### 1. Never surface the same task twice in one checkpoint.
Why: `checkpointSurfacedAt` is the guard; if a task re-appears, state changed materially and the re-surfacing is intentional.

### 2. Never Tier-3-escalate mid-wave.
Why: Stage 0b classifies and queues; this ritual resolves. Waves don't block waiting for Tier 3 — they ship on the recommendation.

### 3. Never auto-apply founder silence.
Why: skipped buckets stay in their buckets. Zero answers = zero writes. Applying defaults on silence destroys the audit chain.

### 4. Never author milestones at the checkpoint.
Why: new milestones come from the refresh ritual. The checkpoint overrides *assignments* (where a task lands), not the milestone set itself.

### 5. Never batch-apply material Tier 3 answers without individual `product-decisions.md` entries.
Why: each material Tier 3 answer gets its own decision-log entry for audit; batch writes destroy traceability.

### 6. Never skip the TaskMaster metadata fields.
Why: Stage 0b MUST write `assignedAt`, `stage0bReviewed`, and product-decision fields — without them the checkpoint cannot filter and becomes manual diffing.
