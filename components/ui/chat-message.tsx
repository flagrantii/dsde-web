'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg",
        role === 'user' 
          ? "ml-auto bg-primary/10 max-w-[80%]" 
          : "bg-secondary/50 max-w-[80%]"
      )}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-sm font-medium"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            {role === 'user' ? 'You' : 'Assistant'}
          </motion.span>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        <motion.p 
          className="text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {content}
        </motion.p>
      </div>
    </motion.div>
  )
} 