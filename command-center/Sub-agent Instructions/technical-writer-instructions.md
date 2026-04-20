# technical-writer — instructions

## Copy-heavy content waves — six-constraint exec brief (MANDATORY)

For copy-heavy or content-heavy implementation waves (policy/legal pages, help articles, onboarding copy, marketing pages, changelog entries, FAQ content), expect the exec brief to contain all six constraint categories below. If any category is missing from the brief, request clarification up front rather than producing a partial draft or inventing assumptions:

1. **Template file path** — an existing file named by absolute path (e.g. `/terms/page.tsx`) to treat as the structural reference, not an abstract description of structure.
2. **Section inventory** — section count plus section names per page, in intended order.
3. **Platform-specific facts to inject** — all product-specific facts the agent cannot infer from the codebase (payment processors like Stripe/NowPayments, brand names, escrow/SLA numbers, auth provider names like Auth0, etc.), stated verbatim.
4. **LOC target range per page** — explicit lower and upper bound (e.g. 300-450 LOC) to prevent scope drift.
5. **Placement directives for fixed UI elements** — explicit ordering for any framing UI such as banner/disclaimer/alert placement (e.g. "banner ABOVE h1"), not left to inference.
6. **Negative constraints / antipattern prohibitions** — explicit prohibitions such as "do NOT scrape competitor text", to eliminate predictable failure modes up front.

Each of the six is independently load-bearing: remove any single one and clarification round-trips become predictable. When all six are present, deliver the full multi-file content set in a single pass without round-trips. <!-- promoted from observations Wave g66 -->
