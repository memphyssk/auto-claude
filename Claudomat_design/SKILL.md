---
name: claudomat-design
description: Use this skill to generate well-branded interfaces and assets for Claudomat — a retro-futurist CRT/terminal aesthetic for an autonomous one-person-company operating system. Contains color/type tokens, a component CSS layer, shared React components, ASCII/glyph iconography rules, and a UI-kit recreation of the landing page.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files (`colors_and_type.css`, `crt.css`, `crt-shared.jsx`, `preview/`, `ui_kits/landing/`).

Key rules to internalize before producing anything:

- Dark-only. Background is near-black (`#0a0807`), accent is a single amber (`#ff7a2a`). No secondary brand color.
- Mono-only typography. `IBM Plex Mono` for body / UI; `VT323` for display headlines (40–180px). No serifs, no system sans.
- Lowercase for body and dialogue. UPPERCASE for headlines, labels, system chrome.
- Iconography is Unicode glyphs only: `▸ ◆ § /// · ┌─┐`. No icon font, no emoji, no hand-drawn SVG icons.
- Borders are 1px hairlines (often dashed). No rounded corners except LED dots. Shadows are *glow*, not depth.
- Every full-screen surface gets the four-overlay treatment: scanlines, vignette, flicker, noise grain (see `crt.css`).

If creating visual artifacts (slides, mocks, throwaway prototypes), copy `crt.css` + `colors_and_type.css` + `crt-shared.jsx` out and produce static HTML files. The `ui_kits/landing/index.html` file is the canonical reference for what a finished surface looks like.

If working on production code, use `colors_and_type.css` as the token source. The component layer in `crt.css` is opinionated — adapt it rather than copy verbatim if you need a different framework.

If the user invokes this skill without other guidance, ask what they want to build, ask 3–5 focused clarifying questions (audience, surface, density, novelty vs. faithfulness to the existing system), then produce HTML artifacts or production code as appropriate.
