# Development Principles

Engineering principles applied at Stage 4 (execute) and every stage that writes code. Complemented by `planning-principles.md` for plan-authoring discipline.

New rules enter via the Contract below — `/retro`, Stage 8/10 promotions, and manual edits all follow it (see CLAUDE.md always-on rule #13).

## Contract for new rules

Template:
### N. Imperative rule ending in a period.
Why: one declarative sentence.

- Before adding: grep for the concept — if a similar rule exists, do not add a near-dup.
- One sentence per line, short, commanding, cut to the chase.
- No war stories, wave refs, `Context:`, `Cross-ref:`, or project/stack names.
- Stack-specific detail → § Code conventions, not the numbered list.
- Number sequentially; renumber on insert.
- Group under an existing H2 unless ≥3 new rules share a theme.
- Wave-specific ("broke once") stays in the closeout until a second wave confirms.

---

## Authoring discipline

### 1. Ask: "would a senior engineer say this is overcomplicated?" If yes, simplify.
Why: this single question catches more over-engineering than any other check.

### 2. State assumptions explicitly; if uncertain, ask.
Why: silent assumptions become silent bugs.

### 3. When multiple interpretations exist, present them — don't pick silently.
Why: the user knows which reading matches intent; you're guessing.

### 4. If a simpler approach exists, say so before implementing the complex one.
Why: cheap pushback now is cheaper than a rewrite later.

### 5. When something is unclear, stop and name what's confusing.
Why: confusion hidden at authoring time surfaces as a bug at gate time.

## Simplicity

### 6. Ship the minimum code that solves the stated problem.
Why: speculative features are debt before they're used.

### 7. No abstractions for single-use code.
Why: one caller doesn't need an interface.

### 8. No flexibility or configurability that wasn't requested.
Why: every knob is a failure mode waiting for a user.

### 9. No error handling for scenarios that can't occur.
Why: unreachable branches rot silently and mislead readers.

### 10. If 200 lines could be 50, rewrite it.
Why: size is the cheapest proxy for complexity.

## Surgical changes

### 11. Don't improve adjacent code, comments, or formatting.
Why: scope creep dilutes review and hides the real change.

### 12. Don't refactor things that aren't broken.
Why: "while I'm here" is how regressions enter a shipping diff.

### 13. Match existing style, even if you'd do it differently.
Why: style inconsistency costs more than any local improvement buys.

### 14. Mention unrelated dead code; don't delete it.
Why: the user may have plans you can't see from here.

### 15. Remove imports, variables, and functions that your change stranded.
Why: orphans YOUR change created are YOUR mess to clean up.

### 16. Every changed line traces to the user's request.
Why: if you can't name the ask a line serves, it doesn't belong in the diff.

## Verify done

### 17. Before editing, identify the concrete check that tells you the edit worked.
Why: "should work now" is not a completion criterion.

### 18. After editing, actually run the check — don't trust the compiler's silence.
Why: type checks verify code correctness, not feature correctness.

### 19. For non-trivial changes, write the check first if one doesn't exist.
Why: a test that fails before your change and passes after is worth more than the diff.

## Error handling

### 20. Every caught error either rethrows, logs to an observable surface, or carries a one-line comment explaining why it's safe to swallow.
Why: silent catches are the #1 source of mystery bugs in production.

### 21. No bare `except:` or `catch (e)` — name the exception class.
Why: catching everything catches things you didn't mean to.

### 22. Logging to a surface nobody reads is silent handling with extra steps.
Why: "we have logs" only counts if someone or something monitors them.

### 23. "Handle errors gracefully" means nothing — name the specific exception and the specific response.
Why: vague intent produces vague code.

## Deletion bias

### 24. Prefer diffs that remove more code than they add.
Why: bugs hide in lines that exist.

### 25. Inline any helper used fewer than 3 times.
Why: one or two callers don't justify the indirection cost.

### 26. Zombie code created by your change ships in the same commit.
Why: leaving it for "later" means never.

### 27. A smaller simpler implementation beats a bigger "more general" one.
Why: generality has a cost; pay it only when a second caller actually shows up.

## Infrastructure gotchas

### 28. Confirm Railway uptime < 300s post-merge before declaring the deploy done.
Why: Railway auto-deploy can silently stall — a stale build passes CI but fails reality.

### 29. At Stage 5b, query `serviceInstance.dockerfilePath` via the Railway GraphQL API — don't trust `railway.json`.
Why: Railway's service-level config silently overrides the repo file; drift is invisible from the dashboard.

### 30. Before any Dynadot DNS write, GET the full record set and resend everything plus the new record.
Why: Dynadot `set` is a full replacement — omitted records are silently deleted.

### 31. Dynadot record type strings are lowercase (`a`, `cname`, `txt`, `mx`).
Why: the API rejects uppercase with opaque errors.

## Git discipline

### 32. Every follow-up PR description names why the previous attempt failed.
Why: without it the root cause lives only in the conversation and gets re-discovered every time.

---

## Code conventions

Baseline project rules applied at Stage 4 execution and post-build review. Project-specific engineering contract — violation of any convention is a Stage 4b review blocker. Not retro-driven; edit these per project.

### TypeScript
- Strict mode everywhere. No `any` unless absolutely necessary.
- Biome for linting and formatting. Run `pnpm lint` before committing.

### Validation
- **Shared schemas:** Define Zod schemas in `@your-project/shared` for logic shared between frontend and backend.
- **NestJS DTOs:** Bridge Zod → NestJS DTOs via `@anatine/zod-nestjs`. Do NOT create standalone class-validator DTOs without a corresponding Zod schema in shared.
- **Frontend forms:** Import Zod schemas from `@your-project/shared` for client-side validation.

### API Design
- All endpoints versioned under `/api/v1/`
- Success: `{ data, meta? }`
- Error: `{ error: string, message: string | string[], statusCode: number }`
- NestJS modules are self-contained (own controllers, services, DTOs). No cross-module direct Prisma queries — communicate through exported services.

### Database
- Prisma ORM for all access. No raw SQL unless performance-critical.
- Schema: `packages/api/src/database/prisma/schema.prisma`
- Migrations via `pnpm db:migrate`. Never edit committed migration files.

### Frontend
- Tailwind v3 + shadcn/ui. Dark mode is default.
- Design tokens as CSS custom properties in `globals.css`.
- Server Components by default. Use `'use client'` only when needed.
- API calls: `src/lib/api-client.ts` fetch wrapper + React Query for server state.

### Git
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- PR-based workflow, no direct pushes to main.
- CI runs lint + typecheck + test + build on all PRs.

### Security baseline
- JWT: 15-min access + 7-day refresh (httpOnly cookie).
- Passwords: bcrypt cost factor 12.
- All user input validated via Zod before processing.
- Deeper rules: `command-center/rules/security-waves.md`
