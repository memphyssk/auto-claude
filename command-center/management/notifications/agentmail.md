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
- `[ceo-agent] <project> — ⚠ BET PROPOSAL — <bet-slug>` (CEO drafts bet candidate for FOUNDER-BETS § Live; replies handled at ritual Step 1d, NOT per-tick)
- `[ceo-agent] <project> — ⚠ STRATEGIC GAP — <gap-slug>` (signal-only, no draft; founder action: schedule attention)

## Body format — one-liner

Every decision email is a single past-tense sentence: what was decided + brief context. No headers, no formal fields, no per-email override hint (founder learned it from the activation email).

```
<single sentence: action + context>.

Digest: Planning/ceo-digest-<YYYY-MM-DD>.md
```

Examples:

```
Decided 60-day data retention over 7 years; BOARD split 3-3-1 with founder-proxy as deciding lens.

Digest: Planning/ceo-digest-2026-04-25.md
```

```
Authorized Paddle switch from Stripe; risk-manager flagged HARD-STOP on chargeback policy, override recorded.

Digest: Planning/ceo-digest-2026-04-25.md
```

```
Cleared stale monitor M7 (Railway deploy timed out 18 min ago, no recovery signal); created TRIAGE task #142.

Digest: Planning/ceo-digest-2026-04-25.md
```

Cognitive patterns, reversibility classification, charter analysis, monitor specification all live in the digest file. The email is the push.

The approve/ack path is absent — approval is implicit in not-replying.

### Exception — charter-proposal body

When ceo-agent hits a `ceo-bound.md` §§ 1-5 restriction, the email reports a proposal, not an action. Subject prefix `⚠ CHARTER PROPOSAL`. Body:

```
Want to <action> but blocked by ceo-bound.md § X — "<short restriction quote>". Proposed amendment: <one-line text change>.

To unblock: edit ceo-bound.md, or reply "override: <X>" for one-off, or reply "reject" to keep the restriction.
Proposal: Planning/ceo-charter-proposals.md (latest entry)
```

This is the ONE email class that gates on founder response. Decision does NOT execute until founder replies or amends the charter.

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

## Bet proposal reply classification

Separate from per-decision replies. Applies to threads with subject prefix `⚠ BET PROPOSAL`. Three classes only.

| Class | Trigger | CEO action | Closes thread? |
|---|---|---|---|
| `APPROVE` | reply contains "approve" / "yes" / "ok" / "apply" / 👍 — with or without inline edits | If edits in reply → interpret + apply with edits + confirm in-thread quoting applied text. Else apply verbatim. Audit footer with `thread_id`. | yes |
| `REJECT` | reply contains "reject" / "no" / "don't apply" / "skip" / "not now" | Log to `Planning/ceo-deferrals.md` | yes |
| `DISCUSSION` | anything else — questions, chatty replies, partial thoughts, refinements | CEO interprets as discussion, replies in-thread with rationale or refined draft, awaits next reply | no |

**24h cap.** Timer resets on every CEO message in the thread (proposal or discussion follow-up). Founder must either terminal-reply (APPROVE/REJECT) or continue discussion within 24h. Silence past 24h after CEO's most recent message → original thread auto-classifies `DEFER`, closes, and a fresh `⚠ BET PROPOSAL` thread spawns with the same content (refreshed if state has changed).

Every terminal class closes the thread. Subsequent founder messages on a closed thread are logged warnings, not acted on.

---

## Bet proposal flow

- CEO-agent drafts → emails `⚠ BET PROPOSAL` → ritual proceeds with current bets
- Founder reply lands in inbox at any time
- Reply processed at next ritual Step 1d, NOT per-tick
- Approved bet appears in `FOUNDER-BETS.md § Live` with audit footer
- Audit footer format (literal):

  > _Authored via email approval. Thread: `<thread_id>`. Approved: YYYY-MM-DD._

- Retirement proposals use the same flow: proposal text begins `RETIRE: <bet slug>`. APPROVE moves bet from § Live to § Retired with audit footer; APPROVE with edits allows retire-with-replacement.

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
ceo-agent active. Decisions arrive in new threads in this inbox. Reply "undo", "modify <X>", or "why?" to override; silence = ack. Charter has <N> active restrictions.

Kill: touch /tmp/ceo-mode-stop. Charter: command-center/management/ceo-bound.md.
```

## Deactivation email

Subject: `[ceo-agent] <project> — danger-builder DEACTIVATED`

```
ceo-agent off. <N> decisions, <M> rejections, <K> modifications, <J> clarifications, <P> charter proposals this session. Reason: <kill-switch | founder-message | explicit-exit | charter-destroyed | inbox-unreachable-cascade>.

Digest: Planning/ceo-digest-<YYYY-MM-DD>.md through <end date>.
```

## Halt email

Subject: `[ceo-agent] <project> — ⚠ LOOP HALTED — <cause>`

```
Loop halted: <cause>. STATUS=<value> at <ISO timestamp>. Resume: say "danger builder" in Claude Code after fixing the cause.
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
