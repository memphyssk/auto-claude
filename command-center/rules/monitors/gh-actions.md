# Monitor Template — GitHub Actions Workflow Run

Copy into your `MONITOR:` TaskMaster task. Adjust `$WORKFLOW_NAME` if you need to filter to a specific workflow; otherwise the template watches the latest run on the current branch.

READ `command-center/rules/monitors/monitor-principles.md` first.

## Conditions

```yaml
platform: github-actions
success_condition: |
  gh run list --branch "$(git rev-parse --abbrev-ref HEAD)" --limit 1 --json conclusion \
    | jq -e '.[0].conclusion == "success"'

failure_condition: |
  gh run list --branch "$(git rev-parse --abbrev-ref HEAD)" --limit 1 --json conclusion \
    | jq -e '.[0].conclusion | IN("failure", "cancelled", "timed_out", "action_required", "startup_failure")'

timeout_budget: 1800   # 30 minutes. Adjust to your longest workflow's 99th-percentile duration.
poll_delay: 60
```

## GitHub Actions conclusion values

Reference: `gh run list --json conclusion`. Possible values and how to classify:

| Conclusion | Terminal? | Classify as |
|---|---|---|
| `null` (workflow status = in_progress, queued, requested, waiting, pending) | no | pending |
| `success` | yes | success |
| `failure` | yes | failure |
| `cancelled` | yes | failure |
| `timed_out` | yes | failure |
| `action_required` | yes | failure (needs human input — approval, manual job) |
| `startup_failure` | yes | failure (workflow could not start — malformed YAML, missing secret) |
| `skipped` | yes | success (treat as non-blocking skip — the workflow didn't need to run for this commit) |
| `neutral` | yes | success (convention-dependent; most projects treat as success) |

**`action_required` is a failure from the monitor's perspective**, even though GitHub marks it with a yellow "waiting" icon — the workflow is blocked and will not proceed without human action. Surface this to the founder via the triage task.

## Filtering to a specific workflow

If the repo has multiple workflows and you only care about one:

```yaml
success_condition: |
  gh run list --workflow "$WORKFLOW_NAME" --branch "$(git rev-parse --abbrev-ref HEAD)" --limit 1 --json conclusion \
    | jq -e '.[0].conclusion == "success"'
```

## On failure — triage task contents

When the monitor marks FAILURE, the created triage task MUST include:

- `gh run view <run-id> --log-failed` output (last 500 lines; truncate head if too long)
- The job name and step name that failed (`gh run view <run-id> --json jobs | jq '.jobs[] | select(.conclusion == "failure")'`)
- Link to the run (`gh run view <run-id> --web` URL — construct from run ID)
- The exact conclusion value (failure / cancelled / timed_out / action_required / startup_failure — each routes to different triage)

## Common failure modes

- `failure` during test job → code bug; route to `/investigate` or matching specialist.
- `failure` during build/typecheck → most often a merge-race with another PR's changes; retry after rebase may resolve.
- `timed_out` → either infinite loop in code or runner contention; check the job's step durations.
- `startup_failure` → workflow YAML broken or missing repo-level secret; rarely a code issue.
- `action_required` → a required review, manual approval, or protected-environment gate is pending. Escalate to founder.
