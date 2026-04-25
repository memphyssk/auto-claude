# Triage Routing Table

Referenced by Stage 7b and CLAUDE.md rule #4. When the orchestrator encounters any technical issue, it MUST classify using this table and route to the matched specialist. The orchestrator NEVER attempts fixes directly.

## Classification Table

| Issue Type | Signals / Symptoms | Route To | When to use `/investigate` first |
|-----------|-------------------|----------|--------------------------------|
| **UI / Layout** | Visual mismatch, wrong position, missing element, CSS bug, z-index, responsive breakage, animation broken | `frontend-developer` or `react-specialist` | Only if root cause is unclear after reading the component |
| **State / Data** | Wrong data displayed, stale cache, missing records, race condition, hydration mismatch, optimistic update failure | `/investigate` → then domain expert | **Always** — state bugs are rarely what they look like |
| **Navigation / Routing** | Wrong redirect, 404 on valid route, query params lost, back-button broken, deep-link failure | `frontend-developer` or `nextjs-developer` | If more than one route is affected |
| **Auth / Security** | 401/403 errors, token expiry, guard failures, CORS, CSRF, session issues, role-based access broken | `security-engineer` or `backend-developer` | If the error is intermittent or environment-specific |
| **API / Backend** | 500 errors, wrong response shape, missing fields, validation rejection, Prisma errors, DTO mismatch | `backend-developer` or `debugger` | If error is not reproducible from the endpoint alone |
| **Integration** | External service error (Stripe webhook, R2 upload, Sumsub callback, WebSocket disconnect, Redis timeout) | Domain-specific: `websocket-engineer`, `backend-developer`, `database-administrator` | **Always** — integration failures have environmental root causes |
| **Build / CI** | TypeScript error, lint failure, build crash, dependency conflict, CI red | `debugger` or `build-engineer` | Only if the error message is ambiguous |
| **Database** | Slow query, migration failure, constraint violation, deadlock, connection pool exhaustion | `database-administrator` or `sql-pro` | If query plan analysis is needed |
| **Performance** | Slow page load, high TTFB, large bundle, memory leak, N+1 query, rate limit hit | `performance-engineer` or `database-optimizer` | **Always** — perf issues need measurement before fixes |
| **WebSocket / Real-time** | Events not received, presence stale, chat messages lost, reconnection failure | `websocket-engineer` | **Always** — real-time bugs are timing-dependent |
| **Infra-gap** | Missing env var, unset API key, tool unavailable, credential not provisioned | Orchestrator self-handles: create `TRIAGE` TaskMaster row + spec file | Never — not a CEO decision |
| **Unknown / Complex** | Error doesn't fit above categories, multiple symptoms, root cause unclear, intermittent failure | **`/investigate` mandatory** | **Always** — this is the whole point |

## Decision flow

```
Issue encountered
       │
       ▼
  Can you classify it from the table above?
       │
   ┌───┴───┐
   YES     NO
   │       │
   ▼       ▼
 Is root    Spawn /investigate
 cause      (4-phase protocol)
 obvious?        │
   │             ▼
 ┌─┴─┐    Root cause found
YES  NO         │
 │    │         ▼
 ▼    ▼    Route to matched
Spawn  Spawn    expert
matched /investigate
expert  first, then
        route expert
```

## Rules

### 1. The orchestrator is a router, not a fixer.
Why: reading error messages and classifying is cheap; editing code directly or adding `console.log` patches burns context without finding root cause.

### 2. When uncertain which category an issue falls into, spawn `/investigate`.
Why: the 4-phase protocol (investigate → analyze → hypothesize → implement) finds the root cause or hands off to the right expert; guessing routes the wrong way.

### 3. State/Data and Integration issues always get `/investigate` first.
Why: these categories have the highest "looks simple, isn't" rate — the visible symptom is almost never the root cause.

### 4. Every fix ships with evidence: screenshot, test output, curl response, or before/after diff.
Why: "I fixed it" is not evidence, and un-evidenced fixes regress on the next wave.

### 5. Escalation chain: first expert fails → `/investigate` with their findings → `ultrathink-debugger` → escalate to user with full RCA.
Why: each tier has different diagnostic leverage; skipping tiers loses the context the next agent needs.

### 6. Never re-attempt the same fix. Pass failure context to the next agent.
Why: repeating a failed approach wastes turns; the next agent needs the failure context to try a different angle.

## Common misroutes to avoid

| Symptom | Looks like | Actually is | Correct route |
|---------|-----------|-------------|---------------|
| "Component shows wrong data" | UI bug | Stale React Query cache or missing invalidation | `/investigate` → `react-specialist` |
| "API returns 403" | Auth bug | Missing guard decorator or wrong role check | `backend-developer` (check guard config) |
| "Page loads blank" | Frontend crash | Server component error swallowed by error boundary | `debugger` (check server logs first) |
| "Feature works locally, fails in prod" | Deploy bug | Missing env var or different Node version | `devops-engineer` (check Railway config) |
| "Test passes but user sees bug" | Test bug | Test uses API calls instead of UI clicks (violates Playwright rules) | Rewrite test with real user simulation |
| "Multiple sidebar items highlight" | CSS bug | Data model: duplicate hrefs in nav config | `/investigate` (query the config, not the styles) |
