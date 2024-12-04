'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { Button } from '../../ui/button'

interface GraphNode {
  id: string
  title: string
  type: 'paper' | 'keyword'
  color?: string
  x?: number
  y?: number
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
      { id: '3', title: 'Neural Networks', type: 'keyword', color: '#15803d' },
      { id: '4', title: 'AI Applications', type: 'paper', color: '#22c55e' },
      { id: '5', title: 'Data Science', type: 'keyword', color: '#15803d' },
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
          nodeColor={(node: any) => 
            hoveredNode?.id === node.id ? '#34d399' : node.color
          }
          nodeRelSize={6}
          linkColor={() => '#1a2e1a'}
          backgroundColor="transparent"
          width={500}
          height={600}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.title
            const fontSize = 12/globalScale
            ctx.font = `${fontSize}px Sans-Serif`
            const textWidth = ctx.measureText(label).width
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

            ctx.fillStyle = hoveredNode?.id === node.id 
              ? 'rgba(52, 211, 153, 0.2)'
              : 'rgba(0, 0, 0, 0.8)'
            
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              bckgDimensions[0],
              bckgDimensions[1]
            )

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = hoveredNode?.id === node.id ? '#34d399' : node.color
            ctx.fillText(label, node.x, node.y)
          }}
        />
      </motion.div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomIn}
          className="w-8 h-8"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={zoomOut}
          className="w-8 h-8"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={resetView}
          className="w-8 h-8"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Node Info Tooltip */}
      {hoveredNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-4 p-3 bg-background/95 border border-border rounded-lg shadow-lg"
        >
          <h4 className="text-sm font-medium">{hoveredNode.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Type: {hoveredNode.type}
          </p>
        </motion.div>
      )}
    </div>
  )
} 