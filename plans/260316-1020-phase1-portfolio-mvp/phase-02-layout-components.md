# Phase 2: Layout Components

## Context Links
- [System Architecture — Component Hierarchy](../../docs/system-architecture.md)
- [Design Guidelines — Layout & Grid](../../docs/design-guidelines.md)
- [Code Standards — Component Patterns](../../docs/code-standards.md)
- [Phase 1: Setup](./phase-01-setup-and-configuration.md)

## Overview

| Field | Value |
|-------|-------|
| Priority | HIGH |
| Status | Complete |
| Effort | ~3h |
| Depends On | Phase 1 (setup complete) |
| Description | Build Header (sticky, responsive, gradient accent), Footer (social links, copyright), Navigation, mobile nav, and root layout composing them |

## Key Insights

- Header is sticky (`sticky top-0 z-50`) with white bg and subtle border-bottom
- Navigation uses Next.js `Link` + `usePathname()` for active state
- Mobile nav needs `'use client'` for toggle state — keep it in separate file
- Footer is simple: social links + copyright, no complex logic
- Root layout wraps all pages with Header + main content + Footer
- Header gradient accent: thin gradient line at top of page (2-4px)

## Requirements

### Functional
- Sticky header with logo/name + nav links (Home, Projects, About, Blog)
- Active link indicator (bold or underline for current page)
- Mobile hamburger menu (below `md:` breakpoint)
- Footer with GitHub, LinkedIn, email links + copyright
- Root layout composing Header + {children} + Footer

### Non-Functional
- Header: server component for nav links, mobile-nav is client component
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`
- ARIA labels for navigation landmarks
- Components under 200 lines each
- Keyboard accessible (tab order, focus states)

## Related Code Files

### Files to Create
| File | Component | Type |
|------|-----------|------|
| `src/components/layout/header.tsx` | Header | Server |
| `src/components/layout/footer.tsx` | Footer | Server |
| `src/components/layout/navigation.tsx` | Navigation | Server |
| `src/components/layout/mobile-nav.tsx` | MobileNav | Client |
| `src/app/layout.tsx` | RootLayout | Server |

### Files to Modify
- `src/app/layout.tsx` — replace scaffolded layout with our custom one

## Architecture

```
RootLayout (layout.tsx)
├── <div className="gradient-accent h-1" />   ← Gradient accent bar
├── <Header>
│   ├── Logo/Name (Link to /)
│   ├── <Navigation>                           ← Desktop nav (hidden below md:)
│   │   └── NavLink × 4 (Home, Projects, About, Blog)
│   └── <MobileNav>                            ← Hamburger menu (visible below md:)
│       └── NavLink × 4
├── <main>{children}</main>
└── <Footer>
    ├── Social links (GitHub, LinkedIn, Email)
    └── Copyright
```

## Implementation Steps

### Step 1: Navigation Component

`src/components/layout/navigation.tsx`:

```tsx
import Link from 'next/link'
import { NAV_LINKS } from '@/lib/constants'

interface NavigationProps {
  currentPath?: string
}

export function Navigation({ currentPath }: NavigationProps) {
  return (
    <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-zinc-900',
            currentPath === link.href
              ? 'text-zinc-900'
              : 'text-zinc-500'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
```

**Notes:**
- `hidden md:flex` — hidden on mobile, flex on desktop
- Active state determined by `currentPath` prop
- Server component — `currentPath` passed from a client wrapper or header

### Step 2: Mobile Navigation

`src/components/layout/mobile-nav.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zinc-700 hover:text-zinc-900"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 shadow-sm">
          <nav className="container-main py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'text-sm font-medium py-2 transition-colors',
                  pathname === link.href ? 'text-zinc-900' : 'text-zinc-500'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}
```

**Notes:**
- `'use client'` — needs `useState` and `usePathname()`
- `md:hidden` — only visible on mobile
- Closes menu on link click
- Dropdown overlay with white bg, border, shadow

### Step 3: Header Component

`src/components/layout/header.tsx`:

```tsx
import Link from 'next/link'
import { Navigation } from '@/components/layout/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="container-main flex items-center justify-between h-16">
        {/* Logo / Site name */}
        <Link
          href="/"
          className="text-lg font-bold text-zinc-900 hover:text-zinc-700 transition-colors"
        >
          Kane Nguyen
        </Link>

        {/* Desktop navigation */}
        <Navigation />

        {/* Mobile navigation */}
        <MobileNav />
      </div>
    </header>
  )
}
```

**Notes:**
- `sticky top-0 z-50` — sticks to top on scroll
- `bg-white/95 backdrop-blur-sm` — slight transparency with blur for polish
- `h-16` — 64px header height
- Navigation is server component (no active state logic here — active state handled in mobile-nav client component; for desktop, see note below)

> **Active state for desktop nav:** Since Navigation is a server component, it cannot use `usePathname()`. Two options:
> 1. Make Navigation a client component (simplest, minor cost)
> 2. Pass pathname from a client wrapper
>
> **Recommendation:** Make Navigation a client component. The cost is trivial for 4 links.

### Step 4: Footer Component

`src/components/layout/footer.tsx`:

```tsx
import { Github, Linkedin, Mail } from 'lucide-react'
import { SOCIAL_LINKS } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="container-main py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-900 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-900 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.email}
              className="text-zinc-500 hover:text-zinc-900 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Kane Nguyen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

### Step 5: Root Layout

`src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: "Kane Nguyen — Software Engineer",
    template: "%s | Kane Nguyen",
  },
  description: "Software Engineer's portfolio showcasing projects, skills, and experience.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {/* Gradient accent bar */}
        <div className="h-1 gradient-accent" aria-hidden="true" />

        <Header />

        <main className="flex-1">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
```

**Notes:**
- `min-h-screen flex flex-col` on body — footer sticks to bottom even on short pages
- `flex-1` on main — takes remaining vertical space
- Metadata uses template for page-specific titles: `"Projects | Kane Nguyen"`
- Gradient accent bar is 4px (`h-1`) at very top of viewport
- Font: Inter via `next/font/google` (optimized loading, no FOUT)

## Todo List

- [x] 2.1 Create `src/components/layout/navigation.tsx` (make client component with `usePathname`)
- [x] 2.2 Create `src/components/layout/mobile-nav.tsx` (client component with hamburger toggle)
- [x] 2.3 Create `src/components/layout/header.tsx` (sticky, logo + nav + mobile-nav)
- [x] 2.4 Create `src/components/layout/footer.tsx` (social links + copyright)
- [x] 2.5 Update `src/app/layout.tsx` (root layout composing Header + main + Footer)
- [x] 2.6 Verify gradient accent bar renders at top of page
- [x] 2.7 Test desktop navigation — all 4 links visible, active state works
- [x] 2.8 Test mobile navigation — hamburger opens/closes, links navigate correctly
- [x] 2.9 Test sticky header on scroll
- [x] 2.10 Test keyboard navigation (tab through links, enter to activate)
- [x] 2.11 Verify `pnpm build` succeeds

## Success Criteria

- Header is sticky, visible on all pages
- Desktop nav shows 4 links with active state indicator
- Mobile hamburger opens overlay, links work, overlay closes on navigate
- Footer shows social icons + copyright with current year
- `<main>` has `flex-1` so footer is pushed to bottom on short pages
- All semantic HTML: `<header>`, `<nav>`, `<main>`, `<footer>`
- ARIA labels on navigation, social links, hamburger button
- Responsive: stacks properly on mobile

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Mobile nav z-index conflicts | Low | Use z-50 on header, z-40 on mobile overlay |
| `usePathname()` not matching on trailing slashes | Low | Normalize paths or use `startsWith` for nested routes |
| Gradient bar not visible on some browsers | Low | Test on Chrome/Safari/Firefox; `bg-gradient-to-r` is well supported |

## Next Steps

After layout components verified, proceed to **Phase 3: Content Data & Types** to define TypeScript interfaces and create JSON data files.
