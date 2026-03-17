# Phase 5: Admin Dashboard

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 6h
- **Blocked by:** Phase 3 (auth), Phase 4 (GraphQL API)

Build admin dashboard UI in Next.js using shadcn/ui. Sidebar navigation, dashboard overview, CRUD pages for posts and projects, TipTap rich text editor.

## Architecture

```
apps/web/src/app/(admin)/
├── layout.tsx              # Admin layout: sidebar + main content
├── admin/
│   ├── page.tsx            # Dashboard overview (stats cards)
│   ├── posts/
│   │   ├── page.tsx        # Post list (table with filters)
│   │   ├── new/page.tsx    # Create post (TipTap editor)
│   │   └── [id]/
│   │       └── edit/page.tsx # Edit post
│   ├── projects/
│   │   ├── page.tsx        # Project list
│   │   ├── new/page.tsx    # Create project
│   │   └── [id]/
│   │       └── edit/page.tsx
│   ├── categories/
│   │   └── page.tsx        # Category management (inline CRUD)
│   ├── tags/
│   │   └── page.tsx        # Tag management (inline CRUD)
│   ├── series/
│   │   ├── page.tsx        # Series list
│   │   └── new/page.tsx    # Create/edit series
│   └── settings/
│       └── page.tsx        # Site settings (future)

apps/web/src/components/admin/
├── admin-sidebar.tsx       # Sidebar navigation
├── admin-header.tsx        # Top bar (user avatar, logout)
├── post-form.tsx           # Post create/edit form with TipTap
├── project-form.tsx        # Project create/edit form
├── data-table.tsx          # Reusable data table (shadcn/ui)
├── stat-card.tsx           # Dashboard stat card
└── tiptap-editor.tsx       # TipTap editor component
```

## Implementation Steps

### 1. Admin layout
- `(admin)/layout.tsx`: sidebar + main content area + auth check
- Sidebar: shadcn/ui navigation (Dashboard, Posts, Projects, Categories, Tags, Series, Settings)
- Header: user name, avatar, logout button
- Responsive: sidebar collapses on mobile

### 2. GraphQL client setup
- Install `@apollo/client` or use `graphql-request` (lighter)
- Create `apps/web/src/lib/graphql-client.ts` — configured with NestJS API URL + auth header
- Create query/mutation hooks or utilities

### 3. Dashboard page
- 4 stat cards: Total Posts, Published, Total Projects, Draft count
- Recent posts table (last 5)
- Quick actions: New Post, New Project

### 4. Posts list page
- shadcn/ui DataTable with columns: Title, Type (Blog/Diary), Status, Category, Date, Actions
- Filters: type (blog/diary), status (draft/published), category
- Search by title
- Actions: Edit, Publish/Unpublish, Delete (with confirmation dialog)
- Pagination

### 5. Post create/edit form
- Title input
- Slug input (auto-generate from title, editable)
- Type selector: Blog / Diary
- Category dropdown (from API)
- Tags multi-select (from API, create new inline)
- Series dropdown + order number
- Mood selector (diary only, conditional)
- Description/excerpt textarea
- **TipTap editor** for content (main body)
- Cover image URL input (text for now, media picker in Phase 4B)
- Featured toggle
- Published toggle + scheduled date picker
- SEO fields: meta title, meta description, OG image URL
- Save as Draft / Publish buttons

### 6. TipTap editor component
- `pnpm --filter web add @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-code-block-lowlight @tiptap/extension-link @tiptap/extension-placeholder`
- Toolbar: Bold, Italic, Headings (H2, H3), Bullet list, Ordered list, Code block, Image, Link, Blockquote, Divider
- Output: JSON (stored in DB)
- For display on public pages: `@tiptap/html` to convert JSON → HTML, or render with `generateHTML()`

### 7. Projects list + form
- Similar to posts but simpler fields
- Fields: title, slug, description, long description, image, technologies (tag input), category (personal/company/freelance), github URL, demo URL, featured, sort order
- Drag-to-reorder via sortOrder field

### 8. Categories + Tags pages
- Inline CRUD (no separate create page)
- Categories: name, slug, description, color picker, sort order
- Tags: name, slug, delete (with post count warning)

## Todo List
- [x] Install TipTap packages in apps/web
- [x] Install GraphQL client (graphql-request or urql)
- [x] Create admin layout (sidebar + header)
- [x] Create GraphQL client utility with auth
- [x] Create dashboard page with stat cards
- [x] Create data table component (reusable)
- [x] Create posts list page with filters
- [x] Create TipTap editor component
- [x] Create post create/edit form
- [x] Create projects list page
- [x] Create project create/edit form
- [x] Create categories management page
- [x] Create tags management page
- [x] Create series management page
- [x] Test: full CRUD flow for posts
- [x] Test: full CRUD flow for projects
- [x] Test: TipTap editor saves/loads JSON correctly

## Success Criteria
- Admin sidebar navigates between all sections
- Posts: create with TipTap, save, edit, publish, delete
- Projects: full CRUD with all fields
- Categories/Tags: inline create, edit, delete
- TipTap JSON saves to DB and loads back correctly
- Dashboard shows accurate stats from API
- All pages responsive

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| TipTap JSON rendering on public pages | MED | Use generateHTML() with same extensions |
| Large form complexity (post editor) | MED | Break into sections, use tabs |
| GraphQL client cache issues | LOW | Use simple fetch, no aggressive caching in admin |
