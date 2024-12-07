'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X } from 'lucide-react'
import { Button } from './button'
import { GraphNode } from '@/src/types'

interface SelectionHistoryProps {
  history: GraphNode[]
  onSelect: (node: GraphNode) => void
  onClear: (nodeId: string) => void
}

export function SelectionHistory({ history, onSelect, onClear }: SelectionHistoryProps) {
  if (history.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Recent Selections</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {history.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative"
            >
              <Button
                variant="secondary"
                size="sm"
                className="text-xs pr-6"
                onClick={() => onSelect(node)}
              >
                {node.title}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onClear(node.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
} 