# Simulation task — sim-001

## Title
Split brain and project parts apart; ship the brain as an NPX package

## Source
Founder idea (2026-04-24). Not from TaskMaster backlog — synthetic for simulation purposes.

## One-paragraph description
Today, auto-claude's brain (`command-center/`, `CLAUDE.md`, `design/`) is copy-pasted into every consumer project via `auto-claude init` + synced via `auto-claude sync`. Consumer repos carry hundreds of brain files they don't author. The proposal: package the brain as an installable NPX command (e.g. `npx @auto-claude/brain@0.12.0`) that exposes the brain tree as a read-only overlay — consumer projects keep only their overlays (product/, artifacts/, dev-principles.md customizations), and reference the brain via a pinned package version. Symlink or virtual-fs based, TBD.

## Assumed initial scope
- Publish an npm package containing `command-center/`, `CLAUDE.md`, `design/` content at specific version tags
- A new `auto-claude init` and `auto-claude sync` path that creates symlinks (or materializes a resolved tree) into the consumer project from `node_modules/@auto-claude/brain/`
- Overlay semantics unchanged — `.brainignore` still governs what's local vs imported
- Migration path for existing consumer projects (kvik, eldorado) from copy-paste brain → package-resolved brain

## Why this task is a good simulation target
- Non-trivial cross-cutting change (touches install.md, bin/, the sync tool, every consumer's directory layout)
- Design-gap irrelevant (pure backend/CLI — Stage 3b skips)
- No Playwright needed (Stage 6 skips)
- Realistic scope for a single wave
- Forces real Stage 0b product decisions (npm vs ghcr vs git submodule — a Tier 3 product decision)

## Scope constraints (imposed for simulation realism)
- Single-wave effort — if size rubric trips (>30 files, >5000 LOC, >250K context), Stage 1 issues RESCOPE-AUTO-SPLIT; we proceed with the first slice
- Breaking change OK (consumer projects will require migration; migration doc is part of scope)
- Must remain compatible with auto-claude's existing v0.1.0 → v0.12.0 version tags (i.e., pin-resolution semantics survive)
