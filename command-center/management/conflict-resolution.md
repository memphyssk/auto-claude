# BOARD Conflict Resolution

Voting protocol, tie-breaks, retro feedback.

## Voting rules

Each member casts one vote (APPROVE / REJECT / ABSTAIN). ABSTAIN is not vote-against — it's used when a member judges the decision outside their lens (e.g., ux-researcher on a pure DB-schema call). See `board-members.md` § ABSTAIN discipline.

### Default threshold — 4+/7 in same direction
For: scope EXPAND/REDUCE, RECONSIDER, conflicting reviewer verdicts, unbreakable monolith, design-gap 3-cap, investigate-chain exhaustion, daily-checkpoint `assigned-this-cycle` + `stayed-unassigned` buckets.

- **4+ APPROVE → apply** that option. Log dissent note if opposed votes > 2.
- **4+ REJECT → underlying request is denied.** Closeout notes why.
- **4+ in a direction with ABSTAINs** (e.g., 4 APPROVE + 3 ABSTAIN, or 4 APPROVE + 2 REJECT + 1 ABSTAIN) → apply.

### Strict threshold — 6+/7 in same direction
For: Tier 3 product decisions.

- **6+ APPROVE → apply.** Strategic calls get a higher bar.
- **5 APPROVE + 2 other (REJECT or ABSTAIN) → escalate to founder.** Strong majority insufficient for Tier 3.

### Split outcomes (no direction reaches threshold)

| Pattern | Action |
|---|---|
| 4+/7 APPROVE, 3 REJECT/ABSTAIN | Default passes, log dissent; Tier 3 escalates |
| 5+2 APPROVE/REJECT | Default passes; Tier 3 escalates (strict bar not met) |
| 3+3+1 three-way | Escalate — no direction reaches 4+ |
| 3+2+2 | Escalate — no direction reaches 4+ |
| 2+2+3 (three ABSTAINs, 2-vs-2 on sides) | Escalate — insufficient engagement |
| 7+0+0 (unanimous) | Apply (clean decision) |
| Any pattern with `HARD-STOP: must be human` | Escalate regardless of vote math (member veto) |

## Escalation path (BOARD → founder)

When BOARD escalates to founder (under full-autonomy):
1. Orchestrator writes `Planning/wave-<N>-board-<decision-slug>.md` with all 7 votes
2. Appends to `Planning/board-digest-<YYYY-MM-DD>.md` § Vetoes & escalations routed back
3. Stage waits (per current founder-review escalation handling — AskUserQuestion or pause)
4. Wave resumes when founder answers

The BOARD vote file becomes input to founder's decision — they see what the board thought, dissent included.

## Hard-stop member veto

Any BOARD member may emit `HARD-STOP: must be human — <reason>` instead of APPROVE/REJECT. This overrides the voting math — even a 7+/7 APPROVE outcome with 1 hard-stop escalates.

Legitimate hard-stop examples:
- **founder-proxy**: "no founder precedent in memory; this is a genuinely new call"
- **risk-manager**: "proposed action has no documented escape route; failure is irreversible"
- **architect-reviewer**: "commits to X architectural direction; too load-bearing for 4+ consensus"
- **competitive-analyst**: "all Tier 1 benchmarks contradict this decision; high reputational risk"

The veto is a circuit breaker, not a frequent-use tool. If any member habitually emits hard-stops on mundane decisions, retro should tune their reading list or instruction file.

## Retro feedback loop

When founder stops the session and overrides a BOARD decision:

1. Log the override in `Planning/wave-<N>-closeout.md` § BOARD override — board voted, founder chose, why.
2. At next `/retro` invocation, pattern is captured:
   - Which member's lens missed the concern?
   - Was it a reading-list gap (missing file the member should have read)?
   - Was it a pattern-matching gap (similar decision in past `product-decisions.md` not surfaced)?
   - Was it a structural issue (wrong threshold, wrong member composition)?
3. `/retro` routes the lesson:
   - Reading-list gap → update `board-members.md` § per-member reading list
   - Pattern-matching gap → annotate `founder-proxy-instructions.md` or relevant member briefing
   - Structural issue → surface to founder via `Planning/pending.md` as `proposal:board-tuning`
4. No automatic BOARD tuning — every adjustment passes through founder via retro or direct edit.

## Audit surface

`Planning/board-digest-<YYYY-MM-DD>.md` organizes decisions by confidence:

```markdown
## Clean decisions (5+/7 consensus or cleaner)
## Close splits (4+/7 with dissent)
## Vetoes & escalations
```

Clean decisions are FYI. Close splits and vetoes are the ones worth founder attention — the dissent pattern hints at future friction and potential member tuning targets.

## Tier-3-specific rollback note

Tier 3 decisions that pass BOARD (6+/7) but the founder later reverses carry extra weight at retro. These represent cases where:
- Strong consensus existed, yet founder taste diverged → signals the board captures something genuinely different from founder intent
- OR the decision-packet framing missed critical context (usually a reading-list gap)

Retro on such overrides is mandatory — not discretionary — and the lesson surfaces to founder for explicit composition / threshold review.
