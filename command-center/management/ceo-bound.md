# CEO Charter — ceo-agent authority bounds under `danger-builder`

This document **limits** the ceo-agent's authority. It does NOT authorize.

Under `danger-builder` mode, ceo-agent has **unlimited decision authority by default**. Any section left blank or marked `(no restriction)` means the CEO decides freely in that category. Restrictions added here bind the CEO — the CEO cannot act against them, and any attempt to do so routes to the founder as a charter-amendment proposal.

**Founder owns all outcomes** of ceo-agent decisions made inside this charter.

Charter is founder-edited only. The CEO cannot amend it. Any restriction change takes effect on next mode entry.

---

## 0. Mode activation prerequisites

These are NOT restrictions — they're setup requirements the CEO verifies at mode entry. If any fail, mode entry aborts.

- [ ] `RESEND_API_KEY` env var set (for daily digest)
- [ ] `CEO_DIGEST_EMAIL_TO` env var set (founder email address)
- [ ] `Planning/` directory exists and is writable
- [ ] Kill-switch mechanism tested (see § 7)
- [ ] `product/FOUNDER-BETS.md` exists and is non-empty (strategic context)
- [ ] `product/product-decisions.md` exists (precedent library)

---

## 1. Financial restrictions

_(Leave blank for unlimited. Fill only restrictions you want.)_

- Monthly spending cap: `(no restriction)`
- Single-transaction cap: `(no restriction)`
- Payment instruments the CEO may use: `(no restriction — all available instruments in scope)`
- Blocked spending categories: `(no restriction)`
- Required approval path for anything above: `(n/a — no cap set)`

_Example restriction: `Monthly spending cap: $2000 USD via burner Ramp card only; anything above must surface via charter amendment.`_

## 2. External commitment restrictions

- Contract value ceiling: `(no restriction)`
- Contract duration ceiling: `(no restriction)`
- Legal text changes (ToS, privacy, etc): `(no restriction)`
- Hiring authority: `(no restriction)`
- Vendor categories off-limits: `(no restriction)`

_Example restriction: `Cannot sign contracts > $500/month MRR or > 24 months duration without founder approval.`_

## 3. Customer-facing restrictions

- Refund authority ceiling: `(no restriction)`
- Public statement channels off-limits: `(no restriction)` _(e.g., "CEO may not post to Twitter/X")_
- Communication templates requiring founder-review: `(no restriction)`

## 4. Infrastructure + code restrictions

- Production-deploy authority: `(no restriction — wave loop gates apply as normal)`
- Database DDL restrictions: `(no restriction — triage routes to database-administrator agent for execution)`
- Third-party service changes: `(no restriction)`
- Security incident handling: `(no restriction — CEO coordinates response, post-mortem in digest)`

_Note: technical operations (force-push, DROP TABLE, etc.) route through the triage-routing-table to specialist agents per normal wave-loop discipline. CEO authorizes the decision; specialists execute with their own safety protocols. This happens regardless of mode._

## 5. Strategic decision restrictions

- Pivot authority (changing a FOUNDER-BETS.md entry): `(no restriction)`
- Roadmap-refresh authority: `(no restriction — CEO may invoke roadmap-refresh-ritual)`
- Product-kill authority (deprecating a shipped feature): `(no restriction)`
- Founder-bet additions: `(no restriction)`

## 6. Novelty handling

Default: CEO decides on novel situations using first-principles + cognitive patterns from `/plan-ceo-review`. Digest entry flags the decision as `novelty: true` so founder can review.

Explicitly-bounded novelty categories (leave blank for none):
- `(no restriction)`

_Example: `Legal demand letters (GDPR, DMCA, C&D) escalate to founder regardless of financial threshold.`_

## 7. Kill-switch

Kill-switch file path: `/tmp/ceo-mode-stop`

When `Planning/.autonomous-session` has `mode: danger-builder`, every `/loop` tick checks for this file. If present:
1. CEO-mode halts immediately (no new decisions)
2. STATUS set to `BLOCKED`
3. Digest delivered with summary up to halt point
4. Founder message in session required to resume

Alternative halt mechanisms (all active simultaneously):
- Founder sends any message during the session → halts on next tick
- Founder writes `STOP` to `command-center/management/STATUS` → halts on next tick
- `Planning/.autonomous-session` mode field changed from `danger-builder` → halts immediately

## 8. Reporting

Daily digest path: `Planning/ceo-digest-YYYY-MM-DD.md`
Daily digest email: delivered via Resend to `$CEO_DIGEST_EMAIL_TO`

Founder review cadence: `(set this — daily / weekly / on-alert)`
Founder response SLA (how long before founder acknowledges digest): `(set this)`

Weekly summary path: `Planning/ceo-weekly-<ISO-week>.md` (rolls up 7 daily digests)

## 9. Charter revision protocol

1. Founder edits this file directly
2. Changes take effect on next `danger-builder` mode entry (CEO re-reads charter at each activation)
3. CEO may propose amendments — appended to `Planning/ceo-charter-proposals.md` for founder review — but cannot self-apply
4. If CEO hits a restriction and proposes an amendment, founder decides; digest surfaces the proposal at next delivery

## 10. What this charter does NOT cover (permanent, regardless of mode)

Even under `danger-builder` with ceo-agent active, these remain out of reach. They are not restrictions on ceo-agent — they are facts about the system:

- **Amending this charter.** Founder-only.
- **Amending `command-center/product/FOUNDER-BETS.md`.** Founder-only. CEO may *question* a bet in the digest but cannot change one.
- **Halting the loop.** Kill-switch is founder-only control.
- **Onboarding loop (v0-v11).** Runs before `danger-builder` can activate; uses founder-review mode regardless. BOARD and CEO are both OFF during onboarding.

---

**When in doubt, default to no restriction.** Every restriction added here is a circumstance where the CEO would otherwise decide for you but instead escalates. More restrictions = more founder involvement = less autonomy. The point of `danger-builder` is to minimize founder involvement to only what you genuinely want to stay involved in.
