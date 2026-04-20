# Autonomous Mode

Two complementary forms of autonomy that let the orchestrator proceed without human input:

1. **Decision autonomy (3-tier)** — per-decision classification: Tier 1 auto-decide / Tier 2 proceed + notify / Tier 3 must-ask.
2. **Session autonomy** — session-level flag that skips nice-to-have human checkpoints for the duration of an overnight or extended run.

---

# 1. Decision autonomy — 3-tier classification

Not every decision requires user input. Classify by blast radius and reversibility, then act accordingly.

## Tier 1 — Auto-decide (do it + log in wave closeout)

- Copy/label alignment with Figma (e.g., "Sign out everywhere" → "Log out from all sessions")
- Missing standard marketplace features (password change, pause/unpause listings — every competitor has these)
- Routing consolidation (duplicate routes → redirect, e.g., `/sell/listings` → `/offers`)
- Bug fixes where the correct behavior is unambiguous (500 from enum mismatch, trailing-zero price format)
- Figma-matching layout corrections when the canonical frame exists and the drift is structural (not subjective)
- Seed data additions for testing coverage
- Status label fixes where the label contradicts the enum name (e.g., `DELIVERING` labeled "Pending")

## Tier 2 — Proceed + notify in morning file

- Component extractions / refactors (e.g., extracting `<FeedbackList>` as a shared component)
- New shared UI components implied by the Figma design but not explicitly discussed
- Routing pattern decisions (query param vs sub-path, e.g., `/orders?type=sold` vs `/orders/sold`)
- Display format unification across components (e.g., standardizing price format to `formatPrice()`)
- Adding a new settings tab when the feature is standard and the Figma frame exists

## Tier 3 — Must-ask (queue for user in `open-questions-morning.md`)

- Removing existing features/sections from production (even if not in Figma — prod may have evolved intentionally)
- External service integrations (SumSub, CMS platform choice, payment providers, analytics)
- Major UX direction changes (restructuring a flow, changing navigation hierarchy)
- Anything touching money/payments/security architecture
- Feature additions that go beyond the Figma design (new sections, new pages, new capabilities)
- Renaming user-facing concepts where semantics matter (e.g., "Inbox" vs "Income" — marketplace-specific meaning)

**When in doubt, spawn `competitive-analyst` first — competitor evidence often resolves Tier 2 into Tier 1.**

---

## Competitive intelligence pre-decision benchmark

Spawn `competitive-analyst` to check how competitors handle the same feature before Tier 2 decisions or as evidence for Tier 3 questions.

### When to trigger

- **Tier 2 decisions:** spawn competitive-analyst BEFORE auto-deciding. The agent's recommendation informs the decision. Log the benchmark in `command-center/artifacts/competitive-benchmarks/<feature-name>.md`.
- **Tier 3 questions:** spawn competitive-analyst to gather evidence. Present findings to the user alongside the question: "<competitor-1> does X, G2G does Y, I recommend Z because..."
- **Proactively at wave start:** for any wave touching a user-facing flow, run a quick competitive scan of how the equivalent feature works on 2-3 competitors. Takes ~3 min, prevents bad assumptions.

### Competitors (priority order)

1. **<competitor-1>**
2. **<competitor-2>**
3. **<competitor-3>**
4. **<competitor-4>**
5. **<competitor-5>**

### Two modes

- **Mode 1 — Quick benchmark (~3 min):** WebSearch + WebFetch + Playwright screenshot of the competitor's equivalent page. No account needed. Covers ~80% of questions.
- **Mode 2 — Deep investigation (~15 min):** Log into competitor site via Gmail MCP-registered research email, walk through the actual buyer/seller flow, screenshot each step. Use for complex flow comparisons.

### Benchmark artifacts

Store in `command-center/artifacts/competitive-benchmarks/` as markdown files. Each file: feature name, competitor comparison table, screenshots (referenced), recommendation. Files persist across conversations so the same question is never re-researched.

**Before spawning:** see `rules/sub-agent-workflow.md` for the mandatory instruction-file injection rule.

---

# 2. Session autonomy — `Planning/.autonomous-session` flag

**File:** `Planning/.autonomous-session` — gitignored, session-scoped state flag.

When present, the orchestrator skips human-gated prompts (Dx human-checkpoint, Stage 1b checkpoint, etc.) for the duration of the session. Replaces the wave-level `autonomous_mode` front-matter (which was too granular for overnight runs spanning multiple waves).

## When to SET

Orchestrator creates the file when the user says any of:
- "run overnight" / "work autonomously" / "run autonomous"
- "I'm going to sleep" / "see you in the morning" / "go to bed"
- "keep going until done" / "finish all remaining"
- explicit variations: "don't stop to ask", "don't wake me up"

**Command:**

```bash
cat > Planning/.autonomous-session <<EOF
started_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)
reason: <quote user's phrasing in one line>
expires_on: user-says-stop | orchestrator-finishes-all-work
EOF
```

Confirm to user in one line: "Autonomous session flag set — I won't interrupt for checkpoints."

## When to CHECK

Every stage + every Dx entry:

```bash
if [ -f Planning/.autonomous-session ]; then AUTONOMOUS=true; else AUTONOMOUS=false; fi
```

Stages that check:
- **Stage 1** (problem-framer outputs) — skip Stage 1b human-checkpoint if AUTONOMOUS
- **Dx.3 (design-gap)** — skip pre-review human-checkpoint if AUTONOMOUS
- **Any user-facing AskUserQuestion** that is classified as "optional / would be nice" — skip silently if AUTONOMOUS
- **Never skipped regardless of flag:** destructive-action confirmations, merge-to-main prompts where user explicitly requested review, scope-change proposals (EXPAND / REDUCE verdicts from ceo-reviewer)

Log the skip in the wave closeout so the user can audit in the morning.

## When to CLEAR

Orchestrator deletes the file when the user says any of:
- "I'm back" / "I'm awake"
- "pause" / "let's discuss" / "stop running"
- "exit autonomous mode" / "stop the autonomous run"
- OR orchestrator itself when it finishes the committed work (e.g. after final wave's closeout summary, clear flag before "ready in the morning" message)

**Command:**

```bash
rm -f Planning/.autonomous-session
```

Confirm: "Autonomous session ended."

## Precedence rules

1. **Session flag wins over wave plan front-matter.** If a wave plan accidentally declares `autonomous_mode: false`, the session flag (if present) still applies. Wave plans should NOT declare their own autonomous_mode at all — the field is deprecated.
2. **Destructive actions still prompt** regardless of flag (force-push, delete branch, DROP TABLE, etc.). The flag skips "nice-to-have" checkpoints, not safety gates.
3. **Critical errors still escalate** — if `/investigate` fails or a Stage 3 gate returns BLOCK after 2 iterations, orchestrator surfaces the issue + waits, even during autonomous mode. Better to stall than to ship bad code under the flag's cover.
4. **User override at any time** — if the user messages during an autonomous run, orchestrator responds immediately, regardless of the flag state.

## gitignore

`.autonomous-session` must be in `.gitignore`:

```
# session-scoped flags (not history)
Planning/.autonomous-session
```

Session state never belongs in git history.

## Audit trail

Every wave closeout during autonomous mode should include a line:

```markdown
## Autonomous-session audit
- Flag active during this wave (file mtime: <timestamp>)
- Skipped checkpoints: [list of checkpoint names that were skipped]
- Decisions made autonomously: [list of product calls the orchestrator made without asking]
```

Lets the user quickly audit what was decided without them at the next review.

---

## How the two forms interact

| Scenario | Decision autonomy applies | Session autonomy applies |
|---|---|---|
| Tier 1 product decision | Auto-decide | (no effect) |
| Tier 2 product decision | Proceed + log in morning file | (no effect) |
| Tier 3 product decision | Queue for user | Still queued — session flag does NOT auto-resolve Tier 3 items |
| Dx human-checkpoint | (no effect) | Skipped when flag active |
| Stage 1b checkpoint | (no effect) | Skipped when flag active |
| Destructive action | (no effect) | Still prompts |
| CEO scope-change proposal | (no effect) | Still prompts |

**Key invariant:** the session flag NEVER escalates Tier 2 → Tier 1, NEVER auto-resolves Tier 3 items. It only skips non-decision checkpoints (Dx preview, Stage 1b drift-review, etc.) that are nice-to-haves during normal runs but become noise during overnight work.
