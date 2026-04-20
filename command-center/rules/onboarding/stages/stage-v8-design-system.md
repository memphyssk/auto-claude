# Stage v8 — Design System: Build DESIGN-SYSTEM.md (Gated on v6b)

## Purpose
Produce the canonical `design/DESIGN-SYSTEM.md` with all tokens + reusable module primitives. This is the source both frontend code (Stage 4 implementers) and future designs (Stage 3b, v9) consume.

## Prerequisites
- **v6b complete** with `module-list.md` tagged `status: locked` — **HARD GATE** (this stage consumes the locked module list)
- v7 complete (direction.html exists — the visual language is set)
- READ `design/DESIGN-SYSTEM.md` scaffold (shipped with auto-claude)
- READ `command-center/rules/build-iterations/stages/stage-3b-design-gap.md` (same design discipline applies, reused for Design System generation)

## Actions

### 1. Verify v6b gate

Read `command-center/dev/module-list.md`. If front-matter does not contain `status: locked`, STOP — v6b is incomplete. Do not proceed.

### 2. Extract direction tokens from `design/direction.html`

Parse approved `design/direction.html` to extract:
- Color palette (primitive colors + semantic mappings — e.g., `--primary`, `--success`, `--muted`)
- Typography (families + scale)
- Spacing scale
- Shadows + elevation
- Border radii + clip-paths
- Motion / transition timing + easing
- Iconography style notes

Write the extracted tokens into the `design/DESIGN-SYSTEM.md` scaffold sections 1-7.

### 3. Invoke `/aidesigner` with the module inventory

Pass to `/aidesigner`:
- The populated tokens from step 2
- The locked `module-list.md` from v6b
- The approved `direction.html` as style reference
- Relevant per-page PD files (from `command-center/product/per-page-pd/`) that use these modules

Prompt: generate reusable module primitives in the DESIGN-SYSTEM.md "Component primitives" section — one HTML block per module showing its visual anatomy + the tokens it consumes.

Example module primitives to generate (based on MVP modules from v6):
- Button (primary / secondary / ghost / destructive variants + sizes)
- Input (text / email / password / textarea)
- Card (base / interactive / with-media)
- Modal / Dialog
- Toast / Snackbar
- Table
- Navigation (header / sidebar / breadcrumb)
- Empty state / Error state / Loading skeleton

Each module primitive section includes:
- Visual anatomy (HTML snippet rendered against the direction)
- Tokens it consumes
- States (default / hover / active / disabled / loading / error)
- Accessibility notes (ARIA, keyboard, focus)
- Usage guidance ("Use for X, not for Y")

### 4. Founder approval loop

Present `design/DESIGN-SYSTEM.md` to founder via `AskUserQuestion`:

> "Design system built: `design/DESIGN-SYSTEM.md`
>
> Three options:
>
> 1. **Approve** — commit as canonical; v9 per-page designs will consume these tokens + primitives.
> 2. **Revise** — tell me what needs adjusting (a specific token, a missing module variant, wrong state). I'll regenerate the relevant sections.
> 3. **Reject** — fundamental issue requires rebuild from scratch."

Loop:
- **Revise**: targeted regeneration of specific sections (cheaper than full rebuild)
- **Reject**: back to step 2 with new prompt
- **Approve**: commit

Iteration cap: 5 revise rounds.

### 5. Commit + log decision

Optional incremental commit:
```bash
git add design/DESIGN-SYSTEM.md
git commit -m "chore(onboarding): v8 design system approved"
```

Append to `product-decisions.md`:

```markdown
### [<YYYY-QN>] Design system built + approved
**Category**: Design
**Status**: Active
**Context**: v8 onboarding design system generation.
**Decision**: DESIGN-SYSTEM.md populated with <N> color tokens, <N> type tokens, <N> module primitives.
**Rationale**: Aligned to approved direction (v7) + locked module list (v6b).
**Artifacts**: `design/DESIGN-SYSTEM.md`
```

## Deliverable

- `design/DESIGN-SYSTEM.md` — fully populated (tokens + module primitives + states + accessibility)
- `product-decisions.md` — v8 decision logged

## Exit criteria

- Every module in `module-list.md` has a corresponding primitive section in DESIGN-SYSTEM.md
- Every primitive has all states documented (default + at least 2 interactive states)
- Founder has `Approve`-d
- File references (colors, tokens, modules) resolve consistently throughout

## Next

→ Return to `../onboarding-loop.md` → Stage v9 (page-designs)
