# Planning Principles

Plan-authoring discipline distilled from cross-wave lessons. Applied at Stage 2 (plan authoring) and Stage 3 (gate verification). Complemented by `dev-principles.md` for execution and code-convention rules.

## How this file is maintained

- **Populated by:** `/retro` skill output — orchestrator routes plan-authoring lessons to this file (execution/deployment lessons go to `dev-principles.md`).
- **Not a dumping ground:** only principles that apply across multiple waves belong here. Wave-specific plan defects live in `Planning/wave-<N>-closeout.md`.
- **Maintenance:** prune stale principles during periodic reviews. If a principle hasn't fired in 10+ waves, it's either absorbed into another rule or no longer relevant.

## Entry format

```
### <Short imperative rule>
**Context:** What situation surfaced this lesson.
**Rule:** The actionable principle.
**Why:** The reasoning (1-2 sentences).
**Cross-ref:** `Planning/wave-<N>-closeout.md` where first observed (optional).
```

---

## Principles

### Verify planning-agent claims yourself
**Context:** Planning agents (especially `product-manager`) hallucinate file paths, line numbers, and "this endpoint already exists" claims.
**Rule:** Before passing any plan to implementers, independently verify load-bearing claims with `grep`/`Read` — particularly file paths and endpoint inventories.
**Why:** Plans that embed unverified hallucinated claims produce implementer failures that waste a full gate + execute cycle. Orchestrator verification is cheap; downstream rework is expensive.

### Plan-authoring claims about layout / routing / component ownership must be Read/Grep-verified
**Context:** Karen and Jenny pre-impl gates verify load-bearing source claims but are NOT layout-routing verifiers — they will not catch a plan asserting "X uses layout Y" when X actually uses a different layout.
**Rule:** When a plan references a specific file as the import site for a component, or asserts a route uses a particular layout/wrapper, Read or Grep that file to confirm before publishing the plan.
**Why:** Contract mismatches between the plan's asserted layout and the actual import surface silently break after implementation; gates verify the plan's claims against its own spec, not against the codebase layout.

### Display-format consistency is a plan-authoring responsibility
**Context:** When a plan specifies a display format for a numeric value (currency, percentage, rating, count), multiple components may render the same field with different formats.
**Rule:** Before specifying a display format in a plan, grep for other components that render the same field FIRST. If multiple formats exist, the plan must either pick one canonically or explicitly defer unification to a later wave.
**Why:** Implementers cannot audit cross-component format consistency on their own. Format drift across components is a plan-authoring defect, not an implementation defect.

### Plan text must use symbol/method-name references, not line numbers
**Context:** Line numbers rot the moment any earlier code is added or removed. A plan pointing to "line 47" is stale after any edit upstream.
**Rule:** Write references as "in the grace-window branch of `refresh()`, after the `findById` call" or "in `AuthService.login()`, after password verification, before `generateTokens()`". Exception: line numbers are acceptable in reality-check and closeout documents describing already-shipped code.
**Why:** Plans reviewed at Stage 3 then executed at Stage 4 often have upstream code changes mid-wave. Symbol-name references survive; line numbers don't.

### Success criteria for enum-valued features must enumerate every enum branch
**Context:** "Resolve a dispute end-to-end with an audit trail" is satisfiable by a single enum value (e.g., `SELLER_WIN`) while leaving `BUYER_WIN`, `PARTIAL_REFUND`, `MUTUAL` untested and silently broken.
**Rule:** When a feature has an enum-typed outcome dimension, success criteria must name every enum value and specify the expected side-effect for each. If a value is out-of-scope for this wave, say so explicitly. When a plan's success criteria exercises a code path calling pre-existing methods, audit those pre-existing method branches for completeness BEFORE writing the criteria.
**Why:** Enum-typed features have N code paths, not 1. Success criteria that validate only the happy-path branch leave hidden breakage across the other branches.

### Auth0 CLI scopes are not auto-expanded — probe before use on any Mgmt API wave
**Context:** Wave g25 — three CLI operations (action deploy, M2M grant, connections) failed mid-wave with scope errors because the existing token lacked the required scopes, which the plan had not probed in advance.
**Rule:** For any wave that creates or deploys Auth0 Mgmt API objects, Stage 2 plan must include a pre-flight scope probe (trial API call per scope class). If a scope is missing, surface as a BLOCKER requiring CLI re-auth before Stage 4 spawn. Do not allow scope gaps to surface mid-implementation.
**Why:** Auth0 scopes are baked into the token at auth time. Missing scopes cannot be acquired mid-wave without user re-auth, causing unplanned interruptions and timeline risk.
**Cross-ref:** `Planning/wave-g25-closeout.md` — first observed.

### Plans writing new keys to `attributes[]` must grep the display-layer reader
**Context:** Wave g56 — plan proposed stashing currency attribute keys (`stockQuantity`, `minQty`) in the listing `attributes[]` array. Karen and problem-framer both verified the write-path (submit handler + schema) but did not trace whether `attributes-grid.tsx` (display-layer reader) consumed those exact key names. Gemini caught the mismatch at Stage 3, forcing plan v3 revision.
**Rule:** Any wave plan that proposes writing new keys to `attributes[]` (or any open-schema write-path blob consumed by a separate reader component) must include a grep of the display-layer reader as a required verification step in the plan itself. Stage 3 gate (Karen + Jenny) must confirm the grep was performed and the key names match. BLOCK on missing grep or mismatched keys.
**Why:** Write-path completeness without display-path verification produces write-only dark data: the field is stored but never rendered, silently dropping value from the user's perspective. Open-schema blobs like `attributes[]` bypass TypeScript's contract checks, so key-name drift between writer and reader cannot be caught by compile or lint.
**Cross-ref:** `Planning/wave-g56-closeout.md` — first observed.

### Every new GitHub Actions job must declare `timeout-minutes` and `permissions`
**Context:** Wave g58 — the Docker-build CI job plan omitted `timeout-minutes` and `permissions`. Jenny caught both at Stage 3. GHA default timeout is 360 minutes; a hung BuildKit or cache-corrupted pnpm install would freeze PR CI for up to 6 hours. GHA default permissions are permissive write, violating least-privilege.
**Rule:** Any plan that introduces a new GitHub Actions job must include `timeout-minutes` (≤15 minutes unless the job is explicitly justified as longer, e.g. multi-platform matrix builds) and a `permissions` block scoped to least-privilege (`contents: read` for jobs that only need to read the repo). Stage 3 gate must confirm both keys are present. The Karen check on pinned action versions should also verify the major is not more than one release behind current stable.
**Why:** Missing timeout is a silent blast-radius trap: a single flaky job ties up the entire PR CI until the GHA job-level wall-clock ceiling. Missing permissions is a supply-chain risk surface. Both are zero-cost to add at plan time and expensive to discover after a hung CI incident.
**Cross-ref:** `Planning/wave-g58-closeout.md` — first observed.
