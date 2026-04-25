# Mode — Danger-Builder

Unconditional wave-loop execution with ceo-agent as BOARD tiebreaker, hard-stop resolver, and founder-ask fallback. Founder is notified per-decision via Resend email but does not gate runtime. Intended for indefinite (365-day) autonomous operation.

**Relationship to full-autonomy:** `danger-builder` extends full-autonomy. Everything `full-autonomy` does, `danger-builder` also does. The addition: when BOARD splits, deadlocks, or a member issues a HARD-STOP veto, ceo-agent resolves instead of routing to founder. All other would-be founder-asks also route to ceo-agent. The founder is reached only via kill-switch, session message, or per-decision notification email.

**Hard prerequisite:** `ceo-bound.md` must exist at `command-center/management/ceo-bound.md`. Charter defines restrictions on ceo-agent authority. Blank or missing charter = unlimited ceo-agent authority — always review `ceo-bound.md` before activating.

## Flag

`Planning/.autonomous-session` with `mode: danger-builder`.

## Entry conditions

User phrases: "danger builder" / "danger-builder mode" / "ship it mode" / "ceo mode" / "ceo-agent mode" / "run indefinitely" / "365 mode" / "full delegation" / "total autonomy".

Activation sequence (single turn, in order — do NOT begin wave execution this turn):

### 1. Verify prerequisites

All must be true. If any fails, abort and surface to founder:

- [ ] `command-center/management/ceo-bound.md` exists and is non-empty
- [ ] `command-center/management/ceo-bound.md` § 0 "Mode activation prerequisites" all boxes can be checked
- [ ] AgentMail CLI installed: `agentmail --version` returns 0.7.x or higher
- [ ] `AGENTMAIL_API_KEY` env var is set and valid: `agentmail --format json inboxes list` returns a JSON array
- [ ] Custom domain verified at AgentMail (see `command-center/setup-tools/install.md` § 1)
- [ ] `CEO_INBOX_ID` env var set: `agentmail --format json inboxes get --inbox-id "$CEO_INBOX_ID"` returns the inbox object
- [ ] `CEO_NOTIFY_EMAIL_TO` env var is set (founder's email)
- [ ] `Planning/` directory exists and is writable
- [ ] `command-center/Sub-agent Instructions/ceo-agent-instructions.md` exists
- [ ] BOARD composition intact (all 7 member agent files present — see `board-members.md`)
- [ ] Kill-switch mechanism tested: `touch /tmp/ceo-mode-stop-test && rm /tmp/ceo-mode-stop-test` succeeds
- [ ] ceo-agent spawn probe succeeds: `Agent(subagent_type=ceo-agent)` with `--probe` directive returns within 60s and writes a probe entry to `Planning/ceo-digest-YYYY-MM-DD.md`

Print verification results in one table. Fail fast if any prereq fails.

### 2. Write the flag file

```bash
cat > Planning/.autonomous-session <<EOF
started_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
mode: danger-builder
reason: <quote user's phrasing>
charter: command-center/management/ceo-bound.md
notify_to: $CEO_NOTIFY_EMAIL_TO
expires_on: kill-switch | founder-message | explicit-exit
EOF
```

### 3. Initialize STATUS

If `command-center/management/STATUS` is missing, write `IDLE`. If present, preserve.

### 4. Send activation notice via AgentMail

Send from ceo-agent inbox (`$CEO_INBOX_ID`) to founder (`$CEO_NOTIFY_EMAIL_TO`) using the activation template in `command-center/management/notifications/agentmail.md`.

### 5. Launch the loop

Invoke `/loop` skill via Skill tool with the autonomous-dynamic sentinel.

### 6. Confirm in one line

`Danger-builder ON. STATUS=<value>. ceo-agent resolving BOARD escalations + founder-asks within ceo-bound.md. Per-decision email → <CEO_NOTIFY_EMAIL_TO>. Kill: touch /tmp/ceo-mode-stop.`

### 7. End the turn

## Behavior

### Tick behavior — every /loop tick

Step ordering is authoritative. Steps 1-11:

0. **ceo-agent stall check.** Spawn `Agent(subagent_type=ceo-agent)` with the `stall-monitor` directive. Orchestrator role-play is forbidden. Audit entry MUST record the agent run ID. The spawned ceo-agent uses **directive-conditional lazy-load** per its card: on `stall-monitor`, it reads ONLY `STATUS-meta.yaml` first. Gates on: STATUS unchanged since `last_ceo_check_saw_status` AND `(now - last_modified_at) >= 600s`. Either condition false → ceo-agent updates STATUS-meta fields, returns `pass`, exits without loading the full doctrine (~10K token spawn). Both conditions true → ceo-agent escalates: reads full 5-file context and executes stall-nudge (~75K token spawn).
1. **Kill-switch check.** If `/tmp/ceo-mode-stop` exists: set STATUS=BLOCKED, send halt email, exit loop. Supersedes all subsequent steps.
2. **Founder-message check.** If any founder message arrived since last tick: halt loop, send halt email, set STATUS=BLOCKED.
3. **STATUS mode check.** If STATUS=`STOP`: halt per step 1.
4. **Inbox check.** `agentmail inboxes:threads list --inbox-id "$CEO_INBOX_ID" --label unread --format json`. For each unread thread: fetch messages, classify reply (APPROVE / REJECT / MODIFY / CLARIFY / AMBIGUOUS), execute classified action, mark thread read. Do NOT act on AMBIGUOUS — send CLARIFY reply and leave thread unread. **Skip threads with subject prefix `⚠ BET PROPOSAL`** — those queue for ritual Step 1d sweep, not per-tick processing.
5. **Read charter.** Re-read `ceo-bound.md`. If modified since last tick, respect new restrictions immediately.
6. **Route by STATUS value** (table below).
7. **Execute routed action** until natural pause or 75% context budget. **Natural pause** = STATUS becomes IDLE / BLOCKED / DONE, OR you're blocked on a human or external timeline >10 min (founder reply, code review, slow-deploy queue). Programmatic checks that resolve in <10 min (CI run, fast-deploy probe, monitor poll) are NOT pauses — poll inside the turn via `Bash(run_in_background=true)` + Monitor + `until` loop. Chunking active orchestrator work into multiple ticks is forbidden.
8. **75% context rule:** write handoff.md, set STATUS=HANDOFF, end turn.
9. **Update STATUS before ending turn.** If STATUS changed this tick, also update `STATUS-meta.yaml`.
10. **Call ScheduleWakeup** with delay per STATUS table, unless STATUS=DONE or halted.
11. **Per-decision notification.** After every ceo-agent decision, send a fresh email (new thread) via AgentMail. One email per decision. Capture `thread_id` into the audit entry. See `notifications/agentmail.md` for templates.

Reply-handling (step 4) runs before routing (step 6) so founder replies take precedence over new escalations.

### Tick prompt — exact text

When orchestrator calls `ScheduleWakeup` under `danger-builder`, pass this prompt verbatim. Substitute `<value>` and `<N>` from current state. Do NOT expand into a 500-token reference list — the brevity is the enforcement.

```
Tick under danger-builder. STATUS=<value>, wave=<N>.

1. First tool call MUST be Agent(subagent_type=ceo-agent) with directive "stall-monitor". Orchestrator role-play forbidden.
2. After ceo-agent returns, route per command-center/management/danger-builder-mode.md § Tick behavior steps 1-9.
3. Continue working in this turn until: IDLE, BLOCKED-awaiting-founder, 75% context, or DONE.
   Programmatic waits <10 min (CI, fast-deploy probe, monitor poll) → poll inside the turn via Bash(run_in_background=true) + Monitor + until-loop. Do NOT ScheduleWakeup.
   Human / external waits >10 min (founder reply, code review, queued deploy) → write handoff.md, then ScheduleWakeup at STATUS-appropriate delay.
```

This prompt fires every tick. The orchestrator reads it BEFORE picking visible work, so Step 0 spawn + chunking-rule are structural, not advisory.

## Routing thresholds

### STATUS routing table

| STATUS value | What you MUST do | Next tick delay |
|---|---|---|
| `RUNNING` | Recover from last commit SHA + `handoff.md`. | 60s |
| `HANDOFF` | Read `handoff.md`. Resume. Set STATUS=RUNNING as first write. | 60s |
| `IDLE` | Step 0 (stall monitor) + step 4 (inbox check) first. Then `npx task-master next`. Begin if executable work exists; otherwise re-sleep. | 60s |
| `BLOCKED` | Stall monitor + inbox check still fire. If stall resolvable, nudge. Otherwise end turn, await founder. | 60s |
| `DONE` | End loop. No wakeup. | — |

All states tick at 60s. The CEO stall-detection threshold remains 600s — gating is independent of tick frequency. Faster ticks buy faster wave-pickup latency (next task picked up within ~60s of becoming available) at modest cost since pass-through spawns are lazy-loaded (~10K tokens) rather than full-doctrine spawns (~75K).

### Escalation routing table

| Escalation source | Full-autonomy behavior | danger-builder behavior |
|---|---|---|
| BOARD split (<4+/7) | Escalate to founder | **ceo-agent resolves** |
| BOARD Tier 3 strict <6+/7 | Escalate to founder | **ceo-agent resolves** |
| BOARD member HARD-STOP veto | Escalate to founder | **ceo-agent resolves** (weighs veto, records in digest) |
| Stage 0b Tier 3 product decision | BOARD (6+/7) → founder if split | BOARD (6+/7) → **ceo-agent if split** |
| Stage 1 conflicting framer vs ceo-reviewer | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| Stage 1 unbreakable monolith | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| Stage 3b design-gap 3-cap | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| Stage 7b /investigate chain exhaustion | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| daily-checkpoint buckets | BOARD resolves; splits to founder | BOARD → **ceo-agent if split or HARD-STOP** |
| roadmap-refresh-ritual founder-approval steps | founder | **ceo-agent** |
| backlog-planning founder-ask triggers | founder | **ceo-agent** |
| Stage 11 hard-stop branch (destructive / money / veto) | founder | **ceo-agent (unless ceo-bound.md restricts)** |
| Stage 4 execution errors beyond triage | founder | BOARD → **ceo-agent if split** |

## Charter semantics

`ceo-bound.md` is a restriction document:
- **Silent clause** = ceo-agent has authority.
- **Restrictive clause** = ceo-agent cannot act against it; writes amendment proposal + waits for founder.

**Charter-restriction-bump protocol (the ONE exception to act-first):**

1. ceo-agent identifies a restriction block.
2. Writes entry to `Planning/ceo-charter-proposals.md`:
   ```
   ### <timestamp> | <decision slug>
   Requested decision: <summary>
   Blocked by: ceo-bound.md § X — "<exact restriction text>"
   Proposed amendment: <specific text change>
   Rationale: <why the amendment is worth making>
   If amended, CEO would: <what the decision would be>
   ```
3. Emails founder with subject prefix `⚠ CHARTER PROPOSAL`. Decision does not execute.
4. Founder either edits `ceo-bound.md` (takes effect next mode entry; CEO retries next tick) OR sends a session message overriding one-off.

This is the ONE place ceo-agent waits for founder input.

## Anti-patterns

### 1. Do not end a turn because an external event is pending.
Why: Same as full-autonomy — Spawn-and-Block or short-wait in-loop are the only two valid paths.

### 2. Do not let ceo-agent amend `ceo-bound.md` directly.
Why: Charter is founder-owned; CEO proposes via `Planning/ceo-charter-proposals.md` only.

### 3. Do not let ceo-agent halt the loop.
Why: Kill-switch, session message, and STATUS=STOP are founder-only controls.

### 4. Do not activate danger-builder during onboarding (v0-v11).
Why: Onboarding uses founder-review regardless of mode flag; highest-taste moment requires founder presence.

### 5. Do not act on AMBIGUOUS founder replies.
Why: Ambiguous replies remain `unread` until classified; acting without classification produces wrong outcomes.

## Hard invariants (not charter-editable)

These apply regardless of `ceo-bound.md` contents:

- ceo-agent cannot amend `ceo-bound.md`.
- ceo-agent cannot amend `command-center/product/FOUNDER-BETS.md` without explicit founder approval delivered via email reply classified `APPROVE` (see `notifications/agentmail.md` § Bet proposal reply classification). Edits MUST cite the approving thread_id in the bet entry's audit footer. The check + apply step happens only at `roadmap-refresh-ritual.md` Step 1d, never mid-tick.
- ceo-agent cannot halt the loop.
- ceo-agent cannot run during onboarding (v0-v11).
- ceo-agent cannot write to project state for tools not in § Tool allowlist.
- ceo-agent cannot run the wave loop. Orchestrator owns Stages 0-11.
- ceo-agent writes to STATUS or `handoff.md` only via stall-nudge.

## Exit conditions

User triggers: "stop danger-builder" / "exit ceo mode" / "back to manual" / "pause" / "I'm back" / kill-switch file / any session message.

1. Remove `Planning/.autonomous-session` OR flip `mode:` field.
2. Do NOT modify `command-center/management/STATUS` — preserve wave state.
3. Exit `/loop` — do NOT call ScheduleWakeup.
4. Send deactivation email (template in `notifications/agentmail.md`) — session summary: decisions made, charter proposals, novel decisions, session duration.
5. Confirm in one line: `Danger-builder ended. STATUS=<value>. Deactivation email sent to <CEO_NOTIFY_EMAIL_TO>. Next escalation: <new routing>.`

**What halts the loop:**
1. Kill-switch file (`/tmp/ceo-mode-stop`) — checked every tick.
2. Founder message to the Claude Code session.
3. `STATUS=STOP` written manually.
4. Mode flag changed to anything other than `danger-builder`.
5. `ceo-bound.md` deleted or becomes empty mid-run.

Destructive actions do NOT halt the loop — they flow through normal wave-loop discipline (triage routing → specialist agents). ceo-agent authorizes; specialists execute.

## Notifications

One email per CEO decision. Founder replies in-thread. Agent reads inbox every tick (step 4) and acts on classified replies. No daily batching.

Notification triggers: CEO decision recorded, charter-restriction bump, mode activation, mode deactivation, halt event, CLARIFY follow-up. Templates + reply classification + failure handling: see `notifications/agentmail.md`.

Key points:
- Body capped ~12 lines. Full rationale in `Planning/ceo-digest-YYYY-MM-DD.md`.
- Ambiguous replies never act.
- Send failure: 3 retries with backoff; 10-in-1-hour cascade halts loop.
- `Planning/ceo-digest-YYYY-MM-DD.md` is the audit log; threads are the live conversation.

## Audit + rollback

- Every ceo-agent decision emits a notification email + appends to the daily audit file.
- Founder can stop the session at any time via kill-switch or message.
- Founder reviews email → disagrees → session stopped → orchestrator rolls back the decision's artifacts (revert commit, restore task status, undo file writes).
- `/retro` captures patterns → routes per `conflict-resolution.md` § Retro feedback loop.
- Retro lessons flow back into `ceo-agent-instructions.md` via founder edits (CEO cannot self-amend instructions).

## Latency + cost

Per ceo-agent invocation: ~30-60 sec + ~20-30K tokens. Compared to BOARD (~40-50K tokens, ~1-2 min): ceo-agent is faster and cheaper, fires only on BOARD failures. Expected steady-state budget: ~$1-3/day in ceo-agent token cost above normal wave-loop cost.

## Precedence

1. Flag file wins over wave-plan front-matter. `autonomous_mode` field is deprecated.
2. Hard limits always apply regardless of charter — amending charter/bets, halting loop, onboarding are permanently out of reach.
3. Founder message at any time → orchestrator halts loop and responds. No exceptions.
4. STATUS is deterministic, never a question.
5. Charter restrictions beat ceo-agent judgment. If `ceo-bound.md` § X says no, ceo-agent cannot act against it.
6. BOARD still runs first. ceo-agent activates only when BOARD fails to resolve or a HARD-STOP fires.

## Onboarding carve-out

ceo-agent and BOARD are both OFF during v0-v11 onboarding. Founder-review always applies. Full-autonomy and danger-builder activate only after v11 handoff.
