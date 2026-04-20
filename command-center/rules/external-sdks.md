# External SDKs & Tools — Rules

Pre-build checklist + SDK registry for tasks touching external SDKs, APIs, or third-party tools.

---

## Section 1: General Rules

### When this fires

This process triggers at **Stage 2 (Plan)** whenever a task involves integrating, upgrading, or significantly interacting with an external SDK or third-party service. The orchestrator checks the task description for SDK/tool names and triggers the research process before the plan is written.

### The research process

**Step 1: Check the SDK registry (Section 3 below)**
Does `SDK-Docs/<SDK-Name>/` already exist? If yes, read it. If the "Last verified" date is recent and the installed version matches, skip to Step 4. If stale or missing, proceed to Step 2.

**Step 2: Spawn a research agent**
Spawn a `research-analyst` agent with the following instructions:
- Go to the SDK's official website and documentation (use WebFetch / WebSearch)
- Read the official getting-started guide, API reference, and migration guides for the target version
- Explore the SDK's GitHub repository: README, CHANGELOG, open issues tagged with our stack (Next.js, NestJS, Netlify, Railway)
- Search for known issues, community solutions, and platform-specific gotchas
- Read example implementations from the official docs — not blog posts, not Stack Overflow
- This is EXTERNAL research from the SDK author's world, not from our codebase

**Step 3: Write the SDK doc**
Output to `SDK-Docs/<SDK-Name>/<sdk-name>.md` using the template in Section 2. This file captures the SDK's official API surface, patterns, and constraints from the author's perspective.

**Step 4: Link to the task**
Add `SDK Reference: SDK-Docs/<SDK-Name>/<sdk-name>.md` to the TaskMaster task details. Implementer agents will read this file before writing code at Stage 4.

**Step 5: Enrich after implementation (Stage 8)**
At wave closeout, implementers ADD an "Integration-Specific Findings" section to the SDK doc with:
- What we learned during our integration (platform quirks, adapter patterns, env var gotchas)
- What differed from the official docs
- What broke and how we fixed it
These findings accumulate over time, making the SDK doc increasingly valuable for future tasks.

### Auto-linking at planning time

When writing or describing ANY task in TaskMaster (Stage 2 or Stage 11), scan the task description for SDK/tool names. If a matching `SDK-Docs/<Name>/` file exists, attach it to the task details:
```
SDK Reference: SDK-Docs/<SDK-Name>/<sdk-name>.md
```
This ensures every developer working on the task has the research at hand without re-discovering known gotchas.

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
