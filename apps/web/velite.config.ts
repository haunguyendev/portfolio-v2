import { defineConfig, defineCollection, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

// Auto-calculate reading time from MDX body content
const computedFields = <T extends { body: string }>(data: T) => ({
  ...data,
  readingTime: Math.ceil(data.body.split(/\s+/).length / 200),
})

const blogs = defineCollection({
  name: 'Blog',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('blog'),
      description: s.string().max(260),
      date: s.isodate(),
      updated: s.isodate().optional(),
      tags: s.array(s.string()).default([]),
      published: s.boolean().default(true),
      image: s.string().optional(),
      body: s.mdx(),
    })
    .transform(computedFields),
})

const diaries = defineCollection({
  name: 'Diary',
  pattern: 'diary/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('diary'),
      description: s.string().max(260).optional(),
      date: s.isodate(),
      mood: s.enum(['happy', 'sad', 'reflective', 'grateful', 'motivated']),
      published: s.boolean().default(false),
      body: s.mdx(),
    })
    .transform(computedFields),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { blogs, diaries },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark-default' }],
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
  },
})
