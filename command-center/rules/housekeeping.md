# Per-wave Housekeeping

Stage 8 updates + master plan hygiene.

---

## Master plan housekeeping

At the close of every wave, update the master plan to mark shipped items as complete. Stale scope entries cause re-implementation risk and confuse subsequent planning passes.

- **Orchestrator owns the edit.** Jenny flags stale entries; she does not commit them.
- **Verify before applying "mark as shipped" recommendations.** Sub-agents (especially Jenny) propose housekeeping based on the plan's status column, which may not reflect reality. A 30-second grep for the endpoint prevents the worst silent failure mode:

> A never-shipped fix gets marked shipped, disappears from the backlog, and remains broken in production while the next wave's planning treats it as done.

---

## Stage 8 closeout checklist

At the close of every wave, update:

1. **TaskMaster writeback sweep** — per `stages/stage-8-closeout.md` step 1 (sub-steps 1a-1f): primary task, subtasks, same-wave fast-fixes, auto-split siblings, Stage 7b triage rows, + writeback ledger in the closeout. This is the highest-value housekeeping item — without it, the next wave's Stage 0b queue walk operates on stale data.
2. **`command-center/artifacts/user-journey-map.md`** — status column for affected routes, new routes added
3. **`command-center/test-writing-principles.md` §14** — new testing patterns or anti-patterns discovered (append using the entry template; do not edit existing sections)
4. **Master plan** — mark shipped items complete (per the verification rule above)
5. **`Planning/wave-<N>-closeout.md`** — produce with: verdict, scope auto-split (if applied), shipped fixes, triage table, housekeeping applied, plan-authoring defects to correct for next wave, **TaskMaster sweep ledger** (from step 1)

Sub-agent Observations and Instructions are NOT updated at Stage 8 — they are produced at Stages 9 (observations retro, knowledge-synthesizer) and 10 (instruction distillation, karen).

## Wave closeout document structure

```
# Wave <N> Closeout

## Verdict
SHIP / BLOCK / PARTIAL

## Scope auto-split (only if Stage 1 emitted RESCOPE-AUTO-SPLIT)
[trigger threshold(s) tripped with numbers, original task ID + title,
 slices produced (first-slice shipped this wave + deferred siblings),
 sibling TaskMaster IDs created, urgency per sibling]

## Shipped
[list of PRs + what they shipped]

## TaskMaster sweep (ledger)
| Task ID | Title | Old status → New status | Note |
|---|---|---|---|
| <primary> | ... | in-progress → done | shipped PR #NN, commit <sha> |
| <subtask-1> | ... | pending → done | bundled in primary |
| <fast-fix-N> | ... | (new) → done | same-wave fast-fix PR #NN |
| <auto-split-sibling-1> | ... | (new) → pending | urgency: next-wave, estimatedSize: M |
| <triage-c-1> | ... | (new) → pending | opportunistic; Stage 7b |

## Opportunistic findings triage
[every Major/Medium finding from the tester swarm that is NOT part of this wave's targets, classified as: blocks / fast-follow / next-wave / backlog]

## Housekeeping applied
[master plan updates, command-center/artifacts/user-journey-map.md updates, test-writing-principles.md additions]

## Plan-authoring defects to correct for next wave
[things the orchestrator got wrong in the plan that should inform the next plan]
```
