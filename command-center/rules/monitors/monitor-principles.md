# Monitor Principles

Master doctrine for monitoring external events (deploys, CI runs, DNS propagation, tier activations, third-party provisioning). READ before creating any `MONITOR` task.

## When a monitor is needed

Any stage that must wait for an external event before proceeding. Examples:
- Stage 5 deploy → Stage 5b QA (Railway / Vercel / Netlify / Fly.io deploy must land before smoke tests)
- Stage 6 Playwright swarm (prod URL must serve the merged commit before browser tests run)
- Domain / DNS setup (propagation must complete before auth cookies work cross-subdomain)
- Stripe tier activation, Auth0 tenant provisioning, S3 bucket availability, any provider with async provisioning

Never hold a session open polling in a tight loop. Never end the turn with "best run in a fresh session" / "needs live infra verification before 5b" — those are named protocol violations (see `command-center/management/full-autonomy-mode.md` § Anti-pattern). Create a `MONITOR:` task instead (Spawn-and-Block pattern, same file).

## The three-condition requirement

Every `MONITOR:` task MUST declare all three of the following fields in its TaskMaster `details`:

1. **`success_condition`** — shell one-liner that returns exit code 0 when the external event definitively succeeded.
2. **`failure_condition`** — shell one-liner that returns exit code 0 when the external event definitively failed (errored, crashed, canceled, rolled back, timed out at the platform layer).
3. **`timeout_budget`** — max total wait in seconds. Past this, the monitor escalates regardless of state.

**If you cannot articulate the failure signal for the external, do NOT create the monitor.** Stop and read the platform's status API docs, or copy from a template in this directory. A monitor without a failure condition will sit forever on a failed deploy — this is exactly how the quoted Railway-failed-Monitor-kept-waiting incident happened.

Also declare:
- **`poll_delay`** — seconds between polls (default 60s for fast externals, 300s for slow ones like DNS).

## Monitor state machine

On every poll tick, the monitor task runs (in order):

1. Run `success_condition`. If exit 0 → mark SUCCESS, clear the parent wave's blocker, set parent STATUS=`RUNNING`, delete the MONITOR TaskMaster task, end turn. Parent wave resumes on next tick.
2. Run `failure_condition`. If exit 0 → mark FAILURE:
   - Capture platform diagnostic output (logs, error codes, dashboard URL) — see platform template for specifics.
   - Create a new TaskMaster triage task: `TRIAGE: {platform} {failure-summary}`, details include the diagnostic output.
   - Set parent wave STATUS=`BLOCKED` with blocker entry pointing at the triage task ID.
   - Do NOT retry the monitor. Delete the MONITOR task.
   - End turn. Next /loop tick sees BLOCKED → founder or `/investigate` picks up the triage.
3. Neither condition returned 0:
   - If elapsed < `timeout_budget` → append poll result to `Planning/monitor-<task-id>.log`, `ScheduleWakeup` per `poll_delay`, end turn.
   - If elapsed ≥ `timeout_budget` → mark TIMEOUT, set parent wave STATUS=`BLOCKED` with blocker entry "monitor timeout on {platform}: neither success nor failure after {N}s", escalate to founder. Do NOT continue polling. Delete the MONITOR task.

## Poll log

Every monitor poll MUST write one line to `Planning/monitor-<task-id>.log`:

```
{ISO-timestamp} | poll={N} | elapsed={seconds} | success_exit={code} | failure_exit={code} | head={first-line-of-stdout-from-failed-command}
```

When a monitor gets stuck, the log explains why. When the founder intervenes, they can see what was being checked at each tick. Feeds retro learning ("our success signal was wrong — it never matched for this platform variant because Railway added a new state").

## Self-audit at 50% budget

At 50% of `timeout_budget` with no terminal condition reached, the monitor appends to the log:

```
{timestamp} | self-audit | neither success nor failure after {N} polls — check if either condition is wrong
```

Does NOT escalate yet — just surfaces the anomaly early so the log shows a clear "something's off" marker before the full timeout fires.

## Named anti-patterns (protocol violations)

- **"Monitor with only success condition."** Every monitor MUST declare `success_condition` AND `failure_condition`. Missing failure check → protocol violation. This is the top failure mode — agents forget failure detection because the happy path is what they were asked to verify.
- **"Check for HTTP 200 on health endpoint."** A health endpoint returning 200 does NOT mean the latest deploy shipped — it could be serving old code. Monitors MUST check the deploy/pipeline state endpoint (Railway `railway status --json`, Vercel `vercel inspect`, GH Actions `gh run list`), not `/healthz`. A health check is a supplement for Stage 5b verification, not a deploy-state signal.
- **"Monitor without timeout."** Every monitor MUST declare a finite `timeout_budget`. Infinite-wait monitors are how sessions die unnoticed and the loop ticks forever on a stuck external.
- **"Success-then-retry-on-failure."** If `failure_condition` returns 0, the monitor terminates with FAILURE — it does NOT retry. Retrying a failed deploy without human-in-loop triage is how bad code ships on the second try, or the same failure happens silently.
- **"Commit-SHA check via deploy endpoint."** Some platforms lag on reporting the shipped commit. The `success_condition` should check the platform's own state flag (SUCCESS / ready / succeeded), NOT "does the deploy commit match HEAD" — that introduces a race between platform propagation and your poll.

## Platform templates

Canonical templates per platform live in this directory. Copy and adjust project-specific values:

- `railway-deploy.md` — Railway deployments
- `gh-actions.md` — GitHub Actions workflow runs
- `netlify-deploy.md` — Netlify site deployments
- (add as encountered: `vercel-deploy.md`, `fly-deploy.md`, `dns-propagation.md`, `stripe-activation.md`, `auth0-provisioning.md`, `s3-bucket-provision.md`)

Adding a new platform: write a template with all three conditions verified against live output, list all terminal states the platform emits (classify each as success / failure / pending), then add to the list above. Do NOT invent conditions from memory — always verify against a real `--json` output first.

## Referenced from

- `command-center/management/full-autonomy-mode.md` § Spawn-and-Block (the mode-entry invocation rule)
- `command-center/rules/build-iterations/stages/stage-5-deploy.md` (async-deploy path)
- `command-center/rules/build-iterations/stages/stage-5b-qa.md` (live-infra preconditions)
- `command-center/rules/build-iterations/stages/stage-6-test.md` (prod URL readiness)
- Any future stage that waits on an external event — add a cross-ref here when you add one
