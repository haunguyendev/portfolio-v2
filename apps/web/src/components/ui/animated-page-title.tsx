'use client'

import { motion } from 'framer-motion'

interface AnimatedPageTitleProps {
  children: React.ReactNode
  className?: string
}

// Subtle fade + slide up for page titles on navigation
export function AnimatedPageTitle({ children, className }: AnimatedPageTitleProps) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.h1>
  )
}
