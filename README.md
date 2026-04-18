# Auto Claude OS

**An operating system for running LLM coding agents on real product work.**

A battle-tested framework that turns agentic coding from "vibes" into a repeatable, auditable process. Built around a 17-stage wave loop, a mandatory two-reviewer gate, dual-document sub-agent memory, and a canonical backlog pattern — all of it documented with copy-pasteable templates.

---

## Why this exists

LLM coding agents fail in predictable ways:

- **Hallucinated facts.** *"I'll update `src/auth/guards.ts` line 47"* — the file doesn't exist, or line 47 is something else entirely.
- **Right code, wrong problem.** The agent solves the visible symptom while the root cause ships untouched.
- **Memory cliff.** Each session starts fresh. Lessons from the last wave are forgotten by the next.
- **Silent drift.** The plan said X, the spec requires Y, the shipped code does Z — and nobody noticed.
- **Workarounds become features.** *"We couldn't fix X, so we added a toggle."* The toggle stays forever.
- **Deploy races.** Tests run against stale code. False passes. The bug is still live.

Product Loop OS fixes these by construction. It's not a library you install — it's a way of structuring how you and your agents work together, documented exhaustively so another Claude instance can recreate the entire setup from scratch.

---

## What's in this repo

Two files, designed to be read in this order:

| File | Purpose | When to read |
|---|---|---|
| **`How-to-Build-Product-Loops.md`** | The conceptual guide. Explains the architecture, the patterns, and the rationale behind every rule. ~10,000 words across 18 sections including a full template library. | First — to understand what you're building and why. |
| **`Setup-Instructions.md`** | The runbook. A commanding, imperative guide another Claude instance can follow end-to-end to install every MCP, CLI, skill, folder, and file. ~5,000 words across 15 sections. | Second — when you're ready to actually stand up the system. |

Read the guide first to decide whether this suits you. Then run the setup instructions to deploy it.

---

## Core ideas at a glance

### The 17-stage wave loop

Every unit of work is a "wave." Every wave moves through the same sequence, no shortcuts, no exceptions:

```
0   Prior-work query         ──  What have we already tried?
0b  Product decisions        ──  (conditional) Tier 3 questions resolved?
1   Problem reframing        ──  Symptom vs cause; antipatterns red-team
2   Plan                     ──  File-level change list; sub-agent partitioning
3   Gate                     ──  Two reviewers + conditional cross-model
4   Execute                  ──  Sub-agents implement in parallel
4b  Post-build review        ──  Catch contract mismatches before push
5   Deploy                   ──  Ship to staging or prod-per-flag
5b  Post-deploy QA           ──  Smoke test the deploy
6   Test swarm               ──  Persona-based E2E testing
6b  Layout verification      ──  (conditional) Visual consistency
7   Reality check            ──  Did the workflow ACTUALLY work?
7b  Triage                   ──  Opportunistic findings bucketed
8   Closeout                 ──  Shipped, housekeeping, defects-to-correct
9   Observations retro       ──  Orchestrator-only behavioral notes
10  Instruction distillation ──  Promote patterns into agent prompts
11  Next task                ──  Pick from the backlog
```

### The two-reviewer gate (non-negotiable)

Before a single line of code is written at Stage 4, the plan must pass two reviewers with **deliberately different blind spots**:

- **Hallucination Gate** (*Karen archetype*) — spot-checks load-bearing claims against the actual filesystem. Catches: invented file paths, made-up helpers, scope creep, stale assumptions.
- **Spec Gate** (*Jenny archetype*) — cross-references three sources of truth: master spec, current wave plan, implementer claims. Catches: drift, contract mismatches, coverage gaps.

For security-critical scope, a third **Cross-Model Gate** (Gemini or alt-family adversary) runs in parallel. The pair catches product-scope errors; the third gate catches family-specific training blind spots.

### Dual-document sub-agent memory

Each sub-agent has two files — and they're strictly separated:

- **`Sub-agent Instructions/<agent>.md`** — what the agent is told on spawn. Positive directives only. **Injected into the prompt.**
- **`Sub-agent Observations/<agent>.md`** — behavioral patterns the orchestrator observes. **Orchestrator-only. Never injected.**

At Stage 9, observations accumulate. At Stage 10, a capped number (3 per agent per wave) get distilled into instructions. This is the Knowledge Loop — the mechanism that lets each wave teach the system something without polluting the next wave's prompts.

### Persistent brain vs ephemeral working dir

Two filesystems, with a hard rule about what goes where:

- **`command-center/`** — persistent brain. Version-controlled. Edits here require Stage 10 discipline.
- **`working/`** — ephemeral. Wave artifacts live and die here. Archived every ~20 waves.

The separation is load-bearing. Blurring it is how systems drift into un-auditable chaos.

### Canonical backlog, specs-embedded

A single backlog tool (TaskMaster in this setup). **Specs live inside the task description**, never in loose floating documents. One source of truth per task. No orphan specs. Every wave starts by pulling the top unblocked task.

---

## Quick start

**To study the system:**

1. Read `How-to-Build-Product-Loops.md` end-to-end. Skim §1–§3, deep-read §5 (the wave loop), §8 (sub-agents), §12 (antipatterns), §15 (meta-patterns).
2. Decide whether the cost of running this system outweighs the cost of the failure modes it prevents (see "Is this for me?" below).

**To deploy the system:**

1. Read `Setup-Instructions.md`.
2. Gather prerequisites (see §1 of the runbook).
3. Hand the runbook to Claude Code at the root of your new or existing project:
   > *"Execute `Setup-Instructions.md`. Stop at each verification checkpoint and report."*
4. Expect 60–90 minutes on first run.

---

## Is this for me?

### Strong fit

- You're running agentic coding seriously — multiple waves per week — and watching small failures compound into big ones.
- You're shipping production code that touches auth, payments, or anything else where "right code, wrong problem" costs money.
- You have (or want) a team where multiple people interact with the same codebase through agents.
- You want the system your agents operate under to be auditable: every decision traceable to a wave, every wave to a task, every task to a spec.
- 

---

## Requirements

The system is **built on Claude Code** but portable to any agentic-coding setup that supports:

- A coding agent with file tools and shell access
- MCP-style (or equivalent) tool servers
- Slash-command or skill primitives
- A backlog tool (we use TaskMaster AI)

For the reference stack documented in `Setup-Instructions.md`:

- macOS or Linux
- Node.js ≥18
- Claude Code CLI
- Anthropic API key
- Google Gemini API key (for Stage 3 cross-model gate; optional but recommended for security-critical work)
- GitHub CLI (`gh`), deploy CLI (Railway / Vercel / Fly), Playwright

Full list with install commands: see `Setup-Instructions.md` §1–§4.

---

## Repo structure (once deployed)

After running `Setup-Instructions.md` against a project, the project ends up with:

```
<your-project>/
├── CLAUDE.md                     ← orchestrator; trigger table + always-on rules
├── .claude/
│   └── commands/                 ← 18 project-local slash commands
├── command-center/               ← persistent brain (version-controlled)
│   ├── README.md
│   ├── rules/
│   │   ├── build-iterations/
│   │   │   ├── wave-loop.md
│   │   │   └── stages/           ← 17 stage files (stage-0 … stage-11)
│   │   ├── sub-agent-workflow.md
│   │   ├── decision-framework.md
│   │   ├── security-waves.md
│   │   ├── testing.md
│   │   ├── skill-use.md
│   │   ├── backlog-planning.md
│   │   ├── housekeeping.md
│   │   ├── external-sdks.md
│   │   └── dev-principles.md
│   ├── Sub-agent Instructions/   ← positive directives; INJECTED
│   ├── Sub-agent Observations/   ← behavioral patterns; ORCHESTRATOR-ONLY
│   └── SDK-Docs/
├── working/                      ← ephemeral wave artifacts (gitignored)
│   └── archive/                  ← rotated every ~20 waves
└── src/                          ← your actual product code
```

This repo itself contains only the two documentation files. The structure above is what those files teach you to build.

---

## Key patterns documented

The guide and runbook together cover:

- **Three nested loops:** Execution (stages 0–8), Knowledge (9–10), Backlog (continuous)
- **Ten named antipatterns** — symptom-as-problem, band-aid, solving-for-demo, default-flag, over-engineering, trusting-the-claim, wrong-layer, optimizing-for-PR, and more — each with a concrete smell test
- **Sub-agent partitioning** with zero file collisions
- **Contract drift detection** across three sources: backend service, shared type, frontend consumer
- **Iron Law:** no fixes without root cause
- **Deploy-race detection** at Stage 7 (compare service uptime vs merge timestamp)
- **Symbol references, not line numbers** — because line numbers rot the moment earlier code changes
- **End-user simulation discipline** for Playwright (no `page.goto` after entry, no `fetch` from test code)
- **Fast-fix same-wave** — when to fix now vs defer vs escalate
- **Spec-test binding** — every spec paragraph maps to at least one test
- **2-iteration gate** for high-stakes scope
- **3-tier product-decision autonomy** — auto / notify / must-ask

---

## FAQ

**Q: Can I run this without Claude Code?**
A: The patterns are tool-agnostic. The reference implementation in `Setup-Instructions.md` assumes Claude Code because that's what it was built on, but the wave loop, the gate pattern, and the dual-document memory translate to any agentic setup with tool access and sub-agent spawning.

**Q: Isn't 17 stages overkill?**
A: Often, yes — for small waves. The guide explicitly calls out skip conditions per stage. Start with the 5-stage minimum viable loop above; add stages as you hit the failure modes they prevent. Don't adopt the full 17 on day one.

**Q: What if Reviewers are wrong?**
A: They sometimes are. The orchestrator cross-references their warnings against hard evidence before treating them as blockers. Their process recommendations, however, are reliably correct — override them at your peril. The observations file for each archetype documents their known blind spots.

**Q: Do I need Gemini for the cross-model gate?**
A: Only for security-critical scope. For ordinary waves, the Hallucination + Spec gate pair is sufficient. Gemini (or another alt-family model) adds value specifically when training-set homogeneity is the risk — shared blind spots that two Claude instances wouldn't catch.

**Q: How do I know the system is working?**
A: Track wave cycle time, gate catch rate (how often a review returns BLOCK with substance), post-ship defect rate, and the honesty of closeouts. If closeouts stop listing "what went wrong," you've drifted — someone's optimizing for appearances.

**Q: Is this open to contributions?**
A: Yes. Specific patterns you've found valuable in your own adaptation, named antipatterns the catalog is missing, and worked examples are all welcome. Open an issue to discuss scope before large PRs.

---

## Origin

Extracted and abstracted from a production gaming marketplace where the wave loop has shipped many dozens of waves across auth migrations, payment integrations, multi-persona marketplace flows, and real-time features. Names of specific agents (Karen, Jenny) and specific wave IDs have been preserved in places as nods to the implementation; the system itself is deliberately generalized so it works on any product.

Two principles survive every rewrite:

1. **Persistent memory is separate from ephemeral work.** `command-center/` vs `working/` — never blur them.
2. **The Stage 3 gate is non-negotiable.** Two reviewers, different blind spots, every wave, no shortcuts.

Everything else is refinement.

---

## Feedback

This is a living system. If you adopt it, break it, improve it, or disagree with it — open an issue. Particularly valuable: failure modes you encountered that this framework didn't prevent, and patterns you invented to close those gaps.

---

## License

MIT. Use it, fork it, adapt it, teach it.
