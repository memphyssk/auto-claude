# Mode — Full-Autonomy

Unconditional wave-loop execution. BOARD decides every former user-ask except hard-stops. Founder reviews decisions via morning digest but does not gate runtime.

## Flag

`Planning/.autonomous-session` with `mode: full-autonomy`.

## Entry conditions

User phrases: "full autonomy" / "go completely autonomous" / "board mode" / "unconditional loop" / "don't stop for anything".

On activation, in a single turn and in order:

1. Write the flag file:
   ```bash
   cat > Planning/.autonomous-session <<EOF
   started_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
   mode: full-autonomy
   reason: <quote user's phrasing>
   expires_on: user-says-stop | orchestrator-finishes-all-work
   EOF
   ```
2. Initialize STATUS. If `command-center/management/STATUS` is missing, write `IDLE`. If present, preserve — do not overwrite.
3. Launch the loop. Invoke the `/loop` skill via the Skill tool with the autonomous-dynamic sentinel. Founder does not run /loop manually.
4. Confirm in one line: `Full-autonomy ON. STATUS=<value>. /loop started. BOARD handles non-hard-stop escalations. Morning digest at Planning/board-digest-<YYYY-MM-DD>.md.`
5. End the turn.

## Behavior

### Tick behavior — every /loop tick

1. **Read `command-center/management/STATUS`.** Never skip. Route by value per table below.
2. **Execute the routed action** until natural pause or context-budget rule fires.
3. **Update STATUS before ending the turn** — never leave it stale.
4. **Call `ScheduleWakeup`** with delay from table, unless STATUS=DONE.

### Self-management decisions — never asked

- Continue-vs-fresh-session → governed by 75% context rule
- Commit granularity within an approved plan
- Execution sequencing within an approved plan
- Split-vs-push-through a Stage 4 implementation

If you write "My preference: X" in any checkpoint, X is the decision — execute it. Do NOT emit the "but if you want Y" alternative tail.

### Waiting on external events

Do NOT end a turn because an external event is pending (deploy, CI, DNS, tier activation, etc.). Phrases like "remaining stages need the deploy to land first" or "best run in a fresh session" are protocol violations.

When blocked on a wall-clock wait:

1. **Spawn-and-Block (preferred, any wait >5 min).** Create a `MONITOR:` task in TaskMaster with `success_condition` + `failure_condition` + `timeout_budget` per `command-center/rules/monitors/monitor-principles.md`. Set STATUS=BLOCKED with a blocker entry referencing the MONITOR task ID. End the turn.
2. **Short-wait in-loop (acceptable, waits <5 min with trivially-checkable condition).** Call `ScheduleWakeup` with appropriate delay, end the turn, and run the readiness check on next tick.

### Context budget — mid-tick handoff

At every natural pause, re-check context budget. If context_used ≥ 75%:

1. Commit whatever's coherent.
2. Write `command-center/management/handoff.md` with: wave number + active plan path, last commit SHA (or uncommitted state), where you stopped / what's next, in-flight gotchas.
3. Set STATUS=HANDOFF.
4. End the turn.

This is the ONLY mechanism for continue-vs-fresh-session. Never ask the founder which to choose.

## Routing thresholds

| Escalation source | Previous behavior | Full-autonomy behavior |
|---|---|---|
| Stage 0b Tier 3 product decision | Queue for daily-checkpoint | BOARD (6+/7 consensus required) |
| Stage 1 RESCOPE-AUTO-SPLIT with unbreakable first slice | Escalate to user | BOARD (4+/7) |
| Stage 1 ceo-reviewer EXPAND_SCOPE_PROPOSAL | AskUserQuestion | BOARD (4+/7) |
| Stage 1 ceo-reviewer REDUCE_SCOPE_PROPOSAL (strategic) | AskUserQuestion | BOARD (4+/7) |
| Stage 1 ceo-reviewer RECONSIDER | AskUserQuestion | BOARD (4+/7) |
| Stage 1 conflicting problem-framer vs ceo-reviewer | Escalate to user | BOARD (4+/7) |
| Stage 3b design-gap 3-cap escalation | Escalate to user | BOARD (4+/7) |
| Stage 7b /investigate chain exhaustion | Escalate to user | BOARD (4+/7) |
| daily-checkpoint resolution (all three buckets) | Founder via AskUserQuestion | BOARD resolves; morning digest for founder |

Everything NOT in this table stays as-is (Tier 1 auto-decide, Tier 2 proceeds+logs, triage routing to specialists).

### STATUS routing table

| STATUS value | What you MUST do | Next tick delay |
|---|---|---|
| `RUNNING` | Prior session died mid-turn. Recover from last commit SHA + `handoff.md`. If no handoff, triage from git state + active wave plan. | 60s |
| `HANDOFF` | Read `handoff.md`. Resume accordingly. Set STATUS=RUNNING as first write-side action. | 60s |
| `IDLE` | Re-read roadmap + run `npx task-master next`. Begin if executable work exists; otherwise re-sleep. | 1800s |
| `BLOCKED` | Hard-stop pending founder input. End turn, re-sleep. | 3600s |
| `DONE` | End the loop. Do NOT call ScheduleWakeup. | — |

`WAVE_DONE` is NOT a valid STATUS value. Cross-wave transitions either stay `RUNNING` or write `HANDOFF` pointing at wave N+1 Stage 0. See `stage-11-next.md` § STATUS handling.

STATUS=DONE only when `npx task-master next` returns nothing AND daily-checkpoint buckets are empty. Any pending executable task uses STATUS=IDLE instead.

## Hard-stops — always to founder

Even under full-autonomy, these always prompt:

| Class | Examples |
|---|---|
| **Destructive actions** | force-push, DROP TABLE, `rm -rf`, `git reset --hard`, `kubectl delete`, branch deletion, uncommitted-work overwrites |
| **Money commitments** | new paid SaaS subscription, API tier upgrade with billing, domain purchase, anything with a credit-card hit |
| **Hard-stop member veto** | any BOARD member flags `HARD-STOP: must be human` with concrete reason |

When a hard-stop fires mid-tick:
1. Set STATUS=BLOCKED.
2. Surface the escalation to the founder with all context needed to decide.
3. ScheduleWakeup 3600s.

## BOARD-decidable under full-autonomy

- Identity commitments (account creation on third-party providers)
- Legal text approvals (ToS copy, privacy text edits)
- External communications (emails drafted to real users, Slack posts, OSS PR descriptions)
- Vendor selection calls where `product-decisions.md` precedent exists

## Anti-patterns

### 1. Do not end a turn because an external event is pending.
Why: The loop is the session; "best run in a fresh session" is a banned phrase and a protocol violation.

### 2. Do not create a MONITOR task with only a success condition.
Why: A failed deploy kept a monitor sitting forever because only success was checked; both success and failure conditions are required.

### 3. Do not check `/healthz` as the deploy success signal.
Why: A 200 can be served by old code; check the platform's deploy-state endpoint instead.

### 4. Do not ask the founder "continue or fresh session?"
Why: The 75% context rule + STATUS=HANDOFF is the answer; it is never a question.

### 5. Do not convene BOARD for self-management decisions.
Why: Session management, loop cadence, commit granularity, and execution sequencing resolve by rule — convening BOARD for them is a protocol violation.

## Exit conditions

User triggers: "I'm back" / "pause" / "stop the autonomous run" / "exit full-autonomy" / "switch to semi-assisted".

1. Remove `Planning/.autonomous-session` OR flip `mode:` field.
2. Do NOT modify `command-center/management/STATUS` — it reflects wave state, which persists across modes.
3. Exit the /loop: do NOT call ScheduleWakeup.
4. Confirm in one line: `Full-autonomy ended. STATUS=<value>. Next escalation goes to you.`

## Onboarding carve-out

BOARD is OFF during v0-v11 onboarding regardless of mode. Full-autonomy activates only after v11 handoff.

## Audit — morning digest

`Planning/board-digest-<YYYY-MM-DD>.md`:

```markdown
# BOARD digest — <date>

## Clean decisions (N) — 5+/7 or cleaner
| decision-slug | outcome | wave |

## Close splits (N) — 4+/7 with dissent
| decision-slug | outcome | dissent note | wave |

## Vetoes & escalations routed back to founder (N)
| decision-slug | reason | where paused |

## Summary
- Total decisions: N | Clean: N | Close: N | Escalated: N
- Waves completed: N
- Approvals pending founder review: N
```

Founder can stop the session and manually override any decision → see `board.md` § Rollback.

## Latency + cost

BOARD convening: ~1-2 min + ~40-50K tokens per decision (7 parallel agents, ~5-8K tokens each). A wave with 2 BOARD convenings adds ~3-4 min + ~80-100K tokens over baseline. Acceptable tradeoff for unconditional loop.

## Precedence

1. Flag file wins over wave-plan front-matter. Wave plans do NOT declare `autonomous_mode` (deprecated field).
2. Hard-stops always prompt regardless of flag.
3. Founder message at any time → orchestrator responds immediately, regardless of mode or STATUS.
4. STATUS is deterministic, never a question. The 75% context rule + STATUS=HANDOFF answers continue-vs-fresh.
5. Critical errors still escalate — if `ultrathink-debugger` also fails after BOARD-approved fix attempts, the issue surfaces in the digest for founder attention.
