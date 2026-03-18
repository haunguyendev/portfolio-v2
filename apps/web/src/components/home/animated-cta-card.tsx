'use client'

import { motion } from 'framer-motion'
import { Download, FileText, Sparkles } from 'lucide-react'
import profile from '@/content/profile.json'

// Floating particle positions around the card
const PARTICLES = [
  { x: '10%', y: '15%', delay: 0, size: 4 },
  { x: '85%', y: '20%', delay: 0.5, size: 3 },
  { x: '20%', y: '80%', delay: 1, size: 5 },
  { x: '75%', y: '75%', delay: 1.5, size: 3 },
  { x: '50%', y: '10%', delay: 0.8, size: 4 },
  { x: '90%', y: '50%', delay: 1.2, size: 3 },
]

export function AnimatedCtaCard() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-orange-500/5 via-red-500/5 to-blue-500/5 p-8 md:p-10">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute -left-20 -top-20 size-40 rounded-full bg-orange-500/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 size-40 rounded-full bg-blue-500/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-foreground/10"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{
            duration: 3,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated icon */}
        <motion.div
          className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FileText className="size-8 text-white" />
        </motion.div>

        <div className="text-center">
          <h3 className="mb-2 text-xl font-bold text-foreground">
            Grab My Resume
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Download my CV to learn more about my experience, skills, and
            projects.
          </p>
        </div>

        {/* Animated download button */}
        <motion.a
          href={profile.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-foreground px-6 py-3 font-medium text-background"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <Download className="relative size-4 transition-transform group-hover:translate-y-0.5" />
          <span className="relative">Download CV</span>
          <Sparkles className="relative size-4 text-yellow-400" />
        </motion.a>
      </div>
    </div>
  )
}
