# Claudomat Design System

A retro-futurist CRT/terminal design language for **Claudomat** — an autonomous operating system for the one-person company. The visual identity is rooted in **1970s/80s mainframe-terminal aesthetics**: amber phosphor on black, scanlines, dot-matrix typography, ASCII box-drawing, and command-line vocabulary.

The design intentionally evokes the feeling of *talking to a serious machine that does serious work* — not a chatbot, not a copilot. Calm, dry, infrastructural.

---

## Source

This system was extracted from the Claudomat landing page design (see `Claudomat Landing v2.html` and supporting `w7-landing.jsx` / `crt-shared.jsx` / `crt.css`). It distills the visual language used there into reusable tokens, components, and screens.

---

## Index

- **`README.md`** — this file. Brand context, content fundamentals, visual foundations, iconography.
- **`colors_and_type.css`** — CSS variables: color palette, type scale, semantic tokens.
- **`crt.css`** — full component stylesheet (panels, frames, buttons, marquees, scanline overlay, etc).
- **`crt-shared.jsx`** — shared React components (`Cursor`, `LED`, `MuthurHeader`, `Marquee`, `LoadBar`, …).
- **`preview/`** — small HTML cards that populate the Design System tab. Type, colors, spacing, components.
- **`ui_kits/landing/`** — high-fidelity recreation of the Claudomat landing page as composable JSX components.
- **`SKILL.md`** — Agent Skills manifest; lets Claude Code use this system as a brand skill.

---

## Brand context

Claudomat is positioned as **an operating system for the one-person company**, not a chatbot or copilot. The product takes high-level intent from a single human operator and runs an entire small business — product, pricing, gtm, ops — autonomously, reporting back on a weekly cadence.

The brand voice borrows from **science-fiction control rooms** (Nostromo's MU/TH/UR, mainframe consoles, flight recorders, classified-document covers) but is tuned to feel infrastructural rather than cinematic. The terminal isn't a costume — it's a claim about what the product *is*: serious tooling for serious operators.

**Avoid** in this brand: any direct reference to the *Alien*/Nostromo IP (we cannot say "MU/TH/UR" or use that specific logotype); chatbot tropes (speech bubbles with avatars, "Hi! How can I help?"); SaaS-y purple/teal gradients; rounded-everything; emoji.

---

## Content fundamentals

### Voice
- **Lowercase by default** in dialogue, body copy, and inline UI text. Reserve UPPERCASE for headlines, labels, system chrome, and machine-printed elements.
- **Dry, terse, infrastructural.** No exclamation marks. No marketing adjectives ("powerful", "seamless", "delightful"). Sentences are short. Verbs lead.
- **Operator ↔ system register.** Two voices coexist:
  - *Operator (you)*: clipped, conversational, lowercase. *"send."* / *"C. ship it monday."* / *"don't break the existing users."*
  - *System (claudomat)*: factual, structured, uses ASCII tables and bullet lists. *"your gut checks out. signal across 4 sources:"* / *"noted. drafting now."*
- **Confidence over cheerleading.** The system never apologises, never hedges with "maybe," never asks "is that okay?" It reports, it owns, it acks.

### Casing
- Headlines: ALL-CAPS, period-terminated. **`THE OPERATING SYSTEM.`** / **`A DAY IN THE LIFE.`**
- Section markers: `§04 · OPERATING LOG`, `/// weekly digest · auto`, `▸ NODE: CLAUDOMAT.DEV`
- Labels and chips: ALL-CAPS, wide letter-spacing (`0.1em`–`0.12em`).
- Body / dialogue / annotations: lowercase.

### Punctuation & glyphs
- The interpunct **`·`** is the standard separator: `OPERATING SYSTEM · CLAUDOMAT.DEV`, `MON · 08:00`.
- Triple-slash **`///`** marks system meta-commentary: `/// weekly digest · auto`.
- Right-pointing triangle **`▸`** introduces list items, options, and CTAs: `▸ TRANSMIT INTENT`.
- Filled diamond **`◆`** marks system identifiers and signatures: `◆ CLAUDOMAT`.
- Inline comments start with **`//`**: `// signed, operator`.
- Em-dashes are fine; emoji are not.

### Examples
| Bad | Good |
|---|---|
| Welcome to Claudomat! 🚀 | `THE OPERATING SYSTEM.` |
| Our powerful AI helps you... | `intent in. company out.` |
| Get started for free → | `▸ TRANSMIT INTENT` |
| Hi! How can I help? | `/// weekly digest · auto` |
| Done! ✅ | `noted.` |

---

## Visual foundations

### Color
- **Background is near-black, never pure black.** `#0a0807` is the canvas. `#110d0a` and `#1a1410` are slightly warmer fills for panels.
- **Amber phosphor** (`#ff7a2a`) is the single accent. Everything else is a tint or a desaturation of it. There is no secondary brand color.
- **Text is warm cream** (`#e8c8a0`), dimmed in two steps for hierarchy: `#8a6a4a` (dim), `#5a4530` (faint).
- **Two semantic colors only**: `#b8d97a` (ok / signal-good), `#d44a1c` (warn / alert). Used sparingly — a single LED or chip per panel.
- Lines and dividers use `rgba(255, 122, 42, 0.22)` (solid) and `rgba(255, 122, 42, 0.10)` (faint). Never pure white or pure orange — always tinted-translucent.

### Type
- **Body / UI**: `IBM Plex Mono` (300–700). The everywhere font.
- **Display headlines**: `VT323` — a dot-matrix terminal face. Used at very large sizes (40–180px) for hero phrases.
- **Optional decorative**: `Major Mono Display` for one-off industrial typography.
- Sans-serifs and serifs do not appear. Mono is the brand.
- Letter-spacing: tight on display (`0.01em`), wide on UPPERCASE labels (`0.1em`–`0.12em`).
- Line-height: `1.5` for body, `0.85`–`1.0` for display headlines (intentionally tight).

### Backgrounds & overlays
- Every full-screen surface uses **four stacked overlays**:
  1. Base color (`#0a0807`).
  2. **Scanlines** — repeating 2px-on / 1px-off horizontal lines at ~18% opacity, `multiply` blend.
  3. **CRT vignette** — radial gradient darkening the corners.
  4. **Subtle flicker** — 6s opacity animation, 4–8% delta.
  5. **SVG noise grain** at 4% opacity, `screen` blend.
- Panels and frames use `rgba(255,122,42,0.02)` to `0.06` fills — barely-there amber wash.

### Layout & geometry
- **No rounded corners.** Everything is sharp 1px hairlines. The single exception is the LED dot.
- **Frames have visible corner brackets** (`.crt-frame-corners`) — small L-shaped cuts at top-left and bottom-right, evoking blueprint sheets.
- Dashed dividers (`1px dashed`) for soft separation; solid for hard separation; double rules for hero borders.
- Layouts favor a strong horizontal rhythm: a chrome bar at the top (designation · node · timecode · LEDs), section markers like `§04 · OPERATING LOG` flanking each block.
- ASCII box-drawing (`┌─┐ │ └─┘`) is encouraged for tables, pipelines, and diagrams. Not a fallback — a feature.

### Borders & shadows
- **Borders are 1px, single-color, often dashed.** No multi-stop borders.
- **Shadows are glow, not depth.** Text and key elements use `text-shadow: 0 0 1px currentColor, 0 0 8px var(--crt-amber-faint)` — phosphor bloom, not drop shadow.
- Strong glow (`0 0 14px rgba(255,122,42,0.5)`) reserved for hero headlines and active LEDs.
- Box-shadows, where they appear, are inset radial darkness (vignette) — never outset card-style.

### Animation
- **All animations are subtle, mechanical, and looped.** No bouncy easing. No springs.
- Cursor blink: `1s step-end infinite` (hard on/off, no fade).
- Marquee tape: `60s linear infinite` left-scroll.
- Flicker: 6s opacity dip, 50ms duration, twice per cycle. Imperceptible most of the time.
- Scroll-triggered reveals: `opacity 0→1` + `translateY(14px → 0)` over 600ms, ease-out. One-shot via `IntersectionObserver`.
- Hover glitch: 4-step `transform: translate(±1px)` shake over 250ms.

### Hover & press states
- Buttons: invert colors on hover (border-color background, bg-color text) and add a soft amber glow box-shadow. No scale, no translate.
- Links / interactive text: underline becomes solid; color shifts from `dim` to `amber`.
- LEDs blink at 1.6s; system status LEDs at 1s.

### Density
- **Information-dense, but not cluttered.** Every panel earns its space with a small header (`◆ LABEL` + status LEDs), structured body, and footer line.
- Padding is modest (`8–14px` inside panels; `40–80px` for page sections at the 1280px wrap).
- Text sizes step in tight increments: 10 / 11 / 12 / 13 / 14 / 18 / 22 / 36 / 56 / 80 / clamp-to-viewport.

### Imagery
- **No photography. No illustration. No AI imagery.** The brand is purely typographic + ASCII + 1px line-art.
- Where a "diagram" is needed, draw it in inline SVG with `stroke: var(--crt-amber)`, `stroke-width: 0.6–2`, no fills, optional dashed strokes for feedback loops.
- Hatched patterns (`<pattern id="hatch">`) substitute for fills on machine-state regions.

---

## Iconography

**There is no icon set.** The brand uses a curated set of **Unicode glyphs** as its only iconography, rendered in the active type face. This is intentional — terminals don't have icons.

| Glyph | Meaning | Usage |
|---|---|---|
| `▸` | item / option / forward action | bullets, CTAs, breadcrumbs |
| `◆` | system entity / signature | header designation, signed-by lines |
| `§` | section marker | `§04 · OPERATING LOG` |
| `///` | system commentary | `/// weekly digest · auto` |
| `//` | inline annotation / comment | `// what would you build, if...` |
| `·` | separator | `MON · 08:00` |
| `┌─┐ │ └─┘` | ASCII box-drawing | pipelines, work-breakdowns |
| `▶ ▼` | disclosure / state | rare; prefer `▸` |

If a UI absolutely requires raster iconography (e.g. window-chrome traffic lights), use **flat circles with amber/red/green fills** drawn with simple `border-radius: 50%` divs. Never lift icons from icon fonts (Lucide, Heroicons, etc.) — they break the typographic discipline of the system.

Emoji are forbidden.

---

## Caveats

- **Fonts are pulled from Google Fonts** (`IBM Plex Mono`, `VT323`, `Major Mono Display`) at runtime via `@import`. For offline / production use, self-host the WOFF2 files. We have not bundled them.
- **No light mode.** The brand is dark-only by design. A light variant would require rethinking the entire phosphor metaphor.
- **No mobile pass.** The components scale down readably but layouts are tuned for ≥720px wide.
- **No icon library.** If your designs need icons beyond the Unicode set, surface that — we'll either expand the glyph table or add a minimal stroke-only SVG kit.
