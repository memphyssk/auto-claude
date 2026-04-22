# Mode Switching

Three modes, one flag file, simple transitions.

## The modes

| Mode | Flag file state | Behavior |
|---|---|---|
| **founder-review** (default) | Absent | Every user-ask goes to founder. Baseline. |
| **semi-assisted** | Present with `mode: semi-assisted` | Skips Dx preview + Stage 1b checkpoint + other nice-to-haves. Strategic / hard-stops still to founder. See `semi-assisted-mode.md`. |
| **full-autonomy** | Present with `mode: full-autonomy` | BOARD (7 members) handles all non-hard-stop escalations. Morning digest for founder audit. See `full-autonomy-mode.md`. |

## Flag file

`Planning/.autonomous-session` — gitignored, session-scoped.

```yaml
started_at: <ISO-timestamp>
mode: semi-assisted | full-autonomy
reason: <one-line quote of user's phrasing>
expires_on: user-says-stop | orchestrator-finishes-all-work
```

When absent → **founder-review** by default.

## Trigger phrases

### Activate semi-assisted
- "run overnight" / "work autonomously" / "run autonomous"
- "I'm going to sleep" / "see you in the morning"
- "keep going until done" / "finish all remaining"
- "don't stop to ask" / "don't wake me up"

### Activate full-autonomy
- "full autonomy" / "go completely autonomous" / "board mode"
- "unconditional loop" / "don't stop for anything"

### Return to founder-review
- "I'm back" / "I'm awake"
- "pause" / "let's discuss" / "stop running"
- "exit autonomous mode" / "stop the autonomous run"

### Switch between modes mid-run
- "switch to semi-assisted" / "turn off BOARD"
- "switch to full-autonomy" / "turn on BOARD"

## Transitions

| From | To | Action |
|---|---|---|
| founder-review | semi-assisted | Create flag file with `mode: semi-assisted` |
| founder-review | full-autonomy | Create flag file with `mode: full-autonomy` |
| semi-assisted | full-autonomy | Update flag file `mode:` field |
| full-autonomy | semi-assisted | Update flag file `mode:` field |
| any | founder-review | Delete flag file |

Orchestrator confirms every transition in one line.

## Checking the mode (every stage)

```bash
if [ -f Planning/.autonomous-session ]; then
  MODE=$(grep '^mode:' Planning/.autonomous-session | awk '{print $2}')
else
  MODE=founder-review
fi
```

Stages that route escalations read `$MODE` and branch accordingly (see each stage file for the per-stage branch).

## Precedence

1. Flag file wins over wave plan front-matter. Wave plans DO NOT declare `autonomous_mode` (deprecated field).
2. Hard-stops always prompt regardless of mode (destructive actions, money commitments). See `board.md` § Hard-stops.
3. Critical errors still surface (post-BOARD-escalation if in full-autonomy).
4. User message any time → orchestrator responds immediately regardless of mode.

## gitignore

```
Planning/.autonomous-session
```

Session state never belongs in git history.
