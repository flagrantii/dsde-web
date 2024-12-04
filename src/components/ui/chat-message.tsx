'use client'

import { motion } from 'framer-motion'
import { cn } from '@/src/lib/utils'

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg backdrop-blur-sm",
        role === 'user' 
          ? "ml-auto bg-primary/10 border border-primary/20 max-w-[80%]" 
          : "bg-secondary/50 border border-secondary/20 max-w-[80%]"
      )}
    >
      <div className="flex-1 space-y-2">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            role === 'user' 
              ? "bg-primary/20 text-secondary-foreground"
              : "bg-secondary text-secondary-foreground"
          )}>
            {role === 'user' ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </motion.div>
        
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