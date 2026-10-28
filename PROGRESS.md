# PROGRESS

## Done

- Branch `feat/polaroid-m0-ci` is cut from `origin/main`.
- `.github/workflows/pr-ci.yml` runs on `pull_request` to `main` and on `workflow_dispatch`. It does not run on `push`.
- Job `check` installs, generates the Prisma client, lints, typechecks web and api, builds Velite, builds the web app, and runs size-limit.
- Job `lighthouse` installs, generates the client, builds, and runs `lhci autorun` with `aggregationMethod` `median`.
- `pretypecheck` and `prebuild` run `prisma generate`. A clean checkout needs that before `tsc` or `next build`.
- Draft PR is https://github.com/haunguyendev/portfolio-v2/pull/19.
- Perf gate is **report-only** until M2: workflow env `PERF_GATE_BLOCKING: "false"` and `continue-on-error` on the size and Lighthouse steps. Lint, typecheck, and build stay blocking. Thresholds are unchanged (130000 B gzip, perf 0.9, LCP 2500 ms, TBT 200 ms, CLS 0.05, a11y 0.95, median of 3).
- Report-only CI on `23f9ab1`: https://github.com/haunguyendev/portfolio-v2/actions/runs/40645955665 — `check` and `lighthouse` pass; size 271980 bytes; median LCP 3059 ms on `/`, 3172 ms on `/projects`; `/projects` accessibility 0.94.
- Last **blocking** CI reference (run https://github.com/haunguyendev/portfolio-v2/actions/runs/40644338147 on `8f6c622`): size 271980 bytes; median LCP 3598 ms on `/`, 3261 ms on `/projects`; `/projects` accessibility 0.94.

## Not done

- Homepage and `/projects` still miss Lighthouse budgets at the configured thresholds. M2 rewrites the homepage and can set `PERF_GATE_BLOCKING` back to `"true"`.
- Initial JS on `/` is still 271980 gzip bytes against a 130000 byte limit.

## Next step

Leave the pull request as a draft. Do not merge it. Merging deploys production. M2 sets `PERF_GATE_BLOCKING` to `"true"` after homepage work meets the budgets.

## Open questions

- Should M2 treat the hero photo as the LCP problem, or the 272 KB of initial JavaScript, or both? On the slowest local homepage run, image load time was 87% of a 4374 ms LCP. The median LCP after that was still about 3468 ms.
- `/projects` accessibility is 0.94 on every run. The failing audits are `color-contrast` and `heading-order`. Fixing them is UI work, so it is out of scope here.
