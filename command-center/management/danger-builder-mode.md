# Mode — Danger-Builder

Unconditional wave-loop execution with **ceo-agent as BOARD tiebreaker + hard-stop resolver + founder-ask fallback**. Founder is notified per-decision via Resend email but does not gate runtime. Intended for indefinite (365-day) autonomous operation.

**Relationship to full-autonomy:** `danger-builder` extends full-autonomy. Everything `full-autonomy` does, `danger-builder` also does. The addition: when BOARD splits, deadlocks, or a member issues a HARD-STOP veto, ceo-agent resolves instead of routing to founder. When any other would-be founder-ask fires, ceo-agent resolves. The founder is reached only via kill-switch, session message, or per-decision notification email.

**Hard prerequisite:** `ceo-bound.md` must exist at `command-center/management/ceo-bound.md`. Charter is founder-authored and defines the *restrictions* on ceo-agent authority. A blank or missing charter = unlimited ceo-agent authority, which is usually not what you want — always review `ceo-bound.md` before activating.

---

## Activation

When the user says any of:
- "danger builder" / "danger-builder mode"
- "ship it mode" / "ceo mode" / "ceo-agent mode"
- "run indefinitely" / "365 mode"
- "full delegation" / "total autonomy"

You MUST perform the following sequence in a single mode-entry turn, in order. You MUST NOT begin wave execution in this turn — first real work happens on tick 1.

### 1. Verify prerequisites

All of the following MUST be true. If any fails, abort mode entry and surface to founder:

- [ ] `command-center/management/ceo-bound.md` exists and is non-empty
- [ ] `command-center/management/ceo-bound.md` § 0 "Mode activation prerequisites" all boxes can be checked (verify each)
- [ ] AgentMail CLI installed: `agentmail --version` returns 0.7.x or higher
- [ ] `AGENTMAIL_API_KEY` env var is set and valid: `agentmail --format json inboxes list` returns a JSON array (empty or otherwise)
- [ ] Custom domain verified at AgentMail (per `command-center/setup-tools/install.md` § 1 "AgentMail — custom domain + ceo-agent inbox setup") — `agentmail --format json domains get --domain-id <your-domain>` shows `status: VERIFIED`
- [ ] ceo-agent inbox created and `CEO_INBOX_ID` env var set: `agentmail --format json inboxes get --inbox-id "$CEO_INBOX_ID"` returns the inbox object
- [ ] `CEO_NOTIFY_EMAIL_TO` env var is set (founder's email)
- [ ] `Planning/` directory exists and is writable
- [ ] `command-center/Sub-agent Instructions/ceo-agent-instructions.md` exists (ceo-agent instruction file)
- [ ] BOARD composition is intact (all 7 member agent files present — see `board-members.md`)
- [ ] Kill-switch mechanism tested: `touch /tmp/ceo-mode-stop-test && rm /tmp/ceo-mode-stop-test` succeeds

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

Same as full-autonomy: if `command-center/management/STATUS` is missing, write `IDLE`. If present, preserve.

### 4. Send activation notice via AgentMail

Send from ceo-agent inbox (`$CEO_INBOX_ID`) to founder (`$CEO_NOTIFY_EMAIL_TO`) using the activation template in `command-center/management/notifications/agentmail.md`.

```
Subject: [ceo-agent] <project> — danger-builder ACTIVATED

ceo-agent is now resolving all BOARD splits, HARD-STOPs, and former-founder-asks
within ceo-bound.md.

Per-decision emails arrive in this thread. Reply in-thread to approve / reject /
modify / ask for clarification. Agent reads your reply within 5 minutes.

Charter last modified: <mtime of ceo-bound.md>
Restrictions active:   <count of non-(no restriction) entries>
Inbox:                 ceo@<your-domain>  (inbox ID: $CEO_INBOX_ID)
Started:               <ISO timestamp>

Controls:
  Kill (immediate):    touch /tmp/ceo-mode-stop
  Session halt:        send any message to the Claude Code session
  Charter edit:        edit command-center/management/ceo-bound.md (applies on next mode entry)
```

See `command-center/management/notifications/agentmail.md` for full send + reply mechanics, templates, and failure handling.

### 5. Launch the loop

Invoke `/loop` skill via Skill tool with the autonomous-dynamic sentinel. Same as full-autonomy.

### 6. Confirm in one line

`Danger-builder ON. STATUS=<value>. ceo-agent resolving BOARD escalations + founder-asks within ceo-bound.md. Per-decision email → <CEO_NOTIFY_EMAIL_TO>. Kill: touch /tmp/ceo-mode-stop.`

### 7. End the turn

---

## Tick behavior — same base as full-autonomy, with CEO additions

On every `/loop` tick under `danger-builder`:

1. **Kill-switch check (FIRST).** If `/tmp/ceo-mode-stop` exists: set STATUS=BLOCKED, send halt email (see § Notifications), exit loop. Do NOT call ScheduleWakeup. This supersedes all other logic.
2. **Founder-message check (session).** If any founder message arrived in the Claude Code session since last tick: halt loop, send halt email, set STATUS=BLOCKED.
3. **STATUS mode check.** Read `command-center/management/STATUS`. If value is `STOP`: halt loop per § 1 above.
4. **Inbox check (NEW under danger-builder).** Query ceo-agent inbox for unread threads: `agentmail inboxes:threads list --inbox-id "$CEO_INBOX_ID" --label unread --format json`. For each unread thread, fetch messages, classify the founder reply (APPROVE / REJECT / MODIFY / CLARIFY / AMBIGUOUS — see `notifications/agentmail.md` § Reply classification), execute the classified action, mark thread read. Do NOT act on AMBIGUOUS replies — send a CLARIFY reply in-thread and leave the thread unread.
5. **Read charter.** Re-read `ceo-bound.md`. If modified since last tick, respect new restrictions immediately. If materially changed, note in next decision's email.
6. **Route by STATUS value** (table below): RUNNING / HANDOFF / IDLE / BLOCKED / DONE.
7. **Execute routed action** until natural pause or 75% context budget.
8. **Under 75% context rule:** write handoff.md, set STATUS=HANDOFF, end turn (unchanged from full-autonomy).
9. **Update STATUS before ending turn.**
10. **Call ScheduleWakeup** with delay per STATUS table, unless STATUS=DONE or halted.
11. **Per-decision notification.** Whenever ceo-agent completes a decision this tick, immediately after writing the entry to `Planning/ceo-digest-YYYY-MM-DD.md`, send a fresh email (new thread) via AgentMail. One email per decision. Capture the returned `thread_id` into the audit entry. See `command-center/management/notifications/agentmail.md` for templates.

**Reply-handling is authoritative.** If a founder replies `reject` on an earlier decision, the rollback must execute BEFORE any new decisions this tick. Inbox check (step 4) running first ensures reply actions take precedence over new escalations.

### STATUS routing table (danger-builder — 5-min IDLE polling for inbox)

| STATUS value | What you MUST do | Next tick delay |
|---|---|---|
| `RUNNING` | Prior session died mid-turn. Recover from last commit SHA + `command-center/management/handoff.md`. | 60s |
| `HANDOFF` | Read handoff.md. Resume. Set STATUS=RUNNING as first write. | 60s |
| `IDLE` | Inbox check (step 4 of tick behavior) → if founder replied, process replies. Re-read roadmap + run `npx task-master next`. If executable work exists, begin. Otherwise re-sleep. | **300s (5 min)** |
| `BLOCKED` | Do NOT proceed. Kill-switch pending. End turn, no wakeup. | — (no wakeup; founder resumes manually) |
| `DONE` | End loop. No wakeup. | — |

**IDLE delay differs from full-autonomy (1800s → 300s)** because danger-builder needs to check the inbox for founder replies every 5 minutes. The shorter polling guarantees founder replies are acted on within ~5 min of being sent, which is the founder-experience contract AgentMail two-way flow promises.

---

## Routing table — what ceo-agent resolves under `danger-builder`

| Escalation source | Previous (full-autonomy) | danger-builder |
|---|---|---|
| BOARD split (<4+/7) | Escalate to founder | **ceo-agent resolves** |
| BOARD Tier 3 strict <6+/7 | Escalate to founder | **ceo-agent resolves** |
| BOARD member HARD-STOP veto | Escalate to founder | **ceo-agent resolves** (weighs veto, records engagement in digest) |
| Stage 0b Tier 3 product decision | BOARD (6+/7) → founder if split | BOARD (6+/7) → **ceo-agent if split** |
| Stage 1 conflicting problem-framer vs ceo-reviewer | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| Stage 1 unbreakable monolith | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| Stage 3b design-gap 3-cap | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| Stage 7b /investigate chain exhaustion | BOARD (4+/7) → founder if split | BOARD → **ceo-agent if split** |
| daily-checkpoint buckets (3-bucket resolution) | BOARD resolves; splits to founder | BOARD → **ceo-agent if split or any HARD-STOP** |
| roadmap-refresh-ritual founder-approval steps | founder | **ceo-agent** |
| backlog-planning founder-ask triggers | founder | **ceo-agent** |
| Stage 11 hard-stop branch (destructive / money / veto) | founder | **ceo-agent (unless ceo-bound.md restricts)** |
| Stage 4 execution errors beyond triage | founder | BOARD → **ceo-agent if split** |

---

## Charter semantics (critical)

Under `danger-builder`, `ceo-bound.md` is a **restriction document**:

- **Silent charter clause** = ceo-agent has authority
- **Restrictive charter clause** = ceo-agent respects it; cannot act against; may propose amendment
- **"Outside charter"** is not a concept. Only "bumped a restriction" is a concept.

**Charter-restriction-bump protocol:**

1. ceo-agent identifies: "decision would exceed ceo-bound.md § X restriction"
2. ceo-agent writes entry to `Planning/ceo-charter-proposals.md`:
   ```
   ### <timestamp> | <decision slug>
   Requested decision: <summary>
   Blocked by: ceo-bound.md § X — "<exact restriction text>"
   Proposed amendment: <specific text change>
   Rationale: <why the amendment is worth making>
   If amended, CEO would: <what the decision would be>
   ```
3. Digest surfaces the proposal that day
4. Founder edits `ceo-bound.md` (or declines); takes effect on next mode entry

**Hard limits (permanent, mode-independent):**

These remain outside reach regardless of charter silence:
- Amending `ceo-bound.md` (founder-only)
- Amending `command-center/product/FOUNDER-BETS.md` (founder-only)
- Halting the loop (founder-only via kill-switch or session message)
- Running during onboarding v0-v11 (ceo-agent off regardless)

---

## What halts the loop

Only these halt `danger-builder`:

1. **Kill-switch file** — `touch /tmp/ceo-mode-stop`. Checked at every tick. Creates STATUS=BLOCKED.
2. **Founder message** — any message to the Claude Code session. Halts on next tick.
3. **STATUS=STOP** — founder writes `STOP` to `command-center/management/STATUS`. Halts next tick.
4. **Mode flag change** — `Planning/.autonomous-session` `mode:` field changed to anything other than `danger-builder`. Exits immediately.
5. **Charter destroyed** — `command-center/management/ceo-bound.md` deleted or becomes empty mid-run. Halts + escalates; refuses to continue without charter.

Destructive actions do NOT halt the loop under `danger-builder` — they flow through normal wave-loop discipline (triage routing → specialist agents with their own safety protocols). ceo-agent *authorizes*; specialists *execute*.

---

## Notifications (per-decision + two-way replies, via AgentMail)

One email per CEO decision creates a new thread in the ceo-agent inbox. Founder replies in-thread. Agent reads the inbox on every tick (step 4 of tick behavior) and acts on classified replies. No daily batching.

Notification triggers:

1. **CEO decision recorded** → per-decision email, new thread (primary case, fires after every decision)
2. **Charter-restriction bump** → charter-proposal email, new thread with `⚠ CHARTER PROPOSAL` subject prefix
3. **Mode activation** → activation email (one-shot at mode entry)
4. **Mode deactivation** → deactivation email (one-shot at exit)
5. **Halt event** (kill-switch, charter destroyed, cascade) → halt email
6. **CLARIFY follow-up** → agent replies in the same thread as the founder's ambiguous or `why?` message

Send mechanics + templates + reply classification + failure handling: see `command-center/management/notifications/agentmail.md`. That file is the single source of truth for notification format.

Key points:
- **Body is capped ~12 lines.** Full decision rationale still lands in `Planning/ceo-digest-YYYY-MM-DD.md` (the audit log); the email is the push summary.
- **Two-way flow.** Founder replies (`approve`, `reject`, `modify: X`, `why?`) are parsed + acted on within ~5 min (IDLE tick cadence). See `agentmail.md` § Reply classification for the full taxonomy.
- **Ambiguous replies never act.** If the agent can't classify a reply, it sends one CLARIFY reply in-thread and leaves the thread unread until resolved.
- **Failure handling.** Send failure: 3 retries with backoff; single failure logged + decision stands; 10-in-1-hour cascade halts the loop. Inbox-read failure: skip this tick + log; 10-in-1-hour cascade halts. Founder unreachable = don't keep deciding.
- **The daily `Planning/ceo-digest-YYYY-MM-DD.md` file still exists** as the audit surface. Threads are the live conversation; file is the log. Two separate roles.

---

## Audit + rollback

Same surface as BOARD under full-autonomy, plus per-decision email signal:
- Every ceo-agent decision emits a notification email (push) + appends to the daily audit file (log)
- Founder can stop session at any time via kill-switch or message
- Founder reviews email → disagrees → session stopped → orchestrator rolls back the specific decision's artifacts (revert commit, restore task status, undo file writes). The per-decision email is designed to enable founder response within minutes, not next-day.
- `/retro` captures the pattern → routes per `conflict-resolution.md` § Retro feedback loop
- Retro lessons flow back into `ceo-agent-instructions.md` via founder edits (CEO cannot self-amend instructions)

---

## Latency + cost

Per ceo-agent invocation: ~30-60 sec + ~20-30K tokens (single agent, fresh context, reading list + decision + digest-file write + notification email send).

Compared to BOARD (~40-50K tokens, 7 parallel agents, ~1-2 min): ceo-agent is faster and cheaper, but only fires on BOARD failures. Net cost per wave ~= BOARD baseline + occasional ceo-agent.

Acceptable for 365-day operation. Expected budget for a steady-state production project: ~$1-3/day in ceo-agent token cost, on top of normal wave-loop cost.

---

## Precedence

1. **Flag file wins** over wave-plan front-matter (same as full-autonomy; `autonomous_mode` field is deprecated).
2. **Hard limits always apply** regardless of charter — amending charter/bets, halting loop, onboarding all permanently out of reach.
3. **Founder message at any time** → orchestrator halts loop and responds. No exceptions.
4. **STATUS is deterministic**, never a question. 75% context rule + STATUS=HANDOFF answers continue-vs-fresh.
5. **Charter restrictions beat ceo-agent judgment.** If ceo-bound.md § X says `no contracts > $500/mo MRR`, ceo-agent cannot authorize a $600/mo contract even if its judgment says yes. Amendment proposal only.
6. **BOARD still runs first.** ceo-agent is not a BOARD replacement; BOARD convenes normally, ceo-agent only activates when BOARD fails to resolve or a HARD-STOP fires.

---

## Deactivation

User triggers:
- "stop danger-builder" / "exit ceo mode" / "back to manual"
- "pause" / "I'm back"
- kill-switch file created
- any message to the session during a danger-builder run

When deactivated:
1. Remove `Planning/.autonomous-session` OR flip `mode:` to `founder-review` / `semi-assisted` / `full-autonomy`
2. Do NOT modify `command-center/management/STATUS` — preserve wave state
3. Exit `/loop` — do NOT call ScheduleWakeup
4. Send deactivation email (template in `notifications/resend.md`) — session summary: decisions made, charter proposals, novel decisions, session duration
5. Confirm in one line: `Danger-builder ended. STATUS=<value>. Deactivation email sent to <CEO_NOTIFY_EMAIL_TO>. Next escalation: <new routing>.`

---

## Onboarding carve-out

ceo-agent and BOARD are both OFF during `command-center/rules/onboarding/` (v0-v11) regardless of mode. Onboarding uses founder-review. Full-autonomy and danger-builder activate only after v11 handoff. This is the same rule as full-autonomy mode; repeated here for clarity.
