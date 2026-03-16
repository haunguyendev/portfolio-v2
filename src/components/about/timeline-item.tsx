// Single experience entry in the timeline with vertical connector line and dot
import type { Experience } from '@/types'

interface TimelineItemProps {
  experience: Experience
  isLast?: boolean
}

export function TimelineItem({ experience, isLast = false }: TimelineItemProps) {
  const { role, company, duration, description, highlights } = experience

  return (
    <div className="relative pl-8 pb-8">
      {/* Vertical connector line — hidden on last item */}
      {!isLast && (
        <div className="absolute left-[7px] top-3 bottom-0 w-px bg-zinc-200" />
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-border bg-background" />

      {/* Content */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">{role}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{duration}</p>
        <p className="text-base text-foreground mt-1 font-medium">{company}</p>
        <p className="text-base text-muted-foreground leading-relaxed mt-2">
          {description}
        </p>

        {highlights.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400"
                  aria-hidden="true"
                />
                <span className="text-sm text-muted-foreground leading-relaxed">
                  {highlight}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
