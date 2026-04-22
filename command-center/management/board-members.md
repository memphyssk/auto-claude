# BOARD Members

7 specialists that form the decision body. Same reviewer-independence pattern as Karen + Jenny — fresh contexts, parallel spawn, no cross-talk until votes land.

## Composition

| Member | Agent type | Instruction source | Primary lens |
|---|---|---|---|
| **ceo-reviewer** | general-purpose + ceo-reviewer instructions | `Sub-agent Instructions/ceo-reviewer-instructions.md` | Strategic direction / bet alignment / ambition |
| **architect-reviewer** | architect-reviewer (VoltAgent) | `~/.claude/agents/architect-reviewer.md` | Technical wisdom / blast radius / reversibility |
| **ux-researcher** | ux-researcher (VoltAgent) | `~/.claude/agents/ux-researcher.md` | UX coherence / user-value cost |
| **risk-manager** | risk-manager (VoltAgent) | `~/.claude/agents/risk-manager.md` | Risk / failure modes / escape routes |
| **founder-proxy** | general-purpose + founder-proxy instructions | `Sub-agent Instructions/founder-proxy-instructions.md` | Founder voice — simulated from memory |
| **competitive-analyst** | competitive-analyst (VoltAgent) | `~/.claude/agents/competitive-analyst.md` | Benchmark-grounded "what would competitors do" |
| **product-manager** | product-manager (VoltAgent) | `~/.claude/agents/product-manager.md` | Operational PM / MVP scope / feature priority |

**ceo-reviewer vs product-manager** — both are product-ish; keep distinct:
- ceo-reviewer answers: *"Is this the right bet? Does it advance our strategic direction?"*
- product-manager answers: *"Given the bet, is this the right scope / MVP shape / feature priority?"*

## Reading list per member

Each member is spawned with explicit reading material so votes are grounded in project state, not general training.

### ceo-reviewer
- `command-center/product/FOUNDER-BETS.md` (strategic intent)
- `command-center/product/product-decisions.md` (precedent)
- `command-center/product/ROADMAP.md` (milestone context)
- Decision context (plan / reframing / task details)

### architect-reviewer
- `command-center/dev/architecture/_library.md` (system shape)
- `command-center/dev/module-list.md` (module inventory)
- `command-center/rules/dev-principles.md` (conventions)
- Relevant branch file (security/services/databases per topic)
- Decision context

### ux-researcher
- `command-center/artifacts/user-journey-map.md` (canonical flows)
- Relevant `command-center/product/per-page-pd/<page>.md` files
- `design/DESIGN-SYSTEM.md` + relevant mockups
- Decision context

### risk-manager
- `command-center/rules/security-waves.md`
- `command-center/rules/external-sdks.md`
- `command-center/rules/build-iterations/stages/stage-1-problem-reframing.md` § Antipatterns Catalog
- Last 3 wave closeouts' "Plan-authoring defects" + retro lessons
- Decision context

### founder-proxy
- `/root/.claude/projects/<project>/memory/` files via `claude-mem:mem-search`
- Last 10 entries in `command-center/product/product-decisions.md`
- `command-center/product/FOUNDER-BETS.md`
- Decision context

### competitive-analyst
- `command-center/artifacts/competitive-benchmarks/INDEX.md`
- Tier 1 benchmark files relevant to decision topic
- `command-center/product/FOUNDER-BETS.md` § differentiation notes
- Decision context

### product-manager
- `command-center/product/feature-list.md`
- `command-center/product/user-flows.md`
- Relevant `command-center/product/per-page-pd/<page>.md` files
- `command-center/product/product-decisions.md` (scoping precedent)
- `command-center/artifacts/user-journey-map.md`
- Decision context

## Spawn protocol (orchestrator)

1. Identify decision class (Tier 3 / scope change / conflict / monolith / design-gap escalation / triage chain / daily-checkpoint).
2. Construct decision packet:
   - Decision-slug (kebab case, e.g. `tier3-payment-provider-choice`)
   - Question / framing
   - Context files (per decision class)
   - Options (if enumerable) or "open question" framing
3. Per member, build a spawn prompt:
   - For VoltAgent members: use the `subagent_type` name directly (`architect-reviewer`, `ux-researcher`, `risk-manager`, `competitive-analyst`, `product-manager`) — Agent tool loads the agent definition
   - For custom members (ceo-reviewer, founder-proxy): use `general-purpose` subagent_type + inject instruction file as FIRST directive
   - Append reading list
   - Append decision packet
   - Output contract: APPROVE / REJECT / ABSTAIN + rationale + hard-stop flag if any
4. Spawn all 7 in parallel, single message.
5. Collect votes. Apply `conflict-resolution.md` voting rules.
6. Write `Planning/wave-<N>-board-<decision-slug>.md` with 7 votes + consolidated decision.

## Vote output format (per member)

```markdown
# BOARD vote — <member-name> — <decision-slug>

## Vote
[APPROVE <option-A> | REJECT | ABSTAIN]

## Rationale (≤150 words)
<Grounded in reading list + decision context. Cite evidence paths.>

## Hard-stop?
[none | "HARD-STOP: must be human — <concrete reason>"]

## Dissent note (only if APPROVE with concerns)
<One-line caveat>
```

## founder-proxy — special role

Only BOARD member that uses claude-mem. Invokes `claude-mem:mem-search` with decision-slug + recent context terms, reads top matches from memory, cross-references with last 10 `product-decisions.md` entries, then simulates founder's likely call.

If memory yields nothing relevant (no prior similar call, no recorded preference): founder-proxy MUST emit `HARD-STOP: must be human — no founder precedent in memory` rather than guess. Designed circuit breaker for genuinely novel calls that deserve founder attention.

## ABSTAIN discipline

ABSTAIN is not vote-against. Use ABSTAIN when the decision is genuinely outside your lens:

- ux-researcher on a pure database-schema migration
- architect-reviewer on a copy-change wave
- competitive-analyst on an internal-tooling decision with no competitor parallel

Don't ABSTAIN to avoid taking a stance — that weakens the signal. When the decision touches your lens, APPROVE or REJECT with rationale.
