---
stage: _(set by v1)_
set_at: _(set by v1)_
set_by: v1
---

# Founder Stage

Single-variable modulator that biases onboarding away from legal / admin / compliance bloom for early-stage projects. Written once by v1, consumed by v3 / v4 / v6 / v10.

## Stage values

- **self-use-mvp** — founder is the first user (internal tool, own team, personal project). No external customers at launch.
- **pilot-customer** — one friendly design partner before GA. Paid or unpaid; not public.
- **paying-customers** — public beta or paid GA at launch. Real users paying for it.
- **regulated-day-1** — health / finance / minors / EU-regulated AI. Compliance is non-negotiable at launch.

## How this file is used

- **`stage-v3-product-scope.md` step 2** — compliance / audit / consent / admin-policy / cross-border-data features default `horizon: H2` for `self-use-mvp` and `pilot-customer`; default `H1` for `paying-customers` and `regulated-day-1`.
- **`stage-v4-page-map.md` step 1.5** — compliance + admin-policy pages cap at ~10% of MVP page count for `self-use-mvp` and `pilot-customer`; excess pages become stub-only PDs (short, one-screen). Full per-page fan-out for `paying-customers` and `regulated-day-1`.
- **`stage-v6-architecture.md` Security branch** — MVP mode for `self-use-mvp` and `pilot-customer` (auth + input validation + basic RBAC + secrets hygiene); full mode for `paying-customers` and `regulated-day-1` (adds threat model, residency, consent architecture, M2M least-privilege, audit-log schema).
- **`stage-v10-planning.md` step 1** — compliance-themed milestones default Horizon `H2` for `self-use-mvp` and `pilot-customer`; `H1` for `paying-customers` and `regulated-day-1`. Exception: a named regulatory deadline or named first-customer requirement can land the milestone in H1 regardless of stage (cite it in the milestone's `Why now:`).

## Override

Founder may change the stage value at any time by editing the frontmatter. Downstream stages re-read on each invocation. If changed mid-onboarding, re-evaluate horizons on affected milestones at the next `roadmap-refresh-ritual`.
