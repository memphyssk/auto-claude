# Stage v9 — Per-Page Design Generation (Loop)

## Purpose
Generate a canonical mockup (`design/<page>.html`) for every page identified in v4. Each page uses DESIGN-SYSTEM.md tokens + module primitives and is approved by the founder before canonicalizing.

## Prerequisites
- v8 complete (`design/DESIGN-SYSTEM.md` approved)
- v4 complete (`command-center/product/per-page-pd/` populated — one PD file per page)
- v7 complete (`design/direction.html` canonicalized — visual language anchor)

## Actions

### 1. Fetch page list

Read every file under `command-center/product/per-page-pd/`. Build a queue, one page per PD file. Optional: order by priority (home / login / core-product-page first; admin / legal last).

### 2. Per-page generation loop

For each page in the queue:

**2a. Build page brief.** Construct a brief using `design/brief-template.md` (same template as Stage 3b), pulling:
- Page name + route + audience from `<page>.md` PD file
- Content sections, interactions, states from PD file
- Related modules from `DESIGN-SYSTEM.md` (use the primitives — do NOT reinvent)
- Approved direction from `design/direction.html`
- Tier 1 competitor equivalent-page screenshot references from `competitive-benchmarks/` (if applicable)

Write brief to: `Planning/onboarding-v9-<page>-brief.md`

**2b. Invoke `/aidesigner`** with the brief. Output lands in `design/staging/<page>.html`.

**2c. Consistency check** — before presenting to founder, verify:
- Page uses module primitives from DESIGN-SYSTEM.md (no custom variants without flagging)
- Page respects the direction (color, type, spacing, shadow, motion)
- Responsive breakpoints are present
- Empty / error / loading states are covered per the PD spec

If inconsistencies, auto-refine (invoke `/aidesigner` with refine prompt) before approval.

**2d. Founder approval via `AskUserQuestion`:**

> "Design for `<page>`: `design/staging/<page>.html`
>
> Options:
> 1. **Approve** — canonicalize to `design/<page>.html` and move to next page.
> 2. **Revise** — tell me what needs adjusting; I'll regenerate.
> 3. **Escalate** — this page needs a fundamental rethink; may affect direction or design system."

Loop:
- **Revise**: refine + back to 2d
- **Escalate**: pause v9, ask founder if we need to revise direction (back to v7) or design system (back to v8). Resume v9 after upstream fix.
- **Approve**: canonicalize (step 2e)

Per-page iteration cap: 4 revises. After cap, force an escalate — repeated failures on one page signal upstream (DESIGN-SYSTEM or direction) inadequacy.

**2e. Canonicalize** the approved page:
```bash
git mv design/staging/<page>.html design/<page>.html
```

Annotate the PD file (`per-page-pd/<page>.md`) with a reference to the approved design path.

### 3. Loop until queue empty

Continue 2a-2e for every page. Long onboarding runs benefit from incremental commits:
```bash
git add design/<page>.html command-center/product/per-page-pd/<page>.md
git commit -m "chore(onboarding): v9 — <page> design approved"
```

### 4. Cross-page consistency audit

After all pages approved, spawn `ui-designer` (fresh context) for a sweep:
- All pages consistently use module primitives
- No two pages introduce conflicting variants of the same primitive
- Navigation / header / footer patterns are identical across pages (reuse, don't rebuild)
- Responsive breakpoints work uniformly

If drift detected, iterate targeted regenerations for the drifting pages. After drift is resolved, proceed.

### 5. Log decision

Append to `product-decisions.md`:

```markdown
### [<YYYY-QN>] Per-page designs complete
**Category**: Design
**Status**: Active
**Context**: v9 onboarding per-page design generation.
**Decision**: <N> pages designed + approved: <list page names>
**Artifacts**: `design/<page>.html` × N + `Planning/onboarding-v9-<page>-brief.md` × N
```

## Deliverable

- `design/<page>.html` × N — one per page in PD queue
- `Planning/onboarding-v9-<page>-brief.md` × N — briefs preserved for audit
- `command-center/product/per-page-pd/<page>.md` × N — annotated with approved-design path
- `product-decisions.md` — v9 decision logged

## Exit criteria

- Every page in `per-page-pd/` has a corresponding approved `design/<page>.html`
- Cross-page consistency audit passed (no drift)
- Zero pages remain in `design/staging/`

## Next

→ Return to `../onboarding-loop.md` → Stage v10 (planning)
