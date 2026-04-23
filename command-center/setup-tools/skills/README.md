# setup-tools/skills

Claude Code skills that ship with auto-claude. These don't run from the
project repo — they must be installed into `~/.claude/skills/` on the
machine before Claude Code can invoke them.

## How to install

### Option 1 — symlink (recommended for auto-claude brain authors)

```bash
ln -s /path/to/auto-claude/command-center/setup-tools/skills/update-tools \
      ~/.claude/skills/update-tools
```

Updates to the skill propagate immediately on `auto-claude sync`.

### Option 2 — copy (for consumers who don't have the auto-claude repo checked out)

```bash
cp -r /path/to/command-center/setup-tools/skills/update-tools \
      ~/.claude/skills/update-tools
```

Changes require re-copy after `auto-claude sync` pulls upstream updates.

## Skills

| Skill | Purpose |
|---|---|
| [`update-tools/`](./update-tools/SKILL.md) | Verifies machine has all external dependencies from `../install.md`; prompts per item before fixing. Always asks before any change. Invoke via `/update-tools` after install. |

## Why skills ship via this directory instead of via install.md

`install.md` documents third-party skills (gstack, claude-mem plugin skills,
etc.) that live outside auto-claude. Skills in this `skills/` directory are
**auto-claude's own** skills — they ship with the brain and sync via
`auto-claude sync`. Keeping them in the brain repo means updates are
semver-tagged alongside brain content and pinned per project via
`.brain-version`.
