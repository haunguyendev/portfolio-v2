import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProjectCard } from '@/components/projects/project-card'
import { getFeaturedProjects } from '@/lib/content'

export function FeaturedProjectsSection() {
  const projects = getFeaturedProjects()

  return (
    <section className="section-spacing bg-muted">
      <div className="container-main">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Featured Projects
          </h2>
          <Link
            href="/projects"
            className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            View All
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View All Projects
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
