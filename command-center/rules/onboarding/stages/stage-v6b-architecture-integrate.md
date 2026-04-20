# Stage v6b — Architecture Integrate: Cross-Check + Unified Library Doc

## Purpose
Resolve conflicts between the 8 architecture branches, integrate into a single unified library doc, and publish the module list that v8 design-system consumes. This is the gate that unblocks parallel Design progression.

## Prerequisites
- v6 complete (all 8 branch files written + module-list.md snapshot)
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/rules/security-waves.md` (if security branch flagged architectural risks, architect-reviewer + security-engineer pair applies)

## Actions

### 1. Cross-branch conflict scan

Spawn `architect-reviewer` (fresh context) to scan all 8 branch files for conflicts. Common conflict classes:

- **Module boundary disputes** — feature X described as module in branch A, as service boundary in branch B
- **Data ownership** — two branches claim the same entity
- **Auth flow contradictions** — security branch says X, services branch assumes Y
- **SDK overlap** — multiple SDKs solving the same problem
- **Test strategy mismatches** — test branch assumes a framework the tools branch didn't list
- **DevOps / Security contradictions** — DevOps pipeline doesn't enforce security branch requirements (e.g., secret scanning, permissions)

Agent returns: numbered list of conflicts + suggested resolutions.

### 2. Resolve conflicts

For each conflict:
- **Unambiguous** (one branch is clearly correct) → orchestrator picks the winner + updates the loser branch
- **Material trade-off** (both sides have merit) → poll founder via AskUserQuestion with the agent's recommendation

After resolution: re-run step 1. If any conflicts remain, loop until zero.

Iteration cap: 3. If 3 rounds don't resolve, escalate to founder with all open conflicts + force decisions.

### 3. Spawn `technical-writer` to produce unified library doc

Spawn `technical-writer` to integrate the 8 resolved branch files into a single `command-center/dev/architecture/_library.md`.

Library doc structure:

```markdown
# Architecture Library — <Your Project>

## How to use this doc
- Each section is authoritative for its domain; branch files are the expanded detail
- Read this at the start of any wave that touches multiple domains
- Branch files are read when planning within a single domain

## Table of contents
1. [Stack](#stack) — the locked stack (mirror of stack-decisions.md)
2. [Modules / Reusable elements](#modules) — see `architecture/modules.md` for depth
3. [Services](#services)
4. [Databases](#databases)
5. [SDKs](#sdks)
6. [Tools](#tools)
7. [Security](#security)
8. [DevOps](#devops)
9. [Test](#test)
10. [Cross-domain interactions](#cross-domain)
11. [Open items and risks](#risks)

---

## Stack
<mirror from stack-decisions.md>

## Modules / Reusable elements
<summary from modules.md>

...

## Cross-domain interactions
<Key interactions that span branches — where modules call services, services call SDKs, etc. This section WRITES the integration glue>

## Open items and risks
<Consolidated from all branches' Risk sections>
```

### 4. Update `module-list.md`

Post-integration, update `command-center/dev/module-list.md` to reflect final module boundaries (some may have shifted during conflict resolution). This is the gate output for v8.

Tag the file with `status: locked` + timestamp so v8 knows the input is ready.

### 5. Cross-branch cascade from v5 overrides (if applicable)

If v5 recorded partial or full override of the baseline stack, propagate any cascading updates at this stage:

- Update `dev-principles.md` § Code conventions to reflect the actual stack (agent edits targeted sections)
- Update `test-writing-principles.md` if the test stack differs
- Update `security-waves.md` if auth provider differs
- Log the cascading updates as decisions in `product-decisions.md`

### 6. Commit snapshot (optional)

```bash
git add command-center/dev/architecture/ command-center/dev/module-list.md
git commit -m "chore(onboarding): v6/v6b architecture complete"
```

Long onboarding runs benefit from this checkpoint.

## Deliverable

- `command-center/dev/architecture/_library.md` — unified reference
- `command-center/dev/module-list.md` — locked, status=locked
- Resolved architecture branch files (any conflict-driven updates)
- (If v5 overrode) cascaded updates to `dev-principles.md` / `test-writing-principles.md` / `security-waves.md`

## Exit criteria

- Zero unresolved cross-branch conflicts
- `_library.md` is navigable and complete (all sections populated)
- `module-list.md` has `status: locked` (v8 can consume safely)
- All open items from branch Risk sections are captured in `_library.md` Risks section

## Next

→ Return to `../onboarding-loop.md` → Stage v7 (design-direction)
