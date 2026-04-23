# Decision notifications — Resend

Spec for sending per-decision notification emails via Resend under `danger-builder` mode. One email per CEO decision. Short, scannable, actionable.

## Required env vars

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key (get from <https://resend.com/api-keys>) |
| `CEO_NOTIFY_EMAIL_TO` | Founder email address (single recipient) |
| `CEO_NOTIFY_EMAIL_FROM` | Optional. Defaults to `ceo-agent@<your-domain>` (domain must be verified at Resend). If unset, uses `onboarding@resend.dev` test sender (free tier, verified-address-only). |
| `CEO_NOTIFY_PROJECT_NAME` | Optional. Defaults to `auto-claude project`. Shows in email subject. |

Set these at machine scope (e.g., `~/.bashrc`) or per-project `.env` loaded via Claude Code's env-var exposure.

## When a notification fires

1. **CEO decision recorded** — one email per decision, sent immediately after the decision entry is written to `Planning/ceo-digest-YYYY-MM-DD.md`. This is the primary trigger.
2. **Charter-restriction bump** — when ceo-agent writes an amendment proposal to `Planning/ceo-charter-proposals.md`. Email flags "CHARTER PROPOSAL" so founder sees it distinctly.
3. **Mode activation** — one-time "danger-builder ACTIVATED" notice (see `danger-builder-mode.md` § 4).
4. **Mode deactivation** — one-time "danger-builder DEACTIVATED" notice with reason + final decision count.
5. **Halt events** — kill-switch triggered, charter destroyed mid-run, or session message halted loop. Short notification of cause.

No daily batching. No midnight-UTC send. The founder's inbox reflects the CEO's real-time activity.

## Why per-decision, not batched

- **Signal density.** A daily digest with 40 decisions loses the important ones in the noise. Per-decision emails force each decision to earn its own line in the inbox.
- **Revocability window.** Founder can spot a questionable decision minutes after it happens and halt the loop. A daily digest means you might find out 20 hours later.
- **Natural filtering.** The founder learns inbox heuristics (which subjects to scan, which to ignore) in a way that's impossible with batched content.
- **Urgency signaling.** Charter proposals, HARD-STOPs, and one-way-door decisions flag themselves in the subject line and get founder attention within minutes.

## Send mechanics

Resend HTTPS POST to `https://api.resend.com/emails`:

```bash
curl -s -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "from": "${CEO_NOTIFY_EMAIL_FROM:-onboarding@resend.dev}",
  "to": ["$CEO_NOTIFY_EMAIL_TO"],
  "subject": "$SUBJECT",
  "text": "$BODY"
}
EOF
```

Response: 200 with `{"id": "..."}` on success; non-200 with error detail on failure.

## Per-decision email format

**Subject line pattern:**
```
[ceo-agent] <project> — <decision-slug>
```

For special cases, prefix the slug:
- `[ceo-agent] <project> — ⚠ ONE-WAY — <decision-slug>` (irreversible decisions)
- `[ceo-agent] <project> — ⚠ CHARTER PROPOSAL — <decision-slug>` (charter-restriction bump)
- `[ceo-agent] <project> — ⚠ HARD-STOP OVERRIDDEN — <decision-slug>` (BOARD member veto authorized anyway)
- `[ceo-agent] <project> — NOVEL — <decision-slug>` (no precedent in product-decisions.md)

**Body template** (plain text — no HTML):

```
ceo-agent decided. <ISO timestamp>

Context:       <one-line: what was asked; BOARD-split / stage / rule>
Decision:      <one-line outcome; the actual verb and object>
Rationale:     <1-2 sentences; which cognitive pattern(s) applied>

Charter:       <"no applicable restriction" OR "ceo-bound.md § X applied: <clause>">
Reversibility: <two-way door | one-way door | medium>
Novelty:       <true | false>
Monitor:       <what signal would mean this was wrong + who watches + by when>

Full entry:    Planning/ceo-digest-<YYYY-MM-DD>.md

Controls:
  Kill:         touch /tmp/ceo-mode-stop
  Session halt: send any message to the Claude Code session
```

Hard cap: **~12 lines of body**. If a decision needs more explanation than fits, the rationale still goes in full into `Planning/ceo-digest-YYYY-MM-DD.md` (no cap there) — the email stays short on purpose.

## Charter-proposal email format

When ceo-agent bumps a charter restriction, email subject prefix is `⚠ CHARTER PROPOSAL`:

```
ceo-agent hit a charter restriction and proposes an amendment.

Decision requested: <one-line>
Blocked by:         ceo-bound.md § X — "<exact restriction clause>"
Proposed amendment: <specific text change>
Rationale:          <2-3 sentences>
If amended, CEO would: <one-line>

Action required: review Planning/ceo-charter-proposals.md and either:
  1. Edit command-center/management/ceo-bound.md to apply the amendment
     (takes effect on next mode re-entry)
  2. Reject by taking no action — CEO continues respecting the restriction
  3. Override one-off by sending a session message with the desired outcome

Full proposal: Planning/ceo-charter-proposals.md (latest entry)
```

## Activation email

```
Subject: [ceo-agent] <project> — danger-builder ACTIVATED

ceo-agent is now resolving all BOARD splits, HARD-STOPs, and former-founder-asks
within ceo-bound.md.

You will receive one email per CEO decision. Short, scannable, actionable.

Charter last modified: <mtime of ceo-bound.md>
Restrictions active:   <count of non-(no restriction) entries>
Started:               <ISO timestamp>

Controls:
  Kill:         touch /tmp/ceo-mode-stop
  Session halt: send any message to the Claude Code session
  Charter edit: edit command-center/management/ceo-bound.md (applies on next mode entry)
```

## Deactivation email

```
Subject: [ceo-agent] <project> — danger-builder DEACTIVATED

Session ended at <ISO timestamp>.
Reason: <kill-switch | founder-message | explicit-exit | charter-destroyed>

Decisions made this session: <count>
Charter proposals surfaced:  <count>
Novel decisions:             <count>

Next escalation routes via: <new mode's behavior>

All decisions logged: Planning/ceo-digest-<YYYY-MM-DD>.md through <end date>.
```

## Halt email (mid-run interruption)

```
Subject: [ceo-agent] <project> — ⚠ LOOP HALTED — <cause>

The danger-builder loop halted.

Cause:  <kill-switch-file | charter-destroyed | delivery-failure-cascade | …>
Time:   <ISO timestamp>
STATUS: <value at halt>

To resume: fix the cause, then say "danger builder" again in Claude Code.
```

## Failure handling

On non-200 response or curl exit non-zero:

1. **Retry with exponential backoff:** 30s → 2min → 10min (3 attempts total)
2. **After 3 failures for a single notification:**
   - Write failure details to `Planning/notification-failures.log`
   - Append a line to the decision entry in `Planning/ceo-digest-YYYY-MM-DD.md` noting delivery failure
   - Do NOT halt the loop on a single failure — the decision is still recorded; founder can review the log on next session.
3. **Cascade protection — 10 consecutive failures within 1 hour:** halt the loop with STATUS=BLOCKED. Reason: if the founder cannot be reached, don't keep making decisions. Better to pause than operate blind.

The cascade threshold is the key safety measure: it prevents the "500 decisions emailed to a dead address" scenario by forcing the loop to stop when signal loss is persistent.

## Verification before mode activation

At `danger-builder` mode entry, run a connectivity test:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  https://api.resend.com/domains
# Expect 200 on success
```

If this fails, mode activation fails — either the API key is invalid or Resend is unreachable. Founder surfaces the error and resolves.

Mode activation also sends the activation email — if that send fails 3x, mode entry aborts (can't trust the delivery pipeline if the first message didn't land).

## Security notes

- `RESEND_API_KEY` is a write-only capability (send emails as whatever domain is verified in Resend). Compromise = spam in your name, not data exfiltration. Still, don't commit.
- Email body contains decision rationale, occasional financial figures, charter clauses. Treat as sensitive. Use a founder-only email address, ideally with a dedicated domain.
- Resend logs email content in their dashboard for 30 days by default. Disable via Resend settings if you don't want it retained.
- Per-decision content is designed to avoid raw secrets (API keys, credentials in clear). The decision-slug + rationale are safe to retain in email history.

## Why keep `Planning/ceo-digest-YYYY-MM-DD.md` alongside notifications?

The per-day file is **the audit surface**, not the delivery channel. Keeping it:

- Provides a single chronological source for retro analysis (`/retro` invocations)
- Survives email retention limits (Resend clears after 30 days; committed file persists indefinitely)
- Makes `/plan-ceo-review`-style retrospective decision review easy — read one file per day
- Is the canonical "what did CEO decide" reference when rolling back decisions or running post-mortems

Email is the push. The file is the log. Two separate roles; neither replaces the other.

## Alternative notification paths (future)

If Resend goes down or you outgrow it, the delivery interface is:
- Input: notification template + variables
- Output: delivered to founder
- Failure handling: retry + log + eventual cascade halt

Replacing Resend with SES, SendGrid, Postmark, Twilio SMS, or a Slack webhook is a one-file swap here. The rest of `danger-builder-mode.md` is delivery-mechanism-agnostic.

Complementary paths that could stack (not replace):
- **Slack webhook** for real-time HARD-STOP notifications mid-day
- **SMS (Twilio)** for charter-proposal or one-way-door decisions only (high-value alerts)
- **Push notification** via a mobile app for instant kill-switch access

Not implementing these now; listed for future reference.
