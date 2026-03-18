import { gql, GraphQLClient } from 'graphql-request'
import type { Blog, Diary } from './content'
import type { Project } from '@/types'
import { DIARY_MOODS, type DiaryMood } from './diary-constants'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/** Resolve /api/media/* paths — kept relative so Next.js rewrites proxy to API */
function resolveMediaUrl(path?: string): string {
  if (!path) return ''
  return path
}

function client() {
  return new GraphQLClient(`${API_URL}/graphql`)
}

// --- GraphQL queries ---

const POSTS_LIST_QUERY = gql`
  query PublicPosts($filter: PostsFilterInput) {
    posts(filter: $filter) {
      id slug title description coverImage published featured
      type mood readingTime createdAt updatedAt
      tags { name }
      category { name }
    }
  }
`

const POST_BY_SLUG_QUERY = gql`
  query PublicPostBySlug($slug: String!) {
    postBySlug(slug: $slug) {
      id slug title description content coverImage published featured
      type mood readingTime createdAt updatedAt metaTitle metaDesc ogImage
      tags { id name }
      category { id name }
      series { id title slug }
    }
  }
`

const PROJECTS_QUERY = gql`
  query PublicProjects($featuredOnly: Boolean) {
    projects(featuredOnly: $featuredOnly) {
      id slug title description longDesc image technologies category
      github demo featured sortOrder role teamSize impact startDate endDate createdAt
    }
  }
`

// --- API types ---

interface ApiPost {
  id: string
  slug: string
  title: string
  description?: string
  content?: unknown
  coverImage?: string
  published: boolean
  featured: boolean
  type: 'BLOG' | 'DIARY'
  mood?: string
  readingTime?: number
  createdAt: string
  updatedAt: string
  metaTitle?: string
  metaDesc?: string
  ogImage?: string
  tags?: { id?: string; name: string }[]
  category?: { id?: string; name: string }
  series?: { id: string; title: string; slug: string }
}

interface ApiProject {
  id: string
  slug: string
  title: string
  description: string
  longDesc?: string
  image?: string
  technologies: string[]
  category?: string
  github?: string
  demo?: string
  featured: boolean
  sortOrder: number
  role?: string
  teamSize?: string
  impact?: string
  startDate?: string
  endDate?: string
  createdAt: string
}

// --- Mappers ---

function mapPostToBlog(post: ApiPost): Blog & { id: string; coverImage?: string } {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description ?? '',
    date: post.createdAt,
    updated: post.updatedAt,
    tags: post.tags?.map((t) => t.name) ?? [],
    published: post.published,
    image: resolveMediaUrl(post.coverImage),
    body: '', // TipTap JSON content stored separately
    readingTime: post.readingTime ?? 1,
  }
}

function mapPostToDiary(post: ApiPost): Diary & { id: string; coverImage?: string } {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    date: post.createdAt,
    mood: (post.mood && post.mood in DIARY_MOODS ? post.mood : 'reflective') as DiaryMood,
    published: post.published,
    body: '',
    readingTime: post.readingTime ?? 1,
  }
}

function mapProject(p: ApiProject): Project {
  // Normalize category to match static type ('Personal' | 'Company' | 'Freelance')
  let category: Project['category'] = undefined
  if (p.category === 'company') category = 'Company'
  else if (p.category === 'personal') category = 'Personal'
  else if (p.category === 'freelance') category = 'Freelance'
  else if (p.category) category = p.category as Project['category']

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    longDescription: p.longDesc ?? '',
    image: resolveMediaUrl(p.image),
    technologies: p.technologies,
    featured: p.featured,
    category,
    links: {
      github: p.github,
      demo: p.demo,
    },
    role: p.role,
    teamSize: p.teamSize,
    impact: p.impact,
    startDate: p.startDate,
    endDate: p.endDate,
  }
}

// --- Public API functions ---

export async function apiGetBlogs(): Promise<(Blog & { id: string; coverImage?: string })[]> {
  try {
    const data = await client().request<{ posts: ApiPost[] }>(POSTS_LIST_QUERY, {
      filter: { type: 'BLOG', published: true },
    })
    return data.posts.map(mapPostToBlog)
  } catch {
    return []
  }
}

export async function apiGetBlogBySlug(
  slug: string,
): Promise<((Blog & { id: string; content: unknown; coverImage?: string }) | undefined)> {
  try {
    const data = await client().request<{ postBySlug: ApiPost | null }>(POST_BY_SLUG_QUERY, { slug })
    if (!data.postBySlug || data.postBySlug.type !== 'BLOG') return undefined
    const post = data.postBySlug
    return { ...mapPostToBlog(post), content: post.content }
  } catch {
    return undefined
  }
}

export async function apiGetDiaries(): Promise<(Diary & { id: string; coverImage?: string })[]> {
  try {
    const data = await client().request<{ posts: ApiPost[] }>(POSTS_LIST_QUERY, {
      filter: { type: 'DIARY', published: true },
    })
    return data.posts.map(mapPostToDiary)
  } catch {
    return []
  }
}

export async function apiGetDiaryBySlug(
  slug: string,
): Promise<((Diary & { id: string; content: unknown; coverImage?: string }) | undefined)> {
  try {
    const data = await client().request<{ postBySlug: ApiPost | null }>(POST_BY_SLUG_QUERY, { slug })
    if (!data.postBySlug || data.postBySlug.type !== 'DIARY') return undefined
    const post = data.postBySlug
    return { ...mapPostToDiary(post), content: post.content }
  } catch {
    return undefined
  }
}

export async function apiGetProjects(featuredOnly?: boolean): Promise<Project[]> {
  try {
    const data = await client().request<{ projects: ApiProject[] }>(PROJECTS_QUERY, {
      featuredOnly: featuredOnly ?? null,
    })
    return data.projects.map(mapProject)
  } catch {
    return []
  }
}

export async function apiGetAllBlogTags(): Promise<string[]> {
  const blogs = await apiGetBlogs()
  const tags = new Set<string>()
  blogs.forEach((b) => b.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}
