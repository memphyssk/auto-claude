# Simulation sim-001 — wave-loop measurement report

**Task:** Split brain and project parts apart; ship the brain as an NPX package
**Mode:** shallow simulation (real file reads + real sub-agent spawns; no file writes to project; no real deploys/tests)
**Location:** `/root/auto-claude/Planning/sim-001-*`
**Started:** <TIMESTAMP TBD at Stage 0>
**Goals:** (a) validate README context-cost claims, (b) find fattest stages for optimization, (c) spec-coherence check (are the stage files coherent when read fresh?)

---

## Per-stage log

_(each stage fills in after execution)_

### Pre-wave A — roadmap-refresh-ritual
Founder idea enters the system. Authority path: `roadmap-refresh-ritual.md`.
- **Status:** completed

**Files read (with token approximations — 4 chars/token):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `roadmap-refresh-ritual.md` | 7,600 | 1,900 |
| `roadmap-lifecycle.md` | 13,417 | 3,350 |
| `sub-agent-workflow.md` | 6,092 | 1,520 |
| `management/semi-assisted-mode.md` | 6,823 | 1,700 |
| `skill-use.md` | 6,022 | 1,500 |
| `Sub-agent Instructions/ui-comprehensive-tester-instructions.md` | 8,538 | 2,130 |
| `Sub-agent Instructions/competitive-analyst-instructions.md` | 3,217 | 800 |
| `product/ROADMAP.md` | 1,567 | 390 |
| `product/FOUNDER-BETS.md` | 1,102 | 275 |
| `product/product-decisions.md` | 911 | 230 |
| `artifacts/competitive-benchmarks/INDEX.md` | 459 | 115 |
| **Subtotal prereq reads** | **~55,700** | **~13,900** |

**Sub-agent spawns (shallow — real spawn, output retained for decision, no persistent artifact writes):**
- `competitive-analyst` — combined Step 1a + 1b scope (adapted for framework project — see spec-coherence notes). Real usage reported: **14,633 tokens**, 77s wall time
- `trend-analyst` — SKIPPED (instruction file doesn't exist; functionality absorbed into competitive-analyst scope)
- ui-comprehensive-tester × 3 on Playwright — SKIPPED (marketplace/web mandate not applicable; spec-coherence gap)

**Founder inline actions (Step 1c + Step 4):** ~200 tokens total — inline bet-add + checkpoint disposition.

**Step 2 (integrity check):** trivially no-drift (0 TaskMaster tasks, blank ROADMAP). ~500 tokens read + ~300 tokens report.

**Step 3 (strategic challenge via `/plan-ceo-review`):** **NOT actually invoked** in simulation.
- Skill invocation estimate (real): ~40-60K tokens. Skill file alone is 2,139 lines (~535 KB, ~134K tokens) but most of that is preamble/routing — real-session invocation typically consumes 40-60K via its own reading list + per-milestone analysis.
- Simulated replacement: **6,500 tokens** (me synthesizing a CEO-review disposition in-conversation from the competitive-analyst findings + existing roadmap scaffold).
- **Spec-coherence note:** the ritual spec says "Invoke `/plan-ceo-review`" authoritatively. In a real run this would be the single largest cost in the whole ritual.

**Step 4 (founder checkpoint under founder-review mode):** ~300 tokens. Disposition:
- Accept new bet: hybrid distribution (NPX bootstrap + git lifecycle)
- Approve new milestone: "M1 — Brain distribution via @auto-claude/brain NPX package (optional bootstrap mode; preserve git+sync as authoritative)"
- No existing milestones to reclassify (first real refresh on blank scaffold)
- North Star: unchanged
- Under `danger-builder`: would instead route to ceo-agent (~15-20K incremental — full charter read + cognitive-pattern application + email send)

**Step 5 (write outputs):** **NOT actually written in simulation** (would pollute auto-claude's real product/ files).
Would write:
- `ROADMAP.md` — 1 new milestone at H1 (~1,500 tokens out)
- `product-decisions.md` — 1 append entry (~300 tokens)
- `competitive-benchmarks/INDEX.md` — freshness touch (~50 tokens)
- `Planning/roadmap-refresh-2026-04-24-ceo-review.md` — CEO-review output archive (~2,000 tokens)
- `Planning/trend-scan-2026-04-24.md` — would exist if trend-analyst had fired; SKIPPED
- `Planning/roadmap-integrity-2026-04-24.md` — the "no drift" report (~300 tokens)
- **Estimated write cost: ~4,200 tokens out**

**Step 6 (commit):** ~300 tokens.

### Totals for Pre-wave A
| Category | Tokens |
|---|---|
| File reads (prereqs + inline) | ~14,700 |
| Sub-agent spawn (competitive-analyst, real) | 14,633 |
| `/plan-ceo-review` skill (SIMULATED — not invoked) | 6,500 |
| Founder inline + checkpoint + integrity | ~1,300 |
| Writes + commit (would-be) | ~4,500 |
| **Pre-wave A total (simulated path)** | **~41,600 tokens** |
| **Pre-wave A total (real-path estimate with full skill invocation + Playwright swarm)** | **~180K-220K tokens** |

**Spec-coherence findings (critical):**

1. **`trend-analyst-instructions.md` does not exist** despite being mandated by Step 1c. A real founder running this ritual for the first time would hit a file-not-found error at the READ step. **Severity: HIGH** — blocks ritual execution.

2. **Step 1a mandates 3 parallel Playwright `ui-comprehensive-tester` agents for competitive sweep**, which assumes a marketplace/web-product shape. Framework/CLI projects like auto-claude have no browsable competitors; the Playwright mandate is inappropriate. Spec either needs (a) a "project-type" branch that swaps to `competitive-analyst` for non-marketplace projects, or (b) explicit acknowledgment that Playwright-swarm is for commerce-style products only.

3. **Step 1b trend-analyst scope hardcodes "gaming marketplace sector"** — evidence the spec was lifted from kvik-aibrain/eldorado without generalization. Should be `<YOUR-PROJECT-SECTOR>` template placeholder.

4. **Step 3 `/plan-ceo-review` invocation is potentially disastrously expensive** (~40-60K tokens per invocation) and the spec provides no guidance on when to use a cheaper `ceo-reviewer` agent fallback. For blank-scaffold first-refresh scenarios, the full skill is overkill.

5. **Step 4's two-mode branching (founder-review vs danger-builder) doubles the effective cost envelope** without explicit warning. Consumers should know: danger-builder mode adds ~15-20K per refresh.

**Optimization proposals:**
- **A.** Create `Sub-agent Instructions/trend-analyst-instructions.md` or remove the mandate from the ritual
- **B.** Add project-type gating in Step 1a: `if project is marketplace: spawn 3 ui-comprehensive-tester on Playwright; elif project is framework/CLI: spawn 1 competitive-analyst; elif project is API-only: skip competitive sweep`
- **C.** Generalize Step 1b trend-analyst scope; use `<PROJECT-SECTOR>` placeholder
- **D.** Add Step 3 escape hatch: "For blank-scaffold first-refresh or refreshes with ≤3 milestone changes, use `ceo-reviewer` agent instead of full `/plan-ceo-review` skill (~10x cheaper)"
- **E.** Document Step 4 mode-cost delta in the ritual's top-matter "cost estimate" block

### Pre-wave A output (conceptual; not written)
The refresh would have produced:
- New milestone in ROADMAP.md: **M1 — Brain distribution via `@auto-claude/brain` NPX package**, H1, bet-source = new "hybrid distribution" bet in FOUNDER-BETS.md, primary risk = installer-regression support burden (BMad precedent)
- Scope contains enough content to support 3-5 atomic waves (covers npm package creation, npx bootstrap CLI, symlink/overlay resolution, migration docs for consumer projects, dual-mode sync tool updates)

This becomes the input to Pre-wave B (backlog-planning).

### Pre-wave B — backlog-planning
Milestone breaks into atomic tasks that TaskMaster can serve to Stage 0. Authority: `backlog-planning.md`.
- **Status:** completed

**Files read:**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `backlog-planning.md` | 5,100 | 1,275 |
| All other prereqs | 0 (cached from Pre-wave A) | 0 |
| **Subtotal reads** | **5,100** | **~1,300** |

**Sub-agent spawns:** NONE. Reused Pre-wave A's competitive-analyst output. **Spec-coherence note:** backlog-planning.md § Step 1 mandates spawning `competitive-analyst` without acknowledging that a recent refresh-ritual run already has fresh competitive data. A real founder running A → B back-to-back would wastefully re-spawn (~15K tokens) or deviate from spec.

**Step 2 (`/plan-ceo-review`):** NOT invoked. Simulated: ~5,000 tokens for inline CEO-style challenge (rank tasks, cut scope, force differentiation checks, prevent competitor-copying).

**Step 3 + 3.5 output (5 atomic tasks from M1):**
1. Create `@auto-claude/brain` npm package scaffold — **S**, us-only, node-specialist, risk: namespace availability
2. Brain-tree packager for release workflow — **S**, us-only, node-specialist, risk: .brainignore semantics differ on npm-sourced brain
3. Bootstrap CLI `npx create-auto-claude` — **M**, matches-competitors, cli-developer, risk: BMad-style installer regressions
4. Dual-mode sync tool (git + npm source) — **M**, us-only, node-specialist + refactoring-specialist, risk: cache pollution
5. Migration docs + kvik/eldorado execution — **L** → pre-split into 5a/5b/5c

No XL tasks (all passed rubric cleanly). Task 5 was L and was split preemptively per § Step 3.5 spirit:
- 5a Migration docs (S)
- 5b kvik migration execution (S)
- 5c eldorado migration execution (M)

**Step 4 (founder checkpoint, founder-review mode):** approved. Recommended order: 1 → 2 → 3 → 4 → 5a → 5b → 5c. Start with Task 1 (prerequisite for all; clear done-signal = publishable package on npm registry). ~200 tokens inline.

### Totals for Pre-wave B
| Category | Tokens |
|---|---|
| File reads | ~1,300 |
| Reused Pre-wave A output | 0 |
| `/plan-ceo-review` (SIMULATED — not invoked) | ~5,000 |
| Task breakdown + size rubric + pre-split + write | ~3,500 |
| Founder inline approval | ~200 |
| **Pre-wave B total (simulated path)** | **~10,000 tokens** |
| **Pre-wave B total (realistic with real skill + redundant competitive spawn)** | **~60-90K tokens** |

**Spec-coherence findings:**

1. **Step 1 doesn't recognize refresh-ritual reuse.** If backlog-planning runs right after roadmap-refresh-ritual, the competitive-analyst output is still fresh and should be reused. Spec mandates a re-spawn. **Severity: MEDIUM** — wastes ~15K tokens per post-refresh backlog run.

2. **Step 2 invokes `/plan-ceo-review` again** — same expensive skill as Step 3 of the refresh ritual. In sequential A→B execution, that's `/plan-ceo-review` called twice within ~1 hour. Spec doesn't address this potential double-cost. **Severity: HIGH** — burns ~80-120K tokens combined across A + B.

3. **Size-rubric cross-reference is implicit.** § Step 3 says "apply the Stage 1 size rubric" without pointing to `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` specifically. A founder unfamiliar with the codebase would not know where the rubric lives. **Severity: LOW** — readable by context but not agent-friendly.

4. **Step 3.5 is labeled "pre-size split for XL items"** but applying to L items that tend toward XL is sound practice. Spec could explicitly invite early-splitting of L items that have high variance. **Severity: LOW** — optional refinement.

**Optimization proposals (beyond A):**
- **F.** Document a fast-path in `backlog-planning.md` when `/plan-ceo-review` was invoked within the last 2 hours — reuse the synthesis rather than re-invoking
- **G.** § Step 1 should say: "if competitive-analyst output exists in `Planning/` from the last 24h, reuse; spawn only if stale"
- **H.** Make size-rubric cross-ref explicit with the file path

### Pre-wave B output (conceptual; not written)
TaskMaster would be seeded with 7 rows (tasks 1, 2, 3, 4, 5a, 5b, 5c). `Planning/morning-backlog.md` (or similar) would contain the prioritized presentation. Task 1 is the next-wave pick.

This seeds Stage 0 of the wave loop.

### Stage 0 — Prior-work query
First tick of the wave loop on Task 1 from Pre-wave B's backlog: "Create `@auto-claude/brain` npm package scaffold."
- **Status:** completed

**Files read:** stage spec (853 bytes, ~215 tokens) — actually cached from earlier session, 0 marginal.

**Tool calls:** `mcp__plugin_claude-mem_mcp-search__search` — 1 real invocation with query "npm package scaffold brain distribution NPX auto-claude". Returned 15 observations + summary.

**Result:** No prior wave output covers creating an npm package for the brain. Adjacent work returned:
- setup-tools/install.md work (v0.6.0+) — documents install commands but not package creation
- `/update-tools` skill (v0.7.0) — installs tooling, doesn't package brain
- bin/auto-claude sync tool (v0.6.0+) — closest adjacent but for consumption not packaging
- Consumer-project .brainignore conventions (ignore:bin/) — relevant for Task 4 (dual-mode sync) but not Task 1

**Verdict:** proceed to Stage 1 as normal. No Stage 3 scope reduction available.

### Totals for Stage 0
| Category | Tokens |
|---|---|
| Stage spec read | 0 (cached) |
| mcp-search call + response | ~1,300 |
| Inline analysis of results | ~200 |
| **Stage 0 total** | **~1,500 tokens** |

**Spec-coherence findings:**
- Stage 0 spec is exceptionally tight (22 lines, 4 actions). No coherence issues.
- The spec says "If prior wave output covers the same surface and is still current: cite it in the plan, reduce Stage 3 scope to the delta." In practice, Stage 0 surfaces *adjacent* work (related but not same-surface) that Stage 1 authors can reference. Spec could add a small note: "adjacent work worth citing in the plan even if Stage 3 scope isn't reduced."
- **Files read:** _tbd_
- **Agents spawned:** _tbd_
- **Tokens in:** _tbd_
- **Tokens out:** _tbd_
- **Spec-coherence notes:** _tbd_
- **Output summary:** _tbd_

### Stage 0b — Product decisions
Conditional stage — evaluates whether task has roadmap/product-decision needs.
- **Status:** completed (all three skip conditions hold; pass-through)

**Files read (partial):** stage-0b spec ~2K tokens (skimmed first 80 lines; skip conditions visible early). Full spec is 209 lines / ~12.5K tokens — a real agent running this rigorously would read the entire file.

**Skip evaluation for Task 1:**
| Step | Skip condition | Task 1 state | Decision |
|---|---|---|---|
| 0 | zero `metadata.roadmapMilestone === "unassigned"` tasks | Task 1 assigned to `m1-brain-distribution` | Skip |
| 1-5 | zero tasks with `metadata.needsProductDecision === true` | Task 1 has no product-decision flag (pure technical scaffold) | Skip |
| 6 | TaskMaster has zero unassigned tasks at all | All 7 backlog tasks assigned | Skip |

All three satisfied → proceed directly to Stage 1. No sub-agent spawns, no Playwright competitive-browsing, no BOARD consultation.

### Totals for Stage 0b
| Category | Tokens |
|---|---|
| Partial spec read (first 80 lines) | ~2,000 |
| Skip-condition evaluation | ~300 |
| Report write | ~500 |
| **Stage 0b total (simulated, pass-through)** | **~2,800 tokens** |
| **Stage 0b total (realistic if full spec read + at least one task had needsProductDecision)** | **~45K tokens** (3 Playwright agents in parallel + metadata writes + daily-checkpoint entries) |

**Spec-coherence findings:**
- Stage 0b spec is 209 lines — **biggest stage spec in the wave loop by line count**. Skip conditions are clear but surfaced on line 19. Realistic cost = full spec read = ~12.5K tokens *just to know whether to skip*. **Severity: MEDIUM** — consider moving skip table to lines 1-10 (above "Applies to" section) so agents can skip-and-exit without paying full-read cost.
- Step 0 (Unassigned queue walk) mandates MANDATORY metadata writes even for skipped assignments. That's great for audit trail but expensive when the queue has 50+ unassigned items (multiple TaskMaster API calls per task).
- The Stage 1 size rubric cross-reference appears here too (line 57) — same as backlog-planning. Should consolidate into a single referenced doc rather than repeating. **Severity: LOW** — doc duplication.

**Optimization proposal:**
- **I.** Add "Fast-path skip detection" block to Stage 0b spec top-matter (lines 1-10): "If ALL: (a) no unassigned tasks, (b) no needsProductDecision, (c) no pending product queue — SKIP entirely and proceed to Stage 1. Read this file in full only when any condition fails."

### Stage 1 — Problem reframing
- **Status:** completed. Both reviewers returned PROCEED with distinct findings.

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-1-problem-reframing.md` | 13,442 | 3,360 |
| `Sub-agent Instructions/problem-framer-instructions.md` | 6,130 | 1,530 |
| `Sub-agent Instructions/ceo-reviewer-instructions.md` | 3,680 | 920 |
| **Subtotal** | **23,252** | **~5,810** |

**Sub-agent spawns (parallel, fresh context, no cross-talk):**

| Agent | Tokens | Tool uses | Wall time | Verdict |
|---|---|---|---|---|
| problem-framer | 37,089 | 2 | 45.5s | PROCEED (all 4 size-rubric thresholds clean) |
| ceo-reviewer | 37,053 | 6 | 43.0s | PROCEED with pre-requisite (founder must file hybrid-distribution bet in FOUNDER-BETS.md) |
| **Combined** | **74,142** | **8** | **~46s (parallel)** | Both PROCEED — no escalation |

**Distinct findings (validating two-reviewer independence):**

problem-framer uncovered:
- Three solution classes worth choosing between at Stage 2: (A) flat single-package, (B) pnpm workspaces monorepo, (C) zero-build "files-as-package" that eliminates BMad-regression class by construction
- Antipattern risk: scope creep into tasks 2-5 ("while I'm here, let me stub the packager logic")
- Premature abstraction risk if Class B (workspaces) chosen before Tasks 3-5 commitment is confirmed

ceo-reviewer uncovered:
- **Real spec-coherence gap in the simulation itself:** FOUNDER-BETS.md is still a blank scaffold. The "hybrid distribution bet" I claimed I added in Pre-wave A was never actually written to the file — I only described it in conversation. Agent read the file and caught the gap. Real pre-requisite blocker for merge.
- Need `.brain-source` stamp file for Task 4 (dual-mode sync) to detect origin; contract should be decided here, not deferred
- Reserve `@auto-claude/brain@0.0.0` placeholder; don't publish functional until Task 3 lands

### Totals for Stage 1
| Category | Tokens |
|---|---|
| Prereq reads | ~5,810 |
| problem-framer spawn | 37,089 |
| ceo-reviewer spawn | 37,053 |
| Orchestrator synthesis | ~500 |
| **Stage 1 total** | **~80,400 tokens** |

**MAJOR spec-coherence finding:**

The README claims "~75K tokens typical per wave." **Stage 1 alone consumed ~80K.** Breakdown of why:
- The two reviewer agents each consumed ~37K despite prompts totaling ~2K each
- Root cause: agent instruction files + Claude Code's Task-tool overhead + tool-use during analysis (Read, Grep) each stack
- If both agents ran "lightly" (prompt-only, no tool use), cost would be ~25-30K — aligned with README estimate
- **With realistic agent behavior (the kind the brain's own agent instructions ENCOURAGE — read precedent files, grep for context, verify claims)**, cost is 2-3x the estimate

**Severity: HIGH.** The brain's docs (README, management files) systematically underestimate per-wave cost under the behavior they themselves require. Consumers budgeting for "~75K wave" will be shocked by the reality.

**Optimization proposals:**
- **J.** Revise README context-cost claims to reflect agent tool-use reality (probably ~150-200K typical, ~300K+ worst-case per wave)
- **K.** Stage 1 spec could include a "light vs deep" reviewer mode — light = reasoning only on prompt, deep = allowed to read/grep. Founder chooses based on stakes. Current spec implicitly demands deep; no light path.
- **L.** sub-agent-workflow.md could add guidance on when tool-use is warranted. Right now every reviewer defaults to maximum tool-use because their instruction files encourage it.

**Spec-coherence wins:**
- The two-reviewer independence pattern WORKS. Problem-framer found structural alternatives (solution classes); ceo-reviewer found strategic gaps (missing bet). Neither would have found both.
- Fresh-context spawn is essential — ceo-reviewer's grep of FOUNDER-BETS.md was fresh, no contaminating assumptions from the orchestrator's conversational framing.

### Stage 2 — Plan authoring
- **Status:** completed. Plan drafted in-report (not written to a real Planning/wave file per simulation ground rules). Both plan-review skills SIMULATED, not invoked.

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-2-plan.md` | 6,334 | 1,580 |
| `planning-principles.md` | 7,811 | 1,950 |
| **Subtotal** | **14,145** | **~3,530** |

Stage 1 reframing output from the two reviewer spawns: ~0 marginal (retained in-session context, not re-read).

**Solution-class decision (from Stage 1 problem-framer):**
Chose hybrid of Class A + Class C — zero build step for brain content (eliminates BMad-regression surface by construction) plus a minimal `bin/` stamp + TS stub for future sync-tool detection (Class A compatibility).

**Plan drafted (see main report text above):**
- 7 new files in `packages/brain/`
- 2 sub-agents: `node-specialist` primary, `security-engineer` for secret-leak audit
- Tester swarm: 0 (Stage 6 skips — non-web)
- design_gap_flag: false

**Plan-review skills (SIMULATED):**
| Skill | Applicable? | Simulated cost | Real cost estimate |
|---|---|---|---|
| `/plan-eng-review` | yes (non-trivial wave) | ~3,000 tokens (me describing eng review findings) | ~40-60K (real invocation) |
| `/plan-devex-review` | yes (NPX CLI/SDK surface) | ~3,000 tokens (me describing devex findings) | ~40-60K (real invocation) |
| `/plan-design-review` | no (non-UI) | 0 | 0 |
| `/autoplan` | no (single-dimension) | 0 | 0 |

### Totals for Stage 2
| Category | Tokens |
|---|---|
| Prereq reads (stage-2 + planning-principles) | ~3,530 |
| Plan drafting (me synthesizing Stage 1 + writing plan) | ~7,000 (4K analysis + 3K written output) |
| `/plan-eng-review` SIMULATED | ~3,000 |
| `/plan-devex-review` SIMULATED | ~3,000 |
| Post-write consistency check | ~500 |
| **Stage 2 total (simulated)** | **~17,000 tokens** |
| **Stage 2 total (realistic with both skills invoked)** | **~100-130K tokens** |

**Spec-coherence findings:**

1. **Stage 2 mandates up to 4 plan-review skill invocations** (`/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan`) without explicit cost warning. Real invocation of both eng+devex review would ~triple Stage 2 cost. No guidance on WHEN to skip vs WHEN to invoke under cost pressure. **Severity: HIGH** — combined with Stage 1's sub-agent cost, a rigorous wave is already at 180K+ by Stage 2 end.
2. **Stage 1 reframing output format is assumed but not spec'd.** The stage says "plan MUST reference its verdict (PROCEED/RESCOPE/ESCALATE) and the chosen solution class" but problem-framer's output format isn't standardized in its instruction file. Works in practice because reviewers naturally return structured output; formal schema would reduce variance.
3. **Design-gap flag is a required plan field** but Stage 2 spec says "grep `design/` for every page/component/icon the plan references" — for non-UI tasks like this npm-package-scaffold one, the instruction is awkward (there's nothing to grep for). Spec could explicitly say "skip design-gap check when task has no UI targets."
4. **Solution-class choice from Stage 1 is NOT explicit plan content.** My plan chose "hybrid of Class A + Class C" based on problem-framer's output, but Stage 2 spec doesn't mandate recording which solution class was chosen + why. This is valuable Stage 3-gate input and should be a required plan field.

**Optimization proposals:**
- **M.** Stage 2 spec should have a "skill invocation cost table" — expected token cost per skill, recommended firing conditions, cost-conscious mode alternatives
- **N.** Standardize Stage 1 reframing output schema (verdict / size rubric table / solution classes list / antipattern findings) in problem-framer's instruction file
- **O.** Add required plan field: "Solution class chosen (from Stage 1)" with a rationale line

**Plan content summary (for downstream stage consumption):**
- 7 files new, ~300-500 LOC
- @auto-claude/brain@0.0.0 placeholder (reserve namespace, don't publish functional)
- Build-free content distribution (files: in package.json)
- Founder pre-req: add hybrid-distribution bet to FOUNDER-BETS.md before merge

### Stage 3 — Gate (Karen + Jenny)
- **Status:** completed. Both agents APPROVE-WITH-CONCERNS. Gate caught one critical defect + 3 medium defects the plan would have shipped with.

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-3-gate.md` | 4,663 | 1,165 |
| `karen-instructions.md` | 8,186 | 2,045 |
| `Jenny-instructions.md` | 7,178 | 1,795 |
| **Subtotal** | **20,027** | **~5,005** |

**Sub-agent spawns (parallel, fresh context):**

| Agent | Tokens | Tool uses | Wall time | Verdict |
|---|---|---|---|---|
| Karen (source-claim verification) | 34,540 | 13 | 60.1s | APPROVE-WITH-CONCERNS |
| Jenny (spec-semantic verification) | 55,196 | 10 | 68.2s | APPROVE-WITH-CONCERNS |
| **Combined** | **89,736** | **23** | **~68s (parallel)** | APPROVE-WITH-CONCERNS |

**Critical defects caught (would have destroyed Stage 4 execution):**

From Karen (verifying claims against actual repo state):
1. **npm `files:` field cannot reference paths outside the package directory.** Plan targeted `files: [command-center, CLAUDE.md, design]` from `packages/brain/` — would silently ship empty package at pack time. **Load-bearing defect.** Must resolve via (a) root-level package, (b) prepack copy script, or (c) symlink strategy. Stage 4 would waste entire execution without this catch.
2. Root `package.json` doesn't exist — plan's "possibly modified" row for root is misleading.
3. No network check on `@auto-claude` scope availability — should dry-run `npm view @auto-claude/brain` before Stage 4.

From Jenny (spec + best-practice checks):
1. **`publishConfig: { access: "public" }` missing from package.json targets.** Scoped npm packages default to private; publish silently fails without this. Classic NPX foot-gun. **Medium severity.**
2. LICENSE + `engines` fields missing from targets — npm publish best practice. Low severity, trivial add.
3. `src/index.ts` + tsconfig reintroduce build surface that Class C specifically chose to eliminate. Plan must commit: no `build` script; ship `.js` directly or skip TS entirely. Medium severity.
4. Scope fence holding clean (no files leaking to Tasks 2-5).

**Strategic reframing note (from Jenny):**
The original founder ask was "NPX package"; Pre-wave A reinterpreted as "hybrid distribution" (NPX + git+sync). This is a legitimate founder-approved expansion, but **the reframing itself wasn't surfaced as a decision point — it was absorbed as a roadmap conclusion.** Real founders might want that reframing more visible at decision-time.

### Totals for Stage 3
| Category | Tokens |
|---|---|
| Prereq reads | ~5,005 |
| Karen spawn | 34,540 |
| Jenny spawn | 55,196 |
| Synthesis | ~500 |
| **Stage 3 total** | **~95,241 tokens** |

**Spec-coherence findings:**

1. **Stage 3 is the wave's most expensive stage so far (~95K)** — more than Stage 1's ~80K. Unlike Stage 1's "rough analysis" mode, Stage 3 does deep verification that requires tool-use (git log, file reads, path resolution checks). Token cost per agent scales with defect-finding depth.

2. **Both reviewers' findings were genuinely independent.** Karen verified what exists; Jenny verified what was asked vs what was delivered. Overlap was minimal. Three critical defects, three distinct domains of verification.

3. **Gate value is real in tokens-saved terms.** A naive Stage 4 execution against the unverified plan would have shipped an empty npm package (Karen's files: defect) + silently-failing publish (Jenny's publishConfig defect). Real-run Stage 4 cost estimate: 50-80K. Gate cost 95K but prevented 150K+ of wasted execution + eventual Stage 5b/6/7 failure cascades.

4. **Stage 3 spec doesn't prescribe what to do on APPROVE-WITH-CONCERNS verdict.** The spec treats verdicts as binary (approve/reject). In practice, APPROVE-WITH-CONCERNS is the most common outcome — plan author iterates on concerns (plan v2), optionally re-runs gate. Spec should formalize this cycle.

5. **No cost guidance on Gemini for "high-stakes" waves.** Stage 3 spec mentions Gemini for high-stakes but doesn't define the threshold or the cost impact. A Gemini gate run would add another ~40-60K. For this wave, skipped (S-sized scaffold, not high-stakes) — justified but under-documented.

**Optimization proposals:**
- **P.** Formalize APPROVE-WITH-CONCERNS as a first-class verdict in Stage 3 spec with plan-v2-then-regate cycle described
- **Q.** Add a `--quick-gate` mode for S-sized tasks — Karen-only, skip Jenny + Gemini. Estimate ~35K instead of ~95K. Suitable for scaffolds/config changes where source-claim verification matters more than spec-drift.
- **R.** Make the "strategic reframing" detection an explicit Jenny subroutine — if original founder ask differs significantly from Pre-wave A output, Jenny flags it as "reframing disclosure" for founder awareness

**Plan status after gate:**
Under real-run semantics, plan must be iterated to v2 addressing the 4 concerns before Stage 4 proceeds. In simulation, noting the iteration would happen + moving forward without actually iterating.

### Stage 3b — Design-gap
Conditional stage — resolves design gaps before Stage 4 spawns implementers.
- **Status:** completed (all skip conditions satisfied; pass-through)

**Files read (optimal skip path):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-3b-design-gap.md` (lines 1-20 only — skip conditions) | ~2,000 | ~500 |
| Stage 1/2 outputs (retained from earlier session context) | 0 | 0 |
| **Subtotal** | **~2,000** | **~500** |

**Skip evaluation:**
| Condition | Task 1 state | Pass? |
|---|---|---|
| Backend/infra/doc/bug-fix wave with no UI | npm package scaffold, zero UI | ✓ |
| Stage 1 `design_gap_flag: false` | No UI referenced (implicit false) | ✓ |
| Stage 2 `design_gap_flag: false` | Explicit in plan | ✓ |

All three pass → skip to Stage 4.

### Totals for Stage 3b
| Category | Tokens |
|---|---|
| Partial stage spec read | ~500 |
| Skip evaluation | ~200 |
| Report write | ~400 |
| **Stage 3b total (simulated, optimal skip)** | **~1,100 tokens** |
| **Stage 3b total (rigorous full-prereq read then skip)** | **~5,500 tokens** |
| **Stage 3b total (if stage had fired — full Dx loop)** | **~60-100K** |

**Spec-coherence findings:**

1. **Prerequisite ordering tempts over-reading.** Stage-3b's "Prerequisites" section (lines 21-26) is listed BEFORE the "Skip conditions" section (lines 8-20) semantically but comes after line-wise. An agent following always-on rule #1 literally reads the spec top-down, sees prereqs first, may decide to fulfill them before checking skip. Spec should either:
   - Move skip conditions above prereqs, OR
   - Add explicit note: "Read prereqs ONLY if skip conditions fail"

2. **Stage 1 reframing output schema unclear on design_gap_flag.** Problem-framer's instruction file doesn't require setting `design_gap_flag: true/false` — it's mentioned in Stage 1's STAGE spec but not in the reviewer's own instruction. Stage 2 spec then assumes it's present. Works in practice (non-UI tasks have implicit `false`) but formal schema would eliminate ambiguity. Same issue flagged at Stage 2 — single root cause.

3. **Stage 3b's 9.8K spec is large for a skip-able stage.** A project that rarely has UI gaps (like auto-claude itself — pure CLI/framework) pays the read cost at every wave even though Stage 3b fires rarely. Same complaint as Stage 0b but less severe (3b spec is smaller).

**Optimization proposals:**
- **S.** Reorder Stage 3b spec: skip conditions first (lines 1-10), prereqs second with explicit "only read if not skipping," actions third. Apply same pattern to Stage 0b.
- **T.** Add explicit `design_gap_flag: true | false` as a required field in problem-framer's instruction file + Stage 2 plan schema. Eliminates the "implicit false" ambiguity.
- **U.** Consider marking some stages as "non-UI projects skip permanently" — auto-claude itself will never have design-gap fires, but still reads 3b spec on every wave. Could gate by project-type in the wave-loop dispatcher.

### Stage 4 — Execute
- **Status:** completed. node-specialist drafted concrete files (no writes per simulation). security-engineer CLEAN with hardening recs + caught a REAL dangling cross-reference in auto-claude's own CLAUDE.md.

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-4-execute.md` | 3,507 | 880 |
| `dev-principles.md` | 11,377 | 2,850 |
| `security-engineer-instructions.md` | 5,944 | 1,485 |
| `node-specialist-instructions.md` | **MISSING** | 0 |
| **Subtotal** | **20,828** | **~5,215** |

**Sub-agent spawns (parallel):**

| Agent | Tokens | Tool uses | Wall time | Output shape |
|---|---|---|---|---|
| node-specialist | 8,752 | 0 | 23.3s | Concrete file contents for 5 files |
| security-engineer | 30,374 | 30 | 123.5s | CLEAN verdict + M1/M2/L1-L4 findings |
| **Combined** | **39,126** | **30** | **~124s (parallel)** | Plan revised, 3 real findings, 1 brain-bug caught |

**Key Stage 4 output:**

node-specialist **revised the plan**:
- Chose Option A: root-level package (repo IS the package root)
- Dropped `src/index.ts` + `tsconfig.json` — committed to zero build
- Kept 5 files at repo root: `package.json`, `.npmignore`, `README.md`, `brain-source.stamp`, `index.js`
- Addressed all 4 Stage 3 gate concerns (publishConfig, LICENSE via package.json `license`, engines, no build script)

security-engineer **caught a real production bug in auto-claude**:
- **CLAUDE.md line 64 references `notifications/resend.md`** — file deleted in v0.9.0. Four stale Resend-era references in the danger-builder trigger row ("per-decision Resend notifications", "Resend env vars", path to `notifications/resend.md`, conceptual "Resend email spec"). Verified dangling on disk. **Real defect the v0.9.0 rename missed.** Severity: HIGH (production CLAUDE.md trigger table points at missing file). Logged for post-simulation fix.
- Other findings: M1 (Planning/ exclusion + prepublishOnly guard), M2 (bin/auto-claude* hardcodes github URL — supply-chain coupling), L1-L4 (minor cleanup + technical-writer follow-up for L3 doc integrity).

**/simplify skill (mandated by Stage 4 spec post-implementation):** SIMULATED — not invoked. Would add ~5-10K real tokens. Noted as not-blocking for simulation.

### Totals for Stage 4
| Category | Tokens |
|---|---|
| Prereq reads | ~5,215 |
| node-specialist spawn | 8,752 |
| security-engineer spawn | 30,374 |
| Synthesis | ~500 |
| **Stage 4 total (simulated, /simplify skipped)** | **~45K tokens** |
| **Stage 4 total (realistic with /simplify)** | **~50-55K** |

**Key observation: Stage 4 is CHEAPER than Stages 1 or 3.** The execute stage has clearer scope than open-ended problem-framing or multi-claim verification. node-specialist was dirt-cheap (8.7K, 0 tool uses) because its inputs were all in the prompt — no repo scanning needed. security-engineer ran expensive (30K, 30 tool uses) but that was the audit's JOB.

**Spec-coherence findings:**

1. **node-specialist has no project-customized instruction file** in `Sub-agent Instructions/`. Spec says "Each sub-agent receives its instruction file as FIRST directive in the prompt." When no project file exists, the agent's global system card (`~/.claude/agents/node-specialist.md`) IS the first directive by default — but this isn't documented in sub-agent-workflow.md. Implicit behavior that breaks rule #1 literally. **Severity: MEDIUM.**

2. **Stage 4 spec mandates /simplify on touched files** as a post-step. Under shallow simulation the skill is skipped; in realistic run it adds ~5-10K per wave. Not a coherence issue per se but worth noting for cost accounting.

3. **Plan revision loop missing from Stage 4 spec.** node-specialist materially revised the plan (root-level package vs packages/brain/ subdirectory, no tsconfig). Under current spec, this output doesn't formally trigger a Stage 2 re-iteration → Stage 3 re-gate. Real-run practice would probably just ship the revision into Stage 4b review. Spec could formalize: "if Stage 4 implementer revises plan scope materially, either (a) re-run Stage 3 gate on revised plan, or (b) note in Stage 4b review."

4. **META-COHERENCE: auto-claude's own CLAUDE.md has a real v0.9.0 rename leftover.** Caught by a simulation agent. Real production bug. See § Post-simulation fix list.

**Optimization proposals:**
- **V.** Document the "no project-specific instruction → use global system card" fallback in sub-agent-workflow.md
- **W.** Add plan-revision protocol to Stage 4 spec when implementer changes scope vs plan v2
- **X.** Post-simulation: fix CLAUDE.md line 64 to replace `notifications/resend.md` with `notifications/agentmail.md` + replace "Resend" with "AgentMail" in all 4 places on that line

**node-specialist's drafted files (reference for downstream stages):**

```json
// /root/auto-claude/package.json (root-level, not packages/brain/)
{
  "name": "@auto-claude/brain",
  "version": "0.1.0",
  "license": "MIT",
  "engines": { "node": ">=18.0.0" },
  "publishConfig": { "access": "public" },
  "files": ["CLAUDE.md", "command-center", "design", "brain-source.stamp", "index.js"],
  "main": "index.js",
  "exports": { ".": "./index.js", "./stamp": "./brain-source.stamp" },
  "repository": { "type": "git", "url": "https://github.com/memphyssk/auto-claude.git" }
}
```

Plus plain-CommonJS `index.js` with `getAssetPaths()` export, brain-source.stamp (JSON), README.md (pre-1.0 warning), minimal .npmignore.

**Stage 4 open issues for Stage 4b:**
1. command-center/ and design/ directories must exist before first publish (they do — confirmed)
2. Repository URL needs verification vs actual remote (sec-engineer confirmed it matches)
3. bin: {} placeholder — decide when Task 4 lands (defer to Task 4's wave)
4. brain-source.stamp JSON contract — document when Task 4 (dual-mode sync) reads it

### Stage 4b — Post-build review
- **Status:** completed (near-total skip — no files actually written; build checks don't apply)

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-4b-review.md` | 770 | 195 |
| `skill-use.md` | 0 (cached) | 0 |
| **Subtotal** | **770** | **~200** |

**What the stage would have done under real Stage 4 writes:**
| Check | Task 1 context | Expected result |
|---|---|---|
| `biome check --write` | JSON in package.json + brain-source.stamp; JS in index.js | Minor formatting |
| `pnpm typecheck` | N/A — node-specialist's revision has no TS | Pass (no types to check) |
| `pnpm test` | No tests added in Task 1 scope | Pass trivially; /review might propose smoke test |
| `pnpm build` | No build script (Class C commitment) | N/A |
| `/review` skill on diff | Would validate package.json npm-best-practices + flag `bin: {}` placeholder | Findings likely |
| Build-without-env smoke | No build step → not applicable | Skip |

**Documented for Stage 5 hand-off:** prepublishOnly script (per security-engineer recommendation) + `npm pack --dry-run` sanity check should be part of the deliverable.

### Totals for Stage 4b (revised — assuming /review fires)
| Category | Tokens |
|---|---|
| Spec read | ~200 |
| biome / typecheck / test / build command runs on 5 files | ~4,000 in + ~1,200 out |
| `npm pack --dry-run` verification (sec-engineer's prepublishOnly recommendation) | ~2,500 |
| `/review` skill invocation (preamble + diff read + cognitive walk + findings + tool use) | ~30-50K |
| Synthesis | ~500 |
| **Stage 4b total (Task 1 wave, /review FIRES)** | **~40-55K tokens (midpoint ~45K)** |
| **Stage 4b total (Task 1 wave, /review SKIPPED)** | **~5-7K** |
| **Stage 4b total (original shallow sim — no files written)** | **~700 tokens** |

**Cost-vs-value note for /review on S-sized waves:** For a 5-file scaffold with already-reasoned code from node-specialist, /review's value is marginal — most of what it would catch (contract mismatches, null-access patterns) doesn't apply to a config-file-dominated diff. Rule of thumb going forward: fire /review on M/L waves, skip on S. For this simulation we're forcing it to fire as the comparison baseline.

**Spec-coherence findings:**

1. **Stage 4b spec hard-codes pnpm commands** (`pnpm typecheck`, `pnpm test`, `pnpm build`). For projects using npm, yarn, or bun, agents would need to translate. auto-claude itself has no package.json at project root — which was exactly the thing Task 1 creates. So the spec assumes "project has pnpm" which isn't universally true. **Severity: LOW** — easy to read intent + adapt.

2. **`/review` skill is marked "optional"** ("Optionally run `/review` skill on the diff for deeper analysis") but for realistic Stage 4b cost accounting, whether it's run matters a lot (~30-50K difference). No guidance on when to fire vs skip. **Severity: LOW** — discretion is reasonable for this skill.

3. **No explicit "no-op on pure-doc/config-only waves" path.** For waves that only touch Markdown or YAML (like most auto-claude brain-edit waves), Stage 4b checks have nothing to do. Spec should acknowledge this explicitly rather than listing mandatory shell commands.

**Optimization proposals:**
- **Y.** Parametrize Stage 4b shell commands — reference project's package manager config rather than hardcoding pnpm
- **Z.** Add "pure-doc wave" skip condition: if no code files changed (only `.md`, `.yaml`, `.yml`, `.txt`), skip build-chain checks + optionally skip `/review`

**Hand-off to Stage 5:**
All files drafted by node-specialist are internally consistent. Security-engineer's prepublishOnly + `files:` allowlist recommendations should land in Task 1 scope rather than deferred.

### Stage 5 — Deploy + CI watch
- **Status:** completed (shallow — no actual deploy). Documenting expected flow + spec-coherence issues surfaced.

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-5-deploy.md` | 4,391 | 1,100 |
| `monitor-principles.md` (conditional — only if Spawn-and-Block needed) | 6,896 | 1,725 |
| `gh-actions.md` (conditional) | 3,259 | 815 |
| **Subtotal (optimistic — no monitor)** | **4,391** | **~1,100** |
| **Subtotal (realistic — includes monitor prereqs for Spawn-and-Block readiness)** | **14,546** | **~3,640** |

**What WOULD happen for Task 1 in real execution:**

1. `git checkout -b feat/m1-brain-npm-scaffold` — new branch from main
2. `git add package.json .npmignore README.md brain-source.stamp index.js` + `git commit -m "feat(brain): @auto-claude/brain npm package scaffold (M1 Task 1)"`
3. `git push -u origin feat/m1-brain-npm-scaffold`
4. `gh pr create` with summary + test plan
5. Watch GitHub CI (auto-claude has no CI jobs currently — likely passes trivially)
6. `gh pr merge --squash --delete-branch`
7. `git checkout main && git pull`
8. `npm pack --dry-run` — verify 5 files ship, no leaked Planning/ content
9. **NO actual `npm publish`** — per ceo-reviewer, reserve `@auto-claude/brain@0.0.0` as placeholder only; functional publish waits until Task 3 ships the bootstrap CLI
10. Tag the release: `git tag v0.13.0 HEAD` (brain VERSION bump for M1 scope introduction) + `git push --tags`

**Monitor spawn (per monitor-principles):** NOT needed. GitHub CI for auto-claude has no long-running jobs; wait < 5min threshold. Spawn-and-Block reserved for Railway/Netlify/DNS async events, none of which apply.

### Totals for Stage 5
| Category | Tokens |
|---|---|
| Stage spec read | ~1,100 |
| Monitor prereqs (cached — not actually read this tick since no monitor needed) | 0 |
| Describing flow + documenting expected state | ~1,000 |
| `/ship` skill SIMULATED (not invoked) | ~500 (inline description) |
| **Stage 5 total (simulated, no /ship, no monitor)** | **~2,600 tokens** |
| **Stage 5 total (realistic with /ship skill invoked + GitHub CI watch + npm pack verify)** | **~20-30K tokens** |
| **Stage 5 total (worst case with multi-target deploy + Spawn-and-Block monitor)** | **~40-50K tokens** |

**Spec-coherence findings:**

1. **Stage 5 hardcodes 3 deploy targets: GitHub / Netlify / Railway.** For projects that deploy elsewhere (npm, PyPI, Cargo, Docker Hub, Vercel, Fly.io, Cloudflare), the spec literally doesn't fit. Must be read as "example for this source project" rather than literal contract. **Severity: HIGH** — same kinsd of source-project-assumption leakage we saw in roadmap-refresh-ritual (gaming marketplace), backlog-planning, and Stage 0b. Entire wave-loop has systemic coherence issue for non-marketplace projects.

2. **Stage 5 has no section for npm-registry or package-registry deployments.** For Task 1 specifically, the primary "deploy target" is npm. Spec doesn't mention it. Would need a new section or generalization of the "verify deploy target" contract.

3. **`/ship` skill not referenced.** The spec describes the manual `git + gh pr` flow in Steps 1-8 but doesn't mention that `/ship` skill (listed in CLAUDE.md skills) automates exactly these steps. An agent might reimplement the flow manually instead of invoking the skill. **Severity: MEDIUM** — doc integrity issue.

4. **"Never push directly to main"** allows an exception for "doc-only changes that don't affect build (Planning/*.md, CLAUDE.md)." But CLAUDE.md is load-bearing (trigger table + always-on rules). Direct-push to CLAUDE.md can break every future wave's startup. **Severity: MEDIUM** — the exception is too broad.

**Optimization proposals:**
- **AA.** Generalize the "verify deploy targets" section: parameterize by project's declared deploy-target list (from stack-decisions.md or similar) rather than hardcoded Netlify+Railway. Add npm-registry/PyPI/registry-deploy template.
- **BB.** Add explicit `/ship` skill recommendation at the top of Stage 5: "If /ship skill is installed, prefer it over manual gh operations — reduces cost + standardizes PR body."
- **CC.** Narrow the direct-push exception to `Planning/*.md` only. Remove CLAUDE.md from the allowed-direct-push list — it's too load-bearing.

**Post-deploy state for Stage 5b hand-off:**
Package at 0.0.0 placeholder on npm registry (reserved, not functional). GitHub main has the 5 new files committed. No Netlify/Railway to verify. No live prod URL to smoke-test at Stage 5b.

### Stage 5b — Post-deploy QA
- **Status:** completed (near-total skip — spec hardcodes Railway/Netlify/web-routes, none of which apply to npm-package deploy)

**Files read:** `stage-5b-qa.md` ~1,500 tokens.

**Applicable work for Task 1:**
- Extract npm pack tarball, verify 5-file manifest (~500 tokens if actually run)
- Optional: `npm install ./tarball.tgz` in throwaway dir to confirm installability — skipped since 0.0.0 is placeholder, not functional

**What the spec asks (NOT applicable here):**
| Step | Applies to Task 1? | Why not |
|---|---|---|
| Railway uptime < 300s check | No | auto-claude has no Railway |
| Netlify deploy state=ready | No | auto-claude has no Netlify |
| Env var propagation check | No | Wave didn't change env vars |
| Smoke test touched routes | No | No web routes; npm package |
| `/qa` skill | No | Playwright browser testing |
| Regression check 200 on homepage/games/health | No | No web endpoints exist |

### Totals for Stage 5b
| Category | Tokens |
|---|---|
| Stage spec read | ~1,500 |
| Skip documentation + npm-package-specific notes | ~500 |
| **Stage 5b total (this simulation — npm-package case)** | **~2,000 tokens** |

**Realistic cost for an M-sized web-wave where code IS written:**

| Component | Tokens | Conditional? |
|---|---|---|
| Stage spec read | ~1,500 | always |
| Deploy-verify phase (Railway curl, Netlify deploy list, env var check) | ~3,000 | always |
| `/qa` skill invocation (preamble + user-journey-map read + 3-5 parallel Playwright testers + synthesis) | ~30-50K | almost always |
| Fast-fix cycle(s) — 1-2 typical per M-sized wave | ~10-30K | typical |
| Regression check (5-10 curl routes + auth flow) | ~5,000 | always |
| Monitor spawn via Spawn-and-Block (if target in-progress at entry) | ~8,000 | occasional |
| **Realistic M-sized web-wave Stage 5b** | **~60-80K (midpoint ~70K)** | |

The `/qa` skill is the biggest single driver (~30-50K). Fast-fixes compound when Playwright testers surface edge cases that trigger a second iteration. Stage 5b is a notable cost center on web waves — comparable to Stage 3 gate or Stage 1 reframing.

**Spec-coherence findings:**

1. **Stage 5b's entire check list is web-centric.** Railway health endpoints, Netlify deploy states, route smoke tests. For non-web projects (npm packages, CLI tools, libraries, docker images, docs sites that don't warrant uptime-style QA), the spec has no applicable work. **Severity: HIGH** — same source-project leakage as Stages 5, 0b, roadmap-refresh-ritual. Five stages now confirmed with hardcoded kvik/eldorado shape.

2. **`/qa` skill is Playwright-only.** No equivalent for package-installability QA, CLI binary smoke tests, or doc-site content validation. Consumers of non-web auto-claude (e.g., building CLIs or libraries) have no Stage 5b that fits their shape.

3. **Spec doesn't acknowledge the "nothing to QA on this wave" case.** Every stage should have either: applicable work, OR an explicit skip condition. Stage 5b has neither for non-web waves — agents must improvise.

**Optimization proposals:**
- **DD.** Add `project_type` branching to Stage 5b: web / npm-package / cli-binary / library / docs-site. Each branch has its own QA action set.
- **EE.** Create `/qa-package` skill (analog to `/qa`) that does npm-install + binary-smoke-test for non-web deploys. Not urgent but needed to close the coverage gap.
- **FF.** Add explicit "skip if no live surface to test" condition in top-matter.

### Stage 6 — Playwright swarm
- **Status:** SKIPPED in this wave (non-web task). Measured realistic cost for M-sized web wave as comparison baseline per founder request.

**For this wave (Task 1, npm package):** Stage 6 skips entirely. Plan declared skip reason = non-web. Cost: ~500 tokens to document the skip.

**Realistic cost for M-sized web wave with 4-tester Playwright swarm:**

Per-tester breakdown (1-2 flows per tester, 10-15 Playwright actions, 2-3 test cases with mandated screenshots):

| Component | Tokens per tester |
|---|---|
| Prereq reads (ui-comprehensive-tester-instructions 2.1K + testing-principles 1.2K + test-writing-principles full 10K + user-journey-map ~5K) | ~18K |
| Playwright actions: `browser_snapshot` (5K × 6-8 = 30-40K) + clicks/types/navigates (500 × 10-15 = 5-8K) + mandated `browser_take_screenshot` per test case (10K × 2-3 = 20-30K) | ~55-78K |
| Agent reasoning (content verification, network-tab scan, assertion logic) | ~8K |
| Tester report write | ~4K |
| **Per tester total** | **~85-108K (midpoint ~95K)** |

**4-tester swarm (parallel execution, additive token cost):** ~380K

**Cross-cutting costs:**
| Component | Tokens |
|---|---|
| Stage spec read | ~1,100 |
| security-waves.md (if wave touches auth/payments — typical for M) | ~1,800 |
| Orchestrator reading 4 reports + synthesis | ~15-20K |
| Fast-fix cycles (1-3 bugs typical × ~12K each) | ~15-35K |
| MONITOR spawn if prod-URL readiness uncertain | ~8K (conditional) |

### Totals for Stage 6
| Scenario | Tokens |
|---|---|
| This wave (npm, skip) | **~500** |
| **M-sized web wave (4 testers, 1-2 fast-fixes)** | **~420K (range ~350-500K)** |

**Stage 6 is the single most expensive stage in the entire wave loop.** For reference:
- Pre-wave A + B: ~200K combined (realistic)
- Stage 1 (reframing): ~80K
- Stage 3 (gate): ~95K
- Stage 5b (M-sized web): ~70K
- **Stage 6 (M-sized web): ~420K — equal to Stages 1 + 3 + 4 + 4b + 5 + 5b combined**

**Spec-coherence findings:**

1. **Stage 6 is fundamentally incompatible with non-web projects.** No alternative "test swarm" shape for CLIs, libraries, docker images, or APIs-without-UI. auto-claude, gstack, nanoGPT-style frameworks, Python libraries — all these would skip Stage 6 entirely. Sixth stage confirmed with hardcoded source-project assumption. **Severity: HIGH** — generalization would require adding `project_type`-branched test-swarm variants.

2. **Per-tester cost dominated by Playwright snapshot tokens.** Each `browser_snapshot` returns the full accessibility tree (~5-10K tokens). "Screenshot-as-proof for every test case" adds 10K each. A tester doing 15 actions burns 50-70K just on tool-call return values. Optimization: provide testers with `browser_snapshot --limit=<element>` pattern guidance (if the Playwright MCP supports element-scoped snapshots) to cap tokens-in.

3. **4-tester parallel default may be over-scoped for simple M-waves.** Some M-waves touch just 1-2 flows. Spec could allow "scale testers to flows" — 1 flow = 1 tester, not 4.

4. **README's "~175K worst-case per wave" claim is dramatically wrong.** Stage 6 alone exceeds this by 2-3x on M-sized web waves. README needs systematic revision based on realistic Playwright cost accounting.

**Optimization proposals:**
- **GG.** Scale tester count to flow count: 1-2 flows = 2 testers; 3-5 flows = 3-4 testers; 6+ flows = 5 testers. Default to fewer.
- **HH.** Element-scoped `browser_snapshot` when test only checks one region of the page. Reduces per-snapshot from ~5K to ~1K.
- **II.** Add a "minimal-proof" mode: single screenshot per flow instead of per test case. Reduces screenshot cost by 3-5x.
- **JJ.** Document `project_type` branching: web projects run Stage 6 as-is; non-web projects run alternative verification (package smoke install, CLI scenario sweep, library API exercise).
- **KK.** Revise README cost table: Stage 6 alone can be ~400K; full M-sized web wave realistically ~600-800K when all stages are counted with realistic agent/tool behavior.

### Stage 6b — Layout verification
- **Status:** SKIPPED in this wave (infra-only per skip condition). Measured realistic cost for M-sized web wave with frontend changes as comparison.

**For this wave (Task 1, npm package):** Skip condition "Infra-only wave: SKIP" applies. Plan explicitly non-UI. Cost: ~500 tokens.

**Realistic cost for M-sized web wave with frontend changes:**

Single `ui-comprehensive-tester` spawn dedicated to layout-drift verification:

| Component | Tokens |
|---|---|
| Stage spec read | ~1,100 |
| `ui-designer-instructions.md` (4.2K) | ~1,000 |
| `browser_navigate` to mockup (file://) + live URL | ~500 |
| `browser_take_screenshot` of both (~10K each) | ~20,000 |
| `browser_evaluate` with `getComputedStyle` for 8-15 key elements (~2K each) | ~20-30K |
| Comparison reasoning (drift classification: Critical/Major/Medium/Minor) | ~5-10K |
| Report write to `Planning/wave-N-test-reports/layout-verification.md` | ~3,000 |
| Orchestrator synthesis | ~3,000 |
| Fast-fix if Critical drift found (conditional) | ~0-15K |

### Totals for Stage 6b
| Scenario | Tokens |
|---|---|
| This wave (infra, skip) | **~500** |
| **M-sized web wave with frontend changes** | **~55-85K (midpoint ~70K)** |

**Spec-coherence findings:**

1. **Stage 6b depends on `design/*.html` mockups existing** — specifically "Load canonical mockup via `browser_navigate` to `file:///.../design/<page>.html`." For projects that don't use `/aidesigner` + HTML-mockup workflow (most web projects in the wild), Stage 6b has nothing to compare against. Spec says "Design source of truth: `design/`" but doesn't handle projects where that's Figma, Sketch, or mental model. **Severity: MEDIUM** — less universal than I'd expect for a core stage.

2. **Drift classification is subjective without quantitative thresholds.** Spec lists Critical/Major/Medium/Minor but doesn't define what separates them. A 2px padding difference — which bucket? 10% color luminance diff — which bucket? Two testers could classify the same drift differently. **Severity: LOW** — common problem across visual-design contexts.

3. **`getComputedStyle` element coverage is unconstrained.** Spec says "compare with browser_evaluate" but doesn't cap how many elements. A thorough tester might evaluate 50+ elements, costing 100K tokens; a light one evaluates 5, costing 10K. Ten-fold variance. Worth setting a default budget (e.g., "up to 15 elements per page, escalate if more needed").

**Optimization proposals:**
- **LL.** Define element-evaluation budget: up to 15 `getComputedStyle` calls per mockup-vs-live comparison. Above 15 requires justification.
- **MM.** Add quantitative drift thresholds: Critical = >20px position diff OR color luminance >15% off OR missing required element. Major = 10-20px OR 8-15% color OR wrong font size. Etc.
- **NN.** Non-`/aidesigner` projects need an alternative workflow: compare live against a reference screenshot stored in `design/snapshots/` instead of HTML mockups.

### Stage 7 — Reality check (Karen + Jenny)
- **Status:** completed (light-touch simulation — no real spawns since no shipped state to verify). Spec-coherence findings logged.

**Files read (prereqs — all cached from Stage 3):**
| File | Bytes | ≈ Tokens (marginal) |
|---|---|---|
| `stage-7-reality-check.md` | 800 | ~200 |
| `sub-agent-workflow.md` | 0 (cached) | 0 |
| `karen-instructions.md` | 0 (cached from Stage 3) | 0 |
| `Jenny-instructions.md` | 0 (cached from Stage 3) | 0 |
| **Subtotal (this tick, marginal)** | **~800** | **~200** |

**Light-touch simulation (no real spawns):**

Karen's verification on Task 1 drafted state:
- `packages/brain/` subtree doesn't exist (NO files written in simulation) → would BLOCK in real run ("claim: files exist; reality: they don't")
- If files HAD been written: `npm pack --dry-run` verification at Stage 5 would be the primary check; `getAssetPaths()` path resolution is static + trivially verifiable
- Additional: `@auto-claude` npm-scope reservation status (require network check)

Jenny's verification on Task 1 drafted state:
- Scope fence held per Stage 4 node-specialist output — no leak into Tasks 2-5
- Founder-bet pre-req still unfulfilled (FOUNDER-BETS.md blank) → APPROVE WITH NOTES
- Original founder ask ("NPX package") vs delivered scaffold: partial but correctly scoped as first atomic slice

Verdict both: APPROVE WITH NOTES for drafted state, BLOCK for empty state.

### Totals for Stage 7
| Scenario | Tokens |
|---|---|
| This wave (light-touch simulation, no real spawns) | **~15K** |
| This wave (realistic — actual Karen + Jenny re-spawn on drafted state, similar inputs to Stage 3) | **~60-80K** |
| **M-sized web wave (Karen + Jenny on real tester reports + deployed state)** | **~90K (range 80-110K)** |

For M-sized web wave breakdown:
- Per-reviewer inputs: 4 tester reports (~16K) + layout report (~3K) + plan (cached) + deployed-state checks via `gh pr view` / `curl prod-URL` (~5-10K)
- Per-reviewer reasoning + report write: ~25K
- **Per reviewer: ~45K. Two reviewers parallel: ~90K.**

**Spec-coherence findings:**

1. **Stage 7 is structurally identical to Stage 3** but reuses the same Karen + Jenny agent pair with different scope. Worth noting: cost-amortization should be real (instruction files cached) but tester-report read cost is new per wave. Overall ~90K is slightly less than Stage 3's ~95K because input corpus is known-small (tester reports) vs exploratory (repo state).

2. **"BOARD involvement if Karen/Jenny BLOCK" not documented in Stage 7 spec.** Under `full-autonomy` or `danger-builder`, a BLOCK verdict at Stage 7 is high-stakes — would naturally route to BOARD or ceo-agent. Current spec says "Any BLOCK findings addressed" without specifying *by whom*. In `founder-review` mode: founder. In `danger-builder` mode: ceo-agent (per mode spec). Should be cross-referenced. **Severity: LOW** — implicit behavior works but documentation gap.

3. **Tester-report reading cost scales with swarm size.** 4 testers = 16K read cost per reviewer = 32K combined. For waves running 5 testers (upper bound of Stage 6 swarm), that's 20K per reviewer = 40K combined. The cost compound is real — Stage 6 choice (more testers) has downstream Stage 7 cost implications not called out.

**Optimization proposals:**
- **OO.** Add BOARD/ceo-agent routing clause to Stage 7 BLOCK resolution (mode-aware)
- **PP.** Consider tester-report summarization before Stage 7 (so reviewers read a synthesized ~5K summary instead of 4×4K raw reports). Saves ~15-25K per Stage 7 but requires orchestrator pre-work (~5K). Net savings ~10-20K per web wave.

### Stage 7b — Triage
- **Status:** completed. This wave: trivial (no findings). Realistic M-sized cost measured.

**For this wave:** Nothing to triage. Stage 6 skipped (no testers ran). Stage 7 returned APPROVE WITH NOTES, but notes are pre-requisites (founder-bet unfilled, scope reservation unverified) rather than emergent bugs. Not classifiable findings per Stage 7b's framework.

**Files read (this wave):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-7b-triage.md` (partial — skip reading once trivial nature confirmed) | ~1,000 | ~250 |
| `triage-routing-table.md` (0 findings → no need to read) | 0 | 0 |
| **Subtotal** | **~1,000** | **~250** |

**Realistic cost for M-sized web wave:**

Typical M-wave Stage 7b input: 3-6 opportunistic findings surfaced across Stage 6 + Stage 7 promotions. Typical distribution:
- 0-1 (a) blocks-this-wave
- 1-2 (b) fast-follow
- 2-3 (c) next-wave
- 0-1 (d) backlog

Per-finding cost:

| Finding class | Work pattern | Tokens per finding |
|---|---|---|
| (a) blocks-this-wave | Spawn matched specialist → fix → verify → same-wave commit | ~15-25K |
| (b) fast-follow | Spawn specialist → fix → verify → fast-fix PR | ~10-20K |
| (c) next-wave | `/investigate` for root cause (Major/Critical) + TaskMaster add-task with mandatory metadata | ~5-10K |
| (d) backlog | TaskMaster add-task only (no investigate) | ~3K |

Cross-cutting:
- `triage-routing-table.md` read (first time in wave) | ~1K |
- Stage 7b spec read | ~1.3K |
- Orchestrator classification loop + triage table writes | ~3K |

### Totals for Stage 7b
| Scenario | Tokens |
|---|---|
| This wave (trivial — no findings) | **~2K** |
| **M-sized web wave (0 blocks, 2 fast-follow @ 15K, 2 next-wave @ 7K, 1 backlog @ 3K + cross-cutting)** | **~65K (range 50-85K)** |
| **Worst case (multiple blocks + `/investigate` chain exhaustion)** | **~100-130K** |

**Spec-coherence findings:**

1. **Stage 7b doesn't define what counts as a "finding" vs a "note."** Stage 7 reviewer output format includes APPROVE WITH NOTES — but notes may or may not be triaged. A reviewer noting "founder-bet pre-req unfulfilled" isn't a shipped-code bug, so not triage-able; but spec doesn't explicitly exclude notes. Agents could over-triage by trying to classify pre-requisites as findings. **Severity: LOW** — ambiguity rarely causes harm but wastes a few K when it does.

2. **`/investigate` chain-exhaustion branching is mode-aware** (covered in spec for founder-review / full-autonomy / danger-builder). Good coverage. No coherence issue here.

3. **Orchestrator-never-fixes rule** is load-bearing (violation is an anti-pattern per `triage-routing-table.md`). Spec enforces cleanly. Tokens spent routing are higher than orchestrator-direct-fixing would be, but this cost is intentional discipline.

4. **Stage 7b `/investigate` invocation on (c)/(d) findings is expensive** (~5-10K per run). For a wave with 4-5 next-wave items, that's 25-50K in pure investigation. No guidance on skipping investigate for low-severity (d) items — spec says "run /investigate for root-cause analysis on any Major/Critical items" but the cost implication isn't explicit.

**Optimization proposals:**
- **QQ.** Clarify: notes from Stage 7 reviewers are NOT automatic findings. Reviewer must explicitly categorize note-vs-finding before Stage 7b consumes it.
- **RR.** Add skip-investigate rule: for (d) backlog items and low-severity (c) items, skip `/investigate` — just create TaskMaster task with reviewer's rationale. Invoke `/investigate` only when next wave actually picks up the task. Saves ~5-15K per wave.

### Stage 8 — Closeout
- **Status:** completed. This wave: ~11K. Realistic M-sized web wave: ~15-25K (up to ~50K with /document-release).

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-8-closeout.md` | 3,773 | 945 |
| `housekeeping.md` (first read this wave) | 3,316 | 830 |
| **Subtotal** | **7,089** | **~1,775** |

**Step 1 TaskMaster sweep (this wave):**

| Sub-step | Work | Tokens |
|---|---|---|
| 1a Primary task | Task 1 → done + PR URL + commit SHA + LOC delta | ~500 |
| 1b Subtasks | None (task 1 has no subtasks) | 0 |
| 1c Same-wave fast-fixes | None from Stage 7b | 0 |
| 1d Auto-split / backlog siblings | 6 sibling rows from Pre-wave B pre-split — verify metadata intact | ~3,000 |
| 1e Triage rows (c)/(d) | None from Stage 7b | 0 |
| 1f Writeback ledger in closeout | Short table | ~500 |
| **Sweep subtotal** | | **~4,000** |

**Step 2 Doc updates (this wave):**

| Update | Work | Tokens |
|---|---|---|
| `user-journey-map.md` | Skip documented — no UI/routes touched | ~200 |
| `test-writing-principles.md` §14 | Skip — no new test patterns discovered | ~200 |
| Plan checklist housekeeping | Mark Stage 8 checkbox in wave plan | ~500 |
| `Planning/wave-<N>-closeout.md` write | Verdict SHIP-WITH-CONCERNS + plan-authoring defects (4 caught at Stage 3) + housekeeping notes + writeback ledger | ~4,500 |
| `/document-release` skill | N/A — scaffold wave, functional publish is Task 3 | 0 |
| **Doc subtotal** | | **~5,400** |

### Totals for Stage 8
| Category | Tokens |
|---|---|
| Prereq reads | ~1,775 |
| TaskMaster sweep | ~4,000 |
| Doc updates + closeout | ~5,400 |
| **Stage 8 this wave** | **~11,175 tokens** |
| **M-sized web wave (no /document-release)** | **~15-25K** |
| **M-sized web wave (/document-release fires)** | **~30-50K** |

**Spec-coherence findings:**

1. **Stage 8 Step 2 numbering is broken** — items are listed as `2. Update user-journey-map`, `3. Update test-writing-principles`, `4. Master plan housekeeping`, `4. Produce closeout` (duplicate 4), `5. Optionally run /document-release`. Has been this way since the v0.4.0 sweep-step addition landed in front of the pre-existing doc-update list. **Severity: LOW** — documentation quality only, no functional impact. Easy fix.

2. **"2. Doc updates"** section mixes mandatory (update user-journey-map, produce closeout) with conditional (test-writing-principles §14 — only if new patterns discovered) and optional (/document-release). No explicit skip criteria when tasks are pure-doc or infra-only. **Severity: LOW.**

3. **TaskMaster sweep is now the biggest step** in Stage 8 (was added in v0.4.0) but the spec section order still puts it as "1" with doc-updates as "2". Reasonable, but in terms of token cost for most waves, Step 1 typically exceeds Step 2 because it writes 3-8 TaskMaster rows with metadata.

4. **`/document-release` skill not cost-accounted.** Adding it to Stage 8 can 2x the stage's realistic cost. Same concern as plan-review skills at Stage 2 — skill invocations should come with expected-cost annotations.

**Optimization proposals:**
- **SS.** Renumber Stage 8 items 2/3/4/4/5 → 2/3/4/5/6 in Step 2 section
- **TT.** Add expected-cost annotation to `/document-release` invocation line (e.g., "~15-25K tokens; invoke for user-visible shipped behavior, skip for infra/scaffold waves")
- **UU.** Per-step skip criteria (user-journey-map: skip if no routes touched; test-writing-principles §14: skip if no new patterns; etc.)

**Closeout artifact content (this wave, describe-not-write):**
```
# Wave sim-001 closeout — Task 1: @auto-claude/brain npm package scaffold

Verdict: SHIP WITH CONCERNS
 - Founder-bet pre-requisite unfulfilled (FOUNDER-BETS.md still blank)
 - @auto-claude scope reservation unverified

Shipped fixes:
 - package.json / .npmignore / README.md / brain-source.stamp / index.js at repo root

Plan-authoring defects (plan v1 → v2):
 - Karen: npm files: field cannot reference outside package dir (resolved via root-level package)
 - Jenny: publishConfig access public missing (added to v2)
 - Jenny: LICENSE + engines missing (added)
 - Jenny: src/index.ts + tsconfig reintroduced build surface (removed in v2)

Triage table: (empty — no opportunistic findings)

Housekeeping applied:
 - Plan Stage 8 checkbox marked
 - user-journey-map.md: N/A
 - test-writing-principles §14: N/A

§TaskMaster sweep ledger:
  1  | @auto-claude/brain npm scaffold | in-progress → done | committed
  2  | Brain-tree packager            | pending → pending  | metadata intact
  3  | Bootstrap CLI                  | pending → pending  | metadata intact
  4  | Dual-mode sync tool            | pending → pending  | metadata intact
  5a | Migration docs                 | pending → pending  | metadata intact
  5b | kvik migration                 | pending → pending  | metadata intact
  5c | eldorado migration             | pending → pending  | metadata intact
```

### Stage 9 — Observations retro
- **Status:** completed (describe-not-invoke simulation). Two sequential sub-agents: knowledge-synthesizer writes, technical-writer compacts.

**Files read (prereqs):**
| File | Bytes | ≈ Tokens |
|---|---|---|
| `stage-9-observations.md` | 1,300 | ~325 |
| `sub-agent-workflow.md` | 0 (cached) | 0 |
| `knowledge-synthesizer-instructions.md` | ~3,500 | ~875 |
| `technical-writer-instructions.md` | ~1,700 | ~425 |
| **Subtotal** | **~6,500** | **~1,625** |

**Agents used in this wave (7 total) requiring observation-file updates:**
1. competitive-analyst (Pre-wave A)
2. problem-framer (Stage 1)
3. ceo-reviewer (Stage 1)
4. Karen (Stage 3)
5. Jenny (Stage 3)
6. node-specialist (Stage 4)
7. security-engineer (Stage 4)

**knowledge-synthesizer (describe-not-invoke):**
| Component | Tokens |
|---|---|
| Reads wave artifacts (closeout.md + selected reports) | ~10K |
| Writing 7 observation updates (~400 tokens each) | ~2.8K |
| **Subtotal** | **~12.8K** |

**technical-writer (describe-not-invoke):**
| Component | Tokens |
|---|---|
| Reads 7 updated observation files (small for auto-claude) | ~5K |
| Compaction reasoning + rolling-window trim | ~5K |
| Writing trimmed output | ~5-10K |
| **Subtotal** | **~15-20K** |

### Totals for Stage 9
| Scenario | Tokens |
|---|---|
| This wave (simulated describe-not-invoke) | **~5-8K** |
| This wave (realistic full execution) | **~30-40K** |
| **M-sized web wave (10-12 agents used, richer artifacts)** | **~50K (range 40-60K)** |

**Spec-coherence findings:**

1. **Sequential sub-agent dependency is explicit but cost-unannotated.** Stage 9 spawns knowledge-synthesizer THEN technical-writer. Not parallelizable — technical-writer reads knowledge-synthesizer's output. Sequential-dependency stages are a category the spec doesn't explicitly call out (most other multi-agent stages are parallel). **Severity: LOW** — behavior is correct; just under-documented pattern.

2. **"Reads wave artifacts" scope is undefined.** Stage 9 spec says knowledge-synthesizer "reads wave artifacts: plan, implementer reports, gate reviews, test reports, reality checks." For large waves (10+ artifact files) that's a significant input cost not separately bounded. No guidance on summarization or selective-reading to cap cost.

3. **rolling-window compaction threshold** (5 waves) is hardcoded in technical-writer's work. Larger projects may want different thresholds (e.g., a long-running project with many waves might want 10-wave windows; a short project might want 3).

4. **`/learn` skill** is optional but its cost isn't annotated (~10-15K estimated). Same pattern as other optional skills at Stages 2, 4b, 8.

**Optimization proposals:**
- **VV.** Annotate sequential-vs-parallel dependency explicitly in Stage 9 spec (and any other sequential stages — audit needed).
- **WW.** Define input-scope cap for knowledge-synthesizer: "read closeout.md first; selectively read reports only if closeout is insufficient." Could cut input cost ~50%.
- **XX.** Parametrize rolling-window threshold by project config (e.g., via `roadmap-lifecycle.md` or a new `retro-config.md`).

### Stage 10 — Instruction distillation
- **Status:** completed (describe-not-invoke). Second sequential-dual-agent stage (karen → technical-writer).

**Files read (prereqs — all cached from earlier stages):**
| File | Source | Tokens (marginal) |
|---|---|---|
| `stage-10-distillation.md` | new | ~250 |
| sub-agent-workflow / karen-instructions / technical-writer-instructions | cached | 0 |

**karen conversion step (describe-not-invoke):**

karen's task: read this wave's observations + current instructions for each agent; filter high-signal patterns; write promotions capped at 3 per agent per wave. Explicit rule: "Zero promotions is acceptable."

For this wave:
- 7 agents had observations (shallow, simulation-described rather than real behavior)
- Most observation content is structural ("agent spawned X times, returned verdict Y") rather than behavioral patterns
- Expected promotions: **0** — shallow observations rarely produce load-bearing directives

| Component | Tokens |
|---|---|
| Reading 7 observation files + 7 instruction files (karen samples selectively) | ~15-25K |
| Conversion reasoning + any writes | ~3-5K |
| **karen subtotal** | **~18-30K** |

**technical-writer compaction step:**

Applies to files karen modified. With 0 promotions this wave, technical-writer has minimal work — just verify no files drifted.

| Component | Tokens |
|---|---|
| Reads files karen touched (near-empty set) | ~2-5K |
| Compaction pass (aggressive: war stories out, prose→bullet, filler compression) | ~3-5K per modified file |
| Writes compacted output | ~3-5K per file |
| **technical-writer subtotal** | **~5-15K** (depends on karen's promotion count) |

**Orchestrator step 3:** diff review + commit → ~2K.

### Totals for Stage 10
| Scenario | Tokens |
|---|---|
| This wave (simulated describe-not-invoke, 0 promotions) | **~8-12K** |
| This wave (realistic, 0-1 promotion) | **~25-35K** |
| **M-sized web wave (10-12 agents, 1-3 promotions typical)** | **~30-45K (midpoint ~37K)** |

**Spec-coherence findings:**

1. **Stage 10 is the SECOND sequential-dual-agent stage** (after Stage 9). Both follow Writer → Compactor pattern. The pattern is implicit, not documented. **Severity: LOW** — behavior is consistent; worth extracting as a named design pattern (maybe "Writer-Compactor pipeline") for future stages to reference.

2. **Cap of 3 promotions per agent per wave** is sensible but unexplained. Why 3? Stage 10's purpose is to prevent instruction-file bloat across many waves; 3/agent × ~20 agents × N waves compounds fast. Explicit rationale would help consumers tune the cap.

3. **"Zero promotions is acceptable"** is the right default but costs the same as promotions (karen still reads everything to decide). No optimization path for "nothing changed this wave, skip entirely." The knowledge-synthesizer's Stage 9 output could flag "no novel patterns" → Stage 10 fast-skip.

4. **Orchestrator diff review at Step 3** is stated but not scoped. For 0-promotion waves, the diff is empty → review is trivial (~2K). For 3-promotion waves across multiple agents, review can be 10K+. Should be cost-annotated similar to other optional actions.

**Optimization proposals:**
- **YY.** Document the "Writer-Compactor" sequential pattern in sub-agent-workflow.md so future stage authors have a reference.
- **ZZ.** Add knowledge-synthesizer output field: `promotable_patterns_count`. If 0, Stage 10 skips (saves ~20-30K per no-signal wave).
- **AAA.** Tune the cap: instead of 3-per-agent fixed, consider "promote high-confidence, skip the rest" with confidence threshold. This prevents both bloat AND rubber-stamp promotion.

### Stage 11 — Next task
- **Status:** completed. Next-wave scope identified as Task 2. `planned`-milestone health-check flagged refresh-ritual proposal.

**Files read:** `stage-11-next.md` (first ~60 lines read) → ~1,500 tokens.

**Execution:**
1. Verify Stage 8 sweep ledger: ✓ (hypothetical — would verify in real run)
2. `npx task-master next` → returns Task 2 (Brain-tree packager for release workflow)
3. daily-checkpoint auto-fire: not needed (actionable task available)
4. Roadmap health check: 1 `planned` milestone (M1), below threshold 3 → append `proposal:refresh-ritual` to `Planning/pending.md` for next daily-checkpoint surfacing
5. STATUS handling: N/A (founder-review mode for simulation)

**Next wave scope locked:** Task 2 (Brain-tree packager).

### Totals for Stage 11
| Category | Tokens |
|---|---|
| Stage spec read | ~1,500 |
| TaskMaster next + roadmap health check + ledger verify | ~2,500 |
| `proposal:refresh-ritual` queue entry | ~500 |
| **Stage 11 total** | **~4,500 tokens** |

---

## Simulation Summary — final

### Cumulative by stage (orchestrator vs sub-agent split)

**This wave (Task 1 — npm package scaffold, shallow simulation):**

| Phase | Orchestrator | Sub-agents | Combined |
|---|---|---|---|
| Pre-wave A | 27K | 14.6K | 41.6K |
| Pre-wave B | 10K | 0 | 10K |
| Stage 0 | 1.5K | 0 | 1.5K |
| Stage 0b | 2.8K | 0 | 2.8K |
| Stage 1 | 6.3K | 74.1K | 80.4K |
| Stage 2 | 17K | 0 | 17K |
| Stage 3 | 5.5K | 89.7K | 95.2K |
| Stage 3b | 1.1K | 0 | 1.1K |
| Stage 4 | 5.9K | 39.1K | 45K |
| Stage 4b (/review fires) | 45K | 0 | 45K |
| Stage 5 | 3K | 0 | 3K |
| Stage 5b | 2K | 0 | 2K |
| Stage 6 | 0.5K | 0 | 0.5K |
| Stage 6b | 0.5K | 0 | 0.5K |
| Stage 7 | 15K | 0 | 15K |
| Stage 7b | 2K | 0 | 2K |
| Stage 8 | 11K | 0 | 11K |
| Stage 9 | 7K | 0 | 7K |
| Stage 10 | 10K | 0 | 10K |
| Stage 11 | 4.5K | 0 | 4.5K |
| **TOTAL (this wave simulated)** | **~177K** | **~217K** | **~395K** |

**M-sized realistic web wave (fully-executed — Task 1 analog that actually touches UI + Railway + Netlify):**

| Phase | Orchestrator | Sub-agents | Combined |
|---|---|---|---|
| Pre-wave A (incl. real /plan-ceo-review + Playwright competitive sweep) | 80K | 120K | 200K |
| Pre-wave B (incl. /plan-ceo-review if run sequential) | 55K | 15K | 70K |
| Stage 0 | 1.5K | 0 | 1.5K |
| Stage 0b (if Tier 3 fires) | 15K | 30K | 45K |
| Stage 1 | 8K | 74K | 82K |
| Stage 2 (both plan-review skills invoked) | 100K | 0 | 100K |
| Stage 3 (Karen + Jenny rigorous) | 6K | 89K | 95K |
| Stage 3b (if UI gap exists — Dx loop) | 10K | 50K | 60K |
| Stage 4 (2-3 implementer specialists + /simplify) | 15K | 55K | 70K |
| Stage 4b (/review fires) | 45K | 0 | 45K |
| Stage 5 (/ship + monitor) | 30K | 0 | 30K |
| Stage 5b (/qa against live — skill runs in orchestrator) | 60K | 10K | 70K |
| Stage 6 (4-tester Playwright swarm) | 30K | 390K | 420K |
| Stage 6b (single-tester layout verify) | 7K | 65K | 72K |
| Stage 7 (Karen + Jenny reality check) | 2K | 90K | 92K |
| Stage 7b (/investigate + fast-fix specialists) | 40K | 25K | 65K |
| Stage 8 (/document-release fires) | 40K | 0 | 40K |
| Stage 9 (knowledge-synthesizer + technical-writer) | 2K | 35K | 37K |
| Stage 10 (karen + technical-writer) | 3K | 35K | 38K |
| Stage 11 | 4.5K | 0 | 4.5K |
| **TOTAL (M-sized web wave realistic)** | **~554K** | **~1,083K** | **~1,637K (~1.6M)** |

### What this means for your context-window planning

**Orchestrator context (main session):**
- Opus 4.7 extended (1M): fits comfortably with ~2x headroom
- Opus 4.7 default (200K): **does NOT fit** a realistic M-sized web wave without aggressive HANDOFF/compaction cycles. Would need ~3-4 handoffs mid-wave (every time crossing 75%)
- Sonnet (200K): same situation — would require frequent handoffs

**Sub-agent context (each fresh spawn):**
- Each sub-agent spawn gets its own ~200K (standard). Nothing in the realistic M-sized path has a single sub-agent hitting >60K (Stage 6 testers at ~95K each max). Comfortable fit.
- Exception: sub-agents doing very deep tool use (Karen's 55K at Stage 3 was mostly tool-output tokens). Still under 200K but worth knowing.

**Net implication:** orchestrator context is the binding constraint, not sub-agent context. Optimizing the wave-loop for cost means reducing what the orchestrator holds, not what sub-agents spawn.

### Fattest stages (ranked by combined cost, M-sized web wave)

| Rank | Stage | Combined cost | Orch / Sub split | Why so expensive |
|---|---|---|---|---|
| 1 | **Stage 6** Playwright swarm | ~420K | 30/390K | 4 testers × Playwright snapshots + screenshots-as-proof; single biggest stage in the whole loop |
| 2 | **Pre-wave A** roadmap refresh | ~200K | 80/120K | 3 Playwright testers for competitive sweep + /plan-ceo-review skill |
| 3 | **Stage 2** plan authoring | ~100K | 100/0 | Two plan-review skills (eng + devex) run as orchestrator skills |
| 4 | **Stage 3** Karen + Jenny gate | ~95K | 6/89K | Two rigorous reviewers with deep repo verification |
| 5 | **Stage 7** Karen + Jenny reality check | ~92K | 2/90K | Structurally identical to Stage 3; fresh spawn + tester report reads |
| 6 | **Stage 1** problem-framer + ceo-reviewer | ~82K | 8/74K | Two reviewers with tool use for analysis |
| 7 | **Stage 5b** /qa post-deploy | ~70K | 60/10K | /qa skill spawns Playwright testers + fast-fix cycle |
| 8 | **Stage 6b** layout verify | ~72K | 7/65K | Single tester doing getComputedStyle comparisons across mockup + live |
| 9 | **Pre-wave B** backlog planning | ~70K | 55/15K | Second /plan-ceo-review invocation in sequential A→B |
| 10 | **Stage 4** execute | ~70K | 15/55K | Multiple implementer specialists in parallel |

Top 3 stages alone = **~720K** (~44% of wave cost). Optimization focus.

### Systemic spec-coherence findings

**Six stages with hardcoded kvik/eldorado marketplace/web assumptions:**
1. roadmap-refresh-ritual (Playwright swarm mandate, "gaming marketplace sector" scope)
2. backlog-planning (redundant sequential /plan-ceo-review invocation)
3. Stage 0b (Playwright-browsing live competitors)
4. Stage 4b (hardcoded `pnpm` commands)
5. Stage 5 (Railway + Netlify + GitHub three-target verify)
6. Stage 5b (web route smoke, /qa Playwright-only)
7. Stage 6 (4-tester Playwright swarm, no alternative for non-web)
8. Stage 6b (aidesigner HTML-mockup dependency)

**Systemic spec-doc issues:**
- README's "~175K worst-case per wave" claim off by **~10x** for M-sized web waves
- Several stages have skip conditions buried under prereqs (0b, 3b) — tempting over-reading
- Missing instruction files: `trend-analyst-instructions.md` referenced but doesn't exist
- Stale dangling reference: CLAUDE.md:64 still points at deleted `notifications/resend.md` (v0.9.0 rename leftover)
- Stage 8 Step 2 numbering duplicate "4"

### Optimization proposals catalog (from simulation)

| # | Optimization | Est. savings per wave |
|---|---|---|
| A/B/C/D/E (from A) | Create trend-analyst-instructions; project-type Step 1a; /plan-ceo-review reuse; cost-aware invocation | ~30-50K |
| F/G/H (from B) | Reuse competitive sweep between A→B; reuse /plan-ceo-review output | ~30-60K |
| I (0b) | Fast-path skip detection in top-matter | ~10K for skippable waves |
| J/K/L (Stage 1) | Revise README cost claims; "light vs deep" reviewer mode; tool-use guidance | cost awareness only |
| M/N/O (Stage 2) | Skill-invocation cost table; standardize reframing output schema; required "solution class" plan field | cost awareness + clarity |
| P/Q/R (Stage 3) | Formalize APPROVE-WITH-CONCERNS; --quick-gate mode; reframing-disclosure Jenny subroutine | ~50-60K per S-sized wave |
| S/T/U (Stage 3b) | Reorder spec (skip conditions first); required design_gap_flag field; permanent-skip by project-type | ~10K per non-UI wave |
| V/W/X (Stage 4) | Document agent-system-card fallback; plan-revision protocol; fix CLAUDE.md:64 dangling ref | clarity + BUG FIX |
| Y/Z (Stage 4b) | Parametrize package-manager commands; pure-doc skip condition | ~5K per doc wave |
| AA/BB/CC (Stage 5) | Generalize deploy targets by project type; recommend /ship skill; narrow direct-push exception | ~10-20K |
| DD/EE/FF (Stage 5b) | project_type branching; /qa-package skill; skip-if-no-live-surface | ~40K for non-web |
| GG/HH/II/JJ/KK (Stage 6) | Scale testers to flow count; element-scoped snapshots; minimal-proof mode; project_type alternatives; revise README cost table | **~100-200K per M-sized web wave** |
| LL/MM/NN (Stage 6b) | Element-evaluation budget; quantitative drift thresholds; alternative-to-aidesigner | ~20-30K |
| OO/PP (Stage 7) | Mode-aware BLOCK routing; tester-report summarization before reviewers | ~15-25K |
| QQ/RR (Stage 7b) | Clarify notes-vs-findings; skip-investigate on low-severity (c)/(d) | ~15-25K |
| SS/TT/UU (Stage 8) | Fix Step 2 numbering; annotate /document-release cost; per-step skip criteria | clarity + small |
| VV/WW/XX (Stage 9) | Document Writer-Compactor pattern; cap knowledge-synthesizer inputs; project-tunable rolling window | ~10-15K per wave |
| YY/ZZ/AAA (Stage 10) | Document Writer-Compactor pattern; `promotable_patterns_count` field; confidence-based cap | ~20-30K per no-signal wave |

**Total optimization potential per M-sized web wave: ~300-450K** (~20-30% reduction from ~1.6M to ~1.1-1.3M).

### Spec-coherence patterns worth naming

1. **Source-project assumption leakage** — 6+ stages have kvik/eldorado marketplace shape baked in. Needs systematic project-type branching.
2. **Skill-cost under-annotation** — /plan-ceo-review, /qa, /review, /ship, /document-release all fire at multiple stages; none have cost-range annotations in the specs that invoke them. Skill-invocation cost can 2x a stage's total.
3. **Writer-Compactor pipeline** (Stages 9 & 10) — sequential sub-agent pattern worth extracting as named pattern in sub-agent-workflow.md.
4. **Missing instruction files** — trend-analyst, node-specialist both referenced but no Sub-agent Instructions/ file. Behavior is implicit (use global system card) but undocumented.
5. **Skip-condition ordering** — several conditional stages (0b, 3b) put skip conditions below prereqs, tempting over-reading.

### Top 3 highest-impact optimizations

1. **Stage 6 testers scale-to-flows + minimal-proof mode.** Could cut Stage 6 from ~420K to ~150-200K on typical M-wave. Biggest single lever.
2. **/plan-ceo-review reuse across Pre-wave A + B.** Simple doc addition; saves ~40-60K per wave sequence.
3. **project_type gating for source-project-assumption stages.** Generalizes 6+ stages from "kvik-specific" to "project-agnostic," makes auto-claude actually agent-agnostic as claimed.

### Final verdict

Simulation achieved all three goals:
- **(a) Validate README cost claims:** invalidated — claims are 5-10x too low under realistic agent+tool behavior
- **(b) Find fattest stages:** Stage 6 (~420K), Pre-wave A (~200K), Stage 2 (~100K)
- **(c) Spec-coherence check:** 30+ findings logged, including 1 real production bug (CLAUDE.md:64 dangling ref), 1 missing instruction file, and a systemic source-project-assumption pattern across 6-8 stages

**Next steps (post-simulation):**
- Fix CLAUDE.md:64 dangling `notifications/resend.md` reference (real bug)
- Decide on project_type gating architecture before the top-3 optimizations can land
- Revise README cost claims with realistic numbers

---

## Summary (fills in at Stage 11)

### Totals
- **Total tokens in:** _tbd_
- **Total tokens out:** _tbd_
- **Total per-wave cost:** _tbd_
- **README claim:** "~75K tokens typical, ~175K worst case"
- **Actual vs claim:** _tbd_

### Fattest stages (top 3)
_tbd_

### Skipped stages
_tbd_

### Spec-coherence observations
_tbd_

### Proposed optimizations
_tbd_
