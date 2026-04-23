# setup-tools

External tooling setup for auto-claude projects. The brain at `command-center/` is only half the system — the other half is the Claude Code agents, skills, MCP servers, and supporting CLIs installed at the user / machine level.

## Files

- [`install.md`](./install.md) — canonical installation guide. Lists every external dependency the brain expects (CLIs, agents, skills, MCPs, plugins), with install commands, configuration snippets, and verification steps.

## When to consult this directory

- **Setting up a new VPS or dev machine** to run auto-claude projects
- **Onboarding a new team member** who needs the same tooling baseline
- **Diagnosing "skill not found" or "MCP not available" errors** during wave execution — `install.md` §8 has the verification checklist
- **Adding a new external dependency to the brain** — section 10 of `install.md` covers the update workflow

## How this directory is maintained

Hand-authored. Unlike `product/` or `artifacts/` which are populated by onboarding/rituals, `setup-tools/` is a reference document the brain author updates when the external tooling surface changes. Consumers pull updates via `auto-claude sync` like any other brain content.
