'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProjectFilterProps {
  technologies: string[]
  selectedTech: string | null
  onFilterChange: (tech: string | null) => void
}

export function ProjectFilter({
  technologies,
  selectedTech,
  onFilterChange,
}: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" button */}
      <button
        onClick={() => onFilterChange(null)}
        type="button"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        aria-pressed={selectedTech === null}
      >
        <Badge
          variant={selectedTech === null ? 'default' : 'secondary'}
          className={cn(
            'cursor-pointer',
            selectedTech === null && 'bg-zinc-900 text-white hover:bg-zinc-800',
          )}
        >
          All
        </Badge>
      </button>

      {/* Tech filter buttons */}
      {technologies.map((tech) => {
        const isActive = selectedTech === tech
        return (
          <button
            key={tech}
            onClick={() => onFilterChange(isActive ? null : tech)}
            type="button"
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            aria-pressed={isActive}
          >
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={cn(
                'cursor-pointer',
                isActive && 'bg-zinc-900 text-white hover:bg-zinc-800',
              )}
            >
              {tech}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}
