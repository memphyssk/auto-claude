# Stage 3b — Design-Gap Resolution (conditional)

## Purpose
Resolve all design gaps BEFORE implementers spawn. Runs the Dx loop — brief → generate → dual-review → approve/iterate → canonicalize into `design/`. Stage 1 and Stage 2 flag gaps; Stage 3b consolidates and resolves them.

This stage absorbed the pre-uplift `design-gap-loop.md` side-loop. Design gaps are no longer addressed by ad-hoc re-entry from multiple stages — they are gated here, once, after the plan is approved but before execution.

## Skip conditions

Skip when ALL the following are true:
- Wave is backend-only / infra-only / doc-only / pure bug-fix with no UI surface
- Stage 1 reframing output has `design_gap_flag: false` (no UI gap identified)
- Stage 2 plan output has `design_gap_flag: false`

Fire when ANY of the following:
- Wave touches a new or modified UI route / component / visual surface
- Stage 1 flagged `design_gap_flag: true`
- Stage 2 flagged `design_gap_flag: true`
- Plan references a page/component/icon/flow NOT present in `design/`

## Prerequisites
- Stage 3 gate passed (Karen + Jenny APPROVE — plan is locked, scope is stable)
- READ `design/brief-template.md` (Dx brief contract)
- READ `design/review-gate.md` (dual-reviewer rubric)
- READ `command-center/management/mode-switching.md` (mode flag semantics) + `command-center/management/semi-assisted-mode.md` §2 (human-checkpoint skip logic) + `command-center/management/full-autonomy-mode.md` (BOARD routing for 3-cap escalation)

## Design source of truth

**<competitor-1>'s only canonical design source is `design/`:**
- `design/DESIGN-SYSTEM.md` — tokens (colors, typography, spacing, shadows, clip-paths, iconography)
- `design/*.html` — per-page mockups produced by `/aidesigner` and approved through this stage

Figma is deprecated for this project (see `feedback_figma_drift_policy` memory). Do NOT treat Figma as source when resolving design gaps.

---

## Actions

### Step 1 — Audit (consolidate flags + own grep)

Orchestrator builds the authoritative gap list by consolidating:
- Stage 1 flagged gaps (from `Planning/wave-<N>-reframing.md` `design_gap_flag` list)
- Stage 2 flagged gaps (from `Planning/wave-<N>-plan.md` `design_gap_flag` list)
- Own comprehensive audit: grep `design/` for every page/component/icon/flow the Stage 2 plan references; anything referenced but absent is a gap

Output: gap list with one-line scope per gap + Dx.0 brief stub placeholder.

**Zero gaps found:** stage exits immediately. Proceed to Stage 4.
**One or more gaps:** proceed to Step 2.

### Step 2 — Brief each gap (Dx.0)

For each gap, draft a structured brief using `design/brief-template.md`. Required citations:
- What page/element/icon/flow is needed + one-line purpose
- Route or component path (new or existing)
- Audience / user state (anon / buyer / seller / admin; empty / loaded / error)
- **Explicit DESIGN-SYSTEM.md references** — §1 colors, §4 clip-path, §7 shadows, §8 icons — every primitive the generated design must consume
- Responsive contract (1024 / 1280 / 1440)
- Interaction patterns + data shape from API
- Prior art — adjacent mockups in `design/` whose visual language to match
- Success criteria (the APPROVE checklist)
- Non-goals (explicitly out of scope)

Briefs committed to `Planning/wave-<N>-design-gap/<feature>-brief.md`.

### Step 3 — Generate (Dx.1)

Invoke `/aidesigner` skill-agent with brief + DESIGN-SYSTEM.md content. On refinement iterations, pass prior review feedback (`refine_design` delta, not full regenerate).

Output lands in staging: `design/staging/<feature>.html`. Committed so reviewers can load the file.

### Step 4 — Human checkpoint (pre-Dx.2)

**Skip condition:** if `Planning/.autonomous-session` flag exists with `mode: semi-assisted` or `mode: full-autonomy` (per `command-center/management/mode-switching.md`), skip this checkpoint. Log the skip in the wave closeout.

**When to invoke:** autonomous mode OFF AND the generated design meaningfully extends the visual language (new interaction pattern, never-before-seen component class). Skip for trivial additions (missing icon, color-variant of existing pattern).

**What happens:** show user the brief + generated staging design via `AskUserQuestion` with 3 options — proceed to dual-review / revise first / reject outright. User's call gates Step 5.

Keep it tight — one `AskUserQuestion`, 3 options.

### Step 5 — Dual review (Dx.2)

Two reviewers in parallel, fresh context, no awareness of each other's verdict:

1. **`/plan-design-review`** — per-dimension 0-10 scoring + "what would make this a 10" against staging HTML. Produces `Planning/wave-<N>-design-gap/<feature>-plan-design-review.md`.
2. **`/ui-ux-pro-max`** — requirement + UX best-practice match against brief's success criteria + DESIGN-SYSTEM.md primitives. Produces `Planning/wave-<N>-design-gap/<feature>-ui-ux-pro-max.md`.

Each returns exactly one of: **APPROVE** / **REVISE** / **REJECT** + concrete concerns cited against brief + DESIGN-SYSTEM.md.

_Note: if `/ckm:design` becomes available, swap in per `review-gate.md` — the dual-reviewer pattern is reviewer-agnostic._

### Step 6 — Decide (Dx.3, orchestrator)

| Outcome | Action |
|---|---|
| Both APPROVE | Canonicalize (Step 7) |
| Both APPROVE WITH REVISIONS | Aggregate revisions → `refine_design` → loop to Step 3 |
| Either REJECT | Aggregate feedback → `refine_design` → loop to Step 3 |
| Conflict (one APPROVE + one REJECT) | Orchestrator reads both reviews, picks stricter verdict. If unclear, escalate to user |

**Iteration cap: 3.** If Step 3 → Step 5 cycle runs 3 times without both reviewers approving, escalate to user with full history (all 3 attempts + 6 reviews + consolidated concerns). User makes the call.

### Step 7 — Canonicalize (Dx.4)

**On approval:**
1. `git mv design/staging/<feature>.html design/<feature>.html`
2. Commit: `docs(design): approve <feature> — Stage 3b wave-<N>`
3. If the design adds a new route / screen, update `command-center/artifacts/user-journey-map.md` with the new entry
4. Annotate the brief with approved design path + both reviewer verdicts

**On 3-cap escalation:**
1. Move all 3 staging attempts to `design/staging/_archive/wave-<N>-<feature>/`
2. Write consolidated concerns to `Planning/wave-<N>-design-gap/<feature>-escalation.md`
3. Mode-aware resolution:
   - **founder-review / semi-assisted:** escalate to user — defer the gap via `bug-design` tag OR pause wave per user's call
   - **full-autonomy:** spawn BOARD (decision-slug `stage3b-3cap-<feature>`, default 4+/7 threshold per `command-center/management/conflict-resolution.md`). BOARD picks among: (i) accept one of the 3 staged attempts despite reviewer concerns, (ii) defer to `bug-design` tag, (iii) pause wave (escalate back to founder). Append to `Planning/board-digest-<YYYY-MM-DD>.md`.

---

## Deliverables

- `Planning/wave-<N>-design-gap/*` artifacts for each gap (brief, both reviews, optional escalation)
- Approved mockups canonicalized in `design/` (no longer in `design/staging/`)
- `command-center/artifacts/user-journey-map.md` updated if new routes added
- One or more commits (staging + canonicalize)

## Exit criteria

- Every gap identified in Step 1 is either CANONICALIZED in `design/` OR deferred with explicit user decision via `bug-design` tag
- Zero remaining design blockers for Stage 4 implementers
- `design/staging/` contains no pending approvals for this wave (approvals moved, archived, or escalated)

## Next
→ Return to `../wave-loop.md` → Stage 4

---

## Stage 4 mid-execution escalation (fallback anti-pattern)

If a Stage 4 implementer hits a design gap that wasn't caught here, **Stage 3b failed its audit**. Emergency recovery:
1. Pause the implementer
2. Orchestrator re-enters Stage 3b for just that gap (Step 2 onward)
3. Log the gap in the wave closeout as a **Stage 3b defect**

**Frequency signal:** if Stage 4 design-gap escalations occur more than once per 10 waves, Stage 3b Step 1 audit needs tightening.

---

## TaskMaster tag for design bugs (non-blocking)

Design-gap findings surfaced by Stage 6b (layout) or Stage 7b (triage) that DO NOT block the current wave go in the **`bug-design` TaskMaster tag**, NOT `redesign`:

- `redesign` = follow-ups from the Task #25 frontend redesign batches (shipping issues, token cleanup, route 404s)
- `bug-design` = design-gap findings (missing mockups, visual inconsistencies, icon/component gaps)

These become input to future waves' Stage 3b when picked up.

Minimum task fields: `id`, `title`, `description`, `status`, `priority`, `dependencies`, `details`, `testStrategy`, `subtasks`.

---

## File layout per wave

```
Planning/wave-<N>-design-gap/
  <feature>-brief.md                    # Step 2
  <feature>-plan-design-review.md       # Step 5 reviewer A
  <feature>-ui-ux-pro-max.md            # Step 5 reviewer B
  <feature>-escalation.md               # only if 3-cap hit

design/staging/
  <feature>.html                         # Step 3 output, pre-approval

design/staging/_archive/wave-<N>-<feature>/  # only if 3-cap hit

design/<feature>.html                    # Step 7 canonicalized (the goal state)
```
