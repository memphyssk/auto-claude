# External SDKs & Tools — Rules

Pre-build checklist + SDK registry for tasks touching external SDKs, APIs, or third-party tools.

---

## Section 1: General Rules

Fires at **Stage 2 (Plan)** whenever a task integrates, upgrades, or significantly interacts with an external SDK or third-party service. Orchestrator scans the task description for SDK/tool names and runs the research process before the plan.

### The research process

1. **Check the SDK registry (§3).** If `SDK-Docs/<SDK-Name>/` exists with recent "Last verified" date and matching installed version → skip to Step 4. Otherwise continue.
2. **Spawn `research-analyst`** to read the SDK's official docs + GitHub (README, CHANGELOG, issues tagged with our stack: Next.js / NestJS / Netlify / Railway) + migration guides for the target version + platform-specific gotchas. External research from the SDK author's world — never blog posts or Stack Overflow.
3. **Write the SDK doc** to `SDK-Docs/<SDK-Name>/<sdk-name>.md` using the template in §2.
4. **Link to the task.** Add `SDK Reference: SDK-Docs/<SDK-Name>/<sdk-name>.md` to TaskMaster task details. Implementers read it at Stage 4.
5. **Enrich after implementation (Stage 8).** Add an "Integration-Specific Findings" section with platform quirks, adapter patterns, env var gotchas, what differed from official docs, bugs we hit + fixes. These findings compound across waves.

### Auto-linking

When writing ANY task in TaskMaster (Stage 2 or 11), scan the description for SDK/tool names. If a matching `SDK-Docs/<Name>/` file exists, attach `SDK Reference: SDK-Docs/<SDK-Name>/<sdk-name>.md` to the task details. Ensures implementers have research at hand without re-discovering known gotchas.

---

## Section 2: SDK Doc Template

Every SDK doc file at `SDK-Docs/<Name>/<name>.md` must follow this structure:

```markdown
# <SDK Name> Reference

**Last verified:** YYYY-MM-DD
**Official docs:** <URL to official documentation for the installed version>
**GitHub:** <URL to SDK repository>
**Installed version:** X.Y.Z
**Install location:** packages/<pkg>

---

## Official API Surface
(from external research — what the SDK provides)

### Public classes / functions
### Constructor options
### Methods with signatures
### Env var map (what the SDK reads from process.env)

## Platform Compatibility
(verified against our deployment targets)

### Netlify (Edge / Lambda)
### Railway
### Next.js (Middleware / Route Handlers / Server Components)

## Known Gotchas
(from official docs, GitHub issues, community — NOT our integration)

## Documentation Links
(version-specific links for future reference)
- Getting Started: <URL>
- API Reference: <URL>
- Migration Guide: <URL> (if applicable)
- GitHub Issues: <URL filtered to relevant tags>

---

## Integration-Specific Findings
(added during/after implementation — what WE learned)

### Our adapter patterns
### Env var configuration on our platforms
### Bugs we hit and how we solved them
### What differed from the official docs
```

---

## Section 3: SDK Registry

| SDK | SDK Doc | Official Docs | Version |
|-----|---------|--------------|---------|
| @auth0/nextjs-auth0 | `SDK-Docs/Auth0/auth0-sdk.md` | [auth0.github.io/nextjs-auth0](https://auth0.github.io/nextjs-auth0/) | v4.17.0 |
| express-oauth2-jwt-bearer | `SDK-Docs/Auth0/auth0-sdk.md` | [auth0.github.io/node-oauth2-jwt-bearer](https://auth0.github.io/node-oauth2-jwt-bearer/) | v1.8.0 |
| Auth0 Management API | `SDK-Docs/Auth0/auth0-sdk.md` | [auth0.com/docs/api/management/v2](https://auth0.com/docs/api/management/v2) | CLI v1.28.0 |
| @netlify/plugin-nextjs | `SDK-Docs/Netlify/netlify-sdk.md` | [docs.netlify.com/frameworks/next-js](https://docs.netlify.com/frameworks/next-js/) | v5.15.9 |
| Prisma | `SDK-Docs/Prisma/prisma-sdk.md` | [prisma.io/docs](https://www.prisma.io/docs/) | v5.22.0 |
| Railway | `SDK-Docs/Railway/railway-sdk.md` | [docs.railway.com](https://docs.railway.com/) | MCP |
| Dynadot DNS | `SDK-Docs/Dynadot/dynadot-sdk.md` | [dynadot.com/developer](https://www.dynadot.com/developer/) | MCP |
| @talkjs/react | `SDK-Docs/TalkJS/talkjs-sdk.md` | [talkjs.com/docs](https://talkjs.com/docs/) | v0.1.12 |

---

## When to update this file
- When adding a new SDK to the project → create SDK doc + add to registry
- When an SDK doc is created or updated → update the registry version + date
- When changing the research process → update Section 1
