# PROGRESS

## Done

- Branch `feat/polaroid-m0-ci` is cut from `origin/main`.
- `.github/workflows/pr-ci.yml` runs on `pull_request` to `main` and on `workflow_dispatch`. It does not run on `push`.
- Job `check` installs, generates the Prisma client, lints, typechecks web and api, builds Velite, builds the web app, and runs size-limit.
- Job `lighthouse` installs, generates the client, builds, and runs `lhci autorun` with `aggregationMethod` `median`.
- `pretypecheck` and `prebuild` run `prisma generate`. A clean checkout needs that before `tsc` or `next build`.
- Clean checkout of `15163b3` plus the median Lighthouse config: install, lint, both typechecks, and the web build exit 0. Size exits 1 at 271980 gzip bytes. The limit is 130000 bytes. Lighthouse exits 1.
- Draft PR is https://github.com/haunguyendev/portfolio-v2/pull/19.

## Not done

- The homepage is over the Lighthouse LCP budget, and `/projects` is under the accessibility budget. Thresholds stay where they are. M2 rewrites the homepage.
- The size budget stays 130 KB gzip. This tree measures 271980 bytes.

## Next step

Leave the pull request as a draft. Do not merge it. Merging deploys production.

## Open questions

- Should M2 treat the hero photo as the LCP problem, or the 272 KB of initial JavaScript, or both? On the slowest local homepage run, image load time was 87% of a 4374 ms LCP. The median LCP after that was still about 3468 ms.
- `/projects` accessibility is 0.94 on every run. The failing audits are `color-contrast` and `heading-order`. Fixing them is UI work, so it is out of scope here.
