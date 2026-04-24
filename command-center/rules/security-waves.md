# Security-Critical Waves

Discipline overlays for waves touching auth, payments, user creation, cookies, CSRF, rate limiting, session management, or other security-critical module wiring.

---

## Rules

### 1. Pair `architect-reviewer` + `security-engineer` on every security-critical wave.
Why: architect-reviewer reasons about what SHOULD exist (produces the ADR); security-engineer reads what DOES exist (validates the ADR's wiring against the codebase). Either alone misses the gap.

### 2. Run a 2-iteration pre-impl gate when the first Karen+Jenny pass returns BLOCK with >2 medium+ findings.
Why: catching a Critical pre-impl is cheaper than a same-wave fast-fix; catching it pre-deploy is cheaper than a post-deploy incident. The 2-iteration gate is correct discipline for security scope — not overhead.

### 3. Run `/cso` (OWASP Top 10 + STRIDE) on any wave touching auth, payments, user creation, or security-critical endpoints.
Why: complements — does not replace — the architect-reviewer + security-engineer pair; catches threat-model gaps that code-focused reviews miss.

### 4. Pair every mutating M2M credential with a scope-minimized reader-only sibling.
Why: reusing an elevated M2M for non-mutating consumers (crons, analytics, reconciliation) turns a credential leak into a write-path compromise. Document both credential IDs (elevated + reader) in the migration runbook.

### 5. On dual-path auth migrations, return 401 from the legacy branch as soon as the user is migrated.
Why: without `if (user.<newProviderId>) return 401` at the top of the legacy branch, a valid-but-superseded legacy credential remains usable indefinitely after migration — session fixation survives cutover.

### 6. Hybrid auth dispatchers must check for a migrated identity before accepting legacy credentials.
Why: after a successful legacy-path auth, if `user.<newProviderId>` exists → return 401 (force new-path flow); only accept legacy when no migrated identity exists. Prevents continued legacy-path auth after user migration.

### 7. Auth/session/user-creation waves must include a live end-to-end auth round-trip at Stage 6.
Why: code review validates syntax, not runtime integration with the identity provider's allowlists, supported parameters, or callback handlers. Only live round-trips catch these.

**Mandatory Stage 6 scenarios for auth-touching waves:**
1. **Fresh signup round-trip** — disposable account, complete provider signup + consent + callback, assert `/api/auth/me` returns 200 with valid session cookie.
2. **Existing-user login** — known test user, assert session persists across one navigation.
3. **Every modified endpoint** — exercise each auth-adjacent button/form/flow the wave touched; check terminal state against expected (not just HTTP 200).
4. **Legacy/deprecated endpoint confirmation** — if the wave sunsets an endpoint, curl it post-deploy and confirm 404.

**Closeout artifact requirement:** link screenshots or paste terminal output for each scenario. "Code review passed" does not substitute.

### 8. For `@auth0/nextjs-auth0` v4+ projects, `packages/web/src/middleware.ts` MUST delegate to `auth0.middleware(request)`.
Why: a no-op middleware (`return NextResponse.next()`) silently breaks — Auth0 redirects complete, user lands with `?code=&state=` in URL, SDK never processes the code, session cookie never gets set, all downstream `/api/auth/me` calls 401. Symptom: "signup works in Auth0 UI but user still sees Sign in in navbar." Check at architect-reviewer stage for any auth-adjacent wave.

---

## Baseline security (stack-specific)

- **JWT tokens:** 15-min access token + 7-day refresh token (httpOnly cookie).
- **Passwords:** bcrypt cost factor 12.
- **All user input** validated via Zod / class-validator before processing.

Secrets, `.env`, and self-generated random values governed by CLAUDE.md always-on rules.

---

## Related rules

- `rules/sub-agent-workflow.md` #5 — architect-reviewer + security-engineer pairing (detailed)
- `rules/dev-principles.md` enum-coverage + symbol-reference rules — load-bearing for auth state machines and grace-window branches
