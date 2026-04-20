# Stage 9 — Observations Retro

## Purpose
Produce the wave's behavioral retrospective. What did each agent do well? What patterns emerged? Written into observation files — NOT into instructions (that's Stage 10).

## Prerequisites
- Stage 8 closeout complete
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/Sub-agent Instructions/knowledge-synthesizer-instructions.md`
- READ `command-center/Sub-agent Instructions/technical-writer-instructions.md`

## Actions

### Sub-agent A — Writer (knowledge-synthesizer)
- Reads wave artifacts: plan, implementer reports, gate reviews, test reports, reality checks
- Writes per-agent behavioral findings into `command-center/Sub-agent Observations/<agent>-observations.md`
- Observations only — no instruction-file updates

### Sub-agent B — Compactor (technical-writer)
- Reads updated observation files
- Rolling-window compaction:
  - Drops entries already promoted to instructions in a prior Stage 10
  - Trims stale entries unpromoted for ≥5 waves
  - Preserves all fresh entries + pending promotion candidates

### Optional
- `/learn` skill for cross-session pattern persistence

## Deliverable
Updated `command-center/Sub-agent Observations/<agent>-observations.md` files.

## Exit criteria
- Observations written for every agent used in this wave
- Compaction applied

## Next
→ Return to `../wave-loop.md` → Stage 10
