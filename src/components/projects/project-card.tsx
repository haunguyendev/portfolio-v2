import Image from 'next/image'
import { Github, ExternalLink, User, Users, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {project.image && (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-6">
        <h3 className="text-base font-semibold text-foreground transition-colors group-hover:text-muted-foreground">
          {project.title}
        </h3>

        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Project metadata: role, team size, impact */}
        {(project.role || project.teamSize || project.impact) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {project.role && (
              <span className="inline-flex items-center gap-1">
                <User className="size-3" aria-hidden="true" />
                <span className="sr-only">Role: </span>
                {project.role}
              </span>
            )}
            {project.teamSize && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3" aria-hidden="true" />
                <span className="sr-only">Team: </span>
                {project.teamSize}
              </span>
            )}
            {project.impact && (
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="size-3" aria-hidden="true" />
                <span className="sr-only">Impact: </span>
                {project.impact}
              </span>
            )}
          </div>
        )}

        {/* Tech badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Links */}
        {(project.links.github || project.links.demo) && (
          <div className="flex gap-3 pt-1">
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="size-3.5" />
                Code
              </a>
            )}
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                Demo
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
