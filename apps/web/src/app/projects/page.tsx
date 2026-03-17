import type { Metadata } from 'next'
import { AnimatedPageTitle } from '@/components/ui/animated-page-title'
import { apiGetProjects } from '@/lib/api-client'
import { ProjectsPageContent } from './projects-page-content'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'A collection of projects I have built — from web apps to open source tools.',
}

export default async function ProjectsPage() {
  const projects = await apiGetProjects()
  const technologies = Array.from(
    new Set(projects.flatMap((p) => p.technologies)),
  ).sort()

  return (
    <section className="section-spacing">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-10">
          <AnimatedPageTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Projects
          </AnimatedPageTitle>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Things I have built — side projects, open source contributions, and
            professional work. Filter by technology to find what interests you.
          </p>
        </div>

        <ProjectsPageContent projects={projects} technologies={technologies} />
      </div>
    </section>
  )
}
