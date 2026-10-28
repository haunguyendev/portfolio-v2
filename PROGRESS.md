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
- Surface `#16130F`, paper `#F4EEE3`, and ink `#1A1612` match the M1 review. Dim `#7A7164` is for text at 24px or larger and clears 3:1 on the background. Lamp `#E8A75A`, memory frame `#C9C1B4`, and memory ink `#2A251F` are theme tokens too. Border stays `#3F372F`.
- Admin keeps the previous light and dark shadcn tokens on `.admin-theme`. The light rule sets `color` and `background-color` itself. `.dark .admin-theme` overrides both. Light mode and a page with no script no longer inherit cream `#E8E1D6` onto the white panel.
- `Polaroid` has variants `memory`, `project`, `work`, `lab`, and `post`, each with `clear` and `blurred`. The demo is `/design`. It sends `noindex, nofollow`. `sitemap.ts` does not list it. `robots.ts` disallows `/design`.
- `Inter` loads `latin` and `vietnamese` through `next/font`. The demo prints Vietnamese diacritics.
- `pnpm --filter @portfolio/web test:contrast` reads the hex values from `globals.css` and computes WCAG ratios. It is a blocking step in `pr-ci.yml`. That workflow also runs on pull requests to `polaroid`.
- A temporary text color `#2A2622` failed the contrast test at 1.32:1. The file was restored. See `decisions.tsv`.
- Local baseline initial JS on `/` was 317813 gzip9 bytes before the review fix. The fix-round build measures 317759 gzip9 bytes. Delta -54. The Polaroid module is not in those chunks. The 130 KB limit still fails and stays report-only.
- The review fix gives memory a taupe card with no border. Project, work, and post use a 2px ring with a 2px page-background offset. Lab uses a 2px dashed outline in the muted color, offset by 2px, because a shadow ring cannot be dashed. A blurred photo uses a 3px blur, 50% saturation, 75% brightness, and 70% opacity, and returns on hover or keyboard focus. `prefers-reduced-motion` sets `transition-property` to `none` and leaves the dim in place. The `duration-300` utility stays `0.3s`.
- Featured project placeholders are `#16130F` with the label in `#A39A8C`. The same bitmap is used on the projects page.
- The public logo is always `logo-dark.svg`. The footer, Featured Projects, and Latest Blog use `bg-background` and do not depend on the `dark` class. With the stored theme `light`, and with JavaScript disabled, those surfaces stay `#0B0A09`.
- The login wrapper has `admin-theme`, so the card follows the admin tokens. The theme menu stays portaled to `body` and adds `admin-theme` on that node when the page has an admin scope, which keeps it above the public header.
- The public header and footer render from the `(public)` route group. `/admin` and `/admin/login` do not render that chrome. A missing public URL still has one header and one footer.
- The stored red contrast log is `cd9a44f`. That run is 9 tests, and 7 failed on missing strings. It is not `48be60e`. The summary is `docs/polaroid-m1-fix/contrast-red-cd9a44f.txt`.
- An empty size-limit glob reports `glob matched no files`. A measured total over 130000 still exits 1 with `sizeLimit` 130000. The fix-round build before this route group was 317791 gzip9 bytes. The recorded `polaroid` baseline is 317813. Delta was -22. The route-group build measures 327574 gzip9 bytes. That is 9783 above the 317791 figure. The `(public)` error boundary adds one chunk of 2230 gzip9 bytes. The other 7553 bytes are not isolated to one file. `sizeLimit` is still 130000 and `pnpm size` still exits 1. The empty-glob message is unchanged.

### Not done

- The Vercel preview URL answers with a login redirect, so the screenshots in the pull request are from `next start` of this branch, not from the protected preview.

### Next step

Keep the pull request as a draft into `polaroid`. Do not merge. Do not push `main`. M2 restyles the homepage on these tokens.

### Preview

- Draft PR: https://github.com/haunguyendev/portfolio-v2/pull/20
- Preview host: https://portfolio-v2-git-feat-polaroid-m1-design-haunguyendevs-projects.vercel.app
- Demo path: `/design`
- Anonymous requests to that host receive `302` to `vercel.com/sso-api`.

### Open questions

- Border `#3F372F` was not in the review. M2 can confirm it against plan-v4 §0 if that file is available.
