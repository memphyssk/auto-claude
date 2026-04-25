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

### Wave execution

Run continuously within a turn. End the turn only when a real condition fires:

| Condition | Detection | Action |
|---|---|---|
| 75% context | Token usage check during work | Write `handoff.md`, set STATUS=HANDOFF (mirror), ScheduleWakeup 60s, end turn |
| IDLE (no work right now) | `task-master next` empty + checkpoint buckets empty | Set STATUS=IDLE (mirror), ScheduleWakeup ~1800s, end turn |
| BLOCKED (hard-stop fired) | Hard-stop class detected during execution | Write blocker file with reason, set STATUS=BLOCKED (mirror), ScheduleWakeup ~3600s, end turn |
| DONE (backlog truly empty) | `task-master next` empty + checkpoints empty + no MONITOR pending | Set STATUS=DONE (mirror), end without ScheduleWakeup |

There are no "ticks" under full-autonomy — no ceremonial steps fire on a cadence. The orchestrator chains stages 0-11 inside one turn until a condition above fires. STATUS is a write-only mirror for founder visibility, not a gating input.

### Chunking rule — when to ScheduleWakeup vs poll inside the turn

| Wait class | Action |
|---|---|
| Programmatic check resolvable in <10 min (CI run, fast-deploy probe, monitor poll, health endpoint) | Poll inside the turn via `Bash(run_in_background=true)` + Monitor + `until`-loop. Do NOT ScheduleWakeup. |
| Human or external timeline >10 min (founder reply, code review, queued deploy, slow upstream) | Write handoff.md or blocker file, ScheduleWakeup at appropriate delay, end turn. |

Chunking active orchestrator work into multiple wakes is forbidden — that's a discipline failure, not a natural pause.

### Self-management decisions — never asked

- Continue-vs-fresh-session → governed by 75% context rule
- Commit granularity within an approved plan
- Execution sequencing within an approved plan
- Split-vs-push-through a Stage 4 implementation

If you write "My preference: X" in any checkpoint, X is the decision — execute it. Do NOT emit the "but if you want Y" alternative tail.

### Context budget — handoff

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

### STATUS values — wake routing

STATUS is written as a one-way mirror; the orchestrator does not gate behavior on reading it. On wake, the orchestrator detects what to do from artifacts (handoff.md, task-master, blocker files), and STATUS values describe what the file would say at each transition.

| STATUS value | When it's written | What the orchestrator does on wake |
|---|---|---|
| `RUNNING` | Active wave work in progress | (Should not see this on wake — RUNNING ends in HANDOFF, IDLE, BLOCKED, or DONE.) Triage from git + Planning/wave-* files. |
| `HANDOFF` | 75% context fired mid-work | Read `handoff.md`. Resume. Write STATUS=RUNNING. |
| `IDLE` | task-master + checkpoints empty, may fill later | Run `npx task-master next`. If work appears → start a wave. Else re-sleep. |
| `BLOCKED` | Hard-stop pending founder input | Check if blocker resolved (founder modified state). If yes → resume. Else re-sleep. |
| `DONE` | Truly nothing to do, no MONITOR pending | Loop already ended. No wake. |

`WAVE_DONE` is NOT a valid STATUS value. Cross-wave transitions either stay `RUNNING` or write `HANDOFF` pointing at wave N+1 Stage 0. See `stage-11-next.md` § STATUS handling.

STATUS=DONE only when `npx task-master next` returns nothing AND daily-checkpoint buckets are empty. Any pending executable task uses STATUS=IDLE instead.

## Hard-stops — always to founder

Even under full-autonomy, these always prompt:

| Class | Examples |
|---|---|
| **Destructive actions** | force-push, DROP TABLE, `rm -rf`, `git reset --hard`, `kubectl delete`, branch deletion, uncommitted-work overwrites |
| **Money commitments** | new paid SaaS subscription, API tier upgrade with billing, domain purchase, anything with a credit-card hit |
| **Hard-stop member veto** | any BOARD member flags `HARD-STOP: must be human` with concrete reason |

When a hard-stop fires mid-turn:
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
