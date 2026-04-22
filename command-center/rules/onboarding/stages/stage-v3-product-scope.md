# Stage v3 — Product Scope: User Flows, Features, Tools/Modules Mapping

## Purpose
Decompose the product into its scope artifacts — the authoritative inventory of user flows, feature list, and tools/modules the product needs. These three artifacts converge in v4 (page map) and feed the architecture (v6) and design (v7-v9) phases.

## Prerequisites
- Stage v1 complete (Vision + initial bets known; `founder-stage.md` frontmatter populated)
- Stage v2 complete (competitor tier-ranked; known patterns)
- v0 docs + v2 screenshots available for reference
- READ `command-center/product/founder-stage.md` — `stage:` value governs horizon tagging in step 2

## Actions

### 1. User flows — per-persona narratives

Identify **personas** from v1 target-user extraction (e.g., buyer / seller / admin / visitor). For each persona, enumerate **end-to-end user flows** that capture the journeys the persona takes through the product. One flow = one goal the persona is trying to accomplish.

For each flow write:
- Flow name + persona
- Trigger / entry point (URL, button, event)
- Step-by-step narrative (5-15 steps)
- Success state (what the user sees when it works)
- Failure modes (what can go wrong)
- Cross-persona handoffs (e.g., buyer order → seller fulfillment)

Write to: `command-center/product/user-flows.md`

### 2. Feature catalog

Enumerate every feature the product must have at MVP + planned features for H2. For each feature:
- Name + one-line description
- Primary persona(s)
- Related user flow(s) from step 1
- Dependencies (auth, payments, storage, realtime, etc.)
- MVP / H2 / H3 classification
- Complexity estimate (S/M/L/XL)

### Horizon defaulting by founder stage

Read `command-center/product/founder-stage.md`. Features whose theme is **GDPR / consent UI / privacy-rights / audit log / admin-policy / cross-border-data / AI Act transparency / regulated-compliance** default as follows:

| Founder stage | Default horizon for compliance-themed features |
|---|---|
| `self-use-mvp` | H2 |
| `pilot-customer` | H2 |
| `paying-customers` | H1 |
| `regulated-day-1` | H1 |

Exception: a named regulatory deadline or named first-customer requirement overrides the default — tag H1 regardless of stage and cite the deadline inline. Non-compliance features use the normal MVP / H2 / H3 judgment.

Write to: `command-center/product/feature-list.md`

### 3. Tools / modules identification

From features + flows, extract the **reusable building blocks** the product will need. This is the FIRST pass; v6 architecture will deepen it. Categories:

- **External services**: payment providers, auth providers, email/SMS, storage (S3/R2), CDN, analytics, error tracking, monitoring
- **Internal modules**: authentication, user management, billing, notifications, search, file upload, admin panel, rate limiting, audit log, i18n
- **Shared primitives**: form components, data tables, modals, toasts, design tokens
- **Background work**: cron jobs, queues, webhook processors

For each tool/module: name + one-line purpose + which features consume it.

Write to: `command-center/product/tools-modules-map.md`

### 4. Cross-reference + consistency check

Run a self-audit:
- Every feature references ≥1 user flow (or is explicitly flagged as infrastructure)
- Every module/tool references ≥1 feature that uses it
- Every persona has ≥1 user flow
- No orphan flows (flows unreachable from current feature set)

Flag and resolve internal inconsistencies before closing the stage.

## Deliverable

- `command-center/product/user-flows.md` — persona × flow narratives
- `command-center/product/feature-list.md` — MVP + H2 + H3 feature catalog
- `command-center/product/tools-modules-map.md` — reusable building blocks inventory

## Exit criteria

- All three files populated with ≥1 entry per section
- Cross-reference audit (step 4) passes with zero unresolved inconsistencies
- Every MVP-classified feature has a user flow that covers its primary use case

## Next

→ Return to `../onboarding-loop.md` → Stage v4 (page-map)
