export interface GraphNode {
  id: string
  data: Paper
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number
  fy?: number
  __indexColor?: string
  index?: number
}

export interface GraphLink {
  source: string
  target: string
  strength?: number
  index?: number
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
  type: 'paper' | 'keyword'
  color?: string
  citations?: number
  year?: number
  abstract?: string
  authors?: string[]
  relevance?: number
} 