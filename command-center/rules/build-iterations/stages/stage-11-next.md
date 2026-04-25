# Stage 11 — Next Wave

## Purpose
Close the current wave and pick the next wave (seed task + any task-group bundled into the wave's scope). This is the loop point — after this stage, execution returns to Stage 0 of the new wave. Stage 0 owns prior-work query against the picked wave's topic; Stage 0b owns roadmap-alignment + product-decision routing for the picked wave's tasks. Stage 11 picks the wave; Stages 0/0b consume it.

## Prerequisites
- Stage 10 distillation complete (or explicitly skipped for the wave)
- Current wave closeout committed
- **Stage completion checklist in the wave plan is fully checked off (Stages 0–9).** If any stage is unchecked, STOP — go back and complete it before proceeding.

## Actions

1. **Verify Stage 8 TaskMaster sweep completed.** Read the `§TaskMaster sweep` ledger in `Planning/wave-<N>-closeout.md`. The primary task must already be `done` (Stage 8 step 1a), subtasks/fast-fixes/siblings/triage rows accounted for (Stage 8 steps 1b–1e). If the ledger is missing or primary task is not `done`, Stage 8 failed its sweep — complete the missing writes now, log a Stage 8 defect in the closeout, and flag for the next retro. Do NOT proceed to step 2 until TaskMaster reflects reality.
2. **Pick the next wave.** Run `npx task-master next` — the returned task is the **wave's seed task** (TaskMaster considers priority, dependencies, and readiness). Then decide wave scope:
   - **Default scope = seed task alone.** Single-task waves are the norm.
   - **Bundle siblings only if all of:** seed has tightly-coupled siblings/sub-tasks/dependent successors that share the same surface AND bundling them does NOT trip Stage 1's RESCOPE-AUTO-SPLIT size rubric (>30 files / >30 primitives / >5K LOC / >250K Stage 4 context).
   - **If bundling would trip thresholds:** the wave is the seed task alone; siblings defer to subsequent waves.
   - The picked wave scope (seed task ID + any bundled task IDs) is what Stage 0 of wave N+1 consumes as its "wave topic."
3. **Auto-fire daily-checkpoint if no actionable wave can be picked.** If `task-master next` returns nothing (or only Tier 3-pending / founder-blocked items), query the three daily-checkpoint buckets:
   - Tier 3 pending (`metadata.needsProductDecision === true` AND `metadata.productTier === 3`)
   - Assigned-since-last-checkpoint (`metadata.assignedAt > .last-daily-checkpoint` timestamp)
   - Stayed-unassigned (`metadata.stage0bReviewed === true` AND `metadata.roadmapMilestone === "unassigned"`, not yet surfaced)

   If any bucket is non-empty, fire `command-center/rules/daily-checkpoint.md` BEFORE reporting "loop ended" to the founder. Resolution may unblock new actionable work — after resolution, re-run Step 2 to pick the next wave.

   If all buckets empty AND no wave can be picked: loop genuinely ended. Continue to Step 5.
4. **Also check secondary sources** (if TaskMaster backlog is low):
   - `intermed-bugs.md` deferred items
   - Competitive-analyst output (if <3 tasks remain in backlog)
5. **If backlog is empty**: report to founder that the iteration loop is complete. Ask for new direction.
6. **If a wave is picked** — before proceeding to Stage 0 of the new wave, run the **roadmap health check:**
   - Count `planned` milestones in `command-center/product/ROADMAP.md`
   - If `<3` planned milestones: append a `proposal:refresh-ritual` entry to `Planning/pending.md` with the current planned count. Next daily checkpoint surfaces it. **Do NOT auto-fire the refresh ritual — propose only.**
   - Proceed to wave N+1 Stage 0 with the picked wave scope (seed task ID + any bundled task IDs) regardless of health-check outcome

### STATUS handling (full-autonomy + danger-builder)

Stage 11 is the only stage that writes `command-center/management/STATUS` across a wave boundary. Stages 8–10 leave STATUS=`RUNNING`. Perform these steps in order at the end of Stage 11:

1. **Handoff cleanup.** If `command-center/management/handoff.md` exists AND the wave that just closed was the one it pointed at, delete it. Stale handoff artifacts cause the next HANDOFF tick to resume the wrong wave.

2. **Branch on the Step 2 result + context budget:**
   - **Wave picked + context_used < 75%** → begin wave N+1 Stage 0 in this same turn with the picked wave scope (seed task ID + any bundled task IDs). STATUS stays `RUNNING`. Do NOT call `ScheduleWakeup`.
   - **Wave picked + context_used ≥ 75%** → write `command-center/management/handoff.md` pointing at wave N+1 Stage 0: seed task ID + bundled task IDs (if any) + scope notes (plan not yet authored). Set STATUS=`HANDOFF`. Commit the closeout + handoff. End turn. `ScheduleWakeup` 60s.
   - **No wave pickable but pending blocked items exist** (all candidates blocked on founder input / Tier 3 / daily-checkpoint buckets non-empty after resolution attempt) → Set STATUS=`IDLE`. End turn. `ScheduleWakeup` 1800s.
   - **Zero work anywhere** (Step 5: "backlog empty, loop genuinely ended") → Set STATUS=`DONE`. End turn. Do NOT call `ScheduleWakeup`.
   - **Hard-stop fired during Stage 11** (e.g. destructive action or money commitment surfaced in Step 3's daily-checkpoint resolution) → under `full-autonomy`: Set STATUS=`BLOCKED`. End turn. `ScheduleWakeup` 3600s. Under `danger-builder`: route to ceo-agent per `danger-builder-mode.md` § Routing table; STATUS stays `RUNNING` once CEO decides.

See `command-center/management/full-autonomy-mode.md` § Tick behavior for the full STATUS contract. Under `danger-builder`, see also `command-center/management/danger-builder-mode.md` § Tick behavior — identical base plus kill-switch / founder-message / charter-destroyed halt checks.

## Deliverable
None — this stage transitions to the next wave.

## Exit criteria
- Current wave marked complete in TaskMaster (Step 1 sweep verified)
- **Next wave picked** (seed task ID + any bundled task IDs), or loop ended / handoff written
- STATUS written correctly if running under full-autonomy / danger-builder (see above)

## Next
→ Return to `../wave-loop.md` → Stage 0 (next wave) with the picked wave scope, OR end turn per STATUS branch above
