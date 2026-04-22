# /command-center/management/

Orchestration-control layer. Defines how the orchestrator behaves under each autonomy mode, how the BOARD substitutes for the founder under full-autonomy, and how mode switching works.

Loaded via CLAUDE.md trigger table — one always-on rule respects the active mode flag.

## Contents

| File | Purpose |
|---|---|
| `board.md` | BOARD concept, hard-stops, output format, audit surface |
| `board-members.md` | 5 BOARD members with agent mapping, lens, reading list |
| `full-autonomy-mode.md` | Behavior under `mode: full-autonomy` — BOARD routes former user-asks |
| `semi-assisted-mode.md` | Behavior under `mode: semi-assisted` — 3-tier autonomy + session skips |
| `mode-switching.md` | Flag file spec (`Planning/.autonomous-session`) + transitions + trigger phrases |
| `conflict-resolution.md` | Voting rules, tie-break, hard-stop veto, retro feedback loop |

## Default mode

No flag present → **founder-review** (every user-ask goes to founder). This is the baseline behavior.

## Flag file

`Planning/.autonomous-session` — gitignored. Format:

```yaml
started_at: <ISO-timestamp>
mode: semi-assisted | full-autonomy
reason: <one-line quote of user's phrasing>
expires_on: user-says-stop | orchestrator-finishes-all-work
```
