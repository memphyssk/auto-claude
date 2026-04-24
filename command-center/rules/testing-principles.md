# Testing Rules

Pointers to the canonical testing docs plus orchestrator-side discipline applied when specifying test work.

---

## Canonical docs (mandatory reading)

Two documents are mandatory reading for any agent doing testing work:

- **`command-center/test-writing-principles.md`** — master testing guide. §0-13 cover code-level testing (Vitest, NestJS, React, Zod, RBAC, anti-patterns). §15-16 cover live production E2E testing (Playwright MCP, WebSocket instrumentation, status taxonomy, persona discipline). §14 is the auto-updated rules log. The Quick Reference at the bottom lists 20 non-negotiable MUST/SHOULD rules.
- **`command-center/artifacts/user-journey-map.md`** — canonical inventory of every user flow, screen, route, API endpoint, and user story. Tells you WHAT to test; `test-writing-principles.md` tells you HOW.

**Before any test work** (writing test code, running E2E suites, UI/UX verification, prod audits): read both files. For agents that test production specifically, `test-writing-principles.md` §15-16 are non-negotiable.

**Whenever shipping a change** that adds/removes/modifies a page, route, endpoint, or user flow: update `command-center/artifacts/user-journey-map.md` in the same wave. When discovering a new testing pattern or anti-pattern: append to `command-center/test-writing-principles.md` §14 using the entry template (do not edit existing sections).

---

## Contract for new rules

Template:
### N. Imperative rule ending in a period.
Why: one declarative sentence.

- Before adding: grep for the concept — if a similar rule exists, do not add a near-dup.
- One sentence per line, short, commanding, cut to the chase.
- No war stories, wave refs, `Context:`, `Cross-ref:`, or project/stack names.
- Stack-specific detail → § Code conventions, not the numbered list.
- Number sequentially; renumber on insert.
- Group under an existing H2 unless ≥3 new rules share a theme.
- Wave-specific ("broke once") stays in the closeout until a second wave confirms.

---

## Orchestrator-side testing discipline

### 1. Scan `browser_network_requests` for 4xx/5xx on every tested page, not just targeted fixes.
Why: zero-state data, NaN values, or empty widgets often hide a silent 4xx swallowed by a catch block.

### 2. Verify unblocked content, not just that the route renders.
Why: "page renders" passes frequently hide contract mismatches behind default layouts.

### 3. Real-time tester prompts must state success as: handshake confirms connection OR WebSocket upgrade observed, AND functional two-browser event delivery.
Why: single-user message-send tests see their own message via REST regardless of socket state.

### 4. Before writing a tester-swarm prompt, grep `command-center/artifacts/user-journey-map.md` for every page named and update the map if stale.
Why: stale expectations produce false spec-drift findings that burn Karen and Jenny cycles.

### 5. Never instruct testers to call `browser_close`.
Why: it terminates the Playwright MCP instance for every subsequent agent in the session.

### 6. Do not hard-code a slug from memory in tester prompts; use the route placeholder with a verify step, or a known-good seed fixture.
Why: testers follow the prompt verbatim and waste cycles on non-existent routes.

### 7. When a wave fixes N sites through a single shared helper, the plan states that ≥2 structurally-distinct consumer passes count as verified.
Why: the helper has one implementation path — runtime-verifying every consumer is wasted work.
