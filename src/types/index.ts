export interface GraphNode {
  id: string
  title: string
  type: 'paper' | 'keyword'
  color?: string
  x?: number
  y?: number
  citations?: number
  year?: number
  relevance?: number
}

export interface GraphLink {
  source: string
  target: string
  strength?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface FilterOptions {
  type: 'all' | 'paper' | 'keyword'
  search: string
  yearRange: [number, number]
  minCitations: number
  sortBy: 'relevance' | 'citations' | 'year'
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface Paper {
  title: string
  type: string
  abstract?: string
  authors?: string[]
  year?: number
  citations?: number
  relevance?: number
} 