# Sub-Agent Workflow

How to utilize ~140 specialized sub-agents efficiently. Plan-authoring and code-execution rules live in `planning-principles.md` and `dev-principles.md`.

---

## Before every sub-agent spawn

Three-step gate, in order. Do not skip Step 1 — silent-fail is the failure mode this gate prevents.

1. **Consult the capability sheet.** Open `Planning/.capability-sheet.md` (§ "Agents at ~/.claude/agents/") and confirm the target name appears. If absent: (a) install per `setup-tools/install.md` and regenerate, or (b) pick the closest substitute and record the swap in the spawn context.

2. **Read the agent's instruction file** at `command-center/Sub-agent Instructions/<agent>-instructions.md` and inject as the FIRST directive in the spawn prompt. If the file is absent but the agent is installed → the agent's global system card is the first directive; create an empty stub. If a project-customized file is expected but missing → flag as plan-authoring defect, substitute the closest available instruction file.

3. **Pick the best category fit.** If Step 1 shows the agent exists but is wrong for the task (e.g., `backend-developer` for a DB-heavy query when `database-optimizer` is available), swap before spawning.

**Hard rule:** only stub instruction files for agents that exist in the available agent list. Never invent agent names.

**Observations are Stage 9/10 only.** `Sub-agent Observations/<agent>-observations.md` files are written at Stage 9 (knowledge-synthesizer + technical-writer), read at Stage 10 (karen), never touched during Stages 1-8. Do not read or inject observations at spawn time — all prompt-shaping intelligence lives in instruction files after Stage 10 promotion.

## Spawn discipline

### 1. Scope every spawn to a specific well-bounded task with explicit file paths and a clear deliverable format.
Why: sub-agents have limited context and generalize poorly — broad "review everything" asks waste tokens and produce noise.

### 2. Launch independent agents in parallel; never let two agents own overlapping scope.
Why: parallel execution finishes faster and prevents conflicting edits; overlap means one agent's output will contradict or overwrite the other's.

### 3. Name each spawn descriptively so the user can track what each is doing.
Why: "general-purpose" or "Task 1" gives no signal when multiple agents run concurrently.

## Cross-cutting rules

### 4. After 2 failed fix attempts, immediately escalate to a domain specialist.
Why: domain experts (`websocket-engineer`, `react-specialist`, `security-engineer`, `database-administrator`, `ultrathink-debugger`) diagnose in seconds what self-iteration with `console.log` takes hours to find.

### 5. Pair `architect-reviewer` with `security-engineer` on every auth / middleware / session / CSRF / rate-limit wave.
Why: architect-reviewer reasons about what SHOULD exist; security-engineer reads what DOES exist — either alone misses the gap between spec and codebase.

### 6. Give Karen and Jenny specific source claims to verify (line numbers, method names, field shapes, exact spec text) — not open-ended "review the plan" asks.
Why: catch rate scales with prompt specificity; for boolean-logic or comparison-direction specs, paste the exact spec text to catch inverted logic.

### 7. Generate secrets yourself — `openssl rand -base64 32`, `crypto.randomBytes(32).toString('base64')`, `uuidgen` — and set via the platform MCP. Never block on the user.
Why: routine mechanical action; waiting on the user here gates the autonomous loop. Exception: account-issued credentials (API keys, OAuth client secrets from provider consoles) must be requested.

### 8. Default every implementer spawn to the six-constraint exec brief.
Why: file paths + section count + platform facts + LOC/non-goals + placement + test-gate commands together produce one-pass zero-round-trip delivery; removing any single category predictably triggers clarification loops.

**Six-constraint exec brief (use in this order):**
1. **Template/target file paths** with absolute paths and line/symbol anchors — never abstract structure descriptions.
2. **Section count + exact pattern to mirror** — enumerated change targets plus a before→after snippet or in-repo reference.
3. **Platform-specific facts to inject verbatim** — schema enums, Zod constraints, brand names, contract fields, guard/role module paths.
4. **LOC target range OR explicit non-goals list** — LOC ceiling (content waves) or prohibition list (code waves).
5. **Placement directive** — ordering for framing UI or explicit add/remove/consolidate rules for imports.
6. **Negative constraint / test+build gate commands** — antipattern prohibitions (content) or `pnpm biome check --write` + typecheck + build (code).

Per-agent authoritative briefs live in `Sub-agent Instructions/technical-writer-instructions.md` (content waves), `react-specialist-instructions.md` (single-file UI), `backend-developer-instructions.md` (backend). New implementer agent types default to this format.

## After each build iteration

Propose review/verification sub-agents + skills before launching.
