# Stage 3 — Sanity Check (Karen + Jenny + Gemini)

## Purpose
Pre-implementation gate with three adversarial reviewers in parallel:
- **Karen** — catches hallucinated claims + strategic correctness
- **Jenny** — catches spec drift
- **Gemini (cross-model)** — devil's advocate from a different model family; catches biases the primary model silently accepted

All required reviewers must APPROVE before any code is written.

## Prerequisites
- Stage 2 plan file exists
- Stage 1 reframing file exists (Karen will cross-reference)
- READ `command-center/rules/sub-agent-workflow.md`
- READ `command-center/Sub-agent Instructions/karen-instructions.md`
- READ `command-center/Sub-agent Instructions/Jenny-instructions.md`
- **If the wave touches auth / payments / user creation / cookies / CSRF / rate limits / sessions:** READ `command-center/rules/security-waves.md` — Gemini is MANDATORY + the 2-iteration pattern applies when first gate returns BLOCK with >2 medium+ findings.

## Actions

1. **Karen + Jenny** — spawn in parallel (always)
2. Karen: spot-check 3-5 load-bearing claims from the plan (file paths, line numbers, function existence) via Read/Grep **+ strategic correctness check** (see Karen's instructions and Stage 1 antipatterns catalog)
3. Jenny: cross-reference plan against specs (CLAUDE.md, command-center/artifacts/user-journey-map.md, master plan) for drift
4. **Gemini cross-model review** — conditional (see skip conditions below)

### Gemini cross-model adversarial review

Run via the `gemini` CLI (installed at `$(which gemini)`). Single shot, no interactive loop.

```bash
cat Planning/wave-<N>-plan.md Planning/wave-<N>-reframing.md | \
  gemini -p "You are an adversarial reviewer from a different model family than the author. Review this wave plan and reframing. Your single task: find the ONE thing most likely to be the wrong solution to a right problem. Focus on: symptom-vs-cause confusion, metric misalignment, band-aid over root cause, workaround becoming permanent feature, solving for the demo, over-engineering for one-off. If you find nothing serious, say so explicitly. Output: maximum 200 words. Format: CONCERN (1-2 sentences) + EVIDENCE (file or line reference if applicable) + SUGGESTION (1 sentence)."
```

Save output to `Planning/wave-<N>-gemini-review.md`.

### When Gemini is MANDATORY
Run Gemini on any wave matching one of these:
- Auth, sessions, cookies, CSRF, rate limits (cross-reference `command-center/rules/security-waves.md`)
- Payments, wallet, withdrawals, Stripe integration
- Data integrity (migrations, cascading deletes, unique constraints)
- Core flows: listing creation, order placement, dispute resolution
- Any wave touching user money
- Explicitly high-stakes items (orchestrator judgment)

### When Gemini is OPTIONAL (skip allowed)
- Pure UI layout, copy changes, CSS adjustments
- Seed data tweaks
- Documentation updates
- Dependency version bumps
- Waves the orchestrator judges as low-consequence

When skipping, note the reason in the wave plan: `Gemini check skipped: <reason>`.

### Gemini unavailable fallback

If Gemini is rate-limited, times out, or crashes, substitute with **two independent specialist reviewers from different lenses** spawned in parallel:
- e.g., `architect-reviewer` + `security-auditor`, or `security-engineer` + `code-reviewer`
- Both must be fresh-context (no shared state) and produce independent findings
- If both converge on the same BLOCKER, the cross-model adversarial coverage requirement is met
- Document the substitution in `Planning/wave-<N>-gemini-review.md` with rationale

This substitution is valid ONLY when the two specialist lenses are genuinely different (not two agents with the same expertise). If only one specialist lens is available, the Gemini requirement is NOT met — escalate to user.

### Non-negotiable rules
- Karen AND Jenny are the **mandatory baseline** — every wave, every time, regardless of scope
- Specialists (architect-reviewer, security-engineer) layer on top but NEVER substitute
- All required reviewers must APPROVE before execution
- **Security-critical waves:** if first gate returns BLOCK with >2 medium+ findings, produce v2 plan and run a second gate pass

## Deliverable
- `Planning/wave-<N>-karen-review.md`
- `Planning/wave-<N>-jenny-review.md`
- `Planning/wave-<N>-gemini-review.md` (if run)

## Exit criteria
- Karen AND Jenny return APPROVE (or APPROVE WITH NOTES)
- If Gemini ran: its single CONCERN either addressed in plan revision or explicitly acknowledged as accepted risk
- Any BLOCK findings addressed in plan revision

## Next
→ Return to `../wave-loop.md` → Stage 4
