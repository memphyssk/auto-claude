# Stage 4 — Execute

## Purpose
Implement the plan. Write the code.

## Prerequisites
- Stage 3 gate passed (Karen + Jenny APPROVE)
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/rules/dev-principles.md` for cross-wave execution lessons + code conventions
- READ instruction files for each specialist being spawned

## Design-gap fallback (anti-pattern — re-enter Stage 3b)

If a Stage 4 implementer hits a design gap mid-execution ("no mockup for X / spec references visual not in `design/`"), **Stage 3b failed its audit**. Emergency recovery:

1. Pause the implementer
2. Orchestrator re-enters `stages/stage-3b-design-gap.md` for just that gap (Step 2 onward)
3. Implementer resumes with the canonicalized design as spec
4. Log the gap in the wave closeout as a **Stage 3b defect** (plan-authoring mismatch or audit miss)

Do NOT let implementers improvise designs — inconsistency is the #1 drift vector. Frequency signal: if this fallback fires more than once per 10 waves, Stage 3b Step 1 audit needs tightening.

## Actions

0. Mark the task in-progress: `npx task-master set-status --id=<task-id> --status=in-progress`
1. Pick the best-fit expert(s) from the capability sheet (`Planning/.capability-sheet.md` — "Agents at ~/.claude/agents/"). No default roster. If the plan names an agent not in the sheet, pick the one that resembles it the most and note the swap in the spawn context.
2. Spawn in parallel when file scopes don't overlap
3. Each sub-agent receives its instruction file as FIRST directive in the prompt
4. Apply `/simplify` after implementation on touched files

### Examples by topic
- Standard feature: `backend-developer` + `frontend-developer`
- Realtime: `websocket-engineer`
- Query work: `database-optimizer`
- Auth changes: `security-engineer`
- Complex React: `react-specialist`
- Small surgical fixes: orchestrator implements directly

### Agent deviation accountability

Sub-agents must follow the plan. The plan is the contract.

- **Allowed:** minor implementation choices within the plan's scope (e.g., choosing between two equivalent patterns, adding a helper function)
- **Must document:** any deviation from the plan's explicit file targets, method names, or architectural decisions. Each deviation must appear in the agent's report with a "Deviation from plan" section listing: what changed, what the plan said, and why.
- **Orchestrator reviews deviations** before accepting the agent's output. If a deviation contradicts a Stage 3 gate finding or a security review requirement, it's rejected — the agent re-implements per plan.
- **Examples of unacceptable silent deviations:** making a module `@Global` without plan approval, creating extra files not in the spec, changing a guard pattern from what the plan specified, skipping a test case the plan listed.

## Context budget (full-autonomy only)

Under `mode: full-autonomy`, at every natural pause during Stage 4, re-check context_used. If ≥75%:
1. Commit whatever's coherent.
2. Write `command-center/management/handoff.md` (wave + plan path, last commit SHA or `uncommitted: <brief>`, where you stopped, what's next, in-flight gotchas).
3. Set `command-center/management/STATUS=HANDOFF`.
4. End the turn.

Next /loop tick resumes from handoff.md. Never ask the founder "continue or fresh session?" — the 75% threshold is the answer. See `command-center/management/full-autonomy-mode.md` § Context budget.

## Deliverable
Code changes in the working tree (not yet committed).

## Exit criteria
- All plan targets implemented
- No known compilation errors
- Agent deviations documented and reviewed by orchestrator

## Next
→ Return to `../wave-loop.md` → Stage 4b
