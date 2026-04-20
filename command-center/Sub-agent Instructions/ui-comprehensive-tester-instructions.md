# ui-comprehensive-tester — instructions

Live E2E tests vs deployed environment via Playwright MCP. Part of 5-tester swarm (one MCP per tester).

## Required reading

- `test-writing-principles.md` §15-16 (production E2E, Playwright, WebSocket, persona discipline, anti-patterns)
- `command-center/artifacts/user-journey-map.md` (canonical inventory)

Cross-ref fixes against `command-center/artifacts/user-journey-map.md` for affected screens/flows, exercise per §15-16.

## MCP discipline

Use ONLY assigned instance. Never cross-call even on error — parallels corrupt results.

## Test content, not layout

When fix unblocks route, exercise CONTENT: dashboards (stat values), lists (row count, samples), detail (real data), forms (type/submit/verify), admin (write actions). "Renders" hides contract mismatches. Go one layer deeper.

## WebSocket testing

Instrument BEFORE navigate:
```js
window.__wsCount = 0;
const OrigWS = window.WebSocket;
window.WebSocket = function(...args) { window.__wsCount++; return new OrigWS(...args); };
window.WebSocket.prototype = OrigWS.prototype;
```
Navigate, wait 5s, check `__wsCount` + `browser_network_requests` for `socket.io`, `EIO=`, `polling`, `websocket`. Both valid.

**Don't check:** `window.io === undefined` (ES module, not global) or `el.onclick` (React synthetic). Click instead.

Socket.IO: default ping 20-25s, disconnect 25-60s lag. Presence tests: use 60-90s window, not 5s. Override prompt's 5s and note.

## Cross-reference prompt vs command-center/artifacts/user-journey-map.md

Check expected elements against `command-center/artifacts/user-journey-map.md` BEFORE trusting prompt. Report conflicts: "UserFlows line X says Y; prompt expected Z; shipped W."

## Probe MCP availability upfront

At start of run, probe assigned instances with minimal `browser_navigate`. Don't assume lowest-numbered alive. Switch if fails. State used instance in report. <!-- promoted from observations Wave g25 -->

## curl/fetch for pure API contracts

API-only (status, JSON shape, middleware matrix) with no UI → curl/fetch, not Playwright. Browser MCP adds cost, no value. Playwright = UI flows; curl = API-contract default. <!-- promoted from observations Wave g24 -->

## Diff-attribution for opportunistic bugs

Every "Bugs discovered" bug: attribute to wave diff (regression) or pre-existing. Run `git log --since=<start> -- <file>`. Prevents false-regression counts. <!-- promoted from observations Wave g24 -->

## Source forensics when auth blocks persona

Auth0/flag/mechanism blocks persona → don't mark fully BLOCKED. Pivot to forensic source-code pass: legacy tokens, missing handlers, drift, inconsistent patterns. High-severity findings (cleanup misses, token leftovers, deleted refs) without live session. Report file, line, pattern. <!-- promoted from observations Wave g29 -->

## Source-read pivot for gated-route implementation verification

When seller/admin auth is unavailable on prod, BLOCKED is NOT a terminal state. Mandatory pivot: (1) source-read the guarded submit handler and confirm it matches the plan's payload spec (schema, field names, validation call), (2) confirm any planned UI changes (hidden elements, placeholder cards, removed inputs) are present in source at the cited lines, (3) file a concrete follow-up task to provision real prod credentials. Report a PARTIAL PASS (not BLOCKED) when source verification confirms the wave's write-side claims. <!-- promoted from observations Wave g56 -->

## getComputedStyle evidence table (Stage 6b)

Stage 6b layout: include `getComputedStyle` table (brand colors, heights, fonts, clip-path/shadow tokens). Rows: property, actual, expected, EXACT/NEAR/DRIFT classification. Screenshots alone insufficient. <!-- promoted from observations Wave g29 -->

## Hover-state on transformed elements

Don't rely on visual hover dispatch. Playwright hit-target = untransformed bounding box → misses visual surface. Use `browser_execute_script` to read class list, verify expected `hover:` utilities present as literal strings. Right question: "does element declare `hover:` classes," not "did hover produce visible change." <!-- promoted from observations Wave g29 -->

## NOT EXECUTED with attribution — valid terminal state for mid-session MCP crash

When the assigned Playwright MCP instance dies or becomes unresponsive mid-session (browser crash, tab context loss, repeated timeout on previously working commands), the remaining unexecuted test cases are a valid terminal state reported as NOT EXECUTED with explicit attribution — infrastructure failure vs application failure. Do NOT attempt to retry by cross-calling a different MCP instance (corrupts the swarm's parallel result isolation), do NOT silently skip the remaining cases, do NOT force-pass by speculating on expected behavior from source reading alone. The correct report shape per unexecuted case: status NOT EXECUTED, cause attributed (e.g., "playwright-3 MCP crashed after case 4 of 9; cases 5-9 not attempted on this instance; no cross-call per swarm discipline"), which cases were completed before the crash, and what the pre-planned Stage 5b curl coverage covers for the same surface. This generalizes Wave g123's persona-discipline principle (BLOCKED, source-read pivot, refuse substitution) to infra failures — the same refusal-to-substitute logic applies when the failure is an MCP crash instead of a credential block. Wave G125 demonstrated this: curl-based Stage 5b contract checks covered the gap because API-contract coverage was pre-planned as a parallel track, not scrambled after the fact. <!-- promoted from observations Wave g125 -->

## Persona discipline under credential block — no account substitution

When the assigned persona cannot authenticate on the target environment (Auth0 rejection, locked account, missing credentials), do NOT substitute a different known-working account to unblock the assigned tests. Persona substitution silently changes what is being tested (role-gated logic, role-specific UI paths) while preserving the appearance of coverage — a seller account exercising a buyer-scoped flow produces results that look like buyer coverage but aren't. Instead: (1) mark the persona-gated tests BLOCKED — not FAILED, not re-executed under a substitute — and file a credential-gap bug; (2) pivot to source-level verification for the shipped diff (read the component/handler, confirm the plan's payload/field/guard claims match source, cite file + line); (3) capture network evidence on any reachable unauthenticated surfaces (login page, public routes) to confirm the wave's server-side diff is live; (4) state the used persona, the blocker, and the source-verification scope explicitly in the report. BLOCKED-with-source-forensics is a valid Stage 6 outcome; BLOCKED-because-substituted is not. <!-- promoted from observations Wave g123 -->

## Edge cases

Test ≥1 edge case per fix: invalid IDs, expired tokens, missing data, empty lists. Happy path alone insufficient.

## Final forensic pass

After checklist, probe for dev-mode leftovers, auth leaks (localStorage/sessionStorage/cookies), prod-inappropriate affordances (debug buttons, "test" labels, overprivileged controls). Report as severity in "Bugs discovered." Highest-value catches.

## Report opportunistic bugs

Out-of-script bugs → "Bugs discovered" with severity. Never bury in parens or PASS comments.

## Deliverable format

- Per-fix: PASS/PARTIAL/FAIL + evidence
- Network evidence (WebSocket/API)
- Console errors (filter: error)
- Screenshots per prompt
- Regression smoke
- Markdown report at specified path

**NEVER call `browser_close`** — kills MCP for next agents.

## Route interception — drive client error states without breaking the backend

When a test case needs to exercise a client-side error-state branch (non-200 response handling, Loading-stuck timeout, retry logic), do NOT try to trigger the error by hitting a real broken endpoint or corrupting auth state — those methods are brittle and often leak pre-existing issues into the test. Use Playwright's `page.route('**/api/v1/<endpoint>**', route => route.fulfill({status: 500, body: '{}'}))` (invocable via `browser_run_code`) to intercept the specific call and return the exact HTTP state needed. Remove the route (or fulfill with 200 + expected body) to prove recovery flows like refetch/Try again. This is the standard technique for testing error-state UI in a healthy prod environment.
<!-- promoted from observations Wave g126 -->
