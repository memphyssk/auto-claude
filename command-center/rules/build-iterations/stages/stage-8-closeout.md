# Stage 8 — Closeout + Doc Updates

## Purpose
Update canonical docs to reflect what shipped. Produce the wave closeout artifact.

## Prerequisites
- Stage 7b triage complete
- READ `command-center/rules/housekeeping.md`

## Actions

### 1. TaskMaster writeback sweep (MANDATORY — not optional)

This is a full sweep of every TaskMaster row the wave touched, not a single-task update. Waves routinely modify 3-8 rows (primary + subtasks + same-wave fast-fixes + auto-split siblings + Stage 7b triage rows); missing any of these leaves the backlog in a stale state that poisons the next wave's Stage 0b queue walk.

Before moving to step 2, complete every sub-step below:

**1a. Primary wave task** — `npx task-master set-status --id=<primary-id> --status=done`. Append to task details (via `update-task`): shipped PR URL(s), final merge commit SHA, final LOC delta, any deviation from plan (what shipped differently from what was specified and why).

**1b. Subtasks under primary** — for each subtask, `npx task-master set-status --id=<subtask-id> --status=done` if shipped in this wave. Keep `pending` or `in-progress` for subtasks genuinely deferred — do NOT mark done prematurely.

**1c. Same-wave fast-fix tasks** — any TaskMaster row opened and resolved during Stage 7b routing this wave (typically (a) blocks-wave items + same-wave (b) fast-follows): `set-status done` on each with the fast-fix PR URL in details.

**1d. Auto-split siblings** — if Stage 1 emitted `RESCOPE-AUTO-SPLIT`, verify sibling TaskMaster rows exist for every deferred slice with correct `metadata.source: "auto-split"`, `metadata.urgency`, `metadata.estimatedSize`, `metadata.roadmapMilestone` (or `"unassigned"`). Create any missing rows now.

**1e. Opportunistic findings from Stage 7b** — verify (c) next-wave + (d) backlog rows were created with mandatory metadata (`roadmapMilestone: "unassigned"`, `source: "stage-7b-triage"`, `urgency`, `estimatedSize`, `createdAt`). Create any missing rows now.

**1f. Writeback ledger** — produce a short ledger at the bottom of `Planning/wave-<N>-closeout.md` §TaskMaster sweep listing every row modified: `<task-id> | <title> | <old status> → <new status> | <note>`. This is the audit surface Stage 11 verifies and future retros consult.

Sweep completion is a hard gate — every TaskMaster row touched by this wave must land in its correct state before step 2.

### 2. Doc updates

2. Update `command-center/artifacts/user-journey-map.md` (status column, new routes, guard changes)
3. Update `command-center/test-writing-principles.md` §14 (new patterns discovered)
4. Master plan housekeeping (mark shipped items complete)
4. Produce `Planning/wave-<N>-closeout.md`:
   - Verdict (SHIP / SHIP WITH CONCERNS / BLOCK)
   - Scope auto-split (if Stage 1 emitted `RESCOPE-AUTO-SPLIT`) — trigger threshold(s), original task, split slices, sibling TaskMaster IDs created
   - Shipped fixes table
   - Triage table from Stage 7b
   - Housekeeping applied
   - Plan-authoring defects to correct next wave
5. Optionally run `/document-release` for user-visible changes

### What NOT to update here
- Sub-agent Instructions → Stage 10
- Sub-agent Observations → Stage 9
- CLAUDE.md always-on rules → require explicit user approval

## Deliverable
- `Planning/wave-<N>-closeout.md`
- Updated `command-center/artifacts/user-journey-map.md`

## Exit criteria
- TaskMaster writeback sweep complete — every touched row in correct state + writeback ledger in closeout
- Closeout file written
- command-center/artifacts/user-journey-map.md updated for this wave's changes
- No stale plan items left unmarked
- Stage completion checklist in the wave plan updated through Stage 8

## Next
→ Return to `../wave-loop.md` → Stage 9
