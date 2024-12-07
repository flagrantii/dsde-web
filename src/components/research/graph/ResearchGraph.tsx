'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCw, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { useGraphOperations } from '@/src/lib/hooks/useGraphOperations'
import { GraphNode } from "@/src/types"
import { useChatManager } from '@/src/lib/hooks/useChatManager'

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
)

interface ResearchGraphProps {
  selectedPaper?: string
  onNodeClick: (node: GraphNode) => void
}

export default function ResearchGraph({ selectedPaper, onNodeClick }: ResearchGraphProps) {
  const { graphData } = useChatManager()
  const {
    graph,
    nodes,
    links,
    updateGraphData
  } = useGraphOperations()
  
  const fgRef = useRef<any>()
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Reset node positions while keeping the graph structure
  const resetPositions = useCallback(() => {
    if (fgRef.current && graphData?.nodes) {
      // Reset zoom and center
      fgRef.current.centerAt(0, 0, 1000)
      fgRef.current.zoom(1, 1000)

      // Calculate optimal radius based on node count
      const nodeCount = graphData.nodes.length
      const radius = Math.sqrt(nodeCount) * 30

      // Distribute nodes in a spiral pattern
      const updatedNodes: GraphNode[] = graphData.nodes.map((node, i) => {
        const angle = (i * 2.4) // golden angle
        const r = Math.sqrt(i) * radius / Math.sqrt(nodeCount)
        return {
          ...node,
          fx: undefined,
          fy: undefined,
          x: r * Math.cos(angle),
          y: r * Math.sin(angle),
          vx: 0,
          vy: 0
        }
      })

      updateGraphData({
        nodes: updatedNodes,
        links: graphData.links || []
      })

      // Reheat simulation with higher intensity
      fgRef.current.d3Force('charge').strength(-150)
      fgRef.current.d3ReheatSimulation()
      
      // Run more simulation ticks
      for (let i = 0; i < 100; i++) {
        fgRef.current.d3Force('simulation').tick()
      }
    }
  }, [graphData, updateGraphData])

  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeClick?.(node)
    // Center view on clicked node
    fgRef.current?.centerAt(node.x, node.y, 1000)
    fgRef.current?.zoom(2, 1000)
  }, [onNodeClick])

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node)
    document.body.style.cursor = node ? 'pointer' : 'default'
  }, [])

  // Add a loading state while the graph component is being loaded
  const [isComponentLoading, setIsComponentLoading] = useState(true)

  useEffect(() => {
    // Set loading to false after component mounts
    setIsComponentLoading(false)
  }, [])

  // Create a mutable copy of the graph data with proper prototypes and null checks
  const graphDataForViz = useMemo(() => {
    if (!graphData) return { nodes: [], links: [] }

    const radius = Math.sqrt(graphData.nodes?.length || 0) * 50
    
    return {
      nodes: graphData.nodes?.map((node, i) => {
        const angle = (i * 2.4) // golden angle
        const r = Math.sqrt(i) * radius / Math.sqrt(graphData.nodes?.length || 1)
        return {
          ...node,
          x: r * Math.cos(angle),
          y: r * Math.sin(angle),
          vx: 0,
          vy: 0,
          fx: undefined,
          fy: undefined
        }
      }) || [],
      links: graphData.links?.map(link => ({
        source: link.source,
        target: link.target,
        index: undefined
      })) || []
    }
  }, [graphData])

  // Node canvas object with null checks
  const nodeCanvasObject = useCallback((node: any, ctx: any, globalScale: number) => {
    if (!node?.x || !node?.y || isNaN(node.x) || isNaN(node.y)) return

    const data = node || {}
    const isSelected = node?.id === selectedPaper
    const isHovered = hoveredNode?.id === node?.id
    const isPaper = data?.type === 'paper'
    
    const baseSize = isPaper ? 6 : 4
    const size = isSelected || isHovered ? baseSize * 1.4 : baseSize
    const fontSize = Math.min(4, 12/globalScale)
    
    const x = Number(node.x)
    const y = Number(node.y)
    
    // Draw node glow effect
    if (isSelected || isHovered) {
      ctx.beginPath()
      ctx.arc(x, y, size + 2, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(34, 197, 94, ${isSelected ? 0.2 : 0.1})`
      ctx.fill()
    }
    
    // Draw main node
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    
    try {
      // Create gradient for node
      const gradient = ctx.createRadialGradient(
        x, y, 0,
        x, y, size
      )
      
      if (isPaper) {
        gradient.addColorStop(0, '#4ade80')
        gradient.addColorStop(1, '#22c55e')
      } else {
        gradient.addColorStop(0, '#9ca3af')
        gradient.addColorStop(1, '#6b7280')
      }
      
      ctx.fillStyle = isHovered 
        ? isPaper ? '#4ade80' : '#9ca3af'
        : gradient
    } catch (error) {
      // Fallback if gradient creation fails
      ctx.fillStyle = isPaper ? '#4ade80' : '#9ca3af'
    }
    
    ctx.fill()

    // Add border
    ctx.strokeStyle = isSelected 
      ? '#22c55e' 
      : isHovered 
        ? '#ffffff' 
        : 'rgba(255,255,255,0.2)'
    ctx.lineWidth = isSelected ? 2 : 1
    ctx.stroke()

    // Draw label with null checks
    if (globalScale > 0.4 || isHovered || isSelected) {
      const maxLabelLength = isHovered ? 60 : 30
      const label = truncateText(data?.title || 'Untitled', maxLabelLength)
      ctx.font = `${fontSize}px Inter`
      const textWidth = ctx.measureText(label).width
      const padding = 4
      const bckgDimensions = [
        textWidth + padding * 2,
        fontSize + padding * 2
      ]

      // Draw label background with rounded corners
      const radius = 4
      const labelX = x - bckgDimensions[0] / 2
      const labelY = y + size * 2
      
      try {
        ctx.beginPath()
        ctx.moveTo(labelX + radius, labelY)
        ctx.lineTo(labelX + bckgDimensions[0] - radius, labelY)
        ctx.quadraticCurveTo(labelX + bckgDimensions[0], labelY, labelX + bckgDimensions[0], labelY + radius)
        ctx.lineTo(labelX + bckgDimensions[0], labelY + bckgDimensions[1] - radius)
        ctx.quadraticCurveTo(labelX + bckgDimensions[0], labelY + bckgDimensions[1], labelX + bckgDimensions[0] - radius, labelY + bckgDimensions[1])
        ctx.lineTo(labelX + radius, labelY + bckgDimensions[1])
        ctx.quadraticCurveTo(labelX, labelY + bckgDimensions[1], labelX, labelY + bckgDimensions[1] - radius)
        ctx.lineTo(labelX, labelY + radius)
        ctx.quadraticCurveTo(labelX, labelY, labelX + radius, labelY)
        ctx.closePath()
        
        // Create gradient for label background
        const bgGradient = ctx.createLinearGradient(labelX, labelY, labelX, labelY + bckgDimensions[1])
        bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)')
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)')
        
        ctx.fillStyle = bgGradient
      } catch (error) {
        // Fallback if gradient creation fails
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      }
      
      ctx.fill()
      
      // Add subtle border to label background
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Draw text with shadow and truncation
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isPaper 
        ? isSelected ? '#4ade80' : '#22c55e'
        : '#d1d5db'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 2
      ctx.fillText(
        label,
        x,
        labelY + bckgDimensions[1]/2
      )
      ctx.shadowBlur = 0
    }
  }, [hoveredNode, selectedPaper])

  // Add window size tracking with proper initial values
  const [dimensions, setDimensions] = useState({ width: 930, height: 930 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setDimensions({
          width: clientWidth,
          height: clientHeight
        })
      }
    }

    updateDimensions()
    const resizeObserver = new ResizeObserver(updateDimensions)
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [])

  // Add helper function for text truncation
  const truncateText = (text: string, maxLength: number) => {
    if (text?.length <= maxLength) return text
    return text?.slice(0, maxLength) + '...'
  }

  // Add this effect to configure force simulation
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')
        .strength(-100)
        .distanceMax(200)
      
      fgRef.current.d3Force('link')
        .distance(50)
        .strength(1)
      
      fgRef.current.d3Force('center')
        .strength(0.3)
        
      // Add collision force to prevent overlap
      fgRef.current.d3Force('collision')
        .radius((node: any) => (node.type === 'paper' ? 10 : 8))
    }
  }, [])

  if (isComponentLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full graph-container"
      style={{ minHeight: '500px' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full"
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={graphDataForViz}
          nodeLabel={node => node?.title || 'Untitled'}
          nodeRelSize={6}
          nodeCanvasObject={nodeCanvasObject}
          
          // Improved link styling
          linkColor={() => 'rgba(34, 197, 94, 0.2)'}
          linkWidth={2}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => 'rgba(34, 197, 94, 0.5)'}
          
          // Improved force simulation settings
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.15}
          warmupTicks={50}
          cooldownTime={3000}
          
          // Enhanced interaction settings
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.5}
          maxZoom={8}
          onNodeDragEnd={(node) => {
            node.fx = node.x;
            node.fy = node.y;
          }}
          
          // Performance and aesthetics
          backgroundColor="transparent"
          width={dimensions.width}
          height={dimensions.height}
          
          // Event handlers
          onNodeClick={(node: any) => {
            // Ensure node has required GraphNode properties
            if (node && node.id && node.title && node.type) {
              onNodeClick(node as GraphNode);
            }
          }}
          onNodeHover={handleNodeHover as any}
        />
      </motion.div>

      {/* Single reset button */}
      <motion.div 
        className="absolute bottom-4 right-4 flex gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={resetPositions}
          className="w-8 h-8 glass-effect relative group"
        >
          <motion.div 
            className="w-4 h-4"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <RotateCw className="w-4 h-4" />
          </motion.div>
          <span className="absolute -top-8 right-0 bg-background/90 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Reset Layout
          </span>
        </Button>
      </motion.div>

      {/* Enhanced tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 p-4 glass-effect rounded-lg shadow-lg max-w-xs"
          >
            <h4 className="text-sm font-medium text-primary">{hoveredNode?.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Type: {hoveredNode?.type}
            </p>
            {hoveredNode?.citations && (
              <p className="text-xs text-muted-foreground mt-1">
                Citations: {hoveredNode?.citations}
              </p>
            )}
            {hoveredNode?.year && (
              <p className="text-xs text-muted-foreground mt-1">
                Year: {hoveredNode?.year}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 