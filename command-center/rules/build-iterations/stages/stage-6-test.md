# Stage 6 — Functional Test (Playwright Swarm)

## Purpose
The authoritative testing mechanism. Real browser tests against production. `/qa` (Stage 5b) supplements but never replaces this.

## Prerequisites
- Stage 5b QA passed
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/Sub-agent Instructions/ui-comprehensive-tester-instructions.md`
- READ `command-center/rules/testing-principles.md`
- READ `command-center/test-writing-principles.md` §15-16
- **If the wave touches auth / payments / user creation / sessions:** READ `command-center/rules/security-waves.md` — LIVE E2E Auth0 round-trip + session-persistence scenarios are MANDATORY for this wave, not just code review.
- **Prod URL must serve the merged commit.** If there is any doubt (new CDN cache, long-tail deploy propagation, DNS change), under full-autonomy create a `MONITOR:` task per `command-center/rules/monitors/monitor-principles.md` with a readiness check that confirms the new code is live — NOT just a `/healthz` 200. Do not run the Playwright swarm against stale prod.

## Actions

1. Spawn `ui-comprehensive-tester` swarm: 3-5 testers in parallel
2. Each tester gets ONE dedicated MCP instance (`playwright`, `playwright-2`, ..., `playwright-5`)
3. Partition by persona + flow (buyer, seller, admin, visitor, mobile)
4. Each tester reads `test-writing-principles.md` §15-16 and `command-center/artifacts/user-journey-map.md`
5. Regression smoke of prior-wave fixes is required

### Critical rules
- **NEVER tell testers to call `browser_close`** — kills the MCP instance permanently
- Each tester uses ONLY their assigned instance — no cross-calling
- Test CONTENT not just layout (stat values, row counts, form submissions)
- Network-tab 4xx scan on every page visited
- Edge cases required: invalid IDs, expired tokens, empty states
- Post-checklist forensic pass: dev-mode leftovers, auth-state leaks, placeholder copy

### End-user simulation rules (Playwright)

Playwright swarm tests simulate a real end-user. Testers must interact with the site exactly as a user would — no shortcuts.

**ALLOWED:**
- Click visible elements (buttons, links, menus, tabs)
- Type into visible form fields
- Scroll the page
- Take screenshots and snapshots
- Read what's visible on the page (text, layout, error messages)
- Navigate to the starting URL ONCE via `page.goto()` (the entry point — e.g., homepage)
- Use `browser_network_requests` passively to inspect what happened (diagnostic only, after the fact)
- Use `page.context().cookies()` to check cookie state (diagnostic only)

**NEVER ALLOWED:**
- `page.goto()` to any URL after the initial entry point — navigate by clicking links only
- `page.evaluate(fetch(...))` to call API endpoints — the user doesn't open DevTools and run fetch
- Direct API calls via curl/fetch inside Playwright code — this is not how users interact
- Typing URLs in the address bar to jump to pages — the user clicks links and buttons
- `page.evaluate()` to read localStorage/sessionStorage as a substitute for checking the visible UI — if the user can't see it, the tester shouldn't rely on it for PASS/FAIL verdicts

**WHY:** Playwright swarm testing catches what a real user hits. API calls and address-bar navigation bypass middleware, redirects, CSP rules, client-side routing, and auth flows — exactly the things that break in production. If a flow only works via API call but not via clicking, it's broken.

**ONE EXCEPTION:** `browser_network_requests` and `page.context().cookies()` are allowed AFTER completing a user flow, purely for diagnostic evidence when something fails. They're for debugging, not for asserting PASS/FAIL.

### Same-wave fast-fix
When testers find small bugs (<20 LOC), fix in a follow-up PR BEFORE Stage 7. Karen+Jenny then review the fixed state.

### Screenshot-as-proof (mandatory)
Every test case MUST take a screenshot of the end-state BEFORE the final assertion. Rules:
- Take the screenshot **before** asserting — if the assertion fails, you still capture what went wrong
- Name semantically: `orders-list-purchased-tab.png`, `checkout-crypto-panel.png` — NOT `screenshot-1.png`
- Save to `Planning/wave-<N>-test-reports/screenshots/`
- For PASS verdicts: the screenshot IS the proof that the feature works
- For FAIL verdicts: the screenshot shows what the user actually sees
- Include the screenshot filename in the tester report next to each PASS/FAIL line

## Deliverable
- Tester reports at `Planning/wave-<N>-test-reports/tester-N.md`
- Screenshots at `Planning/wave-<N>-test-reports/screenshots/`
- PASS/FAIL per fix with evidence (including screenshot filename)
- New bugs in "Bugs discovered" section

## Exit criteria
- All testers completed their scenario partition
- Reports written with screenshot evidence for every test case
- Any blockers fast-fixed

## Next
→ Return to `../wave-loop.md` → Stage 6b (if frontend changes) or Stage 7
