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

# AgentMail CLI — REQUIRED for danger-builder mode. Persistent inboxes,
# threads, drafts, and two-way messaging. ceo-agent sends per-decision
# emails and reads founder replies here. See:
# https://github.com/agentmail-to/agentmail-cli
npm install -g agentmail-cli

# Resend CLI — OPTIONAL, product-scope. For transactional user-facing emails
# the PRODUCT sends to its users (signup verification, password reset, deploy
# alerts). Not used by danger-builder or any brain management flow; projects
# install this only if the product they're building needs stateless one-shot
# email delivery.
npm install -g resend-cli

# RTK (Rust Token Killer) — transparent CLI proxy, 60-90% token savings on dev operations.
# Installed at ~/.local/bin/rtk with a Bash PreToolUse hook rewriting commands.
# See: https://github.com/memphyssk/rtk (or wherever your copy lives)
# After install, verify: `rtk --version` and `rtk gain`
```

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

### AgentMail — custom domain + ceo-agent inbox setup

One-time setup per domain per AgentMail organization. Wires a custom domain into AgentMail so ceo-agent sends from `ceo@<your-domain>` instead of the shared `@agentmail.to` sandbox. Required before `danger-builder` mode can activate.

Typical elapsed time: 5-60 min (bounded by DNS propagation, not your effort). Steps reference `claudomat.dev` (auto-claude's own reference domain) as the example; swap in yours.

#### Prerequisites for this sub-section
- Domain registered and controlled by you (any registrar, any nameservers you can edit)
- AgentMail CLI installed + `AGENTMAIL_API_KEY` env var set (section above)
- DNS-write capability — dashboard access at your registrar, or an API-key-driven tool (e.g. the auto-claude `domain-mcp` for Dynadot domains, or direct `api3.json` calls)

#### Step 1 — Register the domain at AgentMail

```bash
agentmail --format json domains create --domain claudomat.dev --feedback-enabled
```

`--feedback-enabled` routes bounce and complaint notifications to inboxes on this domain (recommended).

Response includes `domain_id`, `status` (starts `NOT_STARTED` → transitions to `PENDING` after first verify → `VERIFIED` once DNS propagates), `dkim_selector` (typically `agentmail`), and a `records[]` array with the exact DNS records to apply. 5 records total: 2 MX, 3 TXT.

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

Purpose: `agentmail._domainkey` TXT (DKIM signs outgoing) / `@` MX (inbound routes replies to ceo@ inbox) / `mail.<domain>` MX (SES bounce feedback) / `mail.<domain>` TXT (SPF) / `_dmarc` TXT (DMARC reject policy).

#### Step 2 — Apply DNS records at your registrar

**Option A — Dynadot direct API call** (recommended for Dynadot domains — the `domain-mcp` tool has a gap where it doesn't translate `priority` → Dynadot's `distance` field, so MX records fail via MCP):

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

**`set_dns2` is destructive** — replaces ALL records for the domain. If you have pre-existing records (homepage A record, other services), include them in the same call. Query first via `curl ...?command=get_dns` or `mcp__domain-mcp__dns` get.

**Dynadot record types must be lowercase** (`mx`, `txt`, `a`, `cname`) — uppercase rejects with "invalid record type". Noted in `command-center/rules/dev-principles.md`.

**Option B — registrar dashboard** (any registrar): add each record from Step 1's `records[]` array through the DNS panel. Field naming varies: Host/Name = `name`, Type = MX/TXT, Value = `value`, Priority/Distance = 10 (MX only), TTL = 3600.

#### Step 3 — Verify propagation externally before asking AgentMail

```bash
dig +short NS  claudomat.dev @8.8.8.8                                  # nameservers
dig +short MX  claudomat.dev @1.1.1.1                                  # apex MX
dig +short TXT agentmail._domainkey.claudomat.dev @1.1.1.1 | head -1   # DKIM
dig +short MX  mail.claudomat.dev @1.1.1.1                             # feedback MX
dig +short TXT mail.claudomat.dev @1.1.1.1                             # SPF
dig +short TXT _dmarc.claudomat.dev @1.1.1.1                           # DMARC
```

Empty result = not propagated yet. Typical propagation to `1.1.1.1` / `8.8.8.8`: 5-15 min; slower ISPs up to 1 hour. **Don't trigger AgentMail verify until all 6 dig commands return expected values** — premature verify consumes rate-limited retry attempts.

If in doubt, query the authoritative nameserver directly (e.g. `dig ... @ns1.dyna-ns.net`) to confirm records are set correctly, regardless of public caching.

#### Step 4 — Trigger AgentMail verification

```bash
agentmail --format json domains verify --domain-id claudomat.dev
sleep 30
agentmail --format json domains get --domain-id claudomat.dev | head -40
```

Target state: `status: VERIFIED` with every `records[].status: VALID`.

Transitional states:
- `VERIFYING` — AgentMail is re-checking DNS; usually resolves in 1-3 min
- `PENDING` with `records[].status: MISSING` — DNS not yet visible to AgentMail's resolver; wait 5 min, retry verify
- `FAILED` — records don't match what AgentMail expects; re-check Step 2 values against Step 1 response

Retry verify at 5-min intervals, not faster.

#### Step 5 — Create the ceo-agent inbox

Once `status: VERIFIED`:

```bash
agentmail --format json inboxes create \
  --username ceo \
  --domain claudomat.dev \
  --display-name "ceo-agent" \
  --client-id "auto-claude-ceo-agent"
```

Capture `inbox_id` from the response — save as `CEO_INBOX_ID` env var.

**Display-name restriction:** AgentMail rejects `<`, `@`, `>`. Use plain text. Don't try `"ceo-agent <ceo@claudomat.dev>"`.

#### Step 6 — Export env vars for danger-builder

Append to `~/.bashrc`:

```bash
# AgentMail — management email for danger-builder
export AGENTMAIL_API_KEY=am_us_xxxxxxxxxxxx
export CEO_INBOX_ID=inb_xxxxxxxxxxxx           # from Step 5 response
export CEO_NOTIFY_EMAIL_TO=you@example.com     # the human who receives + replies
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

Within ~1 min you receive the email at `$CEO_NOTIFY_EMAIL_TO`. Reply from your founder inbox, wait ~30 sec, then:

```bash
agentmail --format json inboxes:threads list --inbox-id "$CEO_INBOX_ID" --label unread
```

Your reply appearing = two-way flow is working. Domain is ready for `danger-builder` activation.

#### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Domain not verified" on inbox create | Step 4 didn't reach `VERIFIED` | Wait for propagation, re-run verify |
| "Display name contains invalid character(s)" | `<`, `@`, `>` in display name | Use plain text |
| Dynadot "invalid record type" | Types uppercase | Use lowercase (`mx` not `MX`) |
| Dynadot "Please enter a distance for this mail host" | MCP tool doesn't pass priority | Use direct `api3.json` curl per Option A |
| DNS propagates to `8.8.8.8` but not your ISP | Stale negative-cache at ISP | Test with `1.1.1.1` or `8.8.8.8`; AgentMail verifier uses global resolvers |
| Verify stuck `PENDING` >1 hour after propagation | AgentMail re-check cached failure | Delete + re-create the domain (Step 1 is idempotent) |

### Resend CLI — one-time auth (product-scope only, optional)

Skip this subsection entirely if your project doesn't send transactional user-facing emails. Resend is NOT used by any brain management flow — ceo-agent, BOARD, and danger-builder all use AgentMail.

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

**The `RESEND_API_KEY` env var overrides saved credentials if set.** Setting the env var at machine scope (e.g. in `~/.bashrc`) is the simplest path when the key needs to be available to product code.

**Note on `resend login` without a flag:** the command fails in non-TTY shells (headless SSH, CI, agent sessions) with `missing_key`. Always pass `--key re_xxx` in those contexts. The interactive form assumes a local browser is available.

After installing, verify each:
```bash
which task-master playwright-mcp domain-mcp netlify railway agentmail resend rtk gh
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
