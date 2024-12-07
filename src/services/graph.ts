import { GraphData, GraphNode, GraphLink } from '@/src/types'

export const graphService = {
  mergeGraphData(existingGraph: GraphData | null, newGraph: GraphData | null): GraphData {
    if (!existingGraph) return newGraph || { nodes: [], links: [] }
    if (!newGraph) return existingGraph

    const existingNodes = existingGraph.nodes || []
    const existingLinks = existingGraph.links || []
    const newNodes = newGraph.nodes || []
    const newLinks = newGraph.links || []

    const existingNodeIds = new Set(existingNodes.map(n => n.id))
    const existingLinkIds = new Set(
      existingLinks.map(l => `${l.source}-${l.target}`)
    )

    // Merge nodes
    const filteredNewNodes = newNodes.filter(node => !existingNodeIds.has(node.id))
    const mergedNodes = [...existingNodes, ...filteredNewNodes]

    // Merge links
    const filteredNewLinks = newLinks.filter(link => 
      !existingLinkIds.has(`${link.source}-${link.target}`)
    )
    const mergedLinks = [...existingLinks, ...filteredNewLinks]

    return {
      nodes: mergedNodes,
      links: mergedLinks
    }
  },

  createNodeId(type: string, title: string): string {
    return `${type}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  }
} 