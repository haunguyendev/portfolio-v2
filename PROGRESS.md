# PROGRESS

## Done

- Branch `feat/polaroid-m0-ci` is cut from `origin/main` at `5ceeac6`.
- `.github/workflows/pr-ci.yml` runs on `pull_request` to `main` and on `workflow_dispatch`. It does not run on `push`.
- Job `check` installs with a frozen lockfile, lints the web app, typechecks web and api, builds Velite, builds the web app, and runs size-limit.
- Job `lighthouse` installs, builds, and runs `lhci autorun`.
- `apps/web` scripts added: `typecheck` (`tsc --noEmit`), `size`, `lhci`.
- On this tree, lint and both typechecks exit 0. Size exits 1. The measured initial JS for `/` is 271981 gzip bytes. The limit is 130000 bytes.

## Not done

- Lighthouse has not been run yet, so the medians are unknown.
- The draft PR, the CI run link, and the Vercel preview URL are not recorded yet.
- `acceptance.json` `passes` stays false until the clean checkout of the pushed SHA finishes.

## Next step

Push the branch, run lint, typecheck, build, size, and lhci on a clean checkout of that SHA, then open the draft PR and paste the real output.

## Open questions

- The homepage is over the 130 KB gzip budget. The size job stays blocking. M2 rewrites the homepage.
- If Lighthouse misses a threshold, the lighthouse job stays blocking too. Thresholds are not lowered.
