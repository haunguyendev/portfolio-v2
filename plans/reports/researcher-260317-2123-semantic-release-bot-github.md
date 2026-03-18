# Research Report: Semantic Release Bot cho GitHub

**Date:** 2026-03-17
**Scope:** Automated semantic versioning & release for GitHub projects
**Sources:** 8+ articles, official docs, comparison guides

## Executive Summary

3 tool chính để tự động hóa versioning + release trên GitHub: **semantic-release**, **Release Please** (Google), và **Changesets**. Với portfolio project (Next.js, pnpm, Turborepo, private, deploy Vercel) — **Release Please** là lựa chọn tối ưu nhất: setup đơn giản, PR-based review, không cần publish npm.

## So sánh 3 Tool

| Factor | semantic-release | Release Please | Changesets |
|--------|-----------------|----------------|------------|
| **Automation** | Full auto | PR-based (review trước) | Manual changeset files |
| **Setup** | Moderate | **Low** | Moderate |
| **Human control** | Minimal | Medium | Maximum |
| **Commit discipline** | High (bắt buộc) | Medium | Medium |
| **Multi-branch** | Excellent | Good | Basic |
| **Approval gate** | No | **Yes (PR)** | Yes (PR) |
| **Monorepo** | Plugin needed | Native | Native |
| **Best for** | Libraries, npm packages | **Web apps, private repos** | Complex multi-pkg |

## Recommendation: Release Please

**Lý do chọn cho dự án này:**
- Private project, không publish npm → không cần full automation của semantic-release
- PR-based → review changelog trước khi merge, phù hợp solo dev
- Google maintained, battle-tested
- Native monorepo support (Turborepo compatible)
- Setup cực kỳ đơn giản

## Setup Guide: Release Please

### Bước 1: Tạo workflow file

```yaml
# .github/workflows/release-please.yml
name: Release Please

on:
  push:
    branches:
      - main

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
          package-name: porfolio_v2
```

### Bước 2: (Optional) Config file cho monorepo

Tạo `release-please-config.json` ở root:

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "packages": {
    ".": {}
  },
  "changelog-sections": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance" },
    { "type": "docs", "section": "Documentation", "hidden": true },
    { "type": "chore", "section": "Miscellaneous", "hidden": true }
  ]
}
```

Tạo `.release-please-manifest.json`:

```json
{
  ".": "0.1.0"
}
```

### Bước 3: Commit convention (đã tuân thủ)

Dự án đã dùng conventional commits:
- `feat:` → minor bump (0.1.0 → 0.2.0)
- `fix:` → patch bump (0.1.0 → 0.1.1)
- `feat!:` hoặc `BREAKING CHANGE:` → major bump (0.1.0 → 1.0.0)

### Bước 4: Workflow hoạt động

```
Push to main → Release Please phân tích commits
  → Tạo/update Release PR (changelog + version bump)
    → Dev review PR → Merge
      → GitHub Release được tạo tự động
        → Tag version (v0.2.0, etc.)
```

## Alternative: semantic-release (nếu muốn full auto)

### Setup

```bash
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git
```

### Config `.releaserc.json`

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/git", {
      "assets": ["package.json", "CHANGELOG.md"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

### Workflow `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    branches:
      - main

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

**Lưu ý quan trọng:**
- `npmPublish: false` vì project private
- `fetch-depth: 0` bắt buộc để đọc full git history
- `GITHUB_TOKEN` tự động có sẵn trong GitHub Actions (không cần tạo secret)
- KHÔNG set `registry-url` trong `setup-node` (conflict với semantic-release)

## Security Notes

- `GITHUB_TOKEN` có scope limited, tự expire — an toàn
- Nếu cần publish npm → dùng `NPM_TOKEN` secret riêng
- Recommend: dùng OpenID Connect (OIDC) cho trusted publishing thay vì long-lived tokens
- Không bao giờ commit token vào repo

## Decision

| Criteria | Dự án này |
|----------|-----------|
| Private repo | ✅ Không cần npm publish |
| Solo dev | ✅ PR review vẫn có giá trị (changelog audit) |
| Conventional commits | ✅ Đã dùng |
| Monorepo (Turborepo) | ✅ Release Please native support |
| Vercel deploy | ✅ Không ảnh hưởng (deploy trigger riêng) |

**→ Recommendation: Release Please** (simple, PR-based, đủ cho portfolio project)
**→ Alternative: semantic-release** nếu muốn fully automated, không cần review step

## Sources

- [semantic-release GitHub Actions docs](https://semantic-release.gitbook.io/semantic-release/recipes/ci-configurations/github-actions)
- [Setup Semantic Release for Next.js - DEV](https://dev.to/amalv/how-to-setup-semantic-release-for-a-react-app-or-a-next-js-app-25c1)
- [Release Please - GitHub](https://github.com/googleapis/release-please)
- [NPM Release Automation Comparison](https://oleksiipopov.com/blog/npm-release-automation/)
- [Semantic Versioning Automation Guide](https://oneuptime.com/blog/post/2026-01-25-semantic-versioning-automation/view)
- [semantic-release GitHub](https://github.com/semantic-release/semantic-release)
- [Release Please Action - GitHub Marketplace](https://github.com/googleapis/release-please-action)
