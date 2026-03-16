# Code Review: Project Metadata Feature

**Date:** 2026-03-16
**Reviewer:** code-reviewer
**Scope:** 3 files, ~40 LOC added
**Focus:** Additive feature — role, teamSize, impact fields on project cards

---

## Overall Assessment

**PASS** -- Clean, well-structured additive change. Type safety is correct, null guards are proper, and the implementation follows existing patterns consistently. One accessibility issue (medium) and one minor data concern.

---

## Files Reviewed

| File | LOC | Verdict |
|------|-----|---------|
| `src/types/project.ts` | 19 | Good |
| `src/content/projects.json` | 80 | Good (minor note) |
| `src/components/projects/project-card.tsx` | 99 | Good (1 a11y issue) |

---

## Type Safety

**No issues.** All three fields are `string | undefined` via optional markers. The component guards every access with `&&` checks. The outer wrapper uses `||` to skip rendering the entire metadata block when all three are absent. The `as Project[]` cast in `content.ts` remains compatible since the new fields are optional.

---

## Component Quality

**Well done.** The JSX follows the exact same patterns as the existing links section (line 70 uses the same `(x || y) &&` guard pattern). Inline flex layout with gap utilities is consistent with the tech badges section. Component stays under 100 lines.

---

## Medium Priority

### 1. Accessibility: Icons lack screen reader context

**File:** `src/components/projects/project-card.tsx` (lines 41, 47, 53)

The `<User>`, `<Users>`, and `<TrendingUp>` icons are decorative but carry semantic meaning (they distinguish role vs team size vs impact). Screen readers will skip them, leaving three unlabeled text spans that read as bare strings like "Solo" or "500+ active users" with no category context.

**Options (pick one):**

A. Add `aria-label` on each `<span>`:
```tsx
<span className="inline-flex items-center gap-1" aria-label={`Role: ${project.role}`}>
  <User className="size-3" aria-hidden="true" />
  {project.role}
</span>
```

B. Add `sr-only` label prefix:
```tsx
<span className="inline-flex items-center gap-1">
  <User className="size-3" aria-hidden="true" />
  <span className="sr-only">Role: </span>
  {project.role}
</span>
```

Option B is slightly better because it preserves the label even if CSS is stripped. Either way, add `aria-hidden="true"` to the icons explicitly (lucide-react does set this by default, but being explicit is safer).

---

## Low Priority

### 2. Data: Some impact values are descriptive rather than measurable

"Personal branding & job search" and "Real-time weather data visualization" describe what the project *does*, not its *impact*. This is a content quality nit, not a code issue. Consider rephrasing to outcomes:
- "Personal branding & job search" --> "Portfolio driving interview pipeline"
- "Real-time weather data visualization" --> e.g., "200+ monthly visits" or remove if no real metric

This is a judgment call for the author, not a blocking concern.

### 3. Potential: `teamSize` as a number type

`teamSize` is typed as `string` which allows "Solo", "3 members", etc. This is fine for display but makes filtering/sorting impossible if ever needed later. Since YAGNI applies, string is the right call for now. Noting for future awareness only.

---

## Positive Observations

- Optional fields chosen correctly -- no breaking change to existing data
- Guard pattern `(a || b || c) &&` prevents empty container rendering
- Component stays well under the 200-line limit (99 lines)
- Data stored in JSON, not hardcoded in JSX (follows project conventions)
- Icon sizing (`size-3`) is proportional to `text-xs` metadata text
- Consistent use of `text-muted-foreground` for secondary info hierarchy

---

## Recommended Actions

1. **(Medium)** Add `aria-label` or `sr-only` labels to metadata spans for screen reader users
2. **(Low)** Consider revising non-measurable impact strings to be outcome-oriented
3. No blocking issues -- safe to merge after addressing #1

---

## Metrics

- Type Coverage: 100% (all fields typed)
- Build: Passes (`tsc --noEmit` clean)
- Lint: N/A (no eslint config for `next lint`)
- Component Size: 99 lines (within 200-line limit)
- Downstream Consumers: 3 files import `Project` type -- all compatible (optional fields)

---

## Unresolved Questions

None.
