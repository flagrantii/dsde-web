'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  state: 'thinking' | 'generating' | 'idle'
}

export function LoadingState({ state }: LoadingStateProps) {
  if (state === 'idle') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-full shadow-lg border border-border"
    >
      <div className="relative">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <motion.div
          className="absolute -inset-1 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-400">
        {state === 'thinking' ? 'nodi is thinking...' : 'Generating insights...'}
      </span>
    </motion.div>
  )
} 