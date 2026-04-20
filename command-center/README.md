# command-center/

Operational rules, long-term memory, and persistent artifacts. Loaded on-demand via CLAUDE.md trigger table.

## Subfolders

- **`rules/`** — Topic-scoped orchestration rules. Each file is read on-trigger per CLAUDE.md (e.g., `rules/build-iterations/wave-loop.md` before starting a wave, `rules/sub-agent-workflow.md` before spawning an agent).
  - **`rules/build-iterations/`** — The wave loop dispatcher + individual stage files. Read `wave-loop.md` at wave start, then read each `stages/stage-N-*.md` before entering that stage.
- **`Sub-agent Instructions/`** — Per-agent second-person directives. Inject into the FIRST position of every sub-agent spawn prompt.
- **`Sub-agent Observations/`** — Stage 8/9 pipeline artifact. Written at Stage 8 (knowledge-synthesizer + technical-writer) as the wave's behavioral retrospective, read only at Stage 9 (karen converter + technical-writer compactor) to promote load-bearing patterns into instructions. **NOT read during Stages 1-7. Never injected into any spawn prompt.** After Stage 9, entries are inert until the next wave's Stage 8.
- **`artifacts/`** — Persistent reference material that survives across waves: `Concept/` research docs, `competitive-benchmarks/` (output of competitive-analyst). The canonical design system lives in the repo-root `design/` folder (DESIGN-SYSTEM.md + *.html mockups + brief-template + review-gate).
- **`test-writing-principles.md`** — master testing guide (§0-13 code-level testing, §14 auto-updated rules log, §15-16 live production E2E with Playwright + WebSocket instrumentation). Mandatory reading for any agent doing test work.

## Canonical docs that live at repo root

- **`command-center/artifacts/user-journey-map.md`** — canonical inventory of every user flow, screen, route, API endpoint, and WebSocket event.
- **`CLAUDE.md`** — trigger table + always-on rules.

## What does NOT live here

Wave-scoped deliverables (plans, test reports, closeouts, morning recaps) live in `Planning/` at the repo root. `Planning/` is the hot working directory; `command-center/` is the persistent brain.
