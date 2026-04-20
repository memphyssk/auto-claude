# Dx.3 — Review Gate (dual-reviewer protocol)

Two reviewers run in parallel on every staging design. Fresh context per reviewer (no shared state). Both must APPROVE before Dx.4 canonicalizes.

---

## Reviewer roster

### Reviewer A — `/plan-design-review`

**Role:** design critique with 0-10 per-dimension scoring + what would make each a 10.

**Input:** staging HTML + brief + DESIGN-SYSTEM.md as reference.

**Output:** `Planning/wave-<N>-design-gap/<feature>-plan-design-review.md` containing:
- Per-dimension scores (visual hierarchy, spacing rhythm, brand coherence, edge-case handling, accessibility, responsive behavior)
- For each dimension < 8: what concrete change would move it to 10
- Overall verdict: APPROVE / REVISE / REJECT
- If REVISE/REJECT: enumerated change requests each citing the brief §X or DESIGN-SYSTEM.md §Y

### Reviewer B — `/ui-ux-pro-max`

**Role:** requirement + UX best-practice check against the brief's success criteria.

**Input:** staging HTML + brief + DESIGN-SYSTEM.md + Phosphor SDK doc (`SDK-Docs/Phosphor/phosphor-sdk.md`).

**Output:** `Planning/wave-<N>-design-gap/<feature>-ui-ux-pro-max.md` containing:
- Checkbox audit of brief §9 success criteria (each: PASS / FAIL / PARTIAL)
- UX flow audit: does the design enable the user to accomplish the stated goal? Enumerate friction points.
- DESIGN-SYSTEM.md token audit: list every color / font-size / shadow / border-radius actually used and confirm each matches a system token (flag invented values)
- Phosphor icon audit: every icon reference is a real component name
- Overall verdict: APPROVE / REVISE / REJECT
- If REVISE/REJECT: prioritized change list

---

## Reviewer substitution

`/ckm:design` was requested but does not exist on this machine. Substituted with `/plan-design-review`.

If `/ckm:design` becomes installed:
1. Replace reviewer A or B (by design charter, probably B) with `/ckm:design`.
2. Document reviewer roster here with a dated edit.
3. No other file changes required — Dx-loop is reviewer-agnostic.

---

## Spawning both reviewers in parallel

Both agents launch in the same orchestrator message to run concurrently:

```
Spawn message batch:
  - Agent(description="Dx.3 reviewer A — design critique", subagent_type="<appropriate>", prompt=<A brief>)
  - Agent(description="Dx.3 reviewer B — ux/req match", subagent_type="<appropriate>", prompt=<B brief>)
```

Both reviewers receive:
1. Required reading: their instruction file (if exists) + the brief + staging HTML path
2. The DESIGN-SYSTEM.md path
3. Explicit output file path
4. Verdict format (APPROVE / REVISE / REJECT + concrete concerns)

Both MUST NOT see each other's output. Orchestrator reconciles at Dx.4.

---

## Reconciliation matrix (Dx.4)

| Reviewer A | Reviewer B | Action |
|---|---|---|
| APPROVE | APPROVE | → Dx.5 canonicalize |
| APPROVE | REVISE | Treat as REVISE; aggregate B's concerns → Dx.2 refine |
| REVISE | APPROVE | Treat as REVISE; aggregate A's concerns → Dx.2 refine |
| REVISE | REVISE | Aggregate both concern sets → Dx.2 refine |
| APPROVE | REJECT | Reject wins; aggregate B's concerns → Dx.2 refine or escalate |
| REJECT | APPROVE | Reject wins; aggregate A's concerns → Dx.2 refine or escalate |
| REJECT | REJECT | Aggregate both rejections → Dx.2 refine with major pivot, OR escalate |

Iteration cap: **3**. If Dx.2→Dx.3 runs 3 times without both APPROVE, escalate to user per `stage-3b-design-gap.md` Step 7 (3-cap escalation branch).

---

## Feedback aggregation for refine_design

When looping back to Dx.2, build a single consolidated prompt for `/aidesigner refine_design`:

```
Previous iteration: <path to staging/<feature>.html>
Reviewer A concerns (plan-design-review):
  - [concrete change request, cited to brief §X]
  - [concrete change request, cited to DESIGN-SYSTEM.md §Y]
Reviewer B concerns (ui-ux-pro-max):
  - [concrete change request]
  - [concrete change request]

Preserve: [elements both reviewers approved]
Change: [concrete deltas]
```

Avoid "just make it better" — each refine instruction must be actionable and measurable.

---

## Anti-patterns (per Wave g29 lessons)

- **Do NOT** invoke reviewers on a pristine staging HTML that lacks the brief's §4 token references. The reviewers will reject. Brief quality is a Dx.1 problem; don't push it to Dx.3.
- **Do NOT** let reviewers talk to each other. Independence = signal. If one reviewer's verdict is contingent on the other's, the output is contaminated.
- **Do NOT** count REVISE as "same as APPROVE but with notes" — REVISE means loop back. Only both APPROVE exits the loop.
- **Do NOT** skip the DESIGN-SYSTEM.md token audit (Reviewer B's §3). Invented hex values or one-off spacings are the #1 drift vector.
