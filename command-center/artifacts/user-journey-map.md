---
name: User Journey Map
description: Canonical inventory of every user flow, screen, route, API endpoint. Regenerated daily from production state.
last_updated: _(set on first regen)_
version: 0.1
status_legend:
  - "✅ Live: page renders correctly with real content in production"
  - "🟡 Live but degraded: renders but missing data, broken interaction, or minor known issue"
  - "🟠 Coded but blocked: route exists in code but redirects/crashes/blank in production"
  - "❌ Not built: documented in flow but no matching route in code"
  - "🚫 Deferred: explicitly out of scope"
  - "🆕 Design-only: designed but no code route yet"
---

# User Journey Map — <Your Project>

This document maps every user flow in the application, derived from:
- **Frontend routes** — Next.js / similar App Router under `packages/web/` (or equivalent)
- **Backend endpoints** — REST + WebSocket gateways
- **Design mockups** — `design/*.html`
- **Production crawl** — triangulated against live via persona-partitioned Playwright swarm

Each flow includes: screens, API endpoints, WebSocket events (where applicable), and user stories.

---

## Flow Map Overview

_(populate via first prod crawl)_

---

## Personas

_(populate — e.g., visitor / buyer / seller / admin / superadmin)_

---

## 1. <Flow Name>

_(populate per flow)_

---

## Regeneration cadence

Rebuild this file daily from current production state cross-referenced with `design/` mockups. See `command-center/rules/testing-principles.md` + `command-center/rules/build-iterations/stages/stage-8-closeout.md` for per-wave update obligations.
