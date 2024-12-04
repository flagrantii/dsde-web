'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCw, Loader2 } from 'lucide-react'
import { Button } from '../../ui/button'

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
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [
      { id: '1', title: 'Machine Learning Basics', type: 'paper', color: '#22c55e' },
      { id: '2', title: 'Deep Learning', type: 'paper', color: '#22c55e' },
      { id: '3', title: 'Neural Networks', type: 'keyword', color: '#6b7280' },
      { id: '4', title: 'AI Applications', type: 'paper', color: '#22c55e' },
      { id: '5', title: 'Data Science', type: 'keyword', color: '#6b7280' },
    ],
    links: [
      { source: '1', target: '3' },
      { source: '2', target: '3' },
      { source: '3', target: '4' },
      { source: '4', target: '5' },
      { source: '1', target: '5' },
    ]
  })

  const fgRef = useRef<any>()
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [graphLoading, setGraphLoading] = useState<boolean>(false)

  const handleNodeClick = useCallback((node: GraphNode) => {
    onNodeClick?.(node)
    // Center view on clicked node
    fgRef.current?.centerAt(node.x, node.y, 1000)
    fgRef.current?.zoom(2, 1000)
  }, [onNodeClick])

  const handleNodeHover = (node: GraphNode | null) => {
    setHoveredNode(node)
    document.body.style.cursor = node ? 'pointer' : 'default'
  }

  const zoomIn = () => {
    fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400)
  }

  const zoomOut = () => {
    fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 400)
  }

  const resetView = () => {
    fgRef.current?.centerAt(0, 0, 1000)
    fgRef.current?.zoom(1, 400)
  }

  // Add a loading state while the graph component is being loaded
  const [isComponentLoading, setIsComponentLoading] = useState(true)

  useEffect(() => {
    // Set loading to false after component mounts
    setIsComponentLoading(false)
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
          
          // Better force simulation settings
          d3AlphaDecay={0.02} // Slower decay for smoother movement
          d3VelocityDecay={0.3} // Less friction
          warmupTicks={100} // More initial ticks for better layout
          cooldownTicks={Infinity} // Keep simulation running
          
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

      {/* Enhanced controls */}
      <motion.div 
        className="absolute bottom-4 right-4 flex gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomIn}
          className="w-8 h-8 glass-effect"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomOut}
          className="w-8 h-8 glass-effect"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={resetView}
          className="w-8 h-8 glass-effect"
        >
          <RotateCw className="w-4 h-4" />
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