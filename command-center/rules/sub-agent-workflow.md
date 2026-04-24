# Sub-Agent Workflow

~140 specialized sub-agents are available. This file is about **how to utilize them most efficiently**. Plan-authoring and code-execution rules live in `planning-principles.md` and `dev-principles.md` respectively — not here.

---

## Before every sub-agent spawn

Three-step gate. Run in order; do not skip Step 1 even for "obviously installed" agents — silent-fail is the failure mode this gate prevents.

1. **Consult the capability sheet.** Open `Planning/.capability-sheet.md` (section "Agents at ~/.claude/agents/") and confirm the target agent name appears. If absent, either (a) install the agent per `setup-tools/install.md` and regenerate the sheet, or (b) pick the closest substitute from the catalog and record the swap in the spawn context. Do not proceed on faith that the name is correct — "I used it last wave" is not verification.

2. **Read the agent's instruction file** at `command-center/Sub-agent Instructions/<agent-name>-instructions.md` and inject the contents as the FIRST directive in the spawn prompt.
   - If present → inject verbatim
   - If absent but the agent is installed → the agent's global system card is the first directive (documented fallback); create an empty stub file for future overrides
   - If the plan specifically relies on a project-customized instruction file and it's missing → flag as a plan-authoring defect and substitute the closest available instruction file

3. **Consult category-appropriate alternatives.** If Step 1 showed the named agent exists but it's the wrong fit for the task (e.g., `backend-developer` for a DB-heavy query, when `database-optimizer` is in the catalog), swap before spawning. The catalog is broad; defaulting to the first name that came to mind narrows the choice.

**Hard rule:** only create instruction-file stubs for agents that exist in the available agent list — never invent agent names.

**Observations are Stage 9/10 pipeline only — NOT read at spawn time.** Observation files (`command-center/Sub-agent Observations/<agent>-observations.md`) are written at Stage 9 by `knowledge-synthesizer` + `technical-writer`, read at Stage 10 by `karen` (converter), and never touched during Stages 1-8. All prompt-shaping intelligence lives in instruction files after Stage 10 promotes load-bearing observations into them. Do not read observations when preparing a spawn; do not inject them into any spawn prompt.

## Sub-agent limitations

- Sub-agents have **limited context windows** and are **bad at generalising**. Never offload broad, open-ended work.
- Always give sub-agents:
  - A **specific, well-scoped task** (not "review everything")
  - **Explicit file paths** to read or work on
  - A **clear deliverable format** (report, code changes, checklist, etc.)
- Prefer **parallel execution** — launch independent agents simultaneously.
- Never duplicate work between agents — each owns a distinct scope.
- Name agents descriptively so the user can track what each one does.

## Cross-cutting rules

### 1. Root-cause before escalation
**Iron Law: no fixes without root cause.** After 2 failed fix attempts, immediately spawn a domain-specialist (`websocket-engineer`, `react-specialist`, `security-engineer`, `database-administrator`, `ultrathink-debugger`) rather than iterating with debug-by-deploy `console.log` PRs. Domain experts diagnose in seconds what self-iteration takes hours to find.

### 2. architect-reviewer + security-engineer are a complementary pair
For any wave involving auth, middleware, security-critical module wiring, cookies, CSRF, rate limiting, or session management: spawn `architect-reviewer` first to produce the ADR, then `security-engineer` to validate the ADR's wiring assumptions against the actual codebase. architect-reviewer reasons about what SHOULD exist; security-engineer reads what DOES exist. Do not use architect-reviewer as the sole pre-impl gate for security-critical work — always pair.

### 3. Pre-impl gate prompt specificity correlates with catch rate
Both Karen and Jenny produce their highest-value catches when the prompt gives them specific source claims to verify (line numbers, method names, field shapes, exact spec text) rather than open-ended "review the plan" asks. When authoring Karen/Jenny prompts, extract the 5-8 most load-bearing factual claims from the plan and enumerate them explicitly as verification targets. For Jenny: when a spec involves boolean logic or comparison directions, paste the exact spec text into the prompt — her highest-value catches are inverted-logic findings.

### 4. Generate secrets yourself — do not wait for the user
When a wave needs a new pepper, API secret, encryption key, or any random value, generate it directly: `openssl rand -base64 32`, `crypto.randomBytes(32).toString('base64')`, `uuidgen`. Then set it via the appropriate MCP (Railway `set-variables`, Netlify, etc.). Do NOT block the wave asking the user — routine mechanical action that should never gate the autonomous loop. Exception: credentials issued to the user's account (API keys, OAuth client secrets from provider consoles) must be requested.

### 5. Six-constraint exec brief is the cross-agent canonical brief format for implementer spawns
Across three successive waves (g66 technical-writer, g67/g68 react-specialist, g78 backend-developer) the six-constraint exec brief has produced clean one-pass zero-round-trip implementer delivery. Treat it as the default brief shape for any implementer agent spawn. The six categories, in order:

1. **Template/target file paths** with absolute paths and line/symbol anchors — never abstract descriptions of structure
2. **Section count + exact pattern to mirror** — enumerated change targets in intended order plus a before→after snippet or in-repo reference
3. **Platform-specific facts to inject verbatim** — schema enums, Zod constraints, brand names, contract fields, guard/role module paths, and anything the agent cannot infer from the codebase
4. **LOC target range OR explicit non-goals list** — a bounded scope expressed as either a LOC ceiling (content waves) or a prohibition list (code waves)
5. **Placement directive for fixed UI elements / import scope directive for code** — ordering for any framing UI or explicit add/remove/consolidate rules for imports, not left to inference
6. **Negative constraint / test+build gate commands** — explicit antipattern prohibitions (content waves) or exit-criteria commands like `pnpm biome check --write` + typecheck + build (code waves)

Each of the six is independently load-bearing: remove any single one and clarification round-trips become predictable. Per-agent authoritative definitions live at `command-center/Sub-agent Instructions/technical-writer-instructions.md` (copy-heavy content waves), `command-center/Sub-agent Instructions/react-specialist-instructions.md` (single-file UI change waves), and `command-center/Sub-agent Instructions/backend-developer-instructions.md` (backend implementation waves). When onboarding a new implementer agent type (e.g., `nestjs-backend-expert`, `typescript-pro`, `database-administrator`), default the first exec brief to this format rather than waiting for three validation waves.

## After each build iteration

Propose review/verification sub-agents + skills before launching.
