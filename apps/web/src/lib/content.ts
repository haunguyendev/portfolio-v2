import type { Project, SkillGroup, Experience, Certificate } from '@/types'
import type { DiaryMood } from './diary-constants'
import projectsData from '@/content/projects.json'
import skillsData from '@/content/skills.json'
import experienceData from '@/content/experience.json'
import certificatesData from '@/content/certificates.json'
// Velite generates JSON files — use default import (JSON modules have no named exports)
import blogsData from '#site/blogs'
import diariesData from '#site/diaries'

// --- Blog & Diary types ---

export interface Blog {
  title: string
  slug: string
  description: string
  date: string
  updated?: string
  tags: string[]
  published: boolean
  image?: string
  body: string
  readingTime: number
}

export interface Diary {
  title: string
  slug: string
  description?: string
  date: string
  mood: DiaryMood
  published: boolean
  body: string
  readingTime: number
}

const blogs = blogsData as Blog[]
const diaries = diariesData as Diary[]

const projects = projectsData as Project[]
const skills = skillsData as SkillGroup[]
const experience = experienceData as Experience[]
const certificates = certificatesData as Certificate[]

// --- Project helpers ---

export function getProjects(): Project[] {
  return projects
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured)
}

export function getAllTechnologies(): string[] {
  const techs = new Set<string>()
  projects.forEach((p) => p.technologies.forEach((t) => techs.add(t)))
  return Array.from(techs).sort()
}

export function getProjectsByTechnology(tech: string): Project[] {
  return projects.filter((p) =>
    p.technologies.some((t) => t.toLowerCase() === tech.toLowerCase()),
  )
}

export function getSkills(): SkillGroup[] {
  return skills
}

export function getExperience(): Experience[] {
  return experience
}

export function getCertificates(): Certificate[] {
  return certificates
    .filter((c) => c.published)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// --- Blog helpers ---

export function getBlogs(): Blog[] {
  return blogs
    .filter((b) => b.published)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
}

export function getBlogBySlug(slug: string): Blog | undefined {
  return blogs.find((b) => b.slug === slug && b.published)
}

export function getAllBlogTags(): string[] {
  const tags = new Set<string>()
  blogs
    .filter((b) => b.published)
    .forEach((b) => b.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}

// --- Diary helpers ---

const isDev = process.env.NODE_ENV === 'development'

export function getDiaries(): Diary[] {
  return diaries
    .filter((d) => isDev || d.published)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
}

export function getDiaryBySlug(slug: string): Diary | undefined {
  const entry = diaries.find((d) => d.slug === slug)
  if (!entry) return undefined
  if (!isDev && !entry.published) return undefined
  return entry
}
