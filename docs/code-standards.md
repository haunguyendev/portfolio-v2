# Code Standards

## TypeScript Setup

**Strict Mode:** Always enabled.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

- All functions must have explicit return types
- No `any` without explicit justification
- Use `unknown` instead of `any` for untyped values
- Unused variables trigger errors (catch during development)

## File Organization & Naming

### File Naming
- Components: `kebab-case.tsx` (e.g., `project-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `api-client.ts`)
- Types: `kebab-case.ts` (e.g., `project.ts`)
- Data: `kebab-case.json` (e.g., `projects.json`)
- Styles: `kebab-case.css` (e.g., `globals.css`)
- Next.js special: `page.tsx`, `layout.tsx`, `error.tsx` (not renamed)

### File Size Limits
- **Components:** Max 200 lines (including comments, blank lines)
- **Utilities:** Max 150 lines per function/export
- **Exceptions:** Configuration files, JSON data files

When a component exceeds 200 lines:
1. Extract sub-components into separate files
2. Extract logic into custom hooks or utilities
3. Split by feature/concern

## Component Patterns

### Functional Components (React FC)
All components are functional components with TypeScript.

```typescript
// GOOD
import { ReactNode } from 'react'

interface ProjectCardProps {
  title: string
  description: string
  technologies: string[]
  imageUrl: string
  children?: ReactNode
}

export function ProjectCard({
  title,
  description,
  technologies,
  imageUrl,
  children,
}: ProjectCardProps) {
  return (
    <div className="...">
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{description}</p>
      <div>{children}</div>
    </div>
  )
}
```

### Component Variants with CVA
Use `class-variance-authority` for complex prop-based styling (buttons, badges):

```typescript
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'px-4 py-2 rounded font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 text-white hover:bg-zinc-800',
        outline: 'border border-zinc-200 hover:bg-zinc-50',
        ghost: 'hover:bg-zinc-100',
      },
      size: {
        sm: 'text-sm px-3 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
```

### Lazy Loading for Heavy Components
Use dynamic imports for interactive or animation-heavy components:

```typescript
// app/layout.tsx or any page
import dynamic from 'next/dynamic'

const CommandMenu = dynamic(() => import('@/components/layout/command-menu'), {
  ssr: false, // client-only
})

const TechStackTabs = dynamic(() => import('@/components/home/tech-stack-tabs'), {
  ssr: false,
})

export default function Layout() {
  return (
    <>
      <CommandMenu />
      <TechStackTabs />
    </>
  )
}
```

### Hydration-Safe Components
Components with animations or browser APIs must handle SSR/hydration mismatch:

```typescript
'use client'

import { useEffect, useState } from 'react'

export function TypewriterHeading() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render animation until mounted on client
  if (!mounted) return <h1>Static text</h1>

  return <h1>Animated typewriter effect</h1>
}
```

### Props Interface Naming
- Named: `{ComponentName}Props`
- Co-located with component in same file
- Exported if used outside component file

```typescript
interface ProjectGridProps {
  featured?: boolean
  limit?: number
}

export function ProjectGrid({ featured, limit }: ProjectGridProps) {
  // ...
}
```

### Server vs Client Components
- Default: Server components (no `'use client'` directive unless needed)
- Add `'use client'` only for:
  - State management (`useState`, `useContext`)
  - Event handlers (`onClick`, `onChange`)
  - Browser APIs (`localStorage`, `window`)
  - Hooks like `useEffect`, `useRouter`

```typescript
// Server component (default)
export function ProjectGrid() {
  const projects = require('@/content/projects.json')
  return <div>{/* render projects */}</div>
}

// Client component
'use client'

import { useState } from 'react'

export function ProjectFilter() {
  const [filter, setFilter] = useState('')
  return <input onChange={(e) => setFilter(e.target.value)} />
}
```

## Type Definitions

### Locating Types

**Option 1: Co-locate in component file** (preferred for single-use types)
```typescript
// src/components/projects/project-card.tsx
interface ProjectCardProps { /* ... */ }

export function ProjectCard(props: ProjectCardProps) { /* ... */ }
```

**Option 2: Separate types file** (for shared types)
```typescript
// src/types/project.ts
export interface Project {
  id: string
  title: string
  // ...
}

// src/components/projects/project-card.tsx
import type { Project } from '@/types/project'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) { /* ... */ }
```

### Type Naming
- Interfaces: `{DomainName}` or `{ComponentName}Props`
- Types: `{DomainName}Type` (if distinction needed)
- Enums: `{DomainName}Enum` or `{DomainName}Status`

```typescript
interface Project { /* ... */ }
interface ProjectCardProps { /* ... */ }
type ProjectStatus = 'draft' | 'published'
enum ProjectFilter { Featured, All, Archived }
```

## Styling Rules

### Tailwind CSS
- Use Tailwind utility classes exclusively (no custom CSS unless necessary)
- Organize classes for readability:
  ```tsx
  <div className="
    flex items-center justify-between
    rounded-lg border border-gray-200
    bg-white p-4 shadow-sm
    hover:shadow-md transition-shadow
  ">
  ```
- Use `cn()` utility to merge conflicting classes:
  ```typescript
  import { cn } from '@/lib/utils'

  export function Button({ variant, className, ...props }: ButtonProps) {
    return (
      <button
        className={cn(
          'px-4 py-2 rounded font-medium',
          variant === 'primary' && 'bg-blue-600 text-white',
          variant === 'secondary' && 'bg-gray-100 text-gray-900',
          className
        )}
        {...props}
      />
    )
  }
  ```

### shadcn/ui Components
- Import from `@/components/ui/`
- Use default styling (don't override unless necessary)
- Compose with custom props:
  ```typescript
  import { Button } from '@/components/ui/button'

  export function CTA() {
    return <Button>Get Started</Button>
  }
  ```

### Custom CSS (Rare)
Only when Tailwind cannot express the style. Use CSS modules or globals:

```css
/* src/styles/globals.css */
@layer components {
  .gradient-accent {
    @apply bg-gradient-to-r from-orange-500 via-red-500 to-blue-500;
  }
}

/* Or in CSS variables for reuse */
:root {
  --gradient-accent: linear-gradient(to right, #f97316, #ef4444, #3b82f6);
}

/* Usage */
<div className="gradient-accent">...</div>
<!-- or -->
<div style={{ background: 'var(--gradient-accent)' }}>...</div>
```

## State Management

### No Global State Store for Phase 1
- Use React Context for theme/settings (Phase 3)
- Local component state with `useState`
- Props for data flow (preferred)

### Future (Phase 4+)
- Consider Zustand or Redux if complex state needed
- Document state shape in `src/types/state.ts`

## Error Handling

### Try-Catch Pattern
```typescript
async function fetchProjects() {
  try {
    const response = await fetch('/api/projects')
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching projects:', error)
    // Return fallback or rethrow for page-level handling
    return []
  }
}
```

### Component Error Boundaries
```typescript
// error.tsx (Next.js error boundary)
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

## Import/Export Rules

### Named Exports Only
- Components: Named export (preferred)
- Utilities: Named exports
- Exceptions: Pages (`page.tsx`), layouts (`layout.tsx`) export default

```typescript
// GOOD
export function ProjectCard() { /* ... */ }
export function ProjectGrid() { /* ... */ }

// AVOID
export default ProjectCard
```

### Import Organization
Order by distance/scope:

```typescript
// 1. React imports
import { ReactNode, useState } from 'react'

// 2. External libraries
import { cn } from 'clsx'

// 3. App imports (sorted)
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/project-card'
import { utils } from '@/lib/utils'
import type { Project } from '@/types/project'

// 4. Local imports (same folder)
// None in this example
```

### Path Aliases
Always use `@/` alias instead of relative paths:

```typescript
// GOOD
import { utils } from '@/lib/utils'
import { ProjectCard } from '@/components/projects/project-card'

// AVOID
import { utils } from '../../../lib/utils'
import { ProjectCard } from './project-card'
```

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | ProjectCard, HeroSection |
| Functions | camelCase | fetchProjects, calculateSalary |
| Constants | UPPER_SNAKE_CASE | MAX_PROJECTS, API_BASE_URL |
| Variables | camelCase | projectList, isLoading |
| Boolean vars | is/has prefix | isLoading, hasError, isDarkMode |
| Type names | PascalCase | Project, ProjectCardProps |
| Filenames | kebab-case | project-card.tsx, api-client.ts |
| URLs/IDs | kebab-case | /projects, project-1, category-frontend |

## Comments & Documentation

### When to Comment
- **Why**, not what (code shows what, comments explain why)
- Complex algorithms or business logic
- Non-obvious performance optimizations
- Temporary workarounds with removal date

### Bad Comments (Avoid)
```typescript
// AVOID
// Increment i
i++

// Get the project
const project = getProject(id)
```

### Good Comments
```typescript
// Use kebab-case for URL slugs to match SEO standards
const slug = title.toLowerCase().replace(/\s+/g, '-')

// Cache projects for 1 hour to reduce database queries
// TODO: Replace with incremental cache invalidation (after Phase 3)
const projects = fetchAndCache(getProjects, 3600)

// Only show featured projects on homepage to reduce initial render time
const featured = projects.filter(p => p.featured === true)
```

### JSDoc (Optional, for Public APIs)
```typescript
/**
 * Fetches projects from the content file and filters by technology.
 * @param tech - Technology filter (e.g., 'React', 'TypeScript')
 * @returns Filtered projects, or empty array if tech not found
 */
export function getProjectsByTech(tech: string): Project[] {
  // ...
}
```

## Testing Conventions (Phase 3+)

### Unit Tests (Vitest)
```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils.cn()', () => {
  it('merges classNames correctly', () => {
    const result = cn('px-2', 'px-4')
    expect(result).toContain('px-4') // Last wins
  })
})
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('navigate from home to projects page', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('text=Projects')
  await expect(page).toHaveURL('/projects')
})
```

## Code Quality Tools

### ESLint
- Run before commit
- Config: extends `next/core-web-vitals`
- Disable rules only with comment: `// eslint-disable-next-line rule-name`

### Prettier
- Format on save (IDE integration)
- Config: 2-space indent, 80-char line length

### TypeScript Compiler
- Run `tsc --noEmit` in CI/CD
- All errors must be fixed, no `@ts-ignore` without reason

## Git Commit Messages

Use conventional commit format:

```
feat: add project filtering by technology
fix: correct header alignment on mobile devices
docs: update deployment guide for Phase 1
refactor: extract ProjectCard into separate component
test: add unit tests for utils.cn()
chore: upgrade Next.js to 15.1
```

## Secrets & Environment Variables

### .env.local (Never Commit)
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=...
```

### .env.example (Commit)
```
# Copy this file to .env.local and fill in values
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id-here
```

### Using in Code
```typescript
// src/lib/constants.ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
export const ANALYTICS_ID = process.env.NEXT_PUBLIC_ANALYTICS_ID || ''
```

## Security Standards

- No sensitive data in client-side code (API keys, secrets)
- Validate user inputs (Phase 4+)
- Use Content Security Policy headers (Phase 3+)
- Sanitize HTML content (if user-generated, Phase 4+)
- Never log sensitive data

## Performance Guidelines

- Components: Keep under 200 lines
- Images: Use Next.js `<Image>` component with proper sizing
- CSS: Use Tailwind (tree-shaking removes unused styles)
- JavaScript: Code split with dynamic imports when needed
- No large dependencies without justification

## Accessibility Standards

- Semantic HTML (`<button>`, `<nav>`, `<article>`, etc.)
- ARIA labels for screen readers when needed
- Color contrast: WCAG AA minimum (4.5:1 for text)
- Keyboard navigation support
- Alt text for all images

```typescript
// GOOD
<img src="..." alt="Kane Nguyen's portfolio photo" />
<button aria-label="Open mobile menu">☰</button>
<nav aria-label="Main navigation">...</nav>

// AVOID
<img src="..." alt="image" />
<div onClick={handleClick}>☰</div>
```

## SEO & Metadata Standards (Phase 3+)

### JSON-LD Schema Markup
Always use `src/components/seo/json-ld.tsx` components for structured data:

```typescript
// Homepage (PersonJsonLd)
import { PersonJsonLd } from '@/components/seo/json-ld'

export default function Home() {
  return (
    <>
      <PersonJsonLd />
      {/* page content */}
    </>
  )
}

// Blog/Diary detail pages (ArticleJsonLd)
import { ArticleJsonLd } from '@/components/seo/json-ld'

export default function BlogPost({ post }) {
  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        datePublished={post.date}
        dateModified={post.updated}
        url={`${SITE_URL}/blog/${post.slug}`}
        image={post.image}
      />
      {/* post content */}
    </>
  )
}
```

**Safety Notes:**
- Always use the `safeJsonLd()` utility to escape `<` characters and prevent XSS
- Avoid hardcoding JSON-LD; use component props for dynamic content
- Validate schema at schema.org/validator

### Metadata Configuration
In `app/layout.tsx`, configure metadata export:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kane Nguyen — Software Engineer',
    template: '%s | Kane Nguyen',
  },
  description: 'Portfolio and blog of Kane Nguyen, Software Engineer',
  openGraph: {
    title: 'Kane Nguyen — Software Engineer',
    description: 'Portfolio and blog',
    url: SITE_URL,
    type: 'website',
    images: [{ url: `${SITE_URL}/images/og-default.png` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kane Nguyen',
    description: 'Portfolio and blog',
    images: [`${SITE_URL}/images/og-default.png`],
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
    },
  },
  robots: 'index, follow',
}
```

### Sitemap & Robots
- **sitemap.ts:** Generate dynamically with all routes, priorities, and lastModified dates
- **robots.ts:** Configure user-agent rules and sitemap reference
- **Both:** Use MetadataRoute pattern (Next.js 14+)

## MDX Content Standards (Phase 2+)

### File Organization
- Blog posts: `/content/blog/{slug}.mdx`
- Diary entries: `/content/diary/{slug}.mdx`
- Slugs auto-generated from title (kebab-case)

### Frontmatter Schema

**Blog Posts**
```yaml
---
title: "Post Title"                    # Max 120 chars
slug: "post-slug"                      # Auto-generated
description: "Brief summary"           # Max 260 chars
date: "2026-03-16"                     # ISO date (YYYY-MM-DD)
updated: "2026-03-20"                  # Optional
tags: ["tag1", "tag2", "tag3"]        # Array of strings
published: true                        # Default true
image: "/images/posts/cover.jpg"      # Optional cover image
---
```

**Diary Entries**
```yaml
---
title: "Entry Title"                   # Max 120 chars
slug: "entry-slug"                     # Auto-generated
description: "Optional summary"        # Max 260 chars
date: "2026-03-16"                     # ISO date (YYYY-MM-DD)
mood: "happy"                          # One of: happy, sad, reflective, grateful, motivated
published: false                       # Default false (private by default)
---
```

### MDX Content Guidelines
- Use markdown for formatting (headings, bold, italic, lists, etc.)
- Use GitHub-flavored markdown (tables, strikethrough, task lists)
- Code blocks with language syntax highlighting:
  ```typescript
  export function MyComponent() { /* ... */ }
  ```
- Headings create automatic anchor links (slugified IDs)
- Images: Use relative paths to `/public` (e.g., `/images/posts/example.jpg`)
- Reading time auto-calculated (word count ÷ 200, rounded up)

### Phase 2 MDX Features
- Syntax highlighting with `rehype-pretty-code` (github-dark theme)
- Auto-generated heading IDs (for table of contents)
- Auto-linked headings to their IDs
- GitHub-flavored markdown tables, strikethrough, etc.
- No custom React components yet (Phase 3+)

## NestJS Backend (Phase 4A+)

### Project Structure
```
apps/api/src/
├── main.ts                 # Entry point, port 3001
├── app.module.ts           # Root module
├── {feature}/
│   ├── {feature}.module.ts # Feature module
│   ├── {feature}.service.ts
│   ├── {feature}.resolver.ts (GraphQL)
│   ├── dto/
│   │   ├── create-{feature}.input.ts
│   │   └── update-{feature}.input.ts
│   └── entities/
│       └── {feature}.entity.ts
├── auth/
│   ├── auth.module.ts
│   ├── jwt.guard.ts
│   ├── jwt.strategy.ts
│   └── auth.service.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── graphql/
    └── schema.gql (auto-generated)
```

### Module Pattern
Each feature (posts, projects, categories, tags, series) follows this structure:

```typescript
// Feature module bundles service + resolver
@Module({
  providers: [FeatureService, FeatureResolver],
  exports: [FeatureService], // For other modules
})
export class FeatureModule {}
```

### Service Pattern
Services contain business logic and database access:

```typescript
@Injectable()
export class FeatureService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feature.findMany()
  }

  async create(data: CreateFeatureInput) {
    return this.prisma.feature.create({ data })
  }
}
```

### Resolver Pattern (GraphQL Code-First)
Resolvers define queries and mutations using decorators:

```typescript
@Resolver(() => Feature)
export class FeatureResolver {
  constructor(private featureService: FeatureService) {}

  @Query(() => [Feature])
  async features() {
    return this.featureService.findAll()
  }

  @Mutation(() => Feature)
  @UseGuards(JwtGuard)
  async createFeature(@Args('input') input: CreateFeatureInput) {
    return this.featureService.create(input)
  }
}
```

### DTO Pattern
Input types for GraphQL mutations:

```typescript
@InputType()
export class CreateFeatureInput {
  @Field()
  title: string

  @Field()
  description: string

  @Field(() => [String])
  tags: string[]
}
```

### GraphQL Types (Entities)
Exported as GraphQL types:

```typescript
@ObjectType()
export class Feature {
  @Field()
  id: string

  @Field()
  title: string

  @Field()
  description: string

  @Field(() => Date)
  createdAt: Date
}
```

### JWT Authentication Guard
Protects mutations:

```typescript
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context)
    const { authorization } = ctx.getContext().req.headers

    if (!authorization) return false
    const token = authorization.replace('Bearer ', '')
    return !!this.jwtService.verify(token)
  }
}
```

### Naming Conventions (NestJS)
- **Modules:** `{feature}.module.ts`
- **Services:** `{feature}.service.ts`
- **Resolvers:** `{feature}.resolver.ts` (GraphQL) or `{feature}.controller.ts` (REST)
- **Guards:** `{name}.guard.ts`
- **DTOs:** `create-{feature}.input.ts`, `update-{feature}.input.ts`
- **Entities:** `{feature}.entity.ts` or `{feature}.type.ts` (for GraphQL)

### File Size Limits
- **Services:** Max 300 lines (with multiple methods)
- **Resolvers:** Max 200 lines
- **Guards/Strategies:** Max 100 lines
- **DTOs:** Max 50 lines

When exceeding limits, extract logic into separate utilities or sub-services.

## Prisma ORM (Phase 4A+)

### Schema Location
`packages/prisma/schema.prisma` — Shared across monorepo

### Relations Pattern
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String   // TipTap JSON
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])

  comments Comment[]  // One-to-many
  likes    Like[]
}
```

### Naming Conventions (Prisma)
- **Models:** PascalCase (e.g., `Post`, `User`, `Category`)
- **Fields:** camelCase (e.g., `createdAt`, `authorId`)
- **Relations:** singular (author, not authors)
- **Enums:** UPPER_SNAKE_CASE (e.g., `PostType`, `Role`)

### Generated Client Usage
```typescript
// In service
import { PrismaClient } from '@prisma/client'

const post = await prisma.post.findUnique({ where: { id: '1' } })
const posts = await prisma.post.findMany({ include: { author: true } })
```

### Migrations
```bash
# After schema changes
pnpm db:migrate

# Check migration status
pnpm db:status

# Reset database (dev only!)
pnpm db:reset
```

## Summary: YAGNI / KISS / DRY

| Principle | Application |
|-----------|-------------|
| YAGNI | Don't add features/config until needed. Ship in phases. |
| KISS | Simple code > clever code. Prioritize readability. |
| DRY | Extract repeated logic into utilities or components. |

Keep the codebase minimal, focused, and easy to understand. Complexity should be earned, not assumed.
