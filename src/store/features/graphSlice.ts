import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GraphData, GraphNode, GraphLink } from '@/src/types'
import { mockGraphData } from '@/src/types/mock'

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
  nodes: mockGraphData.nodes.map(node => ({
    ...node,
    data: {
      title: node.title,
      type: node.type as 'paper' | 'keyword',
      year: node.year,
      abstract: node.abstract,
      authors: node.authors,
      source: node.source
    }
  })),
  links: mockGraphData.links
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