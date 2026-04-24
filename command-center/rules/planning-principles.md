# Planning Principles

Plan-authoring discipline applied at Stage 2 (plan authoring) and Stage 3 (gate verification). Complemented by `dev-principles.md` for execution and code-convention rules.

New rules enter via the Contract below — `/retro`, Stage 8/10 promotions, and manual edits all follow it (see CLAUDE.md always-on rule #13).

## Contract for new rules

Template:
### N. Imperative rule ending in a period.
Why: one declarative sentence.

- Before adding: grep for the concept — if a similar rule exists, do not add a near-dup.
- One sentence per line, short, commanding, cut to the chase.
- No war stories, wave refs, `Context:`, `Cross-ref:`, or project/stack names.
- Plan-template mechanics (front-matter fields, section structure, TaskMaster metadata) → the plan template file, not the numbered list.
- Number sequentially; renumber on insert.
- Group under an existing H2 unless ≥3 new rules share a theme.
- Wave-specific ("broke once") stays in the closeout until a second wave confirms.

---

## Verification

### 1. Verify planning-agent claims with grep or Read before passing the plan to implementers.
Why: planning agents hallucinate file paths, endpoint inventories, and "already exists" claims.

### 2. Read or grep the actual file before asserting any import site, route, or layout wrapper in the plan.
Why: Karen and Jenny verify claim-vs-spec, not claim-vs-codebase.

### 3. Before specifying a display format, grep every component that renders the same field and pick one canonical format.
Why: implementers can't audit cross-component format consistency; format drift is a plan defect.

### 4. Any plan writing new keys to an open-schema blob (`attributes[]`, metadata objects) must grep the display-layer reader and confirm key names match.
Why: open schemas bypass TypeScript contracts — writer/reader drift silently produces dark data.

## Plan style

### 5. Reference code by symbol or method name, not line numbers.
Why: line numbers rot the moment any upstream code changes; symbol references survive.

### 6. Success criteria for enum-typed features name every enum value and its expected side-effect.
Why: enum outcomes have N code paths; validating only the happy branch leaves the rest silently broken.

## Pre-flight

### 7. Probe Auth0 CLI scopes at Stage 2 before any Mgmt API wave; missing scope is a BLOCKER requiring re-auth before Stage 4.
Why: scopes are baked into the token at auth time and cannot be acquired mid-wave.

### 8. Every new GitHub Actions job declares `timeout-minutes` (≤15 unless explicitly justified) and `permissions` scoped to least-privilege.
Why: default timeout is 360 minutes and default permissions are write — both are zero-cost at plan time, expensive after a hung CI or supply-chain incident.
