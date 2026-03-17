# Phase 4: GraphQL API

## Overview
- **Priority:** HIGH
- **Status:** Complete
- **Effort:** 5h
- **Blocked by:** Phase 2 (Prisma models), Phase 3 (auth guard for mutations)

Build GraphQL API (code-first) for all content types: posts, projects, categories, tags, series. REST endpoint only for health check (already done) and future media upload.

## Architecture

```
apps/api/src/
├── app.module.ts          # imports all modules
├── graphql/
│   └── graphql.module.ts  # GraphQL config (code-first, playground)
├── posts/
│   ├── posts.module.ts
│   ├── posts.service.ts   # Prisma CRUD logic
│   ├── posts.resolver.ts  # GraphQL resolvers
│   ├── dto/
│   │   ├── create-post.input.ts
│   │   ├── update-post.input.ts
│   │   └── post-filter.input.ts
│   └── models/
│       └── post.model.ts  # @ObjectType()
├── projects/
│   ├── projects.module.ts
│   ├── projects.service.ts
│   ├── projects.resolver.ts
│   ├── dto/
│   └── models/
├── categories/
│   ├── categories.module.ts
│   ├── categories.service.ts
│   ├── categories.resolver.ts
│   ├── dto/
│   └── models/
├── tags/
│   ├── tags.module.ts
│   ├── tags.service.ts
│   ├── tags.resolver.ts
│   ├── dto/
│   └── models/
└── series/
    ├── series.module.ts
    ├── series.service.ts
    ├── series.resolver.ts
    ├── dto/
    └── models/
```

## Implementation Steps

### 1. GraphQL module setup
- `pnpm --filter api add @nestjs/graphql @nestjs/apollo @apollo/server graphql`
- Create `graphql.module.ts` — code-first approach, auto-schema generation
- Config: playground enabled in dev, CORS, context with request

### 2. Posts module (Blog + Diary)
- **Model**: `Post` ObjectType — matches Prisma schema
- **Queries** (public):
  - `posts(type: PostType, published: true, limit, offset)` — list with filters
  - `post(slug: String!)` — single by slug
  - `postsByCategory(categorySlug: String!)` — filter by category
  - `postsBySeries(seriesSlug: String!)` — posts in a series
- **Mutations** (auth required — @UseGuards(JwtAuthGuard)):
  - `createPost(input: CreatePostInput!)` — create draft
  - `updatePost(id: String!, input: UpdatePostInput!)` — update
  - `deletePost(id: String!)` — soft or hard delete
  - `publishPost(id: String!)` — set published = true + publishedAt
- **Field resolvers**: `tags`, `category`, `series`, `author`, `comments`, `_count.likes`, `_count.views`

### 3. Projects module
- **Queries**: `projects(featured: Boolean)`, `project(slug: String!)`
- **Mutations** (auth): `createProject`, `updateProject`, `deleteProject`, `reorderProjects`
- **Model**: matches Prisma Project schema

### 4. Categories module
- **Queries**: `categories` (all with post count), `category(slug: String!)`
- **Mutations** (auth): `createCategory`, `updateCategory`, `deleteCategory`

### 5. Tags module
- **Queries**: `tags` (all with post count), `tag(slug: String!)`
- **Mutations** (auth): `createTag`, `deleteTag`
- Auto-create tags on post create/update if not exist

### 6. Series module
- **Queries**: `seriesList(published: Boolean)`, `series(slug: String!)` with ordered posts
- **Mutations** (auth): `createSeries`, `updateSeries`, `deleteSeries`

### 7. Pagination + filtering
- Use cursor-based or offset pagination
- Filter inputs: `PostFilterInput { type, published, categoryId, tagIds, search }`
- Sort: `createdAt`, `publishedAt`, `title`

### 8. GraphQL playground + testing
- Access playground at `http://localhost:3001/graphql`
- Test all queries and mutations manually
- Verify auth: mutations without JWT → 401

## Key Code Snippets

```typescript
// posts.resolver.ts (example)
@Resolver(() => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query(() => [Post])
  async posts(@Args('filter', { nullable: true }) filter?: PostFilterInput) {
    return this.postsService.findAll(filter)
  }

  @Query(() => Post, { nullable: true })
  async post(@Args('slug') slug: string) {
    return this.postsService.findBySlug(slug)
  }

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('input') input: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    return this.postsService.create(input, user.id)
  }
}
```

## Todo List
- [x] Install GraphQL packages
- [x] Create GraphQL module config (code-first, playground)
- [x] Create Post model + DTOs (create, update, filter)
- [x] Create PostsService with Prisma CRUD
- [x] Create PostsResolver (queries + mutations)
- [x] Create Project model + service + resolver
- [x] Create Category model + service + resolver
- [x] Create Tag model + service + resolver
- [x] Create Series model + service + resolver
- [x] Add JwtAuthGuard to all mutations
- [x] Test: all queries return data
- [x] Test: mutations with JWT succeed
- [x] Test: mutations without JWT return 401
- [x] Verify GraphQL playground works

## Success Criteria
- GraphQL playground accessible at `/graphql`
- All CRUD queries/mutations work
- Mutations protected by JWT auth
- Posts queryable by type, category, tag, series, search
- Pagination working (offset-based)
- Field resolvers load relations correctly (no N+1)

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|-----------|
| N+1 query problem | MED | Use Prisma `include` in service, or DataLoader |
| Code-first schema drift | LOW | Prisma types → GraphQL models stay aligned |
| Large schema complexity | MED | Start with Posts + Projects, add others incrementally |
