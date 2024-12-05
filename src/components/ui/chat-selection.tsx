'use client'

import { motion } from 'framer-motion'
import { X, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { GraphNode } from '@/src/types'
import { SelectionIndicator } from './selection-indicator'

interface ChatSelectionProps {
  selectedNode: GraphNode | null
  onClear: () => void
  onViewDetails: () => void
}

export function ChatSelection({ selectedNode, onClear, onViewDetails }: ChatSelectionProps) {
  if (!selectedNode) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-lg backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <SelectionIndicator active size="lg" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{selectedNode.data.title}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{selectedNode.data.type}</span>
            {selectedNode.data.year && (
              <>
                <span>•</span>
                <span>{selectedNode.data.year}</span>
              </>
            )}
            {selectedNode.data.citations && (
              <>
                <span>•</span>
                <span>{selectedNode.data.citations} citations</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-secondary/80 group relative"
          onClick={onViewDetails}
        >
          <ExternalLink className="h-4 w-4" />
          <span className="absolute -top-8 right-0 bg-background/90 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            View Details
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-secondary/80 group relative"
          onClick={onClear}
        >
          <X className="h-4 w-4" />
          <span className="absolute -top-8 right-0 bg-background/90 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Clear
          </span>
        </Button>
      </div>
    </motion.div>
  )
} 