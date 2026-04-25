# Claudomat Landing — UI kit

Recreates the live Claudomat landing page as composable JSX components.

The landing is a single long page divided into 5 sections:

- **Hero** — terminal session, hero phrase, transmit-intent prompt
- **§01 · Manifesto** — large typographic statement with annotations
- **§02 · System stack** — what the operating system runs (panels grid)
- **§03 · Pipeline** — IDEATE → FRAME → SPEC → PLAN → BUILD → OPERATE
- **§04 · Operating log** — terminal-window dialogue with scroll-revealed bubbles
- **§05 · CTA** — TRANSMIT INTENT signup panel

## Files

- `index.html` — interactive landing page
- All component logic lives in `../../w7-landing.jsx` (loaded by index)
- Shared chrome (`MuthurHeader`, `LED`, `Cursor`, `Marquee`, `LoadBar`) lives in `../../crt-shared.jsx`

## Notes

- Loads `crt.css` + `colors_and_type.css` from project root.
- The terminal dialogue in §04 is scroll-driven (each bubble independently observes its own visibility).
- No icon library — only Unicode glyphs (`▸ ◆ § /// · ┌─┐`).
