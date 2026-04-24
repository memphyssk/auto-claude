# Product Mega-Testing — Full-Site Validation Process

## What this is

A standalone, invocable testing process separate from the per-wave loop. While per-wave testing (Stage 5b/6/7) validates that specific changes work, Mega-Testing validates the entire product holistically: visual consistency, product logic, UX coherence, and end-to-end user flows at scale.

---

## Process Overview

```
Invoke Mega-Testing
       │
       ▼
  Phase 1: Scenario Execution (Playwright swarm, 5-10 agents)
       │
       ▼
  Phase 2: UX Consistency Audit (design-reviewer agent)
       │
       ▼
  Phase 3: Product Logic Audit (product-auditor agent)
       │
       ▼
  Phase 4: Cross-Reference & Consolidate
       │
       ▼
  Phase 5: Report & Triage
```

---

## Phase 1 — Scenario Execution

### Setup
- Spawn **10** `ui-comprehensive-tester` agents in parallel (always 10 — this is mega testing)
- Each agent gets ONE dedicated Playwright MCP instance (playwright, playwright-2, ..., playwright-10)
- Each agent receives 1-3 scenarios from `user-scenarios/`
- Agents MUST follow scenario steps exactly — no shortcuts, no API calls, no address-bar navigation
- **Testers interact ONLY through visible website elements.** Click buttons, type in fields, scroll, navigate via links — exactly as a real user would. `page.goto()` is allowed ONCE for the entry URL only. NEVER use `page.goto()` to jump between pages, NEVER use `page.evaluate(fetch(...))` to call APIs, NEVER type URLs in the address bar. If a flow only works via API call but not via clicking, it's broken and must be logged as a bug.

### Scenario assignment
Partition scenarios across agents by domain to avoid login conflicts:
- Agent 1-2: Buyer flows (browse, purchase, checkout, orders)
- Agent 3-4: Seller flows (list items, manage offers, fulfill orders, withdrawals)
- Agent 5: Boosting flows (post request, review offers, accept, track)
- Agent 6: Auth flows (register, login, reset password, KYC, email verification)
- Agent 7: Social flows (messages, profile, reviews, following, wishlist)
- Agent 8: Settings & Admin flows (all settings tabs, admin panel)
- Agent 9-10: Edge cases & stress (invalid inputs, expired states, empty states, concurrent actions)

### Per-scenario rules
1. Follow every step in the scenario file sequentially
2. Take a **screenshot at every checkpoint** marked with 📸 in the scenario
3. Record PASS/FAIL per step with evidence
4. Log any deviation from expected behavior, even if minor
5. Note load times > 3s as performance flags
6. Check for console errors on every page transition
7. **NEVER call `browser_close`** — let MCP instances persist
8. **Log bugs to TaskMaster immediately as they are found.** Do NOT wait until the end. Every FAIL or deviation gets a TaskMaster task created on the spot: `npx task-master add-task --prompt="[MEGA-TEST] <description with evidence>" --tag=mega-test`. This is non-negotiable — bugs discovered but not logged do not exist.

### Deliverable
- Per-agent report: `Planning/mega-test-reports/agent-N-report.md`
- All screenshots: `Planning/mega-test-reports/screenshots/`

---

## Phase 2 — UX Consistency Audit

### Agent: `design-reviewer` (or `/design-review` skill)

A dedicated design-consistency agent reviews the LIVE site (not code) looking for visual deviations across pages. This agent does NOT fix anything — it flags.

### What it checks

| Category | What to look for |
|----------|-----------------|
| **Spacing** | Inconsistent padding/margins between same-level elements across pages |
| **Typography** | Font sizes, weights, or families that deviate from the design system |
| **Color** | Colors that don't match the token palette (especially grays, greens, status colors) |
| **Component consistency** | Same component (button, card, badge, input) looking different on different pages |
| **Navigation** | Nav bar rendering differently across pages |
| **Status indicators** | Status pills using different colors/shapes for the same status on different pages |
| **Empty states** | Missing or inconsistent empty-state designs |
| **Loading states** | Missing or inconsistent loading indicators |
| **Error states** | Missing or inconsistent error handling UI |
| **Responsive** | Elements that break or overlap at common breakpoints |
| **Icon consistency** | Mixed icon styles (Phosphor fill vs bold vs regular) on same page |
| **Hover states** | Missing hover affordances on interactive elements |

### Reference sources (MUST read before auditing)
1. `design/DESIGN-SYSTEM.md` — canonical token reference (colors, typography, spacing, shadows, components)
2. `design/*.html` — the approved page mockups. Each page on the live site has a corresponding HTML file:

| Live page | Mockup file |
|-----------|-------------|
| Homepage `/` | `design/home.html` |
| Browse `/games/[slug]` | `design/browse.html` |
| Listing `/listings/[id]` | `design/listing.html` |
| Checkout | `design/checkout.html` |
| Auth (login/register/reset) | `design/auth.html` |
| Orders `/orders` | `design/orders.html` |
| Profile `/profile/[username]` | `design/profile.html` |
| Messages `/messages` | `design/messages.html` |
| Wallet `/wallet` | `design/wallet.html` |
| Offers `/offers` | `design/offers.html` |
| Sell `/sell` | `design/sell.html` |
| Settings `/settings` | `design/settings.html` |
| Boosting `/boosting` | `design/boosting.html` |
| KYC `/verification` | `design/kyc.html` |

### Process
1. Open each `design/*.html` mockup in a Playwright instance and take a full-page screenshot as the **reference**
2. Navigate to the corresponding live route and take a full-page screenshot as the **actual**
3. Compare reference vs actual for every category in the table above
4. Cross-check specific token values against `design/DESIGN-SYSTEM.md` (colors, font sizes, radii, shadows)
5. Flag every deviation with: page, element, expected (from mockup), actual (from live), severity (High/Medium/Low)

### Deliverable
- `Planning/mega-test-reports/ux-consistency-audit.md`
- Reference screenshots: `Planning/mega-test-reports/screenshots/ux/reference/`
- Actual screenshots: `Planning/mega-test-reports/screenshots/ux/actual/`
- Side-by-side comparison notes per page

---

## Phase 3 — Product Logic Audit

### Agent: `karen` (or dedicated product-auditor via `/investigate`)

A product-focused agent reviews the site for logical/business-rule inconsistencies. This agent thinks like a user and a product manager, not an engineer.

### What it checks

| Category | What to look for |
|----------|-----------------|
| **Data consistency** | Prices/counts/stats that don't add up across views (e.g., "142 offers" on profile but "98" in the tab) |
| **Navigation dead-ends** | Links/buttons that go nowhere or loop back to the same page |
| **Orphaned features** | UI elements that are visible but non-functional (toggles that don't toggle, buttons that don't respond) |
| **Copy & labeling** | Inconsistent terminology (e.g., "Offers" vs "Listings" for the same thing) |
| **Permission leaks** | Features visible to wrong roles (seller features visible to buyers, admin features visible to users) |
| **Status machine gaps** | Orders/requests stuck in impossible states, missing transitions |
| **Onboarding gaps** | First-time user hitting dead-ends, missing CTAs, unclear next steps |
| **Trust signal gaps** | Pages missing TradeShield/escrow mentions where money is involved |
| **Edge case handling** | What happens with 0 items, max items, special characters, long text, missing images |
| **Cross-page consistency** | Same entity (order, listing, user) showing different data on different pages |
| **Feature completeness** | Features that are partially built (e.g., button exists but flow is incomplete) |
| **Competitive gaps** | Features competitors have that we're missing on equivalent pages |

### Process
1. Walk through every user flow in `command-center/artifacts/user-journey-map.md` on the live site
2. For each flow: verify the happy path works end-to-end
3. Then: try 2-3 edge cases per flow (empty input, wrong role, expired state)
4. Cross-reference visible data across pages (does the order count on dashboard match orders list?)
5. Flag every inconsistency with: flow, step, expected behavior, actual behavior, severity

### Deliverable
- `Planning/mega-test-reports/product-logic-audit.md`
- Evidence screenshots in `Planning/mega-test-reports/screenshots/product/`

---

## Phase 4 — Cross-Reference & Consolidate

The orchestrator (not a sub-agent) reads all three deliverables and:

1. De-duplicates findings (same bug found by scenario tester AND UX auditor)
2. Cross-references: does a UX deviation correlate with a product logic issue?
3. Groups related findings into themes (e.g., "all sidebar-related issues", "all empty-state gaps")
4. Assigns final severity: Critical / High / Medium / Low

---

## Phase 5 — Report & Triage

### Final report
Write `Planning/mega-test-reports/MEGA-TEST-SUMMARY.md` with:
- Executive summary (total findings, critical count, themes)
- Findings table: ID | Category | Page | Description | Severity | Evidence | Recommended fix
- UX consistency score (0-10)
- Product logic score (0-10)
- Top 5 priorities for next wave

### Triage into TaskMaster
For each finding rated High or Critical:
- Create a TaskMaster task: `npx task-master add-task --prompt="<description>" --tag=mega-test`
- Include root-cause notes and evidence references
- Link related findings to the same parent task where applicable

---

## User Scenarios

All scenario files live in `user-scenarios/` subfolder. Each scenario file:
- Is named descriptively: `buyer-first-purchase.md`, `seller-list-currency.md`
- Contains 5-100 explicit steps
- Marks screenshot checkpoints with 📸
- Specifies preconditions (logged in as buyer, has wallet balance, etc.)
- Specifies expected outcomes per step
- Includes edge-case variants where applicable

See `user-scenarios/` for the full inventory.

### Scenario template

```markdown
# Scenario: [Name]

**Persona**: Buyer / Seller / Admin / Visitor
**Preconditions**: [What must be true before starting]
**Estimated steps**: [N]
**Priority**: P1 / P2 / P3

## Steps

1. Navigate to [URL] by [method]
   - Expected: [what should appear]
   📸 checkpoint-name

2. Click [element]
   - Expected: [result]

3. ...

## Edge cases

- What if [condition]? Expected: [behavior]
- What if [condition]? Expected: [behavior]
```

---

## Invoking Mega-Testing

To run: tell the orchestrator "Run product mega-testing" or "Invoke mega-testing process". The orchestrator will:
1. Read this file
2. Create `Planning/mega-test-reports/` directory
3. Execute Phases 1-5 in sequence
4. Present the summary report when complete
