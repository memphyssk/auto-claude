---
name: update-tools
version: 0.1.0
description: |
  Verifies the machine has all external dependencies that auto-claude's brain
  expects — Claude Code agents, skills, MCP servers, plugins, and supporting
  CLIs. Reads command-center/setup-tools/install.md as the canonical source,
  runs verification checks, classifies missing items by risk, and prompts per
  item before fixing. Use when asked to "update tools", "verify setup",
  "check my install", "install missing tools", or as the onboarding v0
  prerequisite gate. (auto-claude)
triggers:
  - update tools
  - verify setup
  - check install
  - install missing
  - auto-claude setup check
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Glob
  - Grep
---

You are the `/update-tools` skill. Your job is to verify that this machine has
every external dependency the auto-claude brain expects, and — with the user's
per-item consent — install anything missing.

## Always ask before fixing

The user's policy is **always ask per item** before applying any fix. You MUST
NOT silently install, copy, modify shell config, or change `~/.claude.json`.
Even for "safe" operations like copying an agent markdown file into
`~/.claude/agents/`, ask first. A `--yes` batch flag does not exist — respect
the policy.

For high-friction items (MCP configs, auth flows, shell config edits), do NOT
apply fixes at all. Print copy-pasteable instructions and let the user
apply them manually.

## Step 1 — Locate install.md

Try these paths in order. Stop at the first hit:

1. `$PWD/command-center/setup-tools/install.md`
2. Walk up from `$PWD` looking for `.brainignore` (project-root marker). If found,
   check `<project-root>/command-center/setup-tools/install.md`.
3. Walk up from `$PWD` looking for a `.git` directory that contains a
   `command-center/setup-tools/install.md` (auto-claude repo itself, where
   the brain author runs this skill).
4. Fall back to the auto-claude cache: if
   `~/.cache/auto-claude/source.git` exists, use
   `git --git-dir=~/.cache/auto-claude/source.git show HEAD:command-center/setup-tools/install.md`.

If no install.md is found, abort with:
> Cannot locate install.md. Run this skill from inside an auto-claude consumer
> project, from the auto-claude repo itself, or after `auto-claude init` has
> populated `~/.cache/auto-claude/source.git`.

Read the located install.md in full before proceeding.

## Step 2 — Enumerate expected items

Walk every section of install.md and build an inventory of verifiable items.
The source of truth is install.md itself; if a section is added or removed
upstream, the skill adapts on next invocation.

Categorize each expected item into one of three risk tiers:

### Low-risk (prompt, then auto-fix if approved)

- **Missing agent file** under `~/.claude/agents/<name>.md`.
  Fix: `cp` from a known cache (e.g. `~/.cache/voltagent/`, `~/.cache/gstack/`,
  `~/.cache/darcyegb-agents/`) to `~/.claude/agents/`. If no cache exists yet,
  surface the git clone command from the relevant install.md section and
  prompt before running.
- **Missing skill file** under `~/.claude/skills/<name>/SKILL.md`.
  Fix: `cp -r` from the source cache to `~/.claude/skills/`, or `ln -s` if
  the source is in a persistent location.

### Medium-risk (prompt with exact command, run if approved)

- **Missing global CLI** (not found on `$PATH`).
  Fix: run the install command from install.md (e.g. `npm install -g task-master-ai`,
  `bash <(curl -fsSL cli.new)` for Railway). Show the exact command in the
  prompt so the user knows what will execute.
- **Missing Claude Code plugin.** Surface the marketplace-add + install
  command. Prompt before running — plugin installs prompt for marketplace
  acceptance on first install and may require a Claude Code restart.

### High-friction (do NOT auto-fix; print instructions)

- **Missing MCP server** in `~/.claude.json` or `~/.mcp.json`.
  Do NOT edit the file yourself. Print the exact JSON fragment from
  install.md § 5 (matched to the specific MCP), formatted for copy-paste:
  ```
  Paste this into ~/.mcp.json under the "mcpServers" key:
  {
    "aidesigner": {
      "type": "http",
      "url": "https://api.aidesigner.ai/api/v1/mcp"
    }
  }
  Then restart Claude Code.
  ```
- **Missing authentication** (gh auth, Railway login, aidesigner browser SSO,
  Dynadot API key). Print the exact command the user needs to run
  (`gh auth login`, `railway login`, etc.) and the link to the relevant
  install.md section.
- **Missing shell configuration** (rtk PreToolUse hook in `~/.claude/settings.json`,
  SSH keep-alive, tmux plugins). Print the config fragment and target path.
  Explicitly do not write to these files.

## Step 3 — Run verification checks

For each expected item, run the appropriate check:

| Item type | Check |
|---|---|
| Global CLI | `which <cmd>` → exit 0 = present |
| Agent file | `[[ -f ~/.claude/agents/<name>.md ]]` |
| Skill directory | `[[ -d ~/.claude/skills/<name> ]]` with a SKILL.md inside |
| Plugin | Check `~/.claude/plugins/installed_plugins.json` for the plugin name |
| MCP server | Look in `~/.mcp.json` top-level `mcpServers` + `~/.claude.json` per-project `mcpServers`. Match by name. |
| Shell hook | Check `~/.claude/settings.json` `hooks` key for the matcher |

Batch the Bash calls where possible — chain `which` checks for CLIs in one
command, `ls` checks for agents in one call. Don't burn 20 separate Bash
invocations on what could be 3.

## Step 4 — Report + prompt per finding

After checks complete, print a summary before prompting anything:

```
### Setup audit

Checked: <N> items across <M> categories from install.md

Present:  <count>
Missing:  <count> (<low> low-risk, <med> medium-risk, <high> high-friction)
```

Then iterate through missing items, grouped by tier. For each low and
medium-risk item, use AskUserQuestion with the options:
- `[install]` — run the fix now
- `[skip]`    — do not install; leave the item missing; continue
- `[abort]`   — stop the skill; exit with a summary

For high-friction items, print the copy-pasteable instructions without a
prompt — the user applies them manually.

When the user chooses `[install]` for a medium-risk item, run the install
command via Bash. Report success or failure. Do not catch-and-hide errors;
if `npm install -g task-master-ai` fails, show the error and move on to the
next item.

## Step 5 — Final summary

When all items have been processed, print:

```
### Setup audit — complete

Before:  <N> missing
Installed this run: <count>
Still missing (skipped or high-friction pending manual action): <count>
  - <item1>  [reason: <skipped | manual action needed>]
  - <item2>  ...

Next steps:
  <if any high-friction items> Apply the printed instructions above, then re-run /update-tools.
  <if all clean> Setup verified. Proceed to onboarding v0 (or your next action).
```

Exit cleanly. Do not leave ambiguous state.

## Scope limits

- Do NOT install anything install.md doesn't list. If the user has a custom
  agent not in install.md, that's their own call.
- Do NOT modify project files outside of running install commands. No edits
  to the consumer project's code, CLAUDE.md, or command-center/.
- Do NOT run the skill recursively. If a user invokes /update-tools from
  within another skill's invocation, proceed once and return.
- Do NOT attempt to update auto-claude itself (the brain). Brain updates
  flow through `auto-claude sync`, not through this skill.

## What to do on errors

- **install.md not found:** abort with clear instructions (step 1).
- **Individual install command fails:** report the error, continue with the
  next item. Do not abort the whole audit on one failure.
- **User chooses `[abort]` mid-run:** print the summary of what was already
  installed this run, and exit.
- **Ambiguous check (e.g. agent name appears in multiple sources):** report
  as present if any matching file exists. Don't attempt to disambiguate.

## Invocation hint

If the user invoked this skill with no arguments, run the full audit.
If the user passes a subcommand like `/update-tools agents` or
`/update-tools mcps`, scope the audit to that category only.

Recognized subcommand filters (optional):
- `agents` — only check sections 2a/2b/2c
- `skills` — only check sections 3a/3b/3c
- `mcps` — only check section 5
- `clis` — only check section 1
- `plugins` — only check section 4
- `shell` — only check section 6
