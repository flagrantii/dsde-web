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

// Add this helper function at the top of the file, outside the component
const getClusterCenter = (nodes: GraphNode[], clusterId: string) => {
  const clusterNodes = nodes.filter(node => node.clusterId === clusterId)
  if (!clusterNodes.length) return { x: 0, y: 0 }
  
  return {
    x: clusterNodes.reduce((sum, node) => sum + (node.x || 0), 0) / clusterNodes.length,
    y: clusterNodes.reduce((sum, node) => sum + (node.y || 0), 0) / clusterNodes.length
  }
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
      // Reset zoom and center with higher zoom
      fgRef.current.centerAt(0, 0, 1000)
      fgRef.current.zoom(2, 1000) // Increased from 1.5

      // Calculate even smaller radius
      const nodeCount = graphData.nodes.length
      const radius = Math.sqrt(nodeCount) * 3 // Reduced from 5

      // Group nodes by cluster
      const clusters = new Map()
      graphData.nodes.forEach((node, i) => {
        const clusterId = node.clusterId || 'default'
        if (!clusters.has(clusterId)) {
          clusters.set(clusterId, [])
        }
        clusters.get(clusterId).push(node)
      })

      const clusterCount = clusters.size
      let nodeIndex = 0

      // Position clusters in an even tighter circular arrangement
      clusters.forEach((clusterNodes, clusterId) => {
        const goldenRatio = (1 + Math.sqrt(5)) / 2
        const clusterIndex = Array.from(clusters.keys()).indexOf(clusterId)
        const angle = clusterIndex * 2 * Math.PI * goldenRatio
        
        // Make clusters even closer to center
        const clusterRadius = radius / 8 // Reduced from radius/6
        const clusterX = clusterRadius * Math.cos(angle)
        const clusterY = clusterRadius * Math.sin(angle)

        // Position nodes in even tighter spiral
        clusterNodes.forEach((node: GraphNode, i: number) => {
          const nodeAngle = (i * 2.4)
          const r = Math.sqrt(i) * (radius / Math.sqrt(nodeCount)) * 0.15 // Reduced from 0.2
          const x = clusterX + r * Math.cos(nodeAngle)
          const y = clusterY + r * Math.sin(nodeAngle)

          node.x = x
          node.y = y
          node.vx = 0
          node.vy = 0
          node.fx = undefined
          node.fy = undefined
          nodeIndex++
        })
      })

      updateGraphData({
        nodes: [...graphData.nodes],
        links: graphData.links || []
      })

      // Even tighter force parameters
      fgRef.current.d3Force('charge')
        .strength(-25) // Reduced from -50
        .distanceMax(20) // Reduced from 40

      fgRef.current.d3Force('link')
        .distance(80) // Increased from 30 to 80 for much longer links
        .strength(1)  // Reduced from 2 to allow more stretching
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
    
    // Increase base size of nodes
    const baseSize = isPaper ? 12 : 8 // Increased from 8/6
    const size = isSelected || isHovered ? baseSize * 1.4 : baseSize
    const fontSize = Math.min(6, 16/globalScale) // Increased from 5, 14/globalScale
    
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
    if (globalScale > 0.3 || isHovered || isSelected) { // Show labels at slightly lower zoom
      const maxLabelLength = isHovered ? 80 : 40 // Increased from 60/30
      const label = truncateText(data?.title || 'Untitled', maxLabelLength)
      ctx.font = `${fontSize}px Inter`
      const textWidth = ctx.measureText(label).width
      const padding = 6 // Increased from 4
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

  // Modify the useEffect for force simulation configuration
  useEffect(() => {
    if (fgRef.current) {
      // Much stronger center force
      fgRef.current.d3Force('center')
        .strength(2) // Increased from 1.5

      // Even tighter charge force
      fgRef.current.d3Force('charge')
        .strength((node: any) => node.type === 'paper' ? -25 : -15) // Reduced from -50/-25
        .distanceMax(100) // Increased from 20 to allow nodes to spread more

      // Super tight link force
      fgRef.current.d3Force('link')
        .distance(80) // Increased from 30 to 80
        .strength(1)  // Reduced from 2 to allow more stretching

      // Stronger clustering force
      const simulation = fgRef.current.d3Force('simulation')
      simulation.force('cluster', (alpha: number) => {
        const nodes = graphData?.nodes || []
        const clusters = new Set(nodes.map(node => node.clusterId).filter(Boolean))
        
        nodes.forEach((node: any) => {
          if (!node.clusterId) return

          const clusterCenter = getClusterCenter(nodes, node.clusterId)
          const k = alpha * 3 // Increased from 2
          
          node.vx -= (node.x - clusterCenter.x) * k
          node.vy -= (node.y - clusterCenter.y) * k
        })
      })

      // Tighter collision with more overlap allowed
      fgRef.current.d3Force('collision')
        .radius((node: any) => (node.type === 'paper' ? 12 : 8)) // Slightly reduced from 14/10
        .strength(0.4) // Reduced from 0.6 to allow more overlap
    }
  }, [graphData])

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
          nodeRelSize={12}
          nodeCanvasObject={nodeCanvasObject}
          
          // Improved link styling
          linkColor={() => 'rgba(34, 197, 94, 0.2)'}
          linkWidth={5} // Increased from 4
          linkDirectionalParticles={8} // Increased from 6
          linkDirectionalParticleWidth={5} // Increased from 4
          linkDirectionalParticleSpeed={0.002} // Reduced from 0.003 for better visibility on longer links
          linkDirectionalParticleColor={() => 'rgba(34, 197, 94, 0.5)'}
          
          // Improved force simulation settings
          d3AlphaDecay={0.03} // Increased from 0.02 for faster settling
          d3VelocityDecay={0.3} // Increased from 0.2 for more stability
          warmupTicks={150} // Increased from 100
          cooldownTime={1500} // Reduced from 2000
          
          // Enhanced interaction settings
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.2} // Reduced from 0.3
          maxZoom={15} // Increased from 12
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