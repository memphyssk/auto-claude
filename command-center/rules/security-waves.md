# Security-Critical Waves

Discipline overlays for waves touching auth, payments, user creation, cookies, CSRF, rate limiting, session management, or other security-critical module wiring.

---

## architect-reviewer + security-engineer — complementary pair, not alternatives

For any wave involving auth, middleware, security-critical module wiring, cookies, CSRF, rate limiting, or session management:

1. Spawn `architect-reviewer` first to produce the ADR (what SHOULD exist)
2. Then spawn `security-engineer` to validate the ADR's wiring assumptions against the actual codebase (what DOES exist)

Do not use architect-reviewer as the sole pre-impl gate for security-critical work — always pair. Exception: non-security architectural decisions can use architect-reviewer alone.

---

## 2-iteration pre-impl gate is the correct pattern for security-critical scope

Standard Stage 2 (Karen + Jenny) still applies. But for security-critical waves, if the first gate pass returns a BLOCK with >2 medium+ severity findings:
1. Produce a **v2 plan revision** addressing the findings
2. Run a **second gate pass** before spawning implementers

Catching a Critical finding before implementation is cheaper than a same-wave fast-fix post-deploy; catching it pre-deploy is cheaper than a post-deploy security incident. **The 2-iteration gate is the correct pattern for security-critical scope — not overhead.**

---

## gstack `/cso` skill

On any wave touching auth, payments, user creation, or security-critical endpoints, run `/cso` (OWASP Top 10 + STRIDE threat model). **Does not replace** the architect-reviewer + security-engineer pair.

---

## Baseline security rules

Spec details (CLAUDE.md top rules cover secrets, `.env`, and self-generated random values):

- **JWT tokens:** 15-min access token + 7-day refresh token in httpOnly cookie.
- **Passwords:** bcrypt with cost factor 12.
- **All user input validated** via Zod / class-validator before processing.

---

## M2M credential least-privilege: scope-minimized reader sibling

Any Auth0 (or equivalent) M2M credential that carries `update:` or `create:` scopes must be paired with a separate reader-only credential for consumers that only read. Never reuse an elevated M2M for non-mutating consumers (crons, analytics, reconciliation jobs).

Document both credential IDs (elevated + reader) in the migration runbook. When a security reviewer approves M2M creation, scope minimization is a required check: if the proposed credential grants write scopes and any consumer only reads, require the split.

---

## Dual-path guard downgrade prevention

When a guard bridges two auth systems during a migration (legacy JWT + new provider), once a user has been migrated to the new provider, the legacy path MUST return 401 — not silently dispatch.

Canonical check: `if (user.<newProviderId>) return false` (or equivalent `throw Unauthorized`) at the start of the legacy-credential branch.

Without this check, a valid-but-superseded legacy credential remains usable indefinitely after migration, allowing continued access by anyone holding the old token. This applies to any identity-provider cutover, not only Auth0.

---

## Related rules

- Enum-valued feature success criteria must enumerate every enum branch (`rules/sub-agent-workflow.md` rule #9) — critical for dispute resolution, order state machines, auth state transitions.
- Use symbol/method-name references, not line numbers (`rules/sub-agent-workflow.md` rule #6) — critical for auth/refresh/grace-window branches where line numbers rot fast.

## Post-cutover dispatch integrity (Wave g26 lesson)

When a wave ships a parallel auth path (legacy + new) alongside a flag flip, the HybridAuthGuard (or equivalent dispatcher) MUST:
1. After successful legacy-path auth, check if the user has a migrated identity in the new system (`user.auth0Id` or equivalent).
2. If yes → return 401 (force user through new-path flow).
3. If no → accept legacy credentials (grace period).

This prevents an attacker who compromised a legacy session from continuing to authenticate via the legacy path after the user has migrated to the new identity provider. Without this check, session fixation survives migration.

## M2M scope minimization

Any external-service M2M credential with mutating scopes (`update:*`, `create:*`, `delete:*`) must have a sibling reader-only M2M for non-mutating consumers (cron reconciliation, metrics, audits). Granting broad scopes to a cron service = cron secret leak → attacker mutates prod.

## Stage 6 live E2E requirement for auth/session/user-creation waves (Wave g45 lesson)

Any wave that adds, removes, or replaces code in the authentication, session, or user-creation paths must include a **live end-to-end Auth0 round-trip in Stage 6**, not just code review. The wave does not merge without this validation documented in the closeout.

**Mandatory Stage 6 scenarios for auth-touching waves:**

1. **Fresh signup round-trip**: create a disposable account (e.g. mailinator), complete Auth0 signup + consent + callback, and assert `/api/auth/me` returns 200 with a valid session cookie set. This catches callback-handler regressions that route-inspection cannot see.
2. **Existing-user login**: sign in as a known test user, assert session persists across one navigation.
3. **Every modified endpoint**: exercise each auth-adjacent button, form, or flow the wave touched — click it, follow the redirect, check the terminal state against the expected state (not just "HTTP 200").
4. **Legacy/deprecated endpoint confirmation**: if the wave sunsets an endpoint, curl it post-deploy and confirm 404. Leaving decommissioned endpoints live is a security surface.

**Why this is non-negotiable:** Wave g41 passed Karen + Jenny gates because reviews were code-focused. Code review can validate that `/api/auth/logout?returnTo=/` is syntactically valid but cannot validate that bare `/` is accepted by the Auth0 tenant's Allowed Logout URLs allowlist. Code review can validate that `screen_hint=forgot_password` compiles but cannot validate that `forgot_password` is a supported Auth0 parameter. Only live round-trips catch these failures. g41 shipped; the regression stranded 100% of new signups for two days before Run 2 surfaced it.

**Stage 6 closeout artifact requirement:** wave closeout documents must link screenshots or paste terminal output for each auth scenario executed. "Code review passed" does not substitute.

## Auth0 SDK middleware delegation (Wave g45 lesson)

For `@auth0/nextjs-auth0` v4+ projects, `packages/web/src/middleware.ts` MUST delegate to `auth0.middleware(request)` for session handling to work. A no-op middleware (`return NextResponse.next()`) silently breaks: Auth0 redirects complete, the user lands on the app with `?code=&state=` in the URL, but the SDK never processes the code, the session cookie never gets set, and every downstream `/api/auth/me` call 401s or fallthrough-500s. Check this at architect-reviewer stage for any auth-adjacent wave. Symptom: "signup works in Auth0 UI but user still sees 'Sign in' in navbar."
