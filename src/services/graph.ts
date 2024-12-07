import { GraphData, GraphNode, GraphLink } from '@/src/types'

export const graphService = {
  mergeGraphData(existingGraph: GraphData | null, newGraph: GraphData | null): GraphData {
    if (!existingGraph) return newGraph || { nodes: [], links: [] }
    if (!newGraph) return existingGraph

    const existingNodeIds = new Set(existingGraph.nodes.map(n => n.id))
    const existingLinkIds = new Set(
      existingGraph.links.map(l => `${l.source}-${l.target}`)
    )

    // Merge nodes
    const newNodes = newGraph.nodes.filter(node => !existingNodeIds.has(node.id))
    const mergedNodes = [...existingGraph.nodes, ...newNodes]

    // Merge links
    const newLinks = newGraph.links.filter(link => 
      !existingLinkIds.has(`${link.source}-${link.target}`)
    )
    const mergedLinks = [...existingGraph.links, ...newLinks]

    return {
      nodes: mergedNodes,
      links: mergedLinks
    }
  },

  createNodeId(type: string, title: string): string {
    return `${type}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  }
} 