# Monitor Template — Netlify Deploy

Copy into your `MONITOR:` TaskMaster task. Set `$NETLIFY_SITE_ID` (from `netlify sites:list --json`).

READ `command-center/rules/monitors/monitor-principles.md` first.

## Conditions

```yaml
platform: netlify
success_condition: |
  netlify api listSiteDeploys --data "{\"site_id\":\"$NETLIFY_SITE_ID\",\"per_page\":\"1\"}" \
    | jq -e '.[0].state == "ready" and .[0].commit_ref == "'"$(git rev-parse HEAD)"'"'

failure_condition: |
  netlify api listSiteDeploys --data "{\"site_id\":\"$NETLIFY_SITE_ID\",\"per_page\":\"1\"}" \
    | jq -e '.[0].state | IN("error", "rejected")'

timeout_budget: 1200   # 20 minutes. Netlify builds vary widely; SSG repos deploy in 1-2 min, large Next.js may take 10+.
poll_delay: 45
```

**Note:** this is the ONE case where we check `commit_ref` alongside state — Netlify's deploy list shows *all* builds including promotions/previews, and `state == "ready"` alone may reflect a prior deploy. Matching against `git rev-parse HEAD` is needed to confirm the NEW deploy landed. The `monitor-principles.md` anti-pattern about commit-SHA-checks has an exception here; Netlify's propagation is fast enough that the race risk is minimal.

## Netlify deploy states

Reference: `netlify api listSiteDeploys` → `.state`. Known values:

| State | Terminal? | Classify as |
|---|---|---|
| `new` | no | pending |
| `pending_review` | no | pending (Netlify policy gate) |
| `accepted` | no | pending |
| `enqueued` | no | pending |
| `building` | no | pending |
| `uploading` | no | pending |
| `uploaded` | no | pending |
| `preparing` | no | pending |
| `prepared` | no | pending |
| `processing` | no | pending |
| `ready` | yes | success (only if `commit_ref` matches — see above) |
| `error` | yes | failure |
| `rejected` | yes | failure (secrets-scanner blocked the build) |

## On failure — triage task contents

- `netlify api listSiteDeploys --data '{"site_id":"'"$NETLIFY_SITE_ID"'","per_page":"1"}' | jq '.[0]'` full output
- The `error_message` field from the deploy (most informative)
- Link to Netlify dashboard deploy page (`https://app.netlify.com/sites/<site-name>/deploys/<deploy-id>`)
- If state=`rejected`: include which secret-scanner rule fired — rejected deploys almost always mean a committed key or env-var leak

## Common failure modes

- `error` during "building" stage → check `error_message`. Usually missing dependency, TypeScript error, or OOM.
- `error` during "processing" stage → functions build failed. Often edge function bundle issues or missing runtime env var.
- `rejected` → secret scanner caught a committed credential. Do NOT re-deploy with `--secret-scan-disabled` — rotate the secret and remove it from the commit.
- `ready` but `commit_ref` stale → Netlify did not pick up the push. Check webhook config or force a build via `netlify api createSiteBuild`.
