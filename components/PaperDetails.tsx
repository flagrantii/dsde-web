'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaperDetailsProps {
  paper: {
    title: string
    type: string
    abstract?: string
    authors?: string[]
    year?: number
    citations?: number
  } | null
  onClose: () => void
}

export default function PaperDetails({ paper, onClose }: PaperDetailsProps) {
  if (!paper) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-0 right-0 w-96 h-full bg-background border-l border-border p-6 overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Paper Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium">{paper.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">Type: {paper.type}</p>
          </div>

          {paper.abstract && (
            <div>
              <h4 className="text-sm font-medium mb-2">Abstract</h4>
              <p className="text-sm text-muted-foreground">{paper.abstract}</p>
            </div>
          )}

          {paper.authors && (
            <div>
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
            </div>
          )}

          {(paper.year || paper.citations) && (
            <div className="flex gap-4">
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
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 