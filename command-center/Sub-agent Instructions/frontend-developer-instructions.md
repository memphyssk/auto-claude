# frontend-developer — instructions

Implement Next.js 15 (App Router) + React + Tailwind v3 + shadcn/ui + Zustand + React Query in `packages/web/`. Dark mode default, design tokens in `globals.css`.

## File paths

Use orchestrator's absolute paths directly (no globs — miss `[username]` brackets). Try alternate formats (escaped brackets, case, extensions) + grep before reporting "not found". Escalate only after all attempts fail, with grep evidence. Every spec item must be implemented + committed OR escalated with evidence. Silent omission = "not done."

## Read first, then edit

Read full file (~50 lines around edit point) before editing. Match existing patterns (component shape, props, tokens, hooks). When mirroring a component, read it first and replicate exactly.

## Cross-surface display format consistency

For numeric displays (currency, percentage, rating), grep other components using same field. Flag inconsistency as out-of-scope finding. Don't ship one format while another exists.

## Hook return type: hasData discriminator

When hook returns fetched-from-server AND default/fallback state with same field shape, add explicit `hasData: boolean`:
- `hasData: true` only post-success (200 or socket event)
- `hasData: false` on initial/loading/401/error
- Consumer guard on `!hasData`, NOT content (content guards miss sentinel-shape data points)

```ts
interface PresenceState {
  status: 'online' | 'offline';
  lastSeenAt: string | null;
  hasData: boolean;
}
if (!hasData) return null;
```

## Escalate ambiguity

Missing API field, shape mismatch, undocumented dependency → STOP and escalate with evidence. Never ship workarounds.

## Prop changes require consumer audit

Before removing/renaming/retyping props, grep all import sites. Multi-consumer changes require explicit plan approval. Single-consumer → proceed but log removal as intentional API break. Silent removals break downstream invisibly.

## Quality gates

1. `pnpm biome check --write`
2. `pnpm --filter @your-project/web typecheck`
3. `pnpm --filter @your-project/web build` (catches Server Component mismatches typecheck misses)

Fix failures before commit. Verify new pages in build route table.

## Git hygiene

- Stage only edited files: `git add <paths>`
- Conventional-commit specific to scope
- Don't push (orchestrator handles)

## command-center/artifacts/user-journey-map.md awareness

If task adds/removes/modifies page/route/flow, note in delivery report what needs updating. Don't edit it yourself.

## Delivery report

<500 words. Include: files modified, one-line per task, gate results, commit hash, branch, line drifts, out-of-scope findings, UserFlows updates, READY FOR PUSH or BLOCKED.

**Mandatory "Plan items NOT in this PR" section** (even if empty). Per item: identifier + reason. Silent omission unacceptable.
