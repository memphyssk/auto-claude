# Stage 7 — Reality Check (Karen + Jenny)

## Purpose
Post-test sanity gate. Karen: "did it ACTUALLY work end-to-end?" Jenny: "does the deployed state match the spec?" Both consume tester reports + layout verification.

## Prerequisites
- Stage 6 tester reports exist
- Stage 6b layout report exists (if applicable)
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/Sub-agent Instructions/karen-instructions.md`
- READ `command-center/Sub-agent Instructions/Jenny-instructions.md`

## Actions

1. Spawn Karen and Jenny **in parallel**
2. Both consume: tester reports, layout verification, the original plan
3. Karen: verify fixes ACTUALLY work end-to-end on the final deploy. Surface buried findings.
4. Jenny: check spec match on deployed state. Classify residuals as Missing/Incomplete/Degraded.
5. Both deliver verdict: APPROVE / APPROVE WITH NOTES / BLOCK

### What to watch for
- "Minor" from testers that is actually Medium/High once downstream impact is assessed
- Fixes that exercise a nearby path instead of the exact repro path
- Network-tab evidence required for data-fetch fixes (404-silenced zero-state = FAIL)

## Deliverable
- `Planning/wave-<N>-karen-realitycheck.md`
- `Planning/wave-<N>-jenny-realitycheck.md`

## Exit criteria
- Both Karen AND Jenny return APPROVE (or APPROVE WITH NOTES)
- Any BLOCK findings addressed

## Next
→ Return to `../wave-loop.md` → Stage 7b
