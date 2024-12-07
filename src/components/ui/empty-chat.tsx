'use client'

import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

export function EmptyChat() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Start a New Chat</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Ask questions about research papers or topics you're interested in. 
        I'll help you discover relevant papers and connections.
      </p>
    </motion.div>
  )
} 