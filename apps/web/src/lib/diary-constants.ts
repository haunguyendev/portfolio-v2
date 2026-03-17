export const DIARY_MOODS = {
  happy: { emoji: '😊', label: 'Happy', color: 'text-yellow-500' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-blue-400' },
  reflective: { emoji: '🤔', label: 'Reflective', color: 'text-purple-500' },
  grateful: { emoji: '🙏', label: 'Grateful', color: 'text-green-500' },
  motivated: { emoji: '🔥', label: 'Motivated', color: 'text-orange-500' },
} as const

export type DiaryMood = keyof typeof DIARY_MOODS
