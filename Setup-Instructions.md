# Setup Instructions — Recreate the Product-Loop Operating System

**Audience:** another Claude instance (Claude Code or equivalent) executing a full setup on a new machine or new project.

**Goal:** produce a project that runs the 17-stage wave loop with dual-document sub-agents, the two-reviewer gate, TaskMaster-backed backlog, and the full skill/MCP stack described in `How-to-Build-Product-Loops.md`. Outcome at completion: you can pick up a task from the backlog and run Stage 0 → Stage 11 without any missing infrastructure.

**Time:** 60–90 minutes on first run. Faster on reruns because MCPs and plugins persist across projects.

**Mindset:** this file is imperative. Do each step in order. Verify before proceeding. Do NOT batch-skip steps even when they seem redundant — every step exists because its absence caused a specific failure in prior setups.

Companion reading: `How-to-Build-Product-Loops.md` (the conceptual guide) sits in the same folder. Consult it for rationale; this file is the *runbook*.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Phase 1 — Claude Code install + auth](#2-phase-1--claude-code-install--auth)
3. [Phase 2 — Supporting CLIs](#3-phase-2--supporting-clis)
4. [Phase 3 — MCP servers](#4-phase-3--mcp-servers)
5. [Phase 4 — Skills and slash commands](#5-phase-4--skills-and-slash-commands)
6. [Phase 5 — Project folder tree](#6-phase-5--project-folder-tree)
7. [Phase 6 — `CLAUDE.md` (the orchestrator)](#7-phase-6--claudemd-the-orchestrator)
8. [Phase 7 — `command-center/` scaffolding](#8-phase-7--command-center-scaffolding)
9. [Phase 8 — Sub-agent roster](#9-phase-8--sub-agent-roster)
10. [Phase 9 — TaskMaster backlog init](#10-phase-9--taskmaster-backlog-init)
11. [Phase 10 — Working dir + gitignore](#11-phase-10--working-dir--gitignore)
12. [Phase 11 — Smoke test (first wave)](#12-phase-11--smoke-test-first-wave)
13. [Phase 12 — Ongoing care](#13-phase-12--ongoing-care)
14. [Troubleshooting](#14-troubleshooting)
15. [Appendix — File-content library](#15-appendix--file-content-library)

---

## 1. Prerequisites

Verify all of these before starting. Abort and fix any failure; do not proceed with gaps.

| Requirement | Check command | Expected |
|---|---|---|
| macOS or Linux | `uname` | `Darwin` or `Linux` |
| Node.js ≥18 | `node --version` | v18.x.x+ |
| npm ≥9 | `npm --version` | 9.x.x+ |
| git | `git --version` | any recent |
| Homebrew (macOS) | `brew --version` | any |
| Anthropic API key | `echo $ANTHROPIC_API_KEY` | non-empty |
| Google Gemini API key | `echo $GEMINI_API_KEY` | non-empty (needed for cross-model gate) |
| GitHub PAT or `gh` login | `gh auth status` | logged in |

If any of the above is missing: STOP. Install or configure, then re-run the check. Do not attempt to proceed without prerequisites.

Also decide NOW:

- Project name: referred to below as `<PROJECT>`
- Project root path: referred to below as `<ROOT>` (e.g. `/Users/<user>/<PROJECT>`)
- Primary deploy target: Railway / Vercel / Fly.io / other (determines which deploy CLI to install)

---

## 2. Phase 1 — Claude Code install + auth

### 2.1 Install

```bash
npm install -g @anthropic-ai/claude-code
```

### 2.2 Verify

```bash
claude --version
```

Expected: a semver. If missing → fix PATH, re-install.

### 2.3 First-run auth

```bash
cd "<ROOT>"
claude
```

Follow the browser auth flow. After auth succeeds, exit with `/exit`.

### 2.4 Project config directory

```bash
mkdir -p "<ROOT>/.claude"
```

This folder will hold project-local skill/command definitions later.

---

## 3. Phase 2 — Supporting CLIs

Install these in order. Each is required at a specific stage of the wave loop.

### 3.1 GitHub CLI (`gh`) — required for PRs, branch mgmt

```bash
brew install gh           # macOS
# OR: see https://cli.github.com for Linux
gh auth login             # follow prompts; pick HTTPS, web auth
gh auth status            # must show: Logged in
```

### 3.2 Gemini CLI — required for Stage 3 cross-model adversarial gate

```bash
npm install -g @google/gemini-cli
gemini --version
# Then set env: export GEMINI_API_KEY=...
```

Verify with a probe:

```bash
echo "Respond with OK" | gemini -p -
```

Expected: `OK` or similar. If this fails, Stage 3 cross-model gate cannot run and you must use fallback path (documented in `stage-3-gate.md`).

### 3.3 Deploy CLI (pick one based on your target)

Railway:
```bash
npm install -g @railway/cli
railway login
```

Vercel:
```bash
npm install -g vercel
vercel login
```

Fly.io:
```bash
brew install flyctl
flyctl auth login
```

### 3.4 Playwright — required for Stage 6 test swarm

Will be installed per-project at Phase 11. For now, just confirm it runs:

```bash
npx playwright --version
```

### 3.5 openssl — required for secret generation (Rule #10 of sub-agent-workflow)

Pre-installed on macOS and most Linux. Verify:

```bash
openssl rand -base64 32
```

Must emit 44 characters of base64.

---

## 4. Phase 3 — MCP servers

Claude Code's MCP servers wire in external tools. Install via `claude mcp add`. Verify each with `/mcp` inside `claude`.

Install these **globally** (not per-project) so they persist:

### 4.1 TaskMaster AI — canonical backlog

```bash
claude mcp add task-master-ai \
  --command "npx" \
  --args "-y,--package=task-master-ai,task-master-ai" \
  --env "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY"
```

Verify: inside `claude`, run `/mcp` → `task-master-ai` should be listed as `connected`.

### 4.2 Gmail

```bash
claude mcp add gmail \
  --command "npx" \
  --args "-y,@gongrzhe/server-gmail-autoauth-mcp"
```

First use triggers an OAuth flow.

### 4.3 Google Calendar

```bash
claude mcp add gcal \
  --command "npx" \
  --args "-y,@cocal/google-calendar-mcp"
```

### 4.4 Notion

```bash
claude mcp add notion \
  --command "npx" \
  --args "-y,@notionhq/notion-mcp-server" \
  --env "NOTION_TOKEN=<integration-token>"
```

Prereq: create a Notion integration at https://www.notion.so/my-integrations, copy the secret token, grant it access to the pages you want.

### 4.5 Figma Dev Mode (for UI-heavy projects)

```bash
claude mcp add figma \
  --command "npx" \
  --args "-y,figma-developer-mcp" \
  --env "FIGMA_API_KEY=<token>"
```

Skip if your project has no Figma surface.

### 4.6 Desktop Commander — file + shell access on laptop

```bash
claude mcp add desktop-commander \
  --command "npx" \
  --args "-y,@wonderwhy-er/desktop-commander"
```

### 4.7 Chrome control — for live-site testing at Stages 5b/6/7

Install the "Claude in Chrome" extension from the Chrome Web Store. Follow its in-extension instructions to connect to Claude Code. Then verify inside `claude`:

```
/mcp
```

Look for `Claude_in_Chrome` or `claude-in-chrome` listed as connected.

### 4.8 MCP registry + plugin registry (for ongoing discovery)

These are usually pre-installed with Claude Code. Verify via `/mcp`:

- `mcp-registry` — present
- `plugins` — present

If missing, reinstall Claude Code.

### 4.9 Scheduled tasks (for periodic skills like `/retro`)

```bash
claude mcp add scheduled-tasks \
  --command "npx" \
  --args "-y,@anthropic/scheduled-tasks-mcp"
```

### 4.10 Verification

Inside `claude`, run `/mcp`. Every server above must show `connected`. Fix any `failed` or `disconnected` before proceeding.

---

## 5. Phase 4 — Skills and slash commands

Skills come from two sources:

1. **Anthropic core skills plugin** — installed via the plugin marketplace.
2. **Custom slash commands** — project-local markdown files under `.claude/commands/`.

### 5.1 Install core skills plugin

Inside `claude`:

```
/plugin install anthropic-skills
```

Verify via `/plugin list`. You should see: `docx`, `xlsx`, `pptx`, `pdf`, `pdf-viewer`, `algorithmic-art`, `web-artifacts-builder`, `theme-factory`, `consolidate-memory`, `schedule`, `skill-creator`.

### 5.2 Create project-local slash commands

Create `.claude/commands/` and populate with one `.md` file per slash command. Each file is a prompt the command expands to when invoked.

```bash
mkdir -p "<ROOT>/.claude/commands"
```

Minimum set to create (files, exact names):

| File | Slash command | Purpose |
|---|---|---|
| `.claude/commands/careful.md` | `/careful` | Warns before destructive commands |
| `.claude/commands/simplify.md` | `/simplify` | Reduce complexity on touched files |
| `.claude/commands/review.md` | `/review` | Contract-mismatch + null-access review |
| `.claude/commands/qa.md` | `/qa` | Headless-browser smoke test |
| `.claude/commands/plan-eng-review.md` | `/plan-eng-review` | Engineering plan review |
| `.claude/commands/plan-design-review.md` | `/plan-design-review` | Design plan review (UI waves) |
| `.claude/commands/plan-devex-review.md` | `/plan-devex-review` | DX review (API/CLI/SDK waves) |
| `.claude/commands/plan-ceo-review.md` | `/plan-ceo-review` | Strategic / scope review |
| `.claude/commands/autoplan.md` | `/autoplan` | Runs CEO + eng + design + devex sequentially |
| `.claude/commands/cso.md` | `/cso` | OWASP + STRIDE security review |
| `.claude/commands/design-review.md` | `/design-review` | Live-site visual consistency check |
| `.claude/commands/health.md` | `/health` | typecheck + lint + tests + dead-code score |
| `.claude/commands/ship.md` | `/ship` | PR workflow: tests, version bump, CHANGELOG |
| `.claude/commands/land-and-deploy.md` | `/land-and-deploy` | Waits for CI + verifies prod canary |
| `.claude/commands/investigate.md` | `/investigate` | Systematic root-cause (Iron Law) |
| `.claude/commands/document-release.md` | `/document-release` | Post-ship doc sync |
| `.claude/commands/learn.md` | `/learn` | Persist project learnings cross-session |
| `.claude/commands/retro.md` | `/retro` | Engineering retrospective → `dev-principles.md` |

Starter contents for each: see Appendix §15.3.

### 5.3 Verify commands are registered

Inside `claude`, type `/` and scroll. Every command above must appear in the completion list. If any is missing, re-check file name and location.

---

## 6. Phase 5 — Project folder tree

Create the full tree in one go:

```bash
cd "<ROOT>"

mkdir -p .claude/commands
mkdir -p command-center/rules/build-iterations/stages
mkdir -p "command-center/Sub-agent Instructions"
mkdir -p "command-center/Sub-agent Observations"
mkdir -p command-center/SDK-Docs
mkdir -p working/archive
mkdir -p src
touch CLAUDE.md
touch README.md
touch CHANGELOG.md
touch .gitignore
```

Verify the tree:

```bash
tree -L 3 -I node_modules
```

Must match this exact shape:

```
<ROOT>/
├── .claude/
│   └── commands/
├── CHANGELOG.md
├── CLAUDE.md
├── README.md
├── command-center/
│   ├── SDK-Docs/
│   ├── Sub-agent Instructions/
│   ├── Sub-agent Observations/
│   └── rules/
│       └── build-iterations/
│           └── stages/
├── src/
└── working/
    └── archive/
```

---

## 7. Phase 6 — `CLAUDE.md` (the orchestrator)

Write `<ROOT>/CLAUDE.md` with exactly the content in Appendix §15.1.

This file is the root orchestrator — the ONLY file Claude Code reads unprompted on every session. It contains:

- The trigger table (JIT file loads)
- The always-on invariants
- The 17-stage list (summary form; full stages live under `rules/build-iterations/stages/`)
- Pointers into `command-center/`

After writing, verify:

```bash
wc -l CLAUDE.md
```

Expected: 100–250 lines. If over 300, you've bloated it — move detail into topic-scoped rule files and keep CLAUDE.md as a dispatcher.

---

## 8. Phase 7 — `command-center/` scaffolding

Create every file below with starter content. Use the templates from the companion guide (`How-to-Build-Product-Loops.md` §18 Appendix) unless explicitly overridden here. For the minimum-viable starting point, Appendix §15.2 of THIS file has condensed skeletons.

### 8.1 README and rules index

Create `command-center/README.md` from Appendix §15.2.A.

### 8.2 Wave-loop dispatcher

Create `command-center/rules/build-iterations/wave-loop.md` from Appendix §15.2.B. This enumerates the 17 stages and is read at Stage 0 of every wave.

### 8.3 Per-stage files

Create one file per stage, named `stage-<N>-<slug>.md`, under `command-center/rules/build-iterations/stages/`. Minimum required files:

- `stage-0-prior-work-query.md`
- `stage-0b-product-decisions.md`
- `stage-1-problem-reframing.md` ← contains the antipatterns catalog (10 entries)
- `stage-2-plan.md`
- `stage-3-gate.md` ← the mandatory two-reviewer gate + cross-model adversarial
- `stage-4-execute.md`
- `stage-4b-post-build.md`
- `stage-5-deploy.md`
- `stage-5b-post-deploy-qa.md`
- `stage-6-test-swarm.md`
- `stage-6b-layout-verification.md`
- `stage-7-reality-check.md`
- `stage-7b-triage.md`
- `stage-8-closeout.md`
- `stage-9-observations-retro.md`
- `stage-10-instruction-distillation.md`
- `stage-11-next-task.md`

Use the per-stage template from the companion guide §18.A.4 as the skeleton for each. Populate with project-specific content only where the generic template requires it.

### 8.4 Topic-scoped rule files

Create each of these under `command-center/rules/`:

- `sub-agent-workflow.md` — 10 cross-cutting spawn rules (companion guide §9)
- `decision-framework.md` — 3-tier autonomy (companion guide §9)
- `security-waves.md` — high-stakes wave playbook (companion guide §9)
- `testing.md` — risk tiers + test patterns
- `test-writing-guidelines.md` — unit / integration / E2E conventions
- `skill-use.md` — slash-command integration map (companion guide §10)
- `backlog-planning.md` — replenishment ritual when <3 pending tasks
- `housekeeping.md` — close-out checklist
- `external-sdks.md` — third-party SDK pre-flight
- `dev-principles.md` — empty file to start; fills up via `/retro`

All starters at Appendix §15.2.

### 8.5 Verification

```bash
find command-center -type f -name "*.md" | wc -l
```

Expected: at least 30 files (17 stage files + 10 rule files + README + per-agent instruction files from Phase 8).

---

## 9. Phase 8 — Sub-agent roster

Create TWO files per agent: one in `Sub-agent Instructions/`, one in `Sub-agent Observations/`.

The instruction file is **injected** when the agent is spawned. The observation file is **orchestrator-only** and never injected. The observation file MUST start with this line:

```markdown
**Orchestrator-only. Never inject into the agent's prompt.**
```

### 9.1 Core roster (create all 10)

For each of these, create `<agent>-instructions.md` and `<agent>-observations.md`:

1. `karen` — hallucination-gate (companion guide §8 Karen template)
2. `jenny` — spec-gate (companion guide §8 Jenny template)
3. `problem-framer` — symptom-vs-cause + antipatterns red-team
4. `ceo-reviewer` — strategic / worth-doing-now lens
5. `explore` — codebase reconnaissance (lightweight)
6. `backend-developer` — server/API implementer
7. `frontend-developer` — UI/component implementer
8. `ui-comprehensive-tester` — functional tester (one spawn per persona)
9. `knowledge-synthesizer` — Stage 9 observation writer
10. `technical-writer` — Stage 10B instruction compactor

Starter skeletons at Appendix §15.2.E and §15.2.F.

### 9.2 Specialists (create on first need, not up front)

When scope first requires one, create the pair then:

- `architect-reviewer` — pairs with security-engineer for auth/security waves
- `security-engineer` — `/cso`-style review
- `refactoring-specialist` — symbol-swap / rename waves
- `ultrathink-debugger` — Iron Law escalation after 2 failed fixes
- `websocket-engineer` — realtime features
- `database-administrator` — migrations, index tuning
- `react-specialist`, `nextjs-developer` — framework-specific implementers
- `ui-designer` — design spec + mockup alignment
- `competitive-analyst` — backlog replenishment, Tier 2 → Tier 1 resolution
- `product-manager` — spec authoring for new backlog tasks

Rule: do not create a specialist archetype until you've spawned its equivalent twice ad-hoc. Premature specialization fragments the roster.

### 9.3 Verification

```bash
ls "command-center/Sub-agent Instructions/" | wc -l
ls "command-center/Sub-agent Observations/" | wc -l
```

Both must return `10` after §9.1. Both counts must always be equal going forward.

---

## 10. Phase 9 — TaskMaster backlog init

TaskMaster is the canonical backlog. Specs live INSIDE the task, not in loose floating docs.

### 10.1 Initialize inside the project

Inside `claude` at the project root:

```
/mcp__task-master-ai__initialize_project
```

Or via direct tool call if available. Follow prompts. This writes a `.taskmaster/` folder.

### 10.2 Configure status set

Ensure TaskMaster's status column supports at minimum:

- `pending`
- `in_progress`
- `blocked`
- `review`
- `done`
- `deferred`

If the MCP's default statuses don't match, edit `.taskmaster/config.json` to add missing ones.

### 10.3 Field schema discipline

Every task entered into TaskMaster from this point forward MUST have:

- **Title** — imperative verb phrase
- **Description** — embedded spec: user outcome, acceptance criteria, constraints
- **Details** — technical notes, SDK references, gotchas
- **Test strategy** — how we'll know it's done
- **Dependencies** — blocking task IDs
- **Priority** — high / medium / low

If a field is missing, Stage 0 (prior-work query) MUST return the task to backlog for enrichment.

### 10.4 Seed first three tasks

Add three tasks manually via `task-master` CLI or MCP to bootstrap. Suggested:

1. "Set up CI pipeline with typecheck + lint + unit tests"
2. "Create README with architecture diagram"
3. "Wire up basic error monitoring (Sentry / similar)"

These exist purely so the first wave has something real to chew on.

---

## 11. Phase 10 — Working dir + gitignore

### 11.1 Gitignore

Write `<ROOT>/.gitignore` with at minimum:

```
node_modules/
.env
.env.local
.DS_Store
*.log
.claude/local-config.json
.taskmaster/state.json
working/
!working/archive/
```

Note: `working/` is ignored (ephemeral), but `working/archive/` is tracked (historical record of past waves). Adjust if you want waves themselves version-controlled — but the system is designed for `working/` to be ephemeral.

### 11.2 README

Write `<ROOT>/README.md` minimally with:

- Project name + one-line purpose
- Pointer to `CLAUDE.md` for the operational system
- Pointer to `How-to-Build-Product-Loops.md` for rationale
- Prerequisites to run the product locally
- How to run tests
- Deploy process

Keep ≤100 lines.

### 11.3 CHANGELOG

Write `<ROOT>/CHANGELOG.md` with Keep-a-Changelog format:

```markdown
# Changelog

## [Unreleased]

## [0.1.0] - YYYY-MM-DD
- Initial scaffolding
```

This file is updated at Stage 8 (closeout) of every wave that ships user-visible changes.

---

## 12. Phase 11 — Smoke test (first wave)

This validates the setup end-to-end. Pick the simplest seed task (e.g. "Set up CI pipeline") and run ONE full wave.

### 12.1 Enter the loop

Start a Claude Code session at the project root:

```bash
cd "<ROOT>"
claude
```

### 12.2 Invoke the entry skill

```
/careful
```

Warnings enabled for the session.

### 12.3 Execute Stage 0

Instruct Claude: `Enter the wave loop. Start at Stage 0.`

Claude should:

1. Read `CLAUDE.md` trigger table.
2. Read `command-center/rules/build-iterations/wave-loop.md`.
3. Read `stage-0-prior-work-query.md`.
4. Query TaskMaster for the next unblocked `pending` task.
5. Write `working/wave-g1-prior-work.md` if applicable.

### 12.4 Walk through stages 1–8

At each stage:
- Claude reads the stage file.
- Writes the stage's deliverable to `working/wave-g1-<artifact>.md`.
- Surfaces any BLOCK to you before proceeding.

At Stage 3 specifically, confirm:
- `karen` review file was produced.
- `jenny` review file was produced.
- Gemini cross-model review file was produced (or fallback used if flagged high-stakes).
- All three returned APPROVE (or you addressed BLOCKs in plan v2).

### 12.5 Success criteria

The smoke test PASSES if:

- Stage 8 closeout file exists at `working/wave-g1-closeout.md`.
- TaskMaster status on the seed task flipped to `done`.
- All stage artifacts (1 reframing, 1 plan, 3 gate reviews, ≥1 impl report, ≥1 test report, 2 reality-check reports, 1 closeout) exist in `working/`.
- Stage 10 produced zero-or-more instruction updates in `Sub-agent Instructions/` with `<!-- promoted from observations Wave g1 -->` comments if any.

If any of the above is missing, STOP and diagnose. Do not claim setup-complete until the smoke wave runs end-to-end.

---

## 13. Phase 12 — Ongoing care

### 13.1 Weekly rituals

- **Wave cadence:** aim for 2–5 waves per week. Less → muscle memory decays. More → fatigue / skipped stages.
- **Backlog health:** if `pending` tasks drop below 3, trigger backlog replenishment ritual (per `backlog-planning.md`).
- **`/careful` every session:** no exceptions.

### 13.2 Periodic skills

| Skill | Cadence | What it does |
|---|---|---|
| `/plan-ceo-review` | Every 3–5 waves | Strategic scope review |
| `/retro` | Every 5–6 waves | Engineering retro → `dev-principles.md` |

Optional: configure `scheduled-tasks` MCP to auto-remind.

### 13.3 Instruction file size watch

Every 10–15 waves, check:

```bash
wc -l "command-center/Sub-agent Instructions/"*.md
```

If any file exceeds 200 lines, spawn `technical-writer` to compact it (Stage 10B). Bloated instruction files cause context problems for the corresponding agent.

### 13.4 Archiving

Every ~20 waves, move old wave artifacts:

```bash
mkdir -p "working/archive/phase-<N>"
mv "working/wave-g"{1..20}*.md "working/archive/phase-<N>/"
```

Adjust wave IDs to match your scheme.

### 13.5 Quarterly audit

Once a quarter:

- Read last 3 closeouts. Did we ship what the plan said?
- Grep instruction files for contradictions.
- Review `dev-principles.md` — are any entries stale (condition no longer true)?
- Scan TaskMaster — any `pending` tasks older than 90 days that should be closed as `deferred`?

---

## 14. Troubleshooting

| Symptom | Probable cause | Fix |
|---|---|---|
| `/mcp` shows MCP as `failed` | Env var missing / wrong token | Re-run `claude mcp add` with correct env |
| `/plan-eng-review` not recognized | File in wrong dir or misnamed | Check `.claude/commands/plan-eng-review.md` exists |
| Sub-agent "hallucinates" files | Skipping Stage 3 or grep verification | Never skip Stage 3 — re-spawn with explicit verify instruction |
| Gemini CLI call errors | `GEMINI_API_KEY` unset | Export key, retry |
| Wave stalls at Stage 3 | Plan has unresolved BLOCK | Write plan v2 addressing each BLOCK; re-spawn gate |
| Observation file grows past 300 lines | Missed Stage 10B compaction | Spawn `technical-writer` on that file |
| Backlog empty | Replenishment ritual skipped | Run `backlog-planning.md` with user in the loop |
| Same bug recurs in N+1 wave | Root-cause skipped in N | Iron Law violation — escalate to `ultrathink-debugger` |
| Tester passes but feature broken | Deploy-race (Stage 7 gap) | Verify deploy timestamp > merge timestamp; re-deploy if stale |
| Instruction file drift | Stage 10 cap violated | Revert recent promotions; re-run Stage 10 with 3-change cap enforced |

---

## 15. Appendix — File-content library

These are starter contents. Edit aggressively as the project's real constraints surface.

### 15.1 `CLAUDE.md` starter

```markdown
# <PROJECT> — Orchestrator

You are running a 17-stage wave-loop product development system. Read the trigger table before every action.

## Trigger table (JIT file loads)

| Trigger | Read |
|---|---|
| Wave start / session start | `command-center/rules/build-iterations/wave-loop.md`, `command-center/rules/dev-principles.md` |
| Entering a stage | `command-center/rules/build-iterations/stages/stage-<N>-*.md` |
| Before spawning ANY sub-agent | `command-center/rules/sub-agent-workflow.md` + that agent's instruction file |
| Ambiguous product decision | `command-center/rules/decision-framework.md` |
| Wave touches auth / payments / session / money | `command-center/rules/security-waves.md` |
| Writing or running tests | `command-center/rules/testing.md`, `command-center/rules/test-writing-guidelines.md` |
| Before invoking any slash-command / skill | `command-center/rules/skill-use.md` |
| Backlog <3 pending tasks | `command-center/rules/backlog-planning.md` |
| Stage 8 close-out | `command-center/rules/housekeeping.md` |
| Wave touches 3rd-party SDK | `command-center/rules/external-sdks.md` + `command-center/SDK-Docs/<sdk>.md` |

## Always-on invariants

1. Follow the canonical wave loop. Every wave, every stage. No shortcuts.
2. Never commit secrets. `.env`, API keys → env-var manager only.
3. Root-cause before fixing. Iron Law: no fixes without root cause.
4. Stage 3 gate is mandatory. `karen` + `jenny` + conditionally Gemini. No exceptions.
5. Generate secrets yourself (`openssl rand -base64 32`) — don't wait for user.
6. Plans use symbol/method names, not line numbers.
7. Specs live in TaskMaster task description, not floating docs.
8. Invoke `/careful` at session start.
9. Playwright tests simulate real users (no `page.goto` after entry, no `fetch` from test code).
10. Observations are orchestrator-only. Never inject into agent prompts.
11. Sub-agent partitioning: zero file collisions.

## Stage summary

0. Prior-work query
0b. Product decisions (conditional)
1. Problem reframing
2. Plan
3. Gate (karen + jenny + conditional Gemini)
4. Execute
4b. Post-build review
5. Deploy
5b. Post-deploy QA
6. Test swarm
6b. Layout verification (conditional)
7. Reality check
7b. Triage
8. Closeout
9. Observations retro
10. Instruction distillation
11. Next task
```

### 15.2 `command-center/` starter contents

#### 15.2.A `command-center/README.md`

```markdown
# command-center

Persistent brain. Everything here is version-controlled; it's the project's operating system.

## Subfolders

- `rules/` — topic-scoped rule files, read on-trigger per `CLAUDE.md`.
  - `build-iterations/wave-loop.md` — stage dispatcher
  - `build-iterations/stages/stage-<N>-*.md` — one per stage
- `Sub-agent Instructions/` — what each sub-agent is told on spawn.
- `Sub-agent Observations/` — orchestrator-only behavioral notes. NEVER inject.
- `SDK-Docs/` — one folder per external SDK (gotchas, version pins).

## What does NOT live here

- Per-wave artifacts → `working/`
- Source code → `src/`
- User-facing docs → root `README.md`

## Editing rules

- Wave-loop and stage files: edit only during Stage 10 (instruction distillation) or via user instruction.
- Instruction files: edit only during Stage 10 (cap: 3 changes/agent/wave).
- Observation files: edit only during Stage 9 (retro).
```

#### 15.2.B `rules/build-iterations/wave-loop.md`

Use companion guide §18.A.3. Key points to preserve:
- Ordered stage list
- Skip conditions per stage
- Cross-references at every stage
- Task-management hooks (when to update TaskMaster)
- Operational rules (no shortcuts, orchestrator-only observations, etc.)

#### 15.2.C Per-stage file skeleton

Use companion guide §18.A.4. Each file has:
- Purpose
- Prerequisites
- Actions (numbered)
- Deliverable (filename + location)
- Exit criteria
- Skip conditions
- Next stage

#### 15.2.D Rule-file skeleton

```markdown
# <rule name>

One-line purpose.

## When to read

<trigger that makes this file relevant>

## Rules

1. ...
2. ...
3. ...

## Anti-patterns (optional)

- ...

## Related files

- ...
```

#### 15.2.E Sub-agent Instructions skeleton

```markdown
# <agent> — instructions

<one-line role>

## Required reading

- <rule file 1>
- <rule file 2>

## Primary capability

<what the agent does>

## Secondary capability

<what else>

## Output format

```markdown
# <agent> — <artifact type>
**Verdict:** <enum>
## <section>
## <section>
```

## Do NOT

- Propose outside scope
- Soften weak reasoning
- Write to files other than your deliverable

## Tone

Direct, evidence-based. Bullets over prose.
```

#### 15.2.F Sub-agent Observations skeleton

```markdown
# <agent> — orchestrator observations

**Orchestrator-only. Never inject into the agent's prompt.**

## Behavioral patterns

<what this agent reliably does well; systemic blind spots>

## How to compensate when prompting

- <prompt cue>
- <prompt cue>

## Standing recommendations

- <process rec>

## Wave <N> (<date>)

### <short pattern name>
**Observed:** ...
**Context:** ...
**Proposed compensation:** orchestrator-side prompt shaping | promote to instructions | standing rec
```

### 15.3 Slash-command starters (`.claude/commands/*.md`)

Each file's content is the prompt the command expands to.

#### 15.3.1 `careful.md`

```markdown
From this point in the session, BEFORE running any destructive command (`rm -rf`, `DROP TABLE`, `git push --force`, `kubectl delete`, `drop database`, `truncate`, mass file-deletes, or any operation that cannot be undone with a single `git reset`), STOP and:

1. Print the exact command you are about to run.
2. Print what will be destroyed.
3. Ask the user to confirm with "yes".
4. Only proceed on explicit confirmation.

Never batch a destructive command with other work. Never assume prior confirmation applies to a new destructive command.
```

#### 15.3.2 `simplify.md`

```markdown
Review the files touched in the current wave and reduce unnecessary complexity. Specifically:

- Remove dead code (unused imports, unreachable branches, unused variables)
- Inline one-use helpers that add indirection without clarity
- Flatten needless nesting (early returns, guard clauses)
- Consolidate near-duplicate blocks
- Rename cryptic symbols

Do NOT:
- Change behavior
- Introduce new abstractions
- Refactor beyond the files this wave touched

Report: list of changes applied, files modified, diff summary.
```

#### 15.3.3 `review.md`

```markdown
Review the pending diff for PRODUCTION bugs, not style. Focus specifically on:

- Contract mismatches between backend service, shared type, and frontend consumer (3 sources of truth)
- Null-access / undefined-access paths
- Error paths that swallow failures silently
- Missing input validation on public endpoints
- Race conditions / concurrent-write hazards
- Off-by-one, integer overflow, timezone bugs
- Security: SQL injection, XSS, SSRF, auth bypass

Output severity-tagged list: Critical / High / Medium / Low. Cite file:symbol (not line numbers). Do NOT report style / formatting / naming complaints.
```

#### 15.3.4 `qa.md`

```markdown
Run a headless-browser smoke test on the pages touched in this wave. For each page:

1. Visit the page.
2. Check console for errors.
3. Check network tab for 4xx / 5xx.
4. Verify primary CTAs are clickable and responsive.
5. Check that data-loading states complete (no stuck skeletons).

Report: page-by-page table with PASS / FAIL + evidence. This SUPPLEMENTS the full Stage 6 test swarm; it does NOT replace it.
```

#### 15.3.5 `plan-eng-review.md`

```markdown
Review the current wave plan for engineering soundness. Evaluate:

1. Architecture fit — does this cohere with the existing system, or does it introduce a foreign pattern?
2. Data flow — are the contracts between components explicit and unambiguous?
3. Edge cases — enumerate edge cases and check whether the plan addresses each.
4. Test coverage — will the plan's testing strategy actually catch regressions?
5. Performance — any O(n²) hot paths, unbounded queries, sync-in-async, or similar?
6. Failure modes — what breaks this feature, and does the plan handle those modes?

Output: 0–10 rating per dimension + specific actionable improvements.
```

#### 15.3.6 `cso.md`

```markdown
Perform a security review of the current wave. Apply OWASP Top 10 + STRIDE methodology.

For each of the following, assess:
- Injection (SQL, NoSQL, OS command)
- Broken authentication
- Sensitive data exposure
- XML external entities
- Broken access control
- Security misconfiguration
- XSS
- Insecure deserialization
- Components with known vulnerabilities
- Insufficient logging / monitoring

STRIDE:
- Spoofing
- Tampering
- Repudiation
- Information disclosure
- Denial of service
- Elevation of privilege

Output severity-tagged findings with mitigations. This complements `architect-reviewer` + `security-engineer` — it does not replace them.
```

#### 15.3.7 `retro.md`

```markdown
Engineering retrospective for the last 5–6 waves. Read each closeout in `working/wave-*-closeout.md`. Output:

1. Patterns in what went well.
2. Patterns in what went wrong.
3. Patterns in what surprised us.
4. 2–4 distilled process improvements.

Write output to `command-center/rules/dev-principles.md`, APPENDING to the existing file (do not overwrite). Each new entry carries a `wave-of-origin` tag.

Do NOT dump the full retro output into `CLAUDE.md`. `CLAUDE.md` is a dispatcher, not a diary.
```

#### 15.3.8 Others (`/plan-design-review`, `/plan-devex-review`, `/plan-ceo-review`, `/autoplan`, `/design-review`, `/health`, `/ship`, `/land-and-deploy`, `/investigate`, `/document-release`, `/learn`)

Follow the same pattern:
- One-line purpose at the top.
- Numbered evaluation or procedure.
- Explicit Do / Do-NOT boundaries.
- Output format spec.

See `How-to-Build-Product-Loops.md` §10 for the purpose spec of each. Write the prompt to match the described role and output.

### 15.4 First three TaskMaster tasks (content)

**Task 1 — Set up CI pipeline**

- Description: Configure CI to run typecheck, lint, and unit tests on every PR. Block merges on red build.
- Acceptance: PR opened → CI runs → red/green status visible → merge blocked on red.
- Test strategy: Open a PR with deliberate lint error; verify CI blocks.
- Priority: High.

**Task 2 — Create README with architecture diagram**

- Description: README must cover: one-line purpose, prerequisites, run-locally, test, deploy. Include a Mermaid diagram of service topology.
- Acceptance: new contributor can go from `git clone` to running locally in ≤10 minutes using only README.
- Test strategy: walk a colleague through it; time them.
- Priority: Medium.

**Task 3 — Wire up basic error monitoring**

- Description: Install Sentry (or equivalent) in both frontend and backend. Errors in production must alert within 5 minutes.
- Acceptance: trigger a deliberate error in staging → alert fires → stack trace visible.
- Test strategy: manual trigger in staging.
- Priority: High.

---

## Final verification checklist

Before declaring setup complete, confirm EVERY item:

- [ ] All prerequisites in §1 passed.
- [ ] `claude --version` works.
- [ ] `gh auth status` logged in.
- [ ] `gemini --version` works + `GEMINI_API_KEY` set.
- [ ] Deploy CLI logged in.
- [ ] `/mcp` shows at least: `task-master-ai`, `gmail`, `gcal`, `notion`, `desktop-commander`, `mcp-registry`, `scheduled-tasks` — all `connected`.
- [ ] `/plugin list` shows the anthropic core skills plugin.
- [ ] Typing `/` in `claude` shows all 18 custom slash commands from §5.2.
- [ ] Folder tree matches §6.
- [ ] `CLAUDE.md` exists and matches §15.1.
- [ ] All 17 stage files exist under `command-center/rules/build-iterations/stages/`.
- [ ] All 10 topic-scoped rule files exist under `command-center/rules/`.
- [ ] 10 sub-agent instruction files + 10 sub-agent observation files exist, counts equal.
- [ ] TaskMaster initialized; 3 seed tasks present.
- [ ] `.gitignore`, `README.md`, `CHANGELOG.md` present at root.
- [ ] Smoke wave (Phase 11) ran Stage 0 → Stage 8 end-to-end with all artifacts present.

Only once EVERY box is checked is the setup complete. If any box is unchecked, fix before handing off.

---

## Closing note

This runbook recreates the *infrastructure* of the product-loop system. The *operating system it runs* is in `How-to-Build-Product-Loops.md`. Read that next to understand why each piece exists.

Two principles survive every rewrite of this setup:

1. **Persistent memory is separate from ephemeral work.** `command-center/` vs. `working/` — never blur them.
2. **The Stage 3 gate is non-negotiable.** Two reviewers, different blind spots, every wave, no shortcuts.

Everything else is refinement.
