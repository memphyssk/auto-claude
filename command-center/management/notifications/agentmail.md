# Management notifications — AgentMail (two-way flow)

Spec for ceo-agent ↔ founder email communication via AgentMail under `danger-builder` mode. One thread per CEO decision. Founder replies in-thread. Agent reads inbox every tick and acts on replies.

**Why AgentMail, not Resend.** Management involves back-and-forth: founder replies "undo" or "do X instead" or "why this choice?". AgentMail supports persistent inboxes, threads, and replies — the agent reads founder responses and acts on them. Resend is stateless one-shot sends — right for product transactional email, wrong for a conversation.

---

## Prerequisites

- **AgentMail CLI installed:** `npm install -g agentmail-cli` (see `command-center/setup-tools/install.md` § 1)
- **Env var set:** `export AGENTMAIL_API_KEY=am_us_xxxxxxxxxxxx` (at machine scope, e.g. `~/.bashrc`)
- **Domain verified at AgentMail:** follow `command-center/setup-tools/install.md` § 1 before first activation. Without a verified custom domain, emails use `@agentmail.to` — works for testing, not production.
- **ceo-agent inbox created:** `ceo@<your-domain>` — same install.md section walks through creation.

## Required env vars

| Var | Purpose |
|---|---|
| `AGENTMAIL_API_KEY` | AgentMail API key (get from <https://agentmail.to>) |
| `CEO_INBOX_ID` | Inbox ID for the ceo-agent mailbox (e.g. `inb_abc123`). Returned on inbox creation. |
| `CEO_NOTIFY_EMAIL_TO` | Founder's email address — the human who receives and replies |
| `CEO_NOTIFY_PROJECT_NAME` | Optional. Shows in subject lines. Defaults to directory name. |

Set at machine scope (`~/.bashrc`). `CEO_INBOX_ID` is opaque — treat as sensitive; don't commit.

---

## Tick-behavior integration (10-min polling)

Every `/loop` tick under `danger-builder` begins with inbox read before any decision work. See `danger-builder-mode.md` § Tick behavior for full flow.

1. **Read inbox** — `agentmail inboxes:threads list --inbox-id "$CEO_INBOX_ID" --label unread --format json`
2. For each unread thread:
   - Fetch thread messages: `agentmail inboxes:threads get --inbox-id "$CEO_INBOX_ID" --thread-id <id> --format json`
   - Classify the founder reply (see § Reply classification)
   - Execute the classified action
   - Mark thread read: update message label to remove `unread`
3. Continue to regular tick work (STATUS routing, decisions, etc.)

Idle-tick cadence is 600s — aligns with the ceo-agent stall monitor's 600s threshold so a single tick covers both inbox-read and stall-check. Active ticks (RUNNING/HANDOFF) use 60s.

**Failure on inbox read:** retry with exponential backoff (30s → 2min → 10min). After 3 failures, skip inbox read this tick; log to `Planning/agentmail-failures.log`; continue with decisions. Cascade: 10 consecutive failures in 1 hour = halt loop (STATUS=BLOCKED).

---

## Send mechanics — new decision → new thread

```bash
agentmail inboxes:messages send \
  --inbox-id "$CEO_INBOX_ID" \
  --to "$CEO_NOTIFY_EMAIL_TO" \
  --subject "$SUBJECT" \
  --text "$BODY" \
  --format json
```

Capture the response `message_id` + `thread_id` — record both in the audit entry. `thread_id` is the canonical handle for founder replies.

**Subject-line gotcha:** subjects starting with `[` are parsed as YAML by the CLI and fail. Ensure proper shell quoting — put the full subject string in double quotes.

## Send mechanics — follow-up in existing thread

```bash
agentmail inboxes:messages reply \
  --inbox-id "$CEO_INBOX_ID" \
  --message-id "$LAST_FOUNDER_MESSAGE_ID" \
  --text "$BODY" \
  --format json
```

Use `--message-id` of the founder's reply to keep the thread coherent.

---

## Subject-line format

```
[ceo-agent] <project> — <decision-slug>
```

Prefix variants:
- `[ceo-agent] <project> — ⚠ ONE-WAY — <decision-slug>` (irreversible)
- `[ceo-agent] <project> — ⚠ CHARTER PROPOSAL — <decision-slug>` (restriction bump)
- `[ceo-agent] <project> — ⚠ HARD-STOP OVERRIDDEN — <decision-slug>` (BOARD veto authorized)
- `[ceo-agent] <project> — NOVEL — <decision-slug>` (no precedent)
- `[ceo-agent] <project> — ⚠ LOOP HALTED — <cause>` (halt event)

## Body format — unified act-first template (~12 line cap)

Every decision email uses past-tense phrasing. The action happened already; the email tells the founder what was done.

```
ceo-agent acted. <ISO timestamp>

Context:       <one-line: what triggered this — BOARD split / stage / rule / stall>
Action taken:  <past tense: "authorized Paddle switch", "picked up wave 42", "cleared stale monitor M7">
Why:           <1-2 sentences; cognitive patterns cited>

Charter:       <"no applicable restriction" OR "ceo-bound.md § X applied">
Reversibility: <two-way | one-way | medium>
Novelty:       <true | false>
Monitor:       <what signal tells us this worked + who watches + by when>

Full entry:    Planning/ceo-digest-<YYYY-MM-DD>.md

Override (post-hoc — work is already in motion):
  no reply                    → tacit acceptance
  reject | undo               → roll back this action; agent reverts within ~10 min
  modify: <instruction>       → change course; agent executes new instruction instead
  why? | clarify              → agent replies in-thread with fuller rationale
```

The approve/ack path is absent — approval is implicit in not-replying.

### Exception — charter-proposal body

When ceo-agent hits a `ceo-bound.md` §§ 1-5 restriction, the email reports a proposal, not an action. Subject prefix `⚠ CHARTER PROPOSAL`. Body:

```
ceo-agent proposes a charter amendment. <ISO timestamp>

Decision requested: <one-line: what ceo-agent would do if permitted>
Blocked by:         ceo-bound.md § X — "<exact restriction text>"
Proposed amendment: <specific text change to ceo-bound.md>
Rationale:          <2-3 sentences: why the amendment is worth making>
If amended, CEO would: <one-line outcome>

Full proposal: Planning/ceo-charter-proposals.md (latest entry)

Action required — decision does NOT execute until you respond:
  1. Edit command-center/management/ceo-bound.md to apply the amendment
     (takes effect on next mode entry; CEO retries on next relevant tick)
  2. Reject: take no action — CEO continues respecting the restriction
  3. Override one-off: reply "override: <instruction>"
     (CEO executes the specific decision without amending charter)
```

This is the ONE email class that gates on founder response.

---

## Reply classification

| Founder reply pattern | Classification | Agent action |
|---|---|---|
| `approve` / `ack` / `ok` / `yes` / 👍 / empty / no reply | ACK | Tacit or explicit acceptance. Mark thread read. |
| `reject` / `undo` / `no` / `revert` / `rollback` | REJECT | Roll back artifacts (revert commits, restore task state, undo file writes). Reply confirming rollback complete. |
| `modify: <X>` / `change to X` / `do X instead` | MODIFY | Execute new instruction. Roll back original if conflicting. Reply with new outcome. |
| `override: <X>` (charter-proposal threads only) | OVERRIDE | Execute the original blocked decision without amending charter. Reply confirming. |
| `why?` / `explain` / `why this?` | CLARIFY | Reply in-thread with expanded rationale. No state change. |
| Anything else (natural language, unclassifiable) | AMBIGUOUS | Reply asking for one of the classification verbs. Keep thread unread until resolved. |

**Silence = ACK** under act-first semantics. Ambiguous replies never default to ACK or REJECT.

Agent must re-read the charter before executing a MODIFY reply. If MODIFY bumps a charter restriction, treat as a new charter proposal.

---

## Thread-label protocol

| Label | Meaning |
|---|---|
| `unread` | Default on incoming replies. Agent removes after classifying + acting. |
| `ceo-decision` | Applied to every decision thread created. Lets founder filter CEO emails. |
| `charter-proposal` | Applied to charter-restriction-bump threads. |
| `halted` | Applied when loop halted mid-thread. |
| `rolled-back` | Applied after REJECT execution. Thread dormant but preserved for audit. |

Labels set via `agentmail inboxes:messages update --label ...`. Read-side filtering via `--label unread`.

---

## Activation email

Subject: `[ceo-agent] <project> — danger-builder ACTIVATED`

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

**Send failure:**
1. Retry with exponential backoff: 30s → 2min → 10min (3 attempts)
2. After 3 failures: log to `Planning/agentmail-failures.log`; append `**NOTIFICATION FAILED:** <error>` to audit entry; do NOT halt loop
3. 10 consecutive send failures in 1 hour → halt loop with STATUS=BLOCKED

**Inbox-read failure:**
1. Retry with exponential backoff same as above
2. After 3 failures: skip inbox read this tick; log; continue with decisions
3. 10 consecutive read failures in 1 hour → halt loop with STATUS=BLOCKED

**Reply-parse failure:**
- Do NOT act on ambiguous replies
- Keep thread marked `unread`
- On next tick, send one more CLARIFY reply
- After 3 clarification attempts with no unambiguous response: send "I can't classify your intent — reply with one of: approve, reject, modify <X>, or run `touch /tmp/ceo-mode-stop` to halt"

---

## Verification before mode activation

```bash
# CLI installed + key valid
agentmail --version                                 # expect 0.7.x or higher
agentmail --format json inboxes list | head -20    # expect a JSON array

# Target inbox exists
agentmail inboxes get --inbox-id "$CEO_INBOX_ID" --format json    # expect the inbox object
```

If any of the first two checks fail, mode activation aborts.

---

## Why keep `Planning/ceo-digest-YYYY-MM-DD.md` alongside AgentMail threads?

AgentMail is the push + 2-way channel; the file is the audit log. Threads are the live conversation; file is append-only, committed to git history, survives AgentMail retention limits. Retro / post-mortem reads the file; real-time feedback happens in the thread. Two separate roles; neither replaces the other.
