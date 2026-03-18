---
title: "GitHub OAuth Login for Admin Dashboard"
description: "Replace email/password with GitHub-only OAuth login, whitelist single admin account"
status: in_progress
priority: P2
effort: 2h
branch: main
tags: [auth, backend, frontend]
blockedBy: []
blocks: []
created: 2026-03-18
---

# GitHub OAuth Login for Admin Dashboard

## Overview

Replace email/password login with GitHub OAuth. Only `haunt150603@gmail.com` (haunguyendev) can access admin. Better Auth `socialProviders.github` + whitelist hook. No Prisma migration needed.

## Context

- [Brainstorm Report](../reports/brainstorm-260318-0956-github-oauth-admin-login.md)
- [OAuth Research](../reports/researcher-260318-0936-better-auth-github-oauth.md)
- [OAuth Flow Diagram](../visuals/github-oauth-login-flow-better-auth.md)

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Create GitHub OAuth App + Env Vars](./phase-01-github-oauth-app-env-setup.md) | Partial (code done, manual pending) |
| 2 | [Better Auth Config + Login UI](./phase-02-better-auth-config-login-ui.md) | Complete |
| 3 | [Test + Deploy](./phase-03-test-deploy.md) | Pending (blocked by Phase 1 manual steps) |

## Dependencies

- GitHub Developer Settings access (user action)
- Production server SSH access for `.env` update
