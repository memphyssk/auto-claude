# Stage 4b — Post-Build Review

## Purpose
Catch contract mismatches, null access, missing error handling before push. This is a production-bug check, not a style review.

## Prerequisites
- Stage 4 implementation complete
- **If invoking `/review` skill:** READ `command-center/rules/skill-use.md` — contract-mismatch + null-access + production-bug check (not a style review).

## Actions

1. Run `biome check --write` on all changed files
2. Run `pnpm typecheck` — zero errors
3. Run `pnpm test` — all tests pass
4. Run `pnpm build` — successful build
5. Optionally run `/review` skill on the diff for deeper analysis

## Deliverable
Clean working tree: lint, typecheck, tests, build all green.

## Exit criteria
- `biome check --write` applied
- `pnpm typecheck` passes
- `pnpm test` passes (all tests)
- `pnpm build` succeeds
- **Build-without-env smoke** (optional pre-flight, not a substitute for CI): when a wave adds third-party SDK construction at module-init time, temporarily move `.env.local` aside and re-run `pnpm build`. Catches env-dependent build failures before pushing, saving a CI round-trip. CI remains the authoritative gate.
- **Never commit secrets to the repo** — even in private repos. Netlify's secrets scanner blocks builds when it detects secret env var values in source files or config. Secrets go in platform env vars (Netlify UI, Railway env) only. If you need a value at build time, use the platform's build-scoped env injection — never `netlify.toml [build.environment]` for secrets, never hardcoded in source.

## Next
→ Return to `../wave-loop.md` → Stage 5
