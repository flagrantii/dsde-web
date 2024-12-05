'use client'

import { motion } from 'framer-motion'
import { Keyboard } from 'lucide-react'
import { Button } from './button'

export function KeyboardShortcuts() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 p-4 bg-secondary/30 backdrop-blur-sm rounded-lg border border-border"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Keyboard className="w-3 h-3" />
        <span>Keyboard Shortcuts</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs">Toggle Graph</span>
          <kbd className="px-2 py-1 text-xs bg-secondary rounded">⌘K</kbd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs">Clear Selection</span>
          <kbd className="px-2 py-1 text-xs bg-secondary rounded">ESC</kbd>
        </div>
      </div>
    </motion.div>
  )
} 