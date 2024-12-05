'use client'

import { motion } from 'framer-motion'
import { cn } from '@/src/lib/utils'
import { Message } from '@/src/types'

export function ChatMessage({ content, role, timestamp, selectedNode, status }: Message) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg backdrop-blur-sm relative",
        role === 'user' 
          ? "ml-auto bg-primary/10 border border-primary/20 max-w-[80%]" 
          : "bg-secondary/50 border border-secondary/20 max-w-[80%]",
        status === 'selected' && "ring-2 ring-primary/50"
      )}
    >
      {status === 'selected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full"
        />
      )}
      
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
      
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <span>Selected: {selectedNode.data.title}</span>
          {selectedNode.data.year && (
            <span className="opacity-50">({selectedNode.data.year})</span>
          )}
        </motion.div>
      )}
    </motion.div>
  )
} 