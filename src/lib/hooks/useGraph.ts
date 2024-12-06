import { GraphNode } from '@/src/types'
import { GraphData } from '@/src/types'
import { useState, useCallback, useRef, useMemo } from 'react'

export function useGraph(initialData: GraphData) {
  const [graphData, setGraphData] = useState<GraphData>(initialData)
  // const [filters, setFilters] = useState<FilterOptions>({
  //   type: 'all',
  //   search: '',
  //   yearRange: [2000, 2024],
  //   minCitations: 0,
  //   sortBy: 'relevance'
  // })
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const fgRef = useRef<any>()

  // Memoize filtered data
  // const filteredData = useMemo(() => {
  //   let filtered = {...graphData}
  //   filtered.nodes = graphData.nodes.filter(node => {
  //     const matchesSearch = node.data.title.toLowerCase().includes(filters.search.toLowerCase())
  //     const matchesType = filters.type === 'all' || node.data.type === filters.type
  //     const matchesYear = node.data.year 
  //       ? node.data.year >= filters.yearRange[0] && node.data.year <= filters.yearRange[1]
  //       : true
  //     const matchesCitations = node.data.citations 
  //       ? node.data.citations >= filters.minCitations
  //       : true

  //     return matchesSearch && matchesType && matchesYear && matchesCitations
  //   })

  //   // Sort nodes based on selected criteria
  //   filtered.nodes.sort((a, b) => {
  //     switch (filters.sortBy) {
  //       case 'citations':
  //         return (b.data.citations || 0) - (a.data.citations || 0)
  //       case 'year':
  //         return (b.data.year || 0) - (a.data.year || 0)
  //       default:
  //         return 0
  //     }
  //   })

  //   const visibleNodeIds = new Set(filtered.nodes.map(n => n.id))
  //   filtered.links = graphData.links.filter(link => 
  //     visibleNodeIds.has(link.source as string) && visibleNodeIds.has(link.target as string)
  //   )

  //   return filtered
  // }, [graphData, filters])

  const handleNodeClick = useCallback((node: GraphNode, callback?: (node: GraphNode) => void) => {
    callback?.(node)
    fgRef.current?.centerAt(node.x, node.y, 1000)
    fgRef.current?.zoom(2, 1000)
  }, [])

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node)
    document.body.style.cursor = node ? 'pointer' : 'default'
  }, [])

  const zoomIn = useCallback(() => {
    fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400)
  }, [])

  const zoomOut = useCallback(() => {
    fgRef.current?.zoom(fgRef.current.zoom() / 1.5, 400)
  }, [])

  const resetView = useCallback(() => {
    fgRef.current?.centerAt(0, 0, 1000)
    fgRef.current?.zoom(1, 400)
  }, [])

  return {
    graphData,
    setGraphData,
    // filters,
    // setFilters,
    // filteredData,
    hoveredNode,
    graphLoading,
    fgRef,
    handleNodeClick,
    handleNodeHover,
    zoomIn,
    zoomOut,
    resetView
  }
} 