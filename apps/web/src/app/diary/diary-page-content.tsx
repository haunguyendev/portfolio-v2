'use client'

import { useState, useMemo } from 'react'
import { SearchInput } from '@/components/shared/search-input'
import { DiaryMoodFilter } from '@/components/diary/diary-mood-filter'
import { DiaryEntryList } from '@/components/diary/diary-entry-list'
import type { DiaryMood } from '@/lib/diary-constants'
import type { Diary } from '@/lib/content'

interface DiaryPageContentProps {
  entries: Diary[]
}

export function DiaryPageContent({ entries }: DiaryPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMoods, setActiveMoods] = useState<DiaryMood[]>([])

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Keyword filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesKeyword =
          entry.title.toLowerCase().includes(q) ||
          (entry.description?.toLowerCase().includes(q) ?? false)
        if (!matchesKeyword) return false
      }

      // Mood filter
      if (activeMoods.length > 0) {
        if (!activeMoods.includes(entry.mood)) return false
      }

      return true
    })
  }, [entries, searchQuery, activeMoods])

  const handleToggleMood = (mood: DiaryMood) => {
    setActiveMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood],
    )
  }

  return (
    <div className="space-y-6">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search diary entries..."
      />
      <DiaryMoodFilter
        activeMoods={activeMoods}
        onToggleMood={handleToggleMood}
        onClearAll={() => setActiveMoods([])}
      />
      <DiaryEntryList entries={filteredEntries} />
    </div>
  )
}
