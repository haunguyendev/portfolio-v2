'use client'

import { useState, lazy, Suspense } from 'react'
import { MessageCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const ChatPanel = lazy(() =>
  import('./chat-panel').then((m) => ({ default: m.ChatPanel })),
)

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <Suspense
            fallback={
              <div className="mb-4 h-[500px] w-[400px] animate-pulse rounded-xl border bg-background" />
            }
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ChatPanel onClose={() => setIsOpen(false)} />
            </motion.div>
          </Suspense>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}
    </div>
  )
}
