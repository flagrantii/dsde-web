'use client'

import { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCw, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/src/store'
import { updateGraphData, resetGraph } from '@/src/store/features/graphSlice'
import { useGraphOperations } from '@/src/lib/hooks/useGraphOperations'

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d'),
  { ssr: false }
)

interface GraphNode {
  id: string
  title: string
  type: 'paper' | 'keyword'
  color?: string
  x?: number
  y?: number
  citations?: number
  year?: number
}

interface GraphLink {
  source: string
  target: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

interface ResearchGraphProps {
  selectedPaper?: string
  onNodeClick?: (node: GraphNode) => void
}

export default function ResearchGraph({ selectedPaper, onNodeClick }: ResearchGraphProps) {
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
    if (fgRef.current) {
      // Reset zoom and center
      fgRef.current.centerAt(0, 0, 1000)
      fgRef.current.zoom(1, 1000)

      // Reset all nodes positions
      const updatedNodes = graph.nodes.map(node => ({
        ...node,
        // Remove any fixed positions
        fx: undefined,
        fy: undefined,
        // Set random initial positions in a circle
        x: Math.cos(Math.random() * 2 * Math.PI) * 200,
        y: Math.sin(Math.random() * 2 * Math.PI) * 200,
        // Reset velocities
        vx: 0,
        vy: 0
      }))

      // Update the graph
      updateGraphData({
        nodes: updatedNodes,
        links: [...graph.links]
      })

      // Reheat and restart the simulation
      fgRef.current.d3ReheatSimulation()
      
      // Force a few simulation ticks for immediate feedback
      for (let i = 0; i < 20; i++) {
        fgRef.current.d3Force('simulation').tick()
      }
    }
  }, [graph, updateGraphData])

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

  // Create a mutable copy of the graph data with proper prototypes
  const graphData = useMemo(() => ({
    nodes: graph.nodes.map(node => ({
      ...node,
      __indexColor: undefined,
      // Add any force graph specific properties
      x: node.x,
      y: node.y,
      vx: 0,
      vy: 0,
      fx: node.fx,
      fy: node.fy,
      index: node.index
    })),
    links: graph.links.map(link => ({
      ...link,
      // Add any force graph specific properties
      index: undefined,
      source: link.source,
      target: link.target
    }))
  }), [graph])

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
    <div className="relative w-full h-full graph-container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full"
      >
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="title"
          nodeRelSize={6}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const size = node.type === 'paper' ? 5 : 4
            const fontSize = Math.min(4, 12/globalScale)
            
            // Draw node
            ctx.beginPath()
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
            ctx.fillStyle = hoveredNode?.id === node.id 
              ? node.type === 'paper' ? '#4ade80' : '#9ca3af'
              : node.color
            ctx.fill()

            // Draw label only when zoomed in or hovered
            if (globalScale > 0.4 || hoveredNode?.id === node.id) {
              const label = node.title
              ctx.font = `${fontSize}px Inter`
              const textWidth = ctx.measureText(label).width
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

              // Draw label background
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y + size * 2,
                bckgDimensions[0],
                bckgDimensions[1]
              )

              // Draw text
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillStyle = node.type === 'paper' ? '#4ade80' : '#d1d5db'
              ctx.fillText(label, node.x, node.y + size * 2 + fontSize/2)
            }
          }}
          
          // Improved link styling
          linkColor={() => 'rgba(34, 197, 94, 0.15)'}
          linkWidth={1}
          linkDirectionalParticles={1}
          linkDirectionalParticleWidth={1.4}
          linkDirectionalParticleSpeed={0.006}
          
          // Improved force simulation settings for better layout
          d3AlphaDecay={0.01} // Slower decay for smoother movement
          d3VelocityDecay={0.2} // Less friction for more natural movement
          warmupTicks={50} 
          cooldownTicks={Infinity} // Keep simulation running
          onEngineStop={() => {
            // Optional: do something when simulation stops
          }}
          
          // Interaction settings
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.5}
          maxZoom={5}
          onNodeDragEnd={(node) => {
            // Pin node on drag end
            node.fx = node.x;
            node.fy = node.y;
          }}
          
          // Performance optimizations
          
          // Background and dimensions
          backgroundColor="transparent"
          width={500}
          height={600}
          
          // Event handlers
          onNodeClick={handleNodeClick as any}
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
            <h4 className="text-sm font-medium text-primary">{hoveredNode.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Type: {hoveredNode.type}
            </p>
            {hoveredNode.citations && (
              <p className="text-xs text-muted-foreground mt-1">
                Citations: {hoveredNode.citations}
              </p>
            )}
            {hoveredNode.year && (
              <p className="text-xs text-muted-foreground mt-1">
                Year: {hoveredNode.year}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 