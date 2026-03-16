'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Terminal } from 'lucide-react'

// Full text of the code — each line with its type for syntax coloring
const CODE_LINES = [
  { text: '// kane.life.ts', type: 'comment' as const },
  { text: '', type: 'blank' as const },
  { text: 'const kane = new Engineer();', type: 'code' as const },
  { text: '', type: 'blank' as const },
  { text: 'while (kane.isAlive) {', type: 'code' as const },
  { text: '', type: 'blank' as const },
  { text: '  await sleep(8);', type: 'code' as const, comment: '// recharge → sharp mind' },
  { text: '  gym();', type: 'code' as const, comment: '// strong body = strong debug' },
  { text: '  eat.clean();', type: 'code' as const, comment: '// fuel the machine' },
  { text: '', type: 'blank' as const },
  { text: '  const focus = health.check();', type: 'code' as const },
  { text: '  if (focus.isHigh()) {', type: 'code' as const },
  { text: '    code.ship(features);', type: 'code' as const, comment: '// deploy with confidence' },
  { text: '    bugs.squash();', type: 'code' as const, comment: '// zero tolerance' },
  { text: '    learn(newStack);', type: 'code' as const, comment: '// never stop growing' },
  { text: '  }', type: 'code' as const },
  { text: '', type: 'blank' as const },
  { text: '  // no burnout, no crash, just consistent output', type: 'comment' as const },
  { text: '  balance(work, life);', type: 'code' as const, comment: '// this is the way' },
  { text: '}', type: 'code' as const },
  { text: '', type: 'blank' as const },
  { text: '// STATUS: running since 2024... restarting loop', type: 'comment' as const },
]

// Build a flat string from all lines for character-by-character typing
function buildFullText() {
  return CODE_LINES.map((line) => {
    if (line.type === 'blank') return ''
    const comment = 'comment' in line && line.comment ? `  ${line.comment}` : ''
    return line.text + comment
  })
}

const FULL_LINES = buildFullText()
const CHAR_SPEED = 30 // ms per character
const LINE_PAUSE = 200 // ms pause between lines
const LOOP_PAUSE = 2000 // ms pause before restarting

export function LifeSourceCode() {
  // lineIndex = which line we're on, charIndex = how many chars typed on current line
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLDivElement>(null)

  // Intersection observer — start when in viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Reset and restart loop
  const restart = useCallback(() => {
    setLineIndex(0)
    setCharIndex(0)
  }, [])

  // Character-by-character typing + loop
  useEffect(() => {
    if (!isInView) return

    const currentLineText = FULL_LINES[lineIndex] ?? ''
    const isBlank = currentLineText === '' && CODE_LINES[lineIndex]?.type === 'blank'

    // If blank line, move to next line quickly
    if (isBlank) {
      const timer = setTimeout(() => {
        if (lineIndex < FULL_LINES.length - 1) {
          setLineIndex((l) => l + 1)
          setCharIndex(0)
        } else {
          // Loop: pause then restart
          setTimeout(restart, LOOP_PAUSE)
        }
      }, 80)
      return () => clearTimeout(timer)
    }

    // If still typing current line
    if (charIndex < currentLineText.length) {
      const timer = setTimeout(() => {
        setCharIndex((c) => c + 1)
      }, CHAR_SPEED)
      return () => clearTimeout(timer)
    }

    // Line complete — pause then next line
    const timer = setTimeout(() => {
      if (lineIndex < FULL_LINES.length - 1) {
        setLineIndex((l) => l + 1)
        setCharIndex(0)
      } else {
        // Loop: pause then restart
        setTimeout(restart, LOOP_PAUSE)
      }
    }, LINE_PAUSE)
    return () => clearTimeout(timer)
  }, [isInView, lineIndex, charIndex, restart])

  // Auto-scroll to bottom as lines are typed
  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.scrollTop = codeRef.current.scrollHeight
    }
  }, [lineIndex])

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef}>
      {/* Terminal header */}
      <div className="flex items-center gap-2 rounded-t-lg border border-border bg-muted/50 px-4 py-2">
        <Terminal className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          kane.life.ts
        </span>
        <div className="ml-auto flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400/70" />
          <div className="size-2.5 rounded-full bg-yellow-400/70" />
          <div className="size-2.5 rounded-full bg-green-400/70" />
        </div>
      </div>

      {/* Code block with auto-scroll */}
      <div
        ref={codeRef}
        className="max-h-[340px] overflow-y-auto overflow-x-hidden rounded-b-lg border border-t-0 border-border bg-zinc-950 p-4 font-mono text-[13px] leading-relaxed dark:bg-zinc-900"
      >
        {CODE_LINES.slice(0, lineIndex + 1).map((line, i) => {
          const fullText = FULL_LINES[i]
          const isCurrentLine = i === lineIndex
          const displayText = isCurrentLine
            ? fullText.slice(0, charIndex)
            : fullText

          return (
            <div key={i} className="flex whitespace-pre">
              {/* Line number */}
              <span className="mr-4 inline-block w-5 shrink-0 select-none text-right text-zinc-600">
                {line.type !== 'blank' ? i + 1 : ''}
              </span>

              {/* Typed text with syntax color */}
              <span>
                {line.type === 'blank' ? (
                  <span>&nbsp;</span>
                ) : (
                  <SyntaxLine
                    text={displayText}
                    type={line.type}
                    hasComment={'comment' in line && !!line.comment}
                    codeLength={line.text.length}
                  />
                )}
              </span>

              {/* Blinking cursor on current line */}
              {isCurrentLine && cursorVisible && (
                <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-emerald-400" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Syntax-colored text: code part in emerald, comment part in zinc
function SyntaxLine({
  text,
  type,
  hasComment,
  codeLength,
}: {
  text: string
  type: 'code' | 'comment'
  hasComment: boolean
  codeLength: number
}) {
  if (type === 'comment') {
    return <span className="text-zinc-500">{text}</span>
  }

  // For code lines with inline comments, split at the boundary
  if (hasComment && text.length > codeLength) {
    const codePart = text.slice(0, codeLength)
    const commentPart = text.slice(codeLength)
    return (
      <>
        <span className="text-emerald-400">{codePart}</span>
        <span className="text-zinc-500">{commentPart}</span>
      </>
    )
  }

  return <span className="text-emerald-400">{text}</span>
}
