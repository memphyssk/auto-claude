# Skill Use

Skills live at `~/.claude/skills/` — gstack is one collection, others install alongside it. Scan the full directory, not just `gstack/`. This file maps load-bearing skills to their wave-loop fire points. Skills not listed are unused or edge cases — don't invent integration points without discussion.

---

## 🛡️ Always-on (every session)

| Skill | Purpose |
|---|---|
| **`/careful`** | Bash PreToolUse hook — warns before destructive commands (`rm -rf`, `DROP TABLE`, force-push, `git reset --hard`, `kubectl delete`). Invoke at wave start. Zero friction, high catch rate. |

---

## 🗓️ Per-wave (mandatory)

| Skill | Stage | Purpose | Duration |
|---|---|---|---|
| `/simplify` | 3 (after implementation) | Reduce complexity on touched files | ~1 min |
| `/review` | 3b (before push) | Contract-mismatch + null-access + production-bug check. **Not a style review.** | ~1 min |
| `/qa` | 4b (after deploy preview) | Headless browser smoke test on touched pages | ~2-3 min |

---

## 🎯 Per-wave (conditional, scope-driven)

### Plan-review skills (fire BEFORE Stage 2 Karen+Jenny gate)

These are **plan-quality gates** — they catch architectural/UX problems Karen and Jenny don't.

| Skill | When | Purpose |
|---|---|---|
| `/plan-eng-review` | Any non-trivial wave | Eng manager-mode: architecture, data flow, edge cases, test coverage, performance. Interactive + opinionated. |
| `/plan-design-review` | UI-heavy waves | Designer's eye, 0-10 rating per dimension, explains what would make it a 10. |
| `/plan-devex-review` | API / CLI / SDK waves | Developer experience review. 3 modes: EXPANSION / POLISH / TRIAGE. |
| `/autoplan` | Complex multi-dimension waves | Runs CEO + eng + design + devex reviews sequentially with auto-decisions. Heaviest option — use when unsure which single lens matters most. |

### Security + visual review skills

| Skill | When | Purpose |
|---|---|---|
| `/cso` | Any wave touching auth, payments, user creation, security-critical endpoints | OWASP Top 10 + STRIDE threat model. **Complements** architect-reviewer + security-engineer pair (see `rules/security-waves.md`) — does not replace them. |
| `/design-review` | Any wave adding new pages or significantly changing UI | Visual consistency check on the LIVE site (distinct from `/plan-design-review` which reviews plans). |

### Deploy skills (optional, layer as needed)

| Skill | When | Purpose |
|---|---|---|
| `/health` | Stage 4 pre-flight, large-diff waves | Code quality dashboard: typecheck + lint + tests + dead code → weighted 0-10 score + trend tracking |
| `/ship` | Stage 4, formal-release waves | Full PR workflow: merge base, tests, diff review, version bump, CHANGELOG, commit, push, create PR. Heavier than manual `git commit` + `gh pr create`. |
| `/land-and-deploy` | Stage 4 post-merge | Waits for CI + deploy, verifies production health via canary checks. Automated alternative to manual Railway/Netlify watching. |

### Debugging skill

| Skill | When | Purpose |
|---|---|---|
| `/investigate` | Stage 6b, batch mode on Major/Critical findings from the tester swarm | Systematic root-cause: investigate → analyze → hypothesize → implement. **Iron Law: no fixes without root cause.** Output feeds next wave's Stage 1 plan. |

### Closeout skills

| Skill | Stage | Purpose |
|---|---|---|
| `/document-release` | 7 (updates) | Post-ship doc sync: reads project docs, cross-references the diff, updates README / ARCHITECTURE / CLAUDE.md / CHANGELOG / VERSION. |
| `/learn` | 8 (synthesize) | Persist project learnings across sessions (searchable, prunable, exportable). Pairs with knowledge-synthesizer: synthesizer recommends, `/learn` preserves. |

---

## 📅 At backlog stage (every 3-5 waves)

- **`/plan-ceo-review`** — CEO/founder-mode plan review. Four modes: SCOPE EXPANSION (dream big), SELECTIVE EXPANSION (hold + cherry-pick), HOLD SCOPE (maximum rigor), SCOPE REDUCTION (strip to essentials). Challenges priorities, cuts scope, ranks by impact. **Prevents blind competitor-copying.** See `rules/backlog-planning.md` Step 2.

---

## 🔄 Periodic (every 5-6 waves)

- **`/retro`** — engineering retrospective. Captures what worked, what didn't, process improvements. **Output is distilled by the orchestrator and routed per entry** to either `command-center/rules/planning-principles.md` (plan-authoring lessons) or `command-center/rules/dev-principles.md` (execution / deployment lessons + code conventions). Do NOT dump retro output into CLAUDE.md — those two files are the canonical destinations.

---

## ⚠️ Critical rules

### 1. `/qa` supplements Playwright; never replaces it.
Why: the Stage 5 Playwright swarm is authoritative (persona discipline, network scanning, regression coverage) — `/qa` is a fast Stage 4b smoke test that catches obvious crashes before the full swarm.

### 2. Plan-review skills supplement Karen + Jenny; never replace them.
Why: `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/autoplan` catch architecture / UX / DX failure modes that Karen (hallucination) and Jenny (spec-match) don't. Plan-review fires BEFORE Stage 2, not instead.

### 3. `/ship` and `/land-and-deploy` are optional; manual workflow still works.
Why: `git commit` + `gh pr create` + manual CI watching is explicitly supported. `/ship` adds version bump + CHANGELOG for formal-release waves; not mandatory.

---

## Not integrated (edge cases / deferred)

`/office-hours`, `/freeze`, `/guard`, `/pair-agent`, `/canary`, `/checkpoint` — either unused, covered by existing sub-agent workflow, or edge cases not yet needed. If a new wave surfaces a need for one of these, propose integration explicitly before using — don't invent new integration points.
