import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addNode,
  removeNode,
  addLink,
  removeLink,
  updateNode,
  resetGraph,
  selectGraph,
  selectNodes,
  selectLinks,
  selectNodeById,
  updateGraphData
} from '@/src/store/features/graphSlice'
import type { GraphNode, GraphLink, GraphData } from '@/src/types'

export const useGraphOperations = () => {
  const dispatch = useDispatch()
  const graph = useSelector(selectGraph)
  const nodes = useSelector(selectNodes)
  const links = useSelector(selectLinks)

  const getNodeById = useCallback((id: string) => {
    return useSelector(selectNodeById(id))
  }, [])

  const handleAddNode = useCallback((node: GraphNode) => {
    dispatch(addNode(node))
  }, [dispatch])

  const handleRemoveNode = useCallback((nodeId: string) => {
    dispatch(removeNode(nodeId))
  }, [dispatch])

  const handleAddLink = useCallback((link: GraphLink) => {
    dispatch(addLink(link))
  }, [dispatch])

  const handleRemoveLink = useCallback((source: string, target: string) => {
    dispatch(removeLink({ source, target }))
  }, [dispatch])

  const handleUpdateNode = useCallback((id: string, updates: Partial<GraphNode>) => {
    dispatch(updateNode({ id, updates }))
  }, [dispatch])

  const handleResetGraph = useCallback(() => {
    dispatch(resetGraph())
  }, [dispatch])

  const handleUpdateGraphData = useCallback((data: GraphData) => {
    dispatch(updateGraphData(data))
  }, [dispatch])

  return {
    graph,
    nodes,
    links,
    getNodeById,
    addNode: handleAddNode,
    removeNode: handleRemoveNode,
    addLink: handleAddLink,
    removeLink: handleRemoveLink,
    updateNode: handleUpdateNode,
    resetGraph: handleResetGraph,
    updateGraphData: handleUpdateGraphData
  }
} 