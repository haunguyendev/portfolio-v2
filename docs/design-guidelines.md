# Design Guidelines

## Design Vision

**Style:** Editorial minimalist portfolio inspired by nelsonlai.dev, leerob.com, delba.dev

**Core Principles:**
- Generous whitespace
- Typography-first
- Light mode by default (dark mode Phase 3)
- Subtle, purposeful animations
- High contrast and accessibility
- Responsive across all devices

## Color Palette

### Primary Colors (shadcn/ui Zinc defaults)

| Name | Hex | Usage |
|------|-----|-------|
| Zinc 50 | #fafafa | Page background |
| Zinc 100 | #f4f4f5 | Card backgrounds, subtle dividers |
| Zinc 200 | #e4e4e7 | Borders, inactive elements |
| Zinc 300 | #d4d4d8 | Secondary borders |
| Zinc 500 | #71717a | Secondary text |
| Zinc 700 | #3f3f46 | Primary text (body) |
| Zinc 900 | #18181b | Headings, strong text |

### Accent Gradient

**Logo, highlights, CTAs:** Orange → Red → Blue gradient

```css
background: linear-gradient(to right, #f97316, #ef4444, #3b82f6);
/* or tailwind: bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 */
```

**Usage:**
- Primary CTA buttons (hover state)
- Section accents
- Hero gradient (optional)
- Link underlines (hover)

### Text Colors

| Context | Color | Hex |
|---------|-------|-----|
| Heading (h1, h2, h3) | Zinc 900 | #18181b |
| Body text | Zinc 700 | #3f3f46 |
| Secondary text (meta, muted) | Zinc 500 | #71717a |
| Placeholder / Disabled | Zinc 400 | #a1a1aa |
| Code background | Zinc 100 | #f4f4f5 |
| Code text | Zinc 900 | #18181b |

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Success | Green 600 | #16a34a |
| Error | Red 600 | #dc2626 |
| Warning | Amber 500 | #f59e0b |
| Info | Blue 600 | #2563eb |

## Typography

### Font Family

- **Display/Headings:** Inter (shadcn/ui default)
- **Body:** Geist or Inter (shadcn/ui default)
- **Code:** Fira Code or Menlo (monospace)

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| h1 | 32-48px | 700 | 1.2 | -0.02em |
| h2 | 24-32px | 700 | 1.3 | -0.01em |
| h3 | 20-24px | 600 | 1.4 | 0 |
| h4 | 16-18px | 600 | 1.5 | 0 |
| Body | 16px | 400 | 1.6 | 0 |
| Small | 14px | 400 | 1.5 | 0 |
| Caption | 12px | 500 | 1.4 | 0.05em |
| Code | 13px | 400 | 1.5 | 0 |

### Usage

```tsx
<h1 className="text-4xl md:text-5xl font-bold">Main Title</h1>
<h2 className="text-2xl md:text-3xl font-bold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection</h3>
<p className="text-base leading-relaxed">Body text paragraph.</p>
<p className="text-sm text-zinc-500">Secondary text (muted).</p>
<code className="text-sm bg-zinc-100 px-1 rounded">inline code</code>
```

## Spacing System

### Scale (8px base unit)

| Value | Pixels | Tailwind |
|-------|--------|----------|
| xs | 4px | 1 |
| sm | 8px | 2 |
| md | 16px | 4 |
| lg | 24px | 6 |
| xl | 32px | 8 |
| 2xl | 48px | 12 |
| 3xl | 64px | 16 |

### Usage

```tsx
<div className="p-6">Page padding</div>
<div className="mb-8">Section margin bottom</div>
<div className="gap-4">Grid gap</div>
<div className="space-y-6">Stack spacing</div>
```

### Whitespace Guidelines

| Context | Padding/Margin |
|---------|----------------|
| Page sides | 16px (mobile), 24px (tablet), 32px (desktop) |
| Section vertical | 48px (mobile), 64px (desktop) |
| Card padding | 16px (mobile), 24px (desktop) |
| Text block spacing | 24px between paragraphs |
| List item spacing | 12px between items |

## Component Design Patterns

### Buttons

**Primary (CTA):**
```tsx
<button className="px-4 py-2 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800 transition-colors">
  Action
</button>
```

**Secondary:**
```tsx
<button className="px-4 py-2 border border-zinc-200 bg-white text-zinc-900 rounded-md font-medium hover:bg-zinc-50 transition-colors">
  Alternative
</button>
```

**With Gradient Accent:**
```tsx
<button className="px-4 py-2 bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 text-white rounded-md font-medium hover:shadow-lg transition-all">
  Special
</button>
```

**Specifications:**
- Height: 40px (default), 32px (small), 48px (large)
- Padding: 12-16px horizontal
- Border radius: 6-8px
- Font weight: 500 (medium)
- Hover state: Darken, lighten, or shadow

### Cards

```tsx
<div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-lg font-semibold mb-2">Title</h3>
  <p className="text-sm text-zinc-600">Description text.</p>
</div>
```

**Specifications:**
- Background: White (#ffffff)
- Border: 1px solid Zinc 200
- Radius: 8px
- Padding: 16-24px
- Shadow: sm (hover), md (interactive)
- Transition: 150ms ease-out

### Badges (Skill/Tech Tags)

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 text-zinc-700">
  React
</span>
```

**Variants:**

| Variant | Background | Text |
|---------|-----------|------|
| Default | Zinc 100 | Zinc 700 |
| Primary | Zinc 900 | White |
| Gradient | gradient | White |
| Outline | White | Zinc 700 / Zinc 200 border |

### Links

**Inline Links:**
```tsx
<a href="#" className="text-blue-600 hover:underline transition-colors">
  Link text
</a>
```

**Button Links:**
```tsx
<a href="#" className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800">
  Link
  <IconExternal className="ml-2 h-4 w-4" />
</a>
```

**Specifications:**
- Color: Blue 600 (default), Blue 700 (hover)
- Underline: On hover
- Transition: 100ms

## Responsive Breakpoints

### Tailwind Breakpoints

| Breakpoint | Min Width | Device |
|-----------|-----------|--------|
| sm | 640px | Large phone / Tablet |
| md | 768px | Tablet |
| lg | 1024px | Small desktop |
| xl | 1280px | Desktop |
| 2xl | 1536px | Large desktop |

### Mobile-First Approach

```tsx
// Default is mobile (320px)
<div className="p-4 sm:p-6 md:p-8 lg:p-12">
  Responsive padding
</div>

// Stack on mobile, grid on desktop
<div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Key Breakpoints for Testing
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1024px (standard monitor)
- Wide: 1280px (ultrawide)

### Mobile Layout Rules
- Full width, no sidebars
- Single column grid
- Larger touch targets (min 44px height)
- Simplified navigation (hamburger menu if needed)
- Larger padding/spacing

## Animation & Motion

### Transitions

**Standard transition:** 150ms ease-out
```css
transition: all 150ms ease-out;
```

**Fast transition:** 100ms ease-out (hover effects)
```css
transition: color 100ms ease-out;
```

**Slow transition:** 300ms ease-out (page loads, modals)
```css
transition: opacity 300ms ease-out;
```

### Common Animations

| Animation | Usage | Duration | Easing |
|-----------|-------|----------|--------|
| Fade in | Page load, appear | 300ms | ease-out |
| Slide up | Content reveal | 300ms | ease-out |
| Hover scale | Interactive elements | 150ms | ease-out |
| Hover shadow | Cards, buttons | 150ms | ease-out |
| Underline | Links | 100ms | ease-out |

### Animation Examples

```tsx
// Fade in on page load
<div className="animate-fadeIn">Content</div>

// Hover effect on card
<div className="transition-all hover:shadow-md">Card</div>

// Button hover state
<button className="transition-colors hover:bg-zinc-800">Action</button>

// Link underline on hover
<a className="border-b-2 border-transparent hover:border-blue-600 transition-colors">
  Link
</a>
```

### Animation Guidelines
- Use sparingly (not decorative)
- Keep durations under 300ms
- Prefer GPU-accelerated properties (transform, opacity)
- Avoid parallax or 3D effects
- Test on slower devices

## Icons

### Icon Library

Use **lucide-react** for consistent, minimal icons.

```tsx
import { ArrowRight, ExternalLink, Menu } from 'lucide-react'

<ArrowRight className="h-4 w-4" />
<ExternalLink className="h-4 w-4 ml-1" />
<Menu className="h-6 w-6" />
```

### Icon Sizing

| Size | Pixels | Tailwind | Usage |
|------|--------|----------|-------|
| xs | 16px | h-4 w-4 | Inline, decorative |
| sm | 20px | h-5 w-5 | Nav, buttons |
| md | 24px | h-6 w-6 | Headers, menu |
| lg | 32px | h-8 w-8 | Hero, large buttons |
| xl | 40px | h-10 w-10 | Logos, featured |

### Icon Colors

- Match text color or use accent color
- Maintain 4.5:1 contrast ratio
- Example: `<Icon className="text-zinc-700" />`

## Layout & Grid

### Max-Width Container

```tsx
<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  Content (max 1200px + padding)
</div>
```

### Grid System

```tsx
// Auto grid (responsive)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Specific column layout
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-8">Main</div>
  <div className="col-span-12 md:col-span-4">Sidebar</div>
</div>
```

### Hero Layout (Split)

```
┌─────────────┬──────────────┐
│ Text        │ Image        │
│ - Large h1  │ - Rounded    │
│ - Body text │ - Aspect 1:1 │
│ - CTA       │ - Shadow     │
└─────────────┴──────────────┘

Mobile: Stacked vertically
```

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
  <div>
    <h1 className="text-4xl md:text-5xl font-bold mb-4">Title</h1>
    <p className="text-lg text-zinc-600 mb-6">Description</p>
    <button>CTA</button>
  </div>
  <div className="relative">
    <img className="rounded-lg shadow-xl" src="..." alt="..." />
  </div>
</div>
```

## Images & Media

### Image Optimization

Use Next.js `<Image>` component:
```tsx
import Image from 'next/image'

<Image
  src="/images/hero/kane-photo.jpg"
  alt="Kane Nguyen's portrait"
  width={600}
  height={600}
  className="rounded-lg"
  priority // For above-fold images
/>
```

### Image Guidelines
- Always include `alt` text (accessibility, SEO)
- Use explicit width/height (prevents layout shift)
- Use `priority` for hero images (above fold)
- Use lazy loading for below-fold images (default)
- Compress images before upload
- Use WebP format (Next.js handles conversion)

### Aspect Ratios

| Context | Ratio | Usage |
|---------|-------|-------|
| Hero photo | 1:1 or 4:3 | Portrait or landscape |
| Project card | 16:9 | Thumbnail |
| Social OG | 1.91:1 | Open Graph image |
| Icon | 1:1 | All icons |

## Dark Mode (Phase 3)

**Current:** Light mode only

**Phase 3 Implementation:**
- CSS custom properties for theming
- localStorage for user preference
- System preference detection
- Toggle button in header

```css
:root {
  --background: #ffffff;
  --foreground: #18181b;
  --card: #f4f4f5;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #09090b;
    --foreground: #fafafa;
    --card: #27272a;
  }
}
```

## Accessibility Standards

### WCAG 2.1 AA Compliance

| Standard | Implementation |
|----------|---|
| Color contrast | 4.5:1 for text, 3:1 for large text |
| Keyboard navigation | Tab order, focus states visible |
| Semantic HTML | `<button>`, `<nav>`, `<article>`, etc. |
| ARIA labels | For icons, hidden text, landmarks |
| Focus indicators | Visible outline on keyboard focus |

### Focus State Example

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Keyboard accessible button
</button>
```

### Alt Text Patterns

```tsx
// Informative image
<img alt="Kane Nguyen's portfolio photo" src="..." />

// Decorative image
<img alt="" src="..." />

// Icon with text
<button>
  <ExternalLink className="h-4 w-4" aria-hidden="true" />
  <span>Open in new tab</span>
</button>
```

## Code Styling

### Inline Code

```tsx
<code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono">
  variable_name
</code>
```

### Code Blocks

```tsx
<pre className="bg-zinc-900 text-zinc-50 p-4 rounded-lg overflow-x-auto">
  <code>{code}</code>
</pre>
```

## Design Checklist

Before launch:
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Responsive tested on 375px, 768px, 1024px, 1280px
- [ ] Hover states present on interactive elements
- [ ] Focus states visible for keyboard navigation
- [ ] Images optimized and use Next.js `<Image>`
- [ ] No layout shifts (CLS < 0.1)
- [ ] Animations smooth at 60fps
- [ ] Mobile touch targets 44px+ height
- [ ] Loading states visible
- [ ] Error states graceful

## Summary

Light, minimalist aesthetic with:
- Zinc palette (neutral) + orange-red-blue gradient accents
- Generous whitespace and typography-first approach
- Smooth, subtle animations
- Mobile-first responsive design
- WCAG 2.1 AA accessibility
- Performance-optimized imagery
