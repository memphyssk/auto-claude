# Testing Rules

Pointers to the canonical testing docs plus orchestrator-side discipline.

---

## Canonical docs (mandatory reading)

Two documents are mandatory reading for any agent doing testing work:

- **`command-center/test-writing-principles.md`** — the master testing guide. §0-13 cover code-level testing (Vitest, NestJS, React, Zod, RBAC, anti-patterns). **§15-16 cover live production E2E testing** (Playwright MCP, WebSocket instrumentation, status taxonomy, persona discipline, anti-patterns specific to live testing). §14 is the auto-updated rules log. The Quick Reference at the bottom lists 20 non-negotiable MUST/SHOULD rules.
- **`command-center/artifacts/user-journey-map.md`** — the canonical inventory of every user flow, screen, route, API endpoint, and user story. Tells you WHAT to test; `test-writing-principles.md` tells you HOW.

**Before any test work** (writing test code, running E2E suites, UI/UX verification, prod audits): read BOTH files. For agents that test production specifically, `test-writing-principles.md` §15-16 are non-negotiable.

**Whenever shipping a change** that adds/removes/modifies a page, route, endpoint, or user flow: update `command-center/artifacts/user-journey-map.md` in the same wave. When discovering a new testing pattern or anti-pattern: append to `command-center/test-writing-principles.md` §14 using the entry template (do not edit existing sections).

---

## Orchestrator-side testing discipline

### 1. Network-tab 4xx scan on every tested page
A rendered page with zero-state data, NaN values, or empty widgets often hides a silent 4xx swallowed by a catch block. Standard smoke verification must include scanning `browser_network_requests` for 4xx/5xx responses on every page visited — not just on explicitly targeted fixes. This is the companion rule to "test beyond layout guards": **layouts can lie, network tabs don't.**

### 2. Test beyond layout guards
When a fix unblocks a previously-broken route, verify the unblocked CONTENT — not just that the route renders. Read actual stat values, count list rows, click into entities, exercise write actions. A "page renders" pass that hides a contract mismatch is the most expensive false positive.

### 3. Socket.io / realtime success criterion must be stated explicitly
Every real-time fix prompt to a tester must state:
> success = [polling handshake confirms connection] OR [WebSocket upgrade observed], AND functional event delivery verified in a two-browser cross-client test.

Ambiguity about polling-only vs WebSocket-upgrade vs functional delivery causes full reverification cycles. **Single-user message-send tests never count** — the sender sees their own message via REST regardless of socket state.

### 4. Tester swarm prompts must be pre-flight aligned to command-center/artifacts/user-journey-map.md
Before finalizing any tester swarm prompt that lists expected UI elements (tabs, widgets, buttons, routes), grep `command-center/artifacts/user-journey-map.md` for each page mentioned and confirm expected elements match the canonical entry — if `command-center/artifacts/user-journey-map.md` is stale relative to a recent ship, update it BEFORE writing the tester prompt. Stale prompt expectations produce false spec-drift findings that consume Karen and Jenny post-test cycles.

### 5. Never browser_close in Playwright swarms
When instructing testers, **never tell them to call `browser_close`** at the end. It terminates the Playwright MCP instance permanently for the current session — subsequent agents assigned to the same instance number get "Target page, context or browser has been closed" on every tool call.

### 6. Tester prompt slug discipline
When a prompt references a specific game/category slug (e.g., `/games/<slug>`), either use `/games/[slug]` as the command-center/artifacts/user-journey-map.md placeholder with "verify via `GET /api/v1/games`", or hard-code a known-good seed-fixture default (`wow-classic` is the current seed default). Do NOT name a slug like `world-of-warcraft` from memory unless verified — testers will follow the prompt and waste cycles on non-existent routes.

### 7. Structural equivalence clause
When a wave fixes multiple sites by routing them through a single shared helper (e.g., `formatTrustRating()` called from N components), the plan should state: "fixes routing through `<helper-name>` count as verified if ≥2 structurally-distinct consumer components pass." Prevents testers from burning cycles trying to runtime-verify every consumer when the helper has one implementation path.
