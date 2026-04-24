# Stage 5b — Post-Deploy QA

## Purpose
Quick smoke test on the live deploy before the full Playwright swarm. Catches crashes, broken redirects, missing data that CI cannot detect.

## Prerequisites
- Stage 5 deploy complete (PR merged, ALL THREE platforms confirmed)

## Actions

### 1. Verify deploys actually landed (MANDATORY before any smoke tests)

**Railway:**
- Check uptime: `curl https://api.<your-domain>/api/v1/health` → uptime must be < 300s since merge
- If uptime > 300s: Railway did not redeploy. Do NOT proceed — investigate deploy status first.

**Netlify:**
- Check latest deploy: `netlify api listSiteDeploys --data '{"site_id":"<id>","per_page":"1"}'`
- Confirm `commit_ref` matches the merged commit and `state` = `ready`
- If deploy failed or is stale: check build logs, fix blockers, retrigger

**Both platforms confirmed? Only then proceed to smoke tests.**

**If a platform is still in-progress at Stage 5b entry:** under full-autonomy, do NOT hold the session polling and do NOT end the turn citing "need deploy to land first." Create a `MONITOR:` task per `command-center/rules/monitors/monitor-principles.md` (use `railway-deploy.md` / `netlify-deploy.md` templates), set parent wave STATUS=BLOCKED with blocker referencing the MONITOR, end turn. The /loop tick resumes Stage 5b after the monitor clears.

### 2. Verify env var changes propagated (if this wave changed env vars)

Changing env vars via CLI/MCP/dashboard does NOT auto-trigger a deploy on most platforms. After env var changes:
- Trigger a fresh build (empty commit + PR, or platform-specific redeploy)
- Verify the new values are available at runtime (hit a debug endpoint or check function logs)
- Do NOT assume env changes propagate automatically — Netlify does not auto-redeploy on env var changes

### 3. Smoke test touched routes

- Run `/qa` against the production URL (https://<your-domain>)
- Or: manually curl/fetch the 5-10 routes this wave touched
- Check for 4xx/5xx responses, console errors, blank pages
- Fix any blockers as same-wave fast-fixes before Stage 6

### 4. Regression check

- Verify untouched routes still return 200 (homepage, /games, /health)
- Verify existing auth flow still works (if wave touched auth)

## Deliverable
QA pass confirmation (or fast-fix commits), including explicit confirmation that BOTH Railway and Netlify are serving post-merge code.

## Exit criteria
- Railway confirmed serving post-merge code (uptime < 300s OR manual redeploy verified SUCCESS)
- Netlify confirmed serving post-merge code (latest deploy state=ready, commit_ref matches)
- All touched routes return 200 with expected content
- No 5xx errors on any route
- Env var changes verified at runtime (if applicable)
- Fast-fixes committed if needed

## Next
→ Return to `../wave-loop.md` → Stage 6
