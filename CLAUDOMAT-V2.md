# CLAUDOMAT V2 — Two-Level Stage Architecture (Block → Stage)

> Working proposal. Not yet adopted. Source-of-truth for the V2 rewrite discussion.

## Why the current model breaks down

The flat sequence `0 → 0b → 1 → 2 → 3 → 3b → 4 → 4b → 5 → 5b → 6 → 6b → 7 → 7b → 8 → 9 → 10 → 11` has three structural problems:

1. **Letter-suffix hack** for conditional substages — `3b`, `4b`, `5b`, `6b`, `7b` are all "I needed to insert one more thing here" without a proper conceptual home.
2. **Compression of distinct concerns** — Stage 1 conflates symptom-vs-cause + antipatterns + size-rubric + sibling extraction. Stage 2 conflates spec-authoring + approach + plan. Stage 4 lumps schema, contracts, backend, frontend, wiring into one parallel free-for-all where merge conflicts surface late.
3. **Test-layer flattening** — `5b/6/6b` papers over the difference between unit-vs-integration-vs-E2E-vs-perf-vs-layout-vs-security as if they were one thing.

The fix is two-level dispatch: top-level **blocks** with their own internal **stage sequences**.

---

## The 8 blocks

| Block | Symbol | Replaces | Purpose |
|---|---|---|---|
| **Product** | P | 0, 0b, 1, 2 (partial), 3 | Frame the problem, decompose, write the spec, gate the spec |
| **Design** | D | 3b | Brief → variants → review → adopt (UI waves only) |
| **Build** | B | 4, 4b | Schema → contracts → backend → frontend → wiring → review |
| **CI/CD** | C | 5 | PR → CI watch → merge → deploy → canary |
| **Test** | T | 5b, 6, 6b | Per-layer testing (static/unit/contract/integration/e2e/layout/perf/security/journey) |
| **Verify** | V | 7, 7b | Karen + Jenny against deployed state, triage, fast-fix loop |
| **Learn** | L | 8, 9, 10 | Docs, status, observations, distillation |
| **Next** | N | 11 | Survey backlog, fire triggers, seed next wave |

Order: **P → [D] → B → C → T → V → L → N** with explicit cross-block hops (V-4 → B-block fast-fix; C-2 fail → B-block via /investigate).

---

## Per-block stage decomposition

### P — Product (7 stages)
Replaces today's 0/0b/1/2/3 — pulls apart what's currently fused.

| Stage | File | Responsibility |
|---|---|---|
| P-0 | `P-0-discover.md` | Prior-work query (claude-mem) + roadmap alignment + product-decisions backlog scan |
| P-1 | `P-1-frame.md` | Symptom-vs-cause + antipatterns red-team (problem-framer + ceo-reviewer parallel) |
| **P-2** | `P-2-decompose.md` | **Wave decomposition** — size rubric, sibling extraction, RESCOPE-AUTO-SPLIT verdict, output `scope.md` + `sibling-tasks.md` |
| **P-3** | `P-3-spec.md` | **Spec authoring** — acceptance criteria, observable contracts, edge cases, error states; embed in TaskMaster `details` AND `Planning/spec.md` |
| P-4 | `P-4-approach.md` | Tech approach — architecture deltas, data model, API contracts, dep list |
| P-5 | `P-5-plan.md` | Stepwise plan — file-level steps, specialist routing, parallelization map |
| P-6 | `P-6-gate.md` | Karen + Jenny + Gemini (high-stakes) pre-impl gate against spec ↔ approach ↔ plan |

**Why this matters:** P-2 and P-3 are net-new explicit stages. Today they're squeezed into Stage 1's tail and Stage 2's middle, which is exactly why wave decomposition and spec quality are weak. Pulling them out gives each its own discipline file, retro target, and reviewer.

### D — Design (5 stages, conditional)
Today's monolithic `stage-3b-design-gap.md` already has implicit substeps; just lift them.

| Stage | File | Responsibility |
|---|---|---|
| D-1 | `D-1-brief.md` | Author brief from `design/brief-template.md` |
| D-2 | `D-2-variants.md` | `/design-shotgun` — generate 4-6 variants in `design/staging/` |
| D-3 | `D-3-iterate.md` | Selection + iteration loop |
| D-4 | `D-4-review.md` | `design/review-gate.md` rubric pass |
| D-5 | `D-5-adopt.md` | Promote to `design/DESIGN-SYSTEM.md` + page-design folder |

Skip entire D-block: backend-only, infra-only, doc-only waves with no `design_gap_flag`.

### B — Build (8 stages, hard-sequenced)
Today's Stage 4 fires specialists in parallel with no enforced dependency order; B-block fixes that.

| Stage | File | Responsibility | Dep |
|---|---|---|---|
| B-0 | `B-0-branch.md` | New branch, env sync, dep install if approach added new deps | — |
| **B-1** | `B-1-schema.md` | **DB migrations + ORM model changes** — gates everything else | B-0 |
| **B-2** | `B-2-contracts.md` | **Shared types / Zod / OpenAPI / SDK contracts** — locks contract before B-3/B-4 diverge | B-1 |
| B-3 | `B-3-backend.md` | API routes, services, business logic (parallel across services) | B-1, B-2 |
| B-4 | `B-4-frontend.md` | UI components, state, integration (parallel across pages) | B-2, B-3 |
| **B-5** | `B-5-wiring.md` | **End-to-end type check, route registration, env wiring** — catches B-3↔B-4 drift | B-3, B-4 |
| B-6 | `B-6-verify.md` | Local typecheck + lint + unit tests + dev-server smoke | B-5 |
| B-7 | `B-7-review.md` | `/review` skill against the diff; same-branch fixes | B-6 |

**Why this matters:** The hard sequence B-1 → B-2 → B-3 → B-4 → B-5 prevents the current "frontend started before contracts locked" failure mode. Schema and contracts become explicit gates, not implicit assumptions.

### C — CI/CD (5 stages)
| Stage | File | Responsibility |
|---|---|---|
| C-1 | `C-1-pr.md` | PR creation, automated description, branch push |
| C-2 | `C-2-ci-watch.md` | Watch CI: lint, types, unit, contract, integration jobs (per-project config) — green required to merge |
| C-3 | `C-3-merge.md` | Merge to main (or auto-merge gate) |
| C-4 | `C-4-deploy.md` | Wait for prod deploy, curl health, verify deploy hash + uptime |
| C-5 | `C-5-canary.md` | `/canary` post-deploy watch — runs late in wave alongside V-block |

### T — Test (9 stages, layered)
Each test layer gets its own stage file with its own discipline. Skip conditions filter aggressively per wave type.

| Stage | File | Layer | When to fire |
|---|---|---|---|
| T-1 | `T-1-static.md` | Typecheck + lint | Every wave (verified via C-2 green) |
| T-2 | `T-2-unit.md` | Pure-function + module tests | Every wave with code changes (verified via C-2 green) |
| T-3 | `T-3-contract.md` | API/SDK contract tests | Waves touching APIs/SDKs (verified via C-2 green) |
| T-4 | `T-4-integration.md` | DB + service + API integration | Waves touching schema or services |
| T-5 | `T-5-e2e.md` | Playwright tester swarm (3-5 testers) | Every wave with user-visible behavior |
| T-6 | `T-6-layout.md` | Figma diff / visual regression | UI waves only |
| T-7 | `T-7-perf.md` | Core Web Vitals, bundle size, regression baselines | Heavy waves only |
| T-8 | `T-8-security.md` | Auth smoke, CSRF, session, rate-limit | Auth/payments/sessions waves only |
| T-9 | `T-9-journey.md` | `user-journey-map.md` regen + scenario smoke from `user-scenarios/` | Every wave |

T-1..T-4 stage files describe *what each layer covers + how to verify CI's report* — execution is delegated to CI config, but the discipline of each layer is documented + independently improvable. T-5..T-9 are active-execution stages run against deployed state.

**Why this matters:** Today, "testing" is one undifferentiated blob. Each test type has different patterns, different reviewer expectations, different failure modes. T-block makes each one a first-class citizen with its own retro target.

### V — Verify (4 stages)
| Stage | File | Responsibility |
|---|---|---|
| V-1 | `V-1-karen.md` | Karen — source-claim verification against deployed state |
| V-2 | `V-2-jenny.md` | Jenny — semantic-spec verification (deployed behavior ↔ `Planning/spec.md`) |
| V-3 | `V-3-triage.md` | Triage opportunistic findings from T-block + Karen + Jenny |
| V-4 | `V-4-fast-fix.md` | Same-wave fast-fix loop — if <20 LOC, hop to B-block, then re-run V-1/V-2 |

### L — Learn (4 stages)
| Stage | File | Responsibility |
|---|---|---|
| L-1 | `L-1-docs.md` | CHANGELOG, ROADMAP delta, journey-map regen, README touchups |
| L-2 | `L-2-status.md` | TaskMaster mark done, archive `Planning/<wave-N>/` |
| L-3 | `L-3-observations.md` | knowledge-synthesizer behavioral retro |
| L-4 | `L-4-distill.md` | karen promotes obs → `planning-principles.md` / `dev-principles.md` |

### N — Next (5 stages)
| Stage | File | Responsibility |
|---|---|---|
| N-1 | `N-1-survey.md` | Inspect TaskMaster `next`, `planned` milestones count, unassigned queue depth |
| N-2 | `N-2-triggers.md` | If `planned < 3` → propose roadmap-refresh; if `next == nothing` → daily-checkpoint |
| N-3 | `N-3-seed.md` | Seed the next wave's task |
| N-4 | `N-4-bundle.md` | Sibling-bundle decision (size rubric for combining) |
| N-5 | `N-5-handoff.md` | Return to P-0 of next wave |

---

## File structure

```
command-center/rules/build-iterations/
├── wave-loop.md                      ← top-level dispatcher (block sequence + cross-block hops)
├── blocks/
│   ├── product.md                    ← block dispatcher: P-stage sequence, skip rules, gate semantics
│   ├── design.md
│   ├── build.md
│   ├── ci.md
│   ├── test.md
│   ├── verify.md
│   ├── learn.md
│   └── next.md
└── stages/
    ├── product/   P-0..P-6.md
    ├── design/    D-1..D-5.md
    ├── build/     B-0..B-7.md
    ├── ci/        C-1..C-5.md
    ├── test/      T-1..T-9.md
    ├── verify/    V-1..V-4.md
    ├── learn/     L-1..L-4.md
    └── next/      N-1..N-5.md
```

Block dispatcher files (`blocks/*.md`) replace today's letter-suffix hack: instead of `stage-3b` being a sibling of `stage-3`, the design block is a peer-level entity with its own internal sequence.

---

## Cross-cutting consequences

1. **CLAUDE.md trigger table** — replace `Starting a new wave → wave-loop.md (then read each stage file)` with `Starting a new wave → wave-loop.md (then read the block dispatcher, then each stage file)`. Two-step dispatch.

2. **Always-on rule #1** rewrites: "Before EVERY stage, read both the block dispatcher (`blocks/<block>.md`) AND the stage file (`stages/<block>/<stage>.md`). Block dispatcher describes block-level skip rules, gate semantics, and stage sequence; stage file describes the single stage's actions."

3. **Skip conditions** become two-tier:
   - **Block-level skips** (skip whole D-block on backend-only, skip whole T-block items based on wave type) — defined in block dispatcher.
   - **Stage-level skips** (skip T-7 unless wave is "heavy", skip B-1 if no schema changes) — defined in stage file's prerequisite block.

4. **Sub-agent instructions remap.** `problem-framer` and `ceo-reviewer` belong to P-1; `karen` runs at P-6 and V-1; `jenny` runs at P-6 and V-2; specialists (backend-developer, frontend-developer, etc.) belong to specific B-stages. Update each `Sub-agent Instructions/*.md` file with `block: P, stages: [P-1]` front-matter so the sub-agent-workflow rule can validate spawn context.

5. **Retro targets multiply.** Today `/retro` writes to two files (`planning-principles.md`, `dev-principles.md`). With block decomposition, lessons can target tighter scopes:
   - `planning-principles.md` → P-block only
   - `decomposition-principles.md` → P-2 specifically
   - `spec-principles.md` → P-3 specifically
   - `build-principles.md` → B-block
   - `schema-principles.md`, `contract-principles.md` → B-1, B-2
   - `test-layer-principles/<T-N>.md` → per test layer

   This is a follow-on improvement; not required for the core rewrite.

6. **Stage 11's wave-centric reframe (just shipped in v0.35.0)** translates cleanly to N-block with no semantic change.

---

## Migration mapping (old → new)

| Old | New |
|---|---|
| 0 | P-0 |
| 0b | P-0 (sub-step: roadmap alignment) |
| 1 | P-1 + P-2 (split) |
| 2 | P-3 + P-4 + P-5 (split) |
| 3 | P-6 |
| 3b | D-1..D-5 (lifted) |
| 4 | B-0..B-6 (sequenced) |
| 4b | B-7 |
| 5 | C-1..C-4 |
| 5b | T-9 (journey/scenario smoke) |
| 6 | T-5 |
| 6b | T-6 |
| 7 | V-1 + V-2 |
| 7b | V-3 + V-4 |
| 8 | L-1 + L-2 |
| 9 | L-3 |
| 10 | L-4 |
| 11 | N-1..N-5 |

Net new explicit stages: **P-2 (decompose), P-3 (spec), P-4 (approach), B-1 (schema), B-2 (contracts), B-5 (wiring), T-1..T-4 (per-layer test discipline), T-7 (perf), T-8 (security), C-5 (canary)**.

---

## Suggested implementation phases

**Phase 1 — Refactor without behavior change.** Create `blocks/` + `stages/<block>/` directories; copy current stage files into new locations under new names; update `wave-loop.md` and CLAUDE.md trigger table. Same content, new layout. v0.40.0.

**Phase 2 — Decompose Product block.** Pull apart Stage 1 → P-1 + P-2. Pull apart Stage 2 → P-3 + P-4 + P-5. Author dedicated discipline files for decomposition and spec-authoring. v0.41.0.

**Phase 3 — Sequence Build block.** Add B-1 (schema), B-2 (contracts), B-5 (wiring) as explicit stages with hard dependencies. Update specialist routing in B-3/B-4 to read locked contracts. v0.42.0.

**Phase 4 — Layer Test block.** Split current 5b/6/6b into T-1..T-9 with per-layer discipline files and skip conditions. Decide whether each project pre-declares `wave_type: heavy | auth | ui | backend` to drive auto-skip, or whether classify-from-diff is reliable enough. v0.43.0.

**Phase 5 — Retro target expansion.** Make `/retro` route to block-scoped or stage-scoped principle files. v0.44.0.

Each phase ships with `auto-claude sync` migration notes so consumer projects can adopt incrementally; older flat-stage waves remain valid until the project syncs forward.

---

## Open questions

1. **Block-symbol convention** — single-letter (P/D/B/C/T/V/L/N) is compact and grep-friendly. Word-prefix (`product-`, `build-`, etc.) is more discoverable for new contributors. Pick one before Phase 1.
2. **Wave-type classification** — should every wave declare its type at P-2 to drive block/stage skips deterministically, or should each block dispatcher infer from diff? Deterministic declaration is simpler and matches the spirit of the size rubric.
3. **Pre-merge vs post-merge testing split** — proposal runs T-1..T-4 inside C-2 (pre-merge CI) and T-5..T-9 against prod (post-merge). Some teams may want T-5 against a preview env before merge. Worth a brief option in `blocks/test.md` to support both.
4. **B-block parallelization** — B-3 and B-4 are sequenced (B-2 → B-3 → B-4). Some waves with no contract changes could run B-3 || B-4. Worth a "fast-path" annotation or just rely on B-1/B-2 being no-ops.
