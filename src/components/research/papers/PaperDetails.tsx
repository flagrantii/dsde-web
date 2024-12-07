'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { GraphNode } from '@/src/types'

interface PaperDetailsProps {
  paper: GraphNode | null
  onClose: () => void
}

export default function PaperDetails({ paper, onClose }: PaperDetailsProps) {
  if (!paper) return null
  console.log(paper)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-0 right-0 w-96 h-full bg-background/95 backdrop-blur-sm border-l border-border p-6 overflow-y-auto z-50"
      >
        {/* Close button at top */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 flex gap-2"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-secondary/80"
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Content */}
        <div className="space-y-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-medium text-primary">{paper.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">Type: {paper.type}</p>
          </motion.div>

          {paper.abstract && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-medium mb-2">Abstract</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{paper.abstract}</p>
            </motion.div>
          )}

          {paper.authors && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-medium mb-2">Authors</h4>
              <div className="flex flex-wrap gap-2">
                {paper.authors.map(author => (
                  <span
                    key={author}
                    className="px-2 py-1 bg-secondary/50 rounded-md text-xs"
                  >
                    {author}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {(paper.year || paper.citations) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4 pt-4 border-t border-border"
            >
              {paper.year && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Year</h4>
                  <p className="text-sm text-muted-foreground">{paper.year}</p>
                </div>
              )}
              {paper.citations && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Citations</h4>
                  <p className="text-sm text-muted-foreground">{paper.citations}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Close button at bottom */}
        <motion.div 
          className="fixed bottom-6 left-6 right-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="secondary"
            className="w-full glass-effect"
            onClick={onClose}
          >
            Close Details
          </Button>
        </motion.div>

        {/* Overlay to close on click outside */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/20 backdrop-blur-sm -z-10"
          onClick={onClose}
        />
      </motion.div>
    </AnimatePresence>
  )
} 