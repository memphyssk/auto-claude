# Stage 1 — Problem Reframing

## Purpose
Prevent "right code for wrong problem" failures. Two parallel agents apply different lenses to the task:
- **problem-framer** — symptom-vs-cause, antipatterns, solution classes (technical lens)
- **ceo-reviewer** — strategic value, scope, ambition, cognitive patterns (founder lens)

Research basis: research-solution-problem.md (verification-generation gap, MetaGPT PM role, Allie Rays holistic-thinking interrupt, multi-agent debate with separate adversarial reviewers). LLMs "force solutions by making assumptions" — this stage inserts a deliberate pause for reframing from two angles.

## Prerequisites
- Stage 0 complete (prior work checked)
- Stage 0b complete if applicable (product decisions resolved)
- Task/issue text available from TaskMaster or user

## Size rubric (deterministic; consulted by problem-framer before verdict)

Problem-framer applies this rubric to the task scope BEFORE emitting any verdict. If **any** of the four thresholds trips, the verdict is `RESCOPE-AUTO-SPLIT` — deterministic, not subjective. Process-based "feels like 2-3 waves" / "too big" language is insufficient grounds for a scope split; the framer must cite specific threshold(s) with estimated numbers.

| Measure | Threshold | How to estimate |
|---|---|---|
| Files touched | > 30 | Count target files from task description + Explore pass if greenfield |
| New primitives (models + routes + services + migrations + SDKs + major components) | > 30 | Enumerate from task body + architecture branches |
| Estimated net LOC | > 5,000 | Per-primitive rough estimate; err on the high side |
| Anticipated Stage 4 working set | > 250K tokens | Plan draft + SDK docs + per-agent briefs + working files |

**OR logic:** any single threshold trip → auto-split. If no threshold trips, the task proceeds as a single wave regardless of subjective weighting.

### RESCOPE-AUTO-SPLIT protocol

When emitting `RESCOPE-AUTO-SPLIT`, problem-framer MUST produce:
1. **Which threshold(s) tripped** with estimated numbers
2. **Concrete split proposal** — e.g., M2a / M2b / M2c — with per-slice scope boundary
3. **First-slice scope** that fits under ALL four thresholds
4. **Execution order** (why this slice first)
5. **Sibling task seed data** — title, description, `metadata.urgency`, `metadata.estimatedSize` for each deferred slice

Orchestrator creates the sibling TaskMaster rows automatically with `metadata.source: "auto-split"` and `metadata.urgency: "next-wave"`, updates the current task to the first slice, and continues to Stage 2. **No user ask.** Log in wave closeout §Scope auto-split.

If even the first slice trips a threshold (unbreakable monolith), escalate to user — manual planning required.

## Design-gap flag (MANDATORY — never absent)

Every reframing output MUST include `design_gap_flag: true|false`. This is load-bearing for Stage 3b's skip contract — an absent flag forces Stage 3b to fire defensively (~60-100K wasted) AND logs a plan-authoring defect. See `Sub-agent Instructions/problem-framer-instructions.md` § 5 for the full emission contract.

Set `true` if the task scope requires UI/icons/pages/components/flows NOT present in `design/*.html`. List the missing surfaces.

Set `false` if the task is backend-only, infra-only, doc-only, a pure bug-fix with no UI surface, OR if all touched UI surfaces already have mockups.

Do NOT enter a design loop here — the consolidated resolution happens at **Stage 3b** after the plan is approved.

Format inside `Planning/wave-<N>-reframing.md`:
```markdown
## Design gaps
design_gap_flag: true|false
missing_surfaces:
  - <route-or-component>: <one-line purpose>   # only when flag=true
rationale: <one line: why true or why false>
```

If non-UI (most backend waves): emit `design_gap_flag: false` explicitly with `rationale: no UI surface touched`. Never rely on a default.

## Actions

### 1. Spawn the Stage 1 review team in parallel

Both sub-agents are read-only Opus, fresh context. Spawn in a single message (parallel execution).

**`problem-framer`** — Tools: Read, Grep, Glob only.
Instruction: READ `command-center/Sub-agent Instructions/problem-framer-instructions.md` before spawning.
Output: `Planning/wave-<N>-reframing.md`

**`ceo-reviewer`** — Tools: Read, Grep, Glob only.
Instruction: READ `command-center/Sub-agent Instructions/ceo-reviewer-instructions.md` before spawning.
Output: `Planning/wave-<N>-ceo-review.md`
Default mode: HOLD SCOPE. Pass mode hint (`EXPAND`, `REDUCE`) only when orchestrator has explicit reason.

The two agents do NOT see each other's output — they form independent perspectives on the same input.

### 2. Outputs

**problem-framer answers:**
1. Apply the Size rubric above. Report per-measure estimates + any trips.
2. Restate the problem in the user's terms. Is the stated problem a *cause* or a *symptom*?
3. If symptom, hypothesize 1-2 underlying causes
4. Name 3 fundamentally different solution classes (with what each solves, what it doesn't, cost)
5. Red-team check against the antipatterns catalog (below)
- Verdict: PROCEED / RESCOPE-AUTO-SPLIT / RESCOPE / ESCALATE
  - `RESCOPE-AUTO-SPLIT` is reserved for size-rubric trips (see protocol above)
  - `RESCOPE` is for non-size reframing only (wrong problem, misdirected scope)
  - `ESCALATE` is for ambiguity the framer cannot resolve from code + docs

**ceo-reviewer answers:**
1. Worth doing right now? (user value, business value, cost of NOT doing, higher-leverage alternative?)
2. Direction check via 2-3 cognitive patterns
3. Prime directives at risk (top 2-3)
- Verdict: PROCEED / RECONSIDER / EXPAND_SCOPE_PROPOSAL / REDUCE_SCOPE_PROPOSAL

### 3. Orchestrator decision

Read both outputs. Consolidate:

- **Both say PROCEED** → continue to Stage 2 with a 1-line note citing both verdicts
- **problem-framer says RESCOPE-AUTO-SPLIT** → **auto-proceed, no user ask.** Orchestrator creates sibling TaskMaster rows per the split proposal (`metadata.source: "auto-split"`, `metadata.urgency: "next-wave"`, `metadata.estimatedSize` per slice), updates current task to the first slice, continues to Stage 2. Log in closeout §Scope auto-split. Exception: if even the first slice trips a threshold, escalate to user (unbreakable monolith).
- **problem-framer says RESCOPE** (non-size) → update task description in TaskMaster, re-run Stage 1 if scope changed materially. No user ask unless re-run also escalates.
- **problem-framer says ESCALATE** → escalate to user with concern + evidence
- **ceo-reviewer says RECONSIDER** → escalate to user with the proposed alternative
- **ceo-reviewer says EXPAND_SCOPE_PROPOSAL** → present to user as `AskUserQuestion`. Strategic expansion (new features / new surfaces) is founder territory.
- **ceo-reviewer says REDUCE_SCOPE_PROPOSAL** → **strategic reduction only** (killing features, demoting milestones, dropping surfaces). If the reduction is size-driven, reassign to problem-framer's size rubric — do not user-ask. Present strategic reductions to user as `AskUserQuestion`.
- **Conflicting verdicts** (e.g., problem-framer PROCEED, ceo-reviewer RECONSIDER) → escalate to user.

**Narrow user-ask triggers.** User is polled ONLY for: (a) strategic scope changes (EXPAND or feature-level REDUCE, direction RECONSIDER), (b) genuinely conflicting verdicts between the two lenses, (c) unbreakable monoliths where even the first slice of an auto-split trips the size rubric, (d) problem-framer ESCALATE with unresolvable ambiguity. **Sizing splits within the rubric are deterministic and auto-proceed — never user-gated.**

**Under `mode: full-autonomy`:** escalations (a), (b), (c), (d) route to BOARD instead of user, using the default 4+/7 threshold (see `command-center/management/full-autonomy-mode.md` § Routing table + `command-center/management/conflict-resolution.md`). Hard-stops (destructive / money / member veto) still route to founder. Decision-slug = `stage1-<verdict-class>-<wave-N>`. BOARD result applies directly to Stage 2 if 4+/7 consensus; falls back to founder-ask if threshold not met.

**Under `mode: danger-builder`:** escalations (a), (b), (c), (d) route to BOARD first (same 4+/7 threshold). If BOARD falls short OR any member issues a HARD-STOP: spawn **ceo-agent** with the BOARD file. ceo-agent reads `ceo-bound.md` § 5 (strategic restrictions), decides, appends to `Planning/ceo-digest-YYYY-MM-DD.md`, and emits the verdict back to this stage. Result applies to Stage 2 same turn. See `command-center/management/danger-builder-mode.md` § Routing table.

## Skip conditions
- Pure typo/copy fixes (<5 LOC, no logic change)
- Pure dependency bumps
- Pure documentation changes

Every other wave runs Stage 1.

## Deliverable
- `Planning/wave-<N>-reframing.md` (problem-framer)
- `Planning/wave-<N>-ceo-review.md` (ceo-reviewer)

Stage 2 plan references both verdicts.

## Exit criteria
- Both review files written
- Orchestrator decision recorded for each (PROCEED / RESCOPE / ESCALATE / RECONSIDER / EXPAND_PROPOSAL / REDUCE_PROPOSAL)
- Any user-escalations resolved before Stage 2
- Stage 2 plan aware of both reframing outcomes

## Next
→ Return to `../wave-loop.md` → Stage 2

---

## Antipatterns Catalog

**Read this section at Stage 1 AND during Karen's strategic-correctness check at Stage 3.**

When reviewing any proposed solution, check whether it matches one of these patterns. If it does, that's a strong signal the proposed solution solves the wrong problem.

### 1. Symptom-as-problem
The problem statement describes what the user sees, not why it happens. Solution targets the visible artifact, not the cause.

**Example:** "Images load after the page" → "delay the whole page until images load" (WRONG). Right direction: why are images slow? unoptimized? uncached? CDN miss? Too large? Any of those has a different fix.

**Smell test:** Does the proposed fix make the symptom less visible without changing the underlying behavior?

### 2. Metric misalignment
Solution optimizes a metric the user doesn't actually care about.

**Example:** User wants "fast page loads." Proposed fix prioritizes "uniform rendering" by hiding content until everything is ready. Uniformity ≠ speed; user experiences a slower page.

**Smell test:** Write down the user's actual goal in one sentence. Does the solution's success metric match?

### 3. Band-aid over root cause
Catching errors, adding defensive checks, or adding null guards around a crash instead of fixing the invariant that's violated.

**Example:** Endpoint crashes when field is undefined → wrap in try/catch and return empty response. Right direction: why is the field undefined? Should it be? Fix the producer, not the consumer.

**Smell test:** Would a different-caller reproduce the crash? If yes, the fix didn't address the root cause.

### 4. Workaround becomes feature
"We can't fix X, so let's add a toggle/setting/option for it." The workaround ships as a permanent feature, growing the product's surface area and tech debt.

**Example:** API is flaky → add "retry" toggle exposed to users. Users now manage infrastructure failures.

**Smell test:** Would a senior engineer be embarrassed to ship this as a user-facing feature?

### 5. Solving for the demo
Fix works in seed data / local environment / demo script but breaks at scale or in production edge cases.

**Example:** Volume discount works with 3 seed orders but fails when `orders.length > 100` because of an N+1 query.

**Smell test:** Has anyone verified this with production-shaped data, not test fixtures?

### 6. Default feature-flag
Shipping broken code behind a toggle instead of not shipping it. Technical debt accumulates as unshipped features.

**Example:** New checkout flow has issues → wrap in feature flag defaulting off. Flag stays off for months.

**Smell test:** If we can't turn this on today, why are we merging it today?

### 7. Over-engineering for a one-off
Building generalized systems for problems that occur exactly once. Abstraction layer with no second caller.

**Example:** One admin dashboard needs a chart → build a generic `<Chart>` component with 15 config props that will never be reused.

**Smell test:** Are there ≥2 current or near-term callers? If no, inline the solution.

### 8. Trusting the claim
Implementer (or planning agent) states "X already exists" or "this is handled by Y" without verification. Later discovered false.

**Example:** Plan references "the existing notification system" but the system doesn't support the new type. Plan falls apart mid-implementation.

**Smell test:** Did Karen/Jenny grep/read the claimed existing component during Stage 3?

### 9. Optimizing the wrong layer
Fix applied at the wrong layer of the stack — e.g., frontend patching around backend bug, or database change made instead of service-layer logic.

**Example:** Backend returns 404 for "no record yet" cases → frontend adds `.catch()` to silence errors. Right direction: backend should return 200 with null for "expected absence" cases.

**Smell test:** If another client (mobile app, admin tool) hits this API, will they have to reinvent the workaround?

### 10. Optimizing for the pull request, not the product
Fix makes the current PR smaller or faster to ship, but leaves the underlying problem for the next person. Common pattern: "fix just this instance, leave the systemic issue for later."

**Example:** One specific 404 error handler added, ignoring 7 other similar endpoints with the same issue.

**Smell test:** Are there similar issues elsewhere that this fix doesn't address? If yes, either batch them or explicitly defer with a tracked task.

---

## How to extend this catalog
When a `/retro` wave surfaces a new antipattern, append to the catalog with:
- Name (one short phrase)
- Example (concrete, from an actual wave)
- Smell test (one-question check)

If the catalog grows past ~15 entries, extract to standalone `command-center/rules/solution-antipatterns.md` and reference from this stage file.
