# Stage v4 — Page Map + Per-Page PDs (Parallelized)

## Purpose
Produce the canonical page map of the product (every web page / route / screen) and one detailed product-description file per page. These files feed the design phase (v7-v9) as implementation specs and feed v10 planning as task-coverage baseline.

## Prerequisites
- Stage v3 complete (user flows + features + tools-modules-map exist)
- READ `command-center/rules/sub-agent-workflow.md` (for parallel spawns in step 3)

## Actions

### 1. Enumerate pages

From v3 flows + features, identify every page/screen the product needs. Categories:

- **Marketing / public pages**: home, about, pricing, contact, terms, privacy, blog
- **Auth pages**: signup, login, forgot-password, reset-password, email-verify
- **Core product pages**: dashboards, listing/catalog, detail views, checkout/purchase flows, settings
- **Admin pages**: admin dashboard, user management, content moderation, audit logs
- **Support / policy pages**: help center, FAQ, contact support, dispute resolution

Each page gets: page name + route + primary persona(s) + related flow(s) from v3.

### 2. Write page map

Write consolidated page map to: `command-center/artifacts/user-journey-map.md`

Format:

```markdown
# User Journey Map — <Your Project>

## Page inventory

| Page | Route | Persona(s) | Related flows | Tools/modules used |
|---|---|---|---|---|
| Home | `/` | visitor | browse, signup-entry | header-nav, hero, feature-cards |
| ... |

## Flows cross-reference

### <Flow name> (<persona>)
- Entry: <page>
- Steps: <page> → <page> → <page>
- Exit: <page>
- Related features: <feature-list ref>
```

Consolidates v3 flows + page inventory into one navigable doc. This is the file the wave loop's Stage 6 Playwright swarm will consume for every tester prompt.

### 3. Parallel per-page PD generation

For each page in the inventory, spawn an agent IN PARALLEL to generate the extensive product description. Agent = `product-manager` (existing Sub-agent Instruction). Batch size: up to 5 agents in parallel to avoid context saturation.

Each per-page agent receives:
- The page name + route + personas + related flows (from step 2)
- Relevant feature entries from `feature-list.md`
- Relevant module references from `tools-modules-map.md`
- Tier 1 competitor equivalent-page screenshots from `competitive-benchmarks/` (if available)

Each agent produces: `command-center/product/per-page-pd/<page-kebab-name>.md`

Per-page PD contents:
- **Purpose** — one paragraph, why this page exists
- **Audience** — primary + secondary personas + auth state (anon / authed / role-gated)
- **Entry points** — where users arrive from
- **Content sections** — top-to-bottom page anatomy (header / hero / content sections / CTAs / footer)
- **Interactions** — clickable elements + their destinations / side-effects
- **Data requirements** — what API endpoints feed this page (placeholder names for now; v6b reconciles with architecture)
- **Empty / error / loading states** — each explicitly designed
- **Responsive breakpoints** — mobile / tablet / desktop considerations
- **Success metrics** — what "this page works" looks like (for testing)
- **Competitor comparison** — how Tier 1 competitors handle the equivalent page; what we do same / different

### 4. Consolidate + cross-check

After all per-page PD files exist:
- Verify every page from step 1 has a corresponding PD file
- Scan for duplicated content across PDs — if multiple pages describe the same module, consolidate references to `tools-modules-map.md`
- Update `user-journey-map.md` with a "Per-page PDs" section linking to each file

## Deliverable

- `command-center/artifacts/user-journey-map.md` — page map + flows cross-reference + PD file links
- `command-center/product/per-page-pd/<page-name>.md` × N — one file per page, fully detailed

## Exit criteria

- Every enumerated page has a per-page PD file
- `user-journey-map.md` is complete and navigable (links resolve)
- No feature from v3 feature-list is "orphaned" (not consumed by any page)
- No page is "unreachable" (not connected to any flow)

## Next

→ Return to `../onboarding-loop.md` → Stage v5 (stack-selection)
