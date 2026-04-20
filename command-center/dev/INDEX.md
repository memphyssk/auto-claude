# `command-center/dev/` — Dev-Time Artifacts

Persistent development-time references produced during the **onboarding loop** and (where applicable) updated by waves thereafter.

This folder is NOT project-runtime code — that lives in `packages/` (or equivalent). Nor is it orchestration rules — that's `command-center/rules/`. Nor is it product spec — that's `command-center/product/`. This folder is the **developer's reference manual for how the system is built**: architecture decisions, module inventories, stack-level specs.

## Contents (populated by onboarding stages + refined over time)

| Path | Source stage | Content |
|---|---|---|
| `architecture/` | v6, v6b | 8-branch architecture docs (Modules / Services / DB / SDK / Tools / Security / DevOps / Test) + integrated library doc |
| `architecture/_library.md` | v6b | The "one general library doc" — unified architecture reference, cross-linked to branch files |
| `stack-decisions.md` | v5 | Tech stack decision record (default accepted OR overrides with rationale) |
| `module-list.md` | v6 early output | Snapshot of approved reusable modules. Consumed by v8 design-system (gate input). |

## Read by

- v8 design-system (reads `module-list.md` + `architecture/_library.md`)
- Stage 2 plan-authoring (reads relevant architecture branch when planning features in that domain)
- Stage 4 executing implementers (reads when making architectural choices)
- Stage 3 Karen/Jenny gate (reads when verifying plan claims about module reuse)

## Maintenance

- Architecture changes post-launch: raise via refresh ritual or explicit founder decision; update the relevant branch file + re-run cross-check against other branches + update `_library.md`.
- Module list changes: update at Stage 4 as new modules are introduced; gate-check at Stage 3 that new modules don't conflict with existing.

## Not in this folder

- Runtime code → `packages/<api|web|shared>/`
- Orchestration rules → `command-center/rules/`
- Product spec → `command-center/product/`
- Design mockups → `design/`
- Wave-scoped working files → `Planning/`
