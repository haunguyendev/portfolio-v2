// Experience timeline that renders ordered list of TimelineItem entries
import { getExperience } from '@/lib/content'
import { TimelineItem } from './timeline-item'

export function Timeline() {
  const experience = getExperience()

  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">
        Experience
      </h2>

      <div>
        {experience.map((entry, index) => (
          <TimelineItem
            key={`${entry.company}-${entry.role}`}
            experience={entry}
            isLast={index === experience.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
