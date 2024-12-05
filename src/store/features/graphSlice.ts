import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GraphData, GraphNode, GraphLink } from '@/src/types'

// Helper function to create node objects with proper prototypes
const createNode = (node: GraphNode): GraphNode => ({
  ...node,
  // Force graph simulation properties
  x: undefined,
  y: undefined,
  vx: 0,
  vy: 0,
  fx: undefined,
  fy: undefined,
  index: undefined,
  __indexColor: undefined
})

const initialState: GraphData = {
  nodes: [
    createNode({ 
      id: '1', 
      data: {
        title: 'Machine Learning Basics', 
        type: 'paper', 
        color: '#22c55e',
        citations: 1200,
        year: 2022,
        relevance: 0.95
      }
    }),
    createNode({ 
      id: '2', 
      data: {
        title: 'Deep Learning', 
        type: 'paper', 
        color: '#22c55e',
        citations: 800,
        year: 2023,
        relevance: 0.85
      }
    }),
    createNode({ 
      id: '3', 
      data: {
        title: 'Neural Networks', 
        type: 'keyword', 
        color: '#6b7280' 
      }
    }),
  ],
  links: [
    { source: '1', target: '3', strength: 0.8 },
    { source: '2', target: '3', strength: 0.6 },
  ]
}

export const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    updateGraphData: (state, action: PayloadAction<GraphData>) => {
      state.nodes = action.payload.nodes.map(createNode)
      state.links = action.payload.links
    },
    addNode: (state, action: PayloadAction<GraphNode>) => {
      const newNode = createNode(action.payload)
      if (!state.nodes.find(node => node.id === newNode.id)) {
        state.nodes.push(newNode)
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload
      state.nodes = state.nodes.filter(node => node.id !== nodeId)
      state.links = state.links.filter(
        link => link.source !== nodeId && link.target !== nodeId
      )
    },
    addLink: (state, action: PayloadAction<GraphLink>) => {
      const newLink = action.payload
      const linkExists = state.links.some(
        link => 
          (link.source === newLink.source && link.target === newLink.target) ||
          (link.source === newLink.target && link.target === newLink.source)
      )
      if (!linkExists) {
        state.links.push(newLink)
      }
    },
    removeLink: (state, action: PayloadAction<{ source: string; target: string }>) => {
      const { source, target } = action.payload
      state.links = state.links.filter(
        link => 
          !(link.source === source && link.target === target) &&
          !(link.source === target && link.target === source)
      )
    },
    updateNode: (state, action: PayloadAction<{ id: string; updates: Partial<GraphNode> }>) => {
      const { id, updates } = action.payload
      const nodeIndex = state.nodes.findIndex(node => node.id === id)
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex] = createNode({ ...state.nodes[nodeIndex], ...updates })
      }
    },
    resetGraph: () => initialState,
  },
})

export const {
  updateGraphData,
  addNode,
  removeNode,
  addLink,
  removeLink,
  updateNode,
  resetGraph
} = graphSlice.actions

// Selectors
export const selectGraph = (state: { graph: GraphData }) => state.graph
export const selectNodes = (state: { graph: GraphData }) => state.graph.nodes
export const selectLinks = (state: { graph: GraphData }) => state.graph.links
export const selectNodeById = (id: string) => (state: { graph: GraphData }) => 
  state.graph.nodes.find(node => node.id === id)

export default graphSlice.reducer 