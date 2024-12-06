export interface GraphNode {
  id: string
  data: Node
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

export interface Node {
  title: string
  type: 'paper' | 'keyword'
  citations?: number
  year?: number
  abstract?: string
  authors?: string[]
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  selectedNode?: GraphNode | null
  status?: 'selected' | 'unselected'
}