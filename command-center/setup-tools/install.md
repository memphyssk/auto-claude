# Setup Tools — Installation Guide

The auto-claude brain expects a specific tooling environment. This document lists everything installed on a working auto-claude system, with install commands and links, so you can bootstrap a fresh machine to the same baseline.

**Scope:** tooling that sits *outside* the brain files themselves — Claude Code agents, skills, MCP servers, plugins, and supporting CLIs. The brain at `command-center/` is pulled via `auto-claude sync` (see [README.md](../../README.md) § Keeping the brain in sync).

**Audience:** founder or DevOps engineer setting up a new VPS or dev machine to run auto-claude projects. You already have Claude Code installed and working.

**Verified against:** a working system running Claude Code on Linux (Ubuntu 24.04). Pin down specific versions only where the brain depends on them.

---

## 0. Prerequisites

| Tool | Check | Install |
|---|---|---|
| Claude Code CLI | `claude --version` | <https://claude.com/claude-code> |
| Node.js 20+ | `node --version` | <https://nodejs.org/> or via `nvm` |
| pnpm | `pnpm --version` | `npm install -g pnpm` |
| git | `git --version` | system package manager |
| GitHub CLI | `gh --version` | <https://cli.github.com/> — required by `/ship`, `/review`, auto-claude release flow |
| bun (optional) | `bun --version` | `curl -fsSL https://bun.sh/install \| bash` — needed for the `claude-mem` plugin |

All subsequent sections assume these are on `$PATH`.

---

## 1. Global CLIs

Install these first. Some are referenced by MCPs, some by skills, some by the brain's wave loop.

```bash
# TaskMaster — the canonical task tracking system referenced by the brain
npm install -g task-master-ai

# Playwright MCP — provides browser automation for Stage 6 + /qa + /browse
npm install -g @playwright/mcp

# Domain MCP — domain registration + DNS ops (optional; only if you register domains
# via Dynadot as part of your workflow)
npm install -g domain-mcp

# Netlify CLI — needed if you deploy to Netlify (brain's rules/monitors/netlify-deploy.md
# references `netlify api listSiteDeploys`)
npm install -g netlify-cli

# Railway CLI — needed if you deploy to Railway (brain's rules/monitors/railway-deploy.md
# references `railway status --json`). Installed per Railway's own docs, not npm.
bash <(curl -fsSL cli.new)

# RTK (Rust Token Killer) — transparent CLI proxy, 60-90% token savings on dev operations.
# Installed at ~/.local/bin/rtk with a Bash PreToolUse hook rewriting commands.
# See: https://github.com/memphyssk/rtk (or wherever your copy lives)
# After install, verify: `rtk --version` and `rtk gain`
```

After installing, verify each:
```bash
which task-master playwright-mcp domain-mcp netlify railway rtk gh
```

---

## 2. Claude Code Agents

The brain references ~20 sub-agents by name. These are installed into `~/.claude/agents/` either from the VoltAgent marketplace or as auto-claude custom agents.

### 2a. VoltAgent marketplace agents (generic roles)

Source: <https://github.com/VoltAgent/awesome-claude-code-subagents>

The brain uses these directly by name (via the `subagent_type` parameter in Claude Code's Agent tool). The full system currently has 152 agents installed; only a subset are actively referenced by the brain.

Minimum required set (referenced by wave-loop stages + Sub-agent Instructions):
```
architect-reviewer          backend-developer           frontend-developer
nextjs-developer            react-specialist            refactoring-specialist
security-engineer           websocket-engineer          database-optimizer
ui-designer                 ui-comprehensive-tester     knowledge-synthesizer
technical-writer            product-manager             competitive-analyst
ux-researcher               risk-manager                ceo-reviewer
problem-framer              claude-md-compliance-checker
```

Install via the bundled `agent-installer` agent:
```
Tell Claude Code: "Use the agent-installer agent to install the following agents from
awesome-claude-code-subagents: architect-reviewer, backend-developer, frontend-developer,
nextjs-developer, react-specialist, ...[full list above]"
```

Or clone the repo and copy manually:
```bash
git clone https://github.com/VoltAgent/awesome-claude-code-subagents ~/.cache/voltagent
for agent in architect-reviewer backend-developer frontend-developer nextjs-developer \
             react-specialist refactoring-specialist security-engineer websocket-engineer \
             database-optimizer ui-designer ui-comprehensive-tester knowledge-synthesizer \
             technical-writer product-manager competitive-analyst ux-researcher \
             risk-manager ceo-reviewer problem-framer claude-md-compliance-checker; do
  find ~/.cache/voltagent -name "${agent}.md" -exec cp {} ~/.claude/agents/ \;
done
```

Liberal install (all 152 agents): just copy the whole `categories/*/` tree from the VoltAgent repo into `~/.claude/agents/`. Harmless — unused agents cost nothing at rest.

### 2b. Custom auto-claude agents

Three agents are custom to this system and live in this repo — install them after the VoltAgent set:

| Agent | Purpose | Source |
|---|---|---|
| `Jenny.md` | Spec-semantic verification — runs at Stage 3 gate + Stage 7 reality check | This repo, or wherever you store your reviewer agents |
| `karen.md` | Source-claim verification (anti-hallucination) — runs at Stage 3 + Stage 7 | Same |
| `ceo-reviewer.md` | Strategic direction / bet alignment — spawned at Stage 1 + BOARD | Uses `Sub-agent Instructions/ceo-reviewer-instructions.md` as its instruction layer |
| `founder-proxy.md` | Founder voice simulation via claude-mem — BOARD-only member | Uses `Sub-agent Instructions/founder-proxy-instructions.md` + claude-mem plugin |

Installation: Jenny and karen live at `~/.claude/agents/{Jenny,karen}.md` in the reference system. If you need them, ask your brain-author to share the files, or look at commit history for `auto-claude/command-center/Sub-agent Instructions/{Jenny,karen}-instructions.md` — the instruction file is the project-readable source of truth; the agent file wraps it for Claude Code.

### 2c. Built-in agents

These ship with Claude Code — no install needed:

- `Explore` — fast codebase exploration (replaces multiple grep/find calls)
- `Plan` — software architect agent for implementation plans
- `general-purpose` — for custom roles defined via project instruction files (e.g., founder-proxy is spawned as `general-purpose` + the founder-proxy-instructions.md)

---

## 3. Claude Code Skills

45 skills live at `~/.claude/skills/`. The brain references these via `/skill-name` invocations in CLAUDE.md, rules/skill-use.md, and stage files.

### 3a. gstack skill family (required — 30+ skills)

Source: gstack — a suite of QA, planning, review, and DX skills that the wave loop leans on heavily.

Install: follow gstack's README. After install, skills appear at `~/.claude/skills/<name>/SKILL.md`.

Minimum brain-referenced skills:
```
/office-hours           /plan-ceo-review        /plan-eng-review
/plan-design-review     /plan-devex-review      /autoplan
/review                 /qa                     /qa-only
/design-review          /design-consultation    /design-shotgun
/design-html            /cso                    /investigate
/retro                  /learn                  /ship
/land-and-deploy        /document-release       /health
/careful                /freeze                 /guard
/unfreeze               /browse                 /connect-chrome
/canary                 /benchmark              /codex
/setup-deploy           /setup-browser-cookies
```

Verify: `ls ~/.claude/skills/` shows all the above directories. Each should contain a `SKILL.md` file.

### 3b. Stand-alone skills

- `/make-pdf` — markdown → publication-quality PDF. Install: the skill's SKILL.md + any script deps
- `/continuous-agent-loop` — patterns for autonomous agent loops (used by `/loop` and full-autonomy mode)
- `/benchmark-models` — cross-model benchmark harness (Claude vs GPT via Codex CLI vs Gemini)

### 3c. Built-in skills

These come with Claude Code:

- `/loop` — recurring interval runner (also triggered programmatically by full-autonomy mode)
- `/schedule` — cron-scheduled remote agents
- `/claude-api` — Claude API / SDK assistance
- `/update-config` — settings.json configuration
- `/keybindings-help` — custom key-chord rebindings
- `/fewer-permission-prompts` — auto-allowlist common read-only tool calls
- `/statusline-setup` — status line configuration
- `/simplify` — review + dedupe recently changed code

### 3d. claude-mem plugin skills

The `claude-mem` plugin (section 4) adds:
- `/mem-search` — cross-session persistent memory search
- `/make-plan` — phased implementation plans with doc discovery
- `/do` — execute phased plans via subagents
- `/smart-explore` — token-optimized AST-based code search
- `/knowledge-agent` — build queryable brains from observation history
- `/timeline-report` — project history narrative reports
- `/version-bump` — semantic versioning release workflow

---

## 4. Plugins

### 4a. claude-mem (required for founder-proxy + memory)

Source: <https://github.com/thedotmack/claude-mem>

Install:
```bash
# Add the marketplace
# (exact command depends on your Claude Code version — check `claude plugin --help`)
# Rough shape:
claude plugin marketplace add github:thedotmack/claude-mem
claude plugin install claude-mem@thedotmack
```

Or manually edit `~/.claude/settings.json` to include:
```json
{
  "extraKnownMarketplaces": {
    "thedotmack": {
      "source": {
        "source": "github",
        "repo": "thedotmack/claude-mem"
      }
    }
  },
  "enabledPlugins": {
    "claude-mem@thedotmack": true
  }
}
```

Then restart Claude Code. Verify: `ls ~/.claude/plugins/cache/thedotmack/claude-mem/`.

Why it's required:
- Provides the `mcp-search` MCP server (see section 5c)
- Powers `/mem-search` and related memory skills
- The brain's founder-proxy BOARD member reads claude-mem memory to simulate founder voice — without it, founder-proxy always emits `HARD-STOP: no founder precedent in memory` and collapses BOARD back to founder-ask

---

## 5. MCP Servers

MCPs are configured either at user scope (`~/.mcp.json`, `~/.claude.json`) or per-project via `.mcp.json` in the project root. The auto-claude brain expects these available:

### 5a. aidesigner (HTTP) — design generation

Configuration (goes in `~/.mcp.json` or per-project `.mcp.json`):
```json
{
  "mcpServers": {
    "aidesigner": {
      "type": "http",
      "url": "https://api.aidesigner.ai/api/v1/mcp"
    }
  }
}
```

Authentication: browser-based sign-in flow on first use. No API key needed in config.

Used by: onboarding Stage v7 (design direction), onboarding Stage v8 (design system), the `aidesigner-frontend` skill, and the `/design-html` skill.

### 5b. Playwright (stdio × 10 parallel instances)

The brain's Stage 6 Playwright swarm runs up to 5 parallel testers; having 10 configured instances gives comfortable headroom.

Configuration (goes in project `.mcp.json` or `~/.claude.json` per-project `mcpServers`):
```json
{
  "mcpServers": {
    "playwright-1": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-2": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-3": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-4": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-5": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-6": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-7": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-8": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-9": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-10": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} }
  }
}
```

`--isolated` flag gives each instance its own browser context — critical for parallelism without state leakage.

Requires: `playwright-mcp` on `$PATH` (section 1).

### 5c. mcp-search (stdio, via claude-mem plugin)

Automatically registered when `claude-mem` is installed (section 4a). No manual MCP configuration needed. Provides persistent cross-session memory search.

### 5d. domain-mcp (optional, stdio)

Only if you register domains via Dynadot. Configuration:
```json
{
  "mcpServers": {
    "domain-mcp": {
      "type": "stdio",
      "command": "env",
      "args": ["DYNADOT_API_KEY=<your-dynadot-api-key>", "domain-mcp"],
      "env": {}
    }
  }
}
```

**Security note:** the API key goes inline in `args` because the wrapping `env` command injects it as an env var for the child process. Do not commit config files with a real key. For a cleaner approach, export `DYNADOT_API_KEY` in your shell and change the config to `{ "command": "domain-mcp", "env": {} }` — most MCP runners honor the parent process's env.

---

## 6. Shell configuration

### 6a. settings.json hooks

The auto-claude reference environment has a `rtk` Bash hook wired via `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "rtk hook claude" }
        ]
      }
    ]
  }
}
```

This intercepts Bash tool invocations and rewrites them through `rtk` for token-efficient output. Install section 1's `rtk` first, then add this hook.

### 6b. SSH keep-alive (for long-running sessions)

If you run Claude Code over SSH with full-autonomy loops that run for hours, configure SSH keep-alive on both client and server:

**Server** (`/etc/ssh/sshd_config.d/keepalive.conf`):
```
ClientAliveInterval 60
ClientAliveCountMax 10
```
Restart sshd: `systemctl restart ssh`.

**Client** (`~/.ssh/config`):
```
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 10
    TCPKeepAlive yes
```

### 6c. tmux + tmux-resurrect + tmux-continuum (persistent sessions)

For VPS work where SSH connections drop: run Claude Code inside a tmux session. tmux-resurrect saves/restores panes, tmux-continuum auto-saves every 15 minutes.

```bash
# Install tmux plugin manager
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# ~/.tmux.conf
cat >> ~/.tmux.conf <<'EOF'
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @continuum-restore 'on'
set -g @continuum-save-interval '15'
run '~/.tmux/plugins/tpm/tpm'
EOF

# Inside tmux, install plugins: press `Ctrl-b` then `I`
```

---

## 7. Project bootstrap — bringing a new project onto auto-claude

Once all the above is installed on the machine, each new project gets onto auto-claude as follows:

```bash
# 1. Create the project repo + init git
mkdir my-new-project && cd my-new-project && git init

# 2. Install TaskMaster for this project
npx task-master init

# 3. Install the brain — pin to latest auto-claude release
/path/to/auto-claude/bin/auto-claude init --version=v0.5.0

# 4. Review the generated .brainignore and adjust for project-local paths
$EDITOR .brainignore

# 5. Commit the sync infrastructure
git add .brainignore command-center/.brain-version command-center/.brain-snapshot/ \
        command-center/ CLAUDE.md design/
git commit -m "chore: bootstrap auto-claude brain (pinned v0.5.0)"

# 6. Start the onboarding loop
# Open Claude Code in the project, tell it:
#   "Start a new project" (and provide your founder docs)
# This triggers the 13-stage onboarding in command-center/rules/onboarding/
```

After v11 handoff, the project is seeded: vision, competitors, scope, stack, architecture, design system, TaskMaster queue, first CI. From here, the wave loop takes over.

---

## 8. Verification checklist

Run this on a freshly bootstrapped machine to confirm setup completion:

```bash
# Tooling
claude --version          # Claude Code CLI
node --version            # 20+
pnpm --version
gh --version
task-master --version
playwright-mcp --version
rtk --version
rtk gain                  # should not error

# Agents
ls ~/.claude/agents/ | wc -l     # should be 20+ (minimum set) or 150+ (liberal)
ls ~/.claude/agents/Jenny.md     # custom reviewer agent (if using BOARD)
ls ~/.claude/agents/karen.md

# Skills
ls ~/.claude/skills/ | wc -l     # should be 40+

# Plugins
cat ~/.claude/plugins/installed_plugins.json | grep claude-mem

# MCPs (open Claude Code and check `/mcp` — should list aidesigner,
# playwright-1 through playwright-10, mcp-search)

# Sync tool
/path/to/auto-claude/bin/auto-claude version
/path/to/auto-claude/bin/auto-claude --help
```

---

## 9. Known gotchas

- **Playwright MCP `browser_close` kills the MCP instance for subsequent agents.** This is enforced by always-on rule #5 in CLAUDE.md. If you see swarm tests mysteriously fail mid-batch, check for rogue `browser_close` calls.
- **Railway cache pollution during `auto-claude sync`.** The sync tool's `ensure_source_cache` runs `git fetch --all` which overwrites local test refs in `~/.cache/auto-claude/source.git`. If you're testing sync against a local branch, push it to the mirror after each fetch.
- **Claude Code settings.json is shared across all projects.** Hooks, enabled plugins, and global permissions apply everywhere. Per-project overrides go in the project's `.claude/settings.local.json` if one is configured.
- **`~/.claude.json` contains per-project MCP configs + auth tokens.** Don't commit it, don't copy it between machines naively.
- **`domain-mcp` stores the Dynadot API key in args.** If you dump MCP configs in logs or screenshots, redact it.

---

## 10. Updating this document

This file is part of the brain (`command-center/setup-tools/install.md`) and ships with auto-claude releases. When a new external dependency is added to the brain (e.g., a new MCP server, a new required skill):

1. Install it on the reference system
2. Add a section here with install command + verification step
3. If the brain now references it, update `CLAUDE.md` or the relevant rule file
4. Bump `command-center/VERSION` + add CHANGELOG entry flagging new setup requirement
5. Tag the release

Consumers on older versions can continue to run without the new dependency until they sync to the version that requires it — at which point the CHANGELOG entry's `Consumer sync` section must call out the new install step.
