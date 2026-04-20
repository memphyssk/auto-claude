# Stage 0b — Roadmap Alignment + Product Decisions

## Purpose
Two linked objectives, in order:

1. **Roadmap alignment** — walk the TaskMaster unassigned queue and assign tasks to `active` / `planned` milestones in `command-center/product/ROADMAP.md` where a clear match exists. Tasks that genuinely don't map stay `unassigned` — valid terminal state.
2. **Product decisions** — resolve decisions required by ANY task type (bugs, features, ideas, backlog items) BEFORE implementation starts. Removes the founder from the loop for Tier 1-2 decisions via a research-then-decide pipeline. Tier 3 decisions (money, security, major UX) are queued for the daily checkpoint.

## Applies to
- **Bugs** needing a product call (e.g., "should logged-out Buy Now redirect or show guest checkout?")
- **New features** needing scope/approach validation (e.g., "should seller analytics show real-time or daily aggregates?")
- **Backlog ideas** needing competitive validation (e.g., "do competitors have this? Is it worth building?")
- **Refactors** with UX implications (e.g., "should we change the order stepper to match backend states?")

## Prerequisites
- Wave tasks identified (from Stage 0 or Task Master backlog, any tag: bugs, marketplace, master)
- Some tasks flagged with `needsProductDecision: true` in metadata

## Skip conditions
- **Step 0 — Unassigned-queue walk:** skip if zero tasks have `metadata.roadmapMilestone === "unassigned"` in TaskMaster (queue is empty)
- **Steps 1–5 — Product-decision resolution:** skip if zero tasks in the wave have `metadata.needsProductDecision === true`
- **Step 6 — Health check:** skip only when TaskMaster has zero unassigned tasks at all
- **If all three skip conditions hold**, proceed directly to Stage 1

## When to flag a task as needsProductDecision

Flag ANY task where the implementation approach depends on a product/UX choice, not just a technical choice. Examples:

| Task type | Flag if... |
|-----------|-----------|
| Bug fix | The "correct" behavior is ambiguous (redirect vs modal vs toast) |
| New feature | Multiple viable approaches exist (what scope? what UX pattern?) |
| Backlog idea | Need to validate whether competitors have it / users need it |
| Refactor | Changes user-visible behavior (not just internal code structure) |

Do NOT flag tasks where the fix is purely technical (wrong CSS, missing field, broken query).

## Actions

### Step 0 — Unassigned queue walk (runs first, mandatory)

Query TaskMaster for all tasks with `metadata.roadmapMilestone === "unassigned"` regardless of tag or wave. For each:

1. **Attempt to map** to an `active` or `planned` milestone in `command-center/product/ROADMAP.md`. Inputs:
   - Task title + details vs milestone **Scope surfaces**
   - `metadata.source` hints (`competitive`, `trend-analyst`, `founder-bet`, `user`, `stage-7b-triage`)
   - Task dependencies already living under a milestone
   - Cross-reference `command-center/artifacts/competitive-benchmarks/` when the task was born from competitive intelligence
2. **Clear match:** assign.
3. **No clear match:** leave unassigned (valid terminal state).

**MANDATORY metadata writes** — this is the contract that feeds `command-center/rules/daily-checkpoint.md`. Missing writes break the checkpoint's ability to filter.

On every walked task, regardless of outcome:
- `metadata.stage0bReviewed: true`
- `metadata.stage0bReviewedAt: "<ISO-timestamp>"`

On assignment (in addition to the above):
- `metadata.roadmapMilestone: "m<N>-<slug>"`
- `metadata.roadmapAnchor: "command-center/product/ROADMAP.md#<kebab-anchor>"`
- `metadata.assignedAt: "<ISO-timestamp>"`
- `metadata.successMetric: "<copied verbatim from the milestone>"`

Reference: `command-center/rules/roadmap-lifecycle.md` for schema, slug conventions, and anchor derivation.

Assignments are **autonomous and reversible** — the daily checkpoint surfaces them for founder review. Do NOT block on founder approval here.

### Step 1 — Identify tasks needing decisions
Filter the wave's tasks (across ALL tags) for `metadata.needsProductDecision === true`. Extract the `productQuestion` from each. Group by type for efficient research:
- **UX pattern questions** → competitive browsing needed
- **Scope/priority questions** → competitive + market research needed
- **Feature validation questions** → competitive browsing + user flow analysis needed

### Step 2 — Competitive research (Playwright live browsing, parallel)
Spawn `ui-comprehensive-tester` agents (one per competitor) to LIVE BROWSE competitor websites using Playwright MCP. Do NOT use WebSearch-only research — text summaries miss actual UX behavior (e.g., WebSearch said "login required" but Playwright found guest checkout on <competitor-1>).

**Why Playwright, not WebSearch:** Product decisions depend on observable UX behavior (button clicks, redirects, form validation, modals). Help articles and support docs describe intended behavior, not actual behavior. Only live browsing catches the real patterns.

Spawn 3 agents in parallel (one per Playwright instance):
- `ui-comprehensive-tester` on `playwright-3` → <competitor-1>
- `ui-comprehensive-tester` on `playwright-4` → <competitor-2>
- `ui-comprehensive-tester` on `playwright-5` → <competitor-3>

Each agent prompt MUST include:
```
## CRITICAL RULES
1. You MUST navigate to each URL before answering
2. You MUST take a screenshot as evidence for each finding
3. If a page requires login, note "requires auth — could not verify"
4. Do NOT make up UX behaviors you haven't directly observed
5. Output EVIDENCE_QUALITY per finding: DIRECT_OBSERVATION | HELP_ARTICLE | COULD_NOT_VERIFY
```

READ `command-center/Sub-agent Instructions/competitive-analyst-instructions.md` and `command-center/Sub-agent Instructions/ui-comprehensive-tester-instructions.md` before spawning.

### Step 3 — Product decision (product-manager)
Spawn `product-manager` with the competitive evidence + task context. The prompt adapts to task type:

```
You are making product decisions for <YOUR_PROJECT>, a gaming digital goods marketplace.
For each task below, choose the best approach based on competitive evidence
and our existing patterns.

TASK TYPES you may encounter:
- BUG: Choose the correct fix behavior (e.g., redirect vs modal vs toast)
- FEATURE: Define the MVP scope and UX approach (e.g., what to show, what to skip)
- IDEA: Validate whether to build it at all (e.g., "competitors have it" vs "no one does")
- REFACTOR: Decide the user-visible outcome (e.g., match backend states vs keep aspirational UI)

Apply the 3-tier autonomy framework:
- Tier 1 (auto-decide): Standard marketplace pattern, every competitor does it,
  unambiguous correct answer. Decide and move on.
- Tier 2 (proceed + notify): Reasonable choice backed by competitive evidence,
  but could go either way. Decide, log reasoning.
- Tier 3 (must-ask user): Touches money/payments/security architecture, removes
  an existing feature, changes navigation hierarchy, or adds a new external
  service integration. DO NOT decide — queue for user with your recommendation.

For FEATURES/IDEAS specifically:
- Tier 1: Every competitor has it, table-stakes parity, clear MVP scope
- Tier 2: 1-2 competitors have it, differentiation opportunity, scope needs definition
- Tier 3: No competitor has it (unvalidated), large scope (>1 wave), or changes core UX flow

For each task, output:
{ "taskId": "ID", "decision": "specific choice/scope", "reasoning": "1-2 sentences citing evidence",
  "tier": 1|2|3, "competitiveEvidence": "1 sentence summary" }
```

READ `command-center/Sub-agent Instructions/product-manager-instructions.md` before spawning.

### Step 4 — Store decisions in Task Master (MANDATORY)
Every decision MUST be written back to `.taskmaster/tasks/tasks.json`. This is the single source of truth. Implementers in Stage 4 read their fix spec from task metadata, not from conversation history.

For each decision:
- **Tier 1-2:** Update the task in Task Master via node script or direct JSON edit:
  ```json
  {
    "metadata": {
      "needsProductDecision": false,
      "productDecision": "specific implementation choice",
      "productTier": 1,
      "competitiveEvidence": "1-sentence summary of what competitors do",
      "productQuestion": "original question (preserved for audit trail)"
    }
  }
  ```
  Update `#STAGECOMMENT: Stage 0b — Product decision: [choice]` in the task description.

- **Tier 3:** Update the task with the recommendation but keep `needsProductDecision: true`:
  ```json
  {
    "metadata": {
      "needsProductDecision": true,
      "productDecision": null,
      "productTier": 3,
      "productRecommendation": "product-manager's recommended choice",
      "competitiveEvidence": "1-sentence summary"
    }
  }
  ```
  Also append to `Planning/product-decisions-pending.md` for user visibility.

After user resolves Tier 3 items, update the task:
  ```json
  { "needsProductDecision": false, "productDecision": "user's choice", "productTier": 3 }
  ```

**Commit all task updates** to git after Stage 0b completes. The commit message should list which bugs got which tier decisions.

### Step 5 — Queue Tier 3 for daily checkpoint
Tier 3 items are **not resolved at the stage** — they are queued for the daily checkpoint (`command-center/rules/daily-checkpoint.md`), which batches across all waves.

For each Tier 3 task:
- Ensure `metadata.needsProductDecision: true`, `metadata.productTier: 3`, `metadata.productRecommendation: "<recommendation>"`, `metadata.competitiveEvidence: "<evidence>"` are set
- Append a lightweight entry to `Planning/pending.md` with task ID + question (founder-visible staging)

The wave proceeds without waiting — implementation under a Tier 3 task blocks only if the implementer hits the un-decided branch. Most tasks can advance despite open Tier 3 questions elsewhere in the backlog.

### Step 6 — Unassigned queue health check

After Step 0's walk and product-decision resolution, count remaining tasks with `metadata.roadmapMilestone === "unassigned"` in TaskMaster.

**If count > 30:** the unassigned backlog is growing faster than per-wave walks can absorb — the roadmap itself likely needs a strategic refresh.

Action: append a proposal entry to `Planning/pending.md` with tag `proposal:refresh-ritual`, today's date, and the current unassigned count. The next `daily-checkpoint` surfaces it. **Do NOT auto-fire the refresh ritual — propose only.**

If count ≤ 30: no action; proceed to Stage 1.

## Deliverable
- All `needsProductDecision` tasks resolved (Tier 1-2 auto-decided, Tier 3 user-answered)
- Competitive evidence stored with each decision for audit trail

## Exit criteria
- Zero tasks with `needsProductDecision: true` remain (or all Tier 3 items user-resolved)
- Each decision has `productDecision` + `productTier` in metadata

## Next
→ Return to `../wave-loop.md` → Stage 1
