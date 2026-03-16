import type { Metadata } from 'next'
import { getProjects, getAllTechnologies } from '@/lib/content'
import { ProjectsPageContent } from './projects-page-content'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A collection of projects I have built — from web apps to open source tools.',
}

export default function ProjectsPage() {
  const projects = getProjects()
  const technologies = getAllTechnologies()

  return (
    <section className="section-spacing">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Projects
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-500">
            Things I have built — side projects, open source contributions, and
            professional work. Filter by technology to find what interests you.
          </p>
        </div>

        <ProjectsPageContent projects={projects} technologies={technologies} />
      </div>
    </section>
  )
}
