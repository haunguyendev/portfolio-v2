'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const noop = () => () => {}

type TextItem = {
  text: string
  className?: string
}

type RotatingTextProps = {
  items: TextItem[]
  /** How long each text stays visible (ms) */
  interval?: number
  className?: string
}

export function RotatingText({
  items,
  interval = 3000,
  className,
}: RotatingTextProps) {
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [mounted, items.length, interval])

  const current = items[index]

  // Render static first item on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <span className={`block ${items[0].className ?? ''}`}>
          {items[0].text}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current.text}
          className={`block ${current.className ?? ''}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
