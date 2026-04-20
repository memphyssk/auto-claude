# Development Principles

Engineering principles and cross-wave lessons applied at Stage 4 (execution) and beyond. Complemented by `planning-principles.md` for plan-authoring discipline.

## How this file is maintained

- **Populated by:** `/retro` skill output — orchestrator routes execution/deployment lessons to this file (plan-authoring lessons go to `planning-principles.md`).
- **Not a dumping ground:** only principles that apply across multiple waves belong here. Wave-specific lessons live in `Planning/wave-<N>-closeout.md`. CLAUDE.md stays lean — new always-on rules require explicit user approval, not automatic addition from `/retro` output.
- **Maintenance:** prune stale principles during periodic reviews. If a principle hasn't fired in 10+ waves, it's either absorbed into another rule or no longer relevant.

## Entry format

```
### <Short imperative rule>
**Context:** What situation surfaced this lesson.
**Rule:** The actionable principle.
**Why:** The reasoning (1-2 sentences).
**Cross-ref:** `Planning/wave-<N>-closeout.md` where first observed (optional).
```

---

## Principles

### Railway deploy is not guaranteed to fire on merge — always verify uptime < 300s post-merge
**Context:** Wave g25 — PR merged, CI green, code correct on disk, but Railway was still serving a 9-day-old build. Karen's Stage 7 check caught it via uptime timestamp comparison.
**Rule:** At Stage 5b, confirm Railway uptime is < 300s AND that a deploy-marker endpoint (or health check) returns a response consistent with the merged commit. If uptime > 300s post-merge, manually trigger a redeploy before proceeding to Stage 6.
**Why:** Railway auto-deploy can silently fail or stall. Verification without this check produces false "PASS" verdicts against stale code, causing Stage 7 BLOCK and wasted tester cycles.
**Cross-ref:** `Planning/wave-g25-closeout.md` — first observed.

### Dynadot DNS `set` is destructive — always resend the complete record set
**Context:** Wave g25 — Dynadot's DNS `set` operation wipes all existing records for the domain and replaces them with only what is submitted. Resending only the new CNAME without the full prior record set deletes all existing A/MX/TXT records.
**Rule:** Before any Dynadot DNS write, read the current full record set via `GET` and include all existing records plus the new record in the `set` payload. Never send a partial update.
**Why:** Partial `set` is indistinguishable from a full replacement at the API level. Any records omitted from the payload are silently deleted. Email (MX), root A, and SPF (TXT) are all at risk.
**Cross-ref:** `Planning/wave-g25-closeout.md` — first observed.

### Dynadot DNS record types are lowercase and case-sensitive
**Context:** Wave g25 — the Dynadot API rejected record types submitted in uppercase (`A`, `CNAME`, `TXT`). Lowercase values (`a`, `cname`, `txt`, `mx`) are required.
**Rule:** Always use lowercase record type strings when calling the Dynadot DNS API. Verify the exact string the API accepts before submitting.
**Why:** Unlike most DNS APIs that normalize case, Dynadot's API is case-sensitive on the `type` field. Uppercase submissions fail silently or with opaque errors.
**Cross-ref:** `Planning/wave-g25-closeout.md` — first observed.

### Railway serviceInstance config can silently override railway.json — verify via GraphQL before declaring Stage 5 confirmed
**Context:** Two consecutive waves (g56, g59) hit Railway silently replacing Dockerfile config with RAILPACK between deploys, ignoring `railway.json`. In both cases the deploy appeared to succeed at the CI level but Railway was building with the wrong config.
**Rule:** At Stage 5b (post-deploy QA), before declaring the deploy confirmed, query `serviceInstance.dockerfilePath` via the Railway GraphQL API. If the value is `null` or set to a RAILPACK path instead of the expected Dockerfile, apply the mutation recipe at `~/.gstack/railway-graphql-recipe.md` to restore the correct config. Do NOT proceed to Stage 6 with an unverified service config.
**Why:** Railway's service-level GraphQL config is authoritative over `railway.json`. Config drift is silent — the Railway dashboard may show the service as "deployed" while actually building with a different builder. Two occurrences in one session confirms this is a recurring infrastructure hazard, not a one-off.
**Cross-ref:** `Planning/wave-g59-closeout.md` — second occurrence; recipe logged at `~/.gstack/railway-graphql-recipe.md`.

### Follow-up PRs must state "why the previous attempt failed"
**Context:** When a fix requires more than one PR to land, the reasons for the prior attempt's failure often don't make it into the diff or commit — they live only in the conversation.
**Rule:** Each follow-up PR description must include a one-sentence diagnosis of why the prior attempt didn't work (e.g., "dep-array fix didn't work because the actual cause was engine.io transport ordering").
**Why:** Makes the learning searchable in git history. Future agents or humans debugging similar failures find the breadcrumb instead of re-discovering the same root cause.

---

## Code conventions

Baseline project rules applied at Stage 4 execution and post-build review. These are not retro-driven — they are the stable engineering contract for the codebase. Violation of any convention is a Stage 4b review blocker.

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
