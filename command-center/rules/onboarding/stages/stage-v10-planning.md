# Stage v10 — Planning: Milestones, TaskMaster, ROADMAP.md, product-decisions.md

## Purpose
Turn all onboarding artifacts into an executable plan. Produce milestones (themes), populate TaskMaster with stages/tasks, seed ROADMAP.md with the milestone set, and backfill product-decisions.md with every decision made during v5-v9.

## Prerequisites
- v6b complete (architecture library doc exists)
- v9 complete (all pages designed + approved) — skip this prerequisite for backend-only / API-only / CLI projects that skipped v7-v9
- TaskMaster is installed and initialized (`.taskmaster/` exists)
- READ `command-center/rules/roadmap-lifecycle.md` (schema + states + edit rules)
- READ `command-center/management/semi-assisted-mode.md` §1 (Tier 3 surfacing pattern for any decisions the agent can't make; BOARD is OFF during onboarding)
- READ `command-center/product/founder-stage.md` — `stage:` value governs horizon defaulting for compliance-themed milestones in step 1

## Actions

### 1. Generate milestones from artifacts

Consolidate inputs:
- `FOUNDER-BETS.md` live bets → each bet should trace to ≥1 milestone
- `feature-list.md` MVP + H2 + H3 classification → milestones group features by theme + horizon
- `user-journey-map.md` flows → ensures all personas are covered
- `design/<page>.html` × N → every page needs at least one implementation milestone (could be bundled)
- `dev/architecture/_library.md` → infrastructure milestones (auth setup, DB bootstrap, CI pipeline, observability, etc.)

Produce milestone list. Each milestone:
- Theme name (e.g., "M1 — Auth & User Onboarding", "M2 — Core Product Listing")
- Horizon (H1 / H2 / H3)
- Target success metric (even if preliminary — founder can sharpen at first refresh)
- Bet source (which founder bet drives this milestone)
- TaskMaster tag slug (kebab-case)
- Scope surfaces (pages + modules + services + SDKs + features covered)
- References (to feature-list, pages, arch branches)

**Horizon defaulting for compliance-themed milestones.** Milestones whose theme is GDPR / consent UI / privacy-rights / audit-compliance admin / cross-border-data / AI Act transparency / admin-policy / regulated-compliance default as follows:

| Founder stage | Default horizon for compliance-themed milestones |
|---|---|
| `self-use-mvp` | H2 |
| `pilot-customer` | H2 |
| `paying-customers` | H1 |
| `regulated-day-1` | H1 |

Exception: a named regulatory deadline or named first-customer requirement lands the milestone in H1 regardless of stage — cite the deadline / requirement verbatim in the milestone's `Why now:` line. Non-compliance milestones use normal horizon judgment driven by MVP scope + founder bets.

### 2. Seed ROADMAP.md

Write milestones to `command-center/product/ROADMAP.md` § Active milestones. Each milestone block follows `roadmap-lifecycle.md` schema. Status = `planned`.

H1 milestones = MVP items. H2/H3 milestones are planned-but-not-yet-active.

Update the `**Last refresh:**` + `**Last refresh trigger:**` top matter to today + "v10 onboarding — initial population".

### 3. Populate TaskMaster — milestones + stages + tasks

For each milestone, create a TaskMaster task hierarchy:

- **Top-level task** with the milestone slug as tag, `status: pending`, `priority: high` for H1 items
- **Subtasks** broken down by stage — typically one subtask per page + one per architectural bootstrap step + one per external integration

For each TaskMaster task add metadata:
```json
{
  "roadmapMilestone": "m<N>-<slug>",
  "roadmapAnchor": "command-center/product/ROADMAP.md#m<N>--<anchor>",
  "successMetric": "<metric from milestone>",
  "source": "v10-onboarding",
  "urgency": "blocks | fast-follow | next-wave | backlog"
}
```

Urgency defaults to `next-wave` for H1 items, `backlog` for H2/H3.

### 4. Populate `product-decisions.md` — backfill

Walk through every decision made during v5-v9 and ensure each has an entry in `command-center/product/product-decisions.md`. Expected minimum:

- v5 stack selection (one entry)
- v6 per-branch architectural choices worth capturing (e.g., "Prisma per-module schema", "Socket.IO namespace strategy", "Railway deploy via Dockerfile not Railpack") — aim for 3-5 entries
- v7 design direction (one entry)
- v8 design system build (one entry)
- v9 per-page design consistency patterns (one entry)
- Any Tier 3 deferrals surfaced during v1 → resolve now, log each

Format per entry is defined in the scaffold — keep entries short (Context / Decision / Rationale / Alternatives considered).

### 5. Coverage check

Run a mandatory audit. For each item below, confirm TaskMaster has a task that covers it:

- Every page in `design/<page>.html` → has an implementation task
- Every MVP feature in `feature-list.md` → has a task or is part of a milestone
- Every MVP module in `module-list.md` → has a bootstrap task
- Every external SDK in `sdks.md` → has an integration task
- Every architecture branch's Risk/open-item → has a triage task (even if just `priority: low`)

If any item has zero coverage: create the missing TaskMaster task. Loop until coverage = 100% for MVP items.

### 6. Tier 3 founder polling (if any)

If any planning decision required Tier 3 escalation (e.g., "Should we charge per-seat or usage-based? No strong signal in docs"), batch all Tier 3 items into ONE `AskUserQuestion`. Resolve, update decisions + tasks accordingly.

### 7. Commit snapshot

```bash
git add command-center/product/ROADMAP.md \
        command-center/product/product-decisions.md \
        .taskmaster/
git commit -m "chore(onboarding): v10 planning complete — <N> milestones, <N> tasks"
```

## Deliverable

- `command-center/product/ROADMAP.md` — populated with H1/H2/H3 milestones (status=planned for all)
- `command-center/product/product-decisions.md` — backfilled with 10-20 decisions from v5-v9
- `.taskmaster/tasks/tasks.json` — populated with milestone-anchored tasks + metadata
- Coverage = 100% for MVP surfaces

## Exit criteria

- ROADMAP.md has ≥3 milestones (one per horizon minimum) and all H1 milestones have success metrics
- TaskMaster has tasks covering every MVP page / feature / module / SDK
- Every v5-v9 decision is logged in product-decisions.md
- Zero Tier 3 items remain unresolved

## Next

→ Return to `../onboarding-loop.md` → Stage v11 (handoff)
