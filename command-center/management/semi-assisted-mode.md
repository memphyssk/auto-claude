# Mode — Semi-Assisted

Default "working autonomously" mode. Skips nice-to-have checkpoints for overnight or extended runs, but escalates strategic calls and hard-stops to the founder. Strictly less permissive than `full-autonomy` (which routes strategic calls to BOARD instead).

For mode switching and flag-file semantics, see `mode-switching.md`.

## Flag

`Planning/.autonomous-session` with `mode: semi-assisted`.

## Entry conditions

User phrases: "run overnight" / "work autonomously" / "I'm going to sleep" / "don't stop to ask" — see `mode-switching.md` for full list.

## Behavior

### Decision autonomy — 3-tier classification

Classify every decision by blast radius and reversibility. The tier determines the routing. This applies in all modes; what changes across modes is what happens on Tier 3.

**Tier 1 — Auto-decide** (log in wave closeout):
- Copy/label alignment with design mockups
- Missing standard marketplace features every competitor has
- Routing consolidation (duplicate routes → redirect)
- Bug fixes where correct behavior is unambiguous
- Canonical-frame layout corrections (structural, not subjective)
- Seed data additions for testing coverage
- Status label fixes where label contradicts the enum name

**Tier 2 — Proceed + notify in morning file:**
- Component extractions / refactors
- New shared UI components implied by the design but not explicitly discussed
- Routing pattern decisions (query param vs sub-path)
- Display format unification across components
- Adding a new settings tab when the feature is standard and the mockup exists

**Tier 3 — Must escalate** (queue for founder via `daily-checkpoint.md` 3-bucket batch under semi-assisted):
- Removing existing features/sections from production
- External service integrations (new SaaS provider, payment providers, analytics)
- Major UX direction changes (restructuring a flow, changing navigation hierarchy)
- Anything touching money / payments / security architecture
- Feature additions beyond the scoped design
- Renaming user-facing concepts where semantics matter

When in doubt, spawn `competitive-analyst` first — competitor evidence often resolves Tier 2 into Tier 1.

### Competitive intelligence pre-decision

Spawn `competitive-analyst` before Tier 2 decisions and as supporting evidence for Tier 3 questions.

- **Quick benchmark (~3 min):** WebSearch + WebFetch + Playwright screenshot of the competitor's equivalent page. Covers ~80% of questions.
- **Deep investigation (~15 min):** log into competitor site, walk the actual buyer/seller flow, screenshot each step. For complex flow comparisons.

Store artifacts in `command-center/artifacts/competitive-benchmarks/` as markdown files. Before spawning: see `rules/sub-agent-workflow.md`.

### Session-level skips (semi-assisted specific)

When `mode: semi-assisted` is active, skip these human-gated checkpoints:

- **Stage 1** — skip Stage 1b human-checkpoint
- **Dx.3 (design-gap)** — skip pre-review human-checkpoint
- **Any AskUserQuestion classified "optional / would be nice"** — skip silently

**Never skipped regardless of mode:** destructive-action confirmations, money commitments, merge-to-main prompts where user explicitly requested review, scope-change proposals (EXPAND / REDUCE from ceo-reviewer).

Log every skip in the wave closeout.

## Routing thresholds

| Scenario | founder-review | semi-assisted | full-autonomy |
|---|---|---|---|
| Tier 1 product decision | Auto-decide | Auto-decide | Auto-decide |
| Tier 2 product decision | Proceed + log | Proceed + log | Proceed + log |
| Tier 3 product decision | Queue to daily-checkpoint (founder) | Queue to daily-checkpoint (founder) | BOARD (6+/7 strict) |
| Dx human-checkpoint | Prompt founder | Skip | Skip |
| Stage 1b checkpoint | Prompt founder | Skip | Skip |
| Destructive action | Prompt founder | Prompt founder | Prompt founder |
| Money commitment | Prompt founder | Prompt founder | Prompt founder |
| CEO EXPAND/REDUCE scope | Prompt founder | Prompt founder | BOARD (4+/7) |
| Hard-stop member veto | n/a | n/a | Escalate to founder |

## Anti-patterns

### 1. Do not escalate Tier 2 decisions as if they were Tier 1.
Why: The mode flag never lowers the bar — it only controls checkpoint-skipping and Tier 3 routing.

### 2. Do not auto-resolve Tier 3 without BOARD routing in full-autonomy.
Why: Tier 3 requires BOARD (6+/7) in full-autonomy; skipping BOARD is a protocol violation.

## Exit conditions

- User says "I'm back" / "pause" / "stop the autonomous run" → delete flag file or flip `mode:` to `founder-review`.
- Orchestrator finishes all work → delete flag file.

Audit trail in wave closeout:

```markdown
## Autonomous-session audit
- Mode: semi-assisted (file mtime: <timestamp>)
- Skipped checkpoints: [list]
- Decisions made autonomously: [list]
```
