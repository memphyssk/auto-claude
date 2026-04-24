# Changelog

All notable changes to auto-claude's brain. Format: one section per release, following [Keep a Changelog](https://keepachangelog.com/). Versions follow [semver](https://semver.org/) with the following discipline:

- **Major (x.0.0)** — breaking changes to the wave loop, removed stages, or rule files renamed in a way that invalidates consumer references.
- **Minor (0.x.0)** — new stages, new rules, new trigger-table rows, new management modes, or additive changes to existing rules.
- **Patch (0.0.x)** — typo fixes, clarifications, cross-reference repairs.

The current brain version is always in [`command-center/VERSION`](./command-center/VERSION).

## Release template

Every release entry follows this structure. `Consumer sync` tells downstream projects what to do when pulling this release.

```
## vX.Y.Z — YYYY-MM-DD

### Added
- (new files, new sections, new features)

### Changed
- (behavioral or structural changes to existing files)

### Removed
- (deleted files, retired rules)

### Consumer sync
- **Breaking:** (yes/no — details if yes)
- **New files:** (list — safe to pull in full)
- **Changed files (safe-overwrite):** (list — purely additive to brain-owned content)
- **Changed files (review recommended):** (list — behavioral changes; run sync in interactive mode)
- **Migration action:** (none / short steps / link to migrations/vA-to-vB.md)
```

---

## v0.21.0 — 2026-04-24

First token-optimizer-informed release. Trims `CLAUDE.md` based on audit findings: inline skills list (runtime-injected, pure duplicate), TaskMaster command table (duplicates `--help`), and always-on rules 11-13 (4-11 line prose blocks compressed to 1-2 line directives).

### Changed
- **`CLAUDE.md`** — 158 → 133 lines:
  - **Skills list** → one-line pointer to `skill-use.md`. The runtime system-reminder injects all skills with their descriptions every turn; duplicating 26 skill names in CLAUDE.md was pure overhead.
  - **TaskMaster command table** (6 rows) → single sentence pointing at `npx task-master --help` for full command list plus the 6 common commands inline.
  - **Rule #11 (capability sheet)** — 4 paragraphs → 1 sentence. Session-start generation command kept; example deferrals and "does NOT override consent gates" footnote deleted (covered by other always-on rules).
  - **Rule #12 (agent catalog check)** — 2 paragraphs → 1 sentence. Procedural checklist pointer preserved.
  - **Rule #13 (principles Contract)** — 3 paragraphs → 1 sentence. Format spec pointer preserved.

### Measured savings
- Per-message overhead: ~4,422 tokens (auto-claude CLAUDE.md) → ~3,679 tokens (-743 tokens, -17%).
- Global context overhead (measured by token-optimizer): 26,779 → 25,627 tokens (-1,152 tokens, -4.3% overall).

### Consumer sync
- **Breaking:** no. Content preserved; only the verbose prose around rules was trimmed. Rule numbers, trigger table, and section structure unchanged.
- **Changed files (review recommended):** `CLAUDE.md`.
- **Migration action:** none.

---

## v0.20.1 — 2026-04-24

Removes the per-file redundant pointer lines added in v0.20.0. The always-on rule #13 in CLAUDE.md + housekeeping.md paragraph already cover every write path; the five "New rules enter via the Contract below..." lines in each principles file were noise.

### Changed
- `rules/dev-principles.md`, `rules/planning-principles.md`, `rules/testing-principles.md`, `rules/monitors/monitor-principles.md`, `test-writing-principles.md` — removed the one-line pointer below each intro.

### Kept
- CLAUDE.md rule #13 (the actual enforcement).
- `rules/housekeeping.md` Stage 8 paragraph (Stage-8-specific reinforcement).

---

## v0.20.0 — 2026-04-24

Enforces Contract compliance on every write to `*-principles.md` files. Two-layer approach: an always-on rule in CLAUDE.md (catches all write paths) + per-file pointers that cite the rule. No new infrastructure, no validation scripts — just systematic reminders at every plausible write site.

### Added
- **Always-on rule #13 in `CLAUDE.md`** — "Before appending to any `*-principles.md` file, read its 'Contract for new rules' block at the top and match the format exactly." Calls out the Contract's governance surface (rule shape, numbering, H2 placement, prohibited content, per-file spillover) and applies the rule to all three write paths: `/retro` routing, Stage 8/10 promotions, manual edits. Includes a self-review gate: re-read the Contract before committing.

### Changed
- **`command-center/rules/dev-principles.md`, `planning-principles.md`, `testing-principles.md`, `monitors/monitor-principles.md`, `test-writing-principles.md`** — each gets one-line pointer right below the intro: "New rules enter via the Contract below — `/retro`, Stage 8/10 promotions, and manual edits all follow it (see CLAUDE.md always-on rule #13)." Makes the Contract's authority explicit regardless of where the writer arrived from.
- **`command-center/rules/housekeeping.md`** — Stage 8 closeout section gets a new paragraph: when a closeout surfaces a cross-wave pattern, route to the matching principles file following that file's in-file Contract. Targets the known Stage 8 write path.

### Not done (deferred)
- **Validation script / pre-commit hook** — regex over markdown would be brittle; not worth the maintenance surface at current volume.
- **`/append-principle` wrapper skill** — strongest enforcement, but replaces `/retro` flow and builds a new skill. Overkill unless Layer 1+2 fails to hold.
- **Agent-instruction updates for karen / technical-writer / knowledge-synthesizer** — those agents don't currently write to principles files at Stage 10. Would only matter if we later route principles promotions through them.

### Consumer sync
- **Breaking:** no. Additive across six files; no rule renamed or removed.
- **Changed files (safe-overwrite):** `CLAUDE.md`, 5 principles files (intro lines), `command-center/rules/housekeeping.md`.
- **Migration action:** none. Enforcement activates automatically on next session — the always-on rule is self-applying.

---

## v0.19.0 — 2026-04-24

Phase 3 of `test-writing-principles.md` cleanup: four structural optimizations that remove redundancy and tighten the rulebook. File shrinks 1007 → 929 lines (-78). No rule lost; rule count grows 20 → 22 (two promoted from deleted prose subsections).

### Changed
- **Priority Levels section deleted + RFC 2119 bolding unbolded across the file.** `**MUST**`, `**MUST NOT**`, `**SHOULD**`, `**MAY**` → plain uppercase. The formal RFC 2119 scaffolding is gone; terms remain in body prose as uppercase emphasis. The master § Rules at the bottom already uses plain imperatives (no bolding).
- **§ 2 "When to Use Mocks (Quick Lookup)" table deleted.** Was a duplicate of § 8 Mocking Rules. Replaced with a one-line pointer to § 8 as canonical. Removes the "which table is authoritative?" ambiguity.
- **§ 0 Pre-Flight Checklist + § 1 Agent Instructions collapsed.** § 0 renamed "Agent Workflow", absorbs the single novel directive from the old § 1 (document-structure rules: don't rewrite existing sections, don't renumber, append-only to § 14). § 1 becomes a 2-line pointer to § Rules at the bottom.
- **§§ 15.1-15.10 prose subsections deleted.** All 10 principles had Rule counterparts (#11-#20) at the bottom except 15.6 (Persona discipline) and 15.10 (Prod fixture source of truth), which are now promoted to Rules #21 and #22. § 15 becomes a 3-line intro + a "Prod fixture registry" subsection retained for the `Planning/test-accounts.md` reference. Implementation patterns are still in § 16.

### Added
- **Rule #21**: "Test every relevant persona in the project's role enum: unauthenticated visitor + every authenticated role." (promoted from deleted § 15.6)
- **Rule #22**: "Use prod fixtures from `Planning/test-accounts.md` for live E2E; never use `*@example.test` credentials against prod auth." (promoted from deleted § 15.10)

### Consumer sync
- **Breaking:** no. Section numbers (§ 0-§ 16 + § Rules) preserved. Rule numbers 1-20 preserved; rules 21-22 are additive.
- **Changed files (review recommended):** `command-center/test-writing-principles.md`.
- **Migration action:** consumers that cited `§ 15.1-15.10` should migrate to the equivalent Rule numbers (11-20) or to § 16 for implementation detail.

---

## v0.18.0 — 2026-04-24

Phase 2 of the `test-writing-principles.md` cleanup: aligns the file's rule-accumulating portions with the Contract format used across the rest of the principles files. Tutorial/reference sections (§§ 2-13, 15-16 methodology, Priority Levels) stay untouched — they're not rulebook material.

### Added
- **Contract block at the top** — same 7-bullet spec as dev/planning/testing/monitor. Governs both append targets in this file: § 14 (wave-discovered patterns log) and § Rules (master list at the bottom). Bullet 4 scoped to project-domain placeholders: "Project-domain detail (business modules, user roles, entity names) → `<placeholder>` tokens, not the numbered list."

### Changed
- **§ 1 Critical Rules (Never Violate)** — deleted. The 8 bolded MUST bullets duplicated the Quick Reference at the bottom. Replaced with a 2-line pointer: "See **§ Rules** at the bottom of this file for the master list." Under-§1 subheading renamed "Non-negotiable rules."
- **§ 14 Auto-Updated Rules Entry Template** — rewritten to Contract format. Old template (Context / Rule / Example / Discovered by) replaced with `### N. Imperative rule ending in a period.\nWhy: one declarative sentence.\n\n(optional) code snippet`. Old § 14 header blurb (RFC 2119 MUST/MUST NOT about appending) softened to plain imperative. The "Entries" placeholder stays as Phase 1 left it.
- **"Quick Reference — Non-Negotiable Rules" section** — renamed to `## Rules`. 20 bolded MUST/MUST NOT bullets → 20 Contract-format entries (rule + Why). Preserves the Code-level / Production-E2E H3 split. Rules 3, 8, 17, 18, 19 rephrased into natural imperative voice (no leading MUST/MUST NOT). Rules now number identically to before (1-20) so external references by number keep working.

### Not changed (intentional)
- **Priority Levels section** — kept at top. Body sections (§§ 5, 7, 8, 9, 10, 11, 12, 15) still use MUST/SHOULD as tutorial emphasis; the Contract doesn't ban them from tutorial prose.
- **§§ 15.1-15.10 Production E2E Principles** — kept as prose subsections with MUST/SHOULD emphasis. These have load-bearing detail (lists of what to test per entity type, multi-paragraph rationale) that wouldn't survive conversion to one-line imperatives. The master Rules at the bottom summarize them; §§ 15.1-15.10 is the detailed spec.
- Section numbering § 0 through § 16 — consumer projects and agent prompts cite section numbers; renumbering would break external references.
- **§ 13 Anti-Patterns** and **§ 16.7 Anti-Patterns** — the WRONG/WHY/RIGHT code examples are load-bearing teaching material, not rule material.
- **§ 2 Decision Tree, § 3 Testing Stack, § 4 commands, § 5 conventions, § 6 tier tables, § 7 patterns, § 8 mocking rules, §§ 9-12 data/security/state/coverage** — reference and tutorial material.

### Rationale
Phase 1 (v0.17.0) made the file project-agnostic. Phase 2 aligns its rule sections with the brain-wide Contract so `/retro` and future authors can append new test rules in the same shape as dev/planning/testing/monitor. The file now has two valid append targets (§ 14 for wave-specific patterns; § Rules for cross-cutting non-negotiables) — both Contract-governed.

### Consumer sync
- **Breaking:** no. Rule numbers (1-20) preserved. Section numbers (§ 0-§ 16 + § Rules) preserved. External references by `§N` or Rule number keep working.
- **Changed files (review recommended):** `command-center/test-writing-principles.md`.
- **Migration action:** none for projects that reference rule numbers. Projects that referenced `§ 1 Critical Rules` sub-bullets should update to `§ Rules #N`. Projects appending to § 14 should follow the new Contract-format entry template.

---

## v0.17.0 — 2026-04-24

Phase 1 of the `test-writing-principles.md` cleanup: strips project-specific content (Eldorado marketplace domain) so the file reads as a project-agnostic tester guide. Format (RFC 2119 priority terms, §14 append-only protocol, Section 0 Pre-Flight Checklist, Quick Reference at bottom) stays as-is — Phase 2 (Contract block + format alignment) is a separate future release.

### Changed
- `test-writing-principles.md` — front-matter, intro, and 15 body sections genericized:
  - Front-matter dropped project-name-bound description, `last_updated`, `version`, `schema_version`, `pattern_count`, `antipattern_count` (all Eldorado-specific metadata). Description now names the default brain stack (Vitest, NestJS, React, Zod, Prisma) and flags `<placeholder>` tokens.
  - Intro replaced with project-agnostic framing; placeholder-token convention documented.
  - §2 Decision Tree: "If financial (orders/disputes)" → "If financial (payments/ledgers/any decimal-money path)".
  - §2 Mocks table: "Stripe/S3/External API" → "Payment provider / S3 / external API".
  - §6 Risk-Based Test Prioritization: 3 tables rewritten from Eldorado module names (orders, disputes, kyc, auth, payments, listings, reviews, notifications, uploads, games, users) to pattern-based framing (`state-machine money flows`, `authorization / dispute resolution`, `identity verification`, `public query filters`, `unique-constraint + ownership`, `multi-tenant isolation`, etc.) with explicit `<tier-N-module>` replacement guidance.
  - §7.5 `createListingSchema` example → generic `createItemSchema` (strips `Gold Pack`, `gameId`, `deliveryTimeHours`, `imageUrls`).
  - §8 Mocking Rules: `External APIs (Stripe, S3, Sumsub)` → generic; `sendOrderCreatedEmail` → `sendWelcomeEmail`.
  - §9 Integration Tests user table: `seller@example.test`/`buyer@example.test` → `<role-a>@example.test`/`<role-b>@example.test`. `role: 'BUYER'` → `role: 'USER'`.
  - §9 `truncateAll` table list: Eldorado Prisma models (`DeliveryProof`, `OrderEvent`, `Dispute`, `Listing`, `SellerBalance`, `Game`, etc.) → placeholder-driven pattern with topological-sort guidance.
  - §10 intro: "marketplace handling real money and personal KYC data" → generic Tier 1 framing applicable to marketplace / SaaS / multi-tenant systems.
  - §10.1 RBAC: `buyerToken` → `nonAdminToken`.
  - §10.2 IDOR: `buyer A cannot view buyer B order` → `user A cannot view user B resource` with `<resources>` placeholder.
  - §10.3 Webhook signature: `Stripe webhook` → generic `/webhooks/<vendor>` with `<vendor>-signature` header, plus vendor-header-naming guidance listing `stripe-signature`, `x-hub-signature-256` as examples among others.
  - §11 State Machine Testing: three subsections fully rewritten from Order/Dispute specifics (10-state OrderStatus, 6-state DisputeStatus, `PARTIAL_REFUND`, `KycStatus.NONE`) to generic `<EntityStatus>`/`<TERMINAL_STATE>` state-machine framing. §11.3 adversarial scenarios reworded for any domain.
  - §12 Coverage: "Tier 1 modules (orders, disputes, kyc, auth)" → "Tier 1 modules".
  - §14 Entries: removed the two dated Eldorado entries (2026-04-08 E2E principles wave-5a, 2026-04-09 PresenceDot hasData pattern). Replaced with a "No entries yet" placeholder. Entry Template preserved.
  - §15.6 Persona discipline: "buyer, seller, admin" → "every authenticated role in the project's role enum".
  - §15.10 Prod fixture source of truth: Eldorado specifics (`g124 KYC VERIFIED`, `g91`, `Auth0 user_ids`, `Prisma User.ids`, `ROPG scripts`, `SUPER_ADMIN`) → generic `<ROLE_A>`/`<ROLE_B>` pattern with identity-provider-agnostic language.

### Not changed (preserved)
- Section numbering (§0-§16 + Quick Reference) — consumer projects and agent prompts cite section numbers.
- RFC 2119 terminology (MUST / SHOULD / MAY) — Phase 2 territory.
- §7 code examples that use generic names (UsersService, UsersController, LoginForm) — already project-agnostic.
- §13 Anti-patterns 1-5 and §16.7 Anti-patterns 6-10 — generic testing anti-patterns with load-bearing code examples.
- §16 Production E2E Methodology (WebSocket instrumentation, React synthetic event verification, ES-module-vs-window-global discipline, status taxonomy, tester swarm pattern, deliverable format) — all framework-generic.
- Quick Reference at bottom — 20 rules, already project-agnostic in wording.
- `pnpm` commands and stack assumptions — brain-wide default stack.

### Phase 2 (not in this release)
Applying the Contract block + flat-numbered rules format (per v0.14.0/v0.15.0 pattern) is deferred. Would touch the Quick Reference, §1 Critical Rules (likely removed as redundant), §15.1-15.10 MUST/SHOULD principles, and the §14 entry template. Separate minor release when prioritized.

### Consumer sync
- **Breaking:** no new behavior, but placeholders were introduced. Consumer projects (Eldorado) that relied on Eldorado-specific module names in this file should keep their own fork of §6 tiers / §11 state machines / §15.10 prod fixtures — or replace placeholders with their actual values on sync.
- **Changed files (review recommended):** `command-center/test-writing-principles.md`.
- **Migration action for existing consumer projects:** on sync, review §6, §7.5, §9, §10, §11, §15.10 and either (a) overwrite placeholders with project-specific content, or (b) keep brain version as a template and maintain a project-specific derivative. Eldorado's existing content that used to live here should move to Eldorado's private docs (not this file).

---

## v0.16.1 — 2026-04-24

Trims monitor-principles Contract bullet 4 to just "Compact inline." — the v0.16.0 wording carried explanatory text ("never extract platform-specific detail to separate files, even if CLI names push word count") that restated the rule rather than adding it.

### Changed
- `rules/monitors/monitor-principles.md` Contract bullet 4 → "Compact inline."

---

## v0.16.0 — 2026-04-24

Extends the Contract pattern to `monitor-principles.md`, scoped to the rulebook portion of the file (anti-patterns section) only. State machine, three-condition spec, poll log format, self-audit, and platform template pointers stay as-is — those are protocol reference, not rule accumulation.

### Added
- **Contract block in `rules/monitors/monitor-principles.md`** — same 7-bullet pattern as dev/planning/testing. Bullet 4 rescoped to: "Compact inline — never extract platform-specific detail to separate files, even if CLI names push word count." CLI names and state endpoints stay with their rules; no extraction-to-template fallback.

### Changed
- `rules/monitors/monitor-principles.md` — "Named anti-patterns (protocol violations)" section (5 prose bullets of ~50 words each) → 5 flat-numbered rules with one-line action + one-line why. Heading renamed from "Named anti-patterns (protocol violations)" to "Anti-patterns" since the numbered rules carry the non-negotiable weight on their own.

### Not changed (intentional)
- `test-writing-principles.md` — master reference guide with its own internal discipline (RFC 2119 MUST/SHOULD/MAY terms, versioned front-matter schema, §14 append-only protocol with its own entry template). Imposing the Contract creates format-on-format drift inside one file. Left under its existing discipline; if a full port is wanted it's a separate minor release.

### Consumer sync
- **Breaking:** no. Content is behaviorally equivalent; 5 protocol violations are now 5 numbered rules with the same semantics.
- **Changed files (review recommended):** `command-center/rules/monitors/monitor-principles.md`.
- **Migration action:** consumers citing `monitor-principles § "Named anti-patterns"` should update to `monitor-principles § "Anti-patterns" #N`.

---

## v0.15.1 — 2026-04-24

Topic-scopes the Contract's spillover bullet per file. v0.15.0 propagated the dev-flavored "Stack-specific detail → § Code conventions" bullet unchanged to planning and testing, where it didn't map to the right spillover category.

### Changed
- `rules/planning-principles.md` Contract bullet 4 → "Plan-template mechanics (front-matter fields, section structure, TaskMaster metadata) → the plan template file, not the numbered list."
- `rules/testing-principles.md` Contract bullet 4 → "Framework-specific patterns (Vitest mocks, Playwright selectors, assertion helpers) → `test-writing-principles.md`, not the numbered list."
- `rules/dev-principles.md` — no change; the dev bullet was already correctly scoped.

### Consumer sync
- **Breaking:** no. One-bullet rescope per file.
- **Changed files (safe-overwrite):** `command-center/rules/planning-principles.md`, `command-center/rules/testing-principles.md`.

---

## v0.15.0 — 2026-04-24

Propagates the v0.14.0 flat-numbered-rule format across the remaining retro-target principles files. Adds a "Contract for new rules" block at the top of every rulebook-shaped principles file — single source of truth for anyone (retro, Stage 10, orchestrator, human) writing new rules.

### Added
- **"Contract for new rules" block** added at the top of `dev-principles.md`, `planning-principles.md`, and `testing-principles.md`. Identical 7-bullet spec: template + hard rules about one-sentence discipline, no war stories, no wave refs, no stack leakage, sequential numbering, no near-duplicates, and a wave-specific-stays-in-closeout gate.

### Changed
- `rules/planning-principles.md` — rewritten from 5 × 4-field `Context/Rule/Why/Cross-ref` blocks into 8 numbered imperatives grouped under Verification / Plan style / Pre-flight. 66 lines → 44 lines.
- `rules/testing-principles.md` — 7 numbered bullets tightened from multi-sentence prose to one-line action + one-line why. Canonical-docs pointer section preserved at top as-is.
- `rules/dev-principles.md` — intro prose replaced with the condensed Contract block (file body unchanged since v0.14.0).

### Not changed (intentional)
- `rules/monitors/monitor-principles.md` — protocol doc with a state machine and platform templates, not a retro target. Flat-rules rewrite would destroy the procedural semantics.
- `test-writing-principles.md` — master reference guide with RFC 2119 priority terms, versioned schema, and its own append-only protocol (`append to Section 14 using the entry template; do not edit existing sections`). Different doc type.

### Rationale
The v0.14.0 rewrite proved the rulebook format works for `dev-principles.md`. Extending the same format to the two other retro-written principles files (`planning-`, `testing-`) is additive — no lessons dropped, just narrative stripped. The Contract block makes the format self-policing: the next retro write has to read the spec to add a rule, and format violations stand out visually against the surrounding one-liners.

### Consumer sync
- **Breaking:** no. Content is behaviorally equivalent; only format changed. Rules that were nested under multi-sentence whys are now numbered individually — consumers that cited rules by heading ("per planning-principles § 'Plans writing new keys to attributes[]'") must update to rule numbers.
- **Changed files (review recommended):** `command-center/rules/dev-principles.md`, `command-center/rules/planning-principles.md`, `command-center/rules/testing-principles.md`.
- **Migration action:** grep consumer repos for `dev-principles §`, `planning-principles §`, `testing-principles §` and update to `#N` form.

---

## v0.14.0 — 2026-04-24

`dev-principles.md` rewritten as a flat numbered rulebook. 32 imperative rules, each a single line of action + a single line of why. War-story framing ("Context:", "Cross-ref: Planning/wave-g25-closeout.md") stripped — CHANGELOG entries and closeouts carry history, rule text carries current behavior.

### Changed
- `rules/dev-principles.md` — full structural rewrite:
  - 171 lines → 171 lines (similar length, ~2x rules, ~1/3 the prose).
  - Karpathy sub-section (4 clustered rules with bullet lists) → 19 atomic imperatives across "Authoring discipline / Simplicity / Surgical changes / Verify done".
  - "Principles" section (5 entries with 4-field `Context/Rule/Why/Cross-ref` blocks) → 5 one-liner rules under "Error handling / Infrastructure gotchas / Git discipline".
  - Senior-engineer test ("would a senior engineer say this is overcomplicated?") promoted to rule #1.
  - "How this file is maintained" + "Entry format" meta-sections collapsed to a single line at top.
  - "Code conventions" section kept inline (per-project contract) with a one-line explanatory intro.

### Rationale
A principles file that sub-agents have to skim in the first 30 seconds of a Stage 4 spawn can't carry narrative about wave g25 or quote a full paragraph on why Dynadot partial-set is destructive. Rule text should answer "what must I do?" in one sentence; rule rationale should answer "why?" in one more. Anything longer belongs in CHANGELOG or closeout files.

### Consumer sync
- **Breaking:** no. Content is behaviorally equivalent; only format changed. No rule dropped, no new rule added.
- **Changed files (review recommended):** `command-center/rules/dev-principles.md`.
- **Migration action:** none. Projects that reference specific rules by heading (e.g., "per dev-principles § 'Simplicity First'") need to update references to rule numbers (e.g., "dev-principles #6-10"). Grep your consumer repo for `dev-principles` references.

---

## v0.13.1 — 2026-04-24

Tone + behavior cleanup on v0.13.0. Removes war-story provenance (sim-001 failure names) from rules themselves — the CHANGELOG is the place for that history, not the always-on rule text. Also softens the "halt" directive to "substitute with the closest match" so the gate never blocks forward motion.

### Changed
- `CLAUDE.md` rule #12 — dropped the sim-001 anecdote ("already observed in sim-001 where the plan named `node-specialist`..."); dropped the "halt and surface to founder" option. The gate is now install-or-substitute, no halt branch.
- `rules/sub-agent-workflow.md` § "Before every sub-agent spawn" — dropped the sim-001 failure-class paragraph; softened "STOP" language in Steps 1-2 to "substitute" / "flag as defect and substitute". The gate informs but does not block.
- `rules/build-iterations/stages/stage-4-execute.md` Action 1 — "halt per rule #12" → "pick the one that resembles it the most and note the swap in the spawn context."

### Rationale
War-story citations in rule text age poorly — they turn into trivia once the originating incident fades from memory. CHANGELOG entries carry history; rule text carries the current behavior. And "halt" as a default branch on a gate that fires at every spawn creates a new failure mode (stuck waves) for the sake of a rare case — substitution is the correct default.

### Consumer sync
- **Breaking:** no. Softens v0.13.0 behavior; no rule added or removed.
- **Changed files (safe-overwrite):** `CLAUDE.md`, `command-center/rules/sub-agent-workflow.md`, `command-center/rules/build-iterations/stages/stage-4-execute.md`.

---

## v0.13.0 — 2026-04-24

Enforces agent-catalog verification before every sub-agent spawn. Adds always-on rule #12 (headline) + pre-spawn checklist (procedure) so plans and rituals can't reference agents that aren't actually callable on the machine.

### Added
- **Always-on rule #12 in `CLAUDE.md`** — "Before spawning any sub-agent, verify it exists in the catalog." Mandates a check against `Planning/.capability-sheet.md` (section "Agents at ~/.claude/agents/") before every spawn; if absent → install or substitute with the closest catalog match. Points at the procedural checklist for execution detail.
- **"Before every sub-agent spawn" 3-step gate in `rules/sub-agent-workflow.md`** — (1) consult capability sheet, (2) read instruction file as FIRST directive, (3) consult alternatives. Replaces the prior "Before every spawn" stub with the full catalog-first procedure.

### Changed
- `rules/build-iterations/stages/stage-4-execute.md` — Action 1 now explicitly names the capability sheet as the roster source. If the plan names an agent not in the sheet, pick the closest resemblance and note the swap in spawn context.

### Rationale
Both plan-authoring (Stage 2) and execution (Stage 4) could previously reference agents by name without any verification step. A single rule couldn't cover both — plan time wants a catalog lookup at authorship, execution time wants a pre-spawn gate regardless of how the name arrived. Option C (headline rule + procedural checklist) covers both surfaces with minimal redundancy: the rule is the always-on intent, the workflow file is the executable steps.

### Consumer sync
- **Breaking:** no. Adds a pre-spawn step; does not invalidate any existing spawn — existing spawns still work if the named agent is in the catalog. Projects without `Planning/.capability-sheet.md` generate it on first turn per rule #11.
- **Changed files (review recommended):** `CLAUDE.md`, `command-center/rules/sub-agent-workflow.md`, `command-center/rules/build-iterations/stages/stage-4-execute.md`.
- **Migration action:** none. On next session start, capability sheet generation (already mandated by rule #11) supplies the catalog; rule #12 then activates automatically.

---

## v0.12.4 — 2026-04-24

Cleanup. Removes speculative cost-awareness notes (`~60-100K wasted tokens`) from the v0.12.3 design-gap-flag contract edits. The rule stands on its own merit (fail-loud > fail-silent); the synthetic cost numbers from sim-001 estimates shouldn't propagate into production specs.

### Changed
- `Sub-agent Instructions/problem-framer-instructions.md` — dropped "~60-100K wasted tokens" from § 5 rationale
- `rules/build-iterations/stages/stage-1-problem-reframing.md` — dropped "~60-100K wasted" from Design-gap flag section
- `rules/build-iterations/stages/stage-2-plan.md` — dropped "~60-100K tokens wasted" from consistency-check item 4

### Consumer sync
- **Breaking:** no. Text-only cleanup.

---

## v0.12.3 — 2026-04-24

Closes the `design_gap_flag` contract gap surfaced by sim-001. Four coordinated edits make the flag mandatory at authorship + fail-loud on absence.

### Fixed
- **problem-framer was never told to emit `design_gap_flag`.** Stage 1 spec expected it; Stage 2 plan assumed it; Stage 3b skip conditions required it — but `Sub-agent Instructions/problem-framer-instructions.md` had zero mentions. Agent could (and did, in sim-001) skip the flag entirely, leaving Stage 3b's skip logic ambiguous.

### Changed
- `Sub-agent Instructions/problem-framer-instructions.md` — new § 5 "Design-gap flag (MANDATORY emit — true or false, never absent)" with emission rules + uncertainty guidance + rationale field. Output format template gets an explicit `## 5. Design gaps` block.
- `rules/build-iterations/stages/stage-1-problem-reframing.md` — "Design-gap flag" section rewritten with MANDATORY framing, cost-awareness note (~60-100K wasted if absent), explicit instruction to emit `false` for non-UI tasks rather than defaulting.
- `rules/build-iterations/stages/stage-2-plan.md` — post-write consistency check gains item 4 verifying `design_gap_flag` is present and explicitly set.
- `rules/build-iterations/stages/stage-3b-design-gap.md` — skip conditions clarified ("explicitly set, not absent") + new "Absent-flag rule" section: missing flag = treat as `true`, fire defensively, log plan-authoring defect for retro surfacing.

### Semantic contract (the new rule)

| State of flag at Stage 3b entry | Stage 3b action |
|---|---|
| Both Stage 1 + Stage 2 output have explicit `false` | SKIP (as before) |
| Either output has explicit `true` | FIRE (as before) |
| **Either output has flag absent** | **FIRE defensively + log plan-authoring defect** (new — was undefined) |

Fail-loud preferred over fail-silent: a missing flag might hide genuine UI surface; ~60-100K defensive Stage 3b fire is cheaper than silently missing a required mockup and discovering it mid-Stage-4.

### Provenance
Finding surfaced during sim-001 Stage 3b analysis. See `Planning/sim-001-report.md` § Stage 3b for detection trail.

### Consumer sync
- **Breaking:** no for existing project state, BUT existing waves that relied on absent-flag-as-implicit-false will now see Stage 3b fire defensively until the flag is explicitly emitted.
- **Changed files:** 1 instruction file + 3 stage specs + VERSION
- **Migration action:** problem-framer agents on active projects will start emitting the flag on next spawn. Existing wave plans with absent flags should be patched with an explicit `design_gap_flag: false` (or `true`) entry; otherwise the next Stage 3b run fires defensively.

---

## v0.12.2 — 2026-04-24

Two fixes from sim-001 findings to `roadmap-refresh-ritual.md`.

### Fixed
- **Missing instruction file:** `command-center/Sub-agent Instructions/trend-analyst-instructions.md` created. Was referenced by `roadmap-refresh-ritual.md` Step 1b + the "READ before spawning" line but never authored. First-run consumer projects would have hit a file-not-found on the mandated READ. Now authored with scope, methodology, output format, failure modes, and reading list — matching the style of other brain agent instruction files.

- **Hardcoded sector scope:** Step 1b "Trend-forward scan" previously said `Scope: gaming marketplace sector, ~60–90 day window` — a kvik/eldorado source-project assumption that broke for any non-marketplace project. Generalized to "project's sector as inferred from FOUNDER-BETS.md + active ROADMAP.md milestone themes." The trend-analyst's instruction file's reading list formalizes how sector inference works.

### Unchanged (deliberately)
- Step 1a Playwright-swarm mandate (`ui-comprehensive-tester` × 3 on Playwright instances) — founder decision to keep as-is even for non-web projects. Trade-off accepted: consumers with non-browsable competitors will need to adapt Step 1a inline rather than relying on spec branching.

### Provenance
Both findings surfaced during sim-001 Pre-wave A run. See `Planning/sim-001-report.md` § Pre-wave A.

### Consumer sync
- **Breaking:** no.
- **New files:** `Sub-agent Instructions/trend-analyst-instructions.md` — safe to pull
- **Changed files:** `roadmap-refresh-ritual.md` Step 1b scope sentence, VERSION
- **Migration action:** none.

---

## v0.12.1 — 2026-04-24

Fixes a stale v0.9.0 rename leftover caught by the sim-001 simulation run.

### Fixed
- `CLAUDE.md:64` trigger-table row for `danger-builder` mode had four stale Resend references that were missed during the v0.9.0 Resend→AgentMail rename. The row pointed at deleted `notifications/resend.md`, said "Resend notifications," said "Resend env vars set," and described email delivery with Resend-era single-direction semantics.

All four corrected:
- `per-decision Resend notifications` → `per-decision AgentMail notifications`
- `notifications/resend.md` (deleted file) → `notifications/agentmail.md`
- `Resend env vars set` → `AgentMail env vars set (AGENTMAIL_API_KEY + CEO_INBOX_ID + CEO_NOTIFY_EMAIL_TO)`
- Added `founder replies in-thread` to reflect the two-way-flow semantics that were missing
- Email-spec description updated to `(per-decision email spec with two-way flow)`

### Provenance
Security-engineer agent caught this during Stage 4 of wave-loop simulation sim-001. See `Planning/sim-001-report.md` § Stage 4 for the detection trail. A real consumer running `danger-builder` mode would have hit a broken file reference at mode-entry prerequisite check.

### Consumer sync
- **Breaking:** no. Pure doc fix.
- **Migration action:** none. Consumers syncing to v0.12.1 get the corrected CLAUDE.md trigger row.

---

## v0.12.0 — 2026-04-24

Adds an **Author behavior** section at the top of `dev-principles.md`. Six rules covering the pre-commit author moment: how to approach work, what to write, what to leave alone. Adapted from Karpathy's CLAUDE.md guidelines with auto-claude-specific additions.

### Added
- `command-center/rules/dev-principles.md` § Author behavior — new section placed at the top of the file (before "How this file is maintained"). Six rules:
  1. **Think Before Coding** (Karpathy) — surface assumptions and tradeoffs; don't pick silently; ask when unclear
  2. **Simplicity First** (Karpathy) — minimum code that solves the problem; nothing speculative; no premature abstractions
  3. **Surgical Changes** (Karpathy) — touch only what you must; every changed line traces to the request
  4. **Verify Before Claiming Done** (Karpathy, adapted) — runnable check before declaring done; explicitly scoped to within-stage discipline, not cross-stage (wave-loop owns that)
  5. **No Silent Error Handling** (auto-claude) — every caught error named, rethrown, or documented as safe to swallow; named exception classes; no bare `catch (e)`
  6. **Prefer Deletion** (auto-claude) — smaller-change framing; inline helpers used <3 times; zombie code dies in the commit that created it

### Adapted Karpathy rule #4 for wave-loop compatibility
The original Karpathy rule 4 ("Goal-Driven Execution") prescribed "state a brief plan" and "loop independently" — both of which conflict with the wave-loop's Stage 2 (plan authoring) and the orchestrator's control of when to loop. The rewrite keeps the essential insight ("verify before claiming done", "know what done looks like") while explicitly scoping to within-stage discipline and noting "does not override wave-loop.md stage structure."

### Consumer sync
- **Breaking:** no. Additive section at the top of dev-principles.md.
- **Sync mode:** dev-principles.md is already `interactive:` in `.brainignore`, so consumer projects see this as a hunk-by-hunk review on next sync. Accept to adopt; skip to keep your current file.
- **Migration:** none required. The new section complements existing retro-promoted Principles + Code conventions sections — they stay untouched.

---

## v0.11.0 — 2026-04-24

Fixes a chronic agent failure: forgetting that installed tools (MCPs, CLIs, skills) exist mid-conversation and deferring to the founder on tasks the agent could do itself. Adds always-on rule #11 enforcing enumeration-before-deferral + a session-start capability sheet that makes enumeration nearly free.

### Added
- `bin/auto-claude-capabilities` — new subcommand that enumerates runtime-callable tools: global CLIs (via `command -v`), skills (via `ls ~/.claude/skills/`), agents (via `ls ~/.claude/agents/`), MCP servers (via parsing `~/.mcp.json` + `~/.claude.json`). Output is ~100 lines of dense markdown meant for `Planning/.capability-sheet.md`. Script is dispatcher-routed, so callable as `auto-claude capabilities`.
- `bin/auto-claude` dispatcher — adds `capabilities` subcommand to route table + help text.

### Changed
- `CLAUDE.md` — new always-on rule #11: "Before deferring to founder on any operational task, enumerate available tools." Documents the session-start capability-sheet generation + the consult-before-deferral contract. Explicitly notes the rule does NOT override consent gates, hard-stops, or charter restrictions.

### Why this release
This is a behavioral fix for a real pattern:
- "Please add a CNAME record for X" (when domain-mcp is available)
- "Paste this JSON into ~/.mcp.json" (when a CLI could do the config edit)
- "Check if Railway deploy succeeded" (when `railway` CLI is on PATH)
- "Send this email yourself" (when agentmail is wired + has the right inbox)

The failure isn't lack of knowledge — it's lack of *recall at the moment of deferring*. Rule #11 turns that recall into a cheap pre-action gate: a 100-line sheet is fast to read; re-reading `setup-tools/install.md`'s 500 lines of installation docs is not. The sheet is authoritative about what IS callable; install.md documents what SHOULD be installed.

### Policy highlights
- **The sheet is runtime truth, install.md is documentation.** Agent reads the sheet to decide what it can do; reads install.md only if a needed tool is missing and needs installing.
- **Enumeration is one-shot per session.** Sheet caches to `Planning/.capability-sheet.md` at session start. Regeneration happens only if session spans >1 hour OR after `/update-tools` runs.
- **Rule #11 doesn't override consent.** Destructive operations, charter-restriction bumps, and money commitments still route through existing approval paths. The rule only prevents needless deferral on things the founder would just approve.

### Consumer sync
- **Breaking:** no. Purely additive — adds a rule + a subcommand; existing workflow unchanged unless the agent was explicitly deferring on tool-available tasks (in which case behavior becomes "use the tool autonomously").
- **New files:** `bin/auto-claude-capabilities` — installed via symlink or git pull of the auto-claude repo; no per-project install.
- **Changed files:** `CLAUDE.md`, `bin/auto-claude`, `VERSION`
- **Migration action for consumers:** sync to v0.11.0, pull the updated `bin/auto-claude-capabilities` in your auto-claude source, and at the start of every Claude Code session run `auto-claude capabilities > Planning/.capability-sheet.md` (or let the agent do it per rule #11). Existing `Planning/` gitignore convention keeps the sheet out of history.

---

## v0.10.2 — 2026-04-23

Two changes in one release:

1. **Act-first semantics unified across every decision class.** Previously only stall-monitor nudges used fire-and-notify; regular BOARD-escalated decisions waited for founder approval in-thread. Now every decision class (BOARD splits, HARD-STOP vetoes, Tier 3 product decisions, daily-checkpoint resolutions, Stage 1/3b/7b escalations, reply MODIFYs, stall nudges) executes first, then notifies. The ONE exception: charter-restriction bumps — when a decision would violate a `ceo-bound.md` §§ 1-5 rule, ceo-agent writes a proposal and waits for founder amendment.

2. **ceo-bound.md rewritten as a directive restrictions-only document.** 126 lines → ~90 lines. No commentary. No "here's what the CEO can do" scaffolding. Every line in §§ 1-5 is a "must NOT" statement; silent sections mean unlimited authority. Example entries included as guidance; delete when filling.

### Changed — charter
- `command-center/management/ceo-bound.md` — full rewrite. Five sections (§§ 1-5) for disallow rules: financial, external commitments, customer-facing, strategic, novelty. Each defaults to `(no restriction)`. Removed § 4 "Infrastructure + code" (was non-restrictive text describing wave-loop gates). Consolidated reporting / kill-switch / charter-revision / prereqs into terse reference sections. Moved hard invariants out.

### Changed — hard invariants relocated
- `command-center/management/danger-builder-mode.md` — new "Hard invariants" section absorbs the architectural-invariants block that used to live in ceo-bound.md § 10. These are NOT charter-editable: (a) ceo-agent cannot amend charter, (b) cannot amend FOUNDER-BETS.md, (c) cannot halt loop, (d) cannot run during onboarding, (e) cannot write project state for non-allowlisted tools. Relocation clarifies that the charter is founder's policy surface, while system invariants live with the mode spec.

### Changed — decision procedure
- `Sub-agent Instructions/ceo-agent-instructions.md` § Decision procedure — rewritten with explicit act-first flow:
  - Step 5a EXECUTE → Step 5b audit → Step 5c email (new order; execution before notification)
  - Step 6 charter-proposal branch is the ONLY flow that waits for founder
  - Lists 8 decision classes that all act-first; 1 class (charter bump) that waits
- `Sub-agent Instructions/ceo-agent-instructions.md` § What you will NEVER do — new line: "Wait for founder approval on any decision class except charter-restriction bumps." Old "cannot amend charter" / "cannot halt loop" lines removed (moved to danger-builder-mode.md hard invariants, referenced via pointer).
- `Sub-agent Instructions/ceo-agent-instructions.md` § What you will NEVER do — new line: "Write to `product/product-decisions.md` yourself. Read it for context; orchestrator appends to it as decisions land." (per founder policy confirmation in v0.10.2 design review)

### Changed — email templates
- `command-center/management/notifications/agentmail.md` — body format unified. Single template for all decision classes using past-tense phrasing ("ceo-agent acted" + "Action taken: authorized …"). Absorbs what was the `⚠ NUDGE` variant — nudges are just one subject prefix among several, not a separate email shape. Separate charter-proposal template retained for the wait-for-founder exception.
- Reply classification table: `APPROVE` class renamed `ACK` to emphasize "confirmation of already-done work" vs approval-of-pending; added `OVERRIDE` class for one-off founder grants on charter-proposal threads; explicit rule "silence = ACK" documented.

### Policy highlights
- **Act-first is universal.** ceo-agent acts first on every decision class except charter-restriction bumps. Founder reads the email, decides: stay silent (ACK), REJECT (undo within ~10 min), MODIFY (redirect), CLARIFY (ask for reasoning).
- **Charter is pure restrictions.** Reading `ceo-bound.md` should answer "what can't the CEO do?" in 2 minutes. Zero scaffolding, zero explanation of what CEO CAN do.
- **Hard invariants are architectural, not charter-editable.** Founder cannot grant CEO authority over them by editing the charter — they're enforced structurally.
- **product-decisions.md is orchestrator-write, ceo-read.** CEO reads for precedent but doesn't write there; the orchestrator appends as decisions land.

### Consumer sync
- **Breaking for existing charters:** yes — the restructured ceo-bound.md drops § 4 Infra + code and moves hard invariants out. Founders with filled-in charters should migrate their restrictions into the new §§ 1-5 structure. Empty charters (default state) migrate cleanly by re-syncing.
- **Breaking for any production v0.10.0/v0.10.1 runs:** yes — decision flow now executes before email. If a founder's mental model was "I approve decisions in-thread before they execute," that changes. Act-first applies to every future decision except charter bumps.
- **Migration:** after syncing to v0.10.2, re-read your `ceo-bound.md` charter. Migrate any restrictions you had to the new §§ 1-5 shape. Re-enter danger-builder mode; behavior now matches the documented act-first flow.

---

## v0.10.1 — 2026-04-23

Clarifies nudge semantics: **fire-and-notify, not fire-and-wait**. Stall interventions execute the moment ceo-agent decides; the email is notification of something already done, not a request for approval. Founder retains post-hoc override via REJECT / MODIFY reply.

### Changed
- `Sub-agent Instructions/ceo-agent-instructions.md` § Intervention output — rewritten to make the order explicit: (1) execute nudge, (2) write audit entry, (3) send email, (4) update STATUS-meta. Adds explicit rationale for fire-and-notify: "waiting on an ambiguous stall costs real forward motion; a wrong nudge is reversible by a one-line REJECT reply. Act, then tell."
- `notifications/agentmail.md` — new "Nudge-specific body variant" subsection with past-tense template ("ceo-agent nudged. … Action taken: picked up wave 42"). Drops "approve | ack" from reply options for nudges because approval is implicit in not-replying. `no reply → tacit acceptance, work continues` becomes the explicit default.
- `notifications/agentmail.md` — reply-options SLA updated from "5 min" to "10 min" to match v0.10.0's cadence change.

### Policy highlights
- **Nudges ACT FIRST, then notify.** The asymmetry justifies it: stall-extension from waiting hurts more than a reversible nudge. REJECT rolls back cleanly if founder disagrees.
- **Regular decisions (BOARD-escalated) still wait-and-then-decide** — those are someone else's request for a ruling. The act-first rule applies only to ceo-agent's own initiative as stall monitor.
- **Subject prefix `⚠ NUDGE`** distinguishes from regular decisions in the inbox. Past-tense body text reinforces "already happened."

### Consumer sync
- **Breaking:** no. Purely semantic clarification to docs; no behavioral change to what v0.10.0 shipped (the intervention was always meant to act-first, this release just makes that explicit in the spec).
- **Migration action:** none.

---

## v0.10.0 — 2026-04-23

ceo-agent becomes a constant-on ticking entity with tool-invocation authority and a stall-monitor role. Under `danger-builder`, ceo-agent runs as step 0 of every tick — checks if the orchestrator has stalled, and nudges forward when it has. Also gains a 3-tier tool authority model (charter-owned + read-only + execution-routed) so it can consult skills/agents/MCPs/CLIs for better decisions without bypassing specialist safety.

### Added — tool authority
- `command-center/management/ceo-bound.md` § 11 — new `ceo_owned_tools` YAML allowlist (founder-editable). Default starter: `agentmail`. Tools listed here bypass the Tier-2 read-only rule (full authority for operations on ceo-agent's own state) but never bypass Tier-3 execution rules (project-state writes still route through specialists).
- `Sub-agent Instructions/ceo-agent-instructions.md` § Tool invocation authority — three tiers explicitly defined:
  - **Tier 1** (ceo-owned per charter § 11) — full read+write
  - **Tier 2** (read-only analysis) — free invocation up to 5-specialist budget per decision; examples table covers skills, agents, MCPs, CLIs
  - **Tier 3** (execution) — routes through specialists regardless of Tier 1/2 status
- **5-specialist budget per decision** enforced with `specialists_spawned: N` field in audit entry. Reaching cap forces decide-or-propose-charter-amendment.

### Added — stall monitor
- `command-center/management/STATUS-meta.yaml` — new file tracking ceo-agent's gating state. Fields: `current`, `last_modified_at`, `last_ceo_check_at`, `last_ceo_check_saw_status`, `consecutive_idle_ticks`. Bootstrapped on first tick under danger-builder.
- `Sub-agent Instructions/ceo-agent-instructions.md` § Stall-monitor procedure — complete spec:
  - Gating: engage only when STATUS unchanged since last check AND `(now - last_modified_at) >= 600s`
  - Classification table for 9 stall scenarios (IDLE+backlog / IDLE+empty / BLOCKED+monitor-stale / BLOCKED+charter-pending / etc.)
  - Intervention output: audit entry + `⚠ NUDGE` email + STATUS-meta update
  - No-op output: STATUS-meta fields updated, no audit/email (keeps noise low)
  - Respects founder precedence — charter-amendment-pending and hard-stop-awaiting-founder stalls are never resolved by nudge

### Changed
- `command-center/management/danger-builder-mode.md` — tick behavior gains **step 0: ceo-agent stall check** before any orchestrator logic. Step ordering documented: step 0 (stall) → step 1 (kill) → step 2 (session msg) → step 3 (STATUS mode) → step 4 (inbox) → step 5 (charter) → step 6 (route) → step 7-11 (execute + notify). Rationale: founder replies that resolve stalls should be processed same-tick, so stall check runs before inbox check.
- `danger-builder-mode.md` — STATUS routing table: IDLE and BLOCKED delays now **600s (10 min)**, aligned with stall-monitor threshold. One tick per stall window = one fresh check. RUNNING/HANDOFF still 60s.
- `notifications/agentmail.md` — polling cadence note updated from "5 min" → "10 min" to match. Founder-reply SLA is now "within ~10 min of sending."
- `ceo-bound.md` § 0 prereqs — STATUS-meta.yaml listed (bootstrapped on first tick).
- `Sub-agent Instructions/ceo-agent-instructions.md` — audit entry format gains `Specialists spawned:` + `Nudge context:` fields.

### Policy highlights
- **ceo-agent intervenes only when orchestrator stalls.** Active work (RUNNING / HANDOFF with motion) passes through without ceo-agent engagement. The gate prevents tactical interference.
- **Charter binds nudges same as decisions.** A nudge can't authorize something the charter forbids.
- **Read-only by default, execution routes through specialists.** ceo-agent spawns `architect-reviewer` to analyze blast radius freely, but `gh pr merge` always goes through the orchestrator's wave-loop discipline.
- **ceo_owned_tools allowlist is the founder's escape hatch.** Grants full authority for specific tools (default: agentmail). Adding more is an explicit founder decision with documented intent.
- **Every intervention is audited + emailed.** Nudges produce the same artifacts as regular decisions — audit entry with `Nudge context:` field, email with `⚠ NUDGE` subject prefix.

### Consumer sync
- **Breaking:** no. Purely additive — mode entry creates STATUS-meta.yaml automatically if missing; existing `danger-builder` workflow unchanged except for the new step 0 behavior.
- **New files:** `command-center/management/STATUS-meta.yaml` (template)
- **Changed files:** `danger-builder-mode.md`, `ceo-bound.md`, `ceo-agent-instructions.md`, `notifications/agentmail.md`, `VERSION`
- **Migration:** no action needed. On first `danger-builder` activation under v0.10.0, ceo-agent bootstraps STATUS-meta.yaml with current timestamp and starts gating from there. Existing charters continue to work; `ceo_owned_tools` defaults to agentmail if not explicitly set.

---

## v0.9.0 — 2026-04-23

Management email under `danger-builder` switches from **Resend (outbound only)** to **AgentMail (two-way flow)**. ceo-agent now has a persistent mailbox, sends each decision as a new thread, and reads founder replies every 5 minutes to act on approve / reject / modify / clarify classifications.

Separation of concerns:
- **AgentMail** — management (ceo-agent ↔ founder). Persistent inboxes, threads, replies. Required for `danger-builder`.
- **Resend** — product-scope (transactional user-facing emails the product sends). Optional. Not used by any brain management flow.

### Added
- `command-center/management/notifications/agentmail.md` — full two-way flow spec: CLI commands, tick-behavior integration, reply classification taxonomy (APPROVE / REJECT / MODIFY / CLARIFY / AMBIGUOUS), thread-label protocol, failure handling (send cascade + inbox-read cascade), activation/deactivation/halt email templates.
- `command-center/setup-tools/install.md` § 1 "AgentMail — custom domain + ceo-agent inbox setup" — 7-step runbook: register domain → apply DNS records (including Dynadot direct-API workaround for MX priority) → verify propagation → trigger AgentMail verify → create inbox → export env vars → end-to-end test. Uses `claudomat.dev` as reference example with real output shapes. Troubleshooting matrix covers the common gotchas (invalid record type, MX distance, display-name character restrictions, stale propagation caching).

### Changed
- `command-center/setup-tools/install.md` § 1 — AgentMail repositioned as REQUIRED for danger-builder; Resend repositioned as OPTIONAL product-scope. Install-block order swapped to put the required tool first.
- `command-center/management/danger-builder-mode.md` — prerequisites swap Resend env-var check for AgentMail CLI + domain-verified + inbox-created checks. Tick behavior gains **step 4: inbox check** before decision work, with explicit rule that reply actions take precedence over new escalations. STATUS routing table updates IDLE delay to **300s (5 min)** for inbox polling cadence. Notifications section rewritten for thread-per-decision semantics.
- `command-center/management/ceo-bound.md` — § 0 prereqs (env vars) + § 8 Reporting rewritten for AgentMail two-way flow with 5-min founder-reply SLA.
- `command-center/Sub-agent Instructions/ceo-agent-instructions.md` — new "Inbox reply handling" section with full reply classification table and per-reply action rules. Decision procedure step 6 updates to use AgentMail's `inboxes:messages send` (thread creation); new audit-entry field `Thread: <thread_id>` captures the canonical handle for replies.
- `command-center/management/board.md` + `conflict-resolution.md` — no changes (semantics already mode-agnostic; delivery mechanism is mode-specific).

### Removed
- `command-center/management/notifications/resend.md` — deleted. Management no longer uses Resend. Resend auth info retained in install.md under "product-scope only, optional" header for projects that use it for product emails.

### Concrete setup (auto-claude reference domain)
- Domain: `claudomat.dev` registered at Dynadot, verified at AgentMail (2026-04-23)
- Inbox: `ceo@claudomat.dev` (inbox_id: `ceo@claudomat.dev`)
- DNS records: 5 records (MX @, MX mail, TXT agentmail._domainkey, TXT mail, TXT _dmarc) applied via Dynadot `set_dns2` API
- Test email sent end-to-end, thread_id captured: confirmed working

### Policy highlights
- **AgentMail is the single source of truth for management email.** No Resend fallback.
- **Two-way flow is mandatory.** Agent reads inbox every tick (5-min cadence when IDLE). Replies classified into 5 buckets; AMBIGUOUS replies trigger a CLARIFY response and keep the thread unread.
- **Reply actions pre-empt new decisions.** If an unread REJECT reply exists, rollback runs before any new escalation is resolved this tick.
- **Inbox-unreachable cascade halts the loop.** 10 consecutive failed inbox reads in 1 hour = STATUS=BLOCKED. Same safety principle as notification send cascade.

### Consumer sync
- **Breaking:** yes, for anyone who activated `danger-builder` under v0.8.x with the Resend-based env vars. Practical impact: near-zero (v0.8.x never reached a production run in the wild).
- **New files:** `notifications/agentmail.md`, expanded `install.md` § 1 AgentMail domain-setup subsection — safe to pull
- **Changed files (safe-overwrite):** `danger-builder-mode.md`, `ceo-bound.md`, `ceo-agent-instructions.md`, `install.md`, `VERSION`
- **Removed:** `notifications/resend.md`
- **Migration action for anyone mid-v0.8:**
  1. `npm install -g agentmail-cli`
  2. Set `AGENTMAIL_API_KEY` env var (key from <https://agentmail.to>)
  3. Follow `install.md` § 1 "AgentMail — custom domain + ceo-agent inbox setup" to verify a custom domain + create the ceo inbox
  4. Set `CEO_INBOX_ID` env var to the new inbox ID
  5. Re-enter `danger-builder` mode — prereq checks will confirm the new setup

---

## v0.8.4 — 2026-04-23

Adds AgentMail CLI to the setup-tools baseline. Complements Resend (outbound one-shot notifications) for the case where an agent needs to *operate a mailbox end-to-end* — read incoming messages, reply in-thread, manage drafts, maintain conversation state.

### Changed
- `command-center/setup-tools/install.md` § 1 — adds `npm install -g agentmail-cli` to the global CLIs block. New "AgentMail CLI — one-time auth" subsection documents `export AGENTMAIL_API_KEY=am_us_xxx` and verification via `agentmail --format json inboxes list`.
- `command-center/setup-tools/install.md` § 1 — Resend auth subsection now documents the known failure mode of `resend login` (no flag) in non-TTY shells with `missing_key` — always pass `--key re_xxx` in headless contexts.
- `command-center/setup-tools/install.md` § 8 — verification checklist adds `agentmail --version` + `agentmail --format json inboxes list`.

### Why both Resend and AgentMail
- **Resend** — stateless one-shot sends. Right for pushing notifications *out* (danger-builder's per-decision emails, deploy alerts, digests).
- **AgentMail** — persistent inboxes + threads + drafts. Right when the agent *is the mailbox* (customer-facing support mailbox, outbound thread management, read-and-reply flows). Source: <https://github.com/agentmail-to/agentmail-cli>.

Both are optional at machine scope; the brain doesn't require AgentMail by default. Projects that want agent-operated inboxes install and configure it; others ignore.

### Consumer sync
- **Breaking:** no. Purely additive.
- **Migration action:** none required. Install AgentMail on any machine running projects that need agent-operated inboxes: `npm install -g agentmail-cli && export AGENTMAIL_API_KEY=am_us_xxx`.

---

## v0.8.3 — 2026-04-23

Switches notification delivery from raw curl to the official Resend CLI (`resend-cli`).

### Changed
- `command-center/setup-tools/install.md` § 1 — adds `npm install -g resend-cli` to the global CLIs install block. New "Resend CLI — one-time auth" subsection documents `resend login --key <...>` and `resend doctor` verification.
- `command-center/setup-tools/install.md` § 8 — verification checklist adds `resend --version` + `resend doctor`.
- `command-center/management/notifications/resend.md` — prereqs block added; send mechanics rewritten to use `resend emails send --json` instead of raw curl POST to `api.resend.com/emails`; verification block uses `resend doctor --json` instead of curl to `/domains`. Rationale for CLI-over-curl documented inline.
- `command-center/management/danger-builder-mode.md` § 1 prerequisites — `RESEND_API_KEY env var set` replaced with `Resend CLI installed and authenticated: resend doctor --json returns "ok": true`. CLI handles auth resolution (env → saved → flag) automatically.

### Why the CLI
- Auth resolution handled automatically (env → saved credentials in system keychain → flag)
- Stable JSON output format for agent parsing
- Built-in retry on transient network errors
- Idempotency headers included automatically
- `resend doctor` diagnostic is more informative than a raw 200 check against `/domains`

Raw curl to the REST API still works (documented by Resend); we just don't re-implement auth + retries + error parsing ourselves.

### Consumer sync
- **Breaking:** no — existing `RESEND_API_KEY` env var approach continues to work (CLI picks it up). Consumers who want to use saved credentials instead can run `resend login`.
- **Migration action:** install Resend CLI on any machine running `danger-builder` — `npm install -g resend-cli`. One-time per machine.

---

## v0.8.2 — 2026-04-23

Trivial cleanup.

### Removed
- `command-center/management/notifications/resend.md` — "Rate limits" section removed. Pricing and tier recommendations are external to the brain and drift — consumers check Resend's own docs when they need them.

### Consumer sync
- **Breaking:** no. Docs-only.
- **Migration action:** none.

---

## v0.8.1 — 2026-04-23

Semantic change: replaces daily digest with per-decision notifications under `danger-builder`. Same Resend mechanism, different cadence and body format. Renames directory, renames env vars, updates all cross-references.

### Changed — delivery model
- **Per-decision emails replace daily digest.** One email per CEO decision, fired immediately after the audit entry is written to `Planning/ceo-digest-YYYY-MM-DD.md`. No midnight-UTC batching. Email body capped at ~12 lines for scannability; full rationale stays in the audit file.
- **Subject-line prefixes for urgency signaling:** `⚠ ONE-WAY` (irreversible), `⚠ CHARTER PROPOSAL` (restriction bump), `⚠ HARD-STOP OVERRIDDEN` (BOARD veto authorized anyway), `NOVEL` (no precedent).
- **Cascade safety:** 10 consecutive delivery failures in 1 hour halt the loop with STATUS=BLOCKED. If founder cannot be reached, don't keep deciding.

### Renamed
- Directory: `command-center/management/digest-delivery/` → `command-center/management/notifications/`
- Env vars: `CEO_DIGEST_EMAIL_TO` → `CEO_NOTIFY_EMAIL_TO`, `CEO_DIGEST_EMAIL_FROM` → `CEO_NOTIFY_EMAIL_FROM`, `CEO_DIGEST_PROJECT_NAME` → `CEO_NOTIFY_PROJECT_NAME`
- Flag-file field: `digest_to:` → `notify_to:`

### Changed — files
- `command-center/management/notifications/resend.md` — rewritten for per-decision model. New sections: why per-decision-not-batched, per-decision email template, charter-proposal template, activation/deactivation/halt templates, cascade-safety failure handling, rate-limit recommendations.
- `command-center/management/danger-builder-mode.md` — "Digest delivery (daily)" section replaced with "Notifications (per-decision, via Resend)". Tick behavior step 10 updated. Audit + rollback section reflects real-time email signal. Deactivation updated.
- `command-center/management/ceo-bound.md` — § 0 prerequisites updated (new env var names). § 8 Reporting rewritten to describe notification mechanism + audit log as separate concepts.
- `command-center/Sub-agent Instructions/ceo-agent-instructions.md` — decision procedure now 7 steps (split old "write digest entry" into "write audit entry" + "send notification email"). Audit entry format includes `Notification sent:` field with Resend message-id. New "Notification email format" section references the template in `notifications/resend.md`.
- `CLAUDE.md` — trigger row updated (path + concept).
- `command-center/VERSION` — bumped to 0.8.1.

### Unchanged
- `Planning/ceo-digest-YYYY-MM-DD.md` file still exists and fills the same role: chronological append-only audit log for retro / post-mortem / rollback. The per-decision email is the push; this file is the log. Two separate roles, neither replaces the other.
- BOARD → ceo-agent routing, charter semantics, kill-switch, prerequisites, onboarding carve-out — all unchanged.

### Consumer sync
- **Breaking:** yes, but only for consumers who already activated `danger-builder` under v0.8.0. Since v0.8.0 shipped same day as v0.8.1 and no active consumers exist yet, practical breakage is zero.
- **Changed files (safe-overwrite):** all listed above — pure semantic shift, no project-local content
- **Migration for early v0.8.0 adopters:** (1) rename env vars (`CEO_DIGEST_*` → `CEO_NOTIFY_*`), (2) update any scripts or shell profiles referencing old names, (3) re-run `danger-builder` activation to pick up new flag-file field naming.

---

## v0.8.0 — 2026-04-23

Ships `danger-builder` — fourth operating mode for indefinite (365-day) autonomous operation. Adds `ceo-agent` as BOARD tiebreaker + HARD-STOP resolver + founder-ask fallback, a founder-authored `ceo-bound.md` charter that restricts (not approves) CEO authority, and daily Resend-delivered digest. Every existing stage + rule that could previously escalate to founder under full-autonomy now has a parallel danger-builder branch routing to ceo-agent.

### Added
- `command-center/management/danger-builder-mode.md` — mode spec: prerequisite verification at entry, 5-step mode-entry sequence, STATUS routing (shared with full-autonomy plus kill-switch / founder-message / charter-destroyed checks), routing table for BOARD-to-CEO escalation, digest delivery protocol, precedence rules, deactivation sequence
- `command-center/management/ceo-bound.md` — CEO charter template. **Restrictions-only semantics:** blank sections = unlimited CEO authority; explicit restrictions bind. Eleven sections: mode-activation prerequisites (§ 0), financial (§ 1), external commitments (§ 2), customer-facing (§ 3), infra + code (§ 4), strategic (§ 5), novelty handling (§ 6), kill-switch (§ 7), reporting (§ 8), charter revision protocol (§ 9), permanent hard limits (§ 10). Founder-edited only; CEO cannot amend, can only propose via `Planning/ceo-charter-proposals.md`.
- `command-center/Sub-agent Instructions/ceo-agent-instructions.md` — 18-pattern cognitive profile synthesized from `/plan-ceo-review` (classification instinct, paranoid scanning, inversion reflex, focus as subtraction, people-first sequencing, speed calibration, proxy skepticism, narrative coherence, temporal depth, founder-mode bias, wartime awareness, courage accumulation, willfulness as strategy, leverage obsession, hierarchy as service, edge case paranoia, subtraction default, design for trust). Voice rules inherited from gstack (no em dashes, no AI vocabulary, no banned phrases, direct-concrete-sharp tone, max 1 dry aside per digest). Decision procedure with 6 ordered steps: read inputs → scan charter → apply patterns → decide → write digest entry → emit decision. Digest format specified. Never-do list: silently amend charter, amend FOUNDER-BETS.md, skip digest, self-rubber-stamp past decisions, ignore charter restrictions.
- `command-center/management/digest-delivery/resend.md` — Resend integration spec: env vars (`RESEND_API_KEY`, `CEO_DIGEST_EMAIL_TO`, `CEO_DIGEST_EMAIL_FROM`, `CEO_DIGEST_PROJECT_NAME`), send mechanics (plain-text body, daily + activation + deactivation + halt triggers), failure handling (3 retries with exponential backoff, log but never halt loop on delivery failure), rate limits, security notes, pre-activation connectivity test.

### Changed — management/
- `command-center/management/mode-switching.md` — four-mode table (was three), `danger-builder` trigger phrases, entry/exit transitions, prerequisite verification on `danger-builder` entry, extended flag file format with `charter:` and `digest_to:` fields
- `command-center/management/board.md` — "Hard-stops — NEVER go to BOARD" section extended with full routing-by-mode table; under `danger-builder`, destructive + money + HARD-STOP all route to ceo-agent (within charter restrictions), never to founder during runtime
- `command-center/management/conflict-resolution.md` — "Escalation path" section split into two: BOARD → founder (first three modes) and BOARD → ceo-agent (danger-builder). HARD-STOP veto semantics updated for danger-builder: weighed as strong signal, recorded in digest, not a hard halt

### Changed — stages + rules
- `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md` — Step 5 Tier 3 resolution gains danger-builder branch (BOARD → ceo-agent fallback)
- `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` — user-ask escalations (a/b/c/d) gain danger-builder branch
- `command-center/rules/build-iterations/stages/stage-3b-design-gap.md` — 3-cap escalation gains danger-builder branch
- `command-center/rules/build-iterations/stages/stage-7b-triage.md` — /investigate chain exhaustion gains danger-builder branch
- `command-center/rules/build-iterations/stages/stage-11-next.md` — STATUS handling section renamed from "full-autonomy only" to "full-autonomy + danger-builder"; hard-stop branch extended
- `command-center/rules/daily-checkpoint.md` — three-bucket resolution gains danger-builder branch (BOARD first, ceo-agent for unresolved items)
- `command-center/rules/roadmap-refresh-ritual.md` — Step 4 founder-checkpoint gains danger-builder branch (CEO resolves; founder reviews via digest retroactively)
- `command-center/rules/backlog-planning.md` — Step 4 user-approval gains danger-builder branch (CEO approves + reprioritizes; wave execution proceeds same tick)
- `CLAUDE.md` — new trigger-table row for `danger-builder` activation. Always-on rule #10 rewritten for four-mode handling with explicit hard-stop routing table.

### Policy highlights
- **Charter is a limiter, not an approver.** This is a deliberate reframe from normal permission systems. Silent `ceo-bound.md` = unlimited CEO authority inside that section. Founder adds restrictions only for categories they genuinely want to stay involved in. More restrictions = more founder involvement = less autonomy.
- **HARD-STOP vetoes route to CEO under danger-builder, not founder.** CEO weighs the veto, may still authorize, records engagement in digest. Keeps the veto as signaling tool without blocking indefinite operation.
- **Daily digest via Resend** — not optional. A file-only digest defeats the 365-day premise (log nobody reads). Mode refuses to activate if `RESEND_API_KEY` + `CEO_DIGEST_EMAIL_TO` are not set.
- **Kill-switch is always founder-only.** `touch /tmp/ceo-mode-stop` halts the loop. So does any session message, `STATUS=STOP`, or mode-flag change.
- **Onboarding carve-out.** ceo-agent + BOARD both OFF during v0-v11 regardless of mode. High-taste moment; founder presence is the feature. danger-builder only activates after v11 handoff.

### Consumer sync
- **Breaking:** no. Purely additive — existing full-autonomy behavior unchanged; danger-builder is a new mode that consumers adopt opt-in.
- **New files:** 4 files (`management/danger-builder-mode.md`, `management/ceo-bound.md`, `Sub-agent Instructions/ceo-agent-instructions.md`, `management/digest-delivery/resend.md`) — safe to pull
- **Changed files (safe-overwrite):** stages 0b/1/3b/7b/11, daily-checkpoint, roadmap-refresh-ritual, backlog-planning, management/{mode-switching,board,conflict-resolution}.md, VERSION — assuming not customized project-side
- **Changed files (review recommended):** `CLAUDE.md` (new trigger row + rewritten always-on rule #10 — both merge cleanly if not locally customized)
- **Migration action:** to activate `danger-builder`: (1) fill in `command-center/management/ceo-bound.md` with your charter restrictions (default all blank = unlimited CEO authority), (2) set `RESEND_API_KEY` + `CEO_DIGEST_EMAIL_TO` env vars, (3) verify kill-switch works: `touch /tmp/ceo-mode-stop && rm /tmp/ceo-mode-stop`, (4) say "danger builder" to Claude Code. Mode entry runs prerequisite checks and aborts if anything is missing.

---

## v0.7.0 — 2026-04-23

Ships the `/update-tools` skill with auto-claude. The skill reads `command-center/setup-tools/install.md` as the canonical source, runs verification checks against the current machine, and prompts per item to install anything missing. Wired into onboarding v0 as the prerequisite gate; the founder can also invoke it manually anytime.

### Added
- `command-center/setup-tools/skills/` — new subdirectory for auto-claude's own shipped skills
  - `README.md` — explains install options (symlink vs copy) and the rationale for shipping skills via the brain repo
  - `update-tools/SKILL.md` — full skill specification: install.md discovery order, three-tier risk classification (low-risk auto-fix-if-approved / medium-risk command-before-running / high-friction print-instructions-only), always-ask policy, report/prompt/summary flow, subcommand filters (`agents` / `skills` / `mcps` / `clis` / `plugins` / `shell`)
- `setup-tools/install.md` § 2d — new subsection documenting how to install the `/update-tools` skill itself (symlink or copy from the auto-claude repo)

### Changed
- `command-center/rules/onboarding/onboarding-loop.md` — Prerequisite section now invokes `/update-tools` directly, with a fallback for first-ever auto-claude machines where the skill isn't yet installed
- `command-center/rules/onboarding/stages/stage-v0-input.md` — prereq block references the skill rather than manual checklist verification
- `command-center/VERSION` — bumped to 0.7.0

### Policy notes
- `/update-tools` **always asks per item** — there is no `--yes` batch flag. This is deliberate: founder remains in control of every install.
- For high-friction items (MCP configs, auth, shell config), the skill **never modifies files**. It prints copy-pasteable JSON fragments and exact commands; the founder applies them manually.
- The skill is **not wired anywhere except onboarding v0**. Founder invokes it otherwise. No CLAUDE.md trigger row, no wave-loop pre-check, no full-autonomy mode-entry integration.

### Consumer sync
- **Breaking:** no. Purely additive.
- **New files:** `command-center/setup-tools/skills/README.md` + `command-center/setup-tools/skills/update-tools/SKILL.md` — safe to pull
- **Changed files (safe-overwrite):** `command-center/VERSION`, `command-center/rules/onboarding/onboarding-loop.md`, `command-center/rules/onboarding/stages/stage-v0-input.md`, `command-center/setup-tools/install.md` — assuming not customized project-side
- **Migration action:** after sync, run the one-line symlink from install.md § 2d to install `/update-tools` into `~/.claude/skills/update-tools`. The skill is available across all auto-claude projects on that machine once installed once.

---

## v0.6.1 — 2026-04-23

Refines v0.6.0 setup tooling: reorganizes agent sources into three categories, removes built-in-agent references, and moves the entry point from the CLAUDE.md trigger table into the onboarding loop (where it naturally belongs — setup runs before any tool is needed).

### Changed
- `command-center/setup-tools/install.md` — agent section restructured into three explicit sources:
  - (a) **gstack** — <https://github.com/garrytan/gstack> (agents + skills together)
  - (b) **VoltAgent** — <https://github.com/VoltAgent/awesome-claude-code-subagents> (generic dev-role agents)
  - (c) **DarcyEGB** — <https://github.com/darcyegb/ClaudeCodeAgents> (supplementary / alternative takes)
  Collision handling documented (last install wins; verify specific agents after install).
- `install.md` — removed "Built-in agents" subsection (`Explore`, `Plan`, `general-purpose`). These ship with Claude Code and don't need documentation in this guide.
- `install.md` — removed "Built-in skills" subsection for the same reason.
- `command-center/rules/onboarding/onboarding-loop.md` — new "Prerequisite — machine setup" section directs founder to read `setup-tools/install.md` and run verification checklist before v0. Runs once per machine, not per project.
- `command-center/rules/onboarding/stages/stage-v0-input.md` — prerequisites block now explicitly requires machine tooling to be installed.
- `CLAUDE.md` — **removed** the "setting up a new machine" trigger-table row added in v0.6.0. Setup is an onboarding prerequisite, not a runtime trigger; no need for trigger-table weight.

### Consumer sync
- **Breaking:** no.
- **Changed files (safe-overwrite):** `command-center/setup-tools/install.md`, `command-center/rules/onboarding/onboarding-loop.md`, `command-center/rules/onboarding/stages/stage-v0-input.md`, `command-center/VERSION` — assuming not customized project-side
- **Changed files (review recommended):** `CLAUDE.md` (one row removed — consumers with locally-customized trigger tables need to decide whether to keep or remove the setup-tools row)
- **Migration action:** none required. Projects already on v0.6.0 lose the trigger-table row for setup-tools but gain the onboarding prerequisite — both point at the same `install.md`, so there's no loss of routing.

---

## v0.6.0 — 2026-04-23

Setup tooling documentation + brain-sync tooling (`bin/auto-claude`).

### Added
- `command-center/setup-tools/` — new directory
  - `install.md` — canonical external-tooling setup guide. Covers Claude Code agents (VoltAgent marketplace + custom Jenny/karen/founder-proxy), skills (gstack family + built-ins + claude-mem plugin skills), MCP servers (aidesigner, Playwright × 10, mcp-search, domain-mcp), plugins (claude-mem), supporting CLIs (task-master, playwright-mcp, rtk, gh, netlify, railway), shell config (rtk hook, SSH keep-alive, tmux persistence), project bootstrap, verification checklist, and known gotchas.
  - `README.md` — directory overview + when to consult it
- `bin/auto-claude` + subcommands — brain-sync tool (init / diff / sync / status). See README § "Keeping the brain in sync across projects".
- Trigger table row in `CLAUDE.md` for "Setting up a new machine / onboarding team member / diagnosing skill-not-found or MCP-not-available errors" → `command-center/setup-tools/install.md` (**superseded in v0.6.1** — now an onboarding prerequisite instead).

### Changed
- `README.md` — adds `command-center/setup-tools/` row to the directory table. Adds full section on `auto-claude sync` tool (consumer setup + day-to-day commands + release workflow for brain authors).
- `command-center/VERSION` — bumped to 0.6.0

### Consumer sync
- **Breaking:** no. Purely additive.
- **New files:** `command-center/setup-tools/{install.md,README.md}` + `bin/auto-claude*` scripts (~1000 LOC in bash) — safe to pull
- **Changed files (safe-overwrite):** `command-center/VERSION`
- **Changed files (review recommended):** `CLAUDE.md` (one new trigger row — merge cleanly if not locally customized), `README.md` (new directory row + new full section)
- **Migration action:** consumers on pre-0.6 should install `bin/auto-claude*` once (or use it from the auto-claude clone directly), then future syncs run through the tool.

---

## v0.5.0 — 2026-04-23

External-wait doctrine. Adds STATUS state machine, `/loop` bootstrap, Spawn-and-Block pattern, and the three-condition monitor contract.

### Added
- `command-center/rules/monitors/` — new directory with master doctrine + platform templates
  - `monitor-principles.md` — three-condition contract (`success_condition`, `failure_condition`, `timeout_budget`) + state machine + named anti-patterns
  - `railway-deploy.md` — Railway deploy monitor template with full state classification
  - `gh-actions.md` — GitHub Actions workflow monitor template
  - `netlify-deploy.md` — Netlify deploy monitor template (documented exception for `commit_ref` check)
- `command-center/management/STATUS` — new runtime file tracking wave/loop state (RUNNING / HANDOFF / IDLE / BLOCKED / DONE)
- `command-center/management/handoff.md` — mid-wave + cross-wave resume artifact (written at 75% context or cross-wave boundary)

### Changed
- `CLAUDE.md` — new MONITOR trigger row; full-autonomy trigger row updated to reference `/loop` bootstrap + STATUS tick behavior
- `command-center/management/full-autonomy-mode.md` — major rewrite. Adds 5-step mode-entry sequence, STATUS routing table, tick behavior, 75% context-budget rule, self-management carveout, external-wait anti-pattern (with Spawn-and-Block as preferred response)
- `command-center/management/board.md` — adds "Out of BOARD scope — resolve by rule" section (session/context management never convenes BOARD)
- `command-center/rules/build-iterations/stages/stage-4-execute.md` — adds context-budget clause for full-autonomy
- `command-center/rules/build-iterations/stages/stage-5-deploy.md` — async-deploy Spawn-and-Block clause
- `command-center/rules/build-iterations/stages/stage-5b-qa.md` — platform-in-progress clause
- `command-center/rules/build-iterations/stages/stage-6-test.md` — prod-URL-readiness clause
- `command-center/rules/build-iterations/stages/stage-11-next.md` — STATUS handling section with 5-branch cross-wave transition logic

### Consumer sync
- **Breaking:** no. Purely additive. Existing waves continue to work.
- **New files:** `command-center/rules/monitors/*.md` (4 files) — safe to pull
- **Changed files (safe-overwrite):** all 9 brain files above, assuming they have not been customized project-side
- **Changed files (review recommended):** `CLAUDE.md` — if your project has customized the trigger table or always-on rules, run sync in interactive mode
- **Migration action:** before first full-autonomy run post-upgrade, read the new STATUS routing table in `full-autonomy-mode.md`. No file-level migration required.

---

## v0.4.0 — 2026-04-22

Orchestration mega-release. Four bundled features: founder-stage axis, wave-size auto-split, Stage 8 TaskMaster sweep, and BOARD autonomy system.

### Added
- `command-center/product/founder-stage.md` — single-variable modulator (self-use-mvp / pilot-customer / paying-customers / regulated-day-1) that biases v3/v4/v6/v10 onboarding away from legal/GDPR/admin bloom for early-stage projects
- `command-center/management/` — new folder replacing `rules/autonomous-mode.md`
  - `README.md` — directory overview
  - `board.md` — BOARD composition, hard-stops, rollback
  - `board-members.md` — 7 members + per-member reading list (ceo-reviewer, architect-reviewer, ux-researcher, risk-manager, founder-proxy, competitive-analyst, product-manager)
  - `conflict-resolution.md` — voting rules (4+/7 default, 6+/7 strict for Tier 3), split outcomes, hard-stop veto, retro feedback loop
  - `full-autonomy-mode.md` — mode spec + routing table + hard-stops
  - `semi-assisted-mode.md` — skip-nice-to-haves behavior + founder escalation thresholds
  - `mode-switching.md` — flag spec + transitions
- `command-center/Sub-agent Instructions/founder-proxy-instructions.md` — new agent, simulates founder voice via claude-mem memory + product-decisions.md precedent
- CLAUDE.md always-on rule #10: "Respect the mode flag"

### Changed
- `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` — adds deterministic Size rubric (files>30, primitives>30, LOC>5000, Stage 4 context>250K). New `RESCOPE-AUTO-SPLIT` verdict auto-creates sibling TaskMaster rows. User-ask narrowed to 4 specific cases.
- `command-center/rules/backlog-planning.md` — XL items pre-split at authorship via new Step 3.5; `estimatedSize` field added to backlog entries
- `command-center/rules/build-iterations/stages/stage-8-closeout.md` — step 1 expanded to mandatory 6-step TaskMaster sweep (primary + subtasks + fast-fixes + auto-split siblings + Stage 7b triage rows + writeback ledger)
- `command-center/rules/build-iterations/stages/stage-11-next.md` — becomes verifier of Stage 8 sweep; catches misses as logged defects
- `command-center/rules/build-iterations/stages/stage-0b-product-decisions.md` — mode-aware routing for Tier 3 decisions
- `command-center/rules/build-iterations/stages/stage-3b-design-gap.md` — mode-aware routing for 3-cap escalation
- `command-center/rules/build-iterations/stages/stage-7b-triage.md` — mode-aware routing for investigate-chain exhaustion
- `command-center/rules/daily-checkpoint.md` — mode-aware three-bucket resolution
- `command-center/rules/housekeeping.md` — stage numbering fixed (was stale "Stage 7")
- `command-center/Sub-agent Instructions/ceo-reviewer-instructions.md` — EXPAND/REDUCE verdict taxonomy refined
- `command-center/Sub-agent Instructions/problem-framer-instructions.md` — adds Size rubric application directive
- Onboarding stages v1/v3/v4/v6/v10 — read founder-stage flag to modulate compliance-surface quota, security depth, and milestone horizons
- `CLAUDE.md` — new trigger rows for mode flags; always-on rule #10

### Removed
- `command-center/rules/autonomous-mode.md` — 179 lines, content split + expanded across new `management/` folder (13 cross-references updated)

### Consumer sync
- **Breaking:** yes, if any project referenced `command-center/rules/autonomous-mode.md` directly (file removed)
- **New files:** 8 files in `command-center/management/` + `command-center/product/founder-stage.md` + `command-center/Sub-agent Instructions/founder-proxy-instructions.md` — safe to pull
- **Changed files (safe-overwrite):** stage files, backlog-planning, daily-checkpoint, housekeeping, onboarding stages — assuming not customized project-side
- **Changed files (review recommended):** `CLAUDE.md` (new trigger rows + always-on rule #10); `Sub-agent Instructions/ceo-reviewer-instructions.md` + `problem-framer-instructions.md` (if customized)
- **Migration action:** (1) if you referenced `rules/autonomous-mode.md`, update to `management/` paths (see commit 87c9fb1 for rewrites); (2) set your project's `founder-stage.md` value after pulling.

---

## v0.3.0 — 2026-04-20

README rewrite: two-loop system (onboarding + wave loop).

### Changed
- `README.md` — full rewrite. Adds the "two loops at a glance" diagram, 5-step launch flow, 13-stage onboarding breakdown, design principles section. Previous README described a manual scaffold-filling workflow that no longer matched reality.

### Consumer sync
- **Breaking:** no. Docs-only.
- **Migration action:** none. Consumer projects rarely copy the upstream README verbatim.

---

## v0.2.0 — 2026-04-19

13-stage onboarding loop for pre-launch project seeding.

### Added
- `command-center/rules/onboarding/` — new directory
  - `onboarding-loop.md` — dispatcher for stages v0 → v11
  - `stages/stage-v0-input.md` through `stage-v11-handoff.md` — 13 stage files covering vision/gaps, competitive scan, product scope, page map, stack selection, architecture, design direction, design system, per-page designs, planning, handoff
- `CLAUDE.md` — new trigger row for "Starting a NEW project"

### Consumer sync
- **Breaking:** no. Net-new directory.
- **New files:** 14 files in `command-center/rules/onboarding/` — safe to pull
- **Changed files:** `CLAUDE.md` (one new trigger row)
- **Migration action:** existing projects past onboarding don't need to consume this, but future project forks benefit.

---

## v0.1.0 — 2026-04-18

Initial extracted brain. Replaces conceptual docs with the actual running management system.

### Added
- Everything. First project-agnostic release.

### Consumer sync
- N/A (baseline).
