# Stage 7b — Triage: Classify-Then-Route

## Purpose
Classify every issue surfaced by the tester swarm and reality check, then route each to the right specialist. The orchestrator's job here is ROUTING, not FIXING.

## Prerequisites
- Stage 7 reality check complete
- READ `command-center/rules/triage-routing-table.md` (mandatory — contains the classification table)

## Phase 1 — Classify every finding

Enumerate all Major/Medium/Minor findings from Stage 6 + Stage 7 that are NOT part of this wave's original targets.

For each finding, classify TWO dimensions:

### Dimension A: Severity routing
| Class | Definition | Action |
|-------|-----------|--------|
| (a) Blocks this wave | Prevents wave from shipping | Fix NOW in same wave (Phase 2) |
| (b) Fast-follow | Should fix before next wave starts | Fix NOW in same wave (Phase 2) |
| (c) Next-wave candidate | Important but not urgent | Create TaskMaster task |
| (d) Backlog | Nice-to-have, low priority | Create TaskMaster task |

### Dimension B: Issue type (determines WHO fixes it)
Use the classification table in `command-center/rules/triage-routing-table.md` to determine issue type and the matching specialist.

**The orchestrator MUST NOT attempt any fix directly.** Every fix goes through either:
- `/investigate` (for unknown/complex issues, or when root cause is unclear)
- A domain expert sub-agent (for clear-cut classified issues)

### Design-gap issue type

If a finding is a design-gap (missing mockup / icon / component / page in `design/`, not a bug in shipped code), route it to the **`bug-design` TaskMaster tag** (NOT `bugs` or `redesign`). Design-gap tasks become backlog for future Dx invocations per `command-center/rules/build-iterations/stages/stage-3b-design-gap.md`. If the gap blocks the current wave, the orchestrator can pull Dx inline — but 7b defaults to deferring.

Field recipe for `bug-design` tasks:
- title: `[DESIGN-GAP][g<N>] <what page/element/icon is missing>`
- details: what surfaced it, which DESIGN-SYSTEM.md primitives apply, which prior-art mockup to match
- priority: high if it blocks a downstream feature, medium if degrades UX, low if polish

## Phase 2 — Route and fix (a) and (b) items

For each item classified as (a) blocks-this-wave or (b) fast-follow:

1. **Classify the issue type** using the routing table
2. **Spawn the matched agent or skill** — never attempt the fix as the orchestrator
3. **Verify the fix** — the fixing agent must provide evidence (screenshot, test output, or curl response)
4. **Commit as same-wave fast-fix** PR before Stage 8

### Escalation rule
If the first routed expert fails to fix the issue:
- Spawn `/investigate` with the expert's findings as context
- `/investigate` runs its 4-phase protocol (investigate → analyze → hypothesize → implement)
- If `/investigate` also fails: escalate to user with root-cause analysis and options

## Phase 3 — Log (c) and (d) items

**Stage 7b classifies urgency only — never picks a wave letter or milestone.** Milestone assignment happens at Stage 0b of a future wave (see `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md`). Stage 7b owns `urgency`; Stage 0b owns `roadmapMilestone`.

For each item classified as (c) next-wave or (d) backlog:
1. Run `/investigate` for root-cause analysis on any Major/Critical items (so the future wave has a head start)
2. Create a TaskMaster task. MANDATORY metadata on every new task (per `command-center/rules/roadmap-lifecycle.md`):
   - `metadata.roadmapMilestone: "unassigned"` — default; Stage 0b will walk the queue and assign where possible
   - `metadata.source: "stage-7b-triage"` — preserves origin for audit
   - `metadata.urgency: "next-wave"` or `"backlog"` per classification above
   - `metadata.createdAt: "<ISO-timestamp>"`

   CLI sequence: `npx task-master add-task --prompt="..." --tag=bugs` then apply metadata via `npx task-master update-task --id=<N> --prompt="<metadata JSON>"`.
3. Include the investigation findings in the task description

## Deliverable
Triage table in the wave closeout (produced in Stage 8) with columns:
- Finding | Severity (a/b/c/d) | Issue Type | Routed To | Outcome | TaskMaster ID (if c/d)

## Exit criteria
- All findings classified (severity + issue type)
- All (a) and (b) items fixed via routed specialists (not orchestrator)
- All (c) and (d) items have a TaskMaster task with root-cause notes
- No unclassified findings left dangling
- Orchestrator attempted ZERO direct fixes

## Next
→ Return to `../wave-loop.md` → Stage 8
