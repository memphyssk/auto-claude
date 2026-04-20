# Stage 8 — Closeout + Doc Updates

## Purpose
Update canonical docs to reflect what shipped. Produce the wave closeout artifact.

## Prerequisites
- Stage 7b triage complete
- READ `command-center/rules/housekeeping.md`

## Actions

1. Mark the task done in TaskMaster: `npx task-master set-status --id=<task-id> --status=done`
2. Update `command-center/artifacts/user-journey-map.md` (status column, new routes, guard changes)
3. Update `command-center/test-writing-principles.md` §14 (new patterns discovered)
4. Master plan housekeeping (mark shipped items complete)
4. Produce `Planning/wave-<N>-closeout.md`:
   - Verdict (SHIP / SHIP WITH CONCERNS / BLOCK)
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
- Closeout file written
- command-center/artifacts/user-journey-map.md updated for this wave's changes
- No stale plan items left unmarked
- Stage completion checklist in the wave plan updated through Stage 8

## Next
→ Return to `../wave-loop.md` → Stage 9
