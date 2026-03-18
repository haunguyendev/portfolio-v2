# Code Review: deploy.yml — Parallel Conditional CI/CD

## Scope
- File: `.github/workflows/deploy.yml`
- LOC: 191
- Focus: CI/CD workflow refactor (sequential → parallel conditional builds)

## Overall Assessment

Solid refactor. The conditional build logic and `deploy` guard are correctly structured. Found **2 critical**, **2 high**, and **2 medium** issues.

---

## Critical Issues

### C1. GITHUB_TOKEN leaked into SSH remote shell history

**Line 186:** The `secrets.GITHUB_TOKEN` is interpolated directly into the SSH command string.

```yaml
ssh deploy-server "cd /opt/portfolio && \
  echo '${{ secrets.GITHUB_TOKEN }}' | docker login ghcr.io ...
```

**Problem:** GitHub Actions will mask the token in GHA logs, but:
- The token is passed as a literal string in the SSH command, meaning it lands in the remote shell's process list (`ps aux`), potentially in `.bash_history`, and in syslog/audit logs on the server.
- Single quotes inside double-quoted SSH string do NOT prevent expansion — the token is visible as a process argument.

**Fix:** Pass the token via environment variable over SSH instead:

```yaml
- name: Deploy via SSH
  env:
    WEB_CHANGED: ${{ needs.changes.outputs.web }}
    API_CHANGED: ${{ needs.changes.outputs.api }}
    GHCR_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GHCR_USER: ${{ github.actor }}
  run: |
    PULL_SERVICES=""
    if [ "$WEB_CHANGED" = "true" ]; then PULL_SERVICES="$PULL_SERVICES web"; fi
    if [ "$API_CHANGED" = "true" ]; then PULL_SERVICES="$PULL_SERVICES api"; fi

    ssh -o SendEnv=GHCR_TOKEN deploy-server 'cd /opt/portfolio && \
      echo "$GHCR_TOKEN" | docker login ghcr.io -u '"$GHCR_USER"' --password-stdin && \
      docker compose -f docker-compose.prod.yml pull '"$PULL_SERVICES"' && \
      docker compose -f docker-compose.prod.yml up -d '"$PULL_SERVICES"' --remove-orphans && \
      docker image prune -f'
```

Alternatively (simpler), pipe the token from the local side via stdin:
```yaml
    echo "$GHCR_TOKEN" | ssh deploy-server 'read -r TOKEN; cd /opt/portfolio && \
      echo "$TOKEN" | docker login ghcr.io -u <user> --password-stdin && ...'
```

### C2. `workflow_dispatch` triggers bypass `paths-ignore` — `dorny/paths-filter` has no base ref

**Problem:** When triggered via `workflow_dispatch`:
- `paths-ignore` does not apply (correct GHA behavior — manual triggers have no file diff)
- `dorny/paths-filter` uses `git diff` against the default branch. For `workflow_dispatch` on `main`, the HEAD **is** the default branch, so the diff is empty → both `web` and `api` outputs are `'false'`
- Both `build-web` and `build-api` get skipped
- Deploy `if` requires at least one `success` → deploy is skipped
- **Result: `workflow_dispatch` does nothing** — completely broken for manual re-deploys

**Fix:** Add a force-build condition for `workflow_dispatch`:

```yaml
build-web:
  needs: changes
  if: needs.changes.outputs.web == 'true' || github.event_name == 'workflow_dispatch'
  ...

build-api:
  needs: changes
  if: needs.changes.outputs.api == 'true' || github.event_name == 'workflow_dispatch'
  ...
```

---

## High Priority

### H1. `$PULL_SERVICES` not expanded on remote — deploy echoes literal variable name

**Line 190:**
```yaml
echo 'Deployed: $PULL_SERVICES'"
```

The remote shell receives `echo 'Deployed: $PULL_SERVICES'` — single quotes prevent variable expansion. `$PULL_SERVICES` is a **local** variable set in the GHA runner, not available on the remote server. The entire SSH command is a single double-quoted string, so `$PULL_SERVICES` on lines 187-188 gets expanded locally by the runner shell (correct), but the `echo` on line 190 also needs local expansion.

**Actually on closer inspection**: The outer quotes are double quotes (`ssh deploy-server "..."`), so `$PULL_SERVICES` IS expanded locally before being sent. But the inner single quotes in `echo 'Deployed: $PULL_SERVICES'` will cause it to be treated as literal text by the remote shell. Wait — no, because the outer double quotes already expanded it before SSH receives it. The shell sees: `echo 'Deployed:  web'` (already expanded). This is actually fine.

**Correction:** This is NOT an issue. The outer double-quote causes local expansion of `$PULL_SERVICES` before the string is sent to SSH. Disregard.

### H1 (revised). `StrictHostKeyChecking no` disables SSH host verification

**Line 171:**
```yaml
StrictHostKeyChecking no
```

Disabling host key verification makes the connection vulnerable to MITM attacks. While common in CI/CD, this should use a known host key instead.

**Fix:** Add the server's host key to known_hosts:
```yaml
- name: Setup SSH config
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
    chmod 600 ~/.ssh/deploy_key
    echo "${{ secrets.KNOWN_HOSTS }}" > ~/.ssh/known_hosts
    cat >> ~/.ssh/config << EOF
    Host deploy-server
      HostName ${{ secrets.SERVER_HOST }}
      User ${{ secrets.SERVER_USER }}
      IdentityFile ~/.ssh/deploy_key
      ProxyCommand cloudflared access ssh --hostname %h
    EOF
```

Requires adding `KNOWN_HOSTS` secret. Since this is behind Cloudflare Tunnel, the risk is lower, but still best practice.

### H2. `--remove-orphans` with selective `up -d` may kill unrelated services

**Line 188:**
```yaml
docker compose -f docker-compose.prod.yml up -d $PULL_SERVICES --remove-orphans
```

`--remove-orphans` removes containers for services not defined in the compose file. This is safe here since the compose file includes all services. However, running `up -d web --remove-orphans` will restart ONLY `web` but also remove any containers not in the compose file (manual debug containers, etc.). This is generally acceptable but worth noting.

**Not a bug** — just a consideration. No action needed unless manual containers are used on the server.

---

## Medium Priority

### M1. `pnpm-lock.yaml` and `packages/**` trigger BOTH builds

**Lines 63-70:** Both `web` and `api` filters include `packages/**` and `pnpm-lock.yaml`. Any change to shared packages or the lockfile triggers both builds, negating the parallel optimization.

This is **correct behavior** (shared deps affect both apps) but reduces the optimization benefit. Consider narrowing if packages are app-specific:

```yaml
web:
  - 'apps/web/**'
  - 'packages/shared/**'
  - 'packages/prisma/**'
  - 'pnpm-lock.yaml'
api:
  - 'apps/api/**'
  - 'packages/shared/**'
  - 'packages/prisma/**'
  - 'pnpm-lock.yaml'
```

Currently identical — but if you add web-only or api-only packages later, the filter structure is ready.

**No action needed now** — just documenting for future.

### M2. `cloudflared` pinned to `latest` — non-reproducible builds

**Line 157:**
```yaml
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
```

Using `latest` means the workflow could break unexpectedly on a cloudflared update. Pin to a specific version:

```yaml
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/download/2024.12.0/cloudflared-linux-amd64.deb
```

---

## Edge Cases Analyzed

| Scenario | Behavior | Correct? |
|----------|----------|----------|
| Only `apps/web/` changed | `build-web` runs, `build-api` skipped, deploy runs | Yes |
| Only `apps/api/` changed | `build-api` runs, `build-web` skipped, deploy runs | Yes |
| Both apps changed | Both build in parallel, deploy runs | Yes |
| Only `packages/` changed | Both builds trigger (shared dep) | Yes, correct |
| Only `docs/` changed | `paths-ignore` blocks workflow entirely | Yes |
| Only root `*.md` changed | `paths-ignore` blocks workflow entirely | Yes |
| `workflow_dispatch` | **Both builds skipped, deploy skipped** | **NO — broken** (see C2) |
| `build-web` fails, `build-api` succeeds | Deploy blocked (correct, web failure = not skipped) | Yes |
| Both builds fail | Deploy blocked | Yes |
| `changes` job fails | Both builds skipped, deploy skipped | Yes |

---

## Positive Observations

- Deploy `if` condition is well-crafted: handles skipped vs success vs failure correctly
- Separate GHA cache scopes prevent cross-contamination between web/api builds
- `cancel-in-progress: true` on concurrency group prevents deploy pile-ups
- Clean separation of concerns: detect → build → deploy
- Environment variables for change detection in deploy step is clean

## Recommended Actions

1. **[Critical]** Fix `workflow_dispatch` by adding `|| github.event_name == 'workflow_dispatch'` to both build `if` conditions
2. **[Critical]** Address GITHUB_TOKEN exposure in SSH command (process list / server logs)
3. **[High]** Consider adding `KNOWN_HOSTS` secret to replace `StrictHostKeyChecking no`
4. **[Medium]** Pin `cloudflared` version for reproducible builds

## Unresolved Questions

- Is `workflow_dispatch` actually used for manual re-deploys? If yes, C2 is critical. If it's just there "in case", it's still a latent bug.
- Does the Cloudflare Tunnel setup handle host key verification separately, making `StrictHostKeyChecking no` less risky?
