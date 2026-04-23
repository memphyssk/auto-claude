# Project Placeholder — _<Your Project>_

> **Fill this section in for your project.** Everything below (trigger table + always-on rules + directory structure) is project-agnostic.

_One-paragraph product description goes here. What you're building, who for, what competitors you'll displace._

## Architecture (fill in)
- **Monorepo / single repo:** _(turborepo+pnpm / single-package / other)_
- **Backend:** _(NestJS / FastAPI / Rails / …)_
- **Frontend:** _(Next.js / SvelteKit / …)_
- **Shared contracts:** _(Zod in @your-project/shared / OpenAPI / …)_

## Quick Start (fill in)
```bash
# cp .env.example .env
# <deps install>
# <db setup>
# <run dev>
```

## Commands (fill in)
| Command | Description |
|---------|-------------|
| _(project build/lint/test/typecheck commands)_ | _(descriptions)_ |

## Task Management (TaskMaster)
| Command | Description |
|---------|-------------|
| `npx task-master list` | List all tasks with dashboard |
| `npx task-master show <id>` | Show task details |
| `npx task-master next` | Get next recommended task |
| `npx task-master set-status --id=<id> --status=<status>` | Update task status |
| `npx task-master add-task --prompt="<description>"` | Create new task |
| `npx task-master expand --id=<id>` | Break task into subtasks |

TaskMaster is the canonical task tracking system. All features, bugs, and backlog items live here.

## Test Users (fill in)
_(local dev + prod canonical test accounts — never commit passwords)_

---

# ⚡ Trigger Table — READ THESE FILES WHEN:

**This is the most important section of this file. Each row is a conditional instruction: when the trigger fires, you MUST read the linked file BEFORE acting.**

| Trigger | READ BEFORE acting |
|---|---|
| **Starting a NEW project** (no prior waves; seeding from founder docs) | `command-center/rules/onboarding/onboarding-loop.md` (13-stage pre-launch sequence v0→v11; hands off to wave-loop Stage 0 at the end) |
| Starting a new wave | `command-center/rules/build-iterations/wave-loop.md` (then read each stage file before entering that stage) |
| Picking next task / checking backlog | `npx task-master next` or `npx task-master list` — TaskMaster is the canonical task source |
| Spawning ANY sub-agent | `command-center/rules/sub-agent-workflow.md` + `command-center/Sub-agent Instructions/<agent-name>-instructions.md` |
| Any test work (Playwright, Vitest, UI verification, prod audit) | `command-center/rules/testing-principles.md` + `command-center/test-writing-principles.md` §15-16 + `command-center/artifacts/user-journey-map.md` |
| Making a product/UX decision | `command-center/management/semi-assisted-mode.md` (3-tier autonomy) + `command-center/management/full-autonomy-mode.md` (BOARD routing under full-autonomy) |
| Authoring / editing a milestone, changing `roadmapMilestone` metadata on a task, walking the unassigned queue | `command-center/rules/roadmap-lifecycle.md` (schema, states, edit permissions, reference format) |
| Founder says "refresh the roadmap" / "re-plan" / "strategic review" — OR triggered by Stage 11 when `planned` milestones drop below 3 — OR triggered by Stage 0b when unassigned-queue count > 30 | `command-center/rules/roadmap-refresh-ritual.md` (heavyweight milestone-level refresh; propose, do not auto-fire) |
| Founder says "daily checkpoint" / "checkpoint" / "what's pending?" — OR triggered by Stage 11 when `task-master next` returns nothing actionable AND any checkpoint bucket is non-empty | `command-center/rules/daily-checkpoint.md` (3-bucket batch: Tier 3 / assigned this cycle / stayed unassigned) |
| Wave touches auth / payments / user creation / cookies / CSRF / rate limits / sessions | `command-center/rules/security-waves.md` |
| Creating a `MONITOR:` task for any external wait (deploy, CI, DNS, tier activation, third-party provisioning) | `command-center/rules/monitors/monitor-principles.md` + platform template in `command-center/rules/monitors/` (`railway-deploy.md` / `gh-actions.md` / `netlify-deploy.md` / etc.). **Every monitor MUST declare all three of `success_condition`, `failure_condition`, `timeout_budget` — a monitor with only a success check will sit forever on a failed deploy.** |
| Task touches any external SDK or third-party tool | `command-center/rules/external-sdks.md` (pre-build checklist + SDK registry) |
| Stage 3b — design-gap resolution (UI/icon/page/flow not in `design/`) | `command-center/rules/build-iterations/stages/stage-3b-design-gap.md` (formal Dx gate between 3 and 4; skip for non-UI waves; non-blocking bugs routed to `bug-design` TaskMaster tag) |
| User says "run overnight" / "autonomously" / "I'm going to sleep" (or reverse: "I'm back" / "pause") | `command-center/management/mode-switching.md` (flag spec + transitions) → sets `mode: semi-assisted` by default. See `command-center/management/semi-assisted-mode.md` for behavior. |
| User says "full autonomy" / "go completely autonomous" / "board mode" / "unconditional loop" | `command-center/management/mode-switching.md` (sets `mode: full-autonomy`) + `command-center/management/full-autonomy-mode.md` (BOARD routing + `/loop` bootstrap + STATUS file tick behavior) + `command-center/management/board.md` + `command-center/management/board-members.md` + `command-center/management/conflict-resolution.md`. **Agent bootstraps `/loop` skill on mode entry; routes each tick via `command-center/management/STATUS`. Founder does not invoke `/loop` manually.** |
| User says "danger builder" / "ship it mode" / "ceo mode" / "run indefinitely" / "full delegation" / "365 mode" | `command-center/management/mode-switching.md` (sets `mode: danger-builder`) + `command-center/management/danger-builder-mode.md` (prerequisite checks + ceo-agent resolution of BOARD splits/HARD-STOPs + daily Resend-delivered digest + indefinite loop) + `command-center/management/ceo-bound.md` (founder-authored charter — restrictions only; silent = unlimited) + `command-center/Sub-agent Instructions/ceo-agent-instructions.md` (personality + decision procedure) + `command-center/management/digest-delivery/resend.md` (email delivery spec). **Verifies prerequisites before entry — charter exists, Resend env vars set, kill-switch mechanism works. Founder reached only via kill-switch, session message, or daily digest.** |
| Invoking any slash command / skill | `command-center/rules/skill-use.md` |
| Authoring the wave plan at Stage 2 | `command-center/rules/planning-principles.md` (cross-wave plan-authoring lessons from `/retro`) |
| Executing the plan at Stage 4 | `command-center/rules/dev-principles.md` (cross-wave execution lessons + code conventions) |
| Closing a wave | `command-center/rules/housekeeping.md` |
| Running backlog replenishment (or backlog < 3 items at wave start) | `command-center/rules/backlog-planning.md` |
| Encountering any technical error / bug / failure during execution | `command-center/rules/triage-routing-table.md` (classify first, route to specialist — orchestrator does NOT fix directly) |
| Running full-site product mega-testing (user invokes "mega test" or "product mega-testing") | `command-center/rules/product-mega-testing/product-mega-testing.md` + scenarios in `user-scenarios/` |
| Historical research / competitive spec needed | `command-center/artifacts/` (Concept/, competitive-benchmarks/) — design system lives in `design/DESIGN-SYSTEM.md` |

**Companion docs (referenced by many files):**
- `command-center/artifacts/user-journey-map.md` — canonical inventory of every screen, route, endpoint, user flow
- `command-center/test-writing-principles.md` — master testing guide (§15-16 for live E2E)
- `command-center/product/ROADMAP.md` — canonical theme-based milestone roadmap (refreshed via refresh ritual, never hand-edited outside it)

**Skills** (installed at `~/.claude/skills/`, invokable as slash commands — see `command-center/rules/skill-use.md` for wave-loop integration):
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan`, `/review`, `/qa`, `/design-review`, `/cso`, `/investigate`, `/retro`, `/learn`, `/ship`, `/land-and-deploy`, `/document-release`, `/health`, `/careful`, `/simplify`, `/search-first`, `/browse`, `/freeze`, `/guard`, `/canary`, `/benchmark`, `/checkpoint`.

---

# 🔒 Always-on rules

These apply in every turn regardless of which trigger fires.

1. **Follow the canonical wave loop — at all times.** Every wave follows the stage sequence in `command-center/rules/build-iterations/wave-loop.md`. Before EVERY stage, read the corresponding stage file at `command-center/rules/build-iterations/stages/stage-N-<name>.md`. Never invent stages, skip stages, or proceed without reading the stage file first.

   **Stages:** `0 Prior-work → 0b Product decisions (cond.) → 1 Problem reframing → 2 Plan → 3 Gate (Karen+Jenny+Gemini) → 3b Design-gap (cond.) → 4 Execute → 4b Review → 5 Deploy+CI → 5b QA → 6 Playwright swarm → 6b Layout (cond.) → 7 Reality check (Karen+Jenny) → 7b Triage → 8 Closeout → 9 Observations → 10 Distillation → 11 Next task`

2. **Never commit `.env`, secrets, or credentials.** Secrets go in platform env vars (GitHub Actions / Railway / Netlify / Vercel / etc.).
3. **Karen + Jenny on every Stage 3 gate.** Non-negotiable. Every wave, every time, regardless of scope. Specialists (and Gemini for high-stakes waves) layer on top but never substitute.
4. **Classify-then-route for all technical issues.** **Iron Law: no fixes without root cause.** The orchestrator NEVER attempts fixes directly. On any error: (1) classify using `command-center/rules/triage-routing-table.md`, (2) route to the matching domain expert or `/investigate`. For unknown/complex issues, `/investigate` is mandatory first. Never debug-by-deploy with `console.log` PRs.
5. **Never `browser_close` in Playwright swarms.** It kills the MCP instance for subsequent batch agents. Let the browser context persist.
6. **Generate secrets yourself** (`openssl rand -base64 32`) — do not wait for the user. Routine mechanical action, should never gate the autonomous loop.
7. **Invoke `/careful` at wave start for destructive-command safety.** The skill hooks Bash PreToolUse and warns before `rm -rf`, `DROP TABLE`, force-push, `git reset --hard`, `kubectl delete`. Zero-friction catch for shared-environment mistakes.
8. **Product specs live inside their TaskMaster task.** Embed the full spec in the task's `details` field — do not leave it as a loose `Planning/*.md` file. TaskMaster is the single source of truth for scope.
9. **Never ask the user to shortcut wave-loop stages because of time constraints.** Always follow every stage in `command-center/rules/build-iterations/wave-loop.md` to completion. Wall-clock cost is not a valid reason to skip Stage 5b/6/7/7b/8/9/10/11. Only `wave-loop.md`'s explicit skip conditions table justifies skipping a stage.

10. **Respect the mode flag.** Before routing any would-be user-ask, check `Planning/.autonomous-session` per `command-center/management/mode-switching.md`. Four modes: **founder-review** (no flag — every user-ask to founder); **semi-assisted** (skip nice-to-haves, strategic + hard-stops to founder); **full-autonomy** (BOARD resolves 4+/7 default / 6+/7 Tier 3 strict; splits + hard-stops to founder); **danger-builder** (BOARD resolves same thresholds; BOARD splits + HARD-STOP vetoes + all former-founder-asks route to **ceo-agent** within `ceo-bound.md` charter; founder reached only via kill-switch / session message / daily Resend digest). Hard-stops (destructive actions, money commitments, BOARD member veto) route to founder under the first three modes, and to ceo-agent under `danger-builder` — ceo-agent weighs them, respects any charter restriction, and records engagement in the digest. Founder charter amendments are the only founder-involvement path under danger-builder beyond the kill-switch.

---

# Directory Structure

```
├── CLAUDE.md                         ← this file (trigger table + always-on rules)
├── README.md                         ← what this system is + how to use it
├── LICENSE
├── command-center/                   ← persistent orchestration brain
│   ├── README.md
│   ├── test-writing-principles.md    ← master testing guide (§15-16 for live E2E)
│   ├── rules/                        ← topic-scoped rules (read on trigger)
│   │   └── build-iterations/
│   │       ├── wave-loop.md          ← stage dispatcher
│   │       └── stages/               ← 18 stage files (stage-0..11 + stage-0b/3b/4b/5b/6b/7b)
│   ├── Sub-agent Instructions/       ← per-agent positive directives (19 files)
│   ├── Sub-agent Observations/       ← Stage 9/10 pipeline artifact (20 stubs)
│   ├── product/                      ← canonical product surface
│   │   ├── ROADMAP.md                ← blank scaffold
│   │   ├── FOUNDER-BETS.md           ← blank scaffold
│   │   ├── product-decisions.md      ← blank scaffold
│   │   └── roadmap-archive/
│   └── artifacts/                    ← persistent reference material
│       ├── user-journey-map.md       ← blank scaffold (regen daily from prod)
│       ├── Concept/                  ← research / strategy docs
│       └── competitive-benchmarks/   ← per-feature competitor evidence
└── design/                           ← canonical design pipeline
    ├── DESIGN-SYSTEM.md              ← blank scaffold (tokens)
    ├── brief-template.md             ← Stage 3b Step 2 input template
    ├── review-gate.md                ← Stage 3b Step 5 rubric
    └── staging/                      ← Stage 3b pre-approval HTML lands here
```

**`command-center/` is the persistent brain; `Planning/` (created per-wave) is the ephemeral working directory.** New wave deliverables go in `Planning/`. Persistent rules, agent memory, and reference material live in `command-center/`.
