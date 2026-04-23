# Management notifications — AgentMail (two-way flow)

Spec for ceo-agent ↔ founder email communication via AgentMail under `danger-builder` mode. One thread per CEO decision. Founder replies in-thread. Agent reads inbox every tick and acts on replies.

**Why AgentMail, not Resend, for management emails.** Management involves back-and-forth: founder reviews a decision, replies "undo" or "do X instead" or "why this choice?". AgentMail is built around persistent inboxes, threads, and replies — the agent can read founder responses and act on them. Resend is stateless one-shot sends — right for product-facing transactional email (signup verification, password reset), wrong for a conversation. Keep the concerns separate: AgentMail for management, Resend (optional) for product.

---

## Prerequisites

- **AgentMail CLI installed:** `npm install -g agentmail-cli` (see `command-center/setup-tools/install.md` § 1)
- **Env var set:** `export AGENTMAIL_API_KEY=am_us_xxxxxxxxxxxx` (at machine scope, e.g. `~/.bashrc`)
- **Domain verified at AgentMail:** follow `command-center/setup-tools/install.md` § 1 "AgentMail — custom domain + ceo-agent inbox setup" before first activation. Without a verified custom domain, emails use `@agentmail.to` test sender — works for testing, not for long-term operation.
- **ceo-agent inbox created:** `ceo@<your-domain>` — same install.md section walks through creation.

## Required env vars

| Var | Purpose |
|---|---|
| `AGENTMAIL_API_KEY` | AgentMail API key (get from <https://agentmail.to>) |
| `CEO_INBOX_ID` | AgentMail inbox ID for the ceo-agent mailbox (e.g. `inb_abc123`). Returned when you create the inbox via `agentmail inboxes create`. |
| `CEO_NOTIFY_EMAIL_TO` | Founder's email address — the human who receives and replies |
| `CEO_NOTIFY_PROJECT_NAME` | Optional. Shows in subject lines. Defaults to directory name. |

Set at machine scope (`~/.bashrc`) for agent inheritance. `CEO_INBOX_ID` is opaque — treat as sensitive-ish (someone with it + the API key can read all threads). Don't commit.

---

## Tick-behavior integration (10-min polling — aligned with ceo-agent stall monitor cadence)

Every `/loop` tick under `danger-builder` now begins with **inbox read** before any decision work. See `danger-builder-mode.md` § Tick behavior for full flow. Condensed:

1. **Read inbox** — `agentmail inboxes:threads list --inbox-id "$CEO_INBOX_ID" --label unread --format json`
2. For each unread thread:
   - Fetch thread messages: `agentmail inboxes:threads get --inbox-id "$CEO_INBOX_ID" --thread-id <id> --format json`
   - Classify the founder reply (see § Reply classification below)
   - Execute the classified action
   - Mark thread read: update message label to remove `unread` (see CLI help for `inboxes:messages update`)
3. Continue to regular tick work (STATUS routing, decisions, etc.)

**Idle-tick cadence is 600s (10 min)** — founder replies are checked every 10 minutes when STATUS=IDLE or BLOCKED. This cadence aligns with the ceo-agent stall monitor's 600s threshold (see `danger-builder-mode.md` § Tick behavior step 0 + `ceo-agent-instructions.md` § Stall-monitor procedure) so a single tick covers both inbox-read and stall-check. Active ticks (RUNNING/HANDOFF) still use 60s.

**Failure on inbox read:** retry with exponential backoff (30s → 2min → 10min). After 3 failures for a single tick, skip inbox read *this tick* but continue with decisions; log to `Planning/agentmail-failures.log`. Cascade: 10 consecutive inbox-read failures in 1 hour = halt loop (STATUS=BLOCKED). Same principle as notification failures: if founder can't be reached, don't keep deciding.

---

## Send mechanics — new decision → new thread

When ceo-agent completes a decision, send a fresh email (creates a new thread):

```bash
agentmail inboxes:messages send \
  --inbox-id "$CEO_INBOX_ID" \
  --to "$CEO_NOTIFY_EMAIL_TO" \
  --subject "$SUBJECT" \
  --text "$BODY" \
  --format json
```

Capture the response `message_id` + `thread_id` — record both in the audit entry (`Notification sent:` + `Thread:` fields). `thread_id` becomes the canonical handle for anything the founder replies to.

**Subject-line gotcha:** subjects starting with `[` are parsed as YAML by the CLI and fail with "value is not allowed in this context". Either quote the subject (shell handles it) or prefix with a non-bracket character. The `[ceo-agent]` convention still works — shells quote correctly when the full string is in double quotes — but agents building the subject programmatically must ensure proper quoting before passing to the CLI.

## Send mechanics — follow-up in existing thread

When ceo-agent needs to speak again on the same decision (e.g., founder asked a clarifying question and the agent answers), reply in-thread:

```bash
agentmail inboxes:messages reply \
  --inbox-id "$CEO_INBOX_ID" \
  --message-id "$LAST_FOUNDER_MESSAGE_ID" \
  --text "$BODY" \
  --format json
```

`--message-id` is the founder's reply that the agent is answering. This keeps the thread coherent instead of spawning new threads.

---

## Subject-line format

```
[ceo-agent] <project> — <decision-slug>
```

Prefix variants (match Resend spec for familiarity):
- `[ceo-agent] <project> — ⚠ ONE-WAY — <decision-slug>` (irreversible)
- `[ceo-agent] <project> — ⚠ CHARTER PROPOSAL — <decision-slug>` (restriction bump)
- `[ceo-agent] <project> — ⚠ HARD-STOP OVERRIDDEN — <decision-slug>` (BOARD veto authorized)
- `[ceo-agent] <project> — NOVEL — <decision-slug>` (no precedent)
- `[ceo-agent] <project> — ⚠ LOOP HALTED — <cause>` (halt event)

## Body format (~12 line cap)

```
ceo-agent decided. <ISO timestamp>

Context:       <one-line: what was asked>
Decision:      <one-line outcome>
Rationale:     <1-2 sentences; cognitive patterns applied>

Charter:       <"no applicable restriction" OR "ceo-bound.md § X">
Reversibility: <two-way | one-way | medium>
Novelty:       <true | false>
Monitor:       <what signal + who + by when>

Full entry:    Planning/ceo-digest-<YYYY-MM-DD>.md

Reply options (agent reads your response within 10 min):
  approve | ack               → no-op, thread marked read
  reject | undo               → roll back this decision
  modify: <instruction>       → execute new instruction instead
  why? | clarify              → agent replies in-thread with rationale
```

The Reply options block trains founder inbox heuristics — reply with one of those verbs and the agent acts predictably.

### Nudge-specific body variant

When the email is a stall-monitor NUDGE (subject prefixed `⚠ NUDGE`), use past-tense phrasing to signal that the work is already in motion — this is notification of something done, not a request for approval:

```
ceo-agent nudged. <ISO timestamp>

Stall:         <STATUS value that stalled> for <duration e.g. "12 min">
Action taken:  <past tense: "picked up wave 42", "cleared stale monitor M7", etc.>
Why:           <1-2 sentences: the classification and why this unblocks>

Charter:       <"no applicable restriction" OR "ceo-bound.md § X">
Reversibility: two-way door   (nudges are always reversible)
Monitor:       <what signal tells us the nudge worked — often "STATUS transitions off IDLE within next tick">

Full entry:    Planning/ceo-digest-<YYYY-MM-DD>.md

Override (post-hoc — work is already in motion):
  no reply                    → tacit acceptance, work continues
  reject | undo               → roll back the nudge; stall resumes for founder resolution
  modify: <instruction>       → change course; agent executes new instruction instead
  why?                        → agent replies in-thread with fuller reasoning
```

**Key phrasing difference:** "approve | ack" is absent from nudge bodies — because the action happened already, approval is implicit in not-replying. The agent is telling the founder what it did, not asking permission.

---

## Reply classification — what founder replies mean

When reading an unread reply in a thread, agent parses the first non-quoted line of the founder's message and classifies:

| Founder reply pattern | Classification | Agent action |
|---|---|---|
| `approve` / `ack` / `ok` / `yes` / 👍 / empty reply | APPROVE | Mark thread read. No rollback. Log `founder ack'd` in audit entry. |
| `reject` / `undo` / `no` / `revert` / `rollback` | REJECT | Roll back this decision's artifacts (revert commits, restore task state, undo file writes). Log `founder rejected` in audit entry. Reply in-thread confirming rollback complete. |
| `modify: <X>` / `change to X` / `do X instead` | MODIFY | Treat as new directive. Execute new instruction. Original decision rolled back if conflicting. Reply in-thread with the new outcome. |
| `why?` / `explain` / `why this?` | CLARIFY | Reply in-thread with expanded rationale (cite cognitive patterns, precedent, charter reasoning). No state change. |
| Anything else (natural language, multi-sentence) | AMBIGUOUS | Default to CLARIFY — reply in-thread asking for one of the four classification verbs. Keep thread unread from agent's perspective until resolved. |

**Ambiguous replies escalate to CLARIFY, never default to APPROVE or REJECT.** If the founder writes "hmm, I'm not sure about this" the agent asks "should I proceed, roll back, or modify?" — doesn't guess.

Agent must re-read the charter before executing a MODIFY reply. If the modify instruction bumps a `ceo-bound.md` restriction, treat as a new charter proposal: agent cannot execute MODIFY blindly just because the founder asked.

---

## Thread-label protocol

AgentMail supports arbitrary labels. Use these to keep agent state coherent:

| Label | Meaning |
|---|---|
| `unread` | Default on incoming replies from founder. Agent removes after classifying + acting. |
| `ceo-decision` | Applied by agent to every decision thread it creates. Lets founder filter "CEO emails" from noise. |
| `charter-proposal` | Applied to threads created for charter-restriction bumps. |
| `halted` | Applied when the loop halted mid-thread. Founder knows the thread is paused. |
| `rolled-back` | Applied after agent executes a REJECT. Thread is dormant but preserved for audit. |

Labels are set via `agentmail inboxes:messages update --label ...` after send. Read-side filtering via `--label unread` on `inboxes:threads list`.

---

## Activation email (sent on `danger-builder` mode entry)

Subject: `[ceo-agent] <project> — danger-builder ACTIVATED`

Body:
```
ceo-agent is now resolving all BOARD splits, HARD-STOPs, and former-founder-asks
within ceo-bound.md.

Per-decision emails arrive in this thread. Reply in-thread to approve / reject /
modify / ask for clarification. Agent reads your reply within 10 minutes.

Charter last modified: <mtime>
Restrictions active:   <count>
Inbox:                 ceo@<your-domain>  (inbox ID: $CEO_INBOX_ID)
Started:               <ISO timestamp>

Controls:
  Kill (immediate):    touch /tmp/ceo-mode-stop
  Session halt:        send any message to the Claude Code session
  Charter edit:        edit command-center/management/ceo-bound.md
```

## Deactivation email

Subject: `[ceo-agent] <project> — danger-builder DEACTIVATED`

Body:
```
Session ended at <ISO timestamp>.
Reason: <kill-switch | founder-message | explicit-exit | charter-destroyed | inbox-unreachable-cascade>

Decisions made this session: <count>
Founder replies processed:   <count>  (approvals <N>, rejections <M>, modifications <K>, clarifications <J>)
Charter proposals surfaced:  <count>
Novel decisions:             <count>

Next escalation routes via: <new mode's behavior>

All decisions logged: Planning/ceo-digest-<YYYY-MM-DD>.md through <end date>.
```

## Halt email

Subject: `[ceo-agent] <project> — ⚠ LOOP HALTED — <cause>`

Body:
```
The danger-builder loop halted.

Cause:  <kill-switch-file | charter-destroyed | inbox-unreachable-cascade | delivery-failure-cascade>
Time:   <ISO timestamp>
STATUS: <value at halt>

To resume: fix the cause, then say "danger builder" again in Claude Code.
If inbox-unreachable: run `agentmail inboxes:get --inbox-id $CEO_INBOX_ID` to diagnose.
```

---

## Failure handling

**Send failure** (agentmail exit non-zero on a decision-notification send):
1. Retry with exponential backoff: 30s → 2min → 10min (3 attempts)
2. After 3 failures: log to `Planning/agentmail-failures.log`; append `**NOTIFICATION FAILED:** <error>` line to the decision's audit entry; do NOT halt the loop (decision stands)
3. 10 consecutive send failures in 1 hour → halt loop with STATUS=BLOCKED (notification cascade)

**Inbox-read failure** (agentmail exit non-zero on `inboxes:threads list`):
1. Retry with exponential backoff same as above
2. After 3 failures: skip inbox read this tick; log; continue with decisions (tick proceeds as if no new replies)
3. 10 consecutive read failures in 1 hour → halt loop with STATUS=BLOCKED (inbox cascade)

**Reply-parse failure** (can't classify founder reply even after CLARIFY back-and-forth):
- Do NOT act on ambiguous replies
- Keep thread marked `unread` from agent's state
- On next tick, agent sends one more CLARIFY reply
- After 3 clarification attempts with no unambiguous response, escalate to founder kill-switch prompt in the next email: "I can't classify your intent — reply with one of: approve, reject, modify <X>, or run `touch /tmp/ceo-mode-stop` to halt"

---

## Verification before mode activation

At `danger-builder` mode entry, run these checks (mode-entry prereqs):

```bash
# CLI installed + key valid
agentmail --version                                 # expect 0.7.x or higher
agentmail --format json inboxes list | head -20    # expect a JSON array (possibly empty)

# Target inbox exists
agentmail inboxes get --inbox-id "$CEO_INBOX_ID" --format json    # expect the inbox object

# Send test works (skipped if founder doesn't want a test email on every activation)
# agentmail inboxes:messages send --inbox-id "$CEO_INBOX_ID" --to "$CEO_NOTIFY_EMAIL_TO" \
#   --subject "test" --text "activation test, ignore" --format json
```

If any of the first three fail, mode activation aborts. The connectivity test ensures the mail pipeline works before the founder commits to a long-running session.

---

## Why keep `Planning/ceo-digest-YYYY-MM-DD.md` alongside AgentMail threads?

Same reasoning as with Resend: **AgentMail is the push + 2-way channel; the file is the audit log**.
- Threads are the live conversation
- File is append-only, committed to git history, survives AgentMail retention limits
- Retro / post-mortem reads the file; real-time feedback happens in the thread

Two separate roles; neither replaces the other.

---

## Alternative future paths

If you want richer interaction later:
- **SMS via Twilio** — for halt-the-world escalations (charter proposal with financial impact > threshold)
- **Slack integration** — AgentMail's webhooks can fire into a Slack channel for real-time visibility
- **Phone call via Retell/Vapi** — for truly critical decisions (one-way doors with high magnitude)

Not implementing now. AgentMail two-way email is the baseline.
