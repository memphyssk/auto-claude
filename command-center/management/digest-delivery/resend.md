# Digest delivery — Resend

Spec for sending the daily ceo-agent digest via Resend under `danger-builder` mode.

## Required env vars

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key (get from <https://resend.com/api-keys>) |
| `CEO_DIGEST_EMAIL_TO` | Founder email address (single recipient) |
| `CEO_DIGEST_EMAIL_FROM` | Optional. Defaults to `ceo-agent@<your-domain>` (domain must be verified at Resend). If unset, uses `onboarding@resend.dev` test sender (free tier, limited to verified addresses). |
| `CEO_DIGEST_PROJECT_NAME` | Optional. Defaults to `auto-claude project`. Shows in email subject. |

Set these at machine scope (e.g., `~/.bashrc`) or per-project `.env` loaded via Claude Code's env-var exposure.

## When delivery fires

1. **Mode activation** — one-time "danger-builder ACTIVATED" notice (see `danger-builder-mode.md` § 4)
2. **Daily at UTC midnight** — full digest for the day that just ended
3. **At any halt** — final digest for the current (possibly partial) day
4. **Mode deactivation** — brief notice confirming deactivation

## Send mechanics

Resend HTTPS POST to `https://api.resend.com/emails`:

```bash
curl -s -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<EOF
{
  "from": "${CEO_DIGEST_EMAIL_FROM:-onboarding@resend.dev}",
  "to": ["$CEO_DIGEST_EMAIL_TO"],
  "subject": "[ceo-agent] ${CEO_DIGEST_PROJECT_NAME:-auto-claude project} — digest $(date -u +%Y-%m-%d)",
  "text": "$DIGEST_CONTENT_ESCAPED"
}
EOF
```

Response: on success, Resend returns `{"id": "..."}` with HTTP 200. On failure, non-200 with error detail.

## Email body format

Plain text (not HTML). Body = the day's `Planning/ceo-digest-YYYY-MM-DD.md` file contents, unchanged markdown. Markdown-aware email clients render sensibly; plain clients get readable raw markdown.

Why plain text: auditability. No tracking pixels, no fancy styling, no way for the content to drift from what's committed to `Planning/`.

## Failure handling

On non-200 response or curl exit non-zero:

1. Retry with exponential backoff: 30s → 2min → 10min (3 attempts total)
2. After 3 failures:
   - Write failure details to `Planning/digest-delivery-failures.log`
   - Append `**DELIVERY FAILURE:** digest for <YYYY-MM-DD> failed to send. Cause: <error>. See Planning/digest-delivery-failures.log.` to the next day's digest
   - Do NOT halt the loop — digest delivery failure is not a decision failure
3. On next success, clear the failure marker but keep the log

**Rate limits:** Resend free tier is 100 emails/day, 3000/month. Single-recipient daily digest hits 1/day = well under limits. If you add weekly summaries or halt-notices, monitor.

## Email body template (for activation + deactivation notices)

### Activation

```
Subject: [ceo-agent] <project> — danger-builder ACTIVATED

ceo-agent is now resolving all BOARD splits, HARD-STOPs, and former-founder-asks
within ceo-bound.md.

Daily digest arrives at this address each day (UTC midnight).

Kill switch:  touch /tmp/ceo-mode-stop
Session halt: any message you send halts the loop at next tick.

Charter last modified: <mtime of ceo-bound.md>
Restrictions active: <count of non-(no restriction) entries>

Started: <ISO timestamp>
```

### Deactivation

```
Subject: [ceo-agent] <project> — danger-builder DEACTIVATED

Session ended at <ISO timestamp>.
Reason: <kill-switch | founder-message | explicit-exit | charter-destroyed>

Final digest for <partial day YYYY-MM-DD> attached below.

Next escalation routes via: <new mode's behavior — e.g., "founder-review" or "full-autonomy BOARD-only">

<digest content>
```

### Daily digest

Subject: `[ceo-agent] <project> — digest YYYY-MM-DD`

Body: the contents of `Planning/ceo-digest-YYYY-MM-DD.md` verbatim.

## Verification before activation

At `danger-builder` mode entry, run a send-test:

```bash
# Dry-run to verify key + connectivity (doesn't actually send)
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  https://api.resend.com/domains
# Expect 200 on success
```

If this fails, mode activation fails — either the API key is invalid or Resend is unreachable. Founder surfaces the error and resolves.

## Security notes

- `RESEND_API_KEY` is a write-only capability (send emails as whatever domain is verified in Resend). Compromise = spam in your name, not data exfiltration. Still, don't commit.
- Email body contains decision rationale, strategic reasoning, and sometimes financial figures. Treat as sensitive. Use a founder-only email address, ideally with a dedicated domain.
- Resend logs email content in their dashboard for 30 days by default. Disable via Resend settings if you don't want it retained.

## Alternative delivery paths (future)

If Resend goes down or you outgrow it, the delivery interface is:
- Input: `Planning/ceo-digest-YYYY-MM-DD.md` content
- Output: delivered to founder
- Failure handling: retry + log

Replacing Resend with SES, SendGrid, Postmark, or a local SMTP relay is a one-file swap here. The rest of `danger-builder-mode.md` is delivery-mechanism-agnostic.

Other delivery paths that could complement email (not replace):
- **Slack webhook** — for instant notification of HARD-STOP events mid-day
- **SMS (Twilio)** — for kill-switch-required escalations (charter restrictions hit)
- **File-only** — skip email entirely; founder reads `Planning/ceo-digest-*.md` on their own cadence (defeats the 365-day point unless founder has disciplined review habit)

Not implementing these now; listed for future reference.
