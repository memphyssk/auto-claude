# BOARD — Decision Body Under Full-Autonomy

7 fresh-context members that collectively substitute for the founder when `mode: full-autonomy` is active. Preserves the wave loop's forward motion without blocking on founder review.

## When BOARD fires

Under `mode: full-autonomy`, any would-be user-ask routes to BOARD EXCEPT the hard-stops below. Specifically:

- Stage 0b Tier 3 product decisions
- Stage 1 EXPAND_SCOPE / REDUCE_SCOPE / RECONSIDER verdicts
- Stage 1 conflicting verdicts (problem-framer vs ceo-reviewer)
- Stage 1 unbreakable monolith (first slice of auto-split still trips size rubric)
- Stage 3b design-gap 3-cap escalation
- Stage 7b /investigate chain exhaustion
- daily-checkpoint resolution (all three buckets)

Under `mode: semi-assisted` or `founder-review`: BOARD does not fire. Escalations go to founder per semi-assisted-mode.md.

Onboarding: BOARD is OFF during v0-v11 regardless of mode. Founder-review is always in effect for onboarding checkpoints (v1 gaps, v5 stack, v7/v8/v9 design approvals, v10 Tier 3). Full-autonomy activates only after v11 handoff.

## Out of BOARD scope — resolve by rule, never convene

BOARD resolves product, scope, strategy, compliance, and external-commitment decisions. BOARD does NOT resolve:

- Session/context management (STATUS transitions, handoff timing — see `full-autonomy-mode.md` § Tick behavior)
- Loop cadence and `ScheduleWakeup` delays
- Commit/push granularity within an approved plan
- Execution sequencing within an approved plan
- Stated-preference checkpoints ("My preference: X" auto-resolves to X)

Attempting to convene BOARD for any of the above is a protocol violation — log it in the wave closeout under § Plan-authoring defects and resolve by rule.

## Hard-stops — NEVER go to BOARD

Route these to founder (under `founder-review` / `semi-assisted` / `full-autonomy`) or to **ceo-agent** (under `danger-builder`) — BOARD never decides these on its own:

| Class | Examples |
|---|---|
| **Destructive actions** | force-push, DROP TABLE, `rm -rf`, `git reset --hard`, `kubectl delete`, branch deletion, uncommitted-work overwrites |
| **Money commitments** | new paid SaaS subscription, API tier upgrade with billing, domain purchase, anything with a credit-card hit |
| **Hard-stop member veto** | any BOARD member flags `HARD-STOP: must be human` with concrete reason |

### Routing summary by mode

| Class | founder-review | semi-assisted | full-autonomy | danger-builder |
|---|---|---|---|---|
| Destructive actions | founder | founder | founder | **ceo-agent** (restricted by `ceo-bound.md` § 4 if set) |
| Money commitments | founder | founder | founder | **ceo-agent** (restricted by `ceo-bound.md` § 1 if set) |
| HARD-STOP member veto | founder | founder | founder | **ceo-agent** (weighs veto, records engagement in digest) |
| Standard 4+/7 split | founder | founder | founder | **ceo-agent** |
| Tier 3 6+/7 strict fall-short | founder | founder | founder | **ceo-agent** |

Under `danger-builder`, the **only** escalations that still reach the founder are:
1. Kill-switch file (`/tmp/ceo-mode-stop`)
2. Founder message directly to the session
3. `STATUS=STOP` written manually
4. Mode flag change
5. Charter destroyed mid-run
6. ceo-agent hits a charter restriction it cannot resolve (surfaces via `Planning/ceo-charter-proposals.md` + digest)

Identity/legal and external communications (emails to real users, Slack posts, OSS PR descriptions, ToS/privacy-text copy) ARE BOARD-decidable — founder delegates these in full-autonomy mode. Under `danger-builder`, ceo-agent resolves them directly within ceo-bound.md § 3 restrictions.

## Composition

7 members. See `board-members.md` for per-member lens + agent mapping + reading list.

1. **ceo-reviewer** — strategic direction / bet alignment / ambition (custom role, project instruction file)
2. **architect-reviewer** — technical wisdom / blast radius / reversibility (VoltAgent)
3. **ux-researcher** — UX coherence / user-value cost (VoltAgent)
4. **risk-manager** — risk / failure modes / escape routes (VoltAgent)
5. **founder-proxy** — founder voice via claude-mem + product-decisions.md (custom role, new)
6. **competitive-analyst** — benchmark-grounded "what would competitors do" signal (VoltAgent)
7. **product-manager** — operational PM / MVP scope / feature priority / user outcomes (VoltAgent)

All seven spawn in parallel, fresh context, no shared state. None sees another's vote before casting.

## Voting

See `conflict-resolution.md`. Short version:

- **Default threshold: 4+/7 in same direction** → apply; closeout logs decision + any dissent
- **Tier 3 product decisions: 6+/7 in same direction** (stricter bar for strategic calls)
- **No direction reaches 4+** (e.g., 3+3+1, 3+2+2, 2+2+3) → escalate to founder
- **Any member hard-stop veto** → escalate to founder (circuit breaker)

## Output

Per BOARD convening:

- `Planning/wave-<N>-board-<decision-slug>.md` — 5 votes + consolidated decision + dissent notes
- Entry in wave closeout §BOARD decisions table — `decision-slug | members-agreed (N/5) | outcome | dissent note`
- Morning digest: every BOARD decision from the run surfaces to founder via `Planning/board-digest-<YYYY-MM-DD>.md`. Close splits and vetoes flagged at the top.

## Rollback

If founder reviews the morning digest and disagrees with a BOARD decision:
- Founder stops the session, points to the decision
- Orchestrator rolls back the decision's artifacts (revert commit, restore task status, undo file writes)
- Retro captures the pattern via `/retro` → routed per `conflict-resolution.md` § Retro feedback loop

No automated rollback flow — founder manual override is the safety valve.
