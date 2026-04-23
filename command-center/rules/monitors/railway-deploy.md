# Monitor Template — Railway Deploy

Copy into your `MONITOR:` TaskMaster task. Adjust `$RAILWAY_SERVICE` to your project's service name.

READ `command-center/rules/monitors/monitor-principles.md` first — this template is a pre-filled instance of the three-condition contract.

## Conditions

```yaml
platform: railway
success_condition: |
  railway status --json --service "$RAILWAY_SERVICE" \
    | jq -e '.deployments[0].status == "SUCCESS"'

failure_condition: |
  railway status --json --service "$RAILWAY_SERVICE" \
    | jq -e '.deployments[0].status | IN("FAILED", "CRASHED", "REMOVED", "SKIPPED")'

timeout_budget: 900   # 15 minutes. Typical Railway deploy is 2-5 min; pad for queue time.
poll_delay: 45        # seconds between polls
```

## Railway deployment states

Reference: `railway status --json`. Known states for `deployments[0].status`:

| State | Terminal? | Classify as |
|---|---|---|
| `QUEUED` | no | pending |
| `INITIALIZING` | no | pending |
| `BUILDING` | no | pending |
| `DEPLOYING` | no | pending |
| `SUCCESS` | yes | success |
| `FAILED` | yes | failure |
| `CRASHED` | yes | failure |
| `REMOVED` | yes | failure (deploy was removed before completion) |
| `SKIPPED` | yes | failure (Railway deprioritized the build — code did NOT ship) |

**SKIPPED is a failure, not a success.** It means Railway did not deploy this commit even though CI passed. Treating SKIPPED as success is how "green CI, but no deploy" incidents happen.

Verify this list against actual `railway status --json` output before relying on it — Railway occasionally adds or renames states.

## MCP fallback

If `railway` CLI is not installed in the environment:

```yaml
success_condition: |
  echo "Use mcp__Railway__list-deployments and check .deployments[0].status == SUCCESS"
failure_condition: |
  echo "Use mcp__Railway__list-deployments and check .deployments[0].status in (FAILED,CRASHED,REMOVED,SKIPPED)"
```

The monitor logic should wrap the MCP call in a shell script that converts MCP output to exit codes.

## On failure — triage task contents

When the monitor marks FAILURE, the created triage task MUST include:

- Last 100 lines of `railway logs --service "$RAILWAY_SERVICE" --deployment-id <id>`
- The commit SHA that was deployed (`git rev-parse HEAD` at the time of MONITOR creation)
- Link to the Railway dashboard for the failed deployment (construct from project + service + deployment ID)
- The exact `deployments[0].status` value observed (FAILED / CRASHED / REMOVED / SKIPPED — the triage route differs)

## Common Railway failure modes (for triage context)

- `FAILED` during BUILDING → usually missing build-time env var or dependency resolution error. Check `railway logs --deployment-id <id>` build section.
- `CRASHED` post-deploy → app started but died. Usually runtime env var, missing secret, or port binding issue. Check `railway logs` runtime section.
- `SKIPPED` → Railway saw a newer commit mid-queue and skipped this one. Not necessarily a code failure — may resolve by re-triggering from main.
- `REMOVED` → deployment was manually deleted from dashboard or via API. Almost always human action; check audit log.
