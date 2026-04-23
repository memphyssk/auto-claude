# Stage v0 — Input: Receive Service / Product Description Documents

## Purpose
Receive the founder-provided documents that describe the service/product being built. These are the raw material for every subsequent onboarding stage. No analysis happens here — just acquisition, validation, and storage.

## Prerequisites
- **Machine tooling installed.** `command-center/setup-tools/install.md` verification checklist (§ 8) passes. Skip this on machines where a prior auto-claude project has run successfully — tools are already in place.
- The repo scaffold from auto-claude exists (CLAUDE.md, command-center/, design/).
- `command-center/rules/onboarding/onboarding-loop.md` has been read.

## Actions

### 1. Solicit or receive docs

Prompt the founder via `AskUserQuestion` if no input documents have been provided in the conversation yet:

> "Please provide any existing product/service description documents. These can be:
> - A written product brief or spec
> - A deck / investor memo
> - A founding team's internal vision doc
> - Competitor analysis notes
> - Any target-market / persona research
> - A prior project's `FOUNDER-BETS.md` or equivalent
>
> Paste them in chat, link to Google Docs, or put files in `command-center/docs-input/`. I'll parse what you give me and only poll you for anything material that's missing."

If files are linked externally, orchestrator fetches and normalizes into `.md` or `.txt` locally.

### 2. Normalize and store

Write each received document to `command-center/docs-input/<kebab-case-title>.md`. Preserve the founder's original wording — do NOT paraphrase or summarize at this stage. v1 does the extraction.

If the founder pastes content into the conversation directly, capture verbatim into a single file: `command-center/docs-input/initial-brief.md` with a YAML front-matter block:

```yaml
---
source: founder-paste
received_at: <ISO-timestamp>
word_count: <number>
---
```

### 3. Quick sanity check

Confirm at least ONE of the following is present somewhere across the received docs:

- A one-line description of what the product does
- A named target user / market

If BOTH are absent, surface to the founder immediately with an `AskUserQuestion`:

> "The docs you provided don't contain a product description or target market. Before proceeding, give me at minimum:
> 1. One sentence — what does this product do?
> 2. One sentence — who is it for?"

Append the founder's answer to `initial-brief.md`.

### 4. Commit input snapshot (optional)

If the received docs are substantial (>5KB total) and could evolve during onboarding, snapshot them:

```bash
git add command-center/docs-input/
git commit -m "chore(onboarding): v0 — input docs received"
```

Optional because v11 handles the final initial commit — but snapshotting protects against accidental overwrites during longer onboarding runs.

## Deliverable

- `command-center/docs-input/*.md` — all received documents in their original form
- `command-center/docs-input/initial-brief.md` (if founder pasted content) with YAML front-matter

## Exit criteria

- At least one document in `command-center/docs-input/` with content length > 200 chars
- Both "what does it do" and "who is it for" are answerable from the content (either extracted or clarified via step 3)

## Next

→ Return to `../onboarding-loop.md` → Stage v1 (vision-and-gaps)
