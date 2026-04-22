# Stage 11 — Next Task

## Purpose
Close the current wave and pick the next task. This is the loop point — after this stage, execution returns to Stage 0 of a new wave.

## Prerequisites
- Stage 10 distillation complete (or explicitly skipped for the wave)
- Current wave closeout committed
- **Stage completion checklist in the wave plan is fully checked off (Stages 0–9).** If any stage is unchecked, STOP — go back and complete it before proceeding.

## Actions

1. **Verify Stage 8 TaskMaster sweep completed.** Read the `§TaskMaster sweep` ledger in `Planning/wave-<N>-closeout.md`. The primary task must already be `done` (Stage 8 step 1a), subtasks/fast-fixes/siblings/triage rows accounted for (Stage 8 steps 1b–1e). If the ledger is missing or primary task is not `done`, Stage 8 failed its sweep — complete the missing writes now, log a Stage 8 defect in the closeout, and flag for the next retro. Do NOT proceed to step 2 until TaskMaster reflects reality.
2. **Query TaskMaster for the next task**: `npx task-master next`
   - TaskMaster considers priority, dependencies, and readiness
   - If a specific task is recommended, that becomes the next wave scope
3. **Auto-fire daily-checkpoint if no actionable tasks remain.** If `task-master next` returns nothing (or only Tier 3-pending / founder-blocked items), query the three daily-checkpoint buckets:
   - Tier 3 pending (`metadata.needsProductDecision === true` AND `metadata.productTier === 3`)
   - Assigned-since-last-checkpoint (`metadata.assignedAt > .last-daily-checkpoint` timestamp)
   - Stayed-unassigned (`metadata.stage0bReviewed === true` AND `metadata.roadmapMilestone === "unassigned"`, not yet surfaced)

   If any bucket is non-empty, fire `command-center/rules/daily-checkpoint.md` BEFORE reporting "loop ended" to the founder. Resolution may unblock new actionable tasks — after resolution, re-run Step 2.

   If all buckets empty AND no actionable tasks: loop genuinely ended. Continue to Step 5.
4. **Also check secondary sources** (if TaskMaster backlog is low):
   - `intermed-bugs.md` deferred items
   - Competitive-analyst output (if <3 tasks remain in backlog)
5. **If backlog is empty**: report to founder that the iteration loop is complete. Ask for new direction.
6. **If a task is identified** — before proceeding to Stage 0 of the new wave, run the **roadmap health check:**
   - Count `planned` milestones in `command-center/product/ROADMAP.md`
   - If `<3` planned milestones: append a `proposal:refresh-ritual` entry to `Planning/pending.md` with the current planned count. Next daily checkpoint surfaces it. **Do NOT auto-fire the refresh ritual — propose only.**
   - Select the task as the next wave scope and proceed to Stage 0 regardless of health-check outcome

## Deliverable
None — this stage transitions to the next wave.

## Exit criteria
- Current wave marked complete in TaskMaster
- Next wave scope identified (or loop ended)

## Next
→ Return to `../wave-loop.md` → Stage 0 (new wave)
