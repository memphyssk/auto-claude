# BOARD Conflict Resolution

Voting protocol, tie-breaks, retro feedback.

## Voting rules

Each member casts one vote (APPROVE / REJECT / ABSTAIN). ABSTAIN is not vote-against — it's used when a member judges the decision outside their lens. See `board-members.md` § ABSTAIN discipline.

### Default threshold — 4+/7 in same direction

For: scope EXPAND/REDUCE, RECONSIDER, conflicting reviewer verdicts, unbreakable monolith, design-gap 3-cap, investigate-chain exhaustion, daily-checkpoint `assigned-this-cycle` + `stayed-unassigned` buckets.

- **4+ APPROVE → apply.** Log dissent note if opposed votes > 2.
- **4+ REJECT → request denied.** Closeout notes why.
- **4+ in a direction with ABSTAINs** (e.g., 4 APPROVE + 3 ABSTAIN) → apply.

### Strict threshold — 6+/7 in same direction

For: Tier 3 product decisions.

- **6+ APPROVE → apply.** Strategic calls get a higher bar.
- **5 APPROVE + 2 other → escalate to founder.** Strong majority insufficient for Tier 3.

### Split outcomes

| Pattern | Action |
|---|---|
| 4+/7 APPROVE, 3 REJECT/ABSTAIN | Default passes, log dissent; Tier 3 escalates |
| 5+2 APPROVE/REJECT | Default passes; Tier 3 escalates (strict bar not met) |
| 3+3+1 three-way | Escalate — no direction reaches 4+ |
| 3+2+2 | Escalate — no direction reaches 4+ |
| 2+2+3 (three ABSTAINs, 2-vs-2 on sides) | Escalate — insufficient engagement |
| 7+0+0 (unanimous) | Apply (clean decision) |
| Any pattern with `HARD-STOP: must be human` | Escalate regardless of vote math |

## Escalation path

### Under `founder-review` / `semi-assisted` / `full-autonomy` — BOARD → founder

1. Orchestrator writes `Planning/wave-<N>-board-<decision-slug>.md` with all 7 votes.
2. Appends to `Planning/board-digest-<YYYY-MM-DD>.md` § Vetoes & escalations routed back.
3. Stage waits per current mode's founder-escalation handling.
4. Wave resumes when founder answers.

### Under `danger-builder` — BOARD → ceo-agent

1. Orchestrator writes `Planning/wave-<N>-board-<decision-slug>.md` with all 7 votes.
2. Spawns ceo-agent via `Sub-agent Instructions/ceo-agent-instructions.md` with the BOARD file + decision context.
3. ceo-agent reads `ceo-bound.md` charter restrictions.
4. If a charter restriction blocks: ceo-agent writes to `Planning/ceo-charter-proposals.md` and escalates via daily digest.
5. If no restriction: ceo-agent decides, writes entry to `Planning/ceo-digest-YYYY-MM-DD.md`, emits decision back to the calling stage.
6. Wave resumes same turn.

ceo-agent does not vote — it decides. One outcome, with rationale, cognitive-pattern citations, and reversibility classification. The BOARD vote file is input: ceo-agent sees what the board thought, including dissent and any HARD-STOP vetoes.

## Hard-stop member veto

Any BOARD member may emit `HARD-STOP: must be human — <reason>`. This overrides the voting math — even 7+/7 APPROVE with 1 hard-stop escalates.

Under `danger-builder`, HARD-STOP routes to ceo-agent, not founder. ceo-agent weighs the veto as strong signal, records engagement in the digest, and may still authorize if justified. The veto is a signaling tool — dissent is loud and visible — without actually blocking execution under pre-authorized CEO mode.

Legitimate hard-stop examples:
- **founder-proxy:** "no founder precedent in memory; this is a genuinely new call"
- **risk-manager:** "proposed action has no documented escape route; failure is irreversible"
- **architect-reviewer:** "commits to X architectural direction; too load-bearing for 4+ consensus"
- **competitive-analyst:** "all Tier 1 benchmarks contradict this decision; high reputational risk"

## Anti-patterns

### 1. Do not use ABSTAIN to avoid taking a stance.
Why: ABSTAIN on decisions that touch your lens weakens the signal and degrades BOARD quality; if a member habitually ABSTAINs on relevant calls, retro should tune their reading list.

### 2. Do not treat a 5+/7 APPROVE as sufficient for Tier 3.
Why: Strict bar requires 6+/7; a strong majority that falls short of the strict threshold escalates.

### 3. Do not allow a hard-stop veto to be overridden by vote math.
Why: The hard-stop is a circuit breaker — its purpose is to force escalation regardless of consensus.

## Retro feedback loop

When founder overrides a BOARD decision:

1. Log the override in `Planning/wave-<N>-closeout.md` § BOARD override.
2. At next `/retro`: identify which member's lens missed the concern, whether it was a reading-list gap, a pattern-matching gap, or a structural issue (wrong threshold / wrong composition).
3. `/retro` routes the lesson:
   - Reading-list gap → update `board-members.md` § per-member reading list
   - Pattern-matching gap → annotate `founder-proxy-instructions.md` or relevant member briefing
   - Structural issue → surface to founder via `Planning/pending.md` as `proposal:board-tuning`
4. No automatic BOARD tuning — every adjustment passes through founder via retro or direct edit.

Tier 3 retros that passed BOARD (6+/7) but founder later reversed are mandatory, not discretionary — these represent cases where strong consensus diverged from founder taste and deserve explicit composition / threshold review.

## Audit surface

`Planning/board-digest-<YYYY-MM-DD>.md` organizes decisions by confidence:

```markdown
## Clean decisions (5+/7 consensus or cleaner)
## Close splits (4+/7 with dissent)
## Vetoes & escalations
```

Clean decisions are FYI. Close splits and vetoes are the ones worth founder attention — the dissent pattern hints at future friction and potential member tuning targets.
