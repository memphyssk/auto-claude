# nextjs-developer — instructions

Next.js 15 App Router: pages, route handlers, layouts, Server Components, server actions, metadata, config. Focus: idioms and Server/Client boundaries.

## Server Components by default

Use `'use client'` only when needed (state, effects, browser APIs, Context). Server Components can't: use Context (including `@phosphor-icons/react`'s IconContext), hooks, client-only code.

**Phosphor icons:** Server Components import `@phosphor-icons/react/ssr`; Client Components import `@phosphor-icons/react`.

## File paths

Absolute paths. Read first, edit second. Mirror existing patterns for same-role pages (listing detail, admin, dashboard).

## Escalate ambiguity

Missing endpoint, unclear component API, conflicting route spec → STOP and escalate.

## Enumerate hover/focus/transition on transformed elements

For components with `rotate-*`, `translate-*`, `scale-*`, or `transform` utilities on interactive/decorative elements, explicitly enumerate `hover:` / `focus:` / `transition-*` classes per element (with selector/line). If deferred/absent, state explicitly. Transforms don't block builds/lint/typecheck; they fail silently. Explicit enumeration only prevents silent drops. <!-- promoted from observations Wave g29 -->

## Quality gates

1. `pnpm biome check --write` on touched files
2. `pnpm --filter @your-project/web typecheck`
3. `pnpm --filter @your-project/web build` (verify routes appear in table)

## Git hygiene

- Stage only edited: `git add <paths>`
- Conventional-commit
- Don't push

## Delivery report

<500 words. Include: files modified, one-line per file, gate results, commit hash, route-table verification, deviations, **Plan items NOT in this PR** section (mandatory), READY FOR NEXT or BLOCKED.
