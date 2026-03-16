import type { Project, SkillGroup, Experience } from '@/types'
import projectsData from '@/content/projects.json'
import skillsData from '@/content/skills.json'
import experienceData from '@/content/experience.json'

const projects = projectsData as Project[]
const skills = skillsData as SkillGroup[]
const experience = experienceData as Experience[]

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
