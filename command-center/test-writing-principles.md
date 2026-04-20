---
name: Tester Guide
description: Master testing reference for agents and subagents working on <your project> (<your-project>). Defines testing philosophy, patterns, tools, and auto-updated rules. Covers BOTH code-level testing (Vitest, NestJS, React) and live production testing (Playwright MCP, prod crawls).
audience: [backend-developer, frontend-developer, test-automator, code-reviewer, ui-comprehensive-tester, qa-expert, accessibility-tester]
auto_update: true
last_updated: 2026-04-08
version: 3.0
schema_version: 1
pattern_count: 5
antipattern_count: 10
related_documents: [CLAUDE.md, design/DESIGN-SYSTEM.md, command-center/artifacts/user-journey-map.md]
tags: [testing, vitest, nestjs, react, zod, monorepo, security, playwright, e2e, production]
---

# Tester Guide — <your project>

This document is the single source of truth for how testing should be approached across the <your project> monorepo. It is read by agents and subagents before writing or reviewing tests, and is auto-updated as new patterns and rules are discovered.

---

## Priority Levels

This document uses RFC 2119 priority terms:

- **MUST** — Non-negotiable. Violating this will cause CI failure, test invalidity, or architectural drift. Always enforce.
- **SHOULD** — Strong default. Deviate only with a comment explaining why.
- **MAY** — Discretionary. Use judgment.

These terms appear in **bold** throughout the document.

---

## 0. Agent Pre-Flight Checklist

**MUST** complete ALL steps before writing a single line of test code.
Do not proceed to the next step until the current one is done.
If any step cannot be completed, stop and report why.

- [ ] 1. Read this entire file (test-writing-principles.md).
- [ ] 2. Read the source file(s) you are testing. Identify: all exported functions/methods, their parameter types, return types, and thrown exceptions.
- [ ] 3. Read ALL existing `*.spec.ts` / `*.test.tsx` files in the same module directory. Adopt their `describe`/`it` naming style, mock setup patterns, and import ordering exactly. If no tests exist, default to Section 7 patterns.
- [ ] 4. Identify which Section 6 priority tier the subject falls under (Tier 1 = financial/auth, Tier 2 = pre-beta, Tier 3 = normal).
- [ ] 5. List the test cases you plan to write before writing any code. Include: at minimum one happy-path and one error-path per exported method.
- [ ] 6. Confirm which mocks are needed per Section 8.
- [ ] 7. Write the tests using the patterns in Section 7 for your package.
- [ ] 8. Run `pnpm test --filter=<package>` and confirm all tests pass.
- [ ] 9. If you discovered a new pattern or rule, append it to Section 14 using the template exactly.

---

## 1. Agent Instructions

When an agent or subagent is asked to write or review tests:

1. **COMPLETE THE PRE-FLIGHT CHECKLIST** in Section 0 — every step, every time.
2. **FOLLOW PATTERNS IN SECTION 7 EXACTLY** — do not deviate or invent new patterns.
3. **CHECK EXISTING TESTS** in the same module for local conventions before creating new ones.
4. **RUN TESTS LOCALLY** (`pnpm test`) and confirm they pass before committing.
5. **UPDATE SECTION 14** if you discover a new pattern, rule, or gotcha that future agents should know.
6. **PRESERVE DOCUMENT STRUCTURE.** **MUST NOT** rewrite, reorder, or summarize existing sections. **MUST NOT** change section numbers. Only append to Section 14. If you believe an existing rule is wrong, add a Note to Section 14 flagging the conflict — do not edit the original rule.

### Critical Rules (Never Violate)

- **MUST** co-locate test files next to source files.
- **MUST** use AAA (Arrange/Act/Assert) with comments in every test body.
- **MUST** mock PrismaService in unit tests. **MUST NOT** import AppModule.
- **MUST** query Web components by role, label, or text — not by testId.
- **MUST** write at minimum one happy-path and one error-path per new method.
- **MUST** run `pnpm test` and confirm passing before committing.
- **MUST** append to Section 14 using the exact template if a new rule is discovered.
- **MUST NOT** edit existing Section 14 entries or reorder any section.

---

## 2. Quick Reference

### Decision Tree: What to Test?

```
Are you writing a test for...?
├── API Service method?
│   ├── Mock Prisma (unit) OR use real DB (integration)
│   ├── Test happy-path + error-path (throw, validation fail)
│   └── If financial (orders/disputes): test decimal arithmetic boundaries
├── API Controller endpoint?
│   ├── Use TestingModule + Supertest
│   ├── Mock services/guards
│   ├── Test HTTP status codes + response shape ({ data } / { error, message, statusCode })
│   └── Test RBAC: verify role-guarded endpoints reject unauthorized roles
├── React component?
│   ├── Query by role/label (not test ID)
│   ├── Use userEvent (not fireEvent)
│   └── Test interactions + state changes + error states
├── Zod schema?
│   ├── Test valid data (safeParse → success: true)
│   ├── Test invalid data (safeParse → success: false)
│   └── Test boundary values (min, max, edge cases)
└── Utility function?
    └── Test happy-path + edge cases (empty, null, boundary values)
```

### When to Use Mocks (Quick Lookup)

| Scenario | Mock? | Example |
|----------|-------|---------|
| Prisma in unit test | YES | `const mockPrisma = { user: { findUnique: vi.fn() } }` |
| Prisma in integration test | NO | Use real DB with transaction rollback |
| Stripe/S3/External API | ALWAYS | `vi.mock('@/services/stripe.service')` |
| Redis/Cache | YES | `const mockRedis = { get: vi.fn(), set: vi.fn() }` |
| Auth/JWT (non-auth tests) | YES | Override guard: `{ canActivate: () => true }` |
| Zod schemas | NEVER | Always use real schemas |
| Internal service (same module) | NO | Use TestingModule provider |
| Internal service (cross-module) | YES | `{ provide: UserService, useValue: mockUserService }` |

---

## 3. Testing Stack

| Tool | Purpose | Config |
|------|---------|--------|
| **Vitest** | Unit & integration tests | `vitest.config.ts` per package |
| **Supertest** | HTTP endpoint testing (API) | Used with NestJS `TestingModule` |
| **React Testing Library** | Component tests (Web) | With `@testing-library/react` |
| **Prisma** | DB test fixtures via seed | `pnpm db:seed` |
| **Biome** | Lint & format checks | `biome.json` at root |
| **TypeScript** | Type checking as a test gate | `pnpm typecheck` |

---

## 4. Running Tests & CI Requirements

### Local Development

```bash
pnpm test              # Run all tests across all packages
pnpm test --filter=api # Run only API tests
pnpm test --filter=web # Run only Web tests
pnpm typecheck         # Type-check all packages
pnpm lint              # Lint all packages
```

### Before Submitting a PR

All of these **MUST** pass locally before pushing:

1. `pnpm lint` — No linting errors (Biome)
2. `pnpm typecheck` — No TypeScript errors
3. `pnpm test` — All tests pass
4. `pnpm build` — Successful production build

CI runs the same checks. **Failure in any step blocks merge.**

---

## 5. Test File Conventions

- **Location:** **MUST** co-locate test files at the exact same directory level as the file they test.
  - Source: `packages/api/src/modules/users/users.service.ts`
  - Test: `packages/api/src/modules/users/users.service.spec.ts` (same folder, same depth)
  - Source: `packages/web/src/components/LoginForm.tsx`
  - Test: `packages/web/src/components/LoginForm.test.tsx` (same folder, same depth)
- **Naming:** **MUST** use `.spec.ts` for API services/controllers, `.test.tsx` for Web components.
- **Exception:** Only use `__tests__/` folder if one already exists in that module. Do not create `__tests__/` folders yourself.

---

## 6. Risk-Based Test Prioritization

Test in this priority sequence. If time is limited, stop at the highest-priority items.

### Tier 1 — Test Immediately (Financial + Legal Risk)

| Module | Why | Key Tests |
|--------|-----|-----------|
| **orders** | 10-state machine, escrow, Stripe charges, seller balance mutations, fee calculations | State transitions, decimal arithmetic, concurrent purchase race conditions |
| **disputes** | 6-state machine, partial refunds, evidence handling | Transition matrix, resolution authorization (ADMIN only), amount splitting |
| **kyc** | Gates seller capabilities, identity documents | Webhook signature verification, level-gated feature enforcement |
| **auth** | JWT lifecycle, session security | Token rotation (old refresh token rejection), guard stacking order (401 before 403), malformed JWT rejection |

### Tier 2 — Test Before Beta

| Module | Why | Key Tests |
|--------|-----|-----------|
| **payments** | Stripe/NowPayments webhook handling | Signature verification, idempotency (duplicate webhook), rollback on failure |
| **listings** | Price validation, status filtering | Inverted price range rejection, DRAFT/REMOVED not exposed to public queries |
| **admin** | Privileged actions, audit logging | Role escalation prevention (no SUPER_ADMIN via API), audit log writes |

### Tier 3 — Normal Priority

| Module | Why | Key Tests |
|--------|-----|-----------|
| **reviews** | Unique constraint, ownership | Duplicate review rejection, reviewer must be order buyer |
| **notifications** | Delivery isolation | Fan-out: buyer A must not see buyer B's notifications |
| **uploads** | File type validation | Reject non-image MIME types, path traversal filenames |
| **games**, **users** | Lower financial risk | Standard CRUD + validation |

---

## 7. Testing Patterns

### 7.1 Test Structure — Arrange / Act / Assert

**MUST** follow AAA in every test. **MUST** include comments.

```typescript
describe('UsersService', () => {
  describe('findById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 'test-uuid';
      mockPrisma.user.findUnique.mockResolvedValue({ id: userId, email: 'a@b.com' });

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('bad-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
```

### 7.2 API — NestJS Service Unit Test

```typescript
import { Test } from '@nestjs/testing';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ... tests here
});
```

- **MUST** use `TestingModule` for isolated service tests.
- **MUST** mock `PrismaService` for unit tests; use real DB only for integration tests.
- **MUST NOT** import the full `AppModule` in a unit test.
- **MUST** call `vi.clearAllMocks()` in `afterEach`.

### 7.3 API — NestJS Controller Integration Test

```typescript
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

describe('UsersController', () => {
  let app: INestApplication;
  const mockUsersService = {
    findById: vi.fn(),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  it('GET /users/:id returns 200 with user data', async () => {
    // Arrange
    mockUsersService.findById.mockResolvedValue({ id: 'test-id', email: 'a@b.com' });

    // Act
    const res = await request(app.getHttpServer()).get('/api/v1/users/test-id');

    // Assert
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('test-id');
  });

  it('GET /users/:id returns 404 for non-existent user', async () => {
    // Arrange
    mockUsersService.findById.mockRejectedValue(new NotFoundException());

    // Act
    const res = await request(app.getHttpServer()).get('/api/v1/users/bad-id');

    // Assert
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ statusCode: 404, error: expect.any(String) });
  });
});
```

### 7.4 Web — Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('submits with valid credentials', async () => {
    // Arrange
    const mockSubmit = vi.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Test1234!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'Test1234!',
    });
  });

  it('displays validation error for invalid email', async () => {
    // Arrange
    render(<LoginForm onSubmit={vi.fn()} />);

    // Act
    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Assert
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

- **MUST** query by role, label, or visible text. **MUST NOT** use `data-testid` unless the element has no semantic role, label, or text — and **MUST** leave a comment explaining why `data-testid` was used.
- **SHOULD** use `userEvent` over `fireEvent` for realistic interactions.

### 7.5 Shared — Schema Testing

```typescript
describe('createListingSchema', () => {
  const validData = {
    title: 'Gold Pack',
    price: 49.99,
    currency: 'USD',
    deliveryMethod: 'MANUAL',
    deliveryTimeHours: 24,
    gameId: 'game-uuid',
    categoryId: 'cat-uuid',
  };

  it('should accept valid listing data', () => {
    // Act
    const result = createListingSchema.safeParse(validData);

    // Assert
    expect(result.success).toBe(true);
  });

  it('should reject negative price', () => {
    // Act
    const result = createListingSchema.safeParse({ ...validData, price: -1 });

    // Assert
    expect(result.success).toBe(false);
  });

  it('should reject deliveryTimeHours above 168', () => {
    // Act
    const result = createListingSchema.safeParse({ ...validData, deliveryTimeHours: 169 });

    // Assert
    expect(result.success).toBe(false);
  });

  it('should reject more than 10 imageUrls', () => {
    // Act
    const urls = Array.from({ length: 11 }, (_, i) => `https://img.test/${i}.jpg`);
    const result = createListingSchema.safeParse({ ...validData, imageUrls: urls });

    // Assert
    expect(result.success).toBe(false);
  });
});
```

---

## 8. Mocking Rules

| What | Mock? | How |
|------|-------|-----|
| Database (Prisma) | Yes (unit), No (integration) | `vi.mock()` or manual mock object |
| External APIs (Stripe, S3, Sumsub) | Always | `vi.mock()` the service wrapper |
| Redis/Cache | Yes | In-memory mock |
| Auth/JWT | Yes for non-auth tests | Provide mock user via guard override |
| Zod schemas | **Never** | Test with real schemas |
| Internal services | Only across module boundaries | Use `TestingModule` providers |
| EmailService | Always in unit tests | `{ sendOrderCreatedEmail: vi.fn().mockResolvedValue(undefined) }` |
| NotificationsService | Always in unit tests | `{ create: vi.fn().mockResolvedValue(undefined) }` |

---

## 9. Test Data

### Integration Tests

Use `pnpm db:seed` to create test users in your database:

| Email | Password | Role |
|-------|----------|------|
| `admin@example.test` | `Test1234!` | ADMIN |
| `seller@example.test` | `Test1234!` | SELLER |
| `buyer@example.test` | `Test1234!` | BUYER |

**MUST NOT** mutate seed data in tests. If a test needs to ban a user, create a separate test user.

### Unit Tests

**MUST** create inline fixtures using factory functions. **MUST NOT** import seed data.

```typescript
import type { User } from '@prisma/client';

let seq = 0;
const next = () => String(++seq).padStart(6, '0');

function makeUser(overrides?: Partial<User>): User {
  const id = next();
  return {
    id: `test-${id}`,
    email: `user-${id}@example.test`,
    username: `user${id}`,
    role: 'BUYER',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    emailVerifiedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
```

Use deterministic sequential IDs (not `Date.now()` or `Math.random()`) for parallel test safety.

### Integration Test Isolation

For HTTP e2e specs, truncate all tables after each test file:

```typescript
async function truncateAll(prisma: PrismaClient): Promise<void> {
  const tables = [
    'DeliveryProof', 'OrderEvent', 'OrderMessage',
    'Dispute', 'Order', 'Review', 'Notification',
    'Listing', 'SellerBalance', 'SellerProfile', 'Profile',
    'User', 'GameCategory', 'Game',
  ];
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
  }
}
```

---

## 10. Security Testing

This is a marketplace handling real money and personal KYC data. Security tests are **Tier 1 priority**.

### 10.1 RBAC / Authorization

**MUST** test that every role-guarded endpoint rejects unauthorized roles:

```typescript
describe('Admin endpoints RBAC', () => {
  it('returns 401 for unauthenticated request', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .expect(401);
  });

  it('returns 403 for BUYER role', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(403);
  });

  it('returns 200 for ADMIN role', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
```

### 10.2 Ownership / IDOR Prevention

**MUST** test that User A cannot access User B's resources:

```typescript
it('buyer A cannot view buyer B order', async () => {
  await request(app.getHttpServer())
    .get(`/api/v1/orders/${buyerBOrderId}`)
    .set('Authorization', `Bearer ${buyerAToken}`)
    .expect(404); // 404 not 403 — prevents enumeration
});
```

### 10.3 Webhook Signature Verification

**MUST** test that unsigned or wrongly signed webhooks are rejected:

```typescript
it('rejects Stripe webhook with invalid signature', async () => {
  await request(app.getHttpServer())
    .post('/api/v1/webhooks/stripe')
    .set('stripe-signature', 'invalid')
    .send(payload)
    .expect(401);
});
```

### 10.4 Rate Limiting

**SHOULD** test that auth endpoints enforce rate limits:

```typescript
it('blocks after N failed login attempts', async () => {
  for (let i = 0; i < 10; i++) {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'x@test.com', password: 'wrong' });
  }
  await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: 'x@test.com', password: 'wrong' })
    .expect(429);
});
```

### 10.5 Auth Edge Cases

- **MUST** test expired access token returns 401, not 500.
- **MUST** test malformed JWT (`"alg": "none"`, truncated, wrong secret) is rejected.
- **MUST** test refresh token rotation: old refresh token is invalidated after use.
- **SHOULD** test guard stacking order: `AuthGuard` runs before `RolesGuard` (unauthenticated → 401, not 403).

---

## 11. State Machine Testing

### 11.1 Order State Transitions

The `OrderStatus` enum has 10 states. **MUST** test:

- Every **legal** transition updates the `OrderEvent` log.
- Every **illegal** transition returns 400/422.
- Only the correct actor can trigger each transition (buyer vs seller vs admin vs system).

Example illegal transition test:

```typescript
it('rejects transition from COMPLETED to DISPUTED', async () => {
  // Arrange — order in COMPLETED status
  const order = await createOrder(buyerId, sellerId, listingId, { status: 'COMPLETED' });

  // Act
  const res = await request(app.getHttpServer())
    .post(`/api/v1/orders/${order.id}/dispute`)
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({ reason: 'late' });

  // Assert
  expect(res.status).toBe(400);
});
```

### 11.2 Dispute State Transitions

The `DisputeStatus` enum has 6 states. **MUST** test:

- Only ADMIN can resolve disputes.
- A dispute cannot be resolved twice.
- `PARTIAL_REFUND` amount splitting is correct (decimal arithmetic).
- Opening a dispute freezes seller payout.

### 11.3 Fraud / Abuse Scenarios

**SHOULD** test adversarial user behavior:

- Seller marks order DELIVERED without delivery proof → blocked.
- Buyer purchases own listing → blocked.
- User submits review for an order they're not the buyer on → blocked.
- Seller with `KycStatus.NONE` requests payout → blocked.

---

## 12. Coverage Expectations

- **MUST:** Every new service method and API endpoint has at least one happy-path and one error-path test.
- **MUST:** Every bug fix includes a regression test that would have caught the bug.
- **SHOULD:** Tier 1 modules (orders, disputes, kyc, auth) target 80% branch coverage.
- Other modules: quality over quantity, no enforced thresholds yet.
- Do not interpret the absence of thresholds as permission to skip tests.

---

## 13. Anti-Patterns — Do Not Write Tests Like These

### Anti-pattern 1: Asserting implementation details instead of behavior

```typescript
// WRONG — tests that Prisma was called, not that the service works
it('should call prisma.user.findUnique', async () => {
  await service.findById('test-id');
  expect(mockPrisma.user.findUnique).toHaveBeenCalled(); // useless assertion
});

// CORRECT — assert what the consumer cares about
it('should return the user when found', async () => {
  mockPrisma.user.findUnique.mockResolvedValue({ id: 'test-id', email: 'a@b.com' });
  const result = await service.findById('test-id');
  expect(result.email).toBe('a@b.com');
});
```

### Anti-pattern 2: Querying by test ID when a semantic query exists

```typescript
// WRONG
const button = screen.getByTestId('submit-btn');

// CORRECT
const button = screen.getByRole('button', { name: /sign in/i });
```

### Anti-pattern 3: Importing AppModule in a unit test

```typescript
// WRONG — loads the full application, database connections, all providers
const module = await Test.createTestingModule({
  imports: [AppModule],
}).compile();

// CORRECT — isolate only the providers you need
const module = await Test.createTestingModule({
  providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
}).compile();
```

### Anti-pattern 4: Missing vi.clearAllMocks() between tests

```typescript
// WRONG — mock call counts bleed between tests
describe('UsersService', () => {
  it('test A', async () => { await service.findById('1'); });
  it('test B', async () => {
    // mockPrisma still has calls from test A
  });
});

// CORRECT
afterEach(() => { vi.clearAllMocks(); });
```

### Anti-pattern 5: Testing the error message string instead of the error type

```typescript
// WRONG — brittle; breaks if message copy changes
await expect(service.findById('bad')).rejects.toThrow('User not found');

// CORRECT — robust against message changes
await expect(service.findById('bad')).rejects.toThrow(NotFoundException);
```

---

## 14. Auto-Updated Rules and Patterns

> Agents **MUST** append to this section when they discover a pattern, edge case,
> or rule not covered above. **MUST NOT** edit existing entries.
> Use EXACTLY the template below. No other format is accepted.

### Entry Template

```
### [YYYY-MM-DD] [Package: api|web|shared] — Short Rule Title

**Context:** One sentence describing what task surfaced this rule.
**Rule:** The enforceable rule in imperative form. One to three sentences max.
**Example:** (optional) Inline code snippet of 3-8 lines demonstrating the rule.
**Discovered by:** Agent type or PR link.
```

### Entries

### [2026-04-08] [Package: web/e2e] — Production E2E testing principles + methodology added

**Context:** Wave 5a hotfix loop surfaced recurring tester false positives (layout-only verification, single-user real-time claims) and false negatives (`window.io === undefined`, `el.onclick === null`). Sections 15 and 16 were appended to capture these as principles.
**Rule:** Any agent doing UI/UX or functional verification on production builds **MUST** read Sections 15 and 16 in addition to Sections 0-13. The principles in Section 15 are non-negotiable; the methodology in Section 16 is the prescribed implementation.
**Discovered by:** Wave 5a hotfix loop reality checks (Karen + Jenny).

### [2026-04-09] [Package: web] — hasData discriminator anti-pattern for fallback sentinels

**Context:** Wave C PresenceDot shipped with a null-guard `if (status === 'offline' && lastSeenAt === null) return null`. The intent was to hide the dot for anonymous visitors whose 401 produced `OFFLINE_SENTINEL`. But the same shape `{ status: 'offline', lastSeenAt: null }` is ALSO a legitimate server response for known-offline-never-disconnected users, so those users had no dot either. Tester 1 reported "PresenceDot missing everywhere" which was the symptom of conflating the sentinel with real data.
**Rule:** When a fallback sentinel has the same field-shape as a valid data point, add an explicit `hasData: boolean` discriminator to the type. Set `hasData: true` only on successful server response or socket event; set `false` on initial/undefined/401 paths. Guards should check `!hasData`, not the content of `status`/`lastSeenAt`. This applies to any React hook that returns a union of "fetched data" and "default/fallback sentinel" where the shapes overlap.
**Example:**
```ts
interface PresenceState {
  status: 'online' | 'offline';
  lastSeenAt: string | null;
  hasData: boolean; // true iff server confirmed
}
// PresenceDot:
if (!hasData) return null; // correct
// if (status === 'offline' && lastSeenAt === null) return null; // WRONG — catches real offline users
```
**Discovered by:** Wave C Stage 5 tester swarm + PR #45 same-wave fast-fix.

---

## 15. Production E2E Testing — Principles

Principles for live testing against deployed environments using Playwright MCP. Applies to ANY agent doing UI/UX or functional verification on production builds — `ui-comprehensive-tester`, `qa-expert`, `accessibility-tester`, `test-automator` running E2E suites, etc.

### 15.1 Test source of truth

**MUST** read `command-center/artifacts/user-journey-map.md` at the project root before testing. It is the canonical inventory of every user flow, screen, route, API endpoint, and user story. Identify which flows are affected by the changes you are verifying and exercise those flows end-to-end. Test scenarios listed in command-center/artifacts/user-journey-map.md are the source of truth for what counts as "passing" a flow.

### 15.2 Test the content, not just the layout

When verifying a fix that unblocks a previously-broken route, **MUST** exercise the actual CONTENT — not just whether the page renders.

- For dashboards: read the actual stat values
- For list pages: count rows and sample 1-2 entries
- For detail pages: verify entity fields are populated
- For forms: type into inputs, submit, verify the result
- For admin: try a write action

A "page renders" pass that hides a contract mismatch one layer deeper is the most expensive false positive class. Always go one layer deeper than the layout guard.

### 15.3 Network-layer evidence > DOM observation

For asynchronous behaviors (WebSocket, long-poll, refresh retries, event hooks), the network panel is the source of truth, not the DOM. **MUST** capture `browser_network_requests` after every meaningful action and look for the URL patterns that prove the underlying mechanism is working. DOM state is necessary but not sufficient evidence for async correctness.

### 15.4 Instrument before navigation

When testing async behaviors that fire on mount, **MUST** install instrumentation BEFORE navigating to the page. WebSocket constructor hooks, fetch interceptors, performance observers, and similar patches must be in place when the page first mounts — not after. Instrumentation installed after the fact misses the very events you're trying to capture.

### 15.5 Edge cases are required

For every fix verified, **MUST** test at least one edge case: invalid IDs, expired tokens, missing data, empty lists, unauthorized personas, broken permissions. Happy-path verification is necessary but not sufficient. A fix that passes the happy path but crashes on the empty case has not been verified.

### 15.6 Persona discipline

When verifying authorization logic, **MUST** test with EVERY relevant persona: unauthenticated visitor, buyer, seller, admin. A "redirects to login when unauthenticated" test is incomplete without the corresponding "renders content when authenticated as the right role" test, and vice versa.

### 15.7 Cross-client real-time verification

To verify real-time delivery (WebSocket events, broadcast notifications, presence indicators), **SHOULD** use TWO clients: one to trigger the event, another to receive it. A single-client test cannot distinguish "the sender sees their own message via REST" from "the receiver got the event via socket". When two clients aren't feasible, network-layer evidence (socket.io polling fetches, websocket frames) is the next-best signal — never DOM-only.

### 15.8 MCP partition discipline

When running multiple testers in parallel via Playwright MCP, each tester **MUST** use ONE dedicated MCP instance (`playwright`, `playwright-2`, `playwright-3`, `playwright-4`, `playwright-5`) and **MUST NOT** call any other instance even on error. Cross-contamination between parallel testers corrupts results.

### 15.9 Always write the deliverable file

When the orchestrator asks for a markdown report at a specific path, **MUST** write that file using the Write tool. The "no other files" instruction in test prompts refers to source code modifications — it does NOT exclude the report deliverable. The orchestrator needs the file artifact for synthesis across the tester swarm.

### 15.10 Prod fixture source of truth

For live production E2E testing, the canonical test-account registry is `Planning/test-accounts.md` (gitignored — contains passwords, Auth0 user_ids, Prisma User.ids, ROPG scripts). Testers must use prod fixtures documented there, not local-dev `*@example.test` emails:

- **Prod BUYER**: `<test-account>` (g124, KYC VERIFIED)
- **Prod SELLER**: `<test-account>` (g91, KYC VERIFIED)
- **Prod ADMIN / SUPER_ADMIN**: unprovisioned — provision only when a wave is actually blocked on that persona (requires Auth0 CLI + Prisma SQL ritual per `Planning/test-accounts.md`)

`*@example.test` credentials only exist in the local dev seed (see CLAUDE.md §Test Users §Local dev). Using them against prod Auth0 will produce silent auth failures and a false BLOCKED outcome. If a tester prompt passes a `*@example.test` email for prod testing, flag it as a prompt bug and ask the orchestrator to reference `Planning/test-accounts.md` instead.

---

## 16. Production E2E Testing — Methodology

Concrete methodology that implements the principles in Section 15.

### 16.1 WebSocket / socket.io verification

To verify a socket.io connection is live in production:

```js
// Install BEFORE navigation
window.__wsCount = 0;
window.__wsUrls = [];
const OrigWS = window.WebSocket;
window.WebSocket = function(...args) {
  window.__wsCount++;
  window.__wsUrls.push(args[0]);
  return new OrigWS(...args);
};
window.WebSocket.prototype = OrigWS.prototype;

// Also intercept fetch to catch socket.io polling
window.__sioFetches = [];
const origFetch = window.fetch;
window.fetch = function(...args) {
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
  if (url && url.includes('socket.io')) window.__sioFetches.push(url);
  return origFetch.apply(this, args);
};
```

After navigation, check BOTH signals:
1. `window.__wsCount > 0` (WebSocket upgrade happened)
2. `window.__sioFetches.length > 0` OR `browser_network_requests` contains URLs matching `socket.io|EIO=|polling|websocket`

Either signal proves engine.io is active. **socket.io polling-only mode never calls `new WebSocket()`** — long-polling uses XHR — so `window.__wsCount === 0` alone does NOT prove the socket is broken. You **MUST** check the network panel too.

### 16.2 React synthetic event handler verification

**MUST NOT** check `el.onclick` or similar DOM event attributes to verify a button's onClick is wired — React synthetic handlers never appear as DOM properties. To verify a button's handler, click it via Playwright's click action and observe the resulting effect (network call, navigation, state change).

### 16.3 ES module imports vs window globals

`io` from `socket.io-client` (and similar ES module exports) is NOT a window global. `window.io === undefined` proves nothing about whether socket.io is loaded or working. **MUST** verify via the bundle (decompile chunks if needed), the network panel, or instrumented constructors — never via window globals for ES modules.

### 16.4 Status taxonomy for production audits

Use this exact set of status symbols when auditing routes for build/launch readiness. Each route gets exactly one symbol:

| Symbol | Meaning |
|---|---|
| ✅ | Live — page renders correctly with real content in production |
| 🟡 | Live but degraded — renders but missing data, broken interaction, or known minor issue |
| 🟠 | Coded but blocked — route exists in code but redirects/crashes/blank in production |
| ❌ | Not built — documented in flow but no matching route in code |
| 🚫 | Deferred — explicitly out of scope |

Token-gated routes (password reset, email verification, OAuth callback) that correctly render error states without their token are ✅, not 🟡 — they're behaving as designed.

### 16.5 Tester swarm pattern

For wave verification, use a **5-tester swarm**: 5 parallel `ui-comprehensive-tester` invocations, one per Playwright MCP instance, each owning a non-overlapping scenario. Partition by user account + browser process to avoid cross-contamination. Different testers can use the same account if they're in different MCP processes (isolated localStorage); same account in the same process is forbidden.

### 16.6 Deliverable format for prod testing

Test reports **MUST** include:
- Per-fix verdict: PASS / PARTIAL / FAIL with concrete evidence
- Network panel evidence for any WebSocket/API/async behavior tested
- Console error capture (filter level: error)
- Screenshots saved with consistent naming convention from the prompt
- Regression smoke pass results for prior fixes
- Markdown report at the explicit path provided in the prompt
- Browser closed at the end with `browser_close`

### 16.7 Anti-patterns — Do not test like these

#### Anti-pattern 6: Single-user real-time claim

```
WRONG: Tester logs in as one user, sends a message, sees the message appear,
       claims real-time messaging works.
WHY:   The sender sees their own message via REST/optimistic update regardless
       of socket state. Single-client tests cannot distinguish socket delivery
       from REST refetch.
RIGHT: Use two clients (sender + receiver) OR verify socket.io network frames.
```

#### Anti-pattern 7: Layout-only verification on unblocked routes

```
WRONG: Tester navigates to /admin, sees the layout render, marks it PASS.
WHY:   The dashboard inside might be crashing on a contract mismatch or
       reading from a wrong endpoint. Layout-only verification hides these.
RIGHT: Read actual stat values, count rows, sample entity data. Test beyond
       the layout guard.
```

#### Anti-pattern 8: `window.io === undefined` as broken-socket proof

```
WRONG: Tester checks window.io, sees undefined, claims socket.io is broken.
WHY:   io is an ES module import, not a window global. window.io is ALWAYS
       undefined regardless of whether socket.io is loaded.
RIGHT: Instrument the WebSocket constructor + check browser_network_requests
       for socket.io URL pattern.
```

#### Anti-pattern 9: `el.onclick === null` as missing-handler proof

```
WRONG: Tester checks button.onclick, sees null, claims React handler is missing.
WHY:   React synthetic event handlers don't appear as DOM properties. The check
       is meaningless for any React-rendered UI.
RIGHT: Click the element via Playwright and observe whether the expected
       effect happens (network call, navigation, state change).
```

#### Anti-pattern 10: Skipping the deliverable report file

```
WRONG: Tester completes the test session and returns findings inline only,
       ignoring the prompt's request to write a markdown report at a specific
       path.
WHY:   When 5 testers run in parallel, the orchestrator needs the file
       artifacts to synthesize across the swarm. Inline output is lost.
RIGHT: ALWAYS write the markdown report at the explicit path. The "no other
       files" instruction refers to source code modifications, NOT to the
       report deliverable.
```

---

## Quick Reference — Non-Negotiable Rules

### Code-level testing (Sections 0-13)
1. **MUST** co-locate test files next to source files.
2. **MUST** use AAA (Arrange/Act/Assert) with comments in every test body.
3. **MUST** mock PrismaService in unit tests. **MUST NOT** import AppModule.
4. **MUST** query Web components by role, label, or text — not by testId.
5. **MUST** write at minimum one happy-path and one error-path per new method.
6. **MUST** run `pnpm test` and confirm passing before committing.
7. **MUST** append to Section 14 using the exact template if a new rule is discovered.
8. **MUST NOT** edit existing Section 14 entries or reorder any section.
9. **MUST** test RBAC on every role-guarded endpoint.
10. **MUST** test that User A cannot access User B's resources (IDOR prevention).

### Production E2E testing (Sections 15-16)
11. **MUST** read this entire file (especially Sections 15-16) AND `command-center/artifacts/user-journey-map.md` before any UI/UX or functional test on production.
12. **MUST** test the actual content (stat values, row counts, entity fields) — never accept layout-only verification.
13. **MUST** install async instrumentation (WebSocket constructor hooks, fetch interceptors) BEFORE navigating to the page that triggers them.
14. **MUST** verify async behaviors via the network panel, not via DOM observation alone.
15. **MUST** test at least one edge case (invalid IDs, expired tokens, missing data) per fix verified.
16. **MUST** use ONE dedicated Playwright MCP instance per parallel tester — never call other instances.
17. **MUST** write the report file at the explicit path provided in the prompt.
18. **MUST NOT** check `window.io === undefined` to verify socket.io state — io is an ES module import.
19. **MUST NOT** check `el.onclick === null` to verify React handlers — React synthetic events don't appear as DOM properties.
20. **SHOULD** use cross-client verification for real-time behaviors when feasible; otherwise rely on network-layer evidence.
