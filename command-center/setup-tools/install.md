# Setup Tools — Installation Guide

The auto-claude brain expects a specific tooling environment. This document lists everything installed on a working auto-claude system, with install commands and links, so you can bootstrap a fresh machine to the same baseline.

**Scope:** tooling that sits *outside* the brain files themselves — Claude Code agents, skills, MCP servers, plugins, and supporting CLIs. The brain at `command-center/` is pulled via `auto-claude sync` (see [README.md](../../README.md) § Keeping the brain in sync).

**When to run:** **before starting the onboarding loop on a new machine.** Stage v0's prerequisites link here. If you're onboarding a project on an already-configured machine, skip straight to [section 7](#7-project-bootstrap--bringing-a-new-project-onto-auto-claude).

**Audience:** founder or DevOps engineer setting up a new VPS or dev machine. You already have Claude Code installed and working.

**Verified against:** a working system running Claude Code on Linux (Ubuntu 24.04).

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

# Resend CLI — required for danger-builder mode per-decision notifications.
# Can also be used for any other email needs in the project. Auth + send via
# structured commands; agent-friendly JSON output via --json flag.
npm install -g resend-cli

# AgentMail CLI — programmatic email inboxes, threads, and two-way messaging
# designed for AI agents (read-and-reply flows, not just one-shot sends).
# Complements Resend (one-shot outbound notifications) with full inbox state
# so an agent can operate a mailbox end-to-end.
# https://github.com/agentmail-to/agentmail-cli
npm install -g agentmail-cli

# RTK (Rust Token Killer) — transparent CLI proxy, 60-90% token savings on dev operations.
# Installed at ~/.local/bin/rtk with a Bash PreToolUse hook rewriting commands.
# See: https://github.com/memphyssk/rtk (or wherever your copy lives)
# After install, verify: `rtk --version` and `rtk gain`
```

### Resend CLI — one-time auth

After `resend-cli` is installed, authenticate once per machine:

```bash
# Non-interactive (recommended for headless VPS)
resend login --key re_xxxxxxxxxxxx

# Or interactive (opens browser SSO)
resend login

# Verify
resend doctor            # JSON report: API key valid, domain status, version
resend domains list      # Shows your verified sending domains
```

The key is stored in the system credential manager (Keychain / Credential Manager / secret service). For plaintext storage on servers without a credential service, add `--insecure-storage` to the login command.

**The `RESEND_API_KEY` env var overrides saved credentials if set.** For the auto-claude brain, setting the env var at machine scope (e.g. in `~/.bashrc`) is the simplest path — every sub-agent and skill inherits it without needing to know about the credential manager. `resend login` is an alternative for founders who prefer not to expose the key via env.

**Note on `resend login` without a flag:** the command fails in non-TTY shells (headless SSH, CI, agent sessions) with `missing_key`. Always pass `--key re_xxx` in those contexts. The interactive form assumes a local browser is available.

### AgentMail CLI — one-time auth

After `agentmail-cli` is installed, set the API key as an env var (there is no `login` subcommand):

```bash
# Get a key from: https://agentmail.to
export AGENTMAIL_API_KEY=am_us_xxxxxxxxxxxx

# Verify — lists your inboxes as JSON
agentmail --format json inboxes list
```

Persist the export to `~/.bashrc` (or equivalent) so every agent session inherits it. The CLI also accepts `--api-key am_us_...` as a per-invocation flag for ad-hoc overrides or CI use.

Unlike Resend (stateless one-shot sends), AgentMail manages **persistent inboxes + threads + drafts + replies** — appropriate when an agent needs to operate a mailbox end-to-end (read incoming customer messages, reply in thread, maintain conversation state). Resend is the right tool for pushing notifications *out*; AgentMail is the right tool when the agent *is the mailbox*.

After installing, verify each:
```bash
which task-master playwright-mcp domain-mcp netlify railway resend agentmail rtk gh
```

---

## 2. Claude Code Agents — three sources

The brain references ~20 sub-agents by name. They come from three sources, each a separate ecosystem. Install in the order below; later sources may override earlier ones if names collide.

### 2a. gstack (agents + skills together)

Source: <https://github.com/garrytan/gstack>

gstack is a full AI builder framework — agents, skills, and tooling in one install. Primary contribution to the brain is its 30+ skills (see [section 3a](#3a-gstack-skills)) but it also bundles supporting agents.

Install:
```bash
# Follow gstack's README:
# https://github.com/garrytan/gstack#installation
# Typical flow:
git clone https://github.com/garrytan/gstack ~/.cache/gstack
cd ~/.cache/gstack
# Run the gstack installer (follow repo instructions)
```

After install, verify:
```bash
ls ~/.claude/skills/gstack/SKILL.md           # gstack meta-skill exists
ls ~/.claude/skills/browse ~/.claude/skills/qa ~/.claude/skills/ship   # core skills present
```

### 2b. VoltAgent sub-agents

Source: <https://github.com/VoltAgent/awesome-claude-code-subagents>

Generic dev-role agents (backend-developer, frontend-developer, react-specialist, etc.). The brain spawns these at Stage 4 execution and for BOARD reviewers.

Minimum required set for the wave loop + BOARD:
```
architect-reviewer          backend-developer           frontend-developer
nextjs-developer            react-specialist            refactoring-specialist
security-engineer           websocket-engineer          database-optimizer
ui-designer                 ui-comprehensive-tester     knowledge-synthesizer
technical-writer            product-manager             competitive-analyst
ux-researcher               risk-manager                ceo-reviewer
problem-framer              claude-md-compliance-checker
```

Install via the bundled `agent-installer` agent (if you have it):
```
Tell Claude Code: "Use the agent-installer agent to install the following agents from
awesome-claude-code-subagents: architect-reviewer, backend-developer, frontend-developer, ..."
```

Or clone and copy manually:
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

Liberal install (all available agents): copy the whole `categories/*/` tree from the VoltAgent repo into `~/.claude/agents/`. Unused agents cost nothing at rest.

### 2c. DarcyEGB agents

Source: <https://github.com/darcyegb/ClaudeCodeAgents>

Supplementary agents that cover roles VoltAgent doesn't, or provide alternative takes on roles that do overlap. The brain may reference specific DarcyEGB agents in future releases; for now, install them as an optional expansion pack.

Install:
```bash
git clone https://github.com/darcyegb/ClaudeCodeAgents ~/.cache/darcyegb-agents
# Copy agent files into ~/.claude/agents/. Check the repo's README for the
# expected layout — if agents live at the repo root, a flat copy works:
cp ~/.cache/darcyegb-agents/*.md ~/.claude/agents/ 2>/dev/null
# Otherwise, if they are nested in subdirectories by category:
find ~/.cache/darcyegb-agents -name '*.md' -not -path '*/.*' -exec cp {} ~/.claude/agents/ \;
```

If a DarcyEGB agent has the same filename as a VoltAgent one, the later install wins. That's usually fine — DarcyEGB tends to ship more opinionated takes. If you want to preserve the VoltAgent version, rename before copying.

After all three installs:
```bash
ls ~/.claude/agents/ | wc -l       # expect a large number (100+)
ls ~/.claude/agents/Jenny.md ~/.claude/agents/karen.md 2>&1   # verify reviewer agents if you use BOARD
```

---

## 2d. auto-claude bundled skills (install once from the repo)

auto-claude ships its own skills alongside the brain. Currently just one:

- **`/update-tools`** — verifies this very install.md and prompts per item
  to install what's missing. Always asks before fixing; prints JSON
  fragments for MCPs rather than editing config silently.

Install by symlink (recommended — updates propagate on `auto-claude sync`):

```bash
mkdir -p ~/.claude/skills
ln -s /path/to/auto-claude/command-center/setup-tools/skills/update-tools \
      ~/.claude/skills/update-tools
```

Or copy:
```bash
cp -r /path/to/auto-claude/command-center/setup-tools/skills/update-tools \
      ~/.claude/skills/update-tools
```

After install, the skill is invokable as `/update-tools`. It's wired into
onboarding v0 as the prerequisite check — you can also invoke it manually
at any time to audit the machine.

See [`skills/README.md`](./skills/README.md) for details.

---

## 3. Claude Code Skills

Skills live at `~/.claude/skills/`. The brain references these via `/skill-name` invocations in `CLAUDE.md`, `rules/skill-use.md`, and stage files.

### 3a. gstack skills

Installed alongside gstack agents in [section 2a](#2a-gstack-agents--skills-together). The wave loop leans heavily on this skill family.

Brain-referenced skills:
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
- `/continuous-agent-loop` — patterns for autonomous agent loops (used by full-autonomy mode)
- `/benchmark-models` — cross-model benchmark harness (Claude vs GPT via Codex CLI vs Gemini)

### 3c. claude-mem plugin skills

Registered when the `claude-mem` plugin is installed (see [section 4](#4-plugins)):
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
/path/to/auto-claude/bin/auto-claude init --version=v0.6.0

# 4. Review the generated .brainignore and adjust for project-local paths
$EDITOR .brainignore

# 5. Commit the sync infrastructure
git add .brainignore command-center/.brain-version command-center/.brain-snapshot/ \
        command-center/ CLAUDE.md design/
git commit -m "chore: bootstrap auto-claude brain (pinned v0.6.0)"

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
resend --version          # Resend CLI (email delivery for danger-builder)
resend doctor             # JSON report — 'ok': true if key is valid
agentmail --version       # AgentMail CLI (agent-operated inboxes + threads)
agentmail --format json inboxes list  # lists inboxes if AGENTMAIL_API_KEY is set
rtk --version
rtk gain                  # should not error

# Agents (all three sources combined)
ls ~/.claude/agents/ | wc -l     # expect 100+ after all three installs
ls ~/.claude/agents/Jenny.md     # reviewer agent (if using BOARD)
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
- **Sync cache pollution during `auto-claude sync`.** The sync tool's `ensure_source_cache` runs `git fetch --all` which overwrites local test refs in `~/.cache/auto-claude/source.git`. If you're testing sync against a local branch, push it to the mirror after each fetch.
- **Claude Code settings.json is shared across all projects.** Hooks, enabled plugins, and global permissions apply everywhere. Per-project overrides go in the project's `.claude/settings.local.json` if one is configured.
- **`~/.claude.json` contains per-project MCP configs + auth tokens.** Don't commit it, don't copy it between machines naively.
- **`domain-mcp` stores the Dynadot API key in args.** If you dump MCP configs in logs or screenshots, redact it.
- **Agent name collisions across the three sources.** If gstack, VoltAgent, and DarcyEGB all ship a `backend-developer.md`, the last install wins. Verify after all three installs that the agent you expect is the one on disk (`head -20 ~/.claude/agents/backend-developer.md`).

---

## 10. Updating this document

This file is part of the brain (`command-center/setup-tools/install.md`) and ships with auto-claude releases. When a new external dependency is added to the brain (e.g., a new MCP server, a new required skill):

1. Install it on the reference system
2. Add a section here with install command + verification step
3. If the brain now references it, update `CLAUDE.md` or the relevant rule file
4. Bump `command-center/VERSION` + add CHANGELOG entry flagging new setup requirement
5. Tag the release

Consumers on older versions can continue to run without the new dependency until they sync to the version that requires it — at which point the CHANGELOG entry's `Consumer sync` section must call out the new install step.
