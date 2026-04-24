# Setup Tools — Installation Guide

The auto-claude brain expects a specific tooling environment. This document lists everything installed on a working auto-claude system, with install commands and links, so you can bootstrap a fresh machine to the same baseline.

**Scope:** tooling that sits *outside* the brain files themselves — Claude Code agents, skills, MCP servers, plugins, and supporting CLIs. The brain at `command-center/` is pulled via `auto-claude sync` (see [README.md](../../README.md) § Keeping the brain in sync).

**When to run:** before starting the onboarding loop on a new machine. If you're onboarding a project on an already-configured machine, skip straight to [section 7](#7-project-bootstrap--bringing-a-new-project-onto-auto-claude).

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

```bash
# TaskMaster — canonical task tracking system
npm install -g task-master-ai

# Playwright MCP — browser automation for Stage 6 + /qa + /browse
npm install -g @playwright/mcp

# Domain MCP — domain registration + DNS ops (optional; Dynadot only)
npm install -g domain-mcp

# Netlify CLI — needed if you deploy to Netlify
npm install -g netlify-cli

# Railway CLI — needed if you deploy to Railway
bash <(curl -fsSL cli.new)

# AgentMail CLI — REQUIRED for danger-builder mode. Persistent inboxes,
# threads, drafts, and two-way messaging for ceo-agent.
# https://github.com/agentmail-to/agentmail-cli
npm install -g agentmail-cli

# Resend CLI — OPTIONAL, product-scope only. For transactional user-facing
# emails the product sends to its users. Not used by danger-builder or any
# brain management flow.
npm install -g resend-cli

# RTK (Rust Token Killer) — transparent CLI proxy, 60-90% token savings.
# Installed at ~/.local/bin/rtk with a Bash PreToolUse hook.
# See: https://github.com/memphyssk/rtk
# Verify: `rtk --version` and `rtk gain`
```

Verify all installed:
```bash
which task-master playwright-mcp domain-mcp netlify railway agentmail resend rtk gh
```

### AgentMail CLI — one-time auth

```bash
# Get a key from: https://agentmail.to
export AGENTMAIL_API_KEY=am_us_xxxxxxxxxxxx

# Verify — lists your inboxes as JSON
agentmail --format json inboxes list
```

Persist the export to `~/.bashrc`. The CLI also accepts `--api-key am_us_...` per-invocation for CI use.

### AgentMail — custom domain + ceo-agent inbox setup

One-time setup per domain. Wires a custom domain into AgentMail so ceo-agent sends from `ceo@<your-domain>`. Required before `danger-builder` mode can activate.

Typical elapsed time: 5–60 min (bounded by DNS propagation).

#### Prerequisites
- Domain registered and controlled by you (any registrar)
- AgentMail CLI installed + `AGENTMAIL_API_KEY` set
- DNS write access at your registrar

#### Step 1 — Register the domain at AgentMail

```bash
agentmail --format json domains create --domain claudomat.dev --feedback-enabled
```

Response includes `domain_id`, `status`, `dkim_selector`, and a `records[]` array with 5 DNS records to apply (2 MX, 3 TXT).

```json
{
  "records": [
    { "type": "TXT", "name": "agentmail._domainkey", "value": "v=DKIM1; k=rsa; p=MIIBIj..." },
    { "type": "MX",  "name": "@",     "value": "inbound-smtp.us-east-1.amazonaws.com",   "priority": 10 },
    { "type": "MX",  "name": "mail",  "value": "feedback-smtp.us-east-1.amazonses.com",  "priority": 10 },
    { "type": "TXT", "name": "mail",  "value": "v=spf1 include:amazonses.com -all" },
    { "type": "TXT", "name": "_dmarc","value": "v=DMARC1; p=reject; rua=mailto:dmarc@claudomat.dev" }
  ]
}
```

#### Step 2 — Apply DNS records at your registrar

**Option A — Dynadot direct API call** (recommended for Dynadot domains — `domain-mcp` doesn't translate `priority` → Dynadot's `distance` field, so MX records fail via MCP):

```bash
DYNADOT_KEY=$YOUR_DYNADOT_API_KEY
DOMAIN=claudomat.dev
DKIM='v=DKIM1; k=rsa; p=MIIBIj...'      # from Step 1 response

curl -sG 'https://api.dynadot.com/api3.json' \
  --data-urlencode "key=$DYNADOT_KEY" \
  --data-urlencode 'command=set_dns2' \
  --data-urlencode "domain=$DOMAIN" \
  --data-urlencode 'main_record_type0=mx' \
  --data-urlencode 'main_record0=inbound-smtp.us-east-1.amazonaws.com' \
  --data-urlencode 'main_recordx0=10' \
  --data-urlencode 'subdomain0=agentmail._domainkey' \
  --data-urlencode 'sub_record_type0=txt' \
  --data-urlencode "sub_record0=$DKIM" \
  --data-urlencode 'subdomain1=mail' \
  --data-urlencode 'sub_record_type1=mx' \
  --data-urlencode 'sub_record1=feedback-smtp.us-east-1.amazonses.com' \
  --data-urlencode 'sub_recordx1=10' \
  --data-urlencode 'subdomain2=mail' \
  --data-urlencode 'sub_record_type2=txt' \
  --data-urlencode 'sub_record2=v=spf1 include:amazonses.com -all' \
  --data-urlencode 'subdomain3=_dmarc' \
  --data-urlencode 'sub_record_type3=txt' \
  --data-urlencode "sub_record3=v=DMARC1; p=reject; rua=mailto:dmarc@$DOMAIN" \
  --data-urlencode 'ttl=3600'
# Expect: {"SetDnsResponse":{"ResponseCode":0,"Status":"success"}}
```

**`set_dns2` is destructive** — replaces ALL records for the domain. Query existing records first via `curl ...?command=get_dns`. Record types must be lowercase (`mx`, `txt`) — uppercase rejects with "invalid record type".

**Option B — registrar dashboard** (any registrar): add each record from Step 1's `records[]` array. Field naming varies: Host/Name = `name`, Type = MX/TXT, Value = `value`, Priority = 10 (MX only), TTL = 3600.

#### Step 3 — Verify propagation

```bash
dig +short MX  claudomat.dev @1.1.1.1
dig +short TXT agentmail._domainkey.claudomat.dev @1.1.1.1 | head -1
dig +short MX  mail.claudomat.dev @1.1.1.1
dig +short TXT mail.claudomat.dev @1.1.1.1
dig +short TXT _dmarc.claudomat.dev @1.1.1.1
```

Empty result = not propagated. Don't trigger AgentMail verify until all 5 commands return values — premature verify burns rate-limited retry attempts. Typical propagation to `1.1.1.1` / `8.8.8.8`: 5–15 min; up to 1 hour on slow ISPs.

#### Step 4 — Trigger AgentMail verification

```bash
agentmail --format json domains verify --domain-id claudomat.dev
sleep 30
agentmail --format json domains get --domain-id claudomat.dev | head -40
```

Target state: `status: VERIFIED` with every `records[].status: VALID`. Retry at 5-min intervals if stuck in `VERIFYING` or `PENDING`.

#### Step 5 — Create the ceo-agent inbox

```bash
agentmail --format json inboxes create \
  --username ceo \
  --domain claudomat.dev \
  --display-name "ceo-agent" \
  --client-id "auto-claude-ceo-agent"
```

Capture `inbox_id` → save as `CEO_INBOX_ID`. **Display name must be plain text** — AgentMail rejects `<`, `@`, `>`.

#### Step 6 — Export env vars for danger-builder

Append to `~/.bashrc`:

```bash
export AGENTMAIL_API_KEY=am_us_xxxxxxxxxxxx
export CEO_INBOX_ID=inb_xxxxxxxxxxxx           # from Step 5 response
export CEO_NOTIFY_EMAIL_TO=you@example.com
export CEO_NOTIFY_PROJECT_NAME="my-project"    # optional; shows in subject lines
```

#### Step 7 — End-to-end test

```bash
agentmail --format json inboxes:messages send \
  --inbox-id "$CEO_INBOX_ID" \
  --to "$CEO_NOTIFY_EMAIL_TO" \
  --subject "[ceo-agent] setup test — please ignore" \
  --text "Setup test. Reply 'ok' to confirm two-way flow."
```

After ~1 min you receive the email. Reply, wait ~30 sec, then:

```bash
agentmail --format json inboxes:threads list --inbox-id "$CEO_INBOX_ID" --label unread
```

Your reply appearing = two-way flow is working. Domain ready for `danger-builder`.

#### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Domain not verified" on inbox create | Step 4 didn't reach `VERIFIED` | Wait for propagation, re-run verify |
| "Display name contains invalid character(s)" | `<`, `@`, `>` in display name | Use plain text |
| Dynadot "invalid record type" | Types uppercase | Use lowercase (`mx` not `MX`) |
| Dynadot "Please enter a distance for this mail host" | MCP tool doesn't pass priority | Use direct `api3.json` curl per Option A |
| Verify stuck `PENDING` >1 hour after propagation | AgentMail re-check cached failure | Delete + re-create the domain (Step 1 is idempotent) |

### Resend CLI — one-time auth (product-scope only, optional)

Skip if your project doesn't send transactional user-facing emails. Not used by any brain management flow.

```bash
# Non-interactive (recommended for headless VPS)
resend login --key re_xxxxxxxxxxxx

# Verify
resend doctor            # JSON report: API key valid, domain status, version
```

**`resend login` without `--key` fails in non-TTY shells.** Always pass `--key re_xxx` in headless/CI contexts.

The `RESEND_API_KEY` env var overrides saved credentials if set.

---

## 2. Claude Code Agents — three sources

The brain references ~20 sub-agents by name. They come from three sources. Install in order; later sources override earlier ones on name collision.

### 2a. gstack (agents + skills together)

Source: <https://github.com/garrytan/gstack>

gstack bundles agents and skills together. Install it first — it provides the majority of skills referenced in [section 3a](#3a-gstack-skills).

```bash
git clone https://github.com/garrytan/gstack ~/.cache/gstack
cd ~/.cache/gstack
# Run the gstack installer (follow repo README)
```

Verify:
```bash
ls ~/.claude/skills/gstack/SKILL.md
ls ~/.claude/skills/browse ~/.claude/skills/qa ~/.claude/skills/ship
```

### 2b. VoltAgent sub-agents

Source: <https://github.com/VoltAgent/awesome-claude-code-subagents>

Generic dev-role agents (backend-developer, frontend-developer, react-specialist, etc.). The brain spawns these at Stage 4 execution and for BOARD reviewers.

Minimum required set:
```
architect-reviewer          backend-developer           frontend-developer
nextjs-developer            react-specialist            refactoring-specialist
security-engineer           websocket-engineer          database-optimizer
ui-designer                 ui-comprehensive-tester     knowledge-synthesizer
technical-writer            product-manager             competitive-analyst
ux-researcher               risk-manager                ceo-reviewer
problem-framer              claude-md-compliance-checker
```

Install via agent-installer (if available) or manually:
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

Liberal install (all agents): copy the whole `categories/*/` tree into `~/.claude/agents/`. Unused agents cost nothing at rest.

### 2c. DarcyEGB agents

Source: <https://github.com/darcyegb/ClaudeCodeAgents>

Supplementary agents covering roles VoltAgent doesn't. Optional expansion pack.

```bash
git clone https://github.com/darcyegb/ClaudeCodeAgents ~/.cache/darcyegb-agents
find ~/.cache/darcyegb-agents -name '*.md' -not -path '*/.*' -exec cp {} ~/.claude/agents/ \;
```

If a DarcyEGB agent has the same filename as a VoltAgent one, the later install wins. Rename before copying to preserve a specific version.

After all three installs:
```bash
ls ~/.claude/agents/ | wc -l       # expect 100+
ls ~/.claude/agents/Jenny.md ~/.claude/agents/karen.md 2>&1   # reviewer agents
```

---

## 2d. auto-claude bundled skills (install once from the repo)

auto-claude ships one bundled skill:

- **`/update-tools`** — verifies this install.md and prompts per item to install what's missing. Prints JSON fragments for MCPs rather than editing config silently.

Install by symlink (updates propagate on `auto-claude sync`):

```bash
mkdir -p ~/.claude/skills
ln -s /path/to/auto-claude/command-center/setup-tools/skills/update-tools \
      ~/.claude/skills/update-tools
```

After install, invoke as `/update-tools`. Wired into onboarding v0 as the prerequisite check.

See [`skills/README.md`](./skills/README.md) for details.

---

## 3. Claude Code Skills

Skills live at `~/.claude/skills/`. The brain references these via `/skill-name` invocations.

### 3a. gstack skills

Installed alongside gstack in [section 2a](#2a-gstack-agents--skills-together).

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
/unfreeze               /browse                 /open-gstack-browser
/canary                 /benchmark              /codex
/setup-deploy           /setup-browser-cookies
```

Verify: `ls ~/.claude/skills/` shows all the above directories. Each should contain a `SKILL.md` file.

### 3b. Stand-alone skills

- `/make-pdf` — markdown → publication-quality PDF
- `/continuous-agent-loop` — patterns for autonomous agent loops (used by full-autonomy mode)
- `/benchmark-models` — cross-model benchmark harness (Claude vs GPT via Codex CLI vs Gemini)

### 3c. claude-mem plugin skills

Registered when `claude-mem` is installed (see [section 4](#4-plugins)):
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

```bash
claude plugin marketplace add github:thedotmack/claude-mem
claude plugin install claude-mem@thedotmack
```

Or manually edit `~/.claude/settings.json`:
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

Restart Claude Code. Verify: `ls ~/.claude/plugins/cache/thedotmack/claude-mem/`.

Required because:
- Provides the `mcp-search` MCP server (section 5c)
- Powers `/mem-search` and related memory skills
- The brain's founder-proxy BOARD member reads claude-mem memory to simulate founder voice — without it, founder-proxy always emits `HARD-STOP: no founder precedent in memory`

---

## 5. MCP Servers

MCPs are configured at user scope (`~/.mcp.json`, `~/.claude.json`) or per-project via `.mcp.json` in the project root.

### 5a. aidesigner (HTTP) — design generation

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

Authentication: browser-based sign-in on first use. No API key needed in config.

Used by: onboarding Stage v7/v8, the `aidesigner-frontend` skill, and `/design-html`.

### 5b. Playwright (stdio × 10 parallel instances)

The brain's Stage 6 Playwright swarm runs up to 5 parallel testers; 10 instances gives comfortable headroom.

```json
{
  "mcpServers": {
    "playwright-1":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-2":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-3":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-4":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-5":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-6":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-7":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-8":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-9":  { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} },
    "playwright-10": { "type": "stdio", "command": "playwright-mcp", "args": ["--isolated"], "env": {} }
  }
}
```

`--isolated` gives each instance its own browser context — critical for parallelism without state leakage. Requires `playwright-mcp` on `$PATH` (section 1).

### 5c. mcp-search (stdio, via claude-mem plugin)

Automatically registered when `claude-mem` is installed (section 4a). No manual config needed.

### 5d. domain-mcp (optional, stdio)

Only if you register domains via Dynadot:
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

**Security note:** for a cleaner approach, export `DYNADOT_API_KEY` in your shell and use `{ "command": "domain-mcp", "env": {} }` — most MCP runners honor the parent process's env. Do not commit config files with a real key.

---

## 6. Shell configuration

### 6a. settings.json hooks

Wire `rtk` via `~/.claude/settings.json` to intercept Bash tool invocations for token-efficient output:

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

Install section 1's `rtk` first, then add this hook.

### 6b. SSH keep-alive (for long-running sessions)

**Server** (`/etc/ssh/sshd_config.d/keepalive.conf`):
```
ClientAliveInterval 60
ClientAliveCountMax 10
```
Restart: `systemctl restart ssh`.

**Client** (`~/.ssh/config`):
```
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 10
    TCPKeepAlive yes
```

### 6c. tmux + tmux-resurrect + tmux-continuum (persistent sessions)

For VPS work where SSH connections drop: run Claude Code inside tmux. tmux-resurrect saves/restores panes; tmux-continuum auto-saves every 15 min.

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

cat >> ~/.tmux.conf <<'EOF'
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @continuum-restore 'on'
set -g @continuum-save-interval '15'
run '~/.tmux/plugins/tpm/tpm'
EOF

# Inside tmux, install plugins: press Ctrl-b then I
```

---

## 7. Project bootstrap — bringing a new project onto auto-claude

Once all the above is installed, each new project onboards as follows:

```bash
# 1. Create the project repo + init git
mkdir my-new-project && cd my-new-project && git init

# 2. Install TaskMaster for this project
npx task-master init

# 3. Install the brain — pin to a specific auto-claude release
/path/to/auto-claude/bin/auto-claude init --version=v0.24.0

# 4. Review the generated .brainignore and adjust for project-local paths
$EDITOR .brainignore

# 5. Commit the sync infrastructure
git add .brainignore command-center/.brain-version command-center/.brain-snapshot/ \
        command-center/ CLAUDE.md design/
git commit -m "chore: bootstrap auto-claude brain"

# 6. Start the onboarding loop
# Open Claude Code in the project and tell it:
#   "Start a new project" (and provide your founder docs)
# This triggers the 13-stage onboarding in command-center/rules/onboarding/
```

After v11 handoff, the project is seeded: vision, competitors, scope, stack, architecture, design system, TaskMaster queue, first CI. The wave loop takes over from there.

---

## 8. Verification checklist

Run on a freshly bootstrapped machine:

```bash
# Tooling
claude --version
node --version            # 20+
pnpm --version
gh --version
task-master --version
playwright-mcp --version
agentmail --version
agentmail --format json inboxes list  # lists inboxes if AGENTMAIL_API_KEY is set
rtk --version
rtk gain

# Agents
ls ~/.claude/agents/ | wc -l     # expect 100+ after all three installs
ls ~/.claude/agents/Jenny.md
ls ~/.claude/agents/karen.md

# Skills
ls ~/.claude/skills/ | wc -l     # should be 40+

# Plugins
cat ~/.claude/plugins/installed_plugins.json | grep claude-mem

# MCPs — open Claude Code and run /mcp; should list:
# aidesigner, playwright-1 through playwright-10, mcp-search

# Sync tool
/path/to/auto-claude/bin/auto-claude version
/path/to/auto-claude/bin/auto-claude --help
```

---

## 9. Known gotchas

- **Playwright MCP `browser_close` kills the MCP instance for subsequent agents.** Enforced by always-on rule #5 in CLAUDE.md. If swarm tests fail mid-batch, check for rogue `browser_close` calls.
- **Sync cache pollution during `auto-claude sync`.** `ensure_source_cache` runs `git fetch --all` which overwrites local test refs in `~/.cache/auto-claude/source.git`. Push local branches to the mirror after each fetch when testing against a local branch.
- **Claude Code settings.json is shared across all projects.** Per-project overrides go in `.claude/settings.local.json`.
- **`~/.claude.json` contains per-project MCP configs + auth tokens.** Don't commit it or copy it between machines naively.
- **`domain-mcp` stores the Dynadot API key in args.** Redact it from logs and screenshots.
- **Agent name collisions across the three sources.** The last install wins. Verify after all three installs: `head -20 ~/.claude/agents/backend-developer.md`.

---

## 10. Updating this document

When a new external dependency is added to the brain:

1. Install it on the reference system
2. Add a section here with install command + verification step
3. If the brain now references it, update `CLAUDE.md` or the relevant rule file
4. Bump `command-center/VERSION` + add CHANGELOG entry flagging new setup requirement
5. Tag the release

Consumers on older versions can continue without the new dependency until they sync to the version that requires it — at which point the CHANGELOG entry's `Consumer sync` section must call out the new install step.
