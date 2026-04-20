# Stage v7 — Design Direction: /aidesigner Proposal + Approval Loop

## Purpose
Land a single one-page design proposal that defines the visual language for the whole product — color, type, shape, motion, density, overall "vibe". Everything v8 and v9 produces consumes this direction.

## Prerequisites
- v1 complete (FOUNDER-BETS vision anchors the emotional direction)
- v2 complete (Tier 1 competitor screenshots available for reference)
- v3 + v4 complete (at least one representative page is known — usually home or landing)
- READ `design/brief-template.md` (Stage 3b templates, reused here for consistency)

## Actions

### 1. Build the direction brief

Write a one-shot brief for `/aidesigner`:

```markdown
# Direction Brief — <Your Project>

## Product one-liner
<From FOUNDER-BETS vision>

## Audience tone
<Who is this for, how should they feel when they land on it>

## Emotional anchors
<3-5 adjectives — e.g., "confident / calm / fast / credible / no-BS">

## Visual references
- Competitor <Tier 1 #1>: <what we want to match / beat> — see `competitive-benchmarks/<competitor>.md` screenshots
- Competitor <Tier 1 #2>: <what's instructive>
- <Optional> External reference: <Linear / Stripe / Notion / etc.> for <specific attribute>

## Hard constraints
- Must be responsive (1024 / 1280 / 1440 minimum; mobile if v3 says so)
- Must support <dark mode | light mode | both> as default
- Must render the chosen representative page with real-looking content (not lorem)

## The page to design
<Representative page — usually home/landing — with its per-page PD content from v4>

## Out of scope for this direction pass
- Multi-page consistency (comes in v9)
- Component variants (comes in v8)
- Edge states (comes in v9)
```

Write to: `Planning/onboarding-v7-direction-brief.md`

### 2. Invoke `/aidesigner`

Pass the brief. Request: a single HTML page rendering the chosen representative page.

Output lands in: `design/staging/direction.html`

### 3. Founder approval loop

Present the staging page to the founder via `AskUserQuestion`:

> "Initial design direction generated: `design/staging/direction.html`
>
> Three options:
>
> 1. **Approve direction** — commit as the canonical direction; v8 builds the design system on top of this.
> 2. **Revise** — tell me what you want changed (e.g. 'too dense', 'colors feel corporate', 'hierarchy is weak'). I'll regenerate with your feedback.
> 3. **Reject direction entirely** — start fresh with a different brief."

Loop:
- If **Revise**: aggregate feedback, re-invoke `/aidesigner` with refine prompt, return to step 3
- If **Reject entirely**: rewrite the brief (step 1) with new references, go back to step 2
- If **Approve**: proceed to step 4

Iteration cap: 5 revise iterations OR 2 rejects. After cap, escalate to founder for a manual override ("pick one of the last 3 attempts, or provide explicit direction").

### 4. Canonicalize approved direction

```bash
git mv design/staging/direction.html design/direction.html
```

Commit (optional at this point; v11 handles the initial commit). If committing incrementally:
```bash
git commit -m "chore(onboarding): v7 design direction approved"
```

### 5. Log decision

Append to `command-center/product/product-decisions.md`:

```markdown
### [<YYYY-QN>] Design direction approved
**Category**: Design
**Status**: Active
**Context**: v7 onboarding design direction.
**Decision**: <one-paragraph description of the approved direction — colors, type, shape, emotional anchors>
**Rationale**: <why this won vs iterations / rejects>
**Artifacts**: `design/direction.html`, `Planning/onboarding-v7-direction-brief.md`
```

## Deliverable

- `design/direction.html` — approved canonical direction
- `Planning/onboarding-v7-direction-brief.md` — the brief that produced it
- `product-decisions.md` — direction decision logged

## Exit criteria

- Founder has explicitly `Approve`-d the direction
- `design/direction.html` is canonicalized (no longer in `staging/`)
- Decision is logged

## Next

→ Return to `../onboarding-loop.md` → Stage v8 (design-system)
