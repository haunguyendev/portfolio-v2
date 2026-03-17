'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'

const noop = () => () => {}

type TextSegment = {
  text: string
  className?: string
}

type Phase = 'typing' | 'paused' | 'deleting' | 'waiting'

type TypewriterHeadingProps = {
  /** Array of names — each name is an array of segments */
  names: TextSegment[][]
  /** Delay in ms between each character when typing */
  typeDelay?: number
  /** Delay in ms between each character when deleting */
  deleteDelay?: number
  /** Pause duration in ms after typing completes */
  pauseAfterType?: number
  /** Pause duration in ms after deleting before typing next */
  pauseAfterDelete?: number
  className?: string
}

export function TypewriterHeading({
  names,
  typeDelay = 120,
  deleteDelay = 60,
  pauseAfterType = 2000,
  pauseAfterDelete = 700,
  className,
}: TypewriterHeadingProps) {
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const [nameIndex, setNameIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')

  const currentSegments = names[nameIndex]
  const totalChars = currentSegments.reduce((sum, seg) => sum + seg.text.length, 0)

  const advanceToNextName = useCallback(() => {
    setNameIndex((prev) => (prev + 1) % names.length)
    setCharIndex(0)
    setPhase('typing')
  }, [names.length])

  // Typing phase — add chars one by one
  useEffect(() => {
    if (phase !== 'typing') return

    if (charIndex >= totalChars) {
      const timer = setTimeout(() => setPhase('paused'), 0)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setCharIndex((prev) => prev + 1), typeDelay)
    return () => clearTimeout(timer)
  }, [phase, charIndex, totalChars, typeDelay])

  // Paused phase — wait then start deleting
  useEffect(() => {
    if (phase !== 'paused') return

    const timer = setTimeout(() => setPhase('deleting'), pauseAfterType)
    return () => clearTimeout(timer)
  }, [phase, pauseAfterType])

  // Deleting phase — remove chars one by one
  useEffect(() => {
    if (phase !== 'deleting') return

    if (charIndex <= 0) {
      const timer = setTimeout(() => setPhase('waiting'), 0)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setCharIndex((prev) => prev - 1), deleteDelay)
    return () => clearTimeout(timer)
  }, [phase, charIndex, deleteDelay])

  // Waiting phase — pause then advance to next name
  useEffect(() => {
    if (phase !== 'waiting') return

    const timer = setTimeout(advanceToNextName, pauseAfterDelete)
    return () => clearTimeout(timer)
  }, [phase, pauseAfterDelete, advanceToNextName])

  // Build revealed text from segments
  const renderSegments = () => {
    let charsRemaining = charIndex
    return currentSegments.map((segment, i) => {
      if (charsRemaining <= 0) return null

      const visibleChars = Math.min(charsRemaining, segment.text.length)
      charsRemaining -= visibleChars

      return (
        <span key={i} className={segment.className}>
          {segment.text.slice(0, visibleChars)}
        </span>
      )
    })
  }

  // Render static first name on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <h1 className={`${className} whitespace-nowrap`}>
        {names[0].map((seg, i) => (
          <span key={i} className={seg.className}>{seg.text}</span>
        ))}
      </h1>
    )
  }

  return (
    <h1 className={`${className} whitespace-nowrap`}>
      {renderSegments()}
      <motion.span
        className="ml-0.5 inline-block w-[3px] bg-current align-middle"
        style={{ height: '0.85em' }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </h1>
  )
}
