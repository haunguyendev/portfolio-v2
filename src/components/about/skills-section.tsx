// Skills section displaying grouped skill badges fetched from content
import { Badge } from '@/components/ui/badge'
import { getSkills } from '@/lib/content'

export function SkillsSection() {
  const skillGroups = getSkills()

  return (
    <section className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Skills
      </h2>

      <div className="space-y-6">
        {skillGroups.map((group) => (
          <div key={group.category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
