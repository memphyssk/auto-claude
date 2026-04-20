# Stage 10 — Instruction Distillation

## Purpose
The ONLY stage that reads observation files. Promote load-bearing behavioral patterns into positive forward-looking instruction directives. After this stage, observations are inert until the next wave's Stage 9.

## Prerequisites
- Stage 9 observations written
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/Sub-agent Instructions/karen-instructions.md`
- READ `command-center/Sub-agent Instructions/technical-writer-instructions.md`

## Actions

### Sub-agent A — Converter (karen)
- Reads this wave's observations + current instructions for each agent
- Filters: most patterns are NOT load-bearing enough to promote
- Writes positive forward-looking directives for patterns that survive
- Cap: 3 changes per agent per wave
- **Zero promotions is acceptable** when observations lack load-bearing patterns

### Sub-agent B — Compactor (technical-writer)
- Reads karen's updated instruction files
- Aggressive compaction: war stories out, prose to bullet, filler compression
- Preserves every rule, trigger, and load-bearing example

### Orchestrator step 3
- Review the diff (converter additions + compactor cuts)
- Sanity-check no rules were lost
- Commit

## Deliverable
Updated `command-center/Sub-agent Instructions/<agent>-instructions.md` files.

## Exit criteria
- Instruction files updated (or explicitly zero promotions)
- Compaction applied
- Diff reviewed and committed

## Next
→ Return to `../wave-loop.md` → Stage 11
