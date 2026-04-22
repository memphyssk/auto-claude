# Mode — Full-Autonomy

Unconditional wave-loop execution. BOARD decides every former user-ask except hard-stops. Founder reviews decisions via morning digest but does not gate runtime.

## Activation

User triggers:
- "full autonomy" / "go completely autonomous" / "board mode"
- "unconditional loop" / "don't stop for anything"

Orchestrator writes flag file:

```bash
cat > Planning/.autonomous-session <<EOF
started_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
mode: full-autonomy
reason: <quote user's phrasing>
expires_on: user-says-stop | orchestrator-finishes-all-work
EOF
```

Confirm in one line: "Full-autonomy ON. BOARD handles non-hard-stop escalations. Morning digest at `Planning/board-digest-<YYYY-MM-DD>.md`."

## Routing table

Under `mode: full-autonomy`, these escalations route to BOARD:

| Escalation source | Previous behavior | Full-autonomy behavior |
|---|---|---|
| Stage 0b Tier 3 product decision | Queue for daily-checkpoint | BOARD (6+/7 consensus required) |
| Stage 1 RESCOPE-AUTO-SPLIT with unbreakable first slice | Escalate to user | BOARD (4+/7) |
| Stage 1 ceo-reviewer EXPAND_SCOPE_PROPOSAL | AskUserQuestion | BOARD (4+/7) |
| Stage 1 ceo-reviewer REDUCE_SCOPE_PROPOSAL (strategic) | AskUserQuestion | BOARD (4+/7) |
| Stage 1 ceo-reviewer RECONSIDER | AskUserQuestion | BOARD (4+/7) |
| Stage 1 conflicting problem-framer vs ceo-reviewer | Escalate to user | BOARD (4+/7) |
| Stage 3b design-gap 3-cap escalation | Escalate to user | BOARD (4+/7) |
| Stage 7b /investigate chain exhaustion | Escalate to user | BOARD (4+/7) |
| daily-checkpoint resolution (all three buckets) | Founder answers via AskUserQuestion | BOARD resolves; morning digest for founder |

Everything NOT in this table stays as-is (Tier 1 auto-decide still runs, Tier 2 still proceeds+logs, orchestrator routing via triage table still routes to specialists).

## Hard-stops — always to founder

Even under full-autonomy, the following ALWAYS prompt:

- **Destructive actions** — force-push, DROP TABLE, `rm -rf`, `git reset --hard`, `kubectl delete`, branch deletion, uncommitted-work overwrites
- **Money commitments** — new paid SaaS subscription, API tier upgrade with billing, domain purchase, anything with a credit-card hit
- **Hard-stop member veto** — any BOARD member flagging `HARD-STOP: must be human` with concrete reason

## BOARD-decidable under full-autonomy (delegated)

Things that WERE founder-only before, now routed to BOARD:
- Identity commitments (account creation on third-party providers)
- Legal text approvals (terms-of-service copy, privacy text edits)
- External communications (emails drafted to real users, Slack posts, OSS PR descriptions)
- Vendor selection calls where `product-decisions.md` precedent exists

## Onboarding carve-out

BOARD is OFF during the onboarding loop (v0-v11) regardless of mode. Founder-review always applies for:
- v1 vision/bets gap check
- v5 stack override
- v7 design direction approval
- v8 design system approval
- v9 per-page design approval
- v10 Tier 3 deferrals

Full-autonomy activates only after v11 handoff. The reasoning: onboarding is the highest-taste moment in the project lifecycle; founder presence is the feature.

## Audit — morning digest

Every BOARD decision made during the run surfaces to founder at next session start:

`Planning/board-digest-<YYYY-MM-DD>.md`:

```markdown
# BOARD digest — <date>

## Clean decisions (N) — 5+/7 or cleaner
| decision-slug | outcome | wave |

## Close splits (N) — 4+/7 with dissent
| decision-slug | outcome | dissent note | wave |

## Vetoes & escalations routed back to founder (N)
| decision-slug | reason | where paused |

## Summary
- Total decisions: N | Clean: N | Close: N | Escalated: N
- Waves completed: N
- Approvals pending founder review: N
```

Founder opens digest, can stop the session and manually override any decision → see `board.md` § Rollback.

## Deactivation

User triggers:
- "I'm back" / "pause" / "stop the autonomous run"
- "exit full-autonomy" / "switch to semi-assisted"

Orchestrator removes the flag file OR flips `mode:` to `semi-assisted` / removes. Confirm: "Full-autonomy ended. Next escalation goes to you."

## Latency + cost

BOARD convening: ~1-2 min + ~40-50K tokens per decision (7 parallel agents, each ~5-8K tokens of fresh context + reading list + vote). A wave that triggers 2 BOARD convenings adds ~3-4 min + ~80-100K tokens over the baseline ~75K typical. Acceptable tradeoff for unconditional loop.

## Precedence

1. **Flag file wins over wave-plan front-matter.** Wave plans do NOT declare `autonomous_mode` (deprecated field).
2. **Hard-stops always prompt** regardless of flag. Safety gates are not bypassable.
3. **Founder message at any time** → orchestrator responds immediately, regardless of mode.
4. **Critical errors still escalate** — if `ultrathink-debugger` also fails after BOARD-approved fix attempts, the issue still surfaces in the digest as `Vetoes & escalations routed back` for founder attention.
