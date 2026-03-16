'use client'

import { DIARY_MOODS, type DiaryMood } from '@/lib/diary-constants'

interface DiaryMoodFilterProps {
  activeMoods: DiaryMood[]
  onToggleMood: (mood: DiaryMood) => void
  onClearAll: () => void
}

const allMoods = Object.keys(DIARY_MOODS) as DiaryMood[]

export function DiaryMoodFilter({
  activeMoods,
  onToggleMood,
  onClearAll,
}: DiaryMoodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onClearAll}
        type="button"
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
          activeMoods.length === 0
            ? 'border-foreground bg-foreground text-background'
            : 'border-border text-muted-foreground hover:text-foreground'
        }`}
      >
        All
      </button>
      {allMoods.map((mood) => {
        const config = DIARY_MOODS[mood]
        const isActive = activeMoods.includes(mood)
        return (
          <button
            key={mood}
            onClick={() => onToggleMood(mood)}
            type="button"
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{config.emoji}</span>
            {config.label}
          </button>
        )
      })}
    </div>
  )
}
