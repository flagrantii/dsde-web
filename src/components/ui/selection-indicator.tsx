'use client'

import { motion } from 'framer-motion'
import { cn } from '@/src/lib/utils'

interface SelectionIndicatorProps {
  active: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SelectionIndicator({ active, size = 'md', className }: SelectionIndicatorProps) {
  return (
    <motion.div
      initial={false}
      animate={active ? {
        scale: [1, 1.2, 1],
        opacity: 1,
      } : { opacity: 0.5, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-full bg-primary/50",
        size === 'sm' && "w-1.5 h-1.5",
        size === 'md' && "w-2 h-2",
        size === 'lg' && "w-3 h-3",
        className
      )}
    />
  )
} 