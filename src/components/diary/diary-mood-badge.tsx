import { Badge } from '@/components/ui/badge'
import { DIARY_MOODS, type DiaryMood } from '@/lib/diary-constants'

interface DiaryMoodBadgeProps {
  mood: DiaryMood
}

export function DiaryMoodBadge({ mood }: DiaryMoodBadgeProps) {
  const config = DIARY_MOODS[mood]

  return (
    <Badge variant="outline" className="gap-1">
      <span className={config.color}>{config.emoji}</span>
      {config.label}
    </Badge>
  )
}
