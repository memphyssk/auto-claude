# Stage v2 — Competitive Scan: 360° Agent-Ranked Tier 1/2/3

## Purpose
Produce the baseline competitive intelligence the rest of onboarding (v3 features, v7 design direction, v10 milestone framing) and the long-term wave loop (backlog planning, refresh ritual, Stage 0b product decisions) all read from. Agent-ranked tiers prevent flat-list benchmarking that over-weights minor competitors.

## Prerequisites
- Stage v1 complete (Vision + target user known — scoping the competitor set)
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/Sub-agent Instructions/competitive-analyst-instructions.md` (inject as FIRST directive when spawning)
- READ `command-center/rules/autonomous-mode.md` § Competitive intelligence pre-decision benchmark (Playwright live-browsing mandate applies; WebSearch-only research is insufficient — help articles describe intended behavior, not actual UX)

## Actions

### 1. Build competitor candidate list (5-10 targets)

Sources the orchestrator consults:

- **v0 docs** — any competitors the founder named
- **v1 extracted content** — named competitors + differentiation notes
- **Market search** — orchestrator runs WebSearch to surface additional candidates in the product category

Criteria for inclusion on candidate list:

- Builds in the same user category (direct competitor)
- Builds adjacent categories the target user also uses (substitute / adjacent)
- Market leader in the vertical even if pricing/positioning differs
- Fast-growing challenger even if sub-scale today

Target: 5-10 candidates. Fewer than 5 = market research too shallow; more than 10 = sharpen criteria.

### 2. Spawn `competitive-analyst` — live browsing, parallel

Spawn the `competitive-analyst` sub-agent with the candidate list. Per `autonomous-mode.md`, the agent uses Playwright live browsing (dedicated MCP instance per competitor) — NOT WebSearch-only. For larger candidate lists (>5), spawn multiple `competitive-analyst` agents in parallel, one per Playwright instance (`playwright-3`, `playwright-4`, `playwright-5`, `playwright-6`, etc.).

Per-agent prompt MUST include:

```
## CRITICAL RULES
1. You MUST navigate to the live competitor site before reporting
2. You MUST take screenshots as evidence for each material finding
3. Document what requires auth (signup wall, checkout gate) — note "requires auth — could not verify past this point"
4. Do NOT invent UX behaviors you haven't directly observed
5. Output EVIDENCE_QUALITY per finding: DIRECT_OBSERVATION | HELP_ARTICLE | MARKET_RESEARCH | COULD_NOT_VERIFY

## OUTPUT FORMAT per competitor
### <Competitor name>
**URL:** <primary URL>
**Category overlap with us:** <high / medium / low + 1 sentence>
**Business model:** <how they make money>
**Key UX patterns worth noting:** <3-5 observations with screenshots>
**Pricing structure:** <if observable>
**Strengths / differentiators:** <what they're good at>
**Weaknesses / gaps:** <where they're weak, where we could win>
**Evidence screenshots:** <local paths>

## TIER RANKING
At the end, rank ALL competitors you scanned into:
- **Tier 1 — Primary benchmark** (direct competitor, must-match-or-beat on core surfaces)
- **Tier 2 — Secondary / informative** (adjacent, worth studying for patterns but not feature-for-feature parity)
- **Tier 3 — Context only** (distant but useful for category education)

Justify each ranking in one sentence.
```

### 3. Write per-competitor files

Each competitor gets its own file:

```
command-center/artifacts/competitive-benchmarks/<competitor-kebab-case>.md
```

Format follows the per-competitor output block from step 2. File contains: metadata + screenshots + tier ranking + first-seen timestamp.

### 4. Write / update `INDEX.md`

Populate `command-center/artifacts/competitive-benchmarks/INDEX.md` with:

```markdown
# Competitive Benchmarks Index

Per-feature competitor evidence files live in this directory as `<kebab-case>.md`. Files persist across conversations so the same question is never re-researched.

Written by:
- v2 (this stage) — initial population of the competitor set
- `competitive-analyst` agent during `stage-0b-product-decisions.md` Step 2
- `roadmap-refresh-ritual.md` Step 1a

Freshness: benchmarks older than 60 days should be re-verified at the next refresh ritual.

---

## Tier ranking (<YYYY-MM-DD>, v2 onboarding scan)

### Tier 1 — Primary benchmark (match-or-beat)
- `<competitor-1>.md` — <one-line rationale>
- `<competitor-2>.md` — <one-line rationale>

### Tier 2 — Secondary / informative
- `<competitor-3>.md` — <one-line rationale>
- `<competitor-4>.md` — <one-line rationale>

### Tier 3 — Context only
- `<competitor-5>.md` — <one-line rationale>

---

## Freshness log

| Competitor | Last scan | Evidence quality |
|---|---|---|
| <competitor-1> | <YYYY-MM-DD> | DIRECT_OBSERVATION |
| <competitor-2> | <YYYY-MM-DD> | DIRECT_OBSERVATION |
| ... |
```

### 5. Cross-reference into `FOUNDER-BETS.md`

If any v1 bet's "Why I believe this" cites a competitive observation (e.g., "G2G can't deliver in X region — our distribution partner solves this"), update the bet's `Why I believe this` with a path reference to the relevant competitor file. Keeps the bet auditable.

## Deliverable

- `command-center/artifacts/competitive-benchmarks/<competitor-kebab-case>.md` × 5-10 files
- `command-center/artifacts/competitive-benchmarks/INDEX.md` — populated with tier ranking + freshness log
- (If applicable) `FOUNDER-BETS.md` bets cross-referenced to competitor files

## Exit criteria

- ≥5 competitors researched with DIRECT_OBSERVATION evidence for Tier 1 entries (Tier 2/3 may have weaker evidence — HELP_ARTICLE or MARKET_RESEARCH acceptable)
- Every Tier 1 competitor has ≥3 screenshots / Playwright captures in evidence
- INDEX.md tier ranking is complete and coherent (no competitor left un-tiered)
- No unresolved "could not verify" blockers in Tier 1 — if a Tier 1 competitor's key flow needs auth, note it but do not block the stage (evidence quality just degrades)

## Next

→ Return to `../onboarding-loop.md` → Stage v3 (product-scope)
