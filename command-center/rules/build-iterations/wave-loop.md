# Wave Loop — Stage Dispatcher

**This is the single source of truth for the build iteration process.** Before EVERY stage, read the corresponding stage file. Do not invent stages, skip stages, or reorder stages.

## Stage sequence

```
0 → 0b → 1 → 2 → 3 → 3b → 4 → 4b → 5 → 5b → 6 → 6b → 7 → 7b → 8 → 9 → 10 → 11
```

## Stage index

| Stage | File | Purpose |
|-------|------|---------|
| 0 | `stages/stage-0-prior-work.md` | Query prior work to avoid redundant effort |
| 0b | `stages/stage-0b-product-decisions.md` | Autonomous product decisions (conditional) |
| **1** | `stages/stage-1-problem-reframing.md` | **Symptom-vs-cause check + antipatterns red-team** |
| 2 | `stages/stage-2-plan.md` | Author the wave plan |
| 3 | `stages/stage-3-gate.md` | Karen + Jenny + Gemini (high-stakes) pre-implementation sanity check |
| 3b | `stages/stage-3b-design-gap.md` | Design-gap resolution — Dx loop (conditional, skip for non-UI waves) |
| 4 | `stages/stage-4-execute.md` | Implement the plan |
| 4b | `stages/stage-4b-review.md` | Post-build code review |
| 5 | `stages/stage-5-deploy.md` | PR + CI + deploy |
| 5b | `stages/stage-5b-qa.md` | Post-deploy QA |
| 6 | `stages/stage-6-test.md` | Playwright functional test swarm |
| 6b | `stages/stage-6b-layout.md` | Figma layout verification (conditional) |
| 7 | `stages/stage-7-reality-check.md` | Karen + Jenny post-test reality check |
| 7b | `stages/stage-7b-triage.md` | Triage opportunistic findings |
| 8 | `stages/stage-8-closeout.md` | Update docs + produce closeout |
| 9 | `stages/stage-9-observations.md` | Behavioral retrospective |
| 10 | `stages/stage-10-distillation.md` | Promote observations to instructions |
| 11 | `stages/stage-11-next.md` | Pick next wave (seed task + scope), return to Stage 0 |

## How to use this loop

1. Before entering Stage N: READ `stages/stage-N-<name>.md`
2. Execute exactly what the stage file says
3. When the stage's exit criteria are met, return here
4. Identify the next stage from the sequence above
5. READ the next stage file
6. Repeat until Stage 11

**Do NOT proceed to Stage N+1 without reading its file first.** The file contains the instructions. No file read = no instructions = do not proceed.

## Skip conditions

| Stage | May skip when |
|-------|--------------|
| 0b | Task has no `needsProductDecision` flag (skip silently) |
| 1 | Pure typo/copy fixes (<5 LOC), pure dependency bumps, pure doc changes |
| 3 Gemini check | UI-only / layout / copy waves (Karen + Jenny still required) |
| 3b | Backend-only / infra-only / doc-only / pure bug-fix waves with no UI surface AND no `design_gap_flag` from Stage 1 / 2 |
| 6b | Backend-only, infra-only, or doc-only waves (no frontend changes) |
| All others | NEVER — every other stage is mandatory for every wave |

## Cross-references (apply at every stage)

- **Before spawning ANY sub-agent**: READ `command-center/rules/sub-agent-workflow.md` + `command-center/Sub-agent Instructions/<agent>-instructions.md`
- **Stage 2 plan authoring**: READ `command-center/rules/planning-principles.md` (cross-wave plan-authoring lessons)
- **Stage 4 execution**: READ `command-center/rules/dev-principles.md` (cross-wave execution lessons + code conventions)
- **Observation files**: Stage 9/10 pipeline only — NEVER read during Stages 1-8
- **Auth/payments/sessions waves**: READ `command-center/rules/security-waves.md` — MANDATORY Gemini check at Stage 3
- **Any tester swarm**: READ `command-center/rules/testing-principles.md` + `command-center/test-writing-principles.md` §15-16
- **Any skill invocation**: READ `command-center/rules/skill-use.md`
- **Product/UX decisions**: READ `command-center/management/semi-assisted-mode.md` (3-tier autonomy) + `command-center/management/full-autonomy-mode.md` (BOARD routing under full-autonomy)

## Task management

**TaskMaster** is the canonical task tracking system. All features, bugs, and backlog items live in `.taskmaster/tasks/tasks.json`. Use `npx task-master` CLI or `/tm:` slash commands.

- **Stage 2**: `npx task-master next` to identify what to work on (after reframing at Stage 1)
- **Stage 4**: `npx task-master set-status --id=N --status=in-progress` when starting execution
- **Stage 8**: `npx task-master set-status --id=N --status=done` when shipping
- **Stage 11**: `npx task-master next` returns the seed task; Stage 11 decides the next wave's scope (seed alone vs seed + bundled siblings)

## Operational rules

- **Same-wave fast-fix**: When Stage 6 testers find small bugs (<20 LOC), fix in a follow-up PR before Stage 7. Karen+Jenny then review the fixed state.
- **Deploy-race detection**: Before Stage 6, verify Railway deploy is complete (curl health endpoint, wait if uptime < 120s).
- **Never deploy to Railway from local**: All deploys go through GitHub → CI → Railway. Only env var changes via Railway MCP are allowed.
