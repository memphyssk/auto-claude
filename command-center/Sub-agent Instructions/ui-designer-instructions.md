# ui-designer (layout verification) — instructions

> **Agent type:** Spawn `ui-comprehensive-tester` with this file injected (ui-designer lacks Playwright + Figma MCP tools). Methodology is agent-agnostic.

You verify visual fidelity between Figma design and deployed production. Stage 6b, parallel with the functional tester swarm. Output feeds Karen + Jenny reality checks.

## Required reading

1. `command-center/artifacts/user-journey-map.md` — canonical inventory with Figma node IDs per screen
2. The wave plan — orchestrator provides path

## Per-route comparison loop

For each route the orchestrator names:

1. Look up the Figma node ID in `command-center/artifacts/user-journey-map.md`
2. Fetch design context via `mcp__plugin_figma_figma__get_design_context` (+ `get_screenshot`, `get_variable_defs` for tokens)
3. Capture production screenshot at 1440×900 using the assigned Playwright MCP instance
4. Compare side by side: structural drift, component drift, design-system token drift, value-format drift, missing/extra elements

## Severity classification

- **Critical** — missing required UI element (button the user needs, form field, key data). **Blocks wave close.**
- **Major** — structural drift (wrong layout, missing section, wrong ordering). Current wave or fast-follow.
- **Medium** — design-system token drift (wrong color/font/spacing) or value-format drift (wrong percentage suffix, currency without symbol, date format). Next wave or backlog.
- **Minor** — pixel alignment, micro-spacing, hover states, decorative polish. Informational only.

Tag every Major/Critical as **Pre-existing** (unrelated to current wave) or **Wave-regression** (introduced or worsened by current wave).

Pixel-perfect alignment and responsive breakpoints (unless wave touches mobile) are OUT of scope.

## Figma frame unavailability

If a node returns 404 from `get_design_context`, fall back to `get_metadata` to confirm file access. Proceed with code-only analysis, label findings "Figma frame unavailable — code-only", add a "Coverage gap" entry.

## Sequential describe-and-diff

No side-by-side visual diff tooling exists. Workflow: (a) fetch Figma → describe, (b) capture production → describe, (c) enumerate differences. Each route is a describe-describe-diff exercise.

## Shared component deduplication

Components shared across N routes (sidebar, header) need ONE Figma fetch, then per-route production screenshots to verify consistency. Don't loop Figma fetches per route.

## Value-format drift fast path

For pure value-format checks (currency, percentages, ratings, dates), prefer `browser_evaluate` + regex extraction over screenshot capture. Dramatically cheaper and more rigorous than visual comparison for format drift.

## Cross-domain session persistence

Netlify frontend (`jovial-rabanadas-ae9066.netlify.app`) and Railway backend (`eldorado-production.up.railway.app`) are different domains. httpOnly cookies from the API don't propagate to the frontend. After login, verify header username + sidebar render BEFORE navigating away.

## Pre-flight

Confirm before Audit pass 1:
1. `mcp__plugin_figma_figma__get_design_context` probe call succeeds against the first node
2. Assigned Playwright MCP instance responds to `browser_navigate` on a known-good URL

If either fails, STOP and report to orchestrator.

## Tester swarm coexistence

Use ONLY the Playwright MCP instance the orchestrator assigns — do not call others. Cross-contamination corrupts results.

## Report opportunistic bugs

Non-layout bugs observed (crashes, console errors, 4xx) go in a dedicated "Bugs discovered" section with severity. Do not bury in parentheticals.

## Deliverable format

Write a markdown report to the absolute path the orchestrator provides:

```markdown
# ui-designer — Wave <X> layout verification
**Routes audited:** N | **MCP instance:** playwright-N | **Figma file:** <fileKey> | **Viewport:** 1440×900

## Per-route drift table
| Route | Figma node | Critical | Major | Medium | Minor | Verdict |

## Critical drift (blocks wave close)
## Major drift
## Medium drift
## Minor drift (informational only)
## Design system token compliance
## Bugs discovered (opportunistic)

## Overall verdict
PASS (no Critical) | BLOCK (Critical found)
```

Read-only — do not modify source files.
