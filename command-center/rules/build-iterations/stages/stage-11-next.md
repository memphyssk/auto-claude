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

### STATUS handling (full-autonomy + danger-builder)

Stage 11 is the only stage that writes `command-center/management/STATUS` across a wave boundary. Stages 8–10 leave STATUS=`RUNNING`. Perform these steps in order at the end of Stage 11:

1. **Handoff cleanup.** If `command-center/management/handoff.md` exists AND the wave that just closed was the one it pointed at, delete it. Stale handoff artifacts cause the next HANDOFF tick to resume the wrong wave.

2. **Branch on the Step 2 result + context budget:**
   - **Task found + context_used < 75%** → begin wave N+1 Stage 0 in this same turn. STATUS stays `RUNNING`. Do NOT call `ScheduleWakeup`.
   - **Task found + context_used ≥ 75%** → write `command-center/management/handoff.md` pointing at wave N+1 Stage 0 (task ID, title, any pre-work notes — plan not yet authored). Set STATUS=`HANDOFF`. Commit the closeout + handoff. End turn. `ScheduleWakeup` 60s.
   - **No task executable without founder input, but pending tasks exist** (all blocked on founder input / Tier 3 / daily-checkpoint buckets non-empty after resolution attempt) → Set STATUS=`IDLE`. End turn. `ScheduleWakeup` 1800s.
   - **Zero tasks at all** (Step 5: "backlog empty, loop genuinely ended") → Set STATUS=`DONE`. End turn. Do NOT call `ScheduleWakeup`.
   - **Hard-stop fired during Stage 11** (e.g. destructive action or money commitment surfaced in Step 3's daily-checkpoint resolution) → under `full-autonomy`: Set STATUS=`BLOCKED`. End turn. `ScheduleWakeup` 3600s. Under `danger-builder`: route to ceo-agent per `danger-builder-mode.md` § Routing table; STATUS stays `RUNNING` once CEO decides.

See `command-center/management/full-autonomy-mode.md` § Tick behavior for the full STATUS contract. Under `danger-builder`, see also `command-center/management/danger-builder-mode.md` § Tick behavior — identical base plus kill-switch / founder-message / charter-destroyed halt checks.

## Deliverable
None — this stage transitions to the next wave.

## Exit criteria
- Current wave marked complete in TaskMaster
- Next wave scope identified (or loop ended)
- STATUS written correctly if running under full-autonomy (see above)

## Next
→ Return to `../wave-loop.md` → Stage 0 (new wave), OR end turn per STATUS branch above
