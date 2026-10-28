# PROGRESS

## Done

- Branch `feat/polaroid-m0-ci` is cut from `origin/main`.
- `.github/workflows/pr-ci.yml` runs on `pull_request` to `main` and on `workflow_dispatch`. It does not run on `push`.
- Job `check` installs, generates the Prisma client, lints, typechecks web and api, runs the size selection test, builds Velite, builds the web app, and runs size-limit.
- Job `lighthouse` installs, generates the client, builds, and runs `lhci autorun` with `aggregationMethod` `median`.
- `pretypecheck` and `prebuild` run `prisma generate`. A clean checkout needs that before `tsc` or `next build`.
- Draft PR is https://github.com/haunguyendev/portfolio-v2/pull/19.
- Perf gate is **report-only** until M2: workflow env `PERF_GATE_BLOCKING: "false"` and `continue-on-error` on the size and Lighthouse steps. Lint, typecheck, and build stay blocking. Thresholds are unchanged (130000 B gzip, perf 0.9, LCP 2500 ms, TBT 200 ms, CLS 0.05, a11y 0.95, median of 3).
- Report-only CI on `23f9ab1`: https://github.com/haunguyendev/portfolio-v2/actions/runs/40645955665 — `check` and `lighthouse` pass; size 271980 bytes; median LCP 3059 ms on `/`, 3172 ms on `/projects`; `/projects` accessibility 0.94.
- Last **blocking** CI reference (run https://github.com/haunguyendev/portfolio-v2/actions/runs/40644338147 on `8f6c622`): size 271980 bytes; median LCP 3598 ms on `/`, 3261 ms on `/projects`; `/projects` accessibility 0.94.
- Initial JS on `/` now includes the page `react-loadable-manifest.json` chunks. Local `pnpm size` on this tree measured **317813** gzip9 bytes. That is the previous **271980** plus **45833** from three chunks the homepage script tags do not list. `0dc112edbbecf445.js` is 23510 bytes (`TechStackTabs` from `about-preview-section.tsx`). `63ea296f8d10903f.js` is 20202 bytes and `7bdf7643602c1959.js` is 2121 bytes (`CommandMenu` from `header.tsx`). `size-limit` reported the same 317813. `13347721a122a5d3.js` is `ChatPanel`. The layout client chunk references it, and the page manifest does not, so the total leaves it out.
- Lighthouse upload target is `filesystem` with `outputDir` `.lighthouseci`. LHCI writes that directory under `apps/web` because the step's working directory is `apps/web`. `actions/upload-artifact@v4` skips a directory whose name starts with a dot unless `include-hidden-files` is true. The job sets that flag and `if-no-files-found: error`.
- Report-only CI on `f9d8ec7`: https://github.com/haunguyendev/portfolio-v2/actions/runs/40648751029. `check` and `lighthouse` pass. Size is 317813 gzip9 bytes (271980 without the page loadable chunks, plus 45833). Median LCP is 3068.6744 ms on `/` (4603.1955, 2982.8579, 3068.6744) and 3161.69575 ms on `/projects` (2770.314525, 3161.69575, 3169.94425). `/` LCP fails. `/projects` LCP fails. `/projects` accessibility is 0.94 on all three runs. Artifact `lighthouse-reports` is 5370796 bytes: https://github.com/haunguyendev/portfolio-v2/actions/runs/40648751029/artifacts/12798359933

## Not done

- Homepage and `/projects` still miss Lighthouse budgets at the configured thresholds. `/` LCP fails. `/projects` LCP fails. `/projects` accessibility is 0.94. M2 rewrites the homepage and can set `PERF_GATE_BLOCKING` back to `"true"`.
- Initial JS on `/` is 317813 gzip bytes against a 130000 byte limit.

## Next step

Leave the pull request as a draft. Do not merge it. Merging deploys production. M2 sets `PERF_GATE_BLOCKING` to `"true"` after homepage work meets the budgets.

## Open questions

- Should M2 treat the hero photo as the LCP problem, or the 318 KB of initial JavaScript, or both? On the slowest local homepage run, image load time was 87% of a 4374 ms LCP. The median LCP after that was still about 3468 ms. `/projects` LCP also fails the 2500 ms cap.
- `/projects` accessibility is 0.94 on every run. The failing audits are `color-contrast` and `heading-order`. Fixing them is UI work, so it is out of scope here.

## M1

### Done

- Public pages use the Polaroid palette on `:root`. Background `#0B0A09`, text `#E8E1D6`, muted `#A39A8C`, accent `#F2C14E`, link `#9CC3D5`. Tailwind theme colors read those variables.
- Surface `#161311`, border `#3F372F`, paper `#F4EFE6`, and ink `#1C1814` are local choices. `plan-v4.md` is not in this checkout.
- Admin keeps the previous light and dark shadcn tokens on `.admin-theme`.
- `Polaroid` has variants `memory`, `project`, `work`, `lab`, and `post`, each with `clear` and `blurred`. The demo is `/design`. It sends `noindex, nofollow`. `sitemap.ts` does not list it. `robots.ts` disallows `/design`.
- `Inter` loads `latin` and `vietnamese` through `next/font`. The demo prints Vietnamese diacritics.
- `pnpm --filter @portfolio/web test:contrast` reads the hex values from `globals.css` and computes WCAG ratios. It is a blocking step in `pr-ci.yml`. That workflow also runs on pull requests to `polaroid`.
- A temporary text color `#2A2622` failed the contrast test at 1.32:1. The file was restored. See `decisions.tsv`.
- Local baseline initial JS on `/` is 317813 gzip9 bytes. After this change it is 317813. Delta 0.

### Not done

- GitHub Actions on the pushed head, and the Vercel preview screenshots, are recorded in the pull request after this commit.

### Next step

Open the draft pull request into `polaroid`. Do not merge. Do not push `main`.

### Open questions

- M2 should confirm the surface, border, paper, and ink hex values against plan-v4 §0 if that file is available. The five specified colors are already exact.
