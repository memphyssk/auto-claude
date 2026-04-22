# Onboarding Loop — Pre-Launch Stage Dispatcher

**This runs ONCE at project seeding.** Before there are any waves, before `wave-loop.md` starts, this loop produces the baseline artifacts every wave-loop execution assumes exists: vision, competitors, scope, stack decision, architecture, design system, page designs, milestones, TaskMaster structure. After v11 handoff, control passes to `build-iterations/wave-loop.md` Stage 0 and every wave from then on uses the wave loop, not this one.

Before EVERY stage, read the corresponding stage file. Do not invent stages, skip stages, or reorder stages.

## Stage sequence

```
v0 → v1 → v2 → v3 → v4 → v5 → v6 → v6b → v7 → v8 → v9 → v10 → v11
```

## Stage index

| Stage | File | Purpose |
|-------|------|---------|
| v0 | `stages/stage-v0-input.md` | Receive product/service description documents |
| **v1** | `stages/stage-v1-vision-and-gaps.md` | **Parse docs → poll user only for missing vision/bets → seed FOUNDER-BETS.md + ROADMAP.md north star** |
| v2 | `stages/stage-v2-competitive-scan.md` | 360° competitive scan (5-10 targets, agent-ranked Tier 1/2/3) |
| v3 | `stages/stage-v3-product-scope.md` | User flows + features description + tools/modules mapping |
| v4 | `stages/stage-v4-page-map.md` | Page map + per-page PDs (parallel agent spawn) |
| v5 | `stages/stage-v5-stack-selection.md` | Tech stack — Eldorado baseline default; AskUserQuestion override |
| v6 | `stages/stage-v6-architecture.md` | 8 parallel branches: Modules / Services / DB / SDK / Tools / Security / DevOps / Test |
| v6b | `stages/stage-v6b-architecture-integrate.md` | Cross-check + integrate into single library doc |
| v7 | `stages/stage-v7-design-direction.md` | `/aidesigner` one-page proposal + user approval loop |
| v8 | `stages/stage-v8-design-system.md` | DESIGN-SYSTEM.md build (gated on v6b complete) |
| v9 | `stages/stage-v9-page-designs.md` | Per-page design generation loop (approval per page) |
| v10 | `stages/stage-v10-planning.md` | Milestones + TaskMaster population + seed ROADMAP.md + product-decisions.md |
| v11 | `stages/stage-v11-handoff.md` | git init + CI + initial commit + handoff to wave-loop Stage 0 |

## How to use this loop

1. Before entering stage vN: READ `stages/stage-vN-<name>.md`
2. Execute exactly what the stage file says
3. When the stage's exit criteria are met, return here
4. Identify the next stage from the sequence above
5. READ the next stage file
6. Repeat until v11

**Do NOT proceed to stage vN+1 without reading its file first.** The file contains the instructions. No file read = no instructions = do not proceed.

## Skip conditions

| Stage | May skip when |
|-------|--------------|
| v1 poll step | Docs from v0 already contain complete vision + initial founder bets + target market — stage still seeds scaffolds from extracted content, just skips the AskUserQuestion step |
| v5 research step | User accepts the baseline stack (Eldorado default) — stage becomes a single confirmation AskUserQuestion |
| v7 / v8 / v9 | Backend-only / API-only / CLI projects with no UI surface — design stages skip entirely; proceed v6b → v10 |
| All others | NEVER — every other stage is mandatory for project seeding |

## Cross-references (apply at every stage)

- **Before spawning ANY sub-agent**: READ `command-center/rules/sub-agent-workflow.md` + `command-center/Sub-agent Instructions/<agent>-instructions.md`
- **Any product/UX decision during onboarding**: READ `command-center/management/semi-assisted-mode.md` (§1 3-tier classification; Tier 3 items poll user via AskUserQuestion regardless of mode — BOARD is OFF during onboarding per `command-center/management/full-autonomy-mode.md` § Onboarding carve-out)
- **Competitive methodology**: `command-center/management/semi-assisted-mode.md` § Competitive intelligence pre-decision benchmark (reused from wave-loop; Playwright-live-browsing mandate applies)
- **Design gaps during v7/v8/v9**: `design/brief-template.md` + `design/review-gate.md` (Stage 3b templates; reused)
- **Test / DevOps / Security defaults**: `command-center/rules/dev-principles.md` § Code conventions (baseline stack assumptions)

## Deliverables of the onboarding loop (cumulative)

By the time v11 commits, the following artifacts must exist and be committed:

| Path | Source stage | Content |
|---|---|---|
| `command-center/product/FOUNDER-BETS.md` | v1 | Vision + 1-3 initial founder bets |
| `command-center/product/founder-stage.md` | v1 | Founder-stage flag (`self-use-mvp` / `pilot-customer` / `paying-customers` / `regulated-day-1`) — consumed by v3 / v4 / v6 / v10 |
| `command-center/product/ROADMAP.md` | v1 seed + v10 populate | North star + H1/H2/H3 intents (v1); initial milestones (v10) |
| `command-center/product/product-decisions.md` | v10 | 10-20 initial decisions from v5 stack + v6 arch branches |
| `command-center/artifacts/competitive-benchmarks/` | v2 | Per-competitor files + tier-ranked INDEX.md |
| `command-center/product/per-page-pd/<page>.md` | v4 | Per-page product descriptions (one file per page) |
| `command-center/artifacts/user-journey-map.md` | v4 | Page map + flow inventory |
| `command-center/dev/architecture/` | v6 / v6b | 8-branch architecture docs + integrated library doc |
| `design/DESIGN-SYSTEM.md` | v8 | Populated token set aligned to approved direction |
| `design/<page>.html` | v9 | Per-page approved mockups |
| `.taskmaster/tasks/tasks.json` | v10 | Populated milestone + stage task tree |
| Initial git commit | v11 | All scaffold + generated files committed |

## Operational rules

- **No waves during onboarding.** The wave loop's Stage 0 presumes seeded state. Do not invoke `wave-loop.md` until v11 hands off.
- **Commit per logical block, not per stage.** v11 is responsible for the final initial commit; intermediate stages accumulate files in the working tree. If an intermediate stage wants to snapshot progress (long onboarding runs), commit with message `chore(onboarding): vN complete`.
- **Polling discipline.** v1 and v5 may poll via AskUserQuestion. v7/v8/v9 poll at design-approval checkpoints. Other stages should be fully autonomous — if a stage wants to poll for something unexpected, escalate via Tier 3 autonomous-mode pattern.
- **Race-condition gate (v2 architecture).** v8 Design System consumes the module list from v6b; v8 MUST NOT start until v6b is complete. The dispatcher enforces this via the stage sequence — do not parallelize v6b and v8 even if tempting.
- **No wave-loop stages ever mix with onboarding stages.** If a wave-loop stage file is read during onboarding, something is wrong — escalate.

## Next

After v11 completes and the initial commit lands on `main`:
→ **Switch to** `command-center/rules/build-iterations/wave-loop.md` → **Stage 0** for the first wave.
