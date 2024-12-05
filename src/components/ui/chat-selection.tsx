'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './button'
import { GraphNode } from '@/src/types'

interface ChatSelectionProps {
  selectedNode: GraphNode | null
  onClear: () => void
}

export function ChatSelection({ selectedNode, onClear }: ChatSelectionProps) {
  if (!selectedNode) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-2 p-2 bg-secondary/30 border border-border rounded-lg"
    >
      <span className="text-sm text-muted-foreground">Selected Paper:</span>
      <span className="text-sm font-medium">{selectedNode.data.title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  )
} 