---
title: "Phase 4A: Custom Backend CMS — Admin + API Foundation"
description: "Turborepo monorepo, NestJS API (GraphQL + REST), Prisma + PostgreSQL, Better Auth, Admin dashboard, TipTap editor, content migration"
status: completed
priority: P1
effort: 2-3 weeks
branch: feat/phase-4a-cms
tags: [nestjs, graphql, prisma, admin, tiptap, turborepo, phase-4]
created: 2026-03-17
blockedBy: []
blocks: []
---

# Phase 4A: Custom Backend CMS — Admin + API Foundation

## Context
- Brainstorm: [brainstorm report](../reports/brainstorm-260317-1006-phase4-custom-backend-cms.md)
- Phase 1-3 complete (portfolio, blog/diary MDX, SEO, dark mode)
- Current content: JSON files (projects, skills, experience) + MDX (blog, diary via Velite)
- Goal: Replace static files with custom CMS backend

## Approach
Sequential phases, each buildable and testable independently.
**CRITICAL**: Phase 1 (monorepo migration) must not break the existing site.

## Phases

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 1 | [Monorepo Migration](./phase-01-monorepo-migration.md) | 3h | Complete | Turborepo setup, move code to apps/web |
| 2 | [NestJS + Prisma Setup](./phase-02-nestjs-prisma-setup.md) | 4h | Complete | NestJS init, Prisma schema, Docker PostgreSQL |
| 3 | [Auth Integration](./phase-03-auth-integration.md) | 3h | Complete | Better Auth (Next.js) + JWT Guard (NestJS) |
| 4 | [GraphQL API](./phase-04-graphql-api.md) | 5h | Complete | Posts, projects, categories, tags, series resolvers |
| 5 | [Admin Dashboard](./phase-05-admin-dashboard.md) | 6h | Complete | shadcn/ui sidebar, CRUD pages, TipTap editor |
| 6 | [Content Migration](./phase-06-content-migration.md) | 3h | Complete | Seed script, public pages refactor to API |

## Key Dependencies
- Phase 1 → 2 (monorepo must exist before adding NestJS)
- Phase 2 → 3 (Prisma User model needed for auth)
- Phase 2 → 4 (Prisma models needed for GraphQL)
- Phase 3 → 5 (auth needed to protect admin routes)
- Phase 4 → 5 (API needed for admin CRUD operations)
- Phase 4 → 6 (API needed for migration + public page refactor)

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15, shadcn/ui, TipTap |
| Backend | NestJS, @nestjs/graphql (code-first) |
| Database | PostgreSQL + Prisma |
| Auth | Better Auth + JWT verification |
| Deploy | Vercel (web) + Docker (api) + Cloudflare Tunnel |

## Risk Mitigation
- Monorepo migration: incremental, verify build at each step
- Content migration: keep JSON/MDX as backup, seed script reversible
- Auth: Better Auth handles complexity, NestJS just verifies JWT
