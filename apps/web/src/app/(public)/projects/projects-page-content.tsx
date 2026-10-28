'use client'

import { useState } from 'react'
import type { Project } from '@/types'
import { ProjectFilter } from '@/components/projects/project-filter'
import { ProjectGrid } from '@/components/projects/project-grid'

interface ProjectsPageContentProps {
  projects: Project[]
  technologies: string[]
}

export function ProjectsPageContent({
  projects,
  technologies,
}: ProjectsPageContentProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  const filtered =
    selectedTech === null
      ? projects
      : projects.filter((p) =>
          p.technologies.some(
            (t) => t.toLowerCase() === selectedTech.toLowerCase(),
          ),
        )

  return (
    <>
      <div className="mb-8">
        <ProjectFilter
          technologies={technologies}
          selectedTech={selectedTech}
          onFilterChange={setSelectedTech}
        />
      </div>
      <ProjectGrid projects={filtered} />
    </>
  )
}
