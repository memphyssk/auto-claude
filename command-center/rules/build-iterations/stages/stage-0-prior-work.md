# Stage 0 — Prior-Work Query

## Purpose
Avoid re-doing work that was already done in a prior wave. One search call can save an entire Explore pass or prod crawl.

## Prerequisites
- Wave topic identified (what are we building/fixing?)

## Actions
1. Query `mcp__mcp-search` (claude-mem) semantically for prior work on the wave topic
2. If prior wave output covers the same surface and is still current: cite it in the plan, reduce Stage 3 scope to the delta
3. If nothing relevant: proceed to Stage 1 as normal

## Deliverable
None — this stage informs Stage 1 (reframing) and Stage 2 (plan), not produces its own artifact.

## Exit criteria
- Semantic search completed (or skipped if mcp-search unavailable)
- Prior work noted for Stage 1 reframing and Stage 2 plan

## Next
→ Return to `../wave-loop.md` → Stage 0b (if applicable) or Stage 1
