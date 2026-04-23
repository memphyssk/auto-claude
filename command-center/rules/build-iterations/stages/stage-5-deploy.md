# Stage 5 — Deploy + CI Watch

## Purpose
Get the code into production via PR → CI → auto-deploy pipeline.

## Prerequisites
- Stage 4b review passed (lint, typecheck, test, build all green)

## CI/CD Monitoring Tool Chain

Use this order of preference for monitoring each platform. CLI is always preferred over MCP — MCP is a fallback only when CLI is unavailable or broken.

| Platform | Primary tool | Fallback |
|----------|-------------|----------|
| GitHub CI | `gh` CLI (`gh pr checks`, `gh run watch`, `gh run view --log-failed`) | `mcp__github__*` |
| Netlify | `netlify` CLI (`netlify api listSiteDeploys`, `netlify api getEnvVar`) | `mcp__claude_ai_Netlify__*` |
| Railway | Railway MCP (`mcp__Railway__list-deployments`, `mcp__Railway__get-logs`) | Railway dashboard via Playwright |

## Actions

1. Create feature branch (if not already on one)
2. `git add` changed files + `git commit` with conventional message
3. `git push -u origin <branch>`
4. `gh pr create` with summary, test plan
5. Watch CI run: `gh run watch <id> --exit-status`
6. If CI fails: fix, push, re-watch
7. If CI passes: `gh pr merge --squash --delete-branch`
8. `git checkout main && git pull`
9. Monitor ALL THREE deploy targets (see verification below)

### Never push directly to main

All code changes go through PRs so GitHub CI gates run. Direct pushes bypass CI entirely, which has caused multiple "code shipped but was never checked" incidents. The only exception: doc-only changes that don't affect build (Planning/*.md, CLAUDE.md).

### Never skip CI/CD failures

If ANY gate fails, the wave stops until it's fixed. Specific rules:
- **GitHub CI fails** → fix and re-push. Do NOT merge with failed checks. Do NOT push to Railway or Netlify as a workaround.
- **Netlify build fails** → check build logs via `netlify api listSiteDeploys`. Do NOT assume "it'll work next time." Common blockers: secrets scanner, missing env vars, stale ISR cache.
- **Railway deploy fails/skips** → check via `mcp__Railway__list-deployments`. SKIPPED means Railway deprioritized the build (NOT that the code shipped). Verify with health endpoint uptime.
- A green GitHub CI does NOT mean Netlify built or Railway deployed. Each platform has independent failure modes.

### Post-merge: verify ALL THREE deploy targets

After PR merge, confirm each platform received the code:

**1. GitHub CI** (already verified by PR checks)
```bash
gh pr checks <number>   # all must be pass
```

**2. Netlify production deploy**
```bash
netlify api listSiteDeploys --data '{"site_id":"<id>","per_page":"3"}'
# Latest deploy must show: state=ready, commit_ref=<merged commit>
# If state=error: check error_message, fix, and retrigger
```

**3. Railway deploy**
```bash
# Via MCP:
mcp__Railway__list-deployments  # Latest must show SUCCESS, not SKIPPED
# Verify with health endpoint:
curl https://api.<your-domain>/api/v1/health  # uptime < 300s = fresh deploy
```

Only proceed to Stage 5b when ALL THREE show the merged commit is live.

### Deploy-race detection
Before moving to Stage 5b/Stage 6, verify Railway deploy is complete:
- Curl API health endpoint
- Verify uptime < 300s (fresh deploy) or response includes matching commit SHA
- If uptime > 300s: Railway did not redeploy. Check deploy status, force-deploy if needed.

### Async deploy under full-autonomy — use Spawn-and-Block

Under `mode: full-autonomy`, if any of the three deploy targets is still in-progress when you finish the post-merge verification loop (e.g., Railway queued, Netlify building, GitHub CI still running), you MUST NOT end the turn with "deploy will land later" — that's the banned anti-pattern. Instead, create a `MONITOR:` task per `command-center/rules/monitors/monitor-principles.md`, using the platform-specific template in that directory (`railway-deploy.md`, `netlify-deploy.md`, `gh-actions.md`). The monitor's three conditions (success, failure, timeout) MUST all be declared — a monitor with only a success check will sit forever on a failed deploy.

## Deliverable
- Merged PR on main
- CI green
- All three deploy targets confirmed serving merged code

## Exit criteria
- PR merged to main
- GitHub CI passed
- Netlify deploy state=ready for merged commit
- Railway deploy state=SUCCESS with uptime < 300s
- No platform showing SKIPPED, FAILED, or stale code

## Next
→ Return to `../wave-loop.md` → Stage 5b
