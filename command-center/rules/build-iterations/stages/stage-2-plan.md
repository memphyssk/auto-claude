# Stage 2 — Plan

## Purpose
Author the wave plan: what we're building, who does what, how we'll verify it.

## Prerequisites
- Stage 0 complete (prior work checked)
- Stage 1 complete (problem reframed — `Planning/wave-<N>-reframing.md` exists)
- READ `command-center/rules/planning-principles.md` for cross-wave plan-authoring lessons
- READ the Stage 1 reframing output — plan MUST reference its verdict (PROCEED/RESCOPE/ESCALATE) and the chosen solution class
- **If the task touches any external SDK or third-party tool:** READ `command-center/rules/external-sdks.md` and follow the pre-build checklist BEFORE writing the plan. Verify installed versions, actual method signatures, and env var contracts. Do NOT plan against assumed API surfaces.
- **If the wave touches auth / payments / user creation / cookies / CSRF / rate limits / sessions:** READ `command-center/rules/security-waves.md` — 2-iteration gate discipline + architect-reviewer + security-engineer pair pattern applies at Stage 3.
- **If the plan will invoke plan-review skills** (`/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan`): READ `command-center/rules/skill-use.md` for when-to-fire matrix.

## Design-gap flag

During plan authoring, grep `design/` for every page/component/icon the plan references. If any target lacks a mockup, set `design_gap_flag: true` in the plan with the missing-surface list. Do NOT enter a design loop here — the consolidated resolution happens at **Stage 3b** after the Stage 3 gate.

Format inside `Planning/wave-<N>-plan.md`:
```markdown
## Design gaps
design_gap_flag: true
missing_surfaces:
  - <route-or-component>: <one-line purpose + prior art in design/>
  - ...
```

If no gaps: `design_gap_flag: false`. The plan can still reference `design/*.html` mockups that already exist — only *missing* surfaces count as gaps.

Autonomous-mode handling is **session-level** (file at `Planning/.autonomous-session`), not per-wave. Do NOT declare `autonomous_mode` in the wave plan front-matter — the session flag governs all waves in the session. See `command-center/management/mode-switching.md` for flag semantics + `command-center/management/full-autonomy-mode.md` for BOARD routing under full-autonomy.

## Actions

### Backlog check
Run `npx task-master list` to see current backlog. If fewer than 3 pending tasks, STOP and run `command-center/rules/backlog-planning.md` ritual before planning. Use `npx task-master next` to identify the highest-priority task to work on.

### SDK doc auto-linking
When writing or describing a task in TaskMaster, scan the task description for external SDK or tool names. Check `SDK-Docs/` for an existing reference file. If found, add `SDK Reference: SDK-Docs/<Name>/<name>.md` to the task details. This ensures implementers at Stage 4 have the research at hand without rediscovering known gotchas.

### Write the plan
**Default path (~90% of waves):** Author from direct codebase audit. For non-trivial features, spawn `Explore` first to inventory existing support.

**Exception path (greenfield):** Chain `Explore` → `product-manager` → orchestrator finalize. Never run `product-manager` without prior Explore grounding.

### Plan content
- Targets: what each fix/feature is, with file paths
- Sub-agents: by name, what each handles, why
- Tester swarm size
- Skills to invoke and when
- **Stage completion checklist** (mandatory — copy the template below into every plan)

### Stage completion checklist template
Every wave plan MUST include this checklist. Mark each stage as it completes. Stage 11 CANNOT fire until all prior stages are checked off.

```markdown
## Stage completion checklist
- [ ] Stage 0 — Prior work query
- [ ] Stage 0b — Product decisions (if applicable)
- [ ] Stage 1 — Problem reframing
- [ ] Stage 2 — Plan written
- [ ] Stage 3 — Karen + Jenny gate (+ Gemini if high-stakes)
- [ ] Stage 4 — Execute
- [ ] Stage 4b — Review (biome, typecheck, test, build)
- [ ] Stage 5 — Deploy (PR merged, CI green)
- [ ] Stage 5b — Post-deploy QA
- [ ] Stage 6 — Playwright test swarm
- [ ] Stage 6b — Layout verification (skip if no frontend changes)
- [ ] Stage 7 — Reality check (Karen + Jenny)
- [ ] Stage 7b — Triage opportunistic findings
- [ ] Stage 8 — Closeout + docs
- [ ] Stage 9 — Observations retro
- [ ] Stage 10 — Instruction distillation
- [ ] Stage 11 — Pick next task
```

### Post-write consistency check (mandatory after any plan revision)
After writing or revising the plan, run a self-consistency sweep before proceeding to Stage 3:
1. For each **task-message scope bullet**, confirm the plan body (targets table, stage execution order, non-goals) contains a matching treatment. Any bullet with no plan-body counterpart, or with contradicting language, must be reconciled.
2. Check for version-boundary leakage: prior-draft sections that restrict scope (e.g., "no route edits this wave") must be removed or updated when the revision expands scope.
3. If the plan defers a spec-mandated item to a future wave, add an inline annotation at that spec item's location naming the deferral wave — do not rely on the wave plan alone to carry the rationale.

This sweep takes <5 minutes and prevents internal contradictions from reaching Stage 3 reviewers, which costs a full review cycle to unwind.

### Plan review (conditional, pre-Stage-3)
Based on wave scope, invoke:
- Any non-trivial wave: `/plan-eng-review`
- UI-heavy wave: `/plan-design-review`
- API/CLI/SDK wave: `/plan-devex-review`
- Complex multi-dimension: `/autoplan`

These fire BEFORE Karen+Jenny. They catch architectural and UX problems that the gate agents don't.

## Deliverable
`Planning/wave-<N>-plan.md`

## Exit criteria
- Plan file written with targets, agents, verification approach
- Plan review skill invoked if scope warrants

## Next
→ Return to `../wave-loop.md` → Stage 3

## Plan-contradiction sweep

On any plan revision (v2, v3...), grep the plan file for internal contradictions across task-message, §Targets, §Non-goals, and stage completion checklist. Specifically flag any wave that mixes "ships this wave" and "deferred to g<N+1>" semantics for the SAME deliverable. Such contradictions invalidate downstream Stage 4 execution because implementer agents cannot determine scope.
