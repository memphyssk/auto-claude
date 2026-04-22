# Mode — Semi-Assisted

Default "working autonomously" mode. Skips nice-to-have checkpoints for the duration of an overnight or extended run, but escalates strategic calls + hard-stops to the founder. Strictly less permissive than `full-autonomy` (which routes strategic calls to BOARD instead).

For mode switching and flag-file semantics, see `mode-switching.md`. For the alternate full-autonomy mode, see `full-autonomy-mode.md`.

---

# 1. Decision autonomy — 3-tier classification

Not every decision requires user input. Classify by blast radius and reversibility, then act accordingly. This applies in ALL modes — what changes across modes is what happens on Tier 3 (founder in founder-review / semi-assisted, BOARD in full-autonomy).

## Tier 1 — Auto-decide (do it + log in wave closeout)

- Copy/label alignment with design mockups (e.g., "Sign out everywhere" → "Log out from all sessions")
- Missing standard marketplace features (password change, pause/unpause listings — every competitor has these)
- Routing consolidation (duplicate routes → redirect, e.g., `/sell/listings` → `/offers`)
- Bug fixes where the correct behavior is unambiguous (500 from enum mismatch, trailing-zero price format)
- Canonical-frame layout corrections when the drift is structural (not subjective)
- Seed data additions for testing coverage
- Status label fixes where the label contradicts the enum name (e.g., `DELIVERING` labeled "Pending")

## Tier 2 — Proceed + notify in morning file

- Component extractions / refactors (e.g., extracting `<FeedbackList>` as a shared component)
- New shared UI components implied by the design but not explicitly discussed
- Routing pattern decisions (query param vs sub-path, e.g., `/orders?type=sold` vs `/orders/sold`)
- Display format unification across components (e.g., standardizing price format to `formatPrice()`)
- Adding a new settings tab when the feature is standard and the mockup exists

## Tier 3 — Must escalate

**Under `founder-review` / `semi-assisted`:** queue for founder via `daily-checkpoint.md` (3-bucket batch).
**Under `full-autonomy`:** route to BOARD with 6+/7 strict threshold (see `full-autonomy-mode.md` routing table).

Typical Tier 3 cases:
- Removing existing features/sections from production (even if not in mockups — prod may have evolved intentionally)
- External service integrations (new SaaS provider, payment providers, analytics)
- Major UX direction changes (restructuring a flow, changing navigation hierarchy)
- Anything touching money/payments/security architecture
- Feature additions beyond the scoped design (new sections, new pages, new capabilities)
- Renaming user-facing concepts where semantics matter (e.g., "Inbox" vs "Income" — product-specific meaning)

**When in doubt, spawn `competitive-analyst` first** — competitor evidence often resolves Tier 2 into Tier 1.

---

## Competitive intelligence pre-decision benchmark

Spawn `competitive-analyst` to check how competitors handle the same feature before Tier 2 decisions or as evidence for Tier 3 questions.

### When to trigger

- **Tier 2 decisions:** spawn competitive-analyst BEFORE auto-deciding. The agent's recommendation informs the decision. Log the benchmark in `command-center/artifacts/competitive-benchmarks/<feature-name>.md`.
- **Tier 3 questions:** spawn competitive-analyst to gather evidence. Under founder-review / semi-assisted, present findings alongside the question: "`<competitor-1>` does X, `<competitor-2>` does Y, I recommend Z because…" Under full-autonomy, competitive-analyst is already a BOARD member and will vote with the benchmark.
- **Proactively at wave start:** for any wave touching a user-facing flow, run a quick competitive scan of 2-3 competitors. ~3 min, prevents bad assumptions.

### Two modes

- **Mode 1 — Quick benchmark (~3 min):** WebSearch + WebFetch + Playwright screenshot of the competitor's equivalent page. No account needed. Covers ~80% of questions.
- **Mode 2 — Deep investigation (~15 min):** log into competitor site via registered research email, walk through the actual buyer/seller flow, screenshot each step. Use for complex flow comparisons.

### Benchmark artifacts

Store in `command-center/artifacts/competitive-benchmarks/` as markdown files. Each file: feature name, competitor comparison table, screenshots (referenced), recommendation. Files persist across conversations so the same question is never re-researched.

**Before spawning:** see `rules/sub-agent-workflow.md` for the mandatory instruction-file injection rule.

---

# 2. Session-level skips (semi-assisted specific)

When `mode: semi-assisted` is active, the orchestrator skips human-gated checkpoints that are nice-to-haves during normal runs but become noise during overnight work:

## Stages that check

- **Stage 1** (problem-framer outputs) — skip Stage 1b human-checkpoint
- **Dx.3 (design-gap)** — skip pre-review human-checkpoint
- **Any user-facing AskUserQuestion** classified as "optional / would be nice" — skip silently
- **Never skipped regardless of mode:** destructive-action confirmations, money commitments, merge-to-main prompts where user explicitly requested review, scope-change proposals (EXPAND / REDUCE verdicts from ceo-reviewer)

Log every skip in the wave closeout so the user can audit in the morning.

## Audit trail

Every wave closeout during semi-assisted should include:

```markdown
## Autonomous-session audit
- Mode: semi-assisted (file mtime: <timestamp>)
- Skipped checkpoints: [list of checkpoint names that were skipped]
- Decisions made autonomously: [list of product calls the orchestrator made without asking]
```

Lets the user quickly audit what was decided without them at the next review.

---

## Mode interaction summary

| Scenario | founder-review | semi-assisted | full-autonomy |
|---|---|---|---|
| Tier 1 product decision | Auto-decide | Auto-decide | Auto-decide |
| Tier 2 product decision | Proceed + log | Proceed + log | Proceed + log |
| Tier 3 product decision | Queue to daily-checkpoint (founder answers) | Queue to daily-checkpoint (founder answers) | BOARD (6+/7 strict) |
| Dx human-checkpoint | Prompt founder | Skip | Skip |
| Stage 1b checkpoint | Prompt founder | Skip | Skip |
| Destructive action | Prompt founder | Prompt founder | Prompt founder |
| Money commitment | Prompt founder | Prompt founder | Prompt founder |
| CEO EXPAND/REDUCE scope | Prompt founder | Prompt founder | BOARD (4+/7) |
| Hard-stop member veto | n/a | n/a | Escalate to founder |

**Key invariant:** mode flag NEVER escalates Tier 2 → Tier 1, NEVER auto-resolves Tier 3 without BOARD in full-autonomy. The flag only controls (a) skipping nice-to-have checkpoints in semi-assisted, (b) routing former user-asks to BOARD vs founder in full-autonomy.
