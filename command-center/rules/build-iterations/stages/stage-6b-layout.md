# Stage 6b — Layout Verification (Conditional)

## Purpose
Verify UI changes match the canonical design spec. Skip for backend-only, infra-only, or doc-only waves.

**Design source of truth:** `design/` (DESIGN-SYSTEM.md + per-page HTML mockups from /aidesigner). Figma is deprecated for <competitor-1> — see `feedback_figma_drift_policy` memory. Legacy Figma node IDs in `command-center/artifacts/user-journey-map.md` may reference the old dark theme; defer to `design/*.html`.

## Prerequisites
- Stage 6 test swarm complete
- Wave touches user-facing UI (any frontend file modified or route added/removed)
- READ `command-center/Sub-agent Instructions/ui-designer-instructions.md`

## Actions

1. Spawn ONE `ui-comprehensive-tester` dedicated to layout verification
2. Assign a free Playwright instance
3. Inject `ui-designer-instructions.md` as FIRST directive
4. Load canonical mockup via `browser_navigate` to `file:///.../design/<page>.html` + live preview URL; compare with `browser_take_screenshot` and `browser_evaluate` with `getComputedStyle`
5. Classify drift: Critical / Major / Medium / Minor with Pre-existing vs Wave-regression flag
6. Critical drift blocks the wave; everything else feeds Stage 7

## Design-gap trigger

If layout tester finds a live surface with **no matching `design/*.html` mockup** (gap, not drift), this is a design-gap, not a layout-drift:
- **Default: do NOT block current wave.** File the gap as a task in the **`bug-design` TaskMaster tag** (NOT `redesign`) per `command-center/rules/build-iterations/stages/stage-3b-design-gap.md`.
- Orchestrator may override and pull the Dx side-loop inline if the gap is critical to wave acceptance.
- `bug-design` tasks become backlog for future Dx invocations.

### Skip conditions
- Backend-only wave: SKIP
- Infra-only wave: SKIP
- Doc-only wave: SKIP
- Desktop viewport (1440×900) only unless wave explicitly touches mobile

## Deliverable
Layout verification report at `Planning/wave-<N>-test-reports/layout-verification.md`

## Exit criteria
- No Critical drift findings (or fixed before Stage 7)

## Next
→ Return to `../wave-loop.md` → Stage 7
