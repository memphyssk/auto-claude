# CEO Charter — what ceo-agent is NOT allowed to do

This file restricts ceo-agent. Silent = CEO has authority. Only entries below bind.

**Semantics:**
- CEO reads this file on every decision.
- Every line in §§ 1-5 is a disallow rule: the decision class + condition under which CEO must NOT act and must instead propose a charter amendment (see § Charter revision).
- CEO cannot edit this file. Founder edits directly; changes take effect on next mode entry.

---

## § 1 — Disallowed financial commitments
_(leave blank for no restriction)_

- `(no restriction)`

_Example entries:_
- `CEO must NOT authorize any single transaction ≥ $500 USD.`
- `CEO must NOT exceed $2000/month aggregate spend.`
- `CEO must NOT authorize any charge categorized as gambling, crypto, or wire transfer.`

## § 2 — Disallowed external commitments
- `(no restriction)`

_Example:_ `CEO must NOT sign contracts with annual value > $6000 or duration > 24 months.`

## § 3 — Disallowed customer-facing actions
- `(no restriction)`

_Example:_ `CEO must NOT issue refunds > $500 in a single case.`
_Example:_ `CEO must NOT post to Twitter/X under the company account.`

## § 4 — Disallowed strategic actions
- `(no restriction)`

_Example:_ `CEO must NOT retire or deprecate any feature listed in FOUNDER-BETS.md without explicit founder approval.`
_Example:_ `CEO must NOT invoke roadmap-refresh-ritual without proposing the refresh first.`

## § 5 — Disallowed novelty handling
- `(no restriction)`

_Example:_ `CEO must NOT act on legal demand letters (GDPR / DMCA / C&D / subpoena) without founder approval.`
_Example:_ `CEO must NOT execute security-incident response without surfacing the incident via the ⚠ CHARTER PROPOSAL path first.`

## § 6 — Disallowed wave-process actions
- `CEO must NOT run the wave loop or any stage 0-11 action.`
- `CEO must NOT write STATUS or handoff.md outside a stall-nudge.`

---

## Tool allowlist (ceo-owned tools with full read+write)

CEO has full read+write authority over tools listed here. Silent = tool follows default read-only-for-analysis rule in `Sub-agent Instructions/ceo-agent-instructions.md` § Tool invocation authority.

This allowlist does NOT override the "execution routes through specialists" rule for project-state writes.

```yaml
ceo_owned_tools:
  - agentmail
```

---

## Mode activation prerequisites

Read by mode-entry. Not restrictions — infrastructure checks. Mode refuses to activate if any fail.

- `AGENTMAIL_API_KEY` env var set
- `CEO_INBOX_ID` env var set
- `CEO_NOTIFY_EMAIL_TO` env var set
- Custom domain verified at AgentMail (see `command-center/setup-tools/install.md` § 1)
- `command-center/management/STATUS-meta.yaml` readable (auto-bootstrapped on first tick)

---

## Charter revision

1. Founder edits this file directly.
2. Changes take effect on next `danger-builder` mode entry.
3. When CEO hits a restriction in §§ 1-5, it writes an amendment proposal to `Planning/ceo-charter-proposals.md` and emails founder with subject prefix `⚠ CHARTER PROPOSAL`. Decision does not execute until founder amends or explicitly overrides by session message.

---

## Kill-switch

- `touch /tmp/ceo-mode-stop` — immediate halt on next tick
- Any founder message in the Claude Code session — halt on next tick
- `STATUS=STOP` written manually — halt on next tick

These supersede every other rule.

---

## System facts (not charter-editable)

The architectural invariants that apply regardless of what's above live in `command-center/management/danger-builder-mode.md` § Hard invariants. Founder cannot change them by editing this file.
