# Brainstorm: CI/CD Parallel + Conditional Build

## Problem
- Current pipeline: ~7 min (sequential web + api builds)
- 80% changes are frontend-only, but always rebuilds both images
- Wasted ~2-3 min per deploy on unchanged app

## Evaluated Approaches

### Option A: Parallel + Conditional (CHOSEN)
- Detect changes via `dorny/paths-filter`
- Build only changed app(s) in parallel jobs
- Smart deploy: only pull changed images
- **Impact:** ~3-4 min (web-only), ~2-3 min (api-only), ~3-4 min (both)
- **Complexity:** Moderate

### Option B: Parallel Only
- Always build both but in parallel
- **Impact:** ~3-4 min always
- Simpler but wastes CI minutes

### Option C: Cache Only
- Optimize Docker layer caching
- **Impact:** ~6 min (minimal improvement)

## Final Solution: Option A

### Architecture
```
Push to main
    ↓
[changes job] → dorny/paths-filter detects web/api/both
    ↓
[build-web job] ←→ [build-api job]  (parallel, conditional)
    ↓
[deploy job] → SSH, pull only changed images, restart
```

### Path Filters
| Filter | Paths | Triggers |
|--------|-------|----------|
| web | `apps/web/**`, `packages/**` | build-web |
| api | `apps/api/**`, `packages/**` | build-api |

### Deploy Logic
- If only web changed → `docker compose pull web && up -d web`
- If only api changed → `docker compose pull api && up -d api`
- If both changed → `docker compose pull web api && up -d`

### Edge Cases
- `packages/` change triggers both builds (shared code)
- `workflow_dispatch` should build both (manual override)
- Deploy job needs `if: always()` + check at least one build succeeded
- Skipped jobs have `result == 'skipped'`, not 'success'

### Implementation Considerations
- `dorny/paths-filter@v3` needs `actions/checkout` first
- Deploy step needs conditional pull commands based on `changes` outputs
- `if: always()` on deploy prevents skipping when one build is skipped
- Keep `cancel-in-progress: true` concurrency

### Risk Assessment
- **Low risk:** Path filter is well-tested action (20k+ stars)
- **Medium risk:** Deploy logic complexity — need to handle partial pulls correctly
- **Mitigation:** `workflow_dispatch` always builds both as fallback

### Success Criteria
- Frontend-only push: pipeline completes in < 5 min
- API-only push: pipeline completes in < 4 min
- Both changed: pipeline completes in < 5 min
- No false skips on shared package changes
