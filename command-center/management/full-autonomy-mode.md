# Mode — Full-Autonomy

Unconditional wave-loop execution. BOARD decides every former user-ask except hard-stops. Founder reviews decisions via morning digest but does not gate runtime.

## Activation

When the user says any of:
- "full autonomy" / "go completely autonomous" / "board mode"
- "unconditional loop" / "don't stop for anything"

You MUST perform the following sequence in a single mode-entry turn, in order. You MUST NOT begin wave execution in this turn — first real work happens on tick 1.

1. **Write the flag file:**
   ```bash
   cat > Planning/.autonomous-session <<EOF
   started_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
   mode: full-autonomy
   reason: <quote user's phrasing>
   expires_on: user-says-stop | orchestrator-finishes-all-work
   EOF
   ```

2. **Initialize STATUS.** If `command-center/management/STATUS` is missing, write `IDLE` as the initial value. If it already exists, read and preserve it — do not overwrite (it reflects persistent wave state across mode toggles).

3. **Launch the loop.** Invoke the `/loop` skill via the Skill tool with the autonomous-dynamic sentinel. The founder does not run /loop manually; you bootstrap it on their behalf as part of mode entry. The loop self-paces via `ScheduleWakeup` based on STATUS.

4. **Confirm in one line:** `Full-autonomy ON. STATUS=<value>. /loop started. BOARD handles non-hard-stop escalations. Morning digest at Planning/board-digest-<YYYY-MM-DD>.md.`

5. **End the turn.**

## Tick behavior — what you MUST do on every /loop tick

On every /loop tick under full-autonomy:

1. **Read `command-center/management/STATUS`.** Never skip this read. Route by its value per the table below.
2. **Execute the routed action** until you hit a natural pause or the context-budget rule fires.
3. **Update STATUS before ending the turn** — never leave it stale.
4. **Call `ScheduleWakeup`** with the delay from the table, unless STATUS=DONE.

### STATUS routing table

| STATUS value | What you MUST do | Next tick delay |
|---|---|---|
| `RUNNING` | Prior session died mid-turn. Recover from last commit SHA + `command-center/management/handoff.md`. If no handoff exists, triage from git state and the active wave plan. | 60s |
| `HANDOFF` | Read `command-center/management/handoff.md`. It points at either (a) a stopping point inside an in-flight wave's Stage 4, or (b) the start of a newly-scoped wave whose Stage 0 hasn't run yet (cross-wave handoff from Stage 11). Resume accordingly. Set STATUS=RUNNING as your first write-side action. | 60s |
| `IDLE` | Re-read roadmap + run `npx task-master next`. If executable work exists, begin it and transition to RUNNING. Otherwise re-sleep. | 1800s |
| `BLOCKED` | Do NOT proceed with work. A hard-stop is pending founder input. End turn and re-sleep. | 3600s |
| `DONE` | End the loop. Do NOT call `ScheduleWakeup`. | — |

`WAVE_DONE` is NOT a valid STATUS value. Cross-wave transitions either stay `RUNNING` (same-turn continuation into wave N+1) or write `HANDOFF` with a handoff.md that points at wave N+1 Stage 0. Stage 11 owns this logic — see `command-center/rules/build-iterations/stages/stage-11-next.md` § STATUS handling.

### Transitioning to DONE

Only Stage 11 writes STATUS=DONE, and only when `npx task-master next` returns nothing AND the daily-checkpoint buckets are empty (i.e. Stage 11 Step 5 "backlog genuinely empty"). If any executable task remains, use STATUS=IDLE instead. If pending tasks exist but all require founder input, also use STATUS=IDLE.

### Context budget — mid-tick handoff (the rule that replaces the "continue vs fresh session?" question)

At every natural pause during execution, you MUST re-check the context budget. If context_used ≥ 75%:

1. Commit whatever's coherent (never force a commit; if the tree is incoherent, note that in handoff).
2. Write `command-center/management/handoff.md` with:
   - Wave number + active plan path
   - Last commit SHA (or `uncommitted: <brief description of dirty state>`)
   - Where you stopped, what's next
   - Any in-flight gotchas (partial migrations, stubbed functions, failing tests)
3. Set STATUS=HANDOFF.
4. End the turn.

The next tick resumes from `handoff.md`. This is the ONLY mechanism for continue-vs-fresh-session. You MUST NOT ask the founder which to choose — the 75% threshold is the answer.

### Self-management decisions — never asked

Under full-autonomy, the following resolve by rule, not by question, and NEVER go to founder or BOARD:

- Continue-vs-fresh-session → governed by the 75% context rule above
- Commit granularity within an approved plan
- Execution sequencing within an approved plan
- Split-vs-push-through a Stage 4 implementation

If you write "My preference: X" in any checkpoint under full-autonomy, X is the decision — execute it. You MUST NOT emit the "but if you want Y …" alternative tail.

### Anti-pattern — waiting on external events is NOT a reason to end the turn

Under full-autonomy, you MUST NOT end a turn because an external event is pending (Railway/Vercel/Netlify deploy, GitHub Actions CI, DNS propagation, Stripe/Auth0 tier activation, etc.). Phrases like "remaining stages need the deploy to land first", "best run in a fresh session", "needs live infra verification before 5b", or "I stopped at merge since the remaining stages need X" are **protocol violations** — they are the unilateral-stop version of the banned "continue vs fresh session?" question.

When work is blocked on wall-clock wait for an external event, you MUST instead do one of the following, in order of preference:

1. **Spawn-and-Block (preferred for any wait >5 min).** Create a `MONITOR:` task in TaskMaster, declare `success_condition` + `failure_condition` + `timeout_budget` per `command-center/rules/monitors/monitor-principles.md`. Copy from a platform template in `command-center/rules/monitors/` — do NOT invent the conditions from memory. Set parent wave STATUS=BLOCKED with a blocker entry referencing the MONITOR task ID. End the turn. The next /loop tick processes the MONITOR task: on SUCCESS it clears the blocker and resumes the parent wave; on FAILURE it creates a triage task and keeps the parent BLOCKED; on TIMEOUT it escalates to founder. This is a structured delegation — no polling loop, no session held open.

2. **Short-wait in-loop (acceptable for waits <5 min with a trivially-checkable condition).** Call `ScheduleWakeup` with a delay appropriate to the external (fast deploy ~120s, propagation tick ~300s), end the turn, and on next tick run the readiness check directly. Use this ONLY for short, high-confidence waits where Spawn-and-Block's overhead isn't justified. You MUST still think about the failure path — if the check could return "not yet" or "failed" indistinguishably, use Spawn-and-Block instead.

You MUST NOT do any of the following:
- End the turn citing "best run in a fresh session" / "needs live infra verification" / "I'll come back when deploy lands" — these are the banned phrases; see § Anti-pattern header.
- Create a MONITOR task with only a success condition — this is the single biggest monitor failure mode (a failed Railway deploy kept a monitor sitting forever because only success was checked). See `monitor-principles.md` § Named anti-patterns.
- Check `/healthz` or similar health endpoint as the success signal for a deploy — a 200 can be served by old code. Check the platform's deploy-state endpoint instead.

The loop is the session. A tick spent waiting (or a MONITOR task ticking in the background) costs almost nothing. There is no valid third option — no "end here, resume in a fresh session for cleanliness." If you catch yourself writing any banned phrase, stop and choose option 1 or 2 instead.

## Routing table

Under `mode: full-autonomy`, these escalations route to BOARD:

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
| daily-checkpoint resolution (all three buckets) | Founder answers via AskUserQuestion | BOARD resolves; morning digest for founder |

Everything NOT in this table stays as-is (Tier 1 auto-decide still runs, Tier 2 still proceeds+logs, orchestrator routing via triage table still routes to specialists).

## Hard-stops — always to founder

Even under full-autonomy, the following ALWAYS prompt:

- **Destructive actions** — force-push, DROP TABLE, `rm -rf`, `git reset --hard`, `kubectl delete`, branch deletion, uncommitted-work overwrites
- **Money commitments** — new paid SaaS subscription, API tier upgrade with billing, domain purchase, anything with a credit-card hit
- **Hard-stop member veto** — any BOARD member flagging `HARD-STOP: must be human` with concrete reason

When a hard-stop fires mid-tick, you MUST:
1. Set STATUS=BLOCKED.
2. Surface the escalation to the founder in your turn-end message with all context needed to decide.
3. `ScheduleWakeup` 3600s (founder can respond anytime; that's fine — next tick checks STATUS).

## BOARD-decidable under full-autonomy (delegated)

Things that WERE founder-only before, now routed to BOARD:
- Identity commitments (account creation on third-party providers)
- Legal text approvals (terms-of-service copy, privacy text edits)
- External communications (emails drafted to real users, Slack posts, OSS PR descriptions)
- Vendor selection calls where `product-decisions.md` precedent exists

## Onboarding carve-out

BOARD is OFF during the onboarding loop (v0-v11) regardless of mode. Founder-review always applies for:
- v1 vision/bets gap check
- v5 stack override
- v7 design direction approval
- v8 design system approval
- v9 per-page design approval
- v10 Tier 3 deferrals

Full-autonomy activates only after v11 handoff. The reasoning: onboarding is the highest-taste moment in the project lifecycle; founder presence is the feature.

## Audit — morning digest

Every BOARD decision made during the run surfaces to founder at next session start:

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

Founder opens digest, can stop the session and manually override any decision → see `board.md` § Rollback.

## Deactivation

User triggers:
- "I'm back" / "pause" / "stop the autonomous run"
- "exit full-autonomy" / "switch to semi-assisted"

When the user says any of these, you MUST:
1. Remove `Planning/.autonomous-session` OR flip `mode:` to `semi-assisted` per `mode-switching.md`.
2. Do NOT modify `command-center/management/STATUS` — it reflects wave state, which persists across modes. The next manual or semi-assisted action reads it.
3. Exit the /loop: do NOT call `ScheduleWakeup` this turn.
4. Confirm in one line: `Full-autonomy ended. STATUS=<value>. Next escalation goes to you.`

## Latency + cost

BOARD convening: ~1-2 min + ~40-50K tokens per decision (7 parallel agents, each ~5-8K tokens of fresh context + reading list + vote). A wave that triggers 2 BOARD convenings adds ~3-4 min + ~80-100K tokens over the baseline ~75K typical. Acceptable tradeoff for unconditional loop.

## Precedence

1. **Flag file wins over wave-plan front-matter.** Wave plans do NOT declare `autonomous_mode` (deprecated field).
2. **Hard-stops always prompt** regardless of flag. Safety gates are not bypassable.
3. **Founder message at any time** → orchestrator responds immediately, regardless of mode or STATUS.
4. **STATUS is deterministic, never a question.** You MUST NOT ask the founder "continue or fresh session?" — the 75% context rule + STATUS=HANDOFF answers it.
5. **Critical errors still escalate** — if `ultrathink-debugger` also fails after BOARD-approved fix attempts, the issue still surfaces in the digest as `Vetoes & escalations routed back` for founder attention.
