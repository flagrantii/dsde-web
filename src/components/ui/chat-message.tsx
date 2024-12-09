'use client'

import { motion } from 'framer-motion'
import { cn } from '@/src/lib/utils'
import { Message } from '@/src/types'
import ReactMarkdown from 'react-markdown';

export function ChatMessage({ content, role, timestamp, selectedNode, status }: Message) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={cn(
        "flex flex-col gap-2 p-4 rounded-lg backdrop-blur-sm relative",
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
      
      <div className="flex items-center gap-2">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          role === 'user' 
            ? "bg-primary/20 text-secondary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}>
          {role === 'user' ? 'You' : 'Nodi'}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>

      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-md"
        >
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <div className="flex flex-col">
            <span className="font-medium">Selected: {selectedNode.title}</span>
            {selectedNode.year && (
              <span className="opacity-50">({selectedNode.year})</span>
            )}
          </div>
        </motion.div>
      )}
      
      <motion.p 
        className="text-sm leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </motion.p>
    </motion.div>
  )
} 