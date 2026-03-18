# Brainstorm: Contact Form Feature Decision

**Date:** 2026-03-18
**Status:** Decided — DEFERRED (YAGNI)

## Problem Statement

Should the portfolio add a contact form + contact management system?

## Context

- Portfolio just launched, **0 incoming messages/month**
- Static contact info already on homepage: email, phone/Zalo, social links (Facebook, LinkedIn, Zalo)
- Full CMS backend ready (NestJS + GraphQL + Prisma + Admin dashboard)
- User willing to invest time in email service + anti-spam setup

## Options Evaluated

### Option A: Don't add (YAGNI) — CHOSEN
- **Pros:** Zero effort, zero maintenance, focus on high-ROI tasks
- **Cons:** Slightly less "professional" look (subjective)
- **Effort:** 0

### Option B: Simple contact form
- Form (name, email, message) → save to DB → view in admin
- No email notification, no anti-spam
- **Pros:** Low effort, adds polish
- **Cons:** Building for 0 users
- **Effort:** ~0.5 day

### Option C: Full contact system
- Form + DB + email (Nodemailer/SendGrid) + rate limiting + admin management
- **Pros:** Complete solution
- **Cons:** Over-engineered for current traffic, maintenance overhead
- **Effort:** ~2-3 days

## Decision

**Deferred.** YAGNI principle applies — 0 messages/month means contact form has near-zero ROI.

**Priority instead:** Write blog content + improve SEO to drive actual traffic first. Re-evaluate contact form when monthly visitors > 100 or when receiving direct email inquiries that would benefit from structured form.

## Trigger to Revisit

- Portfolio gets consistent traffic (>100 visits/month)
- User receives 3+ direct email inquiries that could be better served by a form
- Freelance work becomes a priority (structured intake form adds value)

## Infrastructure Note

When ready to implement, the existing NestJS + Prisma + Admin dashboard makes it a quick add (~0.5 day for simple version). No architectural changes needed.
