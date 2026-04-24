# MD Optimization Plan

Strategy for applying the v0.14-v0.20 "slick, commanding, value-packed" treatment to the rest of the brain's markdown files. Onboarding excluded per founder.

**Confirmed scope** (this document): 80 non-principles, non-observation, non-onboarding MDs, ~6700 lines total. Projected trim: ~1000-1200 lines.

**Confirmed approach** (this document):
- Contract-treatment applied to rulebook files AND sub-agent instructions (pilot first, full rollout second).
- Procedural files get shape standardization, no Contract.
- User-facing docs get clarity-focused trim, no Contract.

---

## File classification

| Group | Files | Current lines | Treatment |
|---|---|---|---|
| **A. Rulebook** — orchestrator/sub-agent guidance | 15 × `rules/*.md` (ex-principles, ex-stages), 25 × `Sub-agent Instructions/*` | ~2400 | Contract block (topic-scoped bullet 4) + flat-numbered rules where they exist; trim narrative fat |
| **B. Procedural** — state machines, protocols, stage sequences | 18 × stage files, 9 × management mode/protocol files | ~2700 | Standardize shape per subgroup; no Contract (rules aren't accumulated here); trim prose |
| **C. User-facing** — tutorials, READMEs, scaffolds | `README.md`, `setup-tools/install.md`, `CLAUDE.md`, product/design scaffolds | ~1600 | Clarity over terseness; limited trimming; skip scaffolds (intentionally blank) |

## Skipped (explicit)

- **Sub-agent Observations** (20 files) — Stage 9/10 pipeline governs; not orchestrator-read.
- **Scaffolding templates** — `product/ROADMAP.md`, `product/FOUNDER-BETS.md`, `product/product-decisions.md`, `product/founder-stage.md`, `design/DESIGN-SYSTEM.md`, `design/brief-template.md`, `design/review-gate.md`, `artifacts/user-journey-map.md`. Intentionally blank per-project.
- **`CHANGELOG.md`** — append-only history.
- **Platform templates** — `rules/monitors/railway-deploy.md`, `gh-actions.md`, `netlify-deploy.md`. Already terse.
- **Onboarding files.**

---

## Group A — Rulebook

### A1. `rules/*.md` (11 files)

- `sub-agent-workflow.md`
- `skill-use.md`
- `housekeeping.md`
- `backlog-planning.md`
- `daily-checkpoint.md`
- `external-sdks.md`
- `security-waves.md`
- `triage-routing-table.md`
- `roadmap-lifecycle.md`
- `roadmap-refresh-ritual.md`
- `product-mega-testing/product-mega-testing.md`

**Moves per file:**
1. Add Contract block with topic-scoped bullet 4.
2. Convert prose rules to `### N. Imperative. / Why: sentence.` format.
3. Strip war stories, wave refs, `Context:` / `Cross-ref:` fields.
4. Drop MUST/SHOULD bolding where noise.
5. Delete duplicates (cross-check against instruction files + other rules).
6. Preserve external references (section numbers, rule numbers).

### A2. Sub-agent Instructions (25 files)

**Pilot first** on 3-5 files to prove format, then full rollout.

**Standardized shape per agent:**
```
Role → Required reading → Output format → Anti-patterns (Contract-governed)
```

Only the **Anti-patterns / Rules** section gets Contract-ified. Role/Required-reading/Output-format sections are setup, not rules — keep prose.

**Coordinated change:** karen's instruction file updates in the same release to drive Stage 10 output in Contract format — otherwise future auto-distillation produces free-form entries that break the discipline.

**Expected trim (Group A total):** ~400 lines cut.

---

## Group B — Procedural

### B1. Stage files (18 files)

`rules/build-iterations/stages/stage-0-prior-work.md` through `stage-11-next.md` + conditional sub-stages `0b / 3b / 4b / 5b / 6b / 7b`.

**Existing shape:** Purpose / Prerequisites / Actions / Deliverable / Exit criteria / Next.

**Moves:**
1. Enforce the shape uniformly across all 18 files.
2. Actions as numbered steps (1 line each) instead of prose paragraphs.
3. Drop rationale paragraphs about "why this stage exists" — wave-loop.md already frames them.
4. Preserve conditional sub-stage markers.
5. Preserve "Next" pointers.

**No Contract block** — stage files are procedures, not accumulators.

**Expected trim:** ~200 lines.

### B2. Management mode + protocol files (9 files)

- Mode files: `semi-assisted-mode.md`, `full-autonomy-mode.md`, `danger-builder-mode.md`, `mode-switching.md`
- BOARD files: `board.md`, `board-members.md`, `conflict-resolution.md`
- Support: `ceo-bound.md`, `notifications/agentmail.md`

**Moves:**
1. Per mode file, standardize: `Flag → Entry conditions → Behavior → Routing thresholds → Anti-patterns → Exit conditions`.
2. Convert decision tables from prose to actual markdown tables.
3. Drop wave-history provenance.
4. `board-members.md`: tighten each member entry to ≤3 lines (role, vote weight, tie-breaking scope).

**Expected trim:** ~300 lines.

---

## Group C — User-facing

### C1. Top-level

- **`CLAUDE.md`** (158 lines) — already tight after v0.12.x. One revisit pass after Group A+B to reconcile trigger-table references.
- **`README.md`** (311 lines, GitHub-visible) — clarity-focused. Minor trim only.
- **`command-center/README.md`** — index file, keep as pointer.

### C2. Setup/tooling

- **`setup-tools/install.md`** (716 lines — biggest file) — separate focused audit. Likely has outdated sections, duplicated command blocks, excessive platform coverage. Candidate for split-by-platform.
- **`setup-tools/README.md`** + `setup-tools/skills/*/SKILL.md` — keep as-is unless audit flags issues.

**Expected trim:** ~150-200 lines (mostly install.md).

---

## Proposed release order

| Release | Scope |
|---|---|
| **v0.21.0** | Group A1 — `rules/*.md` (11 files). Ship in 2-3 sub-releases if reviewing file-by-file. |
| **v0.22.0** | Group A2 pilot — 3-5 Sub-agent Instructions + karen-instruction update. |
| **v0.23.0** | Group A2 full rollout — remaining Sub-agent Instructions. |
| **v0.24.0** | Group B1 — stage files (18 files). |
| **v0.25.0** | Group B2 — management (9 files). |
| **v0.26.0** | Group C1 — CLAUDE.md revisit + README tight pass. |
| **Later** | `setup-tools/install.md` audit. |

---

## Pre-flight notes for when we return

1. **Karen-instruction update goes in v0.22.0**, not earlier. Contract-ify sub-agent instructions and karen's output format in the same release so Stage 10 distillation produces Contract-shaped entries going forward.
2. **Per-file before/after preview** — for any file >100 lines, preview the rewrite shape before full Write (user-validated pattern from v0.14.x-v0.18.x).
3. **CHANGELOG discipline** — each release entry names the in-file contract reference, scope/not-changed, consumer-sync migration steps (per the template we've been using since v0.14).
4. **Rule numbering preservation** — when a file is referenced externally by rule number or section number, numbering stays stable across the rewrite.
5. **Existing Contract block enforcement** — v0.20.x + CLAUDE.md rule #13 + `rules/housekeeping.md` Stage 8 paragraph already govern principles-file writes. Group A's rule files will carry the same Contract block; the same enforcement rule #13 extends to them naturally.
