'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [items.length, interval])

  const current = items[index]

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
