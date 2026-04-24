# Mode Switching

Four modes, one flag file, simple transitions.

## Flag

File: `Planning/.autonomous-session` — gitignored, session-scoped.

```yaml
started_at: <ISO-timestamp>
mode: semi-assisted | full-autonomy | danger-builder
reason: <one-line quote of user's phrasing>
expires_on: user-says-stop | orchestrator-finishes-all-work
# danger-builder only:
charter: command-center/management/ceo-bound.md
digest_to: <value of CEO_DIGEST_EMAIL_TO env var>
```

When absent → **founder-review** by default.

## Entry conditions

| Mode | Trigger phrases |
|---|---|
| **semi-assisted** | "run overnight" / "work autonomously" / "run autonomous" / "I'm going to sleep" / "see you in the morning" / "keep going until done" / "finish all remaining" / "don't stop to ask" / "don't wake me up" |
| **full-autonomy** | "full autonomy" / "go completely autonomous" / "board mode" / "unconditional loop" / "don't stop for anything" |
| **danger-builder** | "danger builder" / "danger-builder mode" / "ship it mode" / "ceo mode" / "ceo-agent mode" / "run indefinitely" / "365 mode" / "full delegation" / "total autonomy" |
| **founder-review** (return) | "I'm back" / "I'm awake" / "pause" / "let's discuss" / "stop running" / "exit autonomous mode" / "stop the autonomous run" / "stop danger-builder" / "exit ceo mode" |
| **mid-run switch** | "switch to semi-assisted" / "turn off BOARD" / "switch to full-autonomy" / "turn on BOARD" / "switch to danger-builder" / "bring in ceo-agent" |

## Behavior

| Mode | Flag value | Behavior |
|---|---|---|
| **founder-review** | Absent | Every user-ask goes to founder. Baseline. |
| **semi-assisted** | `mode: semi-assisted` | Skips nice-to-have checkpoints. Strategic / hard-stops to founder. See `semi-assisted-mode.md`. |
| **full-autonomy** | `mode: full-autonomy` | BOARD (7 members) handles all non-hard-stop escalations. Morning digest for founder audit. See `full-autonomy-mode.md`. |
| **danger-builder** | `mode: danger-builder` | ceo-agent resolves BOARD splits, HARD-STOP vetoes, and all former-founder-asks within `ceo-bound.md` restrictions. Daily digest; loop runs indefinitely. See `danger-builder-mode.md`. |

## Transitions

| From | To | Action |
|---|---|---|
| founder-review | semi-assisted | Create flag file with `mode: semi-assisted` |
| founder-review | full-autonomy | Create flag file with `mode: full-autonomy` |
| founder-review | danger-builder | Verify prerequisites (see `danger-builder-mode.md` § 1); create flag file with `mode: danger-builder` |
| semi-assisted ↔ full-autonomy | | Update flag file `mode:` field |
| full-autonomy → danger-builder | | Verify prerequisites; update flag file `mode:` field |
| danger-builder → anything | | Update flag file `mode:` field; deliver final digest |
| any | founder-review | Delete flag file (or flip `mode:` field; for danger-builder, also deliver final digest) |

Orchestrator confirms every transition in one line.

## Checking the mode (every stage)

```bash
if [ -f Planning/.autonomous-session ]; then
  MODE=$(grep '^mode:' Planning/.autonomous-session | awk '{print $2}')
else
  MODE=founder-review
fi
```

## Anti-patterns

### 1. Do not use wave-plan front-matter to set mode.
Why: Flag file wins; `autonomous_mode` is a deprecated field in wave plans.

### 2. Do not bypass hard-stops regardless of mode.
Why: Destructive actions and money commitments always prompt — mode flags do not override safety gates.

### 3. Do not suppress user messages mid-run.
Why: A founder message at any time causes immediate response regardless of mode or STATUS.

## Exit conditions

- **semi-assisted / full-autonomy:** delete flag file or flip `mode:` field.
- **danger-builder:** flip `mode:` field, deliver final digest, do NOT call ScheduleWakeup.
- **gitignore:** `Planning/.autonomous-session` — session state never belongs in git history.
