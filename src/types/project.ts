export interface ProjectLink {
  github?: string
  demo?: string
  blog?: string
}

export interface Project {
  id: string
  title: string
  description: string
  longDescription: string
  image: string
  technologies: string[]
  featured: boolean
  links: ProjectLink
}
