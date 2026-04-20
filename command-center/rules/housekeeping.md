# Per-wave Housekeeping

Stage 7 updates + master plan hygiene.

---

## Master plan housekeeping

At the close of every wave, update the master plan to mark shipped items as complete. Stale scope entries cause re-implementation risk and confuse subsequent planning passes.

- **Orchestrator owns the edit.** Jenny flags stale entries; she does not commit them.
- **Verify before applying "mark as shipped" recommendations.** Sub-agents (especially Jenny) propose housekeeping based on the plan's status column, which may not reflect reality. A 30-second grep for the endpoint prevents the worst silent failure mode:

> A never-shipped fix gets marked shipped, disappears from the backlog, and remains broken in production while the next wave's planning treats it as done.

---

## Stage 7 update checklist

At the close of every wave, update:

1. **`command-center/artifacts/user-journey-map.md`** — status column for affected routes, new routes added
2. **`command-center/test-writing-principles.md` §14** — new testing patterns or anti-patterns discovered (append using the entry template; do not edit existing sections)
3. **Master plan** — mark shipped items complete (per the verification rule above)
4. **`Planning/wave-<N>-closeout.md`** — produce with: verdict, shipped fixes, triage table, housekeeping applied, plan-authoring defects to correct for next wave

Sub-agent Instructions and Observations are NOT updated at Stage 7 — they are produced at Stages 8 (observations retro) and 9 (instruction distillation).

## Wave closeout document structure

```
# Wave <N> Closeout

## Verdict
SHIP / BLOCK / PARTIAL

## Shipped
[list of PRs + what they shipped]

## Opportunistic findings triage
[every Major/Medium finding from the tester swarm that is NOT part of this wave's targets, classified as: blocks / fast-follow / next-wave / backlog]

## Housekeeping applied
[master plan updates, command-center/artifacts/user-journey-map.md updates, test-writing-principles.md additions]

## Plan-authoring defects to correct for next wave
[things the orchestrator got wrong in the plan that should inform the next plan]
```
