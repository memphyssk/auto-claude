# Design-Gap Brief Template (Dx.1)

Copy this template into `Planning/wave-<N>-design-gap/<feature>-brief.md` and fill every section. Every field is load-bearing — `/aidesigner` + both reviewers will check against it.

---

```markdown
# Design Gap Brief — <feature name>

**Wave:** g<N>
**Parent stage invoking:** Stage <1 | 2 | 4 | 6b | 7b>
**Blocking current wave:** yes / no
**Autonomous mode:** true / false (inherited from wave plan)

## 1. What we need

One-line description of the page / component / icon / flow that doesn't yet exist in `design/`.

## 2. Where it lives

- **Route / file path:** e.g. `/settings/notifications` (new) or `packages/web/src/components/ui/<x>.tsx`
- **Navigation entry:** where users reach this (from Settings tab bar? from notification bell dropdown? new sidebar item?)

## 3. Audience + state

- **Who sees it:** anonymous / buyer / seller / admin (multi-select allowed)
- **States to design:** loading / loaded / empty / error / <feature-specific>

## 4. DESIGN-SYSTEM.md references (REQUIRED)

Cite every primitive from `design/DESIGN-SYSTEM.md` the generated design must consume. Copy exact section references. Minimum useful coverage:

- **Colors:** list tokens (e.g. `--brand-green #00d882` for CTA, `--bg-card #ffffff` for panel, `--pill-pending-bg` for status)
- **Typography:** which type-scale rows apply (H1 + H3 + Body-m + Label)
- **Spacing / radius:** `rounded-[24px]` / `rounded-xl` / standard padding
- **Shadows:** `shadow-subtle` / `shadow-premium` / `shadow-sidebar` etc.
- **Clip-path:** `clip-button` / `clip-tag` for CTAs
- **Icons:** Phosphor icon names expected (e.g. `BellIcon`, `ShieldCheckIcon`) — reference DESIGN-SYSTEM.md §8 iconography
- **Components to reuse** from Batch 1: ListingRow / SellerBadge / StatusPill / PriceDisplay / AngularCTA / TrustBadge / LoadingSpinner

## 5. Responsive contract

Per-breakpoint behavior (per `design/DESIGN-SYSTEM.md` §10):
- **1440+ (2xl):** full layout
- **1280–1439 (xl):** <describe>
- **1024–1279 (lg):** <describe>
- **<640 (degraded, Task #26 applies):** <describe minimum usable>

## 6. Interaction patterns

- Click / hover / focus states per interactive element
- Animation / transition expectations
- Keyboard accessibility (Tab order, Escape behavior, ARIA roles)
- Form validation UX (inline errors, submit states)

## 7. Data shape

- API endpoint(s) the design will consume (method + path + response schema shape)
- Empty / loading / error payloads the design handles

## 8. Prior art (match this visual language)

List 2-3 existing `design/*.html` mockups whose visual language the generated design must match. E.g.:
- Page header → match `settings.html:45-89`
- Card layout → match `orders.html:201-256`
- Empty state → match `messages.html:445-478`

## 9. Success criteria (APPROVE checklist)

The design is approved only when ALL of these hold:
- [ ] Uses exactly the DESIGN-SYSTEM.md tokens listed in §4 (no new hex values, no invented tokens)
- [ ] Renders all states listed in §3
- [ ] Responsive per §5
- [ ] Matches prior-art visual language from §8
- [ ] Interaction patterns per §6 (or documented variation + justification)
- [ ] All Phosphor icon references are real component names (not Lucide, not invented)
- [ ] <feature-specific criterion>

## 10. Non-goals

- <out-of-scope thing 1>
- <out-of-scope thing 2>

## 11. Reviewer briefing

`/plan-design-review` should score these dimensions: visual hierarchy, spacing rhythm, brand coherence, edge-case handling.
`/ui-ux-pro-max` should verify: brief criteria match, UX flow sensibility, accessibility minimums.
```

---

## Authoring checklist

Before passing the brief to `/aidesigner`:
- [ ] Every `<placeholder>` replaced with concrete content
- [ ] §4 cites at least 6 DESIGN-SYSTEM.md primitives (vague briefs produce vague output)
- [ ] §8 names 2-3 prior-art mockups (prevents visual drift)
- [ ] §9 has ≥5 checkboxes (more = better reviewer signal)
- [ ] Committed to `Planning/wave-<N>-design-gap/<feature>-brief.md`
