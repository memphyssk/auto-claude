# Stage v1 — Vision & Gaps: Parse Docs, Poll Only for What's Missing

## Purpose
Turn the raw documents from v0 into seeded `FOUNDER-BETS.md` + `ROADMAP.md` north star. **Extraction first, polling second.** Only ask the founder for what the docs genuinely don't contain. Do NOT re-ask for anything the founder has already written down.

## Prerequisites
- Stage v0 complete (`command-center/docs-input/*.md` exists with ≥200 chars of founder content)
- `command-center/product/FOUNDER-BETS.md` scaffold exists (shipped with auto-claude)
- `command-center/product/ROADMAP.md` scaffold exists (shipped with auto-claude)
- READ `command-center/rules/autonomous-mode.md` §1 — Tier 3 items should be raised via AskUserQuestion (no wave cycle exists yet, so nothing can defer to daily checkpoint)

## Actions

### 1. Parse v0 input docs — extract what's there

Read every `command-center/docs-input/*.md` file. Extract into a structured working-memory table (orchestrator internal, no file written yet):

| Field | Extracted? | Content |
|---|---|---|
| Vision / North Star | ✅/❌ | <quote or paraphrase from docs> |
| Target user / market | ✅/❌ | <content> |
| Product one-liner | ✅/❌ | <content> |
| Core bets (strategic convictions) | ✅/❌ | <list, one per bet; ≥1 bet expected> |
| Named competitors | ✅/❌ | <list> |
| Differentiation vs competitors | ✅/❌ | <how does this win> |
| Horizon signal (H1 / H2 / H3) | ✅/❌ | <MVP scope vs medium-term vs moat> |
| Must-have features (MVP) | ✅/❌ | <list> |
| Out-of-scope / non-goals | ✅/❌ | <list> |
| Monetization / business model | ✅/❌ | <how does it make money> |

For each field: mark ✅ if the docs provide a direct, unambiguous answer. Mark ❌ if absent or vague. "Maybe implied" = ❌ — don't guess, poll the founder instead.

### 2. Gap-polling decision

If **all ✅** in the essentials (Vision, Target user, Product one-liner, ≥1 bet, Competitors): proceed directly to step 3, no polling.

If **any ❌** in the essentials: batch the gaps into ONE `AskUserQuestion` session. Ask only what's missing. Template:

> "I extracted most of what I need from your docs but a few things are missing or unclear. Give me short answers to each:
>
> 1. **<Field name>**: <specific question, e.g. 'You mentioned X and Y users — is one primary or are they equal weight?'>
> 2. **<Field name>**: <question>
> 3. **<Field name>**: <question>"

Keep the poll under 5 questions. If the doc gap is larger (>5 essentials missing), something is wrong with v0 input — escalate to founder with "Your docs are very sparse — can you provide a fuller brief? Here's a prompt template: …"

### 3. Seed `FOUNDER-BETS.md`

Populate the scaffold with extracted + polled content:

- **Vision / North Star section** — one paragraph, founder's voice preserved (quote where possible)
- **Live bets section** — one `### Bet 1 — <name>` block per conviction. For EACH bet, fill all 7 fields (Statement / Why I believe this / Horizon / Confidence / Falsifier / Status=live / Created=today). If the founder hasn't said "this bet would be falsified if X", poll for ONE falsifier per bet — non-falsifiable bets aren't bets, they're hopes.

Commit to `command-center/product/FOUNDER-BETS.md`. Do NOT commit to git yet — v11 handles the initial commit.

### 4. Seed `ROADMAP.md` north star + horizon intent

Populate:

- **Vision / North Star section** — mirror the FOUNDER-BETS vision text (single source of truth lives in FOUNDER-BETS; ROADMAP restates for orientation per the scaffold convention)
- **Horizons section** — if the docs provided horizon signal (H1 MVP, H2 retention, H3 moat), populate the Intent column. If absent, leave the scaffold defaults and note a `[TBD at first refresh ritual]` annotation.
- **Active milestones** — stays empty per scaffold. Milestones are authored by v10 planning + first refresh ritual.

Commit to `command-center/product/ROADMAP.md`.

### 5. Tier 3 escalation path (if something truly contentious)

If during gap-polling the founder raises a question that's a Tier 3 autonomous-mode decision (e.g. "Do we do crypto payments or not — I don't know"), DO NOT force a decision here. Record in `command-center/product/product-decisions.md` scaffold as a `Deferred — resolve at v10` entry. v10 batches these with wave-plan decisions for founder resolution.

## Deliverable

- `command-center/product/FOUNDER-BETS.md` — populated with Vision + ≥1 live bet
- `command-center/product/ROADMAP.md` — populated North Star + Horizons intent (if extractable) + empty milestones
- `command-center/product/product-decisions.md` — any Tier 3 deferrals logged

## Exit criteria

- Vision + target user + product one-liner are unambiguously captured in FOUNDER-BETS + ROADMAP
- ≥1 founder bet fully populated (all 7 fields including Falsifier)
- No outstanding ❌ essentials from step 1's extraction table
- (If any polling happened) founder has confirmed the extracted content reflects their intent

## Next

→ Return to `../onboarding-loop.md` → Stage v2 (competitive-scan)
